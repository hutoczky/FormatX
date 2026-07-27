'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const report = {
  generatedAt: new Date().toISOString(),
  url: 'https://www.formatxsuite.com/scifi-ui/',
  cycles: [],
  frames: [],
  consoleErrors: [],
  requestFailures: []
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--use-gl=angle',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage'
    ]
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => {
    report.requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'failed' });
  });

  await page.goto(`${report.url}?loop-debug=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxThree === 'ready', { timeout: 30000 });
  await page.waitForTimeout(2500);

  report.frames = await Promise.all(page.frames().map(async frame => {
    let canvas = null;
    try {
      canvas = await frame.evaluate(() => {
        const node = document.querySelector('canvas');
        return node ? [node.width, node.height, node.clientWidth, node.clientHeight] : null;
      });
    } catch (_) {}
    return { url: frame.url(), canvas };
  }));

  for (let cycle = 1; cycle <= 3; cycle += 1) {
    const before = await page.evaluate(() => ({
      count: Number(document.documentElement.dataset.fxLoopCount || 0),
      y: scrollY,
      max: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      cloneTop: document.querySelector('[data-fx-loop-bridge="true"]')?.offsetTop || -1,
      cloneHeight: document.querySelector('[data-fx-loop-bridge="true"]')?.offsetHeight || -1,
      transferClass: document.documentElement.classList.contains('fx-three-loop-transfer')
    }));

    await page.evaluate(() => {
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      window.scrollTo({ top: max, left: 0, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    });

    let advanced = true;
    try {
      await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous, before.count, { timeout: 15000 });
    } catch (_) {
      advanced = false;
    }
    await page.waitForTimeout(1200);

    const after = await page.evaluate(() => ({
      count: Number(document.documentElement.dataset.fxLoopCount || 0),
      y: scrollY,
      max: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      cloneTop: document.querySelector('[data-fx-loop-bridge="true"]')?.offsetTop || -1,
      cloneHeight: document.querySelector('[data-fx-loop-bridge="true"]')?.offsetHeight || -1,
      transferClass: document.documentElement.classList.contains('fx-three-loop-transfer'),
      scene: document.documentElement.dataset.fxThreeScene || '',
      telemetry: document.querySelector('[data-fx-three-telemetry]')?.textContent?.trim() || ''
    }));
    report.cycles.push({ cycle, advanced, before, after });
  }

  report.success = report.cycles.every(item => item.advanced)
    && report.frames.some(item => /\/three-stage(?:\.html)?(?:\?|$)/.test(item.url) && item.canvas && item.canvas[0] > 0 && item.canvas[1] > 0);

  fs.writeFileSync('live-loop-debug.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  await page.screenshot({ path: 'live-loop-debug.png', fullPage: false });
  await browser.close();
  process.exitCode = report.success ? 0 : 1;
})().catch(error => {
  report.fatal = error.stack || error.message;
  fs.writeFileSync('live-loop-debug.json', `${JSON.stringify(report, null, 2)}\n`);
  console.error(error);
  process.exitCode = 1;
});
