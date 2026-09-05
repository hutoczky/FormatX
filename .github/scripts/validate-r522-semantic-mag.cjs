'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

/* R528 product contract: MAG is the living core. Normal foreground mode must
   continuously progress; there is no user-facing PAUSE/RESUME contract.
   Reduced-motion and automatic background suspension remain accessibility /
   lifecycle behavior and are tested separately. */
const ORIGIN = (process.env.FORMATX_TEST_URL || 'https://formatxsuite.com/').replace(/\/?$/, '/');
const OUT = process.env.FORMATX_SEMANTIC_EVIDENCE_DIR || 'artifacts/r522-semantic-mag';
const CANVAS = '#hero .fx-crystal-organism-r326-canvas';
const STAGE = '#hero .fx-crystal-organism-r326-stage';
const ASK = '#hero .fx-reference-ask';
const MANUAL_PAUSE = '#hero .fx-reference-pause';

fs.mkdirSync(OUT, { recursive: true });

function writeJson(name, value) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
}

function visible(element) {
  if (!element) return false;
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && Number(style.opacity || 1) > 0.2
    && box.width > 0
    && box.height > 0;
}

async function snapshot(page) {
  return page.evaluate(({ CANVAS, STAGE, ASK, MANUAL_PAUSE }) => {
    const root = document.documentElement;
    const canvas = document.querySelector(CANVAS);
    const stage = document.querySelector(STAGE);
    const ask = document.querySelector(ASK);
    const header = document.querySelector('.topbar .fx-reference-mag-button');
    const cs = canvas ? getComputedStyle(canvas) : null;
    const box = canvas?.getBoundingClientRect();
    const isVisible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0.2
        && rect.width > 0
        && rect.height > 0;
    };
    return {
      at: performance.now(),
      visibilityState: document.visibilityState,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      crystal: root.dataset.fxCrystalOrganismR326 || '',
      shapeSync: root.dataset.fxMagShapeSyncR476 || '',
      renderer: root.dataset.fxCoreRenderer || '',
      scheduler: root.dataset.fxCoreScheduler || '',
      idle: root.dataset.fxCoreIdleRenderR441 || '',
      productContract: root.dataset.fxMagProductContractR528 || '',
      livingContract: root.dataset.fxPrimaryMagLivingContractR528 || '',
      playback: root.dataset.fxPrimaryMagPlaybackR498 || '',
      canvasCount: document.querySelectorAll(CANVAS).length,
      stageCount: document.querySelectorAll(STAGE).length,
      rendererScriptCount: document.querySelectorAll('script[src*="formatx-crystal-organism-r326.js"]').length,
      manualPauseCount: document.querySelectorAll(MANUAL_PAUSE).length,
      canvas: {
        visible: isVisible(canvas),
        width: box?.width || 0,
        height: box?.height || 0,
        animation: cs?.animationName || '',
        playState: cs?.animationPlayState || '',
      },
      stageVisible: isVisible(stage),
      headerVisible: isVisible(header),
      askVisible: isVisible(ask),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    };
  }, { CANVAS, STAGE, ASK, MANUAL_PAUSE });
}

async function animations(page) {
  return page.evaluate(selector => (
    document.querySelector(selector)?.getAnimations?.() || []
  ).map((animation, index) => ({
    index,
    name: String(animation.animationName || ''),
    time: typeof animation.currentTime === 'number' ? animation.currentTime : null,
    state: String(animation.playState || ''),
    pending: Boolean(animation.pending),
  })), CANVAS);
}

function animationNames(items) {
  return items.map(item => item.name);
}

function maxAdvance(before, after) {
  return Math.max(0, ...after.map(item => {
    const previous = before.find(candidate => candidate.index === item.index && candidate.name === item.name);
    return typeof item.time === 'number' && typeof previous?.time === 'number'
      ? item.time - previous.time
      : 0;
  }));
}

function maxAbsDelta(before, after) {
  return Math.max(0, ...after.map(item => {
    const previous = before.find(candidate => candidate.index === item.index && candidate.name === item.name);
    return typeof item.time === 'number' && typeof previous?.time === 'number'
      ? Math.abs(item.time - previous.time)
      : 0;
  }));
}

function semanticReady(state) {
  return state.crystal === 'ready'
    && state.renderer === 'single-webgl-crystal-organism-r326'
    && state.canvasCount === 1
    && state.stageCount === 1
    && state.rendererScriptCount <= 1
    && state.manualPauseCount === 0
    && state.canvas.visible
    && state.canvas.width > 120
    && state.canvas.height > 180
    && state.headerVisible
    && state.askVisible
    && state.overflow <= 2;
}

async function waitForSemanticReady(page, name) {
  await page.waitForTimeout(1800);
  let state = await snapshot(page);
  const deadline = Date.now() + 20000;
  while (!semanticReady(state) && Date.now() < deadline) {
    await page.waitForTimeout(250);
    state = await snapshot(page);
  }
  console.log('R528_MAG_STATE', name, JSON.stringify(state));
  assert.ok(semanticReady(state), `${name}: living MAG prerequisites absent ${JSON.stringify(state)}`);
  assert.match(state.shapeSync, /^ready-r\d+$/, `${name}: shape sync not ready`);
  assert.equal(state.manualPauseCount, 0, `${name}: obsolete manual MAG PAUSE still present`);
  assert.equal(state.canvasCount, 1, `${name}: duplicate/missing canvas`);
  assert.equal(state.stageCount, 1, `${name}: duplicate/missing stage`);
  assert.equal(state.renderer, 'single-webgl-crystal-organism-r326', `${name}: renderer owner not singular`);
  assert.ok(state.overflow <= 2, `${name}: horizontal overflow ${state.overflow}`);
  return state;
}

async function verifyAsk(page, name) {
  const ask = page.locator(ASK).first();
  const box = await ask.boundingBox();
  assert.ok(box && box.width >= 44 && box.height >= 44, `${name}: ASK hit target invalid`);
  await ask.click();
  await page.waitForTimeout(350);
  const activation = await page.evaluate(() => ({
    state: document.documentElement.dataset.fxCanonicalAskActivationR477 || '',
    thought: document.documentElement.dataset.fxOrganismThought || '',
    dialogueVisible: (() => {
      const node = document.querySelector('.fx-organism-dialogue,[data-fx-organism-dialogue]');
      if (!node) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    })(),
  }));
  assert.ok(
    /dialogue-opened|loading-deferred-organism|armed/.test(activation.state)
      || activation.thought === 'open'
      || activation.dialogueVisible,
    `${name}: ASK did not enter a functional activation path ${JSON.stringify(activation)}`
  );
  return { width: box.width, height: box.height, ...activation };
}

async function verifyBackgroundLifecycle(context, page, name) {
  const before = await snapshot(page);
  const other = await context.newPage();
  await other.setContent('<!doctype html><title>background probe</title>');
  await other.bringToFront();
  await page.waitForTimeout(250);
  const hidden = await snapshot(page);
  await page.bringToFront();
  await page.waitForTimeout(350);
  const after = await snapshot(page);
  await other.close();

  const testable = hidden.visibilityState === 'hidden';
  if (testable) {
    assert.equal(hidden.canvasCount, 1, `${name}: canvas duplicated while backgrounded`);
    assert.equal(hidden.stageCount, 1, `${name}: stage duplicated while backgrounded`);
    assert.ok(/background|reduced/.test(hidden.playback), `${name}: background lifecycle did not suspend ${hidden.playback}`);
    assert.equal(after.canvasCount, 1, `${name}: canvas duplicated after foreground return`);
    assert.equal(after.stageCount, 1, `${name}: stage duplicated after foreground return`);
    assert.equal(after.renderer, before.renderer, `${name}: renderer owner changed after background lifecycle`);
    assert.equal(after.playback, 'running', `${name}: normal playback did not resume after foreground return`);
    const a0 = await animations(page);
    await page.waitForTimeout(300);
    const a1 = await animations(page);
    assert.ok(maxAdvance(a0, a1) > 16, `${name}: motion did not resume after background return`);
  }
  return { testable, before, hidden, after };
}

async function verifyNormal(browser, name, viewport, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
    locale: 'hu-HU',
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && !/favicon|WebGL|WebGPU|GPU/i.test(text)) errors.push(text);
  });
  page.on('requestfailed', request => {
    const url = request.url();
    if (!/cloudflareinsights|favicon/i.test(url)) failed.push(`${request.method()} ${url} ${request.failure()?.errorText || ''}`.trim());
  });

  try {
    await page.goto(`${ORIGIN}?r528_semantic=${name}-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const state = await waitForSemanticReady(page, name);

    const a0 = await animations(page);
    await page.waitForTimeout(400);
    const a1 = await animations(page);
    assert.ok(a0.length > 0 && a1.length === a0.length, `${name}: MAG animation set unavailable`);
    assert.deepEqual(animationNames(a1), animationNames(a0), `${name}: animation identity changed`);
    const motionAdvance = maxAdvance(a0, a1);
    assert.ok(motionAdvance > 16, `${name}: living MAG motion did not progress (${motionAdvance}ms)`);

    const ask = await verifyAsk(page, name);
    const lifecycle = await verifyBackgroundLifecycle(context, page, name);
    const finalState = await snapshot(page);
    assert.equal(finalState.canvasCount, 1, `${name}: final canvas count changed`);
    assert.equal(finalState.stageCount, 1, `${name}: final stage count changed`);
    assert.equal(finalState.manualPauseCount, 0, `${name}: manual pause control reappeared`);
    assert.equal(errors.length, 0, `${name}: console/page errors ${errors.join(' | ')}`);
    assert.equal(failed.length, 0, `${name}: request failures ${failed.join(' | ')}`);

    return { name, viewport, state, motionAdvance, ask, lifecycle, finalState };
  } finally {
    await context.close();
  }
}

async function verifyReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
    locale: 'hu-HU',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.goto(`${ORIGIN}?r528_semantic_reduced=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4200);
    const state = await snapshot(page);
    const content = await page.evaluate(() => ({
      hero: Boolean(document.querySelector('#hero')),
      lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
    }));
    assert.ok(content.hero && content.lead > 40, `reduced-motion content incomplete ${JSON.stringify(content)}`);
    assert.equal(state.manualPauseCount, 0, 'reduced-motion: obsolete manual PAUSE present');
    assert.ok(state.headerVisible, `reduced-motion: MAG identity header unavailable ${JSON.stringify(state)}`);
    assert.ok(state.stageVisible || state.canvas.visible, `reduced-motion: MAG identity blank ${JSON.stringify(state)}`);
    assert.ok(state.askVisible, `reduced-motion: ASK unavailable ${JSON.stringify(state)}`);
    assert.ok(state.overflow <= 2, `reduced-motion: horizontal overflow ${state.overflow}`);

    const a0 = await animations(page);
    await page.waitForTimeout(500);
    const a1 = await animations(page);
    const reducedDelta = maxAbsDelta(a0, a1);
    if (a0.length && a1.length) assert.ok(reducedDelta < 100, `reduced-motion animation too active (${reducedDelta}ms)`);
    const ask = await verifyAsk(page, 'reduced-motion');
    assert.equal(errors.length, 0, `reduced-motion page errors ${errors.join(' | ')}`);
    return { state, content, reducedDelta, ask };
  } finally {
    await context.close();
  }
}

async function verifyFallback(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'hu-HU',
  });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null;
      return original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.goto(`${ORIGIN}?r528_semantic_fallback=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    const state = await page.evaluate(() => ({
      hero: Boolean(document.querySelector('#hero')),
      lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
      live: Boolean(document.querySelector('#live-os,#live-os-overview,[data-fx-live-os],[data-fx-live-os-launcher],[data-fx-live-os-cta]')),
      proof: Boolean(document.querySelector('[data-fx-award-proof],.fx-proof-grid')),
      headerCore: Boolean(document.querySelector('.fx-reference-mag-button')),
      ask: Boolean(document.querySelector('.fx-reference-ask')),
      pause: document.querySelectorAll('.fx-reference-pause').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    }));
    assert.ok(state.hero && state.lead > 40 && state.live && state.proof && state.headerCore && state.ask,
      `fallback lost meaningful product content ${JSON.stringify(state)}`);
    assert.equal(state.pause, 0, 'fallback: obsolete manual PAUSE present');
    assert.ok(state.overflow <= 2, `fallback horizontal overflow ${state.overflow}`);
    assert.equal(errors.length, 0, `fallback page errors ${errors.join(' | ')}`);
    return state;
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN,
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'],
  });
  try {
    const [desktop, mobile, reducedMotion, fallback] = await Promise.all([
      verifyNormal(browser, 'desktop-1440x900', { width: 1440, height: 900 }, false),
      verifyNormal(browser, 'mobile-390x844', { width: 390, height: 844 }, true),
      verifyReducedMotion(browser),
      verifyFallback(browser),
    ]);
    const report = {
      auditedSha: process.env.AUDITED_SHA || '',
      origin: ORIGIN,
      contract: 'R528 living core: continuous normal motion; reduced-motion/background lifecycle safe; no manual pause UI',
      desktop,
      mobile,
      reducedMotion,
      fallback,
    };
    writeJson('report.json', report);
    console.log('R528_SEMANTIC_MAG_PASS');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => {
  writeJson('report-failure.json', {
    auditedSha: process.env.AUDITED_SHA || '',
    origin: ORIGIN,
    error: String(error?.stack || error),
  });
  console.error(error?.stack || error);
  process.exit(1);
});
