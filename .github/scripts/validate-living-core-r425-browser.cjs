'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const origin = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4173/scifi-ui/';
const output = process.env.FORMATX_CAPTURE_DIR || process.cwd();
fs.mkdirSync(output, { recursive: true });

const overlap = (a, b, gap = 2) => Boolean(a && b) && !(
  a.right + gap <= b.left || b.right + gap <= a.left ||
  a.bottom + gap <= b.top || b.bottom + gap <= a.top
);

async function activateImmersiveRuntime(page, source) {
  await page.evaluate(value => {
    const root = document.documentElement;
    root.dataset.fxImmersive = 'active';
    root.dataset.fxImmersiveSource = value;
    dispatchEvent(new CustomEvent('formatx:immersiveactivate', { detail: { source: value } }));
  }, source);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxThreeLoader === 'requested-on-demand'
    || Boolean(document.querySelector('script[data-fx-cryosphere-script]'))
  ), null, { timeout: 10000 });
}

async function verify(browser, name, viewport, isMobile, deviceScaleFactor) {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor,
    locale: 'hu-HU',
    colorScheme: 'dark',
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(`${origin}?r476_current_browser=${name}-${Date.now()}&lang=hu`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await page.waitForFunction(mobile => {
    const root = document.documentElement;
    const surface = root.dataset.fxCoreSurfaceR456 || '';
    return root.dataset.fxCoreMobileV69 === 'ready-v69'
      && root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && root.dataset.fxCoreRendererCanonicalR1723 === 'single-webgl-living-organism-r326'
      && root.dataset.fxCoreCanonicalIdentityR1723 === 'one-living-organism-no-alternate-shapes'
      && root.dataset.fxCoreOpticsR454 === 'single-luminous-webgl-material-owner'
      && surface === 'r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'
      && root.dataset.fxCoreTriangleEdgesR456 === 'disabled'
      && root.dataset.fxCoreOuterNoiseR456 === 'disabled-on-glass-shell'
      && root.dataset.fxCoreShaderHookR456 === 'released-after-r326-compile'
      && root.dataset.fxCoreLifeR455 === 'ready'
      && root.dataset.fxCoreSurfaceEnergyR484 === 'periodic-native-surface-energy'
      && (!mobile || root.dataset.fxCurrentMagOpticsR468 === 'soft-bloom-soft-edge-compositor-breathe')
      && typeof window.FormatXCoreMobileV69?.surfacePulse === 'function';
  }, isMobile, { timeout: 60000 });

  await page.waitForFunction(() => {
    const root = document.documentElement;
    const glyph = document.querySelector('.fx-mini-mag-glyph-r459');
    const header = document.querySelector('.topbar > .fx-reference-mag-button');
    return root.dataset.fxMagShapeSyncR476 === 'ready-r528'
      && root.dataset.fxMiniMagShapeSyncR476?.startsWith('ready-')
      && glyph instanceof HTMLElement
      && header instanceof HTMLElement
      && glyph.dataset.fxCoreShape === root.dataset.fxCoreShapeR337
      && header.dataset.fxCoreShape === root.dataset.fxCoreShapeR337;
  }, null, { timeout: 30000 });

  await activateImmersiveRuntime(page, 'living-core-semantic-hit-validation');
  const hitLocator = page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
  await hitLocator.waitFor({ state: 'visible', timeout: 30000 });
  const pointerOwnership = await page.evaluate(() => {
    const stage = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    const hit = document.querySelector('#hero .fx-reference-mag-button')
      || document.querySelector('#hero .fx-reference-ask')
      || document.querySelector('#hero .fx-mag-heart-hit-r252');
    return {
      stage: stage ? getComputedStyle(stage).pointerEvents : '',
      hit: hit ? getComputedStyle(hit).pointerEvents : '',
      owner: hit?.className || ''
    };
  });
  assert.equal(pointerOwnership.stage, 'none', `${name}: R326 visual stage must be pointer-transparent`);
  assert.notEqual(pointerOwnership.hit, 'none', `${name}: current MAG interaction target is inert ${JSON.stringify(pointerOwnership)}`);
  await hitLocator.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxCoreEnergyBoltR455?.startsWith('surface-sweep-'));
  await page.waitForFunction(() => document.documentElement.dataset.fxCoreSurfacePulseR454?.startsWith('sweep-'));
  await page.waitForTimeout(260);

  const state = await page.evaluate(() => {
    const visible = element => {
      if (!(element instanceof Element)) return false;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 1 && box.height > 1
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > .01;
    };
    const root = document.documentElement;
    const stage = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    const canvas = stage?.querySelector('.fx-crystal-organism-r326-canvas');
    const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
    const canvasBox = canvas?.getBoundingClientRect();
    const style = canvas ? getComputedStyle(canvas) : null;
    const stageStyle = stage ? getComputedStyle(stage) : null;
    const controls = document.querySelector('#hero .fx-reference-controls-r204');
    const sound = controls?.querySelector('.fx-three-sound');
    const ask = controls?.querySelector('.fx-reference-ask');
    const manualPauseCount = controls?.querySelectorAll('.fx-reference-pause').length || 0;
    const mag = document.querySelector('.topbar > .fx-reference-mag-button');
    const lang = document.querySelector('.topbar > .fx-language-toggle');
    const menu = document.querySelector('.topbar > .fx-reference-menu-button');
    const brand = document.querySelector('.topbar > .brand');
    const miniGlyph = document.querySelector('.fx-mini-mag-glyph-r459');
    const miniLauncher = document.querySelector('.fx-mini-mag-launcher-r459');
    const boxes = [sound, ask].map(node => node?.getBoundingClientRect()).filter(Boolean);
    const localOverlap = (a, b, gap = 2) => a && b && !(
      a.right + gap <= b.left || b.right + gap <= a.left ||
      a.bottom + gap <= b.top || b.bottom + gap <= a.top
    );
    const rect = node => {
      if (!(node instanceof Element)) return null;
      const value = node.getBoundingClientRect();
      return { left:value.left, right:value.right, top:value.top, bottom:value.bottom, width:value.width, height:value.height };
    };
    return {
      renderer: root.dataset.fxCoreRenderer || '',
      canonicalRenderer: root.dataset.fxCoreRendererCanonicalR1723 || '',
      revision: root.dataset.fxCoreRendererVersion || '',
      canonicalRevision: root.dataset.fxCoreCanonicalRevisionR1723 || '',
      optics: root.dataset.fxCoreOpticsR454 || '',
      motion: root.dataset.fxCoreSurfaceMotionR454 || '',
      pulse: root.dataset.fxCoreSurfacePulseR454 || '',
      scheduler: root.dataset.fxCoreScheduler || '',
      surface: root.dataset.fxCoreSurfaceR456 || '',
      normal: root.dataset.fxCoreNormalR456 || '',
      triangleEdges: root.dataset.fxCoreTriangleEdgesR456 || '',
      outerNoise: root.dataset.fxCoreOuterNoiseR456 || '',
      innerLife: root.dataset.fxCoreInnerLifeR456 || '',
      specular: root.dataset.fxCoreSpecularR456 || '',
      shaderHook: root.dataset.fxCoreShaderHookR456 || '',
      loaderOptics: root.dataset.fxCurrentMagOpticsR456 || '',
      mobileOptics: root.dataset.fxCurrentMagOpticsR465 || '',
      finalOptics: root.dataset.fxCurrentMagOpticsR468 || '',
      rendererSelection: root.dataset.fxCoreRendererSelection || '',
      governor: root.dataset.fxMobileRenderGovernorRevisionR433 || '',
      idlePolicy: root.dataset.fxCoreMobileIdlePolicyR426 || root.dataset.fxCoreIdlePolicyR455 || '',
      life: root.dataset.fxCoreLifeR455 || '',
      energyBolt: root.dataset.fxCoreEnergyBoltR455 || '',
      stageCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
      canvasCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
      solidScriptCount: [...document.scripts].filter(script => /formatx-mobile-solid-glass-r456\.js/.test(script.src)).length,
      lifeScriptCount: [...document.scripts].filter(script => /formatx-core-life-r455\.js/.test(script.src)).length,
      legacyFrames: document.querySelectorAll('.fx-three-frame, iframe[src*="three-stage"], [data-renderer*="mechanical-orb"]').length,
      legacyScripts: [...document.scripts].filter(script => /formatx-(mobile-recovery|core-real3d-v20|core-mechanical-orb-r250)\.js/.test(script.src)).length,
      gl: Boolean(gl),
      glError: gl?.getError(),
      renderMs: Number(root.dataset.fxCoreRenderMs || Infinity),
      width: canvasBox?.width || 0,
      height: canvasBox?.height || 0,
      opacity: Number(style?.opacity || 0),
      filter: style?.filter || '',
      stageAnimation: stageStyle?.animationName || '',
      controlsVisible: visible(controls),
      manualPauseCount,
      controlsOneRow: boxes.length === 2 && Math.max(...boxes.map(item => item.top)) - Math.min(...boxes.map(item => item.top)) <= 8,
      controlsOverlap: boxes.length === 2 && localOverlap(boxes[0], boxes[1]),
      controlBoxes: boxes.map(item => ({left:item.left,right:item.right,top:item.top,bottom:item.bottom,width:item.width,height:item.height})),
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      magText: String(mag?.textContent || '').trim(),
      langText: String(lang?.textContent || '').trim(),
      magBefore: mag ? getComputedStyle(mag, '::before').content : '',
      magAfter: mag ? getComputedStyle(mag, '::after').content : '',
      magBackgroundImage: mag ? getComputedStyle(mag).backgroundImage : '',
      magShape: mag?.dataset.fxCoreShape || '',
      miniShape: miniGlyph?.dataset.fxCoreShape || '',
      miniLauncherShape: miniLauncher?.dataset.fxCoreShape || '',
      miniShapeSync: root.dataset.fxMiniMagShapeSyncR476 || '',
      brandBox: rect(brand), magBox: rect(mag), langBox: rect(lang), menuBox: rect(menu)
    };
  });

  const shapeBefore = state.magShape;
  assert.equal(shapeBefore,'organism',JSON.stringify(state));
  await page.locator('.topbar > .fx-reference-mag-button').click();
  await page.waitForTimeout(120);
  const shapeAfter = await page.evaluate(() => ({
    primary: document.documentElement.dataset.fxCoreShapeR337 || '',
    mini: document.querySelector('.fx-mini-mag-glyph-r459')?.dataset.fxCoreShape || '',
    launcher: document.querySelector('.fx-mini-mag-launcher-r459')?.dataset.fxCoreShape || '',
    header: document.querySelector('.topbar > .fx-reference-mag-button')?.dataset.fxCoreShape || '',
    physiology: document.documentElement.dataset.fxCorePhysiologyR1723 || ''
  }));
  assert.equal(shapeAfter.primary,'organism',JSON.stringify(shapeAfter));
  assert.equal(shapeAfter.mini, shapeAfter.primary, JSON.stringify(shapeAfter));
  assert.equal(shapeAfter.launcher, shapeAfter.primary, JSON.stringify(shapeAfter));
  assert.equal(shapeAfter.header, shapeAfter.primary, JSON.stringify(shapeAfter));

  const viewportShot = await page.screenshot({
    path: path.join(output, `${name}-r476-current-viewport.png`),
    fullPage: false,
    animations: 'disabled',
    caret: 'hide'
  });
  const magShot = await page.locator('#hero .fx-crystal-organism-r326-canvas').screenshot({
    path: path.join(output, `${name}-r476-current-mag.png`),
    animations: 'disabled',
    caret: 'hide'
  });

  assert.ok(viewportShot.length > 50000, `${name}: viewport capture is unexpectedly empty`);
  assert.ok(magShot.length > 5000, `${name}: MAG-only composited capture is unexpectedly empty`);
  assert.equal(state.renderer, 'single-webgl-crystal-organism-r326', JSON.stringify(state));
  assert.equal(state.canonicalRenderer, 'single-webgl-living-organism-r326', JSON.stringify(state));
  assert.equal(state.revision, 'living-luminous-electric-crystal-r454', JSON.stringify(state));
  assert.equal(state.canonicalRevision, 'fully-living-organism-r1723', JSON.stringify(state));
  assert.equal(state.optics, 'single-luminous-webgl-material-owner', JSON.stringify(state));
  assert.equal(state.motion, 'intermittent-native-electric-filament-every-five-to-six-seconds', JSON.stringify(state));
  assert.ok(
    state.pulse === 'idle' || /^sweep-/.test(state.pulse),
    JSON.stringify(state)
  );
  assert.match(state.energyBolt, /^surface-sweep-/, JSON.stringify(state));
  assert.equal(state.scheduler, 'interaction-bursts-idle-zero-frame-r441', JSON.stringify(state));
  assert.equal(state.surface, 'r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics', JSON.stringify(state));
  assert.equal(state.triangleEdges, 'disabled', JSON.stringify(state));
  assert.equal(state.outerNoise, 'disabled-on-glass-shell', JSON.stringify(state));
  assert.equal(state.innerLife, 'preserved-low-cost-mobile-field', JSON.stringify(state));
  assert.equal(state.shaderHook, 'released-after-r326-compile', JSON.stringify(state));
  assert.equal(state.loaderOptics, 'uniform-solid-glass-shell-no-vram-artifact', JSON.stringify(state));
  assert.equal(state.life, 'ready', JSON.stringify(state));
  assert.equal(state.stageCount, 1, JSON.stringify(state));
  assert.equal(state.canvasCount, 1, JSON.stringify(state));
  assert.equal(state.solidScriptCount, 1, JSON.stringify(state));
  assert.equal(state.lifeScriptCount, 1, JSON.stringify(state));
  assert.equal(state.legacyFrames, 0, JSON.stringify(state));
  assert.equal(state.legacyScripts, 0, JSON.stringify(state));
  assert.equal(state.gl, true, JSON.stringify(state));
  assert.equal(state.glError, 0, JSON.stringify(state));
  assert.ok(state.width > 200 && state.width <= viewport.width + 1, JSON.stringify(state));
  assert.ok(state.height > 200, JSON.stringify(state));
  assert.ok(Number.isFinite(state.renderMs) && state.renderMs < 16.67, JSON.stringify(state));
  assert.equal(state.controlsVisible, true, JSON.stringify(state));
  assert.equal(state.manualPauseCount, 0, JSON.stringify(state));
  assert.equal(state.controlsOneRow, true, JSON.stringify(state));
  assert.equal(state.controlsOverlap, false, JSON.stringify(state));
  assert.ok(state.overflow <= 1, JSON.stringify(state));

  assert.equal(state.magText, 'MAG', JSON.stringify(state));
  assert.equal(state.langText, 'HU', JSON.stringify(state));
  assert.equal(state.magBefore, 'none', JSON.stringify(state));
  assert.equal(state.magAfter, 'none', JSON.stringify(state));
  assert.match(state.magBackgroundImage, /data:image\/svg\+xml/i, state.magBackgroundImage);
  assert.equal(state.magShape, state.miniShape, JSON.stringify(state));
  assert.equal(state.magShape, state.miniLauncherShape, JSON.stringify(state));
  assert.equal(state.miniShapeSync, 'ready-organism', JSON.stringify(state));
  assert.ok(state.brandBox && state.magBox && state.langBox && state.menuBox, JSON.stringify(state));
  assert.equal(overlap(state.brandBox, state.magBox), false, JSON.stringify(state));
  assert.equal(overlap(state.magBox, state.langBox), false, JSON.stringify(state));
  assert.equal(overlap(state.langBox, state.menuBox), false, JSON.stringify(state));

  if (isMobile) {
    assert.equal(state.normal, 'continuous-volume-99.8-percent-smooth', JSON.stringify(state));
    assert.equal(state.specular, 'soft-broad-low-gain-highlight-r465', JSON.stringify(state));
    assert.equal(state.mobileOptics, 'soft-perimeter-low-bloom-low-cost-shader', JSON.stringify(state));
    assert.equal(state.finalOptics, 'soft-bloom-soft-edge-compositor-breathe', JSON.stringify(state));
    assert.equal(state.rendererSelection, 'r326-direct-r468-soft-optics-live-energy-zero-idle', JSON.stringify(state));
    assert.equal(state.governor, 'r528-automatic-idle-flag-no-manual-pause', JSON.stringify(state));
    assert.equal(state.idlePolicy, 'periodic-surface-bursts-between-zero-idle', JSON.stringify(state));
    assert.ok(state.opacity >= .94, JSON.stringify(state));
    const mobileBrightness=Number((state.filter.match(/brightness\(([-\d.]+)/)||[])[1]);
    const mobileContrast=Number((state.filter.match(/contrast\(([-\d.]+)/)||[])[1]);
    const mobileSaturate=Number((state.filter.match(/saturate\(([-\d.]+)/)||[])[1]);
    assert.ok(mobileBrightness>=.95, state.filter);
    assert.ok(mobileContrast>=1.05, state.filter);
    assert.ok(mobileSaturate>=1.0, state.filter);
    assert.ok(!/blur\((?!0(?:px)?\))/i.test(state.filter), state.filter);
    assert.equal(state.stageAnimation, 'none', JSON.stringify(state));
  } else {
    assert.equal(state.normal, 'continuous-volume-93-percent-smooth', JSON.stringify(state));
    assert.equal(state.specular, 'continuous-controlled-highlight', JSON.stringify(state));
    assert.equal(state.rendererSelection, 'r326-direct-r468-desktop-live-energy', JSON.stringify(state));
    assert.ok(state.opacity >= .90, JSON.stringify(state));
    assert.ok(!state.filter.includes('blur('), state.filter);
    assert.equal(state.controlBoxes.length, 2, JSON.stringify(state));
    assert.ok(state.controlBoxes.every(item => item.width >= 54 && item.height >= 54), JSON.stringify(state));
  }

  assert.deepEqual(pageErrors, [], `${name}: ${pageErrors.join(' | ')}`);
  await context.close();
  console.log(`PASS ${name}:`, JSON.stringify(state));
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
  });
  try {
    await verify(browser, 'desktop-1440', { width: 1440, height: 960 }, false, 1);
    await verify(browser, 'mobile-390', { width: 390, height: 844 }, true, 2);
    await verify(browser, 'mobile-430', { width: 430, height: 932 }, true, 2);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
