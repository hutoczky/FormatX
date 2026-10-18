'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const url = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const output = path.resolve('.archive-artifacts/native-intro-field-r2127.json');
const report = { sha: process.env.AUDITED_SHA || '', cases: [] };
const write = () => {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2));
};

function observeNativePresentation() {
  const state = window.__nativeIntroFieldR2127 = { native: null, starts: [], complete: [], filterTransitions: [] };
  let nativeCanvas = null;
  addEventListener('formatx:real3dready', () => { nativeCanvas ||= window.FormatXLivingCore?.canvas; });
  document.addEventListener('formatx:magbirthstart', () => state.starts.push(performance.now()));
  document.addEventListener('transitionrun', event => {
    if (event.target.matches?.('.fx-mag-birth-r533[data-fx-renderer="canonical"]') && event.propertyName === 'filter') {
      state.filterTransitions.push({ at: performance.now(), property: event.propertyName });
    }
  }, true);
  document.addEventListener('formatx:magbirthcomplete', () => {
    state.complete.push({ at: performance.now(), sameCanvas: nativeCanvas === window.FormatXLivingCore?.canvas,
      originalOwner: Boolean(nativeCanvas?.closest('#hero')), overlays: document.querySelectorAll('.fx-mag-birth-r533').length });
  });
  const observer = new MutationObserver(() => {
    const overlay = document.querySelector('.fx-mag-birth-r533[data-fx-renderer="canonical"]');
    if (!overlay || state.native) return;
    const css = getComputedStyle(overlay), field = getComputedStyle(overlay, '::after');
    state.native = { at: performance.now(), filter: css.filter, transitionProperty: css.transitionProperty, studioBackground: css.backgroundImage,
      fieldSize: field.backgroundSize, fieldBackground: field.backgroundImage, fieldDisplay: field.display,
      fieldOpacity: Number(field.opacity), renderer: document.documentElement.dataset.fxCrystalOrganismR326,
      copy: overlay.querySelector('.fxb-title')?.textContent?.trim(), canvasCount: document.querySelectorAll('.fx-crystal-organism-r326-canvas').length };
    observer.disconnect();
  });
  // Observe the actual owner/cascade at its first canonical presentation,
  // before a legacy identity-filter transition has time to settle to none.
  observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['data-fx-renderer'] });
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: [
    '--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'
  ] });
  report.browser = browser.version();
  try {
    for (const [name, width, height, mobile] of [
      ['desktop-1440', 1440, 900, false], ['mobile-390', 390, 844, true], ['mobile-430', 430, 932, true]
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile,
        deviceScaleFactor: mobile ? 2 : 1, locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference' });
      const item = { name, errors: [] };
      report.cases.push(item);
      await context.addInitScript(observeNativePresentation);
      const page = await context.newPage();
      page.on('pageerror', error => item.errors.push(String(error)));
      try {
        // Real first visit: no proof query, clock change, pinned uniform,
        // renderer selection or synthetic lifecycle event is introduced.
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => __nativeIntroFieldR2127.complete.length > 0, null, { timeout: 18000, polling: 100 });
        item.observation = await page.evaluate(() => __nativeIntroFieldR2127);
        const observed = item.observation;
        assert.ok(observed.native, `${name}: actual canonical intro was not observed`);
        assert.equal(observed.native.filter, 'none', `${name}: native intro retains a viewport filter during its first presentation`);
        assert.equal(observed.native.transitionProperty, 'opacity', `${name}: native handoff must not animate an identity filter`);
        assert.match(observed.native.studioBackground, /radial-gradient\(/, `${name}: native studio background disappeared`);
        const fieldSizes = observed.native.fieldSize.split(',').map(size => size.trim());
        assert.ok(fieldSizes.length > 0 && fieldSizes.every(size => size === 'auto'), `${name}: studio field repeats as a tiled reticle`);
        assert.match(observed.native.fieldBackground, /^radial-gradient\(/, `${name}: the continuous studio atmosphere disappeared`);
        // The existing mobile CSS may hide this optional atmosphere entirely.
        // Preserve that policy; every declared layer must still be untiled.
        assert.ok(observed.native.fieldOpacity > 0 && observed.native.fieldOpacity < 1);
        assert.equal(observed.native.renderer, 'ready');
        assert.equal(observed.native.copy, 'A MAG SZÜLETÉSE');
        assert.equal(observed.native.canvasCount, 1);
        assert.deepEqual(observed.filterTransitions, []);
        assert.equal(observed.starts.length, 1);
        assert.equal(observed.complete.length, 1);
        assert.equal(observed.complete[0].sameCanvas, true);
        assert.equal(observed.complete[0].originalOwner, true);
        assert.equal(observed.complete[0].overlays, 0);
        assert.deepEqual(item.errors, []);
        item.pass = true;
      } catch (error) {
        item.error = String(error.stack || error);
        item.failureState = await page.evaluate(() => ({ observation: window.__nativeIntroFieldR2127,
          root: { ...document.documentElement.dataset } })).catch(() => null);
        throw error;
      } finally { write(); await context.close(); }
    }
  } finally { await browser.close(); }
  console.log('NATIVE_INTRO_FIELD_R2127_PASS', JSON.stringify(report));
})().catch(error => { write(); console.error(error); process.exitCode = 1; });
