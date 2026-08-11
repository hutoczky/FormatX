'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function prepare(page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  await page.goto(TEST_URL + '?lang=hu&scroll-test=platform-v2', { waitUntil: 'domcontentloaded' });

  if (!await page.locator('link[data-fx-continuous-scroll-test]').count()) {
    await page.evaluate(origin => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = origin + '/scifi-ui/styles/formatx-continuous-scroll.css?v=platform-v2-browser-test';
      link.dataset.fxContinuousScrollTest = 'true';
      document.head.appendChild(link);
    }, new URL(TEST_URL).origin);
  }

  if (!await page.locator('script[src*="formatx-infinite-scroll.js"]').count()) {
    const runtimeUrl = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=platform-v2-browser-test', document.baseURI).href);
    await page.addScriptTag({ url: runtimeUrl });
  }
}

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const clone = document.querySelector('.fx-loop-bridge [data-fx-loop-clone="true"]');
    const source = document.querySelector('#main-content > #hero');
    const bridgeStyle = bridge ? getComputedStyle(bridge) : null;
    return {
      controller: root.dataset.fxInfiniteController || '',
      automaticLoop: root.dataset.fxAutomaticLoop || '',
      bridgeState: root.dataset.fxLoopBridge || '',
      mobileMode: root.dataset.fxMobileScrollMode || '',
      mobilePolicy: root.dataset.fxMobileScrollPolicy || '',
      bootstrapState: root.dataset.fxScrollBootstrapState || '',
      bridgeCount: bridge ? 1 : 0,
      cloneCount: clone ? 1 : 0,
      bridgeDisplay: bridgeStyle?.display || '',
      bridgeVisibility: bridgeStyle?.visibility || '',
      bridgeHeight: bridge?.offsetHeight || 0,
      bridgeTop: bridge?.offsetTop || 0,
      sourceTop: source?.offsetTop || 0,
      sourceHeight: source?.offsetHeight || 0,
      viewportHeight: innerHeight,
      loopCount: Number(root.dataset.fxLoopCount || 0),
      scrollY,
      maximum: Math.max(0, root.scrollHeight - innerHeight),
      runtime: root.__FORMATX_INFINITE_SCROLL__ || null,
      snapRoot: getComputedStyle(root).scrollSnapType,
      snapBody: getComputedStyle(document.body).scrollSnapType,
      overflow: root.scrollWidth - root.clientWidth,
    };
  });
}

async function waitForSeamless(page) {
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v7'
    && document.documentElement.dataset.fxLoopBridge === 'ready-v3'
  ), null, { timeout: 20000 });
  await page.waitForTimeout(450);
}

async function verifyMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    locale: 'hu-HU',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await prepare(page);
  await waitForSeamless(page);

  const initial = await snapshot(page);
  assert(initial.automaticLoop === 'enabled', 'mobile seamless loop is not enabled: ' + JSON.stringify(initial));
  assert(initial.mobileMode === 'native-momentum-loop', 'mobile momentum-loop marker missing: ' + JSON.stringify(initial));
  assert(initial.mobilePolicy === 'native-momentum-loop-v1', 'mobile loop policy missing: ' + JSON.stringify(initial));
  assert(initial.bridgeCount === 1 && initial.cloneCount === 1, 'mobile visual bridge contract broken: ' + JSON.stringify(initial));
  assert(initial.bridgeDisplay !== 'none' && initial.bridgeVisibility !== 'hidden', 'mobile bridge is hidden: ' + JSON.stringify(initial));
  assert(initial.bridgeHeight >= initial.viewportHeight, 'mobile bridge has no usable runway: ' + JSON.stringify(initial));
  assert(initial.maximum > initial.bridgeTop + Math.min(220, initial.viewportHeight * .2), 'mobile document still ends at the footer/bridge boundary: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true && initial.runtime?.visualBridge === true, 'mobile seamless runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.runtime?.mobileTransfer === 'scrollend-or-idle', 'mobile transfer is not deferred until momentum end: ' + JSON.stringify(initial));
  assert(initial.runtime?.mobileNativeMomentumPreserved === true, 'mobile native momentum is not preserved: ' + JSON.stringify(initial));
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', 'mobile scroll snapping is active: ' + JSON.stringify(initial));
  assert(initial.overflow <= 2, 'mobile horizontal overflow: ' + JSON.stringify(initial));

  const threshold = Math.max(36, Math.min(initial.viewportHeight * .18, 180));
  const relative = Math.min(Math.max(threshold + 84, 220), Math.max(220, initial.sourceHeight - 36));

  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo(0, (bridge?.offsetTop || 0) + offset);
  }, relative);

  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, initial.loopCount, { timeout: 6000 });
  await page.waitForTimeout(650);

  const after = await snapshot(page);
  assert(after.loopCount === initial.loopCount + 1, 'mobile loop did not transfer exactly once: ' + JSON.stringify({ initial, after }));
  assert(Math.abs(after.scrollY - (after.sourceTop + relative)) <= 110, 'mobile loop did not preserve the visual relative position: ' + JSON.stringify({ relative, after }));
  assert(after.scrollY < after.maximum - 100, 'mobile remained pinned at the physical document end after loop transfer: ' + JSON.stringify(after));

  const stableY = after.scrollY;
  await page.waitForTimeout(900);
  const settledY = await page.evaluate(() => scrollY);
  assert(Math.abs(settledY - stableY) <= 6, 'mobile kept moving after seamless landing settled: ' + JSON.stringify({ stableY, settledY }));

  const meaningful = errors.filter(value => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404/i.test(value));
  assert(!meaningful.length, 'mobile browser errors: ' + meaningful.join(' | '));
  console.log('PASS mobile seamless-v7', JSON.stringify({ relative, loopBefore: initial.loopCount, loopAfter: after.loopCount, landing: after.scrollY }));
  await context.close();
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'hu-HU',
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  await prepare(page);
  await waitForSeamless(page);

  const initial = await snapshot(page);
  assert(initial.automaticLoop === 'enabled', 'desktop seamless loop not enabled: ' + JSON.stringify(initial));
  assert(initial.bridgeCount === 1 && initial.cloneCount === 1, 'desktop visual bridge contract broken: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true && initial.runtime?.visualBridge === true, 'desktop v7 runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', 'desktop scroll snapping is active');
  assert(initial.overflow <= 2, 'desktop horizontal overflow: ' + JSON.stringify(initial));

  const safeEnd = Math.max(200, initial.bridgeTop - initial.viewportHeight - 250);
  await page.evaluate(y => scrollTo(0, y), Math.round(safeEnd * .2));
  const positions = [await page.evaluate(() => scrollY)];
  for (let i = 0; i < 10; i += 1) {
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(65);
    positions.push(await page.evaluate(() => scrollY));
  }
  for (let i = 1; i < positions.length; i += 1) {
    assert(positions[i] + 6 >= positions[i - 1], 'desktop wheel moved backwards before bridge: ' + JSON.stringify(positions));
  }

  const before = await snapshot(page);
  const threshold = Math.max(36, Math.min(before.viewportHeight * .18, 180));
  const relative = Math.min(Math.max(threshold + 70, 120), Math.max(120, before.sourceHeight - 30));
  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo(0, (bridge?.offsetTop || 0) + offset);
  }, relative);
  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, before.loopCount, { timeout: 5000 });
  await page.waitForTimeout(500);
  const after = await snapshot(page);
  assert(after.loopCount === before.loopCount + 1, 'desktop loop did not transfer exactly once: ' + JSON.stringify({ before, after }));
  assert(Math.abs(after.scrollY - (after.sourceTop + relative)) <= 80, 'desktop loop did not preserve relative position: ' + JSON.stringify({ relative, after }));

  console.log('PASS desktop seamless-v7', JSON.stringify({ positions, loopBefore: before.loopCount, loopAfter: after.loopCount }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-smooth-scrolling', '--enable-unsafe-swiftshader'] });
  try {
    await verifyMobile(browser);
    await verifyDesktop(browser);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
