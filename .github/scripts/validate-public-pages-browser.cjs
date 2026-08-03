'use strict';

const { chromium } = require('playwright');

const origin = process.env.FORMATX_PUBLIC_ORIGIN || 'http://127.0.0.1:4178';
const pages = [
  ['/scifi-ui/method.html', 'method'],
  ['/scifi-ui/verification.html', 'verification'],
  ['/scifi-ui/test-matrix.html', 'test-matrix'],
  ['/scifi-ui/known-issues.html', 'known-issues'],
  ['/scifi-ui/security.html', 'security'],
  ['/scifi-ui/decision-log.html', 'decision-log'],
  ['/scifi-ui/downloads/', 'downloads'],
  ['/scifi-ui/license.html', 'license'],
  ['/scifi-ui/terms.html', 'terms'],
  ['/scifi-ui/privacy.html', 'privacy'],
  ['/scifi-ui/support.html', 'support'],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ensureRuntime(page) {
  if (!await page.locator('link[href*="formatx-content-standard.css"]').count()) {
    await page.addStyleTag({ url: origin + '/scifi-ui/styles/formatx-content-standard.css' });
  }
  if (!await page.locator('script[src*="single-language-toggle.js"]').count()) {
    await page.addScriptTag({ url: origin + '/scifi-ui/scripts/single-language-toggle.js' });
  }
  if (!await page.locator('script[src*="release-metadata.js"]').count()) {
    await page.addScriptTag({ url: origin + '/scifi-ui/scripts/release-metadata.js' });
  }
  if (!await page.locator('script[src*="formatx-public-shell.js"]').count()) {
    await page.addScriptTag({ url: origin + '/scifi-ui/scripts/formatx-public-shell.js' });
  }
  await page.waitForFunction(() => document.documentElement.dataset.fxPublicShell === 'ready-v1');
}

async function assertPage(browser, pathname, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + pathname, { waitUntil: 'domcontentloaded' });
  await ensureRuntime(page);
  await page.waitForTimeout(150);

  assert(errors.length === 0, `${name}: page errors: ${errors.join(' | ')}`);
  assert(await page.locator('header.fx-public-header').count() === 1, `${name}: canonical public header missing or duplicated`);
  assert(await page.locator('footer.fx-public-footer').count() === 1, `${name}: canonical public footer missing or duplicated`);
  assert(await page.locator('.fx-language-toggle:visible').count() === 1, `${name}: exactly one visible language toggle is required`);
  assert(await page.locator('main#main-content').count() === 1, `${name}: main-content skip target is missing or duplicated`);
  assert(await page.locator('.skip-link[href="#main-content"]').count() === 1, `${name}: canonical skip link is missing or duplicated`);

  const current = await page.locator('.fx-public-footer a[aria-current="page"]').count();
  assert(current >= 1, `${name}: current page is not identified in public navigation`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 2, `${name}: horizontal overflow ${overflow}px`);

  const toggle = page.locator('.fx-language-toggle:visible').first();
  const before = await page.locator('html').getAttribute('lang');
  await toggle.click();
  await page.waitForFunction(previous => {
    const currentLanguage = document.documentElement.lang;
    return currentLanguage !== previous && ['hu', 'en'].includes(currentLanguage);
  }, before, { timeout: 8000 });

  await context.close();
}

async function assertKnownIssues(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/scifi-ui/known-issues.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-issue-record]');

  assert(errors.length === 0, `known-issues: page errors: ${errors.join(' | ')}`);
  assert(await page.locator('[data-issues-summary] .fx-issue-metric').count() === 4, 'known-issues: summary metrics missing');
  const total = await page.locator('[data-issue-record]').count();
  assert(total >= 4, `known-issues: expected at least four canonical records, found ${total}`);

  const severity = page.locator('[data-issue-filter="severity"]');
  await severity.selectOption('medium');
  await page.waitForTimeout(80);
  const mediumVisible = await page.locator('[data-issue-record]:visible').count();
  assert(mediumVisible >= 1 && mediumVisible < total, 'known-issues: severity filter did not reduce results');

  await page.locator('[data-issue-controls] button[type="reset"]').click();
  await page.waitForTimeout(80);
  await page.locator('[data-issue-search]').fill('Linux');
  await page.waitForTimeout(80);
  const linuxVisible = await page.locator('[data-issue-record]:visible').count();
  assert(linuxVisible >= 1 && linuxVisible < total, 'known-issues: text search did not reduce results');

  await page.locator('[data-issue-controls] button[type="reset"]').click();
  await page.waitForTimeout(80);
  assert(await page.locator('[data-issue-record]:visible').count() === total, 'known-issues: reset did not restore all records');

  const toggle = page.locator('.fx-language-toggle:visible').first();
  await toggle.evaluate(node => node.click());
  await page.waitForFunction(() => {
    const result = document.querySelector('[data-issue-results]')?.textContent || '';
    return document.documentElement.lang === 'en' && /matching record/i.test(result);
  }, null, { timeout: 8000 });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 2, `known-issues: horizontal overflow ${overflow}px`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [pathname, name] of pages) {
      await assertPage(browser, pathname, name + '-desktop', { width: 1440, height: 900 });
    }
    for (const [pathname, name] of pages) {
      await assertPage(browser, pathname, name + '-mobile', { width: 390, height: 844 });
    }
    await assertKnownIssues(browser, { width: 1440, height: 900 });
    await assertKnownIssues(browser, { width: 390, height: 844 });
    console.log('PASS: public shell, skip navigation, language control, known-issues filters and responsive layouts are valid.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
