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
  if (await page.locator('script[src*="formatx-infinite-scroll.js"]').count()) return;
  const runtimeUrl = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=native-scroll-browser-test', document.baseURI).href);
  await page.addScriptTag({ url: runtimeUrl });
}

async function snapshot(page) {
  return page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController || '',
    ready: document.documentElement.dataset.fxInfiniteScroll || '',
    input: document.documentElement.dataset.fxInfiniteInput || '',
    automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
    jumpGuard: document.documentElement.dataset.fxScrollJumpGuard || '',
    bridgeState: document.documentElement.dataset.fxLoopBridge || '',
    scrollSnapType: getComputedStyle(document.documentElement).scrollSnapType,
    sceneSnap: Array.from(document.querySelectorAll('#hero, main > .scene')).map(node => getComputedStyle(node).scrollSnapAlign),
    scrollY,
    viewportHeight: innerHeight,
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
    bridgeCount: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
    cloneCount: document.querySelectorAll('[data-fx-loop-clone="true"]').length,
    heroIdCount: document.querySelectorAll('#hero').length,
    transferClass: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
    footerInPanel: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
    footerInFlow: Boolean(document.querySelector('body > .site-footer')),
  }));
}

async function verifyProgressiveScroll(page, name) {
  const positions = await page.evaluate(async () => {
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const start = Math.round(maximum * .15);
    const end = Math.round(maximum * .78);
    const values = [];
    scrollTo(0, start);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let index = 1; index <= 16; index += 1) {
      const target = Math.round(start + (end - start) * index / 16);
      scrollTo(0, target);
      await new Promise(resolve => setTimeout(resolve, 38));
      values.push(scrollY);
    }
    return values;
  });

  for (let index = 1; index < positions.length; index += 1) {
    assert(positions[index] + 8 >= positions[index - 1],
      name + ': ordinary scrolling moved backwards or snapped to a previous section: ' + JSON.stringify(positions));
  }
}

async function verifyNoAutomaticJump(page, name) {
  const before = await snapshot(page);
  const target = Math.max(0, Math.min(before.maximum - 24, Math.round(before.maximum * .88)));
  await page.evaluate(y => scrollTo(0, y), target);
  await page.waitForTimeout(650);
  const after = await snapshot(page);

  assert(Math.abs(after.scrollY - target) <= 6,
    name + ': page position changed without user navigation: ' + JSON.stringify({ target, after }));
  assert(after.loopCount === before.loopCount,
    name + ': automatic loop counter changed: ' + JSON.stringify({ before, after }));
  assert(after.bridgeCount === 0 && after.cloneCount === 0,
    name + ': legacy loop bridge or clone returned: ' + JSON.stringify(after));
  assert(!after.transferClass,
    name + ': automatic transfer class became active: ' + JSON.stringify(after));
}

async function verifyViewport(browser, viewport, name, mobile) {
  const context = await browser.newContext({
    viewport,
    locale: 'hu-HU',
    colorScheme: 'dark',
    hasTouch: mobile,
    isMobile: mobile,
    deviceScaleFactor: mobile ? 2 : 1
  });
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push('console-error: ' + message.text());
  });

  await page.goto(TEST_URL + '?lang=hu&scroll-test=native-position', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await ensureScrollRuntime(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v6'
    && document.documentElement.dataset.fxInfiniteScroll === 'ready-seamless-v6'
    && document.documentElement.dataset.fxInfiniteInput === 'native'
    && document.documentElement.dataset.fxAutomaticLoop === 'disabled'
    && document.documentElement.dataset.fxLoopBridge === 'disabled'
  ), null, { timeout: 10000 });
  await page.waitForTimeout(300);

  const initial = await snapshot(page);
  assert(initial.bridgeCount === 0, name + ': visual loop bridge must be absent: ' + JSON.stringify(initial));
  assert(initial.cloneCount === 0, name + ': cloned loop content must be absent: ' + JSON.stringify(initial));
  assert(initial.heroIdCount === 1, name + ': duplicate #hero id detected: ' + JSON.stringify(initial));
  assert(initial.footerInFlow && !initial.footerInPanel,
    name + ': footer must remain in document flow, not inside the release dialog: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === false
    && initial.runtime?.visualBridge === false
    && initial.runtime?.nativePositionOnly === true
    && initial.runtime?.jumpFree === true
    && initial.runtime?.sectionSnapDisabled === true,
    name + ': native scroll runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.scrollSnapType === 'none', name + ': root scroll snapping is still active: ' + JSON.stringify(initial));
  assert(initial.sceneSnap.every(value => value === 'none'), name + ': a section still has snap alignment: ' + JSON.stringify(initial));

  await verifyProgressiveScroll(page, name);
  await verifyNoAutomaticJump(page, name);

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
    await verifyViewport(browser, { width: 412, height: 915 }, 'mobile-412x915', true);
    await verifyViewport(browser, { width: 1366, height: 768 }, 'laptop-1366x768', false);
    await verifyViewport(browser, { width: 1920, height: 1080 }, 'full-hd-1920x1080', false);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
