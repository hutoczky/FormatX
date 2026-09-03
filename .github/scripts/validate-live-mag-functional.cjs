'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ORIGIN = process.env.FORMATX_TEST_URL || 'https://formatxsuite.com/';
const OUT = process.env.FORMATX_MAG_EVIDENCE_DIR || 'artifacts/live-mag-functional';
const CANVAS = '#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas';
const PAUSE = '#hero .fx-reference-pause';
const ASK = '#hero .fx-reference-ask';
fs.mkdirSync(OUT, { recursive:true });

function writeJson(name, value) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2));
}

async function safeScreenshot(page, fileName) {
  try {
    await page.screenshot({ path:path.join(OUT, fileName), fullPage:false, timeout:5000, animations:'disabled' });
    return null;
  } catch (error) {
    return String(error && error.stack || error);
  }
}

async function runtimeState(page) {
  return page.evaluate(({ canvasSel, pauseSel }) => {
    const canvas = document.querySelector(canvasSel);
    const pause = document.querySelector(pauseSel);
    window.__fxMagVerifierIds ||= new WeakMap();
    window.__fxMagVerifierSeq ||= 0;
    const animations = canvas?.getAnimations?.().map(animation => {
      if (!window.__fxMagVerifierIds.has(animation)) {
        window.__fxMagVerifierIds.set(animation, `a${++window.__fxMagVerifierSeq}`);
      }
      return {
        id:window.__fxMagVerifierIds.get(animation),
        animationName:String(animation.animationName || ''),
        currentTime:typeof animation.currentTime === 'number' ? animation.currentTime : null,
        startTime:typeof animation.startTime === 'number' ? animation.startTime : null,
        playState:String(animation.playState || ''),
        pending:Boolean(animation.pending),
        playbackRate:typeof animation.playbackRate === 'number' ? animation.playbackRate : null,
      };
    }) || [];
    const computed = canvas ? getComputedStyle(canvas) : null;
    const timelineRaw = document.timeline?.currentTime;
    return {
      at:performance.now(),
      timelineTime:typeof timelineRaw === 'number' ? timelineRaw : null,
      visibilityState:document.visibilityState,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
      pauseDataset:pause ? { ...pause.dataset } : null,
      inlineAnimationPlayState:canvas?.style?.getPropertyValue('animation-play-state') || '',
      computedAnimationPlayState:computed?.animationPlayState || '',
      htmlDataset:{ ...document.documentElement.dataset },
      bodyDataset:document.body ? { ...document.body.dataset } : null,
      animations,
    };
  }, { canvasSel:CANVAS, pauseSel:PAUSE });
}

function identity(state) {
  return state.animations.map(a => `${a.id}:${a.animationName}`).sort();
}

function maxAdvance(start, end) {
  const first = new Map(start.animations.map(a => [a.id, a]));
  return Math.max(0, ...end.animations.map(a => {
    const before = first.get(a.id);
    return typeof a.currentTime === 'number' && typeof before?.currentTime === 'number'
      ? a.currentTime - before.currentTime
      : 0;
  }));
}

function maxAbsDelta(start, end) {
  const first = new Map(start.animations.map(a => [a.id, a]));
  return Math.max(0, ...end.animations.map(a => {
    const before = first.get(a.id);
    return typeof a.currentTime === 'number' && typeof before?.currentTime === 'number'
      ? Math.abs(a.currentTime - before.currentTime)
      : 0;
  }));
}

async function waitForCommittedPlayback(page, paused) {
  await page.waitForFunction(({ canvasSel, pauseSel, paused }) => {
    const canvas = document.querySelector(canvasSel);
    const button = document.querySelector(pauseSel);
    if (!(canvas instanceof HTMLCanvasElement) || !(button instanceof HTMLButtonElement)) return false;
    const animations = canvas.getAnimations();
    if (!animations.length) return false;
    const css = getComputedStyle(canvas).animationPlayState
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
    if (paused) {
      return button.dataset.paused === 'true'
        && css.length > 0
        && css.every(value => value === 'paused')
        && animations.every(animation => animation.playState !== 'running' && !animation.pending);
    }
    return button.dataset.paused !== 'true'
      && css.some(value => value === 'running')
      && animations.some(animation => animation.playState === 'running')
      && animations.every(animation => !animation.pending)
      && animations.every(animation => typeof animation.startTime === 'number' && Number.isFinite(animation.startTime));
  }, { canvasSel:CANVAS, pauseSel:PAUSE, paused }, { timeout:5000 });
}

async function waitForClockProgress(page, { minAdvance=16, timeout=3000 } = {}) {
  const first = await runtimeState(page);
  const stableIdentity = identity(first);
  let second = first;
  const started = Date.now();
  while (Date.now() - started < timeout) {
    await page.waitForTimeout(100);
    second = await runtimeState(page);
    assert.deepEqual(identity(second), stableIdentity, 'MAG animation object identity changed while sampling clock');
    const advance = maxAdvance(first, second);
    const timelineAdvance = (
      typeof first.timelineTime === 'number' && typeof second.timelineTime === 'number'
    ) ? second.timelineTime - first.timelineTime : null;
    if (advance > minAdvance && (timelineAdvance === null || timelineAdvance > minAdvance)) {
      return { first, second, maxAdvance:advance, timelineAdvance };
    }
  }
  return {
    first,
    second,
    maxAdvance:maxAdvance(first, second),
    timelineAdvance:(
      typeof first.timelineTime === 'number' && typeof second.timelineTime === 'number'
    ) ? second.timelineTime - first.timelineTime : null,
  };
}

async function activate(page) {
  const target = page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
  await target.waitFor({ state:'visible', timeout:30000 });
  const box = await target.boundingBox();
  assert.ok(box && box.width >= 16 && box.height >= 16, 'MAG activation target has no usable hit box');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction(sel => (
    document.documentElement.dataset.fxCrystalOrganismR326 === 'ready'
    && document.querySelectorAll(sel).length === 1
  ), CANVAS, { timeout:60000 });
}

async function verifyNormal(browser, name, viewport, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile:mobile,
    hasTouch:mobile,
    deviceScaleFactor:mobile ? 2 : 1,
    locale:'hu-HU',
    colorScheme:'dark',
    reducedMotion:'no-preference',
  });
  const page = await context.newPage();
  const errors = [], failed = [];
  const evidence = { name, viewport, mobile, phases:{} };
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => failed.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`));
  try {
    await page.goto(`${ORIGIN}${ORIGIN.includes('?') ? '&' : '?'}mag-functional=${name}-${Date.now()}`, {
      waitUntil:'domcontentloaded',
      timeout:60000,
    });
    await activate(page);
    evidence.phases.activated = await runtimeState(page);
    assert.equal(await page.locator(CANVAS).count(), 1, `${name}: renderer duplicated`);

    const initial = await waitForClockProgress(page, { minAdvance:50, timeout:3000 });
    evidence.phases.initialClock = initial;
    const initialEnd = initial.second;
    assert.equal(initialEnd.htmlDataset.fxCoreRenderer, 'single-webgl-crystal-organism-r326', `${name}: non-canonical renderer`);
    const size = await page.locator(CANVAS).evaluate(canvas => {
      const rect = canvas.getBoundingClientRect();
      return { w:rect.width, h:rect.height };
    });
    assert.ok(size.w > 220 && size.h > 220, `${name}: canvas too small ${JSON.stringify(size)}`);
    assert.ok(initialEnd.animations.some(a => a.playState === 'running'), `${name}: no running MAG animation`);
    assert.ok(initial.maxAdvance > 50, `${name}: MAG animation clock did not advance: ${initial.maxAdvance}`);

    const ask = page.locator(ASK).first();
    assert.equal(await ask.isVisible(), true, `${name}: ASK missing`);
    const askHit = await ask.evaluate(button => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        w:rect.width,
        h:rect.height,
        owns:Boolean(hit && button.contains(hit)),
        label:(button.textContent || button.getAttribute('aria-label') || '').trim(),
      };
    });
    evidence.ask = askHit;
    assert.ok(askHit.w >= 44 && askHit.h >= 44 && askHit.owns, `${name}: ASK hit target invalid ${JSON.stringify(askHit)}`);

    const pause = page.locator(PAUSE).first();
    assert.equal(await pause.isVisible(), true, `${name}: PAUSE missing`);

    await pause.click();
    await waitForCommittedPlayback(page, true);
    const pausedStart = await runtimeState(page);
    evidence.phases.pausedStart = pausedStart;
    await page.waitForTimeout(700);
    const pausedEnd = await runtimeState(page);
    evidence.phases.pausedEnd = pausedEnd;
    assert.deepEqual(identity(pausedEnd), identity(pausedStart), `${name}: PAUSE recreated animation`);
    const pauseDelta = maxAbsDelta(pausedStart, pausedEnd);
    evidence.pauseDeltaMs = pauseDelta;
    assert.ok(pauseDelta < 80, `${name}: PAUSE did not stop animation ${pauseDelta}`);
    assert.ok(pausedEnd.animations.every(a => a.playState !== 'running' && !a.pending), `${name}: PAUSE state did not settle`);
    assert.ok(pausedEnd.computedAnimationPlayState.split(',').every(value => value.trim() === 'paused'), `${name}: computed CSS did not commit paused`);

    await pause.click();
    await waitForCommittedPlayback(page, false);
    const resumeStart = await runtimeState(page);
    evidence.phases.resumeStart = resumeStart;
    assert.ok(resumeStart.animations.every(a => !a.pending), `${name}: RESUME remained pending`);
    assert.ok(resumeStart.animations.every(a => typeof a.startTime === 'number' && Number.isFinite(a.startTime)), `${name}: RESUME startTime unresolved`);
    assert.ok(resumeStart.computedAnimationPlayState.split(',').some(value => value.trim() === 'running'), `${name}: computed CSS did not commit running`);

    const resumed = await waitForClockProgress(page, { minAdvance:16, timeout:3000 });
    evidence.phases.resumeClock = resumed;
    evidence.phases.resumeEnd = resumed.second;
    evidence.resumeAdvanceMs = resumed.maxAdvance;
    evidence.resumeTimelineAdvanceMs = resumed.timelineAdvance;
    assert.deepEqual(identity(resumed.second), identity(resumeStart), `${name}: RESUME recreated animation`);
    assert.ok(resumed.second.animations.some(a => a.playState === 'running'), `${name}: RESUME state not running`);
    assert.ok(resumed.second.animations.every(a => !a.pending), `${name}: RESUME pending state returned`);
    assert.ok(resumed.maxAdvance > 16, `${name}: RESUME clock did not advance: ${resumed.maxAdvance}`);
    if (typeof resumed.timelineAdvance === 'number') {
      assert.ok(resumed.timelineAdvance > 16, `${name}: document timeline did not advance: ${resumed.timelineAdvance}`);
    }
    assert.equal(resumed.second.htmlDataset.fxReferenceMotionPaused, 'false', `${name}: user pause flag remained set`);
    assert.equal(resumed.second.htmlDataset.fxPrimaryMagPlaybackR498, 'running', `${name}: primary playback not running`);

    const gl = await page.locator(CANVAS).evaluate(canvas => {
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return { hasContext:Boolean(context), error:context ? context.getError() : -1 };
    });
    evidence.gl = gl;
    assert.equal(gl.hasContext, true, `${name}: WebGL context missing`);
    assert.equal(gl.error, 0, `${name}: WebGL error ${gl.error}`);
    assert.equal(errors.length, 0, `${name}: console/page errors ${errors.join(' | ')}`);
    assert.equal(failed.length, 0, `${name}: request failures ${failed.join(' | ')}`);

    evidence.screenshotError = await safeScreenshot(page, `${name}.png`);
    return {
      name,
      renderer:initialEnd.htmlDataset.fxCoreRenderer,
      size,
      animationAdvanceMs:initial.maxAdvance,
      pauseDeltaMs:pauseDelta,
      resumeAdvanceMs:resumed.maxAdvance,
      resumeTimelineAdvanceMs:resumed.timelineAdvance,
      ask:askHit,
      gl,
      screenshotError:evidence.screenshotError,
    };
  } catch (error) {
    evidence.error = String(error && error.stack || error);
    evidence.errors = errors;
    evidence.requestFailures = failed;
    try { evidence.failureState = await runtimeState(page); } catch (stateError) {
      evidence.failureStateError = String(stateError);
    }
    evidence.screenshotError = await safeScreenshot(page, `${name}-failure.png`);
    writeJson('report-failure.json', {
      auditedSha:process.env.AUDITED_SHA || '',
      url:ORIGIN,
      failure:evidence,
    });
    throw error;
  } finally {
    await context.close();
  }
}

async function verifyFallback(browser) {
  const context = await browser.newContext({
    viewport:{ width:390, height:844 },
    isMobile:true,
    hasTouch:true,
    locale:'hu-HU',
  });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (['webgl','webgl2','experimental-webgl'].includes(type)) return null;
      return original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${ORIGIN}?mag-functional-fallback=${Date.now()}`, {
      waitUntil:'domcontentloaded',
      timeout:60000,
    });
    const target = page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
    if (await target.isVisible()) await target.click().catch(() => {});
    await page.waitForTimeout(1800);
    const state = await page.evaluate(() => ({
      hero:Boolean(document.querySelector('#hero')),
      lead:(document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
      live:Boolean(document.querySelector('#live-os,#live-os-overview,[data-fx-live-os]')),
      proof:Boolean(document.querySelector('[data-fx-award-proof],.fx-proof-grid')),
      overflow:Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      renderer:document.documentElement.dataset.fxCoreRenderer || '',
      fallback:document.documentElement.dataset.fxCrystalOrganismR326 || document.documentElement.dataset.fxCoreReal3d || '',
    }));
    assert.ok(state.hero && state.lead > 40 && state.live && state.proof, 'WebGL fallback lost meaningful product content');
    assert.ok(state.overflow <= 2, `WebGL fallback overflow ${state.overflow}`);
    assert.equal(errors.length, 0, `WebGL fallback page errors ${errors.join(' | ')}`);
    return state;
  } finally {
    await context.close();
  }
}

async function verifyReduced(browser) {
  const context = await browser.newContext({
    viewport:{ width:390, height:844 },
    isMobile:true,
    hasTouch:true,
    reducedMotion:'reduce',
    locale:'hu-HU',
  });
  const page = await context.newPage();
  try {
    await page.goto(`${ORIGIN}?mag-functional-reduced=${Date.now()}`, {
      waitUntil:'domcontentloaded',
      timeout:60000,
    });
    await page.waitForTimeout(7500);
    const state = await page.evaluate(() => ({
      scheduler:document.documentElement.dataset.fxP0MotionSchedulerR490 || '',
      hero:Boolean(document.querySelector('#hero')),
      lead:(document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
      overflow:Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    }));
    assert.ok(state.hero && state.lead > 40, 'Reduced-motion hero unavailable');
    assert.ok(/reduced-motion-static|armed|committed/.test(state.scheduler), `Reduced-motion unexpectedly booted heavy runtime: ${state.scheduler}`);
    assert.ok(state.overflow <= 2, `Reduced-motion overflow ${state.overflow}`);
    return state;
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless:true,
    args:[
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage',
    ],
  });
  try {
    const report = {
      auditedSha:process.env.AUDITED_SHA || '',
      url:ORIGIN,
      desktop:await verifyNormal(browser, 'desktop', { width:1440, height:900 }, false),
      mobile:await verifyNormal(browser, 'mobile', { width:390, height:844 }, true),
      fallback:await verifyFallback(browser),
      reducedMotion:await verifyReduced(browser),
    };
    writeJson('report.json', report);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => {
  if (!fs.existsSync(path.join(OUT, 'report-failure.json'))) {
    writeJson('report-failure.json', {
      auditedSha:process.env.AUDITED_SHA || '',
      url:ORIGIN,
      error:String(error && error.stack || error),
    });
  }
  console.error(error && error.stack || error);
  process.exit(1);
});
