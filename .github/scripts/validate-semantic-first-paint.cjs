'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ORIGIN = process.env.FORMATX_SEMANTIC_ORIGIN || 'http://127.0.0.1:4185';
const REPO = path.resolve(__dirname, '../..');
const RECOVERY_SOURCE = fs.readFileSync(
  path.join(REPO, 'docs/scifi-ui/scripts/formatx-canonical-recovery.js'),
  'utf8',
);

async function runCase(browser, { width, height, language }) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale: language === 'en' ? 'en-GB' : 'hu-HU',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const runtimeErrors = [];

  page.on('pageerror', error => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.goto(`${ORIGIN}/scifi-ui/index.html?lang=${language}`, {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForFunction(() => {
    const title = document.querySelector('[data-fx-category-title]')?.textContent.trim() || '';
    return document.documentElement.dataset.fxCategoryPositioning === 'v1' && title.length > 0;
  }, null, { timeout: 15000 });

  if (!await page.locator('script[src*="formatx-seo.js"]').count()) {
    await page.addScriptTag({ url: `${ORIGIN}/scifi-ui/scripts/formatx-seo.js` });
  }
  await page.waitForFunction(
    () => document.documentElement.dataset.fxSeo === 'ready-v8',
    null,
    { timeout: 10000 },
  );

  const state = await page.evaluate(() => {
    const emptyHeadings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(node => !node.textContent.trim())
      .map(node => ({ tag: node.tagName, id: node.id, className: node.className }));

    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const ogUrl = document.querySelector('meta[property="og:url"]')?.content || '';
    const alternates = Object.fromEntries(
      Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'))
        .map(node => [node.hreflang, node.href]),
    );

    return {
      lang: document.documentElement.lang,
      contentGate: document.documentElement.dataset.fxContentRuntimeR241 || '',
      stability: document.documentElement.dataset.fxFirstFrameStabilityR283 || '',
      categoryRuntime: document.documentElement.dataset.fxCategoryPositioning || '',
      deckTitle: document.querySelector('[data-fx-category-title]')?.textContent.trim() || '',
      deckCards: document.querySelectorAll('.fx-category-grid article').length,
      proofTitle: document.querySelector('[data-fx-proof-title]')?.textContent.trim() || '',
      proofCards: document.querySelectorAll('.fx-proof-grid article').length,
      emptyHeadings,
      htmlOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyOverflow: document.body.scrollWidth - innerWidth,
      canonical,
      ogUrl,
      alternates,
    };
  });

  const expectedCanonical = `https://formatxsuite.com/?lang=${language}`;
  assert.deepEqual(runtimeErrors, [], `runtime errors: ${runtimeErrors.join(' | ')}`);
  assert.equal(state.lang, language, `language mismatch: ${JSON.stringify(state)}`);
  assert.equal(state.categoryRuntime, 'v1', `category runtime missing: ${JSON.stringify(state)}`);
  assert.equal(
    state.contentGate,
    'armed-r301-user-intent',
    `semantic enhancement gate was not dormant before interaction: ${JSON.stringify(state)}`,
  );
  assert.equal(state.stability, 'critical-only-r300', `critical first-frame stability marker missing: ${JSON.stringify(state)}`);
  assert.ok(state.deckTitle.length > 0, `empty category title: ${JSON.stringify(state)}`);
  assert.equal(state.deckCards, 4, `category cards missing: ${JSON.stringify(state)}`);
  assert.ok(state.proofTitle.length > 0, `proof title missing: ${JSON.stringify(state)}`);
  assert.equal(state.proofCards, 4, `proof cards missing: ${JSON.stringify(state)}`);
  assert.deepEqual(state.emptyHeadings, [], `empty semantic headings: ${JSON.stringify(state.emptyHeadings)}`);
  assert.ok(state.htmlOverflow <= 2, `html horizontal overflow ${state.htmlOverflow}px`);
  assert.ok(state.bodyOverflow <= 2, `body horizontal overflow ${state.bodyOverflow}px`);
  assert.equal(state.canonical, expectedCanonical, `canonical language URL mismatch: ${JSON.stringify(state)}`);
  assert.equal(state.ogUrl, expectedCanonical, `og:url language URL mismatch: ${JSON.stringify(state)}`);
  assert.equal(state.alternates.hu, 'https://formatxsuite.com/?lang=hu');
  assert.equal(state.alternates.en, 'https://formatxsuite.com/?lang=en');
  assert.equal(state.alternates['x-default'], 'https://formatxsuite.com/');

  console.log(`PASS semantic-first-paint ${language} ${width}x${height}`);
  await context.close();
}

async function recoveryCase(browser, language) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requested = `https://formatxsuite.com/?lang=${language}&_fx_redirect_recovery=1#pricing`;

  await page.route('https://formatxsuite.com/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/scifi-ui/scripts/formatx-canonical-recovery.js') {
      await route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: RECOVERY_SOURCE });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html><head><title>FormatX recovery test</title></head><body><script src="/scifi-ui/scripts/formatx-canonical-recovery.js"></script></body></html>',
    });
  });

  await page.goto(requested, { waitUntil: 'load' });
  await page.waitForFunction(() => !new URL(location.href).searchParams.has('_fx_redirect_recovery'));
  assert.equal(page.url(), `https://formatxsuite.com/?lang=${language}#pricing`);
  console.log(`PASS canonical-recovery ${language}`);
  await context.close();
}

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {})
  });
  try {
    await runCase(browser, { width: 1440, height: 900, language: 'hu' });
    await runCase(browser, { width: 1440, height: 900, language: 'en' });
    await runCase(browser, { width: 390, height: 844, language: 'hu' });
    await runCase(browser, { width: 390, height: 844, language: 'en' });
    await recoveryCase(browser, 'hu');
    await recoveryCase(browser, 'en');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
