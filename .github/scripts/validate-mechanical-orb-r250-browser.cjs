'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const output = process.env.FORMATX_VISUAL_DIR || 'artifacts/mechanical-orb-r250';

async function scenario(browser, name, viewport, mobile, forceWebgl1 = false) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
    colorScheme: 'dark',
    locale: 'hu-HU'
  });

  await context.addInitScript(({ webgl1 }) => {
    try {
      localStorage.setItem('formatx:intro-seen-v1', '1');
      sessionStorage.setItem('formatx:intro-seen-v1', '1');
    } catch (_) {}

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (webgl1 && type === 'webgl2') return null;
      return originalGetContext.call(this, type, ...args);
    };

    for (const prototype of [
      globalThis.WebGLRenderingContext?.prototype,
      globalThis.WebGL2RenderingContext?.prototype
    ]) {
      if (!prototype || prototype.__formatxR250DrawPatched) continue;
      const original = prototype.drawElements;
      Object.defineProperty(prototype, '__formatxR250DrawPatched', { value: true });
      prototype.drawElements = function (...args) {
        const root = document.documentElement;
        root.dataset.fxR250DrawCalls = String(Number(root.dataset.fxR250DrawCalls || 0) + 1);
        root.dataset.fxR250LastPrimitive = String(args[0]);
        return original.apply(this, args);
      };
    }
  }, { webgl1: forceWebgl1 });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/favicon|404/i.test(message.text())) errors.push(message.text());
  });

  await page.goto(`${base}${base.includes('?') ? '&' : '?'}r250_browser=${name}-${Date.now()}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxCoreMobileR250 === 'ready'
      && root.dataset.fxCoreRenderer === 'single-webgl-mechanical-orb-r250'
      && document.querySelectorAll('#hero .fx-core-r250-canvas').length === 1;
  }, null, { timeout: 90000 });
  await page.waitForTimeout(1100);

  const before = await page.evaluate(() => ({
    energy: Number(window.FormatXCoreMobileV69?.energy || 0),
    openness: Number(window.FormatXCoreMobileV69?.openness || 0),
    position: [...(window.FormatXCoreCinematic?.corePosition || [])]
  }));

  const stageBox = await page.locator('#hero .fx-core-r250-stage').boundingBox();
  assert.ok(stageBox && stageBox.width > 280 && stageBox.height > 280, `${name}: native 3D stage collapsed`);
  if (mobile) await page.touchscreen.tap(stageBox.x + stageBox.width * .48, stageBox.y + stageBox.height * .55);
  else {
    await page.mouse.move(stageBox.x + stageBox.width * .56, stageBox.y + stageBox.height * .48);
    await page.mouse.down();
    await page.mouse.move(stageBox.x + stageBox.width * .70, stageBox.y + stageBox.height * .38, { steps: 4 });
    await page.mouse.up();
  }
  await page.evaluate(() => dispatchEvent(new CustomEvent('formatx:coreinteraction', {
    detail: { x: .56, y: -.31, phase: 'drag', source: 'r250-browser-validator' }
  })));
  await page.waitForFunction(previous => {
    const engine = window.FormatXCoreMobileV69;
    const position = window.FormatXCoreCinematic?.corePosition || [];
    return Number(engine?.energy || 0) > previous.energy + .08
      && Number(engine?.openness || 0) > previous.openness + .01
      && position.length === 3
      && position.some((value, index) => Math.abs(value - (previous.position[index] || 0)) > .005);
  }, before, { timeout: 5000 });

  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const canvas = document.querySelector('#hero .fx-core-r250-canvas');
    const gl = canvas?.getContext(root.dataset.fxGpuCapability === 'webgl2' ? 'webgl2' : 'webgl');
    const isVisible = (rect, style) => rect && rect.width > 1 && rect.height > 1
      && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .02;
    const box = selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      return {
        left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
        width: rect.width, height: rect.height, visible: isVisible(rect, style),
        display: style.display, position: style.position, overflow: style.overflow
      };
    };
    const proofText = document.querySelector('#hero .fx-reference-proof p');
    return {
      renderer: root.dataset.fxCoreRenderer || '',
      version: window.FormatXCoreMobileV69?.version || '',
      context: root.dataset.fxGpuCapability || '',
      geometry: root.dataset.fxCoreR250Geometry || '',
      material: root.dataset.fxCoreR250Material || '',
      interaction: root.dataset.fxCoreR250Interaction || '',
      targetFps: root.dataset.fxCoreReal3dTargetFps || '',
      fps: Number(root.dataset.fxCoreReal3dFps || 0),
      renderMs: Number(root.dataset.fxCoreRenderMs || Infinity),
      resolutionScale: Number(root.dataset.fxCoreReal3dResolutionScale || 0),
      drawCalls: Number(root.dataset.fxR250DrawCalls || 0),
      lastPrimitive: Number(root.dataset.fxR250LastPrimitive || -1),
      triangles: gl?.TRIANGLES,
      depth: Boolean(gl?.getContextAttributes()?.depth),
      glError: gl?.getError(),
      canvases: document.querySelectorAll('#hero .fx-core-mobile-v55-canvas').length,
      legacyLayers: document.querySelectorAll('#hero .fx-core-biolume-r323,#hero .fx-quantum-field-r335,#hero .fx-core-detail-r122').length,
      energy: Number(window.FormatXCoreMobileV69?.energy || 0),
      openness: Number(window.FormatXCoreMobileV69?.openness || 0),
      position: [...(window.FormatXCoreCinematic?.corePosition || [])],
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stage: box('#hero .fx-core-r250-stage'),
      canvas: box('#hero .fx-core-r250-canvas'),
      controls: box('#hero .fx-reference-controls-r204'),
      sound: box('#hero .fx-three-sound'),
      ask: box('#hero .fx-reference-ask'),
      pause: box('#hero .fx-reference-pause'),
      space: box('#hero .hero-space'),
      copy: box('#hero .hero-copy'),
      heading: box('#hero .fx-reference-heading'),
      proof: box('#hero .fx-reference-proof'),
      proofText: proofText ? {
        scrollWidth: proofText.scrollWidth,
        clientWidth: proofText.clientWidth,
        height: proofText.getBoundingClientRect().height
      } : null,
      controlsOwnedByStage: document.querySelector('#hero .fx-reference-controls-r204')?.parentElement?.classList.contains('hero-space') || false
    };
  });

  assert.equal(state.renderer, 'single-webgl-mechanical-orb-r250', `${name}: wrong renderer`);
  assert.equal(state.version, 'native-mechanical-energy-orb-r250', `${name}: wrong engine version`);
  assert.equal(state.context, forceWebgl1 ? 'webgl1' : 'webgl2', `${name}: wrong WebGL context`);
  assert.equal(state.geometry, 'segmented-spherical-panels-plasma-sphere-six-orbitals');
  assert.equal(state.material, 'lit-metal-fresnel-cyan-magenta-plasma');
  assert.equal(state.interaction, 'pointer-touch-shell-open-ring-acceleration');
  assert.equal(state.targetFps, '60-plus-adaptive');
  assert.equal(state.canvases, 1, `${name}: duplicate WebGL canvases`);
  assert.equal(state.legacyLayers, 0, `${name}: retired visual layers returned`);
  assert.equal(state.depth, true, `${name}: depth buffer missing`);
  assert.equal(state.glError, 0, `${name}: WebGL error`);
  assert.equal(state.lastPrimitive, state.triangles, `${name}: renderer did not issue indexed triangle draws`);
  assert.ok(state.drawCalls > 60, `${name}: too few real drawElements calls: ${state.drawCalls}`);
  assert.ok(state.renderMs < 16.67, `${name}: GPU submission exceeded frame budget: ${state.renderMs}ms`);
  assert.ok(state.fps >= 45, `${name}: adaptive frame rate fell below interactive floor: ${state.fps}`);
  assert.ok(state.resolutionScale >= .72 && state.resolutionScale <= 1, `${name}: invalid adaptive resolution scale`);
  assert.ok(state.energy > before.energy + .08, `${name}: pointer/touch did not energise the core`);
  assert.ok(state.openness > before.openness + .01, `${name}: pointer/touch did not open the shell`);
  assert.ok(state.position.length === 3 && state.position.some((value, index) => Math.abs(value - (before.position[index] || 0)) > .005), `${name}: 3D core did not react spatially`);
  assert.ok(state.overflow <= 2, `${name}: horizontal overflow ${state.overflow}px`);

  if (mobile) {
    assert.equal(state.controlsOwnedByStage, true, `${name}: controls are not inside the 3D stage`);
    assert.ok(state.controls?.visible && state.ask?.visible && state.pause?.visible, `${name}: mobile reference controls missing`);
    assert.equal(state.sound?.visible, false, `${name}: extra mobile sound control is visible`);
    assert.ok(state.ask.top < state.pause.top && state.ask.bottom <= state.pause.top, `${name}: mobile reference rail overlaps`);
    assert.ok(state.controls.left >= state.space.left && state.controls.right <= state.space.right + 1, `${name}: mobile controls escaped stage`);
    assert.ok(state.copy.width <= 1.5 && state.copy.height <= 1.5 && state.copy.overflow === 'hidden', `${name}: legacy copy creates blank space`);
    assert.ok(state.heading.top >= state.space.bottom - 2, `${name}: heading overlaps native stage`);
    assert.ok(state.proof.top >= state.heading.bottom - 2, `${name}: proof overlaps heading`);
    assert.ok(state.proofText && state.proofText.scrollWidth <= state.proofText.clientWidth + 1 && state.proofText.height >= 60, `${name}: proof text does not wrap`);
  }

  const menu = page.locator('#menu-toggle');
  if (await menu.count()) {
    await menu.click();
    await page.waitForTimeout(100);
    assert.equal(await menu.getAttribute('aria-expanded'), 'true', `${name}: menu did not open`);
    await page.waitForFunction(() => document.documentElement.dataset.fxCoreRuntimeVisibility === 'suspended-covered', null, { timeout: 3000 });
    await menu.click();
  }

  await fs.mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false, animations: 'disabled' });
  const meaningful = errors.filter(value => !/WebGL|WebGPU|GPU|ERR_ABORTED/i.test(value));
  assert.deepEqual(meaningful, [], `${name}: browser errors: ${meaningful.join(' | ')}`);
  await context.close();
  return state;
}

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
    ...(executablePath ? { executablePath } : {})
  });
  try {
    const desktop = await scenario(browser, 'desktop-1440', { width: 1440, height: 900 }, false);
    const mobile = await scenario(browser, 'mobile-390', { width: 390, height: 844 }, true);
    const fallback = await scenario(browser, 'mobile-webgl1-390', { width: 390, height: 844 }, true, true);
    console.log('PASS r250 native mechanical orb browser validation', JSON.stringify({
      desktop: { context: desktop.context, fps: desktop.fps, renderMs: desktop.renderMs, drawCalls: desktop.drawCalls },
      mobile: { context: mobile.context, fps: mobile.fps, renderMs: mobile.renderMs, drawCalls: mobile.drawCalls },
      fallback: { context: fallback.context, fps: fallback.fps, renderMs: fallback.renderMs, drawCalls: fallback.drawCalls }
    }));
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
