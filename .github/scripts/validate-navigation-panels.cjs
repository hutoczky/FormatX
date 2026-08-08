'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});
  await page.evaluate(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    document.body?.classList.remove('fx-organism-panel-open');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function ensureScrollRuntime(page) {
  const active = await page.evaluate(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v6'
    && document.documentElement.__FORMATX_INFINITE_SCROLL__?.revision === 'ratio-v4'
  ));
  if (active) return;
  const src = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=20260808-nav-ratio-v5', document.baseURI).href);
  await page.addScriptTag({ url: src });
}

async function activateImmersive(page) {
  const launch = page.locator('#main-content > #hero .fx-immersive-launch').first();
  await launch.waitFor({ state: 'attached', timeout: 10000 });
  await launch.evaluate(node => node.click());
  await page.waitForFunction(() => document.documentElement.dataset.fxImmersive === 'active', null, { timeout: 10000 });
}

async function waitForInterface(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.classList.contains('fx-intro-complete')
      && root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'ready'
      && root.dataset.fxOrganismCoreController === 'ready'
      && root.dataset.fxOrganismConsoleState === 'ready'
      && root.dataset.fxSingleLanguageToggle === 'ready'
      && root.dataset.fxInfiniteController === 'seamless-v6'
      && root.dataset.fxInfiniteScroll === 'ready-seamless-v6'
      && root.dataset.fxInfiniteInput === 'native'
      && root.dataset.fxAutomaticLoop === 'enabled'
      && root.dataset.fxLoopBridge?.startsWith('ready')
      && root.dataset.fxScrollAuthority === 'seamless-v6-ratio-v4'
      && root.dataset.fxInteractionGenomeExport === 'ready'
      && root.dataset.fxOrganismMasterSync === 'ready-v1'
      && root.dataset.fxTranscendLoader === 'safe-ready-v27';
  }, null, { timeout: 45000 });
}

async function assertSingleLanguageToggle(page) {
  const visible = page.locator('.fx-language-toggle:visible');
  if (await visible.count() !== 1) throw new Error('Exactly one visible language toggle is required');
  const toggle = visible.first();
  await toggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await toggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'hu');
}

async function openMenu(page) {
  await page.locator('#menu-toggle').click();
  await page.waitForFunction(() => {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    return toggle?.getAttribute('aria-expanded') === 'true' && nav?.classList.contains('open') && document.documentElement.classList.contains('fx-organism-menu-open');
  }, null, { timeout: 8000 });
}

async function assertPanel(page, id, scene) {
  await page.waitForFunction(({ expectedId, expectedScene }) => {
    const shell = document.getElementById('fx-organism-console');
    const panel = document.querySelector(`[data-organism-panel="${expectedId}"]`);
    return Boolean(shell && !shell.hidden && shell.getAttribute('aria-hidden') === 'false' && shell.classList.contains('is-authorised-open') && document.body.classList.contains('fx-organism-panel-open') && document.documentElement.dataset.fxScene === String(expectedScene) && panel && !panel.hidden && panel.getAttribute('aria-hidden') === 'false' && panel.textContent.trim().length > 20);
  }, { expectedId: id, expectedScene: scene }, { timeout: 10000 });
}

async function assertCore(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const shell = document.getElementById('fx-organism-console');
    return root.dataset.fxScene === '0' && root.dataset.fxOrganismState === 'core' && root.classList.contains('fx-organism-core-active') && root.dataset.fxOrganismConsole === 'closed' && !document.body.classList.contains('fx-organism-panel-open') && shell?.hidden === true && shell?.getAttribute('aria-hidden') === 'true';
  }, null, { timeout: 12000 });
}

async function closePanelAndAssertCore(page) {
  await page.locator('.fx-organism-console-close').click();
  await assertCore(page);
  await page.waitForTimeout(250);
}

async function assertNoUnexpectedJumpBeforeSeam(page) {
  const before = await page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    return { bridgeTop: bridge?.offsetTop ?? 0, loopCount: Number(document.documentElement.dataset.fxLoopCount || 0) };
  });
  if (before.bridgeTop < 200) throw new Error('Seamless bridge geometry is missing');
  const target = Math.max(0, before.bridgeTop - 96);
  await page.evaluate(y => window.scrollTo(0, y), target);
  await page.waitForTimeout(650);
  const after = await page.evaluate(() => ({
    y: window.scrollY,
    loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
    bridges: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
    clones: document.querySelectorAll('[data-fx-loop-clone="true"]').length,
    automatic: document.documentElement.dataset.fxAutomaticLoop,
    jumpGuard: document.documentElement.dataset.fxScrollJumpGuard,
    transfer: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
  }));
  if (Math.abs(after.y - target) > 6) throw new Error(`Page moved before the loop seam: ${JSON.stringify({ target, after })}`);
  if (after.loopCount !== before.loopCount) throw new Error(`Loop counter changed before the seam: ${JSON.stringify({ before, after })}`);
  if (after.bridges !== 1 || after.clones !== 1 || after.transfer) throw new Error(`Seamless bridge state invalid before seam: ${JSON.stringify(after)}`);
  if (after.automatic !== 'enabled' || after.jumpGuard !== 'visual-ratio-v4' || after.runtime?.ratioMatchedLanding !== true || after.runtime?.inputInterception !== false) throw new Error(`Seamless ratio-v4 contract missing: ${JSON.stringify(after)}`);
}

async function preparePage(page) {
  await page.addInitScript(() => { try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {} });
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await ensureScrollRuntime(page);
  await activateImmersive(page);
  await waitForInterface(page);
}

async function testDesktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await preparePage(page);
  await assertSingleLanguageToggle(page);
  await assertCore(page);
  await openMenu(page);
  await page.locator('#main-nav a[href="#experience"]').click();
  await assertPanel(page, 'experience', 1);
  await closePanelAndAssertCore(page);
  await page.locator('.fx-organism-map a[href="#pricing"]').click();
  await assertPanel(page, 'pricing', 3);
  await closePanelAndAssertCore(page);
  await page.locator('.fx-rail a[href="#system"]').click();
  await assertPanel(page, 'system', 4);
  await closePanelAndAssertCore(page);
  await assertNoUnexpectedJumpBeforeSeam(page);
  await page.close();
}

async function testMobile(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await preparePage(page);
  await assertSingleLanguageToggle(page);
  await assertCore(page);
  await openMenu(page);
  await page.locator('#main-nav a[href="#capabilities"]').click();
  await assertPanel(page, 'capabilities', 2);
  await closePanelAndAssertCore(page);
  await page.locator('.scroll-cue').evaluate(node => node.click());
  await assertPanel(page, 'experience', 1);
  await closePanelAndAssertCore(page);
  await assertNoUnexpectedJumpBeforeSeam(page);
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testDesktop(browser);
    await testMobile(browser);
    console.log('PASS FormatX language toggle, navigation, panels and seamless ratio-v4 scrolling');
  } finally { await browser.close(); }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
