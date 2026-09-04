'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

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

function semanticReady(state) {
  return state.crystal === 'ready'
    && state.renderer === 'single-webgl-crystal-organism-r326'
    && state.canvasCount === 1
    && state.stageCount === 1
    && state.canvas.width > 120
    && state.canvas.height > 180
    && state.canvas.display !== 'none'
    && state.canvas.visibility !== 'hidden'
    && state.canvas.opacity > 0.2
    && state.balanceHref.includes('/scifi-ui/styles/formatx-mag-living-balance-r481.css')
    && state.scheduler === 'interaction-bursts-idle-zero-frame-r441'
    && state.idle === 'zero-frame'
    && state.header.visible
    && state.ask.visible
    && state.manualPauseCount === 0
    && state.overflow <= 2;
}

async function snapshot(page) {
  return page.evaluate(({ CANVAS, STAGE, ASK, MANUAL_PAUSE }) => {
    const root = document.documentElement;
    const canvas = document.querySelector(CANVAS);
    const cs = canvas ? getComputedStyle(canvas) : null;
    const box = canvas?.getBoundingClientRect();
    const header = document.querySelector('.topbar .fx-reference-mag-button');
    const hs = header ? getComputedStyle(header) : null;
    const hb = header?.getBoundingClientRect();
    const ask = document.querySelector(ASK);
    const visible = element => Boolean(
      element
      && getComputedStyle(element).display !== 'none'
      && getComputedStyle(element).visibility !== 'hidden'
      && Number(getComputedStyle(element).opacity || 1) > 0.2
      && element.getBoundingClientRect().width > 0
      && element.getBoundingClientRect().height > 0
    );

    return {
      at: performance.now(),
      crystal: root.dataset.fxCrystalOrganismR326 || '',
      shapeSync: root.dataset.fxMagShapeSyncR476 || '',
      life: root.dataset.fxPrimaryMagLifeR482 || root.dataset.fxMiniMagLifeR479 || '',
      lifeContract: root.dataset.fxPrimaryMagLifeContractR482 || '',
      optics: root.dataset.fxPrimaryMagOpticsR482 || '',
      renderer: root.dataset.fxCoreRenderer || '',
      scheduler: root.dataset.fxCoreScheduler || '',
      idle: root.dataset.fxCoreIdleRenderR441 || '',
      manualPauseContract: root.dataset.fxManualMagPauseContractR528 || '',
      manualPauseCount: document.querySelectorAll(MANUAL_PAUSE).length,
      canvasCount: document.querySelectorAll(CANVAS).length,
      stageCount: document.querySelectorAll(STAGE).length,
      canvas: {
        width: box?.width || 0,
        height: box?.height || 0,
        display: cs?.display || '',
        visibility: cs?.visibility || '',
        opacity: Number(cs?.opacity || 0),
        animation: cs?.animationName || '',
        playState: cs?.animationPlayState || '',
        filter: cs?.filter || '',
      },
      balanceHref: document.querySelector('link[data-fx-mag-living-balance-r481]')?.href || '',
      header: {
        exists: Boolean(header),
        visible: Boolean(
          hs && hb
          && hs.display !== 'none'
          && hs.visibility !== 'hidden'
          && Number(hs.opacity) > 0.2
          && hb.width >= 40
          && hb.height >= 40
        ),
      },
      ask: { visible: visible(ask) },
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

function maxDelta(before, after) {
  return Math.max(0, ...after.map(item => {
    const previous = before.find(candidate => candidate.index === item.index && candidate.name === item.name);
    return typeof item.time === 'number' && typeof previous?.time === 'number'
      ? Math.abs(item.time - previous.time)
      : 0;
  }));
}

async function waitForSemanticReady(page, name) {
  await page.waitForTimeout(4000);
  let state = await snapshot(page);
  console.log('R528_INITIAL_DUMP', name, JSON.stringify(state));

  const deadline = Date.now() + 20000;
  while (!semanticReady(state) && Date.now() < deadline) {
    await page.waitForTimeout(250);
    state = await snapshot(page);
  }

  console.log('R528_FINAL_DUMP', name, JSON.stringify(state));
  assert.ok(semanticReady(state), `${name}: semantic MAG prerequisites absent ${JSON.stringify(state)}`);
  assert.equal(state.manualPauseContract, 'retired-living-core', `${name}: manual pause retirement marker missing`);
  assert.match(state.shapeSync, /^ready-r\d+$/, `${name}: shape sync is not a current ready revision`);
  assert.ok(state.lifeContract.length > 0 && /webgl/i.test(state.lifeContract) && /idle/i.test(state.lifeContract),
    `${name}: current MAG life contract missing ${state.lifeContract}`);
  assert.ok(state.optics.length > 0, `${name}: current MAG optics contract missing`);
  assert.notEqual(state.canvas.animation, 'none', `${name}: MAG animation unavailable`);
  return state;
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
    if (!/cloudflareinsights|favicon/i.test(url)) {
      failed.push(`${request.method()} ${url} ${request.failure()?.errorText || ''}`.trim());
    }
  });

  try {
    await page.goto(`${ORIGIN}?r528_semantic=${name}-${Date.now()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const state = await waitForSemanticReady(page, name);

    if (mobile) assert.match(state.canvas.animation, /fx-primary-mag-mobile-heart-r\d+/, `${name}: mobile MAG animation family`);
    else assert.match(state.canvas.animation, /fx-primary-mag-living-desktop-r\d+/, `${name}: desktop MAG animation family`);

    const a0 = await animations(page);
    await page.waitForTimeout(350);
    const a1 = await animations(page);
    assert.ok(a0.length > 0 && a1.length === a0.length, `${name}: MAG animation set unavailable`);
    assert.deepEqual(animationNames(a1), animationNames(a0), `${name}: MAG animation identity changed`);
    const initialAdvance = maxDelta(a0, a1);
    assert.ok(initialAdvance > 16, `${name}: living MAG motion did not progress (${initialAdvance}ms)`);

    const a2 = await animations(page);
    await page.waitForTimeout(650);
    const a3 = await animations(page);
    assert.deepEqual(animationNames(a3), animationNames(a2), `${name}: living MAG animation identity changed during sustained run`);
    const sustainedAdvance = maxDelta(a2, a3);
    assert.ok(sustainedAdvance > 16, `${name}: living MAG motion stopped unexpectedly (${sustainedAdvance}ms)`);

    const after = await snapshot(page);
    assert.equal(after.manualPauseCount, 0, `${name}: obsolete manual MAG PAUSE control reappeared`);

    const ask = page.locator(ASK).first();
    const askBox = await ask.boundingBox();
    assert.ok(askBox && askBox.width >= 44 && askBox.height >= 44, `${name}: ASK hit target invalid`);
    await ask.click();
    await page.waitForTimeout(120);

    assert.equal(errors.length, 0, `${name}: console/page errors ${errors.join(' | ')}`);
    assert.equal(failed.length, 0, `${name}: request failures ${failed.join(' | ')}`);

    return {
      name,
      viewport,
      state,
      initialAdvance,
      sustainedAdvance,
      manualPauseCount: after.manualPauseCount,
      ask: { width: askBox.width, height: askBox.height },
    };
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
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && !/WebGL|WebGPU|GPU|favicon/i.test(text)) errors.push(text);
  });

  try {
    await page.goto(`${ORIGIN}?r528_semantic_fallback=${Date.now()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(2200);
    const state = await page.evaluate(pauseSel => ({
      hero: Boolean(document.querySelector('#hero')),
      lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
      live: Boolean(document.querySelector('#live-os,#live-os-overview,[data-fx-live-os]')),
      proof: Boolean(document.querySelector('[data-fx-award-proof],.fx-proof-grid')),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      manualPauseCount: document.querySelectorAll(pauseSel).length,
    }), MANUAL_PAUSE);
    assert.ok(state.hero && state.lead > 40 && state.live && state.proof, `fallback lost meaningful content ${JSON.stringify(state)}`);
    assert.ok(state.overflow <= 2, `fallback horizontal overflow ${state.overflow}`);
    assert.equal(state.manualPauseCount, 0, 'fallback exposed obsolete manual MAG PAUSE control');
    assert.equal(errors.length, 0, `fallback page errors ${errors.join(' | ')}`);
    return state;
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
  try {
    await page.goto(`${ORIGIN}?r528_semantic_reduced=${Date.now()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(4000);
    const state = await page.evaluate(pauseSel => ({
      scheduler: document.documentElement.dataset.fxP0MotionSchedulerR490 || '',
      hero: Boolean(document.querySelector('#hero')),
      lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      manualPauseCount: document.querySelectorAll(pauseSel).length,
    }), MANUAL_PAUSE);
    assert.ok(state.hero && state.lead > 40, `reduced-motion hero unavailable ${JSON.stringify(state)}`);
    assert.match(state.scheduler, /reduced-motion-static|armed|committed/, `unexpected reduced-motion scheduler ${state.scheduler}`);
    assert.ok(state.overflow <= 2, `reduced-motion horizontal overflow ${state.overflow}`);
    assert.equal(state.manualPauseCount, 0, 'reduced-motion mode exposed obsolete manual MAG PAUSE control');
    return state;
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
    ],
  });

  try {
    const [desktop, mobile] = await Promise.all([
      verifyNormal(browser, 'desktop-1440x900', { width: 1440, height: 900 }, false),
      verifyNormal(browser, 'mobile-390x844', { width: 390, height: 844 }, true),
    ]);
    const fallback = await verifyFallback(browser);
    const reducedMotion = await verifyReducedMotion(browser);
    const report = {
      auditedSha: process.env.AUDITED_SHA || '',
      origin: ORIGIN,
      contract: 'r528-living-core-no-manual-pause',
      desktop,
      mobile,
      fallback,
      reducedMotion,
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