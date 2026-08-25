'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const output = process.env.FORMATX_VISUAL_DIR || 'artifacts/crystal-r317';

async function scenario(browser, name, viewport, mobile, forceWebgl1 = false) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, colorScheme: 'dark', locale: 'hu-HU' });
  await context.addInitScript(({ webgl1 }) => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (webgl1 && type === 'webgl2') return null;
      return getContext.call(this, type, ...args);
    };
    for (const prototype of [globalThis.WebGLRenderingContext?.prototype, globalThis.WebGL2RenderingContext?.prototype]) {
      if (!prototype || prototype.__fxR317DrawPatched) continue;
      const original = prototype.drawArrays;
      Object.defineProperty(prototype, '__fxR317DrawPatched', { value: true });
      prototype.drawArrays = function (...args) {
        document.documentElement.dataset.fxR317DrawCalls = String(Number(document.documentElement.dataset.fxR317DrawCalls || 0) + 1);
        return original.apply(this, args);
      };
    }
  }, { webgl1: forceWebgl1 });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !/favicon|404|WebGL|GPU/i.test(message.text())) errors.push(message.text()); });
  await page.goto(`${base}${base.includes('?') ? '&' : '?'}r317_browser=${name}-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxCoreMobileR317 === 'ready-v69'
      && root.dataset.fxCoreRenderer === 'single-webgl-luminous-crystal-r99'
      && document.querySelectorAll('#hero .fx-core-r317-canvas').length === 1;
  }, null, { timeout: 90000 });
  await page.waitForTimeout(450);

  const first = await page.evaluate(() => ({
    draws: Number(document.documentElement.dataset.fxR317DrawCalls || 0),
    energy: Number(window.FormatXCoreCinematic?.energy || 0),
    scheduler: document.documentElement.dataset.fxCoreScheduler || '',
    visual: document.documentElement.dataset.fxCoreMobileVisualR318 || '',
    composition: document.documentElement.dataset.fxCoreCompositionR285 || '',
    renderMs: Number(document.documentElement.dataset.fxCoreRenderMs || Infinity)
  }));
  assert.ok(first.draws > 0, `${name}: crystal never rendered`);
  assert.equal(first.scheduler, 'bounded-interaction-bursts-no-idle-raf', `${name}: idle-safe scheduler missing`);
  if (mobile) assert.equal(first.visual, 'soft-rim-balanced-glow', `${name}: mobile soft-rim contract missing`);
  assert.equal(first.composition, 'pure-webgl3d-no-2d-overlays', `${name}: pure WebGL composition marker missing`);

  await page.waitForTimeout(800);
  const idleDraws = await page.evaluate(() => Number(document.documentElement.dataset.fxR317DrawCalls || 0));
  assert.ok(idleDraws - first.draws <= 2, `${name}: WebGL kept rendering while idle (${first.draws} -> ${idleDraws})`);

  const stage = await page.locator('#hero .fx-core-r317-stage').boundingBox();
  assert.ok(stage && stage.width > 220 && stage.height > 220, `${name}: crystal stage collapsed`);
  if (mobile) await page.touchscreen.tap(stage.x + stage.width * .53, stage.y + stage.height * .50);
  else await page.mouse.click(stage.x + stage.width * .56, stage.y + stage.height * .46);
  await page.evaluate(() => dispatchEvent(new CustomEvent('formatx:coreinteraction', { detail: { x: .38, y: -.22, phase: 'drag', source: 'r317-browser-validator' } })));
  await page.waitForTimeout(260);

  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const canvas = document.querySelector('#hero .fx-core-r317-canvas');
    let context = 'none';
    try {
      const gl2 = canvas?.getContext('webgl2');
      const gl = gl2 || canvas?.getContext('webgl');
      if (gl) context = gl2 ? 'webgl2' : 'webgl1';
    } catch (_) {}
    const rect = element => {
      if (!(element instanceof Element)) return null;
      const r = element.getBoundingClientRect(), s = getComputedStyle(element);
      return { left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,visible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.02&&r.width>0&&r.height>0 };
    };
    return {
      renderer: root.dataset.fxCoreRenderer || '',
      version: window.FormatXCoreMobileV69?.version || '',
      quality: window.FormatXCoreMobileV69?.quality || '',
      scheduler: window.FormatXCoreMobileV69?.scheduler || '',
      context,
      draws: Number(root.dataset.fxR317DrawCalls || 0),
      renderMs: Number(root.dataset.fxCoreRenderMs || Infinity),
      energy: Number(window.FormatXCoreCinematic?.energy || 0),
      canvases: document.querySelectorAll('#hero .fx-core-mobile-v55-canvas').length,
      legacyLayers: document.querySelectorAll('#hero .fx-core-detail-r122,#hero .fx-core-live-r147-layer,#hero .fx-core-biolume-r323,#hero .fx-quantum-field-r335').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      controls: rect(document.querySelector('#hero .fx-reference-controls-r204')),
      sound: rect(document.querySelector('#hero .fx-three-sound')),
      ask: rect(document.querySelector('#hero .fx-reference-ask')),
      pause: rect(document.querySelector('#hero .fx-reference-pause'))
    };
  });

  assert.equal(state.renderer, 'single-webgl-luminous-crystal-r99');
  assert.equal(state.version, 'reference-crystal-webgl-r317-modern-flat-normal-fresnel');
  assert.equal(state.quality, 'modern-flat-normal-fresnel-microfacet-r317');
  assert.equal(state.scheduler, 'bounded-interaction-bursts-no-idle-raf');
  assert.equal(state.context, forceWebgl1 ? 'webgl1' : 'webgl2');
  assert.equal(state.canvases, 1, `${name}: duplicate WebGL canvases`);
  assert.equal(state.legacyLayers, 0, `${name}: retired 2D MAG layer returned`);
  assert.ok(state.draws > idleDraws, `${name}: interaction did not wake WebGL renderer`);
  assert.ok(state.energy >= first.energy, `${name}: interaction did not energise crystal`);
  assert.ok(state.renderMs < 16.67, `${name}: crystal render exceeded frame budget: ${state.renderMs}ms`);
  assert.ok(state.overflow <= 2, `${name}: horizontal overflow ${state.overflow}px`);
  if (mobile && state.sound?.visible && state.ask?.visible && state.pause?.visible) {
    assert.ok(Math.abs(state.sound.top - state.ask.top) <= 8 && Math.abs(state.ask.top - state.pause.top) <= 8, `${name}: controls not in one row`);
  }

  await fs.mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false, animations: 'disabled' });
  assert.deepEqual(errors, [], `${name}: browser errors: ${errors.join(' | ')}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  try {
    await scenario(browser, 'desktop-1440', { width:1440,height:900 }, false);
    await scenario(browser, 'mobile-390', { width:390,height:844 }, true);
    await scenario(browser, 'mobile-webgl1-390', { width:390,height:844 }, true, true);
    console.log('PASS r317 primary crystal: soft mobile rim, bounded idle rendering, interaction wake and WebGL1 fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
