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
  return page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController || '',
    ready: document.documentElement.dataset.fxInfiniteScroll || '',
    input: document.documentElement.dataset.fxInfiniteInput || '',
    automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
    jumpGuard: document.documentElement.dataset.fxScrollJumpGuard || '',
    scrollY,
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
    cloneCount: document.querySelectorAll('[data-fx-loop-bridge]').length,
    jumpClass: document.documentElement.classList.contains('fx-infinite-loop-jump')
      || document.documentElement.classList.contains('fx-three-loop-transfer'),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null
  }));
}

async function verifyNoAutomaticJump(page, name) {
  await page.evaluate(() => {
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    scrollTo(0, Math.max(0, maximum - 4));
  });
  await page.waitForTimeout(900);

  const afterNativeSettle = await snapshot(page);
  assert(afterNativeSettle.maximum - afterNativeSettle.scrollY <= 24,
    name + ': the page jumped away from the bottom: ' + JSON.stringify(afterNativeSettle));
  assert(afterNativeSettle.loopCount === 0,
    name + ': an automatic loop was recorded: ' + JSON.stringify(afterNativeSettle));
  assert(!afterNativeSettle.jumpClass,
    name + ': a forced-scroll transfer class remained active: ' + JSON.stringify(afterNativeSettle));

  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(500);
  const afterWheel = await snapshot(page);
  assert(afterWheel.maximum - afterWheel.scrollY <= 24,
    name + ': wheel input caused a backward jump: ' + JSON.stringify(afterWheel));
  assert(afterWheel.loopCount === 0,
    name + ': wheel input triggered the retired loop: ' + JSON.stringify(afterWheel));

  await page.keyboard.press('End');
  await page.waitForTimeout(350);
  const afterKeyboard = await snapshot(page);
  assert(afterKeyboard.maximum - afterKeyboard.scrollY <= 24,
    name + ': End key caused a backward jump: ' + JSON.stringify(afterKeyboard));
}

async function verifyProgressiveScroll(page, name) {
  const positions = await page.evaluate(async () => {
    const values = [];
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const start = Math.round(maximum * 0.45);
    const end = Math.round(maximum * 0.82);
    scrollTo(0, start);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    for (let index = 1; index <= 18; index += 1) {
      const target = Math.round(start + (end - start) * index / 18);
      scrollTo(0, target);
      await new Promise(resolve => setTimeout(resolve, 45));
      values.push(scrollY);
    }
    return values;
  });

  for (let index = 1; index < positions.length; index += 1) {
    assert(positions[index] + 8 >= positions[index - 1],
      name + ': scrolling moved backwards unexpectedly: ' + JSON.stringify(positions));
  }
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

  await page.goto(TEST_URL + '?lang=hu&scroll-test=native-v5', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'native-v5'
    && document.documentElement.dataset.fxInfiniteScroll === 'ready-native-v5'
    && document.documentElement.dataset.fxAutomaticLoop === 'disabled'
  ), null, { timeout: 45000 });
  await page.waitForTimeout(500);

  const initial = await snapshot(page);
  assert(initial.cloneCount === 0, name + ': clone-based loop returned: ' + JSON.stringify(initial));
  assert(initial.controller === 'native-v5', name + ': native controller missing: ' + JSON.stringify(initial));
  assert(initial.ready === 'ready-native-v5', name + ': native scroll state missing: ' + JSON.stringify(initial));
  assert(initial.automaticLoop === 'disabled', name + ': automatic loop not disabled: ' + JSON.stringify(initial));
  assert(initial.jumpGuard === 'ready-v1', name + ': jump guard missing: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === false && initial.runtime?.jumpFree === true,
    name + ': runtime contract is not jump-free: ' + JSON.stringify(initial));

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
