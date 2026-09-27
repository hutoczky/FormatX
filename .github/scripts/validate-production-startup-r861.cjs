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
      await page.addInitScript(() => {
        document.addEventListener('formatx:preloadercomplete', () => {
          window.__formatxObservedReleaseAt = performance.now();
        }, { once: true });
      });
      let failure;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // No click, wheel, key, focus or synthetic lifecycle notification.
        await page.waitForFunction(() => {
          const d = document.documentElement.dataset;
          return d.fxPreloaderR531 === 'done'
            && d.fxCrystalOrganismR326 === 'ready'
            && d.fxMagShapeSyncR476 === 'ready-r634'
            && d.fxSoundNavigationOwnerR539 === 'ready-navigation'
            && d.fxMetadataRuntimeR862 === 'requested-after-intro-paint'
            && d.fxReleaseMetadata === 'ready-v6';
        }, null, { timeout: 20000 });
      } catch (error) { failure = error.message; }
      const state = await page.evaluate(() => {
        const d = document.documentElement.dataset;
        const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const box = canvas?.getBoundingClientRect();
        const metadata = ['release-metadata', 'formatx-public-shell', 'formatx-content-standard', 'formatx-seo', 'formatx-content-finalizer', 'formatx-platform-surface-finalizer', 'formatx-organism-trust', 'formatx-organism-semantic-state'].map(name => ({
          name,
          scripts: Array.from(document.scripts).filter(script => script.src.includes(`/${name}.js`)).length,
          requests: performance.getEntriesByType('resource').filter(resource => resource.name.includes(`/${name}.js`)).map(resource => resource.startTime),
        }));
        return {
          preloader: d.fxPreloaderR531, scheduler: d.fxP0MotionSchedulerR490,
          renderer: d.fxCoreRenderer, ready: d.fxCrystalOrganismR326,
          shape: d.fxMagShapeSyncR476, sound: d.fxSoundNavigationOwnerR539,
          canvases: document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
          stages: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
          visible: Boolean(canvas && box.width > 0 && box.height > 0 && getComputedStyle(canvas).visibility === 'visible'),
          releaseAt: window.__formatxObservedReleaseAt, metadata,
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
      assert(Number.isFinite(state.releaseAt), `${name}: canonical release was not observed`);
      for (const entry of state.metadata) {
        assert.equal(entry.scripts, 1, `${name}: ${entry.name} must have one script owner`);
        assert.equal(entry.requests.length, 1, `${name}: ${entry.name} must load exactly once`);
        assert(entry.requests[0] >= state.releaseAt, `${name}: ${entry.name} competed with the intro`);
      }
      assert.deepEqual(errors, [], `${name}: browser errors`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
