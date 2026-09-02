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
  return page.evaluate(sel => {
    const canvas = document.querySelector(sel);
    const pause = document.querySelector('#hero .fx-reference-pause');
    return {
      at:performance.now(),
      visibilityState:document.visibilityState,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
      pauseDataset:pause ? { ...pause.dataset } : null,
      htmlDataset:{ ...document.documentElement.dataset },
      bodyDataset:document.body ? { ...document.body.dataset } : null,
      animations:canvas && canvas.getAnimations ? canvas.getAnimations().map(a => ({
        animationName:String(a.animationName || ''),
        currentTime:typeof a.currentTime === 'number' ? a.currentTime : null,
        playState:String(a.playState || ''),
        startTime:typeof a.startTime === 'number' ? a.startTime : null,
        playbackRate:typeof a.playbackRate === 'number' ? a.playbackRate : null,
      })) : [],
    };
  }, CANVAS);
}

async function activate(page) {
  const target = page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
  await target.waitFor({ state:'visible', timeout:30000 });
  const box = await target.boundingBox();
  assert.ok(box && box.width >= 16 && box.height >= 16, 'MAG activation target has no usable hit box');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction(sel => document.documentElement.dataset.fxCrystalOrganismR326 === 'ready' && document.querySelectorAll(sel).length === 1, CANVAS, { timeout:60000 });
}

async function sampleClock(page, delay = 900) {
  const first = await page.locator(CANVAS).evaluate(canvas => ({
    animations:canvas.getAnimations().map(a => ({ name:String(a.animationName || ''), time:Number(a.currentTime || 0), state:a.playState })),
    root:document.documentElement.dataset.fxCoreRenderer || '',
    size:(() => { const r=canvas.getBoundingClientRect(); return { w:r.width, h:r.height }; })(),
  }));
  await page.waitForTimeout(delay);
  const second = await page.locator(CANVAS).evaluate(canvas => ({
    animations:canvas.getAnimations().map(a => ({ name:String(a.animationName || ''), time:Number(a.currentTime || 0), state:a.playState })),
    root:document.documentElement.dataset.fxCoreRenderer || '',
    size:(() => { const r=canvas.getBoundingClientRect(); return { w:r.width, h:r.height }; })(),
  }));
  return { first, second, maxAdvance:Math.max(0, ...second.animations.map((a,i) => a.time - (first.animations[i]?.time || 0))) };
}

async function verifyNormal(browser, name, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile:mobile, hasTouch:mobile, deviceScaleFactor:mobile ? 2 : 1, locale:'hu-HU', colorScheme:'dark', reducedMotion:'no-preference' });
  const page = await context.newPage();
  const errors = [], failed = [];
  const evidence = { name, viewport, mobile, phases:{} };
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ''}`));
  try {
    await page.goto(`${ORIGIN}${ORIGIN.includes('?') ? '&' : '?'}mag-functional=${name}-${Date.now()}`, { waitUntil:'domcontentloaded', timeout:60000 });
    await activate(page);
    evidence.phases.activated = await runtimeState(page);
    assert.equal(await page.locator(CANVAS).count(), 1, `${name}: renderer duplicated`);

    const clock = await sampleClock(page, 1000);
    evidence.phases.initialClock = clock;
    assert.equal(clock.second.root, 'single-webgl-crystal-organism-r326', `${name}: non-canonical renderer`);
    assert.ok(clock.second.size.w > 220 && clock.second.size.h > 220, `${name}: canvas too small ${JSON.stringify(clock.second.size)}`);
    assert.ok(clock.second.animations.some(a => a.state === 'running'), `${name}: no running MAG animation`);
    assert.ok(clock.maxAdvance > 300, `${name}: MAG animation clock did not advance: ${clock.maxAdvance}`);

    const ask = page.locator(ASK).first();
    assert.equal(await ask.isVisible(), true, `${name}: ASK missing`);
    const askHit = await ask.evaluate(button => {
      const r=button.getBoundingClientRect(), hit=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      return { w:r.width, h:r.height, owns:Boolean(hit && button.contains(hit)), label:(button.textContent || button.getAttribute('aria-label') || '').trim() };
    });
    evidence.ask = askHit;
    assert.ok(askHit.w >= 40 && askHit.h >= 40 && askHit.owns, `${name}: ASK hit target invalid ${JSON.stringify(askHit)}`);

    const pause = page.locator(PAUSE).first();
    assert.equal(await pause.isVisible(), true, `${name}: PAUSE missing`);
    await pause.click();
    await page.waitForFunction(sel => document.querySelector(sel)?.dataset.paused === 'true', PAUSE, { timeout:5000 });
    evidence.phases.pausedStart = await runtimeState(page);
    const paused1 = await page.locator(CANVAS).evaluate(c => c.getAnimations().map(a => Number(a.currentTime || 0)));
    await page.waitForTimeout(700);
    const paused2 = await page.locator(CANVAS).evaluate(c => c.getAnimations().map(a => Number(a.currentTime || 0)));
    const pausedDelta = Math.max(0, ...paused2.map((t,i) => Math.abs(t - (paused1[i] || 0))));
    evidence.phases.pausedEnd = await runtimeState(page);
    evidence.pauseDeltaMs = pausedDelta;
    assert.ok(pausedDelta < 80, `${name}: PAUSE did not stop animation ${pausedDelta}`);

    await pause.click();
    await page.waitForFunction(sel => document.querySelector(sel)?.dataset.paused !== 'true', PAUSE, { timeout:5000 });
    evidence.phases.resumeStart = await runtimeState(page);
    const resumed = await sampleClock(page, 700);
    evidence.phases.resumeEnd = await runtimeState(page);
    evidence.resumeAdvanceMs = resumed.maxAdvance;
    assert.ok(resumed.maxAdvance > 200, `${name}: RESUME did not restart animation`);

    const gl = await page.locator(CANVAS).evaluate(canvas => {
      const ctx=canvas.getContext('webgl2') || canvas.getContext('webgl');
      return { hasContext:Boolean(ctx), error:ctx ? ctx.getError() : -1 };
    });
    evidence.gl = gl;
    assert.equal(gl.hasContext, true, `${name}: WebGL context missing`);
    assert.equal(gl.error, 0, `${name}: WebGL error ${gl.error}`);
    assert.equal(errors.length, 0, `${name}: console/page errors ${errors.join(' | ')}`);
    assert.equal(failed.length, 0, `${name}: request failures ${failed.join(' | ')}`);

    evidence.screenshotError = await safeScreenshot(page, `${name}.png`);
    return { name, renderer:clock.second.root, size:clock.second.size, animationAdvanceMs:clock.maxAdvance, pauseDeltaMs:pausedDelta, resumeAdvanceMs:resumed.maxAdvance, ask:askHit, gl, screenshotError:evidence.screenshotError };
  } catch (error) {
    evidence.error = String(error && error.stack || error);
    evidence.errors = errors;
    evidence.requestFailures = failed;
    try { evidence.failureState = await runtimeState(page); } catch (stateError) { evidence.failureStateError = String(stateError); }
    evidence.screenshotError = await safeScreenshot(page, `${name}-failure.png`);
    writeJson('report-failure.json', { auditedSha:process.env.AUDITED_SHA || '', url:ORIGIN, failure:evidence });
    throw error;
  } finally {
    await context.close();
  }
}

async function verifyFallback(browser) {
  const context = await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, locale:'hu-HU' });
  await context.addInitScript(() => { const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){ if(['webgl','webgl2','experimental-webgl'].includes(type)) return null; return original.call(this,type,...args); }; });
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(`${ORIGIN}?mag-functional-fallback=${Date.now()}`, { waitUntil:'domcontentloaded', timeout:60000 });
    const target=page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
    if (await target.isVisible()) await target.click().catch(()=>{});
    await page.waitForTimeout(1800);
    const state=await page.evaluate(()=>({ hero:Boolean(document.querySelector('#hero')), lead:(document.querySelector('#hero .hero-lead')?.textContent||'').trim().length, live:Boolean(document.querySelector('#live-os,#live-os-overview,[data-fx-live-os]')), proof:Boolean(document.querySelector('[data-fx-award-proof],.fx-proof-grid')), overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth, renderer:document.documentElement.dataset.fxCoreRenderer||'', fallback:document.documentElement.dataset.fxCrystalOrganismR326||document.documentElement.dataset.fxCoreReal3d||'' }));
    assert.ok(state.hero && state.lead > 40 && state.live && state.proof, 'WebGL fallback lost meaningful product content');
    assert.ok(state.overflow <= 2, `WebGL fallback overflow ${state.overflow}`);
    assert.equal(errors.length,0,`WebGL fallback page errors ${errors.join(' | ')}`);
    return state;
  } finally { await context.close(); }
}

async function verifyReduced(browser) {
  const context=await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, reducedMotion:'reduce', locale:'hu-HU' });
  const page=await context.newPage();
  try {
    await page.goto(`${ORIGIN}?mag-functional-reduced=${Date.now()}`, { waitUntil:'domcontentloaded', timeout:60000 });
    await page.waitForTimeout(7500);
    const state=await page.evaluate(()=>({ scheduler:document.documentElement.dataset.fxP0MotionSchedulerR490||'', hero:Boolean(document.querySelector('#hero')), lead:(document.querySelector('#hero .hero-lead')?.textContent||'').trim().length, overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth }));
    assert.ok(state.hero && state.lead > 40, 'Reduced-motion hero unavailable');
    assert.ok(/reduced-motion-static|armed|committed/.test(state.scheduler), `Reduced-motion unexpectedly booted heavy runtime: ${state.scheduler}`);
    assert.ok(state.overflow <= 2, `Reduced-motion overflow ${state.overflow}`);
    return state;
  } finally { await context.close(); }
}

(async()=>{
  const browser=await chromium.launch({ headless:true, args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--disable-dev-shm-usage'] });
  try {
    const report={ auditedSha:process.env.AUDITED_SHA||'', url:ORIGIN, desktop:await verifyNormal(browser,'desktop',{width:1440,height:900},false), mobile:await verifyNormal(browser,'mobile',{width:390,height:844},true), fallback:await verifyFallback(browser), reducedMotion:await verifyReduced(browser) };
    writeJson('report.json', report);
    console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(error=>{
  if (!fs.existsSync(path.join(OUT,'report-failure.json'))) writeJson('report-failure.json',{ auditedSha:process.env.AUDITED_SHA||'', url:ORIGIN, error:String(error && error.stack || error) });
  console.error(error && error.stack || error);
  process.exit(1);
});
