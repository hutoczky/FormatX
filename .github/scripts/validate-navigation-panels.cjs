'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

async function waitForInterface(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.classList.contains('fx-intro-complete')
      && root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'ready';
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

async function assertPanel(page, id) {
  await page.waitForFunction(expectedId => {
    const root = document.getElementById('fx-organism-console');
    const panel = document.querySelector(`[data-organism-panel="${expectedId}"]`);
    return Boolean(
      root
      && !root.hidden
      && root.getAttribute('aria-hidden') === 'false'
      && document.body.classList.contains('fx-organism-panel-open')
      && panel
      && !panel.hidden
      && panel.getAttribute('aria-hidden') === 'false'
    );
  }, id, { timeout: 5000 });
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

async function testDesktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await waitForInterface(page);

  const startupState = await page.evaluate(() => ({
    panelOpen: document.body.classList.contains('fx-organism-panel-open'),
    consoleHidden: document.getElementById('fx-organism-console')?.hidden,
    interfaceState: document.documentElement.dataset.fxOrganismInterface,
  }));
  if (startupState.panelOpen || startupState.consoleHidden !== true || startupState.interfaceState !== 'ready') {
    throw new Error(`Desktop startup state invalid: ${JSON.stringify(startupState)}`);
  }

  await openMenu(page);
  await page.locator('#main-nav a[href="#experience"]').click();
  await assertPanel(page, 'experience');
  await assertMenuClosed(page);

  await page.locator('.fx-organism-console-close').click();
  await page.waitForFunction(() => {
    const root = document.getElementById('fx-organism-console');
    return Boolean(root?.hidden && !document.body.classList.contains('fx-organism-panel-open'));
  }, null, { timeout: 5000 });

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

  await openMenu(page);
  await page.locator('#main-nav a[href="#capabilities"]').click();
  await assertPanel(page, 'capabilities');
  await assertMenuClosed(page);

  await page.locator('.fx-organism-console-close').click();
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testDesktop(browser);
    await testMobile(browser);
    console.log('PASS FormatX desktop and mobile navigation/panel interaction');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
