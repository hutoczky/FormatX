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

  await page.goto(`${origin}?r467_current_browser=${name}-${Date.now()}&lang=hu`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await page.waitForFunction(mobile => {
    const root = document.documentElement;
    const surface = root.dataset.fxCoreSurfaceR456 || '';
    return root.dataset.fxCoreMobileV69 === 'ready-v69'
      && root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && root.dataset.fxCoreOpticsR454 === 'single-luminous-webgl-material-owner'
      && surface === 'r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'
      && root.dataset.fxCoreTriangleEdgesR456 === 'disabled'
      && root.dataset.fxCoreOuterNoiseR456 === 'disabled-on-glass-shell'
      && root.dataset.fxCoreShaderHookR456 === 'released-after-r326-compile'
      && (!mobile || root.dataset.fxCurrentMagOpticsR465 === 'soft-perimeter-low-bloom-low-cost-shader')
      && typeof window.FormatXCoreMobileV69?.surfacePulse === 'function';
  }, isMobile, { timeout: 60000 });

  await page.evaluate(() => {
    document.documentElement.dataset.fxReferenceMotionPaused = 'false';
    window.FormatXCoreMobileV69.requestRender?.(4);
  });
  await page.waitForTimeout(160);
  const pulseStarted = await page.evaluate(() => window.FormatXCoreMobileV69.surfacePulse());
  assert.equal(pulseStarted, true, `${name}: manual surface energy did not start`);
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
    const controls = document.querySelector('#hero .fx-reference-controls-r204');
    const sound = controls?.querySelector('.fx-three-sound');
    const ask = controls?.querySelector('.fx-reference-ask');
    const pause = controls?.querySelector('.fx-reference-pause');
    const mag = document.querySelector('.topbar > .fx-reference-mag-button');
    const lang = document.querySelector('.topbar > .fx-language-toggle');
    const menu = document.querySelector('.topbar > .fx-reference-menu-button');
    const brand = document.querySelector('.topbar > .brand');
    const boxes = [sound, ask, pause].map(node => node?.getBoundingClientRect()).filter(Boolean);
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
      revision: root.dataset.fxCoreRendererVersion || '',
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
      rendererSelection: root.dataset.fxCoreRendererSelection || '',
      governor: root.dataset.fxMobileRenderGovernorRevisionR433 || '',
      stageCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
      canvasCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
      solidScriptCount: [...document.scripts].filter(script => /formatx-mobile-solid-glass-r456\.js/.test(script.src)).length,
      legacyFrames: document.querySelectorAll('.fx-three-frame, iframe[src*="three-stage"], [data-renderer*="mechanical-orb"]').length,
      legacyScripts: [...document.scripts].filter(script => /formatx-(mobile-recovery|core-real3d-v20|core-mechanical-orb-r250)\.js/.test(script.src)).length,
      gl: Boolean(gl),
      glError: gl?.getError(),
      renderMs: Number(root.dataset.fxCoreRenderMs || Infinity),
      width: canvasBox?.width || 0,
      height: canvasBox?.height || 0,
      opacity: Number(style?.opacity || 0),
      filter: style?.filter || '',
      controlsVisible: visible(controls),
      controlsOneRow: boxes.length === 3 && Math.max(...boxes.map(item => item.top)) - Math.min(...boxes.map(item => item.top)) <= 8,
      controlsOverlap: boxes.length === 3 && (localOverlap(boxes[0], boxes[1]) || localOverlap(boxes[1], boxes[2])),
      controlBoxes: boxes.map(item => ({left:item.left,right:item.right,top:item.top,bottom:item.bottom,width:item.width,height:item.height})),
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      magText: String(mag?.textContent || '').trim(),
      langText: String(lang?.textContent || '').trim(),
      magBefore: mag ? getComputedStyle(mag, '::before').content : '',
      magAfter: mag ? getComputedStyle(mag, '::after').content : '',
      brandBox: rect(brand), magBox: rect(mag), langBox: rect(lang), menuBox: rect(menu)
    };
  });

  const viewportShot = await page.screenshot({
    path: path.join(output, `${name}-r467-current-viewport.png`),
    fullPage: false,
    animations: 'disabled',
    caret: 'hide'
  });
  const magShot = await page.locator('#hero .fx-crystal-organism-r326-canvas').screenshot({
    path: path.join(output, `${name}-r467-current-mag.png`),
    animations: 'disabled',
    caret: 'hide'
  });

  assert.ok(viewportShot.length > 50000, `${name}: viewport capture is unexpectedly empty`);
  assert.ok(magShot.length > 5000, `${name}: MAG-only composited capture is unexpectedly empty`);
  assert.equal(state.renderer, 'single-webgl-crystal-organism-r326', JSON.stringify(state));
  assert.equal(state.revision, 'living-luminous-electric-crystal-r454', JSON.stringify(state));
  assert.equal(state.optics, 'single-luminous-webgl-material-owner', JSON.stringify(state));
  assert.equal(state.motion, 'intermittent-native-electric-filament-every-five-to-six-seconds', JSON.stringify(state));
  assert.match(state.pulse, /^sweep-/, JSON.stringify(state));
  assert.equal(state.scheduler, 'interaction-bursts-idle-zero-frame-r441', JSON.stringify(state));
  assert.equal(state.surface, 'r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics', JSON.stringify(state));
  assert.equal(state.triangleEdges, 'disabled', JSON.stringify(state));
  assert.equal(state.outerNoise, 'disabled-on-glass-shell', JSON.stringify(state));
  assert.equal(state.innerLife, 'preserved-low-cost-mobile-field', JSON.stringify(state));
  assert.equal(state.shaderHook, 'released-after-r326-compile', JSON.stringify(state));
  assert.equal(state.loaderOptics, 'uniform-solid-glass-shell-no-vram-artifact', JSON.stringify(state));
  assert.equal(state.stageCount, 1, JSON.stringify(state));
  assert.equal(state.canvasCount, 1, JSON.stringify(state));
  assert.equal(state.solidScriptCount, 1, JSON.stringify(state));
  assert.equal(state.legacyFrames, 0, JSON.stringify(state));
  assert.equal(state.legacyScripts, 0, JSON.stringify(state));
  assert.equal(state.gl, true, JSON.stringify(state));
  assert.equal(state.glError, 0, JSON.stringify(state));
  assert.ok(state.width > 200 && state.width <= viewport.width + 1, JSON.stringify(state));
  assert.ok(state.height > 200, JSON.stringify(state));
  assert.ok(Number.isFinite(state.renderMs) && state.renderMs < 16.67, JSON.stringify(state));
  assert.equal(state.controlsVisible, true, JSON.stringify(state));
  assert.equal(state.controlsOneRow, true, JSON.stringify(state));
  assert.equal(state.controlsOverlap, false, JSON.stringify(state));
  assert.ok(state.overflow <= 1, JSON.stringify(state));

  assert.equal(state.magText, 'MAG', JSON.stringify(state));
  assert.equal(state.langText, 'HU', JSON.stringify(state));
  assert.equal(state.magBefore, 'none', JSON.stringify(state));
  assert.equal(state.magAfter, 'none', JSON.stringify(state));
  assert.ok(state.brandBox && state.magBox && state.langBox && state.menuBox, JSON.stringify(state));
  assert.equal(overlap(state.brandBox, state.magBox), false, JSON.stringify(state));
  assert.equal(overlap(state.magBox, state.langBox), false, JSON.stringify(state));
  assert.equal(overlap(state.langBox, state.menuBox), false, JSON.stringify(state));

  if (isMobile) {
    assert.equal(state.normal, 'continuous-volume-99.8-percent-smooth', JSON.stringify(state));
    assert.equal(state.specular, 'soft-broad-low-gain-highlight-r465', JSON.stringify(state));
    assert.equal(state.mobileOptics, 'soft-perimeter-low-bloom-low-cost-shader', JSON.stringify(state));
    assert.equal(state.rendererSelection, 'r326-direct-r465-soft-optics-no-idle-redraw', JSON.stringify(state));
    assert.equal(state.governor, 'r465-direct-pause-flag-no-idle-redraw', JSON.stringify(state));
    assert.ok(state.opacity >= .96 && state.opacity <= 1, JSON.stringify(state));
    assert.match(state.filter, /brightness\(1\.065\)/, state.filter);
    assert.match(state.filter, /contrast\(0?\.89\)/, state.filter);
    assert.match(state.filter, /saturate\(1\.1(?:0)?\)/, state.filter);
    assert.match(state.filter, /blur\(0\.82px\)/, state.filter);
  } else {
    assert.equal(state.normal, 'continuous-volume-93-percent-smooth', JSON.stringify(state));
    assert.equal(state.specular, 'continuous-controlled-highlight', JSON.stringify(state));
    assert.equal(state.rendererSelection, 'r326-direct-r460-desktop-glass', JSON.stringify(state));
    assert.ok(state.opacity >= .99, JSON.stringify(state));
    assert.ok(!state.filter.includes('blur('), state.filter);
    assert.equal(state.controlBoxes.length, 3, JSON.stringify(state));
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