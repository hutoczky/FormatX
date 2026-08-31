'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium, firefox, webkit, devices } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const EVIDENCE = process.env.P0_EVIDENCE_DIR || 'p0-evidence';
const SHOTS = path.join(EVIDENCE, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const failures = [];
const results = [];

function assert(value, message) {
  if (!value) throw new Error(message);
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function recordFailure(scope, error) {
  failures.push({ scope, message: String(error?.stack || error) });
  console.error(`FAIL ${scope}: ${error?.stack || error}`);
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(900);
}

async function scrollExercise(page) {
  const height = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0));
  const max = Math.max(0, height - (await page.evaluate(() => innerHeight)));
  for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round(max * ratio));
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
}

async function layoutProbe(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const overflow = Math.max(root.scrollWidth, body?.scrollWidth || 0) - root.clientWidth;
    const selectors = 'h1,h2,h3,h4,p,li,a,button,label,[role="button"],[role="link"]';
    const clipped = [];
    for (const el of document.querySelectorAll(selectors)) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0 || r.width < 1 || r.height < 1) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const xClip = el.scrollWidth > el.clientWidth + 3 && ['hidden', 'clip'].includes(cs.overflowX);
      const yClip = el.scrollHeight > el.clientHeight + 3 && ['hidden', 'clip'].includes(cs.overflowY);
      if (xClip || yClip) {
        clipped.push({
          tag: el.tagName,
          id: el.id || null,
          className: String(el.className || '').slice(0, 120),
          text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
          xClip,
          yClip,
          client: [el.clientWidth, el.clientHeight],
          scroll: [el.scrollWidth, el.scrollHeight]
        });
      }
    }
    return {
      overflow,
      clipped: clipped.slice(0, 30),
      title: document.title,
      lang: root.lang || null,
      textLength: (body?.innerText || '').trim().length,
      mainCount: document.querySelectorAll('main').length,
      h1Count: document.querySelectorAll('h1').length,
      renderer: root.dataset.fxRenderer || root.dataset.renderer || null
    };
  });
}

async function touchProbe(page) {
  return page.evaluate(() => {
    const bad = [];
    const nodes = document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])');
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || r.width < 1 || r.height < 1) continue;
      if (r.bottom < 0 || r.top > innerHeight * 2) continue;
      const isPrimary = el.matches('button,[role="button"],input,select,textarea');
      const min = isPrimary ? 44 : 24;
      if (r.width + 0.5 < min || r.height + 0.5 < min) {
        bad.push({ tag: el.tagName, id: el.id || null, text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80), size: [Math.round(r.width), Math.round(r.height)], min });
      }
    }
    return bad.slice(0, 30);
  });
}

function attachRuntimeCollectors(page, bucket) {
  page.on('pageerror', error => bucket.pageErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => {
    const type = request.resourceType();
    if (['document', 'script', 'stylesheet', 'image', 'font', 'media'].includes(type)) {
      bucket.requestFailures.push(`${type} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`);
    }
  });
  page.on('response', response => {
    const type = response.request().resourceType();
    if (response.status() >= 400 && ['document', 'script', 'stylesheet', 'image', 'font', 'media'].includes(type)) {
      bucket.httpErrors.push(`${response.status()} ${type} ${response.url()}`);
    }
  });
}

async function runViewport(browser, browserName, profile) {
  const bucket = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    isMobile: !!profile.mobile,
    hasTouch: !!profile.touch,
    deviceScaleFactor: profile.dpr || 1,
    locale: 'hu-HU',
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  attachRuntimeCollectors(page, bucket);
  try {
    const response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    assert(response && response.status() < 400, `${browserName}/${profile.name}: document status ${response?.status()}`);
    await settle(page);
    await scrollExercise(page);
    const layout = await layoutProbe(page);
    assert(layout.overflow <= 1, `${browserName}/${profile.name}: horizontal overflow ${layout.overflow}px`);
    assert(layout.clipped.length === 0, `${browserName}/${profile.name}: clipped text ${JSON.stringify(layout.clipped.slice(0, 8))}`);
    assert(bucket.pageErrors.length === 0, `${browserName}/${profile.name}: page errors ${bucket.pageErrors.join(' | ')}`);
    assert(bucket.consoleErrors.length === 0, `${browserName}/${profile.name}: console errors ${bucket.consoleErrors.join(' | ')}`);
    assert(bucket.requestFailures.length === 0, `${browserName}/${profile.name}: request failures ${bucket.requestFailures.join(' | ')}`);
    assert(bucket.httpErrors.length === 0, `${browserName}/${profile.name}: HTTP errors ${bucket.httpErrors.join(' | ')}`);
    assert(layout.textLength >= 300 && layout.mainCount >= 1 && layout.h1Count >= 1, `${browserName}/${profile.name}: semantic/readable content missing ${JSON.stringify(layout)}`);
    let badTouch = [];
    if (profile.touch || profile.mobile) {
      badTouch = await touchProbe(page);
      assert(badTouch.length === 0, `${browserName}/${profile.name}: undersized touch targets ${JSON.stringify(badTouch.slice(0, 8))}`);
    }
    const shot = path.join(SHOTS, `${slug(browserName)}-${slug(profile.name)}.png`);
    await page.screenshot({ path: shot, fullPage: false, animations: 'disabled' });
    results.push({ case: 'viewport', browser: browserName, profile, layout, badTouch, runtime: bucket, screenshot: shot, pass: true });
    console.log(`PASS viewport ${browserName}/${profile.name}`);
  } finally {
    await context.close();
  }
}

async function keyboardGate(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU' });
  const page = await context.newPage();
  const bucket = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
  attachRuntimeCollectors(page, bucket);
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settle(page);
    const total = await page.locator('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').count();
    assert(total > 0, 'keyboard: no focusable controls');
    const visited = new Set();
    let visibleFocusCount = 0;
    const steps = Math.min(Math.max(total + 8, 24), 90);
    for (let i = 0; i < steps; i++) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body || el === document.documentElement) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const ident = `${el.tagName}#${el.id || ''}.${String(el.className || '').slice(0, 80)}:${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}`;
        const visibleFocus = (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none') || cs.boxShadow !== 'none';
        return { ident, visibleFocus, inViewport: r.width > 0 && r.height > 0 && r.bottom >= 0 && r.top <= innerHeight };
      });
      if (!state) continue;
      visited.add(state.ident);
      if (state.visibleFocus) visibleFocusCount++;
    }
    const requiredVisited = Math.min(total, 12);
    assert(visited.size >= requiredVisited, `keyboard: only ${visited.size}/${requiredVisited} controls reached by Tab`);
    assert(visibleFocusCount >= Math.max(1, Math.ceil(visited.size * 0.75)), `keyboard: visible focus insufficient ${visibleFocusCount}/${visited.size}`);
    assert(bucket.pageErrors.length === 0 && bucket.consoleErrors.length === 0, `keyboard runtime errors: ${JSON.stringify(bucket)}`);
    results.push({ case: 'keyboard', total, visited: visited.size, visibleFocusCount, pass: true });
    console.log(`PASS keyboard ${visited.size} focus targets, ${visibleFocusCount} visibly focused`);
  } finally {
    await context.close();
  }
}

async function reducedMotionGate(browser, mobile = false) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: 'reduce',
    locale: 'hu-HU'
  });
  const page = await context.newPage();
  const bucket = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
  attachRuntimeCollectors(page, bucket);
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settle(page);
    const state = await page.evaluate(() => ({
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      infinite: document.documentElement.dataset.fxInfinite || null,
      overflow: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0) - document.documentElement.clientWidth
    }));
    assert(state.matches, 'reduced-motion media query not active');
    if (state.infinite) assert(/reduced|disabled|off/i.test(state.infinite), `reduced-motion: infinite runtime still active (${state.infinite})`);
    assert(state.overflow <= 1, `reduced-motion: overflow ${state.overflow}`);
    assert(bucket.pageErrors.length === 0 && bucket.consoleErrors.length === 0, `reduced-motion runtime errors: ${JSON.stringify(bucket)}`);
    results.push({ case: 'reduced-motion', mobile, state, pass: true });
    console.log(`PASS reduced-motion ${mobile ? 'mobile' : 'desktop'}`);
  } finally {
    await context.close();
  }
}

async function noJsGate(browser, name, mobile = false) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
    javaScriptEnabled: false,
    locale: 'hu-HU'
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    assert(response && response.status() < 400, `no-JS ${name}: document status ${response?.status()}`);
    const state = await layoutProbe(page);
    assert(state.textLength >= 300, `no-JS ${name}: only ${state.textLength} readable characters`);
    assert(state.mainCount >= 1 && state.h1Count >= 1, `no-JS ${name}: semantic main/H1 missing`);
    assert(state.overflow <= 1, `no-JS ${name}: horizontal overflow ${state.overflow}`);
    results.push({ case: 'no-js', browser: name, mobile, state, pass: true });
    console.log(`PASS no-JS ${name}/${mobile ? 'mobile' : 'desktop'}`);
  } finally {
    await context.close();
  }
}

async function zoom200Gate(browser, name) {
  const context = await browser.newContext({ viewport: { width: 640, height: 450 }, deviceScaleFactor: 2, locale: 'hu-HU' });
  const page = await context.newPage();
  const bucket = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
  attachRuntimeCollectors(page, bucket);
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settle(page);
    await scrollExercise(page);
    const state = await layoutProbe(page);
    assert(state.overflow <= 1, `200% zoom/reflow ${name}: overflow ${state.overflow}`);
    assert(state.clipped.length === 0, `200% zoom/reflow ${name}: clipped text ${JSON.stringify(state.clipped.slice(0, 8))}`);
    assert(bucket.pageErrors.length === 0 && bucket.consoleErrors.length === 0, `200% zoom/reflow ${name}: runtime errors ${JSON.stringify(bucket)}`);
    results.push({ case: 'zoom-200-reflow', browser: name, state, pass: true, note: 'Automated reflow proxy: 640 CSS px viewport at DPR 2. Real-browser 200% zoom remains a manual/device acceptance check.' });
    console.log(`PASS automated 200% zoom/reflow proxy ${name}`);
  } finally {
    await context.close();
  }
}

async function webglFallbackGate() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--disable-webgl', '--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU' });
  const page = await context.newPage();
  const bucket = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
  attachRuntimeCollectors(page, bucket);
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settle(page);
    const state = await layoutProbe(page);
    assert(state.textLength >= 300 && state.mainCount >= 1, 'WebGL fallback: core content unreadable');
    assert(state.overflow <= 1, `WebGL fallback: overflow ${state.overflow}`);
    assert(!/webgl/i.test(String(state.renderer || '')) || /fallback|off|disabled/i.test(String(state.renderer || '')), `WebGL fallback: renderer still reports ${state.renderer}`);
    assert(bucket.pageErrors.length === 0 && bucket.consoleErrors.length === 0, `WebGL fallback runtime errors: ${JSON.stringify(bucket)}`);
    results.push({ case: 'webgl-fallback', state, pass: true });
    console.log(`PASS WebGL fallback renderer=${state.renderer || 'unspecified'}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runBrowserMatrix() {
  const fullMatrix = [
    { name: 'phone-320x568', width: 320, height: 568, mobile: true, touch: true, dpr: 2 },
    { name: 'phone-360x800', width: 360, height: 800, mobile: true, touch: true, dpr: 2 },
    { name: 'phone-390x844', width: 390, height: 844, mobile: true, touch: true, dpr: 2 },
    { name: 'phone-412x915', width: 412, height: 915, mobile: true, touch: true, dpr: 2 },
    { name: 'phone-landscape-844x390', width: 844, height: 390, mobile: true, touch: true, dpr: 2 },
    { name: 'tablet-1024x768', width: 1024, height: 768, touch: true, dpr: 1 },
    { name: 'desktop-1080p', width: 1920, height: 1080, dpr: 1 },
    { name: 'desktop-1440p', width: 2560, height: 1440, dpr: 1 },
    { name: 'ultrawide-3440x1440', width: 3440, height: 1440, dpr: 1 },
    { name: 'desktop-4k', width: 3840, height: 2160, dpr: 1 }
  ];

  const launchers = [
    { name: 'Chrome', launch: () => chromium.launch({ headless: true, channel: 'chrome' }) },
    { name: 'Firefox', launch: () => firefox.launch({ headless: true }) },
    { name: 'Edge', launch: () => chromium.launch({ headless: true, channel: 'msedge' }) },
    { name: 'WebKit', launch: () => webkit.launch({ headless: true }) }
  ];

  const chrome = await launchers[0].launch();
  try {
    for (const profile of fullMatrix) {
      try { await runViewport(chrome, 'Chrome', profile); } catch (error) { recordFailure(`Chrome/${profile.name}`, error); }
    }
    for (const gate of [
      () => keyboardGate(chrome),
      () => reducedMotionGate(chrome, false),
      () => reducedMotionGate(chrome, true),
      () => noJsGate(chrome, 'Chrome', false),
      () => noJsGate(chrome, 'Chrome', true),
      () => zoom200Gate(chrome, 'Chrome')
    ]) {
      try { await gate(); } catch (error) { recordFailure('Chrome/P0-special', error); }
    }
  } finally {
    await chrome.close();
  }

  const crossProfiles = [
    { name: 'desktop-1440x900', width: 1440, height: 900, dpr: 1 },
    { name: 'mobile-390x844', width: 390, height: 844, mobile: true, touch: true, dpr: 2 }
  ];

  for (const entry of launchers.slice(1)) {
    const browser = await entry.launch();
    try {
      for (const profile of crossProfiles) {
        try { await runViewport(browser, entry.name, profile); } catch (error) { recordFailure(`${entry.name}/${profile.name}`, error); }
      }
      try { await noJsGate(browser, entry.name, false); } catch (error) { recordFailure(`${entry.name}/no-JS`, error); }
      try { await zoom200Gate(browser, entry.name); } catch (error) { recordFailure(`${entry.name}/zoom-200`, error); }
    } finally {
      await browser.close();
    }
  }

  try { await webglFallbackGate(); } catch (error) { recordFailure('Chrome/WebGL-fallback', error); }

  const mobileSafari = await webkit.launch({ headless: true });
  try {
    const iphone = devices['iPhone 14'] || devices['iPhone 13'];
    if (iphone) {
      const context = await mobileSafari.newContext({ ...iphone, locale: 'hu-HU' });
      const page = await context.newPage();
      const bucket = { pageErrors: [], consoleErrors: [], requestFailures: [], httpErrors: [] };
      attachRuntimeCollectors(page, bucket);
      try {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await settle(page);
        await scrollExercise(page);
        const state = await layoutProbe(page);
        assert(state.overflow <= 1 && state.clipped.length === 0, `iPhone/WebKit layout ${JSON.stringify(state)}`);
        assert(bucket.pageErrors.length === 0 && bucket.consoleErrors.length === 0 && bucket.httpErrors.length === 0 && bucket.requestFailures.length === 0, `iPhone/WebKit runtime ${JSON.stringify(bucket)}`);
        results.push({ case: 'iphone-webkit-proxy', device: iphone.userAgent, state, pass: true, note: 'Automated WebKit/iPhone proxy; physical iPhone Safari remains required for final P0 sign-off.' });
        await page.screenshot({ path: path.join(SHOTS, 'webkit-iphone-proxy.png'), fullPage: false, animations: 'disabled' });
        console.log('PASS WebKit iPhone proxy');
      } finally {
        await context.close();
      }
    }
  } catch (error) {
    recordFailure('WebKit/iPhone-proxy', error);
  } finally {
    await mobileSafari.close();
  }
}

(async () => {
  await runBrowserMatrix();
  const report = {
    schema: 'formatx-p0-vip-quality/v1',
    target: URL,
    generatedAt: new Date().toISOString(),
    requirements: {
      lighthouse: '100/100/100/100 desktop + mobile, pessimistic across 3 runs',
      lcpMs: '<2000',
      cls: '<0.05',
      inpMs: '<=200 field/RUM required for final sign-off',
      consoleErrors: 0,
      brokenAssets404: 0,
      horizontalOverflow: 0,
      keyboard: 'PASS',
      reducedMotion: 'PASS',
      zoom200: 'PASS automated proxy + real-browser manual sign-off',
      webglFallback: 'PASS',
      noJs: 'PASS',
      browsers: 'Chrome / Firefox / Edge / WebKit + Android/iPhone profiles; physical Safari/iPhone remains final-device evidence'
    },
    pass: failures.length === 0,
    results,
    failures
  };
  fs.writeFileSync(path.join(EVIDENCE, 'p0-browser-gate.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(EVIDENCE, 'p0-browser-gate.log'), [
    `FormatX P0 VIP browser gate: ${report.pass ? 'PASS' : 'FAIL'}`,
    `Target: ${URL}`,
    `Generated: ${report.generatedAt}`,
    `Passed cases: ${results.length}`,
    `Failures: ${failures.length}`,
    ...failures.map((f, i) => `${i + 1}. ${f.scope}: ${f.message}`)
  ].join('\n') + '\n');
  console.log(JSON.stringify({ pass: report.pass, passedCases: results.length, failures: failures.length, evidence: EVIDENCE }, null, 2));
  if (!report.pass) process.exit(1);
})().catch(error => {
  recordFailure('fatal', error);
  fs.mkdirSync(EVIDENCE, { recursive: true });
  fs.writeFileSync(path.join(EVIDENCE, 'p0-browser-gate-fatal.log'), String(error?.stack || error) + '\n');
  process.exit(1);
});
