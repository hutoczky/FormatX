'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  await page.evaluate(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body?.classList.remove('fx-organism-panel-open');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function ensureScrollRuntime(page) {
  const loaded = await page.evaluate(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v6'
    && document.documentElement.__FORMATX_INFINITE_SCROLL__?.revision === 'ratio-v4'
  ));
  if (loaded) return;
  const runtimeUrl = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=20260808-seamless-ratio-v5-test', document.baseURI).href);
  await page.addScriptTag({ url: runtimeUrl });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const clone = bridge?.querySelector('.fx-loop-hero-clone');
    const hero = document.querySelector('#main-content > #hero');
    return {
      controller: document.documentElement.dataset.fxInfiniteController || '',
      ready: document.documentElement.dataset.fxInfiniteScroll || '',
      input: document.documentElement.dataset.fxInfiniteInput || '',
      automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
      jumpGuard: document.documentElement.dataset.fxScrollJumpGuard || '',
      bridgeState: document.documentElement.dataset.fxLoopBridge || '',
      landingState: document.documentElement.dataset.fxLoopLandingState || '',
      authority: document.documentElement.dataset.fxScrollAuthority || '',
      scrollY,
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
      maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      bridgeTop: bridge?.offsetTop ?? -1,
      bridgeHeight: bridge?.offsetHeight ?? 0,
      bridgeVisualHeight: clone?.offsetHeight ?? 0,
      heroTop: hero?.offsetTop ?? -1,
      heroHeight: hero?.offsetHeight ?? 0,
      loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
      bridgeCount: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
      cloneCount: document.querySelectorAll('[data-fx-loop-clone="true"]').length,
      heroIdCount: document.querySelectorAll('#hero').length,
      transferClass: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
      runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
      footerInPanel: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
      footerInFlow: Boolean(document.querySelector('body > .site-footer')),
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0) - innerWidth,
      bridgeInert: Boolean(document.querySelector('.fx-loop-hero-clone[inert][aria-hidden="true"]')),
      introRunning: document.documentElement.classList.contains('fx-intro-running'),
      introComplete: document.documentElement.classList.contains('fx-intro-complete'),
      menuOpen: document.documentElement.classList.contains('fx-organism-menu-open'),
      panelOpen: document.body?.classList.contains('fx-organism-panel-open') || false,
      hidden: document.hidden,
      declaredThreshold: Number(document.documentElement.dataset.fxLoopThreshold || 0),
      declaredVisualHeight: Number(document.documentElement.dataset.fxLoopVisualHeight || 0),
    };
  });
}

async function verifyProgressiveScroll(page, name) {
  const result = await page.evaluate(async () => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const clone = bridge?.querySelector('.fx-loop-hero-clone');
    if (!bridge || !clone) return { positions: [], start: 0, end: 0, threshold: 0 };

    const bridgeTop = bridge.offsetTop;
    const visualHeight = Math.max(1, clone.offsetHeight);
    const thresholdDepth = Math.max(48, Math.min(innerHeight * .28, 300));
    const threshold = bridgeTop + Math.min(thresholdDepth, Math.max(0, visualHeight - 2));
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const safety = Math.max(64, Math.min(innerHeight * .08, 240));
    const end = Math.max(0, Math.min(maximum, bridgeTop - safety, threshold - safety));
    const span = Math.max(360, Math.min(innerHeight * .9, 1800));
    const start = Math.max(0, end - span);
    const positions = [];

    scrollTo(0, start);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let index = 1; index <= 18; index += 1) {
      const target = Math.round(start + (end - start) * index / 18);
      scrollTo(0, target);
      await new Promise(resolve => setTimeout(resolve, 32));
      positions.push(scrollY);
    }
    return { positions, start, end, threshold };
  });

  assert(result.positions.length === 18, name + ': progressive scroll did not collect enough positions');
  assert(result.end < result.threshold,
    name + ': normal-scroll probe crossed the loop seam: ' + JSON.stringify(result));
  for (let index = 1; index < result.positions.length; index += 1) {
    assert(result.positions[index] + 8 >= result.positions[index - 1],
      name + ': ordinary scrolling moved backwards before the loop seam: ' + JSON.stringify(result));
  }
}

async function triggerLoop(page, name) {
  const before = await snapshot(page);
  assert(before.bridgeTop >= 0 && before.bridgeHeight > 0 && before.bridgeVisualHeight > 0 && before.heroHeight > 0,
    name + ': missing loop geometry: ' + JSON.stringify(before));

  const thresholdDepth = Math.max(48, Math.min(before.viewportHeight * .28, 300));
  const threshold = before.bridgeTop + Math.min(thresholdDepth, Math.max(0, before.bridgeVisualHeight - 2));
  assert(before.maximum >= threshold + 8,
    name + ': loop seam is not physically reachable: ' + JSON.stringify({ before, threshold }));

  const target = Math.min(before.maximum - 4, threshold + Math.max(24, Math.min(before.viewportHeight * .08, 80)));
  const expectedRatio = Math.max(0, Math.min(1, (target - before.bridgeTop) / before.bridgeVisualHeight));
  const expectedLanding = before.heroTop + Math.min(Math.max(0, before.heroHeight - 2), Math.round(before.heroHeight * expectedRatio));

  await page.evaluate(y => scrollTo(0, y), target);
  try {
    await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous, before.loopCount, { timeout: 5000 });
  } catch (_) {
    const blocked = await snapshot(page);
    throw new Error(name + ': loop did not start after reaching seam: ' + JSON.stringify({ target, threshold, before, blocked }));
  }
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxLoopLandingState === 'settled'
    && !document.documentElement.classList.contains('fx-seamless-loop-transfer')
  ), null, { timeout: 5000 });
  await page.waitForTimeout(80);

  const after = await snapshot(page);
  const tolerance = Math.max(10, Math.round(after.viewportHeight * .018));
  assert(after.loopCount === before.loopCount + 1,
    name + ': loop count did not increment exactly once: ' + JSON.stringify({ before, after }));
  assert(Math.abs(after.scrollY - expectedLanding) <= tolerance,
    name + ': ratio-matched landing drifted: ' + JSON.stringify({ target, expectedRatio, expectedLanding, tolerance, after }));
  assert(after.bridgeCount === 1 && after.cloneCount === 1,
    name + ': bridge/clone count changed after transfer: ' + JSON.stringify(after));
  assert(after.heroIdCount === 1,
    name + ': duplicate #hero id appeared after transfer: ' + JSON.stringify(after));
  assert(!after.transferClass && after.input === 'native',
    name + ': transfer state remained active: ' + JSON.stringify(after));
  return after;
}

async function verifyViewport(browser, viewport, name, mobile, cycles = 1) {
  const context = await browser.newContext({
    viewport,
    locale: 'hu-HU',
    colorScheme: 'dark',
    hasTouch: mobile,
    isMobile: mobile,
    deviceScaleFactor: mobile ? 2 : 1
  });
  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push('console-error: ' + message.text());
  });

  await page.goto(TEST_URL + '?lang=hu&scroll-test=seamless-ratio-v5', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await ensureScrollRuntime(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v6'
    && document.documentElement.__FORMATX_INFINITE_SCROLL__?.revision === 'ratio-v4'
    && document.documentElement.dataset.fxInfiniteInput === 'native'
    && document.documentElement.dataset.fxAutomaticLoop === 'enabled'
    && document.documentElement.dataset.fxLoopBridge.startsWith('ready')
    && !document.documentElement.classList.contains('fx-intro-running')
  ), null, { timeout: 10000 });
  await page.waitForTimeout(300);

  const initial = await snapshot(page);
  assert(initial.bridgeCount === 1 && initial.cloneCount === 1,
    name + ': exactly one inert Hero bridge is required: ' + JSON.stringify(initial));
  assert(initial.bridgeInert, name + ': Hero bridge must be inert and aria-hidden: ' + JSON.stringify(initial));
  assert(initial.heroIdCount === 1, name + ': duplicate #hero id detected: ' + JSON.stringify(initial));
  assert(initial.footerInFlow && !initial.footerInPanel,
    name + ': footer must remain in document flow, not inside the release dialog: ' + JSON.stringify(initial));
  assert(initial.horizontalOverflow <= 2,
    name + ': horizontal overflow detected: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true
    && initial.runtime?.visualBridge === true
    && initial.runtime?.clonedHeroOnly === true
    && initial.runtime?.ratioMatchedLanding === true
    && initial.runtime?.frameStableLanding === true
    && initial.runtime?.reachableSeam === true
    && initial.runtime?.guardRetry === true
    && initial.runtime?.inputInterception === false
    && initial.runtime?.jumpFree === true,
    name + ': seamless runtime contract missing: ' + JSON.stringify(initial));

  await verifyProgressiveScroll(page, name);
  for (let cycle = 0; cycle < cycles; cycle += 1) await triggerLoop(page, name + '-cycle-' + (cycle + 1));

  const meaningful = diagnostics.filter(item => (
    !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item)
  ));
  assert(!meaningful.length, name + ': browser diagnostics: ' + meaningful.join(' | '));

  console.log(JSON.stringify({ case: name, viewport, state: await snapshot(page) }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-smooth-scrolling', '--enable-unsafe-swiftshader']
  });
  try {
    await verifyViewport(browser, { width: 412, height: 915 }, 'mobile-412x915', true, 2);
    await verifyViewport(browser, { width: 1366, height: 768 }, 'hd-1366x768', false, 2);
    await verifyViewport(browser, { width: 1920, height: 1080 }, 'full-hd-1920x1080', false, 2);
    await verifyViewport(browser, { width: 2560, height: 1440 }, 'qhd-2560x1440', false);
    await verifyViewport(browser, { width: 3440, height: 1440 }, 'ultrawide-3440x1440', false);
    await verifyViewport(browser, { width: 5120, height: 1440 }, 'super-ultrawide-5120x1440', false);
    await verifyViewport(browser, { width: 3840, height: 2160 }, '4k-3840x2160', false);
    await verifyViewport(browser, { width: 7680, height: 4320 }, '8k-7680x4320', false);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
