'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

async function waitForInterface(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.classList.contains('fx-intro-complete')
      && root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'ready'
      && root.dataset.fxOrganismCoreController === 'ready'
      && root.dataset.fxOrganismConsoleState === 'ready';
  }, null, { timeout: 20000 });
}

async function openMenu(page) {
  await page.locator('#menu-toggle').click();
  await page.waitForFunction(() => {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    return toggle?.getAttribute('aria-expanded') === 'true'
      && toggle.classList.contains('open')
      && nav?.classList.contains('open')
      && document.documentElement.classList.contains('fx-organism-menu-open');
  }, null, { timeout: 5000 });
}

async function assertPanel(page, id, scene) {
  await page.waitForFunction(({ expectedId, expectedScene }) => {
    const root = document.getElementById('fx-organism-console');
    const panel = document.querySelector(`[data-organism-panel="${expectedId}"]`);
    return Boolean(
      root
      && !root.hidden
      && root.getAttribute('aria-hidden') === 'false'
      && root.classList.contains('is-authorised-open')
      && getComputedStyle(root).display === 'grid'
      && document.body.classList.contains('fx-organism-panel-open')
      && document.documentElement.dataset.fxScene === String(expectedScene)
      && !document.documentElement.classList.contains('fx-organism-core-active')
      && panel
      && !panel.hidden
      && panel.getAttribute('aria-hidden') === 'false'
      && getComputedStyle(panel).display !== 'none'
      && panel.textContent.trim().length > 20
    );
  }, { expectedId: id, expectedScene: scene }, { timeout: 5000 });
}

async function assertMenuClosed(page) {
  const state = await page.evaluate(() => ({
    expanded: document.getElementById('menu-toggle')?.getAttribute('aria-expanded'),
    navOpen: document.getElementById('main-nav')?.classList.contains('open'),
    rootOpen: document.documentElement.classList.contains('fx-organism-menu-open'),
  }));
  if (state.expanded !== 'false' || state.navOpen || state.rootOpen) {
    throw new Error(`Menu did not close after navigation: ${JSON.stringify(state)}`);
  }
}

async function assertCore(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const consoleRoot = document.getElementById('fx-organism-console');
    const status = document.querySelector('.fx-organism-status');
    return root.dataset.fxScene === '0'
      && root.dataset.fxOrganismState === 'core'
      && root.classList.contains('fx-organism-core-active')
      && root.dataset.fxOrganismConsole === 'closed'
      && document.getElementById('hero')?.classList.contains('is-core-active')
      && !document.body.classList.contains('fx-organism-panel-open')
      && consoleRoot?.hidden === true
      && consoleRoot?.getAttribute('aria-hidden') === 'true'
      && !consoleRoot?.classList.contains('is-authorised-open')
      && getComputedStyle(consoleRoot).display === 'none'
      && location.hash === '#hero'
      && status?.querySelector('.fx-organism-status-index')?.textContent === '01 / 06'
      && status?.querySelector('strong')?.textContent === 'MAG'
      && document.querySelector('[data-organ-node="0"]')?.getAttribute('aria-current') === 'page'
      && document.querySelector('[data-scene-link="0"]')?.getAttribute('aria-current') === 'page';
  }, null, { timeout: 5000 });
}

async function assertLeakedConsoleSelfHeals(page) {
  await page.evaluate(() => {
    const shell = document.getElementById('fx-organism-console');
    if (!shell) throw new Error('Organism console missing');
    shell.hidden = false;
    shell.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fx-organism-panel-open');
  });
  await assertCore(page);
}

async function closePanelAndAssertCore(page) {
  await page.locator('.fx-organism-console-close').click();
  await assertCore(page);
}

async function testDesktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await waitForInterface(page);
  await assertCore(page);
  await assertLeakedConsoleSelfHeals(page);

  await openMenu(page);
  await page.locator('#main-nav a[href="#experience"]').click();
  await assertPanel(page, 'experience', 1);
  await assertMenuClosed(page);
  await closePanelAndAssertCore(page);

  await page.locator('.fx-organism-map a[href="#pricing"]').click();
  await assertPanel(page, 'pricing', 3);
  await closePanelAndAssertCore(page);

  await page.locator('.fx-rail a[href="#system"]').click();
  await assertPanel(page, 'system', 4);
  await closePanelAndAssertCore(page);

  await page.close();
}

async function testMobile(browser) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await waitForInterface(page);
  await assertCore(page);
  await assertLeakedConsoleSelfHeals(page);

  await openMenu(page);
  await page.locator('#main-nav a[href="#capabilities"]').click();
  await assertPanel(page, 'capabilities', 2);
  await assertMenuClosed(page);
  await closePanelAndAssertCore(page);

  await page.locator('.scroll-cue').click();
  await assertPanel(page, 'experience', 1);
  await page.keyboard.press('1');
  await assertCore(page);

  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testDesktop(browser);
    await testMobile(browser);
    console.log('PASS FormatX hero core, blank-console recovery, menu, map, rail and panel interaction');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
