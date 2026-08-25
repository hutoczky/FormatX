'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const output = process.env.FORMATX_VISUAL_DIR || 'artifacts/crystal-organism-r326';

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
      if (!prototype || prototype.__fxR326DrawPatched) continue;
      const original = prototype.drawArrays;
      Object.defineProperty(prototype, '__fxR326DrawPatched', { value: true });
      prototype.drawArrays = function (...args) {
        document.documentElement.dataset.fxR326DrawCalls = String(Number(document.documentElement.dataset.fxR326DrawCalls || 0) + 1);
        return original.apply(this, args);
      };
    }
  }, { webgl1: forceWebgl1 });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !/favicon|404|WebGL|GPU/i.test(message.text())) errors.push(message.text()); });
  await page.goto(`${base}${base.includes('?') ? '&' : '?'}r326_browser=${name}-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length === 1;
  }, null, { timeout: 90000 });
  await page.waitForTimeout(500);

  const first = await page.evaluate(() => ({
    draws: Number(document.documentElement.dataset.fxR326DrawCalls || 0),
    energy: Number(window.FormatXCoreMobileV69?.energy || 0),
    scheduler: document.documentElement.dataset.fxCoreScheduler || '',
    visual: document.documentElement.dataset.fxCoreMobileVisualR326 || '',
    composition: document.documentElement.dataset.fxCoreCompositionR285 || '',
    legacyScripts: [...document.scripts].filter(s => /formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/.test(s.src)).map(s => s.src)
  }));
  assert.ok(first.draws >= 2, `${name}: new organism never rendered both layers`);
  assert.equal(first.scheduler, 'heartbeat-and-interaction-bursts-no-idle-loop-r326', `${name}: r326 scheduler missing`);
  assert.equal(first.composition, 'pure-webgl3d-no-2d-overlays', `${name}: pure WebGL marker missing`);
  assert.deepEqual(first.legacyScripts, [], `${name}: legacy MAG renderer loaded`);
  if (mobile) assert.equal(first.visual, 'soft-translucent-organic-rim', `${name}: mobile organic rim contract missing`);

  await page.waitForTimeout(650);
  const idleDraws = await page.evaluate(() => Number(document.documentElement.dataset.fxR326DrawCalls || 0));
  assert.ok(idleDraws - first.draws <= 2, `${name}: renderer did not settle to idle (${first.draws} -> ${idleDraws})`);

  const stage = await page.locator('#hero .fx-crystal-organism-r326-stage').boundingBox();
  assert.ok(stage && stage.width > 220 && stage.height > 220, `${name}: organism stage collapsed`);
  if (mobile) await page.touchscreen.tap(stage.x + stage.width * .54, stage.y + stage.height * .50);
  else await page.mouse.click(stage.x + stage.width * .58, stage.y + stage.height * .46);
  await page.evaluate(() => dispatchEvent(new CustomEvent('formatx:coreinteraction', { detail: { x: .34, y: -.18, phase: 'drag', source: 'r326-browser-validator' } })));
  await page.waitForTimeout(260);

  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    let context = 'none';
    try {
      const gl2 = canvas?.getContext('webgl2');
      const gl = gl2 || canvas?.getContext('webgl');
      if (gl) context = gl2 ? 'webgl2' : 'webgl1';
    } catch (_) {}
    return {
      renderer: root.dataset.fxCoreRenderer || '',
      version: window.FormatXCoreMobileV69?.version || '',
      material: window.FormatXCoreMobileV69?.material || '',
      geometry: window.FormatXCoreMobileV69?.geometry || '',
      scheduler: window.FormatXCoreMobileV69?.scheduler || '',
      context,
      draws: Number(root.dataset.fxR326DrawCalls || 0),
      renderMs: Number(root.dataset.fxCoreRenderMs || Infinity),
      energy: Number(window.FormatXCoreMobileV69?.energy || 0),
      canvases: document.querySelectorAll('#hero .fx-core-mobile-v55-canvas').length,
      legacyDom: document.querySelectorAll('#hero .fx-core-r317-stage,#hero .fx-core-r250-stage').length,
      legacyScripts: [...document.scripts].filter(s => /formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/.test(s.src)).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  assert.equal(state.renderer, 'single-webgl-crystal-organism-r326');
  assert.equal(state.version, 'crystal-organism-r326');
  assert.equal(state.material, 'translucent-living-facet-organism-r326');
  assert.equal(state.geometry, 'four-direction-asymmetric-crystal-organism-r326');
  assert.equal(state.scheduler, 'heartbeat-and-interaction-bursts-no-idle-loop-r326');
  assert.equal(state.context, forceWebgl1 ? 'webgl1' : 'webgl2');
  assert.equal(state.canvases, 1, `${name}: duplicate WebGL canvases`);
  assert.equal(state.legacyDom, 0, `${name}: legacy MAG DOM returned`);
  assert.equal(state.legacyScripts, 0, `${name}: legacy MAG script loaded`);
  assert.ok(state.draws > idleDraws, `${name}: interaction did not wake r326`);
  assert.ok(state.energy >= first.energy, `${name}: interaction did not energise organism`);
  assert.ok(state.renderMs < 16.67, `${name}: r326 render exceeded frame budget: ${state.renderMs}ms`);
  assert.ok(state.overflow <= 2, `${name}: horizontal overflow ${state.overflow}px`);

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
    console.log('PASS r326: brand-new crystal organism, no legacy renderer, idle-safe heartbeat bursts and WebGL1/2 interaction.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
