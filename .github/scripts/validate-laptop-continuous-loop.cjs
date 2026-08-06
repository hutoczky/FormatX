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

async function snapshot(page) {
  return page.evaluate(() => {
    const bridge = document.querySelector('[data-fx-loop-bridge]');
    const source = document.querySelector('#main-content > #hero');
    const clone = bridge?.querySelector('.fx-loop-hero-clone');
    return {
      controller: document.documentElement.dataset.fxInfiniteController || '',
      ready: document.documentElement.dataset.fxInfiniteScroll || '',
      input: document.documentElement.dataset.fxInfiniteInput || '',
      automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
      jumpGuard: document.documentElement.dataset.fxScrollJumpGuard || '',
      bridgeState: document.documentElement.dataset.fxLoopBridge || '',
      scrollY,
      maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
      bridgeCount: document.querySelectorAll('[data-fx-loop-bridge]').length,
      heroIdCount: document.querySelectorAll('#hero').length,
      transferClass: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
      runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
      bridgeTop: bridge?.offsetTop || 0,
      sourceTop: source?.offsetTop || 0,
      sourceHeight: source?.offsetHeight || 0,
      cloneHeight: clone?.offsetHeight || 0,
      sourceTitle: source?.querySelector('.hero-title-main')?.textContent?.trim() || '',
      cloneTitle: clone?.querySelector('.hero-title-main')?.textContent?.trim() || '',
      footerInPanel: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
      footerInFlow: Boolean(document.querySelector('body > .site-footer')),
    };
  });
}

async function verifyProgressiveScroll(page, name) {
  const positions = await page.evaluate(async () => {
    const bridge = document.querySelector('[data-fx-loop-bridge]');
    const maximumBeforeBridge = Math.max(0, (bridge?.offsetTop || document.documentElement.scrollHeight) - innerHeight - 80);
    const start = Math.round(maximumBeforeBridge * .35);
    const end = Math.round(maximumBeforeBridge * .78);
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
      name + ': ordinary scrolling moved backwards: ' + JSON.stringify(positions));
  }
}

async function verifySeamlessTransfer(page, name) {
  const before = await snapshot(page);
  const relative = Math.max(60, Math.min(140, Math.round(before.sourceHeight * .12)));
  await page.evaluate(relativeOffset => {
    const bridge = document.querySelector('[data-fx-loop-bridge]');
    scrollTo(0, (bridge?.offsetTop || 0) + relativeOffset);
  }, relative);
  await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous,
    before.loopCount, { timeout: 5000 });
  await page.waitForTimeout(160);

  const after = await snapshot(page);
  assert(after.loopCount === before.loopCount + 1,
    name + ': exactly one cycle transfer was expected: ' + JSON.stringify({ before, after }));
  assert(Math.abs(after.scrollY - (after.sourceTop + relative)) <= 48,
    name + ': transfer did not preserve relative visual position: ' + JSON.stringify({ relative, after }));
  assert(!after.transferClass, name + ': transfer state remained stuck: ' + JSON.stringify(after));
  assert(after.input === 'native', name + ': native input state was not restored: ' + JSON.stringify(after));
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

  await page.goto(TEST_URL + '?lang=hu&scroll-test=seamless-v6', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v6'
    && document.documentElement.dataset.fxInfiniteScroll === 'ready-seamless-v6'
    && document.documentElement.dataset.fxAutomaticLoop === 'enabled'
    && document.documentElement.dataset.fxLoopBridge === 'ready-v2'
  ), null, { timeout: 45000 });
  await page.waitForTimeout(500);

  const initial = await snapshot(page);
  assert(initial.bridgeCount === 1, name + ': exactly one visual bridge required: ' + JSON.stringify(initial));
  assert(initial.heroIdCount === 1, name + ': duplicate #hero id detected: ' + JSON.stringify(initial));
  assert(initial.sourceTitle && initial.sourceTitle === initial.cloneTitle,
    name + ': visual bridge title differs from source hero: ' + JSON.stringify(initial));
  assert(Math.abs(initial.sourceHeight - initial.cloneHeight) <= 4,
    name + ': visual bridge height differs from source hero: ' + JSON.stringify(initial));
  assert(initial.footerInFlow && !initial.footerInPanel,
    name + ': footer must remain in document flow, not inside the release dialog: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true && initial.runtime?.jumpFree === true,
    name + ': seamless runtime contract missing: ' + JSON.stringify(initial));

  await verifyProgressiveScroll(page, name);
  await verifySeamlessTransfer(page, name);

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