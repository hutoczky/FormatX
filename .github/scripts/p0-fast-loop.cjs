'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const args = new Set(process.argv.slice(2));
const mode = [...args].find(v => v.startsWith('--')) || '--all-targeted';
const BASE = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const OUT = process.env.FORMATX_FAST_EVIDENCE_DIR || 'artifacts/p0-fast-loop';
const CANVAS = '#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas';
const PAUSE = '#hero .fx-reference-pause';
const ASK = '#hero .fx-reference-ask';
fs.mkdirSync(OUT, { recursive: true });

function wants(name) {
  return mode === '--all-targeted' || mode === `--${name}`;
}
function write(name, value) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2));
}
async function animationState(page) {
  return page.locator(CANVAS).evaluate(canvas => {
    window.__fxFastAnimSeq ||= 0;
    return canvas.getAnimations().map(a => {
      if (!a.__fxFastId) a.__fxFastId = `a${++window.__fxFastAnimSeq}`;
      return {
        id: a.__fxFastId,
        name: String(a.animationName || ''),
        time: Number(a.currentTime || 0),
        state: String(a.playState || ''),
        rate: Number(a.playbackRate || 0),
      };
    });
  });
}
function animationIdentity(state) {
  const result = {};
  for (const animation of state) {
    const name = animation.name || '<unnamed>';
    (result[name] ||= []).push(animation.id);
  }
  for (const ids of Object.values(result)) ids.sort();
  return result;
}
function assertStableAnimationIdentity(reference, current, label) {
  const expected = animationIdentity(reference);
  const actual = animationIdentity(current);
  const names = Object.keys(expected);
  assert.ok(names.length >= 1, `${label}: no animation identity to compare`);
  for (const name of names) {
    assert.deepEqual(actual[name] || [], expected[name], `${label}: animation identity changed for ${name}`);
  }
}
function maxClockRewind(before, after) {
  const byId = new Map(after.map(a => [a.id, a.time]));
  return Math.max(0, ...before.map(a => {
    const next = byId.get(a.id);
    return typeof next === 'number' ? a.time - next : 0;
  }));
}
async function activateMag(page) {
  const target = page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
  await target.waitFor({ state: 'visible', timeout: 20000 });
  await target.click();
  await page.waitForFunction(sel => (
    document.documentElement.dataset.fxCrystalOrganismR326 === 'ready'
    && document.querySelectorAll(sel).length === 1
  ), CANVAS, { timeout: 30000 });
}
async function verifyMagContext(browser, name, viewport, mobile) {
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
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !/WebGL|WebGPU|GPU/i.test(m.text())) errors.push(m.text()); });
  try {
    await page.goto(`${BASE}${BASE.includes('?') ? '&' : '?'}p0-fast-mag=${name}-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await activateMag(page);
    assert.equal(await page.locator(CANVAS).count(), 1, `${name}: duplicate canvas`);
    assert.equal(await page.locator('#hero .fx-crystal-organism-r326-stage').count(), 1, `${name}: duplicate renderer stage`);
    const renderer = await page.evaluate(() => document.documentElement.dataset.fxCoreRenderer || '');
    assert.equal(renderer, 'single-webgl-crystal-organism-r326', `${name}: non-canonical renderer ${renderer}`);

    const before = await animationState(page);
    await page.waitForTimeout(900);
    const running = await animationState(page);
    assertStableAnimationIdentity(before, running, `${name}: baseline`);
    const initialAdvance = Math.max(0, ...running.map(a => a.time - (before.find(b => b.id === a.id)?.time || 0)));
    assert.ok(running.some(a => a.state === 'running'), `${name}: no running compositor animation`);
    assert.ok(initialAdvance > 250, `${name}: baseline MAG clock advance ${initialAdvance}`);

    const pause = page.locator(PAUSE).first();
    assert.equal(await pause.isVisible(), true, `${name}: PAUSE missing`);
    await pause.click();
    await page.waitForFunction(sel => document.querySelector(sel)?.dataset.paused === 'true', PAUSE, { timeout: 3000 });
    const p1 = await animationState(page);
    assertStableAnimationIdentity(running, p1, `${name}: pause entry`);
    await page.waitForTimeout(700);
    const p2 = await animationState(page);
    assertStableAnimationIdentity(running, p2, `${name}: paused hold`);
    const pauseDelta = Math.max(0, ...p2.map(a => Math.abs(a.time - (p1.find(b => b.id === a.id)?.time ?? a.time))));
    assert.ok(p2.every(a => a.state !== 'running'), `${name}: PAUSE left a compositor animation running`);
    assert.ok(pauseDelta < 80, `${name}: PAUSE clock drift ${pauseDelta}`);

    await pause.click();
    await page.waitForFunction(sel => document.querySelector(sel)?.dataset.paused !== 'true', PAUSE, { timeout: 3000 });
    const resumeStart = await animationState(page);
    assertStableAnimationIdentity(running, resumeStart, `${name}: resume entry`);
    const resumeRewind = maxClockRewind(p2, resumeStart);
    assert.ok(resumeRewind < 80, `${name}: RESUME rewound canonical clock ${resumeRewind}`);
    const startById = new Map(resumeStart.map(a => [a.id, a.time]));
    let resumeAdvance = 0;
    let resumedState = resumeStart;
    for (const wait of [100, 150, 250, 200, 200, 300, 400]) {
      await page.waitForTimeout(wait);
      resumedState = await animationState(page);
      assertStableAnimationIdentity(running, resumedState, `${name}: resumed clock`);
      resumeAdvance = Math.max(resumeAdvance, ...resumedState.map(a => a.time - (startById.get(a.id) ?? a.time)));
      if (resumeAdvance > 200) break;
    }
    assert.ok(resumedState.some(a => a.state === 'running'), `${name}: RESUME state not running`);
    assert.ok(resumeAdvance > 200, `${name}: RESUME clock advance ${resumeAdvance}`);

    const identities = animationIdentity(running);
    assert.equal(errors.length, 0, `${name}: console/page errors: ${errors.join(' | ')}`);
    return { name, renderer, initialAdvance, pauseDelta, resumeRewind, resumeAdvance, animationIdentity: identities };
  } finally {
    await context.close();
  }
}
async function verifyReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', locale: 'hu-HU' });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}?p0-fast-reduced=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1800);
    const state = await page.evaluate(sel => {
      const canvas = document.querySelector(sel);
      return {
        hero: Boolean(document.querySelector('#hero')),
        lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
        overflow: Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, document.body.scrollWidth - document.documentElement.clientWidth),
        scheduler: document.documentElement.dataset.fxP0MotionSchedulerR490 || '',
        canvasCount: document.querySelectorAll(sel).length,
        stageCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
        animations: canvas?.getAnimations().map(a => ({ name: String(a.animationName || ''), state: String(a.playState || ''), time: Number(a.currentTime || 0) })) || [],
      };
    }, CANVAS);
    assert.ok(state.hero && state.lead > 40, 'reduced-motion hero unavailable');
    assert.match(state.scheduler, /reduced-motion-static|armed|committed/, `reduced-motion scheduler contract invalid: ${state.scheduler}`);
    assert.ok(state.canvasCount <= 1, `reduced-motion duplicate canvas ${state.canvasCount}`);
    assert.ok(state.stageCount <= 1, `reduced-motion duplicate renderer stage ${state.stageCount}`);
    assert.ok(state.animations.every(a => a.state !== 'running'), `reduced-motion left compositor animation running: ${JSON.stringify(state.animations)}`);
    assert.ok(state.overflow <= 1, `reduced-motion overflow ${state.overflow}`);
    return state;
  } finally {
    await context.close();
  }
}
async function openThought(page) {
  const ask = page.locator(ASK).first();
  await ask.waitFor({ state: 'visible', timeout: 20000 });
  await ask.click();
  await page.waitForFunction(() => {
    const node = document.querySelector('.fx-organism-thought');
    return node && node.hidden === false && getComputedStyle(node).display !== 'none';
  }, null, { timeout: 10000 });
}
async function verifyOverflowContext(browser, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1, locale: 'hu-HU' });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}?p0-fast-overflow=${viewport.width}x${viewport.height}-${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await openThought(page);
    const state = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const footer = document.querySelector('.site-footer');
      const thought = document.querySelector('#fx-organism-thought-panel, .fx-organism-thought');
      const rr = root.getBoundingClientRect();
      const fr = footer?.getBoundingClientRect();
      const tr = thought?.getBoundingClientRect();
      return {
        clientWidth: root.clientWidth,
        docWidth: root.scrollWidth,
        bodyWidth: body.scrollWidth,
        rootRectWidth: rr.width,
        footer: fr ? { left: fr.left, right: fr.right, width: fr.width, box: getComputedStyle(footer).boxSizing } : null,
        thought: tr ? { left: tr.left, right: tr.right, width: tr.width, box: getComputedStyle(thought).boxSizing } : null,
      };
    });
    assert.equal(state.docWidth, state.clientWidth, `${viewport.width}x${viewport.height}: document overflow ${JSON.stringify(state)}`);
    assert.ok(state.bodyWidth <= state.clientWidth, `${viewport.width}x${viewport.height}: body overflow ${JSON.stringify(state)}`);
    assert.ok(!state.footer || (state.footer.left >= -1 && state.footer.right <= state.clientWidth + 1), `${viewport.width}x${viewport.height}: footer escape ${JSON.stringify(state.footer)}`);
    assert.ok(!state.thought || (state.thought.left >= -1 && state.thought.right <= state.clientWidth + 1), `${viewport.width}x${viewport.height}: thought escape ${JSON.stringify(state.thought)}`);
    return { viewport, ...state };
  } finally {
    await context.close();
  }
}
async function verifyCls(browser) {
  const context = await browser.newContext({ viewport: { width: 1350, height: 940 }, locale: 'hu-HU' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__fxFastShifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__fxFastShifts.push({ value: entry.value, startTime: entry.startTime, sources: (entry.sources || []).map(s => ({ node: s.node?.id ? `#${s.node.id}` : s.node?.className ? `.${String(s.node.className).trim().replace(/\s+/g,'.')}` : s.node?.tagName || '', previousRect: s.previousRect, currentRect: s.currentRect })) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  try {
    await page.goto(`${BASE}?p0-fast-cls=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3500);
    return page.evaluate(() => ({ cls: (window.__fxFastShifts || []).reduce((s, e) => s + e.value, 0), shifts: window.__fxFastShifts || [] }));
  } finally { await context.close(); }
}
function verifySourceContracts() {
  const entry = fs.readFileSync('billing-worker/src/production-content-entry.js', 'utf8');
  const base = fs.readFileSync('billing-worker/src/production-content-base.js', 'utf8');
  const feedback = fs.readFileSync('billing-worker/src/production-feedback-entry.js', 'utf8');
  assert.match(base, /id="live-os-overview"/, 'semantic: Live OS canonical section missing');
  assert.match(base, /import baseWorker from ['"]\.\/production-feedback-entry\.js['"]/, 'semantic: current production content chain does not include feedback semantic owner');
  assert.match(feedback, /data-fx-award-proof/, 'semantic: Proof canonical section missing from feedback semantic owner');
  assert.match(entry, /data-fx-p0-first-paint-r501/, 'apex: current P0 first-paint owner missing');
  assert.match(entry, /platform-status\.js\?v=/, 'apex: platform status production owner missing');
  return { semantic: true, apex: true, semanticOwner: 'production-feedback-entry.js' };
}

(async () => {
  const report = { mode, head: process.env.GITHUB_SHA || '', chrome: CHROME };
  if (wants('semantic') || wants('apex')) Object.assign(report, verifySourceContracts());
  const needsBrowser = wants('mag') || wants('overflow') || wants('cls') || mode === '--all-targeted';
  if (needsBrowser) {
    const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    try {
      if (wants('mag')) {
        report.mag = {
          desktop: await verifyMagContext(browser, 'desktop', { width: 1440, height: 900 }, false),
          mobile: await verifyMagContext(browser, 'mobile', { width: 390, height: 844 }, true),
          reducedMotion: await verifyReducedMotion(browser),
        };
      }
      if (wants('overflow')) {
        report.overflow = [];
        for (const vp of [
          { width: 320, height: 568 },
          { width: 360, height: 800 },
          { width: 375, height: 812 },
          { width: 390, height: 844 },
          { width: 412, height: 915 },
          { width: 844, height: 390 },
        ]) report.overflow.push(await verifyOverflowContext(browser, vp, true));
      }
      if (wants('cls')) report.cls = await verifyCls(browser);
    } finally {
      await browser.close();
    }
  }
  write('report.json', report);
  console.log(JSON.stringify(report, null, 2));
})().catch(error => {
  write('failure.json', { mode, error: String(error && error.stack || error) });
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
