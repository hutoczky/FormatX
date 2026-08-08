'use strict';

const { chromium } = require('playwright');
const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

function assert(value, message) { if (!value) throw new Error(message); }

async function prepare(page) {
  await page.addInitScript(() => { try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {} });
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    if (overlay) { overlay.hidden = true; overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); }
    document.body?.classList.remove('fx-organism-panel-open');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });

  const scrollReady = await page.evaluate(() => document.documentElement.dataset.fxInfiniteController === 'seamless-v6');
  if (!scrollReady) {
    const src = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=20260808-nav-ratio-v5', document.baseURI).href);
    await page.addScriptTag({ url: src });
  }

  const launch = page.locator('#main-content > #hero .fx-immersive-launch').first();
  await launch.waitFor({ state: 'attached', timeout: 10000 });
  await launch.evaluate(node => node.click());
  await page.waitForFunction(() => document.documentElement.dataset.fxImmersive === 'active', null, { timeout: 10000 });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'ready'
      && root.dataset.fxOrganismCoreController === 'ready'
      && root.dataset.fxOrganismConsoleState === 'ready'
      && root.dataset.fxSingleLanguageToggle === 'ready'
      && root.dataset.fxInfiniteController === 'seamless-v6'
      && root.dataset.fxInfiniteInput === 'native'
      && root.dataset.fxAutomaticLoop === 'enabled'
      && root.dataset.fxLoopBridge?.startsWith('ready');
  }, null, { timeout: 45000 });
}

async function toggleLanguages(page) {
  const toggle = page.locator('.fx-language-toggle:visible');
  assert(await toggle.count() === 1, 'Exactly one visible language toggle is required');
  await toggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await toggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'hu');
}

async function openPanel(page, selector, id) {
  await page.locator(selector).first().evaluate(node => node.click());
  await page.waitForFunction(expected => {
    const shell = document.getElementById('fx-organism-console');
    const panel = document.querySelector(`[data-organism-panel="${expected}"]`);
    return shell && !shell.hidden && panel && !panel.hidden && document.body.classList.contains('fx-organism-panel-open');
  }, id, { timeout: 12000 });
  assert((await page.locator(`[data-organism-panel="${id}"]`).innerText()).trim().length > 20, `${id} panel is empty`);
}

async function closePanel(page) {
  await page.locator('.fx-organism-console-close').click();
  await page.waitForFunction(() => {
    const shell = document.getElementById('fx-organism-console');
    return shell?.hidden === true && !document.body.classList.contains('fx-organism-panel-open');
  }, null, { timeout: 12000 });
}

async function verifyPreSeam(page) {
  const state = await page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    return { top: bridge?.offsetTop ?? 0, count: Number(document.documentElement.dataset.fxLoopCount || 0) };
  });
  assert(state.top > 200, 'Seamless bridge geometry missing');
  const target = Math.max(0, state.top - 96);
  await page.evaluate(y => scrollTo(0, y), target);
  await page.waitForTimeout(650);
  const after = await page.evaluate(() => ({
    y: scrollY,
    count: Number(document.documentElement.dataset.fxLoopCount || 0),
    bridgeCount: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
    cloneCount: document.querySelectorAll('[data-fx-loop-clone="true"]').length,
    transfer: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null
  }));
  assert(Math.abs(after.y - target) <= 6, `Unexpected pre-seam jump: ${JSON.stringify({ target, after })}`);
  assert(after.count === state.count, 'Loop triggered before the seam');
  assert(after.bridgeCount === 1 && after.cloneCount === 1 && !after.transfer, 'Invalid bridge state before seam');
  assert(after.runtime?.ratioMatchedLanding === true && after.runtime?.inputInterception === false, 'Seamless contract missing');
}

async function desktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await prepare(page);
  await toggleLanguages(page);
  await page.locator('#menu-toggle').click();
  await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
  await openPanel(page, '#main-nav a[href="#experience"]', 'experience');
  await closePanel(page);
  await openPanel(page, '.fx-organism-map a[href="#pricing"]', 'pricing');
  await closePanel(page);
  await openPanel(page, '.fx-rail a[href="#system"]', 'system');
  await closePanel(page);
  await verifyPreSeam(page);
  await page.close();
}

async function mobile(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await prepare(page);
  await toggleLanguages(page);
  await page.locator('#menu-toggle').click();
  await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
  await openPanel(page, '#main-nav a[href="#capabilities"]', 'capabilities');
  await closePanel(page);
  await openPanel(page, '#main-content > #hero .scroll-cue', 'experience');
  await closePanel(page);
  await verifyPreSeam(page);
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await desktop(browser);
    await mobile(browser);
    console.log('PASS FormatX language toggle, navigation, panels and seamless pre-seam scrolling');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
