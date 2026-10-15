'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const url = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4173/scifi-ui/';

async function snapshot(page) {
  return page.evaluate(() => {
    const canvas = window.FormatXLivingCore?.canvas;
    const timelines = canvas?.getAnimations().filter(animation => animation.id === 'fx-primary-mag-living-breath-r1930') || [];
    return {
      canvasCount: document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
      sameCanvas: canvas === window.__r2108NativeCanvas,
      sameContext: (canvas?.getContext('webgl2') || canvas?.getContext('webgl')) === window.__r2108NativeContext,
      scheduler: document.documentElement.dataset.fxCoreSurfaceSchedulerR484,
      timelines: timelines.map(animation => ({ state: animation.playState, time: animation.currentTime }))
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: [
    '--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'
  ] });
  try {
    for (const mobile of [false, true]) {
      const profile = mobile ? 'mobile' : 'desktop';
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 960 },
        isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
        colorScheme: 'dark', locale: 'hu-HU', reducedMotion: 'no-preference'
      });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.documentElement.dataset.fxCrystalOrganismR326 === 'ready'
          && !document.querySelector('.fx-mag-birth-r533'), null, { timeout: 20000 });
        await page.evaluate(() => {
          window.__r2108NativeCanvas = window.FormatXLivingCore.canvas;
          window.__r2108NativeContext = __r2108NativeCanvas.getContext('webgl2') || __r2108NativeCanvas.getContext('webgl');
          document.getElementById('pricing').scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(500);
        const normal = await snapshot(page);
        assert.equal(normal.timelines.length, 1, `${profile}: one compositor breath must own the native canvas`);
        assert.equal(normal.timelines[0].state, 'running', `${profile}: normal motion must remain automatic`);

        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(500);
        const reduced = await snapshot(page);
        assert.equal(reduced.scheduler, 'suspended', `${profile}: reduced motion must cancel the native autonomous timer`);
        assert.equal(reduced.timelines.length, 1, `${profile}: preference changes must retain the same compositor owner`);
        assert.equal(reduced.timelines[0].state, 'paused', `${profile}: the compositor breath must stop when motion is reduced`);
        await page.waitForTimeout(1000);
        const still = await snapshot(page);
        assert.equal(still.timelines[0].time, reduced.timelines[0].time, `${profile}: reduced motion must be physically still`);

        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.evaluate(() => window.FormatXLivingCore.requestRender(1));
        await page.waitForFunction(pausedAt => {
          const timeline = window.FormatXLivingCore?.canvas.getAnimations()
            .find(animation => animation.id === 'fx-primary-mag-living-breath-r1930');
          return timeline?.playState === 'running' && timeline.currentTime > pausedAt;
        }, still.timelines[0].time, { timeout: 5000 });
        const resumed = await snapshot(page);
        assert.equal(resumed.timelines.length, 1, `${profile}: resuming motion must not create another timeline`);
        assert.equal(resumed.timelines[0].state, 'running', `${profile}: normal compositor motion must resume`);
        assert.ok(resumed.timelines[0].time > still.timelines[0].time, `${profile}: the resumed compositor clock must advance`);
        assert.equal(resumed.scheduler, 'armed-single-native-timer', `${profile}: the same native scheduler must resume`);
        for (const state of [normal, reduced, still, resumed]) {
          assert.equal(state.canvasCount, 1, `${profile}: motion preference created another canvas`);
          assert.equal(state.sameCanvas, true, `${profile}: motion preference replaced the native canvas`);
          assert.equal(state.sameContext, true, `${profile}: motion preference replaced the native WebGL context`);
        }
        assert.deepEqual(errors, [], `${profile}: browser errors`);
        console.log('MAG_REDUCED_LIFECYCLE_R2108_PASS ' + JSON.stringify({ profile, normal, reduced, still, resumed }));
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
