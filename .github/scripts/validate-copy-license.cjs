'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.classList.contains('fx-intro-complete')
      && root.dataset.fxSingleLanguageToggle === 'ready'
      && root.dataset.fxCopyPolish === 'ready-v1'
      && Boolean(document.getElementById('fx-licence-clarity'));
  }, null, { timeout: 25000 });
}

async function readCopy(page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    nav: Array.from(document.querySelectorAll('#main-nav a'), node => node.textContent.trim()),
    heroDownload: document.querySelector('#hero-download span')?.textContent.trim() || '',
    trialLabel: document.querySelector('.hero-facts > span:nth-child(3) small')?.textContent.trim() || '',
    pricingTitle: document.getElementById('pricing-title')?.textContent.replace(/\s+/g, ' ').trim() || '',
    licenceTitle: document.getElementById('fx-licence-clarity-title')?.textContent.trim() || '',
    licenceItems: Array.from(document.querySelectorAll('#fx-licence-clarity li'), node => node.textContent.trim()),
    footerLicence: document.querySelector('.site-footer a[data-fx-licence-link]')?.textContent.trim() || '',
    visibleLanguageButtons: Array.from(document.querySelectorAll('.fx-language-toggle, .language-switch [data-language]'))
      .filter(node => getComputedStyle(node).display !== 'none' && !node.hidden).length,
    legacyStarterCopy: /kezdőlicenc|initial licence/i.test(document.body.innerText),
    horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
  }));
}

async function assertHungarian(page, name) {
  const state = await readCopy(page);
  assert(state.lang === 'hu', name + ': language is not Hungarian: ' + JSON.stringify(state));
  assert(JSON.stringify(state.nav) === JSON.stringify(['Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés']), name + ': Hungarian navigation mismatch: ' + JSON.stringify(state));
  assert(state.heroDownload.includes('5 napos próbalicenc'), name + ': Hungarian trial download label missing: ' + JSON.stringify(state));
  assert(state.trialLabel === 'napos próbalicenc', name + ': Hungarian trial fact mismatch: ' + JSON.stringify(state));
  assert(state.pricingTitle === 'A licenccsomag a munkádhoz igazodik.', name + ': Hungarian licence heading mismatch: ' + JSON.stringify(state));
  assert(state.licenceTitle === 'Mit ad a FormatX licenc?', name + ': Hungarian licence clarification missing: ' + JSON.stringify(state));
  assert(state.licenceItems.length === 4, name + ': licence clarification must contain four points: ' + JSON.stringify(state));
  assert(state.footerLicence === 'Licenc', name + ': footer licence link mismatch: ' + JSON.stringify(state));
  assert(state.visibleLanguageButtons === 1, name + ': exactly one visible language button required: ' + JSON.stringify(state));
  assert(!state.legacyStarterCopy, name + ': obsolete starter-licence wording remains: ' + JSON.stringify(state));
  assert(state.horizontalOverflow <= 1, name + ': horizontal overflow: ' + JSON.stringify(state));
}

async function assertEnglish(page, name) {
  const state = await readCopy(page);
  assert(state.lang === 'en', name + ': language is not English: ' + JSON.stringify(state));
  assert(JSON.stringify(state.nav) === JSON.stringify(['Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads']), name + ': English navigation mismatch: ' + JSON.stringify(state));
  assert(state.heroDownload.includes('5-day trial'), name + ': English trial download label missing: ' + JSON.stringify(state));
  assert(state.trialLabel === 'day trial licence', name + ': English trial fact mismatch: ' + JSON.stringify(state));
  assert(state.pricingTitle === 'The licence plan fits your work.', name + ': English licence heading mismatch: ' + JSON.stringify(state));
  assert(state.licenceTitle === 'What does the FormatX licence grant?', name + ': English licence clarification missing: ' + JSON.stringify(state));
  assert(state.licenceItems.length === 4, name + ': English licence clarification must contain four points: ' + JSON.stringify(state));
  assert(state.footerLicence === 'Licence', name + ': English footer licence link mismatch: ' + JSON.stringify(state));
  assert(state.visibleLanguageButtons === 1, name + ': exactly one visible language button required after language change: ' + JSON.stringify(state));
  assert(!state.legacyStarterCopy, name + ': obsolete licence wording remains in English: ' + JSON.stringify(state));
  assert(state.horizontalOverflow <= 1, name + ': horizontal overflow after language change: ' + JSON.stringify(state));
}

async function testViewport(browser, viewport, name, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile: Boolean(mobile),
    hasTouch: Boolean(mobile),
    locale: 'hu-HU',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await waitReady(page);
  await assertHungarian(page, name);

  await page.locator('.fx-language-toggle').click();
  await page.waitForFunction(() => document.documentElement.lang === 'en' && document.documentElement.dataset.fxCopyPolish === 'ready-v1');
  await assertEnglish(page, name);

  const meaningful = errors.filter(item => !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED/i.test(item));
  assert(!meaningful.length, name + ': browser errors: ' + meaningful.join(' | '));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    await testViewport(browser, { width: 1440, height: 900 }, 'desktop', false);
    await testViewport(browser, { width: 390, height: 844 }, 'mobile', true);
    console.log('PASS FormatX bilingual labels, single language toggle and licence clarification');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
