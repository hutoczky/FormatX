'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4178/scifi-ui/index.html?progressive-debug=1';
const ARGS = [
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan,WebGPU',
  '--use-angle=swiftshader',
  '--use-gl=angle',
  '--disable-vulkan-surface',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader'
];

(async () => {
  const report = { console: [], errors: [], failed: [], timeline: [] };
  const browser = await chromium.launch({ headless: true, args: ARGS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.on('console', message => report.console.push({ type: message.type(), text: message.text() }));
  page.on('pageerror', error => report.errors.push(String(error.stack || error)));
  page.on('requestfailed', request => report.failed.push({ url: request.url(), error: request.failure()?.errorText || 'failed' }));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (const delay of [2000, 5000, 9000, 13000, 18000, 24000]) {
    await page.waitForTimeout(delay - (report.timeline.at(-1)?.delay || 0));
    const snapshot = await page.evaluate(() => {
      const root = document.documentElement;
      const frame = document.getElementById('fx-three-frame');
      let inside = null;
      try {
        const innerRoot = frame?.contentDocument?.documentElement;
        const canvases = frame?.contentDocument ? Array.from(frame.contentDocument.querySelectorAll('canvas')) : [];
        inside = {
          url: frame?.contentWindow?.location?.href || '',
          three: innerRoot?.dataset.fxThree || '',
          renderer: innerRoot?.dataset.fxThreeRenderer || '',
          webgpu: innerRoot?.dataset.fxWebgpu || '',
          canvases: canvases.map(canvas => [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight])
        };
      } catch (error) {
        inside = { error: String(error) };
      }
      return {
        root: {
          three: root.dataset.fxThree || '',
          threeError: root.dataset.fxThreeError || '',
          renderer: root.dataset.fxThreeRenderer || '',
          webgpu: root.dataset.fxWebgpu || '',
          webgpuError: root.dataset.fxWebgpuError || '',
          bootstrap: root.dataset.fxThreeBootstrap || '',
          intro: root.classList.contains('fx-intro-complete')
        },
        frame: frame instanceof HTMLIFrameElement ? frame.src : '',
        telemetry: document.querySelector('[data-fx-three-telemetry]')?.textContent?.trim() || '',
        inside
      };
    });
    report.timeline.push({ delay, ...snapshot });
  }

  report.success = report.timeline.at(-1)?.root.three === 'ready'
    && ['webgpu-tsl', 'three-webgl'].includes(report.timeline.at(-1)?.root.renderer)
    && report.timeline.at(-1)?.inside?.canvases?.length === 1;

  await page.screenshot({ path: 'progressive-main-debug.png', fullPage: false });
  fs.writeFileSync('progressive-main-debug.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  process.exitCode = report.success ? 0 : 1;
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
