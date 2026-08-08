'use strict';

const { chromium } = require('playwright');
const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

function assert(value, message) { if (!value) throw new Error(message); }

async function installProductionCopy(page) {
  const origin = new URL(TEST_URL).origin;
  await page.addStyleTag({ url: origin + '/scifi-ui/styles/single-language-toggle.css?v=20260808-single-language-5' });
  await page.addStyleTag({ url: origin + '/scifi-ui/styles/formatx-copy-polish.css?v=20260729-copy-polish-1' });
  await page.addScriptTag({ url: origin + '/scifi-ui/scripts/single-language-toggle.js?v=20260808-single-language-5' });
  await page.addScriptTag({ url: origin + '/scifi-ui/scripts/formatx-copy-polish.js?v=20260729-copy-polish-1' });
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxSingleLanguageToggle === 'ready'
    && document.documentElement.dataset.fxCopyPolish === 'ready-v1'
    && document.querySelectorAll('.fx-language-toggle').length === 1
    && Boolean(document.getElementById('fx-licence-clarity'))
    && Boolean(document.querySelector('.site-footer [data-fx-licence-link]'))
  ), null, { timeout: 12000 });
}

async function clearIntro(page) {
  await page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending', 'fx-intro-reveal');
    root.classList.add('fx-intro-complete');
    if (overlay) { overlay.hidden = true; overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); }
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function waitLanguage(page, language) {
  await page.waitForFunction(lang => {
    const visibleControls = Array.from(document.querySelectorAll('.fx-language-toggle, [data-language], [data-language-choice]')).filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return !node.hidden && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .02 && rect.width > 0 && rect.height > 0;
    }).length;
    return document.documentElement.lang === lang
      && visibleControls === 1
      && document.querySelectorAll('#fx-licence-clarity li').length === 4
      && Boolean(document.querySelector('.site-footer [data-fx-licence-link]'));
  }, language, { timeout: 12000 });
  await page.waitForTimeout(300);
}

async function state(page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    body: document.body.innerText,
    download: document.querySelector('#hero-download span')?.textContent.trim() || '',
    trial: document.querySelector('.hero-facts > span:nth-child(3) small')?.textContent.trim() || '',
    licenceTitle: document.getElementById('fx-licence-clarity-title')?.textContent.trim() || '',
    licenceItems: Array.from(document.querySelectorAll('#fx-licence-clarity li'), node => node.textContent.trim()),
    footerLicence: document.querySelector('.site-footer [data-fx-licence-link]')?.textContent.trim() || '',
    visibleControls: Array.from(document.querySelectorAll('.fx-language-toggle, [data-language], [data-language-choice]')).filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return !node.hidden && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .02 && rect.width > 0 && rect.height > 0;
    }).length,
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
  }));
}

function check(value, language, label) {
  assert(value.lang === language, `${label}: language mismatch`);
  assert(value.visibleControls === 1, `${label}: expected exactly one visible language control: ${JSON.stringify(value)}`);
  assert(value.licenceItems.length === 4, `${label}: licence clarity must contain four items: ${JSON.stringify(value)}`);
  assert(value.overflow <= 1, `${label}: horizontal overflow: ${JSON.stringify(value)}`);
  assert(!/\bV(?:29|92|120|121)\b|92\.00|Multiplatform nyilvános béta|Multiplatform public beta|Windows nyilvános béta|Windows public beta/i.test(value.body), `${label}: retired beta/version copy remains`);

  if (language === 'hu') {
    assert(/teljes/i.test(value.download) && !/béta/i.test(value.download), `${label}: Hungarian CTA is not full-release wording: ${JSON.stringify(value)}`);
    assert(/napos|nap/i.test(value.trial), `${label}: Hungarian trial label missing: ${JSON.stringify(value)}`);
    assert(value.licenceTitle === 'Mit ad a FormatX licenc?', `${label}: Hungarian licence title mismatch: ${JSON.stringify(value)}`);
    assert(value.footerLicence === 'Licenc', `${label}: Hungarian footer licence mismatch: ${JSON.stringify(value)}`);
    assert(value.licenceItems.some(text => /5 napos próbalicenc/i.test(text)), `${label}: 5-day trial licence missing from licence clarity`);
  } else {
    assert(/full/i.test(value.download) && !/beta/i.test(value.download), `${label}: English CTA is not full-release wording: ${JSON.stringify(value)}`);
    assert(/day/i.test(value.trial), `${label}: English trial label missing: ${JSON.stringify(value)}`);
    assert(value.licenceTitle === 'What does the FormatX licence grant?', `${label}: English licence title mismatch: ${JSON.stringify(value)}`);
    assert(value.footerLicence === 'Licence', `${label}: English footer licence mismatch: ${JSON.stringify(value)}`);
    assert(value.licenceItems.some(text => /5-day trial licence/i.test(text)), `${label}: 5-day trial licence missing from licence clarity`);
  }
}

async function verify(browser, viewport, label, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, locale: 'hu-HU' });
  await context.addInitScript(() => { try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {} });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await installProductionCopy(page);
  await waitLanguage(page, 'hu');
  check(await state(page), 'hu', label + '-hu');

  await page.locator('.fx-language-toggle:visible').first().click();
  await waitLanguage(page, 'en');
  check(await state(page), 'en', label + '-en');

  const meaningful = errors.filter(item => !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED|Failed to load resource:.*(?:403|404)/i.test(item));
  assert(!meaningful.length, `${label}: browser errors: ${meaningful.join(' | ')}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    await verify(browser, { width: 1440, height: 900 }, 'desktop', false);
    await verify(browser, { width: 390, height: 844 }, 'mobile', true);
    console.log('PASS FormatX bilingual full-release, single language control and 5-day trial licence');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exit(1); });
