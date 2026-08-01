'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL
  || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});
  await page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending', 'fx-intro-reveal');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function waitPublicState(page, language) {
  const expectedDownload = language === 'en'
    ? 'Download multiplatform public beta'
    : 'Multiplatform nyilvános béta letöltése';
  const expectedLicence = language === 'en' ? 'Licence' : 'Licenc';
  const expectedNavigation = language === 'en'
    ? ['Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads']
    : ['Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés'];
  const expectedTrial = language === 'en' ? 'day trial licence' : 'napos próbalicenc';

  await page.waitForFunction(({ lang, download, licence, navigation, trial }) => (
    document.documentElement.lang === lang
    && document.documentElement.dataset.fxLanguageCopyStability === 'ready-v1'
    && Boolean(document.querySelector('.fx-language-toggle'))
    && document.querySelector('#hero-download span')?.textContent.trim() === download
    && document.querySelector('.site-footer [data-fx-licence-link]')?.textContent.trim() === licence
    && JSON.stringify(Array.from(document.querySelectorAll('#main-nav a'), node => node.textContent.trim()))
      === JSON.stringify(navigation)
    && document.querySelector('.hero-facts > span:nth-child(3) small')?.textContent.trim() === trial
    && Boolean(document.getElementById('fx-licence-clarity'))
  ), {
    lang: language,
    download: expectedDownload,
    licence: expectedLicence,
    navigation: expectedNavigation,
    trial: expectedTrial
  }, { timeout: 45000 });
}

async function readCopy(page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    nav: Array.from(document.querySelectorAll('#main-nav a'), node => node.textContent.trim()),
    heroDownload: document.querySelector('#hero-download span')?.textContent.trim() || '',
    trialLabel: document.querySelector('.hero-facts > span:nth-child(3) small')?.textContent.trim() || '',
    pricingTitle: Array.from(
      document.querySelectorAll('#pricing-title > span, #pricing-title > em'),
      node => node.textContent.trim()
    ).join(' '),
    licenceTitle: document.getElementById('fx-licence-clarity-title')?.textContent.trim() || '',
    licenceItems: document.querySelectorAll('#fx-licence-clarity li').length,
    footerLicence: document.querySelector('.site-footer [data-fx-licence-link]')?.textContent.trim() || '',
    visibleLanguageButtons: Array.from(
      document.querySelectorAll('.fx-language-toggle, .language-switch [data-language]')
    ).filter(node => getComputedStyle(node).display !== 'none' && !node.hidden).length,
    legacyVersionCopy: /\bV(?:92|120)\b|92\.00|Windows nyilvános béta letöltése/i.test(
      document.body.innerText
    ),
    horizontalOverflow: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    ) - innerWidth
  }));
}

function assertHungarian(state, name) {
  assert(state.lang === 'hu', name + ': Hungarian language state missing: ' + JSON.stringify(state));
  assert(JSON.stringify(state.nav) === JSON.stringify([
    'Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés'
  ]), name + ': Hungarian navigation mismatch: ' + JSON.stringify(state));
  assert(state.heroDownload === 'Multiplatform nyilvános béta letöltése',
    name + ': Hungarian download label mismatch: ' + JSON.stringify(state));
  assert(state.trialLabel === 'napos próbalicenc',
    name + ': Hungarian trial label mismatch: ' + JSON.stringify(state));
  assert(state.pricingTitle === 'A licenccsomag a munkádhoz igazodik.',
    name + ': Hungarian pricing heading mismatch: ' + JSON.stringify(state));
  assert(state.licenceTitle === 'Mit ad a FormatX licenc?' && state.licenceItems === 4,
    name + ': Hungarian licence clarification mismatch: ' + JSON.stringify(state));
  assert(state.footerLicence === 'Licenc',
    name + ': Hungarian footer licence mismatch: ' + JSON.stringify(state));
  assert(state.visibleLanguageButtons === 1,
    name + ': exactly one visible language button required: ' + JSON.stringify(state));
  assert(!state.legacyVersionCopy,
    name + ': public version or Windows-only copy remains: ' + JSON.stringify(state));
  assert(state.horizontalOverflow <= 1,
    name + ': horizontal overflow: ' + JSON.stringify(state));
}

function assertEnglish(state, name) {
  assert(state.lang === 'en', name + ': English language state missing: ' + JSON.stringify(state));
  assert(JSON.stringify(state.nav) === JSON.stringify([
    'Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads'
  ]), name + ': English navigation mismatch: ' + JSON.stringify(state));
  assert(state.heroDownload === 'Download multiplatform public beta',
    name + ': English download label mismatch: ' + JSON.stringify(state));
  assert(state.trialLabel === 'day trial licence',
    name + ': English trial label mismatch: ' + JSON.stringify(state));
  assert(state.pricingTitle === 'The licence plan fits your work.',
    name + ': English pricing heading mismatch: ' + JSON.stringify(state));
  assert(state.licenceTitle === 'What does the FormatX licence grant?' && state.licenceItems === 4,
    name + ': English licence clarification mismatch: ' + JSON.stringify(state));
  assert(state.footerLicence === 'Licence',
    name + ': English footer licence mismatch: ' + JSON.stringify(state));
  assert(state.visibleLanguageButtons === 1,
    name + ': exactly one visible language button required: ' + JSON.stringify(state));
  assert(!state.legacyVersionCopy,
    name + ': public version or Windows-only copy remains: ' + JSON.stringify(state));
  assert(state.horizontalOverflow <= 1,
    name + ': horizontal overflow: ' + JSON.stringify(state));
}

async function testViewport(browser, viewport, name, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile: Boolean(mobile),
    hasTouch: Boolean(mobile),
    locale: 'hu-HU'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await waitPublicState(page, 'hu');
  assertHungarian(await readCopy(page), name);

  await page.locator('.fx-language-toggle').evaluate(node => node.click());
  await waitPublicState(page, 'en');
  assertEnglish(await readCopy(page), name);

  const meaningful = errors.filter(item => (
    !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED|Failed to load resource:.*(?:403|404)/i.test(item)
  ));
  assert(!meaningful.length, name + ': browser errors: ' + meaningful.join(' | '));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-swiftshader']
  });
  try {
    await testViewport(browser, { width: 1440, height: 900 }, 'desktop', false);
    await testViewport(browser, { width: 390, height: 844 }, 'mobile', true);
    console.log('PASS FormatX bilingual labels, multiplatform CTA and licence clarification');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
