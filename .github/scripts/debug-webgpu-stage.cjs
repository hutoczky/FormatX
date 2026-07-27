'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4178/scifi-ui/three-stage.html?webgpu-debug=1';
const ARGS = [
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan,WebGPU',
  '--use-angle=swiftshader',
  '--use-gl=angle',
  '--disable-vulkan-surface',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader',
  '--disable-dev-shm-usage'
];

(async () => {
  const report = { url: URL, console: [], pageErrors: [], failed: [], state: null };
  const browser = await chromium.launch({ headless: true, args: ARGS });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  page.on('console', message => report.console.push({ type: message.type(), text: message.text() }));
  page.on('pageerror', error => report.pageErrors.push(String(error.stack || error)));
  page.on('requestfailed', request => report.failed.push({ url: request.url(), error: request.failure()?.errorText || 'failed' }));

  const response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  report.http = response?.status() || 0;
  await page.waitForTimeout(14000);
  report.state = await page.evaluate(async () => {
    const canvas = document.querySelector('canvas');
    const root = document.documentElement;
    let adapter = null;
    if (navigator.gpu) {
      try {
        const gpuAdapter = await navigator.gpu.requestAdapter();
        adapter = gpuAdapter ? {
          features: Array.from(gpuAdapter.features || []),
          limits: {
            maxBufferSize: Number(gpuAdapter.limits?.maxBufferSize || 0),
            maxStorageBufferBindingSize: Number(gpuAdapter.limits?.maxStorageBufferBindingSize || 0)
          }
        } : null;
      } catch (error) {
        adapter = { error: String(error) };
      }
    }
    return {
      secure: isSecureContext,
      navigatorGpu: Boolean(navigator.gpu),
      three: root.dataset.fxThree || '',
      renderer: root.dataset.fxThreeRenderer || '',
      webgpu: root.dataset.fxWebgpu || '',
      webgpuError: root.dataset.fxWebgpuError || '',
      canvas: canvas ? [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight] : null,
      bodyChildren: document.body.children.length,
      scripts: Array.from(document.scripts, script => script.src),
      adapter
    };
  });
  await page.screenshot({ path: 'webgpu-stage-debug.png' });
  fs.writeFileSync('webgpu-stage-debug.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  await browser.close();

  const blockingConsoleErrors = report.console.filter(entry => entry.type === 'error');
  const success = report.state?.navigatorGpu
    && report.state?.renderer === 'webgpu-tsl'
    && report.state?.webgpu === 'ready'
    && report.state?.canvas?.[0] > 0
    && report.pageErrors.length === 0
    && report.failed.length === 0
    && blockingConsoleErrors.length === 0;
  process.exitCode = success ? 0 : 1;
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
