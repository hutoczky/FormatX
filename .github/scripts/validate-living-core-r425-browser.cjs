'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const origin = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4173/scifi-ui/';
const output = process.env.FORMATX_CAPTURE_DIR || process.cwd();
fs.mkdirSync(output, { recursive: true });

async function readPixels(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
    if (!gl || !canvas) return { coverage: 0, brightCoverage: 0, visibleMean: 0, maximum: 0, samples: 0 };
    const bytes = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    let covered = 0, bright = 0, luminance = 0, maximum = 0, samples = 0;
    const stride = Math.max(1, Math.floor(Math.sqrt((canvas.width * canvas.height) / 180000)));
    for (let y = 0; y < canvas.height; y += stride) {
      for (let x = 0; x < canvas.width; x += stride) {
        const index = (y * canvas.width + x) * 4;
        const value = bytes[index] * .2126 + bytes[index + 1] * .7152 + bytes[index + 2] * .0722;
        const alpha = bytes[index + 3];
        samples += 1;
        maximum = Math.max(maximum, value);
        if (alpha > 8) { covered += 1; luminance += value; }
        if (alpha > 8 && value > 72) bright += 1;
      }
    }
    return {
      coverage: covered / Math.max(1, samples),
      brightCoverage: bright / Math.max(1, samples),
      visibleMean: luminance / Math.max(1, covered),
      maximum,
      samples
    };
  });
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

  await page.goto(`${origin}?r456_browser=${name}-${Date.now()}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForFunction(expectMobile => {
    const root = document.documentElement;
    const baseReady = root.dataset.fxCoreMobileV69 === 'ready-v69'
      && root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxCoreOpticsR454 === 'single-luminous-webgl-material-owner'
      && typeof window.FormatXCoreMobileV69?.surfacePulse === 'function';
    if (!baseReady) return false;
    return expectMobile
      ? root.dataset.fxCoreMobileSurfaceR456 === 'r456-solid-volume-smooth-normal-no-triangle-edges'
      : root.dataset.fxCoreMobileSurfaceR456 === 'desktop-bypass';
  }, isMobile, { timeout: 60000 });

  await page.evaluate(() => window.FormatXCoreMobileV69.requestRender(3));
  await page.waitForTimeout(180);
  const idlePixel = await readPixels(page);
  const pulseStarted = await page.evaluate(() => window.FormatXCoreMobileV69.surfacePulse());
  assert.equal(pulseStarted, true, `${name}: manual surface energy did not start`);
  await page.waitForFunction(() => document.documentElement.dataset.fxCoreSurfacePulseR454?.startsWith('sweep-'));
  await page.waitForTimeout(430);

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
    const box = canvas?.getBoundingClientRect();
    const style = canvas ? getComputedStyle(canvas) : null;
    const controls = document.querySelector('#hero .fx-reference-controls-r204');
    const skip = document.querySelector('.skip-link');
    const sound = controls?.querySelector('.fx-three-sound');
    const ask = controls?.querySelector('.fx-reference-ask');
    const pause = controls?.querySelector('.fx-reference-pause');
    const boxes = [sound, ask, pause].map(node => node?.getBoundingClientRect()).filter(Boolean);
    const overlap = (a, b) => a && b && !(a.right + 2 <= b.left || b.right + 2 <= a.left || a.bottom + 2 <= b.top || b.bottom + 2 <= a.top);
    return {
      renderer: root.dataset.fxCoreRenderer || '',
      revision: root.dataset.fxCoreRendererVersion || '',
      optics: root.dataset.fxCoreOpticsR454 || '',
      motion: root.dataset.fxCoreSurfaceMotionR454 || '',
      pulse: root.dataset.fxCoreSurfacePulseR454 || '',
      scheduler: root.dataset.fxCoreScheduler || '',
      mobileSurface: root.dataset.fxCoreMobileSurfaceR456 || '',
      mobileNormal: root.dataset.fxCoreMobileNormalR456 || '',
      triangleEdges: root.dataset.fxCoreMobileTriangleEdgesR456 || '',
      mobileSpecular: root.dataset.fxCoreMobileSpecularR456 || '',
      shaderHook: root.dataset.fxCoreMobileShaderHookR456 || '',
      loaderOptics: root.dataset.fxCurrentMagOpticsR456 || '',
      rendererSelection: root.dataset.fxCoreRendererSelection || '',
      stageCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
      canvasCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
      legacyFrames: document.querySelectorAll('.fx-three-frame, iframe[src*="three-stage"], [data-renderer*="mechanical-orb"]').length,
      legacyScripts: [...document.scripts].filter(script => /formatx-(mobile-recovery|core-real3d-v20|core-mechanical-orb-r250)\.js/.test(script.src)).length,
      solidScriptCount: [...document.scripts].filter(script => /formatx-mobile-solid-glass-r456\.js/.test(script.src)).length,
      gl: Boolean(gl),
      glError: gl?.getError(),
      renderMs: Number(root.dataset.fxCoreRenderMs || Infinity),
      resolutionScale: Number(root.dataset.fxCoreReal3dScale || 0),
      width: box?.width || 0,
      height: box?.height || 0,
      opacity: Number(style?.opacity || 0),
      filter: style?.filter || '',
      controlsVisible: visible(controls),
      controlsOneRow: boxes.length === 3 && Math.max(...boxes.map(item => item.top)) - Math.min(...boxes.map(item => item.top)) <= 8,
      controlsOverlap: boxes.length === 3 && (overlap(boxes[0], boxes[1]) || overlap(boxes[1], boxes[2])),
      skipVisible: visible(skip),
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
    };
  });
  const energizedPixel = await readPixels(page);

  await page.screenshot({
    path: path.join(output, `${name}-r456-solid-volume-mag.png`),
    fullPage: false,
    animations: 'disabled',
    caret: 'hide'
  });

  assert.equal(state.renderer, 'single-webgl-crystal-organism-r326', JSON.stringify(state));
  assert.equal(state.revision, 'living-luminous-electric-crystal-r454', JSON.stringify(state));
  assert.equal(state.optics, 'single-luminous-webgl-material-owner', JSON.stringify(state));
  assert.equal(state.motion, 'intermittent-native-electric-filament-every-five-to-six-seconds', JSON.stringify(state));
  assert.match(state.pulse, /^sweep-/, JSON.stringify(state));
  assert.equal(state.scheduler, 'interaction-bursts-idle-zero-frame-r441', JSON.stringify(state));
  assert.equal(state.stageCount, 1, JSON.stringify(state));
  assert.equal(state.canvasCount, 1, JSON.stringify(state));
  assert.equal(state.legacyFrames, 0, JSON.stringify(state));
  assert.equal(state.legacyScripts, 0, JSON.stringify(state));
  assert.equal(state.gl, true, JSON.stringify(state));
  assert.equal(state.glError, 0, JSON.stringify(state));
  assert.ok(state.width > 200 && state.width <= viewport.width + 1, JSON.stringify(state));
  assert.ok(state.height > 200, JSON.stringify(state));
  assert.ok(Number.isFinite(state.renderMs) && state.renderMs < 16.67, JSON.stringify(state));
  assert.ok(state.opacity >= .98, JSON.stringify(state));
  assert.equal(state.controlsVisible, true, JSON.stringify(state));
  assert.equal(state.controlsOneRow, true, JSON.stringify(state));
  assert.equal(state.controlsOverlap, false, JSON.stringify(state));
  assert.equal(state.skipVisible, false, JSON.stringify(state));
  assert.ok(state.overflow <= 1, JSON.stringify(state));

  if (isMobile) {
    assert.equal(state.mobileSurface, 'r456-solid-volume-smooth-normal-no-triangle-edges', JSON.stringify(state));
    assert.equal(state.mobileNormal, 'continuous-volume-97-percent-smooth', JSON.stringify(state));
    assert.equal(state.triangleEdges, 'disabled', JSON.stringify(state));
    assert.equal(state.mobileSpecular, 'soft-physical-phone-highlight', JSON.stringify(state));
    assert.equal(state.shaderHook, 'released-after-r326-compile', JSON.stringify(state));
    assert.equal(state.loaderOptics, 'solid-volume-smooth-normal-no-triangle-edges', JSON.stringify(state));
    assert.equal(state.rendererSelection, 'r326-direct-r456-solid-mobile-glass', JSON.stringify(state));
    assert.equal(state.solidScriptCount, 1, JSON.stringify(state));
    assert.match(state.filter, /blur\((?:0\.35|\.35)px\)/, state.filter);
  } else {
    assert.equal(state.mobileSurface, 'desktop-bypass', JSON.stringify(state));
    assert.equal(state.solidScriptCount, 0, JSON.stringify(state));
    assert.equal(state.loaderOptics, 'desktop-r454-unchanged', JSON.stringify(state));
    assert.equal(state.rendererSelection, 'r326-direct-r454-primary', JSON.stringify(state));
    assert.ok(!state.filter.includes('blur('), state.filter);
  }

  assert.ok(idlePixel.coverage > .025, `${name}: idle MAG is effectively invisible: ${JSON.stringify(idlePixel)}`);
  assert.ok(idlePixel.brightCoverage > .0012, `${name}: idle MAG lacks readable volume highlights: ${JSON.stringify(idlePixel)}`);
  assert.ok(idlePixel.visibleMean > 24, `${name}: idle MAG surface is too dark: ${JSON.stringify(idlePixel)}`);
  assert.ok(idlePixel.maximum > 105, `${name}: idle MAG has no luminous volume peak: ${JSON.stringify(idlePixel)}`);
  assert.ok(energizedPixel.coverage > .025, `${name}: energized MAG is effectively invisible: ${JSON.stringify(energizedPixel)}`);
  assert.ok(energizedPixel.brightCoverage > .002, `${name}: surface energy lacks readable highlights: ${JSON.stringify(energizedPixel)}`);
  assert.ok(energizedPixel.visibleMean > 27, `${name}: energized MAG surface is too dark: ${JSON.stringify(energizedPixel)}`);
  assert.ok(energizedPixel.maximum > 120, `${name}: surface energy has no luminous peak: ${JSON.stringify(energizedPixel)}`);
  assert.deepEqual(pageErrors, [], `${name}: ${pageErrors.join(' | ')}`);

  await page.waitForFunction(() => document.documentElement.dataset.fxCoreSurfacePulseR454 === 'idle', null, { timeout: 2500 });
  await context.close();
  console.log(`PASS ${name}:`, JSON.stringify({ state, idlePixel, energizedPixel }));
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