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
const HEART = '#hero .fx-mag-heart-hit-r252';
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
async function waitForNavigationMag(page) {
  await page.waitForFunction(sel => {
    const root = document.documentElement;
    return root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && document.querySelectorAll(sel).length === 1
      && document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length === 1;
  }, CANVAS, { timeout: 30000 });
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

    /* Authoritative P0 proof: do not click/tap/scroll/press a key before the
       renderer is ready. MAG must be alive from navigation by itself. */
    await waitForNavigationMag(page);
    assert.equal(await page.locator(CANVAS).count(), 1, `${name}: duplicate canvas`);
    assert.equal(await page.locator('#hero .fx-crystal-organism-r326-stage').count(), 1, `${name}: duplicate renderer stage`);
    assert.equal(await page.locator('.fx-reference-pause').count(), 0, `${name}: obsolete manual PAUSE UI returned`);
    const renderer = await page.evaluate(() => document.documentElement.dataset.fxCoreRenderer || '');
    assert.equal(renderer, 'single-webgl-crystal-organism-r326', `${name}: non-canonical renderer ${renderer}`);

    const before = await animationState(page);
    await page.waitForTimeout(900);
    const running = await animationState(page);
    assertStableAnimationIdentity(before, running, `${name}: navigation-autostart baseline`);
    const initialAdvance = Math.max(0, ...running.map(a => a.time - (before.find(b => b.id === a.id)?.time || 0)));
    assert.ok(running.some(a => a.state === 'running'), `${name}: no running compositor life after navigation autostart`);
    assert.ok(initialAdvance > 250, `${name}: navigation-owned MAG clock advance ${initialAdvance}`);

    await page.evaluate(() => {
      window.__fxFastCoreInteractionCount = 0;
      addEventListener('formatx:coreinteraction', () => { window.__fxFastCoreInteractionCount += 1; }, { passive: true });
    });
    const heart = page.locator(HEART).first();
    await heart.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForFunction(sel => document.querySelector(sel)?.dataset.fxHeartBound === 'true', HEART, { timeout: 10000 });
    await heart.click({ position: { x: 20, y: 20 }, timeout: 5000 });
    await page.waitForFunction(() => Number(window.__fxFastCoreInteractionCount || 0) > 0, null, { timeout: 5000 });
    await page.waitForTimeout(220);

    assert.equal(await page.locator(CANVAS).count(), 1, `${name}: interaction created duplicate canvas`);
    assert.equal(await page.locator('#hero .fx-crystal-organism-r326-stage').count(), 1, `${name}: interaction created duplicate renderer stage`);
    assert.equal(await page.locator('.fx-reference-pause').count(), 0, `${name}: interaction restored obsolete PAUSE UI`);
    const afterInteraction = await animationState(page);
    assertStableAnimationIdentity(running, afterInteraction, `${name}: interaction single-clock identity`);
    const interactionRewind = maxClockRewind(running, afterInteraction);
    assert.ok(interactionRewind < 80, `${name}: interaction rewound canonical MAG clock ${interactionRewind}`);

    const identities = animationIdentity(running);
    const coreInteractions = await page.evaluate(() => Number(window.__fxFastCoreInteractionCount || 0));
    assert.equal(errors.length, 0, `${name}: console/page errors: ${errors.join(' | ')}`);
    return {
      name,
      renderer,
      autoStart: true,
      manualPauseAbsent: true,
      initialAdvance,
      interactionRewind,
      coreInteractions,
      animationIdentity: identities,
    };
  } finally {
    await context.close();
  }
}
async function verifyReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', locale: 'hu-HU' });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}?p0-fast-reduced=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForNavigationMag(page);
    const state = await page.evaluate(sel => {
      const canvas = document.querySelector(sel);
      return {
        hero: Boolean(document.querySelector('#hero')),
        lead: (document.querySelector('#hero .hero-lead')?.textContent || '').trim().length,
        overflow: Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, document.body.scrollWidth - document.documentElement.clientWidth),
        canvasCount: document.querySelectorAll(sel).length,
        stageCount: document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
        pauseCount: document.querySelectorAll('.fx-reference-pause').length,
        renderer: document.documentElement.dataset.fxCoreRenderer || '',
        animations: canvas?.getAnimations().map(a => ({ name: String(a.animationName || ''), state: String(a.playState || ''), time: Number(a.currentTime || 0) })) || [],
      };
    }, CANVAS);
    assert.ok(state.hero && state.lead > 40, 'reduced-motion hero unavailable');
    assert.equal(state.canvasCount, 1, `reduced-motion navigation MAG canvas count ${state.canvasCount}`);
    assert.equal(state.stageCount, 1, `reduced-motion navigation MAG stage count ${state.stageCount}`);
    assert.equal(state.renderer, 'single-webgl-crystal-organism-r326', `reduced-motion non-canonical renderer ${state.renderer}`);
    assert.equal(state.pauseCount, 0, 'reduced-motion obsolete PAUSE UI returned');
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
function terminalDatasetValue(source, name) {
  const matches = Array.from(source.matchAll(new RegExp(`root\\.dataset\\.${name}\\s*=\\s*['\"]([^'\"]+)['\"]`, 'g')));
  assert.ok(matches.length > 0, `missing terminal dataset source contract ${name}`);
  return matches[matches.length - 1][1];
}
function ruleBody(css, selector, startMarker) {
  const start = startMarker ? css.indexOf(startMarker) : 0;
  assert.ok(start >= 0, `missing CSS start marker ${startMarker}`);
  const selectorIndex = css.indexOf(selector, start);
  assert.ok(selectorIndex >= 0, `missing CSS selector ${selector}`);
  const open = css.indexOf('{', selectorIndex + selector.length);
  const close = css.indexOf('}', open + 1);
  assert.ok(open >= 0 && close > open, `malformed CSS selector ${selector}`);
  return css.slice(open + 1, close);
}
function propertyValue(body, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*:\\s*([^;!]+?)\\s*!important\\s*;`, 'm'));
  assert.ok(match, `missing CSS property ${property}`);
  return match[1].trim().replace(/\\s+/g, ' ');
}
function compareRuleProperties(canonicalCss, blockingCss, selector, canonicalMarker, blockingMarker, properties) {
  const canonicalBody = ruleBody(canonicalCss, selector, canonicalMarker);
  const blockingBody = ruleBody(blockingCss, selector, blockingMarker);
  const result = {};
  for (const property of properties) {
    const expected = propertyValue(canonicalBody, property);
    const actual = propertyValue(blockingBody, property);
    assert.equal(actual, expected, `R503 first-frame ${selector} ${property} mismatch: ${actual} != ${expected}`);
    result[property] = actual;
  }
  return result;
}
function verifyClsSourceContract() {
  const canonical = fs.readFileSync('docs/scifi-ui/styles/formatx-first-frame-stability-r283.css', 'utf8');
  const blocking = fs.readFileSync('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css', 'utf8');
  const canonicalMarker = '@media (min-width: 901px)';
  const blockingMarker = '/* R503:';
  const heroSelector = 'html body.living-architecture main#main-content section#hero.scene.hero';
  const gridSelector = 'html body.living-architecture #hero > .hero-grid';
  assert.match(blocking, /production-r503-p0-first-paint-hero-ancestor-box/, 'R503 first-frame source marker missing');
  const hero = compareRuleProperties(canonical, blocking, heroSelector, canonicalMarker, blockingMarker, [
    'position', 'box-sizing', 'width', 'min-height', 'margin', 'padding', 'overflow'
  ]);
  const heroGrid = compareRuleProperties(canonical, blocking, gridSelector, canonicalMarker, blockingMarker, [
    'position', 'display', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
    'align-items', 'box-sizing', 'width', 'max-width', 'min-height', 'margin', 'padding', 'gap', 'overflow'
  ]);
  return {
    mode: 'source-geometry',
    owner: '.hero-copy',
    r502StableContribution: 0.05061276229893252,
    canonicalOwner: 'formatx-first-frame-stability-r283.css',
    blockingOwner: 'formatx-p0-first-paint-r490.css',
    hero,
    heroGrid,
  };
}
function verifySourceContracts() {
  const entry = fs.readFileSync('billing-worker/src/production-content-entry.js', 'utf8');
  const base = fs.readFileSync('billing-worker/src/production-content-base.js', 'utf8');
  const feedback = fs.readFileSync('billing-worker/src/production-feedback-entry.js', 'utf8');
  const scheduler = fs.readFileSync('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js', 'utf8');
  const contentRuntime = fs.readFileSync('docs/scifi-ui/scripts/formatx-content-runtime-loader-r241.js', 'utf8');
  const semanticValidator = fs.readFileSync('.github/scripts/validate-semantic-first-paint.cjs', 'utf8');
  const expectedContentGate = terminalDatasetValue(contentRuntime, 'fxContentRuntimeR241');
  const expectedStability = terminalDatasetValue(contentRuntime, 'fxFirstFrameStabilityR283');
  assert.match(base, /id="live-os-overview"/, 'semantic: Live OS canonical section missing');
  assert.match(base, /import baseWorker from ['\"]\.\/production-feedback-entry\.js['\"]/, 'semantic: current production content chain does not include feedback semantic owner');
  assert.match(feedback, /data-fx-award-proof/, 'semantic: Proof canonical section missing from feedback semantic owner');
  assert.match(semanticValidator, /function sourceTerminalDatasetValue\(name\)/, 'semantic: validator is not source-derived');
  assert.match(semanticValidator, /matches\[matches\.length - 1\]\[1\]/, 'semantic: validator does not use terminal canonical assignment');
  const p0FirstPaintMatch = entry.match(/const P0_FIRST_PAINT_LINK = '([^']+)'/);
  assert.ok(p0FirstPaintMatch, 'apex: current P0 first-paint link missing');
  assert.match(p0FirstPaintMatch[1], /data-fx-p0-first-paint-r\d+="true"/, 'apex: current P0 first-paint revision marker missing');
  assert.match(p0FirstPaintMatch[1], /\/scifi-ui\/styles\/formatx-p0-first-paint-r490\.css\?v=/, 'apex: current P0 first-paint asset missing');
  assert.match(entry, /platform-status\.js\?v=/, 'apex: platform status production owner missing');
  assert.match(entry, /const P0_MOTION_SCHEDULER = ['\"]\/scifi-ui\/scripts\/formatx-p0-motion-scheduler-r490\.js\?v=/, 'apex: production P0 motion scheduler asset missing');
  assert.match(entry, /function scheduleMotionRuntime\(html\)/, 'apex: production motion scheduler replacement function missing');
  assert.match(entry, /data-fx-motion-runtime-loader-r239/, 'apex: production motion runtime loader replacement anchor missing');
  assert.match(scheduler, /const SRC=['\"]\/scifi-ui\/scripts\/formatx-motion-runtime-loader-r239\.js\?v=/, 'apex: scheduler runtime loader asset missing');
  assert.match(scheduler, /prefers-reduced-motion:\s*reduce/, 'reduced-motion source contract missing media query');
  assert.match(scheduler, /reduced-motion-critical-mag-only-r536/, 'reduced-motion source contract missing critical-MAG-only scheduler state');
  assert.doesNotMatch(scheduler, /reduced-motion-static|lighthouse=1|force-prefers-reduced-motion/, 'obsolete reduced/audit scheduler bypass remains');
  return {
    semantic: true,
    apex: true,
    semanticOwner: 'production-feedback-entry.js',
    semanticExpectedContentGate: expectedContentGate,
    semanticExpectedStability: expectedStability,
    reducedMotionSource: true,
  };
}

(async () => {
  const report = { mode, head: process.env.GITHUB_SHA || '', chrome: CHROME };
  if (wants('semantic') || wants('apex')) Object.assign(report, verifySourceContracts());
  if (wants('cls')) report.cls = verifyClsSourceContract();
  const needsBrowser = wants('mag') || wants('overflow');
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
