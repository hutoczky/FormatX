'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const url = process.env.FORMATX_ARCHIVE_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true, args: [
    '--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'
  ] });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
        colorScheme: 'dark', locale: 'hu-HU'
      });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // Match the original archive fixture's readiness budget. Automatic
        // first-visit duration remains independently asserted by its timing lane.
        await page.waitForFunction(() => document.documentElement.dataset.fxArchiveExperience === 'ready'
          && document.querySelector('[data-fx-cinema-panel-active="true"]')?.dataset.fxCinemaSource,
        null, { timeout: 90000 });
        await page.evaluate(() => { window.__r2110OriginalCanvas = window.FormatXLivingCore.canvas; });
        for (const key of ['ecosystem', 'diagnostics', 'systems']) {
          const state = await page.evaluate(key => new Promise((resolve, reject) => {
            const scene = window.FormatXArchiveExperience.scenes.find(scene => scene.key === key);
            const node = document.querySelector(/^[#.]/.test(scene.id) ? scene.id : '#' + scene.id);
            const box = node.getBoundingClientRect();
            const destination = Math.max(0, scrollY + box.top + box.height / 2 - innerHeight * .52);
            let deadline;
            const snapshot = () => {
              clearTimeout(deadline);
              removeEventListener('scroll', snapshot);
              const panel = document.querySelector('[data-fx-cinema-panel-active="true"]');
              const panels = [...document.querySelectorAll('.fx-archive-cinema-folio-r2030')];
              let opacity = 1, painted = Boolean(panel);
              for (let node = panel; node; node = node.parentElement) {
                const style = getComputedStyle(node);
                opacity *= Number(style.opacity);
                if (style.display === 'none' || style.contentVisibility === 'hidden') painted = false;
              }
              const rect = panel?.getBoundingClientRect();
              const visiblePaper = painted && opacity > .1 && rect?.width > 8 && rect?.height > 8
                && rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
              resolve({ key, expectedSource: scene.source, scene: window.FormatXArchiveExperience.state.scene,
                source: panel?.dataset.fxCinemaSource, activeCount: panels.filter(panel => panel.dataset.fxCinemaPanelActive === 'true').length,
                focusSafe: panels.every(panel => panel.inert === (panel.dataset.fxCinemaPanelActive !== 'true')),
                visiblePaper, opacity,
                sameCanvas: window.FormatXLivingCore.canvas === window.__r2110OriginalCanvas,
                canvasCount: document.querySelectorAll('.fx-crystal-organism-r326-canvas').length });
            };
            addEventListener('scroll', snapshot, { once: true });
            deadline = setTimeout(() => { removeEventListener('scroll', snapshot); reject(new Error('Native scroll did not reach ' + key)); }, 8000);
            if (Math.abs(destination - scrollY) < 1) snapshot();
            else scrollTo({ top: destination, behavior: 'instant' });
          }), key);
          assert.equal(state.scene, key, 'The native scroll selected another chapter');
          assert.equal(state.source, state.expectedSource, 'The original folio source must commit in the same native scroll event as its chapter');
          assert.equal(state.visiblePaper, true, 'The original native paper must be visible through every ancestor, not only report visibility on itself');
          assert.equal(state.activeCount, 1, 'Chapter handoff must show one original native paper');
          assert.equal(state.focusSafe, true, 'Inactive original papers must remain inert during chapter handoff');
          assert.equal(state.sameCanvas, true, 'Chapter handoff replaced the original MAG canvas');
          assert.equal(state.canvasCount, 1, 'Chapter handoff created another MAG canvas');
          console.log('ARCHIVE_ATOMIC_CHAPTER_R2110_PASS ' + JSON.stringify({ profile: mobile ? 'mobile' : 'desktop', ...state }));
        }
        assert.deepEqual(errors, [], 'Browser errors during native chapter handoff');
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
