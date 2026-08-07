'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL
  || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const NAVIGATION = Object.freeze({
  hu: [
    ['Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés'],
    ['Működés', 'Modulok', 'Licencek', 'Bizonyíték', 'Letöltés'],
    ['Hogyan működik', 'Modulok', 'Licencek', 'Bizonyíték', 'Letöltés'],
    ['Idegrendszer — Hogyan működik', 'Szervek — Funkciók és modulok', 'Kereskedelmi szív — Licencek és árak', 'Váz — Technológia és biztonság', 'Jeladó — Letöltés és bizonyítékok']
  ],
  en: [
    ['Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads'],
    ['How it works', 'Modules', 'Licences', 'Proof', 'Download'],
    ['Nervous system — How it works', 'Organs — Functions and modules', 'Commerce heart — Licences and pricing', 'Skeleton — Technology and safety', 'Beacon — Downloads and evidence']
  ]
});

const DOWNLOAD_LABELS = Object.freeze({
  hu: ['Teljes multiplatform verzió letöltése', 'Teljes multiplatform verzió'],
  en: ['Download full multiplatform version', 'Full multiplatform version']
});

const TRIAL_LABELS = Object.freeze({
  hu: ['napos próbalicenc', 'napos teljes próba', 'nap teljes próba', 'napos kezdőlicenc'],
  en: ['day trial licence', 'day full trial', 'day initial licence']
});

function matchesOne(actual, expectedSets) {
  return expectedSets.some(expected => JSON.stringify(actual) === JSON.stringify(expected));
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
  await page.waitForFunction(({ lang, navigation, downloads, trials }) => {
    const nav = Array.from(document.querySelectorAll('#main-nav a'), node => node.textContent.trim());
    const download = document.querySelector('#hero-download span')?.textContent.trim() || '';
    const trial = document.querySelector('.hero-facts > span:nth-child(3) small')?.textContent.trim() || '';
    return document.documentElement.lang === lang
      && document.documentElement.dataset.fxLanguageCopyStability === 'ready-v1'
      && Boolean(document.querySelector('.fx-language-toggle'))
      && downloads.includes(download)
      && trials.includes(trial)
      && navigation.some(expected => JSON.stringify(expected) === JSON.stringify(nav))
      && Boolean(document.querySelector('.site-footer [data-fx-licence-link]'))
      && Boolean(document.getElementById('fx-licence-clarity'));
  }, {
    lang: language,
    navigation: NAVIGATION[language],
    downloads: DOWNLOAD_LABELS[language],
    trials: TRIAL_LABELS[language]
  }, { timeout: 45000 });
  await page.waitForTimeout(250);
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
    retiredReleaseCopy: /\bV(?:29|92|120|121)\b|92\.00|Windows nyilvános béta letöltése|Download Windows public beta|Multiplatform nyilvános béta|Multiplatform public beta|NATÍV BÉTA|NATIVE BETA/i.test(
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
  assert(matchesOne(state.nav, NAVIGATION.hu), name + ': Hungarian navigation mismatch: ' + JSON.stringify(state));
  assert(DOWNLOAD_LABELS.hu.includes(state.heroDownload),
    name + ': Hungarian download label mismatch: ' + JSON.stringify(state));
  assert(TRIAL_LABELS.hu.includes(state.trialLabel),
    name + ': Hungarian trial label mismatch: ' + JSON.stringify(state));
  assert(state.pricingTitle === 'A licenccsomag a munkádhoz igazodik.',
    name + ': Hungarian pricing heading mismatch: ' + JSON.stringify(state));
  assert(state.licenceTitle === 'Mit ad a FormatX licenc?' && state.licenceItems === 4,
    name + ': Hungarian licence clarification mismatch: ' + JSON.stringify(state));
  assert(state.footerLicence === 'Licenc',
    name + ': Hungarian footer licence mismatch: ' + JSON.stringify(state));
  assert(state.visibleLanguageButtons === 1,
    name + ': exactly one visible language button required: ' + JSON.stringify(state));
  assert(!state.retiredReleaseCopy,
    name + ': retired beta/version copy remains: ' + JSON.stringify(state));
  assert(state.horizontalOverflow <= 1,
    name + ': horizontal overflow: ' + JSON.stringify(state));
}

function assertEnglish(state, name) {
  assert(state.lang === 'en', name + ': English language state missing: ' + JSON.stringify(state));
  assert(matchesOne(state.nav, NAVIGATION.en), name + ': English navigation mismatch: ' + JSON.stringify(state));
  assert(DOWNLOAD_LABELS.en.includes(state.heroDownload),
    name + ': English download label mismatch: ' + JSON.stringify(state));
  assert(TRIAL_LABELS.en.includes(state.trialLabel),
    name + ': English trial label mismatch: ' + JSON.stringify(state));
  assert(state.pricingTitle === 'The licence plan fits your work.',
    name + ': English pricing heading mismatch: ' + JSON.stringify(state));
  assert(state.licenceTitle === 'What does the FormatX licence grant?' && state.licenceItems === 4,
    name + ': English licence clarification mismatch: ' + JSON.stringify(state));
  assert(state.footerLicence === 'Licence',
    name + ': English footer licence mismatch: ' + JSON.stringify(state));
  assert(state.visibleLanguageButtons === 1,
    name + ': exactly one visible language button required: ' + JSON.stringify(state));
  assert(!state.retiredReleaseCopy,
    name + ': retired beta/version copy remains: ' + JSON.stringify(state));
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
    console.log('PASS FormatX bilingual full-release labels and 5-day trial licence');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});