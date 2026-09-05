'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

/* R530 active contract: navigation starts the living MAG. No pointer, touch,
   click, wheel, key or scroll activation may be required before normal motion
   progresses. SOUND remains user-controlled. Reduced/background lifecycle and
   a static-safe WebGL fallback remain separate accessibility/resource paths. */
const BASE = (process.env.FORMATX_TEST_URL || 'https://formatxsuite.com/').replace(/\/$/, '');
const OUT = process.env.FORMATX_SEMANTIC_EVIDENCE_DIR || 'artifacts/r522-semantic-mag';
const CANVAS = '#hero .fx-crystal-organism-r326-canvas';
const STAGE = '#hero .fx-crystal-organism-r326-stage';
const ASK = '#hero .fx-reference-ask';
const SOUND = '#hero .fx-three-sound';
const PAUSE = '#hero .fx-reference-pause';
fs.mkdirSync(OUT, { recursive: true });
const writeJson = (name, value) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
const urlFor = tag => `${BASE}${BASE.includes('?') ? '&' : '?'}r530_semantic=${encodeURIComponent(tag)}-${Date.now()}`;

async function installNavigationProbe(context) {
  await context.addInitScript(() => {
    const probe = window.__fxR530NavigationProbe = {
      inputs: [], scrollEvents: 0, fcp: null, lcp: null, cls: 0, tbt: 0,
      shellVisible: null, rendererReady: null, domContentLoaded: null
    };
    for (const type of ['pointerdown','mousedown','touchstart','click','wheel','keydown']) {
      addEventListener(type, event => probe.inputs.push({ type, trusted: event.isTrusted, at: performance.now() }), true);
    }
    addEventListener('scroll', () => { probe.scrollEvents += 1; }, { passive: true });
    addEventListener('DOMContentLoaded', () => { probe.domContentLoaded = performance.now(); }, { once: true });
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (entry.name === 'first-contentful-paint') probe.fcp = entry.startTime;
      }).observe({ type: 'paint', buffered: true });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) probe.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) probe.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) probe.tbt += Math.max(0, entry.duration - 50);
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}
    const inspect = () => {
      const heroSpace = document.querySelector('#hero .hero-space');
      if (probe.shellVisible == null && heroSpace) {
        const style = getComputedStyle(heroSpace), rect = heroSpace.getBoundingClientRect();
        if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) probe.shellVisible = performance.now();
      }
      if (probe.rendererReady == null && document.documentElement?.dataset.fxCrystalOrganismR326 === 'ready') probe.rendererReady = performance.now();
      if (probe.shellVisible == null || probe.rendererReady == null) requestAnimationFrame(inspect);
    };
    requestAnimationFrame(inspect);
  });
}

async function probeState(page) {
  return page.evaluate(() => {
    const p = window.__fxR530NavigationProbe || {};
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      inputs: Array.isArray(p.inputs) ? p.inputs.slice() : [],
      scrollEvents: Number(p.scrollEvents || 0),
      fcp: p.fcp == null ? null : Number(p.fcp),
      lcp: p.lcp == null ? null : Number(p.lcp),
      cls: Number(p.cls || 0),
      tbt: Number(p.tbt || 0),
      shellVisible: p.shellVisible == null ? null : Number(p.shellVisible),
      rendererReady: p.rendererReady == null ? null : Number(p.rendererReady),
      domContentLoaded: p.domContentLoaded == null ? null : Number(p.domContentLoaded),
      navigationType: String(navigation?.type || '')
    };
  });
}

function assertNoActivationInput(probe, name) {
  assert.equal(probe.inputs.length, 0, `${name}: activation input occurred before MAG autostart proof ${JSON.stringify(probe.inputs)}`);
}

async function state(page) {
  return page.evaluate(({ CANVAS, STAGE, ASK, SOUND, PAUSE }) => {
    const root = document.documentElement;
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .2 && rect.width > 0 && rect.height > 0;
    };
    const canvas = document.querySelector(CANVAS), box = canvas?.getBoundingClientRect();
    return {
      visibility: document.visibilityState,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      crystal: root.dataset.fxCrystalOrganismR326 || '',
      renderer: root.dataset.fxCoreRenderer || '',
      startupContract: root.dataset.fxMagStartupContractR530 || '',
      startupNoInput: root.dataset.fxMagStartupNoInputR530 || '',
      canonicalClock: root.dataset.fxMagCanonicalClockR530 || '',
      currentStartup: root.dataset.fxCurrentMagStartupR530 || '',
      product: root.dataset.fxMagProductContractR528 || '',
      lifecycle: root.dataset.fxCoreLifecycleR528 || '',
      canvasCount: document.querySelectorAll(CANVAS).length,
      stageCount: document.querySelectorAll(STAGE).length,
      rendererScriptCount: document.querySelectorAll('script[src*="formatx-crystal-organism-r326.js"]').length,
      pauseCount: document.querySelectorAll(PAUSE).length,
      canvasVisible: visible(canvas), canvasWidth: box?.width || 0, canvasHeight: box?.height || 0,
      askVisible: visible(document.querySelector(ASK)), soundVisible: visible(document.querySelector(SOUND)),
      headerVisible: visible(document.querySelector('.topbar .fx-reference-mag-button')),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
    };
  }, { CANVAS, STAGE, ASK, SOUND, PAUSE });
}

async function animationState(page) {
  return page.evaluate(selector => (document.querySelector(selector)?.getAnimations?.() || []).map((animation, index) => {
    const value = Number(animation.currentTime);
    return { index, name: String(animation.animationName || ''), time: Number.isFinite(value) ? value : null, state: String(animation.playState || '') };
  }), CANVAS);
}
function maxAdvance(before, after) {
  return Math.max(0, ...after.map(item => {
    const previous = before.find(candidate => candidate.index === item.index && candidate.name === item.name);
    return typeof item.time === 'number' && typeof previous?.time === 'number' ? item.time - previous.time : 0;
  }));
}
function maxAbsDelta(before, after) {
  return Math.max(0, ...after.map(item => {
    const previous = before.find(candidate => candidate.index === item.index && candidate.name === item.name);
    return typeof item.time === 'number' && typeof previous?.time === 'number' ? Math.abs(item.time - previous.time) : 0;
  }));
}

async function waitNormalReady(page, name) {
  await page.waitForFunction(({ CANVAS, STAGE, ASK, SOUND, PAUSE }) => {
    const root = document.documentElement;
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .2 && rect.width > 0 && rect.height > 0;
    };
    return root.dataset.fxMagStartupContractR530 === 'living-core-autostart-navigation-owned'
      && root.dataset.fxMagStartupNoInputR530 === 'required'
      && root.dataset.fxMagCanonicalClockR530 === 'compositor-heartbeat-navigation-owned'
      && root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && document.querySelectorAll(CANVAS).length === 1
      && document.querySelectorAll(STAGE).length === 1
      && document.querySelectorAll(PAUSE).length === 0
      && visible(document.querySelector(CANVAS)) && visible(document.querySelector(ASK)) && visible(document.querySelector(SOUND));
  }, { CANVAS, STAGE, ASK, SOUND, PAUSE }, { timeout: 20000 });
  const snapshot = await state(page);
  assert.ok(snapshot.rendererScriptCount <= 1, `${name}: duplicate renderer script`);
  assert.ok(snapshot.canvasWidth > 120 && snapshot.canvasHeight > 180, `${name}: MAG canvas too small`);
  assert.equal(snapshot.pauseCount, 0, `${name}: manual PAUSE reappeared`);
  assert.ok(snapshot.headerVisible && snapshot.askVisible && snapshot.soundVisible, `${name}: controls/identity incomplete`);
  assert.ok(snapshot.overflow <= 2, `${name}: horizontal overflow ${snapshot.overflow}`);
  console.log('R530_MAG_STATE', name, JSON.stringify(snapshot));
  return snapshot;
}

async function proveNavigationMotion(page, name) {
  const beforeProbe = await probeState(page);
  assertNoActivationInput(beforeProbe, `${name}-before-motion`);
  const before = await animationState(page);
  assert.ok(before.length > 0, `${name}: compositor animation unavailable`);
  assert.ok(before.some(item => item.state === 'running'), `${name}: no running compositor animation`);
  let best = 0, after = before;
  for (const delay of [180, 260, 420, 650]) {
    await page.waitForTimeout(delay);
    after = await animationState(page);
    best = Math.max(best, maxAdvance(before, after));
    if (best > 16) break;
  }
  const afterProbe = await probeState(page);
  assertNoActivationInput(afterProbe, `${name}-after-motion`);
  assert.ok(after.some(item => item.state === 'running'), `${name}: compositor animation stopped`);
  assert.ok(best > 16, `${name}: normal MAG motion did not automatically progress after navigation without user intent (${best}ms)`);
  return { advance: best, before, after, timing: afterProbe };
}

async function proveFreshNavigation(page, name, navigate) {
  await navigate();
  const initial = await waitNormalReady(page, name);
  const motion = await proveNavigationMotion(page, name);
  return { initial, motionAdvance: motion.advance, timing: motion.timing };
}

async function verifyAsk(page, name) {
  const ask = page.locator(ASK).first(), box = await ask.boundingBox();
  assert.ok(box && box.width >= 44 && box.height >= 44, `${name}: ASK hit target invalid`);
  await ask.click();
  await page.waitForTimeout(350);
  const result = await page.evaluate(() => ({
    state: document.documentElement.dataset.fxCanonicalAskActivationR477 || '',
    thought: document.documentElement.dataset.fxOrganismThought || '',
    dialogue: (() => {
      const node = document.querySelector('.fx-organism-dialogue,[data-fx-organism-dialogue]');
      if (!node) return false;
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    })()
  }));
  assert.ok(/dialogue-opened|loading-deferred-organism|armed/.test(result.state) || result.thought === 'open' || result.dialogue,
    `${name}: ASK activation failed ${JSON.stringify(result)}`);
  return { width: box.width, height: box.height, ...result };
}

async function verifyLifecycle(context, page, name) {
  const before = await state(page);
  const other = await context.newPage();
  await other.setContent('<!doctype html><title>background lifecycle probe</title>');
  await other.bringToFront();
  await page.waitForTimeout(300);
  const hidden = await state(page);
  await page.bringToFront();
  await page.waitForTimeout(350);
  const after = await state(page);
  await other.close();
  const testable = hidden.visibility === 'hidden';
  if (testable) {
    assert.equal(hidden.canvasCount, 1); assert.equal(hidden.stageCount, 1);
    assert.equal(after.canvasCount, 1); assert.equal(after.stageCount, 1);
    assert.equal(after.renderer, before.renderer, `${name}: renderer owner changed after visibility lifecycle`);
    const a0 = await animationState(page); await page.waitForTimeout(300); const a1 = await animationState(page);
    assert.ok(maxAdvance(a0, a1) > 16, `${name}: living compositor clock did not resume after visibility return`);
  }
  return { testable, before, hidden, after };
}

async function verifyNormal(browser, name, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
    locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference' });
  await installNavigationProbe(context);
  const page = await context.newPage();
  const errors = [], failed = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { const text = message.text(); if (message.type() === 'error' && !/favicon|WebGL|WebGPU|GPU/i.test(text)) errors.push(text); });
  page.on('requestfailed', request => { if (!/cloudflareinsights|favicon/i.test(request.url())) failed.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`); });
  try {
    const initial = await proveFreshNavigation(page, `${name}-cold`, () => page.goto(urlFor(`${name}-cold`), { waitUntil: 'domcontentloaded', timeout: 30000 }));
    const reload = await proveFreshNavigation(page, `${name}-reload`, () => page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }));
    const hardNavigation = await proveFreshNavigation(page, `${name}-hard-navigation`, () => page.goto(urlFor(`${name}-hard`), { waitUntil: 'domcontentloaded', timeout: 30000 }));

    await page.goto('about:blank');
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 });
    const backInitial = await waitNormalReady(page, `${name}-back-forward`);
    const backMotion = await proveNavigationMotion(page, `${name}-back-forward`);
    const backForward = { initial: backInitial, motionAdvance: backMotion.advance, timing: backMotion.timing };

    const noInputProof = await probeState(page);
    assertNoActivationInput(noInputProof, `${name}-final-no-input-proof`);
    const lifecycle = await verifyLifecycle(context, page, name);
    const ask = await verifyAsk(page, name);
    const finalState = await state(page);
    assert.equal(finalState.canvasCount, 1); assert.equal(finalState.stageCount, 1); assert.equal(finalState.pauseCount, 0);
    assert.equal(errors.length, 0, `${name}: console/page errors ${errors.join(' | ')}`);
    assert.equal(failed.length, 0, `${name}: request failures ${failed.join(' | ')}`);
    return { name, viewport, initial, reload, hardNavigation, backForward, noInputProof, lifecycle, ask, finalState };
  } finally { await context.close(); }
}

async function verifyReduced(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    deviceScaleFactor: 2, locale: 'hu-HU', reducedMotion: 'reduce' });
  await installNavigationProbe(context);
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.goto(urlFor('reduced-motion'), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.documentElement.dataset.fxMagStartupContractR530 === 'living-core-autostart-navigation-owned'
      && /navigation-owned/.test(document.documentElement.dataset.fxCurrentMagStartupR530 || ''), null, { timeout: 12000 });
    await page.waitForTimeout(500);
    const snapshot = await state(page), inputProof = await probeState(page);
    assertNoActivationInput(inputProof, 'reduced-motion');
    const text = await page.locator('#hero .hero-lead').textContent();
    assert.ok((text || '').trim().length > 40, 'reduced-motion: hero content missing');
    assert.equal(snapshot.pauseCount, 0, 'reduced-motion: manual PAUSE present');
    assert.ok(snapshot.headerVisible && snapshot.askVisible && snapshot.soundVisible, 'reduced-motion: MAG identity/controls incomplete');
    assert.ok(snapshot.canvasVisible || snapshot.crystal === 'context-unavailable', 'reduced-motion: MAG identity blank');
    const a0 = await animationState(page); await page.waitForTimeout(500); const a1 = await animationState(page);
    if (a0.length && a1.length) assert.ok(maxAbsDelta(a0, a1) < 100, 'reduced-motion animation too active');
    assert.ok(snapshot.overflow <= 2, `reduced-motion overflow ${snapshot.overflow}`);
    const ask = await verifyAsk(page, 'reduced-motion');
    assert.equal(errors.length, 0, `reduced-motion page errors ${errors.join(' | ')}`);
    return { state: snapshot, inputProof, ask };
  } finally { await context.close(); }
}

async function verifyFallback(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU' });
  await installNavigationProbe(context);
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null;
      return original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.goto(urlFor('webgl-fallback'), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.documentElement.dataset.fxMagStartupContractR530 === 'living-core-autostart-navigation-owned'
      && document.documentElement.dataset.fxMagFallbackR530 === 'static-safe-css'
      && document.documentElement.dataset.fxCurrentMagRuntimeR422 === 'ready-static-fallback', null, { timeout: 10000 });
    const inputProof = await probeState(page); assertNoActivationInput(inputProof, 'fallback');
    const fallback = await page.evaluate(({ CANVAS, STAGE, ASK, SOUND, PAUSE }) => {
      const root = document.documentElement, host = document.querySelector('#hero .hero-space');
      const art = host ? getComputedStyle(host, '::before') : null;
      const visible = node => {
        if (!node) return false;
        const style = getComputedStyle(node), rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .2 && rect.width > 0 && rect.height > 0;
      };
      return {
        lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
        proof: Boolean(document.querySelector('[data-fx-award-proof],.fx-proof-grid')),
        header: visible(document.querySelector('.fx-reference-mag-button')), ask: visible(document.querySelector(ASK)), sound: visible(document.querySelector(SOUND)),
        pauseCount: document.querySelectorAll(PAUSE).length, canvasCount: document.querySelectorAll(CANVAS).length, stageCount: document.querySelectorAll(STAGE).length,
        crystal: root.dataset.fxCrystalOrganismR326 || '', three: root.dataset.fxThree || '', fallback: root.dataset.fxMagFallbackR530 || '',
        runtime: root.dataset.fxCurrentMagRuntimeR422 || '', rendererSelection: root.dataset.fxCoreRendererSelection || '',
        pseudo: art ? { content: art.content, display: art.display, backgroundImage: art.backgroundImage, animationName: art.animationName } : null,
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
      };
    }, { CANVAS, STAGE, ASK, SOUND, PAUSE });
    assert.ok(fallback.lead > 40 && fallback.proof && fallback.header && fallback.ask && fallback.sound, `fallback lost product/control content ${JSON.stringify(fallback)}`);
    assert.equal(fallback.crystal, 'context-unavailable'); assert.equal(fallback.three, 'error');
    assert.equal(fallback.fallback, 'static-safe-css'); assert.equal(fallback.runtime, 'ready-static-fallback');
    assert.equal(fallback.rendererSelection, 'static-safe-css-fallback-r530');
    assert.equal(fallback.canvasCount, 0); assert.equal(fallback.stageCount, 0); assert.equal(fallback.pauseCount, 0);
    assert.ok(fallback.pseudo && fallback.pseudo.content !== 'none' && fallback.pseudo.display !== 'none' && fallback.pseudo.backgroundImage !== 'none', `fallback MAG identity blank ${JSON.stringify(fallback.pseudo)}`);
    assert.equal(fallback.pseudo.animationName, 'none', 'fallback MAG identity must be static');
    assert.ok(fallback.overflow <= 2, `fallback overflow ${fallback.overflow}`);
    const ask = await verifyAsk(page, 'fallback');
    assert.equal(errors.length, 0, `fallback page errors ${errors.join(' | ')}`);
    return { ...fallback, inputProof, ask };
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN, headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  try {
    const desktop = await verifyNormal(browser, 'desktop-1440x900', { width: 1440, height: 900 }, false);
    const mobile = await verifyNormal(browser, 'mobile-390x844', { width: 390, height: 844 }, true);
    const reducedMotion = await verifyReduced(browser);
    const fallback = await verifyFallback(browser);
    const report = { auditedSha: process.env.AUDITED_SHA || '', origin: BASE,
      contract: 'R530 navigation-owned living core: no-input autostart, SOUND+ASK, no manual PAUSE, reduced/background lifecycle, static-safe WebGL fallback',
      desktop, mobile, reducedMotion, fallback };
    writeJson('report.json', report);
    console.log('R530_NAVIGATION_OWNED_MAG_PASS');
  } finally { await browser.close(); }
})().catch(error => {
  writeJson('report-failure.json', { auditedSha: process.env.AUDITED_SHA || '', origin: BASE, error: String(error?.stack || error) });
  console.error(error?.stack || error); process.exit(1);
});
