'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const url = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:8788/';
const out = process.env.FORMATX_STARTUP_EVIDENCE_DIR || 'lighthouse-results/startup';
const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: 'reduced', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  const browser = await chromium.launch({
    headless: true, executablePath: process.env.CHROME_BIN || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    for (const { name, ...options } of profiles) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let failure;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // No click, wheel, key, focus or synthetic lifecycle notification.
        await page.waitForFunction(() => {
          const d = document.documentElement.dataset;
          return d.fxPreloaderR531 === 'done'
            && d.fxCrystalOrganismR326 === 'ready'
            && d.fxMagShapeSyncR476 === 'ready-r634'
            && d.fxSoundNavigationOwnerR539 === 'ready-navigation';
        }, null, { timeout: 20000 });
      } catch (error) { failure = error.message; }
      const state = await page.evaluate(() => {
        const d = document.documentElement.dataset;
        const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const box = canvas?.getBoundingClientRect();
        return {
          preloader: d.fxPreloaderR531, scheduler: d.fxP0MotionSchedulerR490,
          renderer: d.fxCoreRenderer, ready: d.fxCrystalOrganismR326,
          shape: d.fxMagShapeSyncR476, sound: d.fxSoundNavigationOwnerR539,
          canvases: document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
          stages: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
          visible: Boolean(canvas && box.width > 0 && box.height > 0 && getComputedStyle(canvas).visibility === 'visible'),
        };
      });
      const result = { name, sourceSha: process.env.AUDITED_SHA || null, url, ...state, errors, failure };
      results.push(result);
      fs.writeFileSync(path.join(out, 'production-startup.json'), JSON.stringify(results, null, 2) + '\n');
      console.log(JSON.stringify(result));
      await context.close();
      assert(!failure, `${name}: automatic production startup did not complete: ${failure}`);
      assert.equal(state.renderer, 'single-webgl-crystal-organism-r326', `${name}: unexpected renderer`);
      assert.equal(state.canvases, 1, `${name}: single canvas`);
      assert.equal(state.stages, 1, `${name}: single stage`);
      assert(state.visible, `${name}: MAG not visible`);
      assert.deepEqual(errors, [], `${name}: browser errors`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
