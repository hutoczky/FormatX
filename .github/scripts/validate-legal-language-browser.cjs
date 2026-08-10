'use strict';

const { chromium } = require('playwright');

const origin = process.env.FORMATX_PUBLIC_ORIGIN || 'http://127.0.0.1:4178';
const cases = [
  {
    path: '/scifi-ui/terms.html',
    hu: 'Felhasználási és értékesítési feltételek',
    en: 'Terms of use and sale',
    englishProbe: 'Contract formation, payment and activation'
  },
  {
    path: '/scifi-ui/privacy.html',
    hu: 'Adatvédelem',
    en: 'Privacy',
    englishProbe: 'Purposes, data and legal bases'
  },
  {
    path: '/scifi-ui/support.html',
    hu: 'Működő támogatási csatornák',
    en: 'Working support channels',
    englishProbe: 'Required issue-report information'
  }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ensureLanguageToggle(page) {
  if (!await page.locator('script[src*="single-language-toggle.js"]').count()) {
    await page.addScriptTag({ url: origin + '/scifi-ui/scripts/single-language-toggle.js' });
  }
  await page.waitForSelector('.fx-language-toggle:visible', { timeout: 10000 });
}

async function assertTranslated(page, testCase, language, label) {
  const expected = language === 'en' ? testCase.en : testCase.hu;
  await page.waitForFunction(({ expected, language }) => {
    const h1 = document.querySelector('.legal-document h1')?.textContent?.trim() || '';
    return document.documentElement.lang === language
      && document.documentElement.dataset.fxLegalPageLanguage === language
      && h1 === expected;
  }, { expected, language }, { timeout: 10000 });

  const state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    i18n: document.documentElement.dataset.fxLegalPageI18n || '',
    legalLanguage: document.documentElement.dataset.fxLegalPageLanguage || '',
    h1: document.querySelector('.legal-document h1')?.textContent?.trim() || '',
    text: document.querySelector('.legal-document')?.innerText || '',
    title: document.title,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    script: Boolean(document.querySelector('script[data-fx-legal-page-i18n], script[src*="legal-page-i18n.js"]'))
  }));

  assert(state.i18n === 'ready-v1', `${label}: legal-page i18n runtime not ready: ${JSON.stringify(state)}`);
  assert(state.legalLanguage === language, `${label}: legal language state mismatch: ${JSON.stringify(state)}`);
  assert(state.h1 === expected, `${label}: heading mismatch: ${JSON.stringify(state)}`);
  assert(state.script, `${label}: legal-page-i18n.js was not loaded`);
  assert(state.overflow <= 2, `${label}: horizontal overflow ${state.overflow}px`);
  if (language === 'en') {
    assert(state.text.includes(testCase.englishProbe), `${label}: English article body did not translate: ${testCase.englishProbe}`);
    assert(!state.text.includes(testCase.hu), `${label}: Hungarian H1 remained in English body`);
  }
}

async function runCase(browser, testCase, viewport, suffix) {
  const context = await browser.newContext({ viewport, locale: 'hu-HU' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  const label = `${testCase.path}-${suffix}`;
  await page.goto(origin + testCase.path + '?lang=en', { waitUntil: 'domcontentloaded' });
  await ensureLanguageToggle(page);
  await assertTranslated(page, testCase, 'en', label + '-initial-en');

  const toggle = page.locator('.fx-language-toggle:visible').first();
  await toggle.click();
  await assertTranslated(page, testCase, 'hu', label + '-toggle-hu');

  await toggle.click();
  await assertTranslated(page, testCase, 'en', label + '-toggle-en');

  assert(errors.length === 0, `${label}: page errors: ${errors.join(' | ')}`);
  console.log(`PASS ${label}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const testCase of cases) {
      await runCase(browser, testCase, { width: 1440, height: 900 }, 'desktop');
      await runCase(browser, testCase, { width: 390, height: 844 }, 'mobile');
    }
    console.log('PASS: Terms, Privacy and Support provide real HU/EN article translations on desktop and mobile.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
