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

async function mobileSnapshot(page) {
  return page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController || '',
    automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
    bridgeState: document.documentElement.dataset.fxLoopBridge || '',
    mobileMode: document.documentElement.dataset.fxMobileScrollMode || '',
    bootstrapState: document.documentElement.dataset.fxScrollBootstrapState || '',
    bridgeCount: document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"]').length,
    scrollY,
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
    snapRoot: getComputedStyle(document.documentElement).scrollSnapType,
    snapBody: getComputedStyle(document.body).scrollSnapType,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
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
  await page.waitForFunction(() => document.documentElement.dataset.fxInfiniteController === 'mobile-native-document-v1', null, { timeout: 15000 });
  await page.waitForTimeout(350);

  const initial = await mobileSnapshot(page);
  assert(initial.automaticLoop === 'disabled-mobile', 'mobile automatic loop is not disabled: ' + JSON.stringify(initial));
  assert(initial.bridgeState === 'disabled-mobile', 'mobile bridge is not disabled: ' + JSON.stringify(initial));
  assert(initial.mobileMode === 'native-document-v1', 'mobile native document marker missing: ' + JSON.stringify(initial));
  assert(initial.bridgeCount === 0, 'mobile contains a loop bridge/clone: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === false && initial.runtime?.visualBridge === false, 'mobile runtime contract is not finite/native: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticPagePositionChanges === false, 'mobile runtime still allows automatic page position changes: ' + JSON.stringify(initial));
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', 'mobile scroll snapping is active: ' + JSON.stringify(initial));
  assert(initial.overflow <= 2, 'mobile horizontal overflow: ' + JSON.stringify(initial));

  const positions = [];
  for (const ratio of [.18, .36, .54, .72, .90]) {
    const target = Math.round(initial.maximum * ratio);
    await page.evaluate(y => scrollTo(0, y), target);
    await page.waitForTimeout(120);
    positions.push(await page.evaluate(() => scrollY));
  }
  for (let i = 1; i < positions.length; i += 1) {
    assert(positions[i] + 4 >= positions[i - 1], 'mobile native scroll jumped backwards: ' + JSON.stringify(positions));
  }

  const idleStart = await page.evaluate(() => scrollY);
  await page.waitForTimeout(900);
  const idleEnd = await page.evaluate(() => scrollY);
  assert(Math.abs(idleEnd - idleStart) <= 4, 'mobile page changed position after input stopped: ' + JSON.stringify({ idleStart, idleEnd }));
  assert((await mobileSnapshot(page)).bridgeCount === 0, 'mobile bridge appeared after scrolling');

  const meaningful = errors.filter(value => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404/i.test(value));
  assert(!meaningful.length, 'mobile browser errors: ' + meaningful.join(' | '));
  console.log('PASS mobile native document', JSON.stringify({ positions, idleStart, idleEnd }));
  await context.close();
}

async function desktopSnapshot(page) {
  return page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const source = document.querySelector('#main-content > #hero');
    return {
      controller: document.documentElement.dataset.fxInfiniteController || '',
      automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
      bridgeState: document.documentElement.dataset.fxLoopBridge || '',
      bootstrapState: document.documentElement.dataset.fxScrollBootstrapState || '',
      bridgeCount: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
      cloneCount: document.querySelectorAll('.fx-loop-bridge [data-fx-loop-clone="true"]').length,
      loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
      bridgeTop: bridge?.offsetTop || 0,
      sourceTop: source?.offsetTop || 0,
      sourceHeight: source?.offsetHeight || 0,
      viewportHeight: innerHeight,
      scrollY,
      runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
      snapRoot: getComputedStyle(document.documentElement).scrollSnapType,
      snapBody: getComputedStyle(document.body).scrollSnapType,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'hu-HU',
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  await prepare(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v7'
    && document.documentElement.dataset.fxLoopBridge === 'ready-v3'
  ), null, { timeout: 20000 });
  await page.waitForTimeout(350);

  const initial = await desktopSnapshot(page);
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

  const before = await desktopSnapshot(page);
  const threshold = Math.max(36, Math.min(before.viewportHeight * .18, 180));
  const relative = Math.min(Math.max(threshold + 70, 120), Math.max(120, before.sourceHeight - 30));
  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo(0, (bridge?.offsetTop || 0) + offset);
  }, relative);
  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, before.loopCount, { timeout: 5000 });
  await page.waitForTimeout(500);
  const after = await desktopSnapshot(page);
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
