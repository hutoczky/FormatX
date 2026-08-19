'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const ORIGIN = process.env.FORMATX_SEMANTIC_ORIGIN || 'http://127.0.0.1:4185';

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

  const state = await page.evaluate(() => {
    const emptyHeadings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(node => !node.textContent.trim())
      .map(node => ({ tag: node.tagName, id: node.id, className: node.className }));

    return {
      lang: document.documentElement.lang,
      contentGate: document.documentElement.dataset.fxContentRuntimeR241 || '',
      categoryRuntime: document.documentElement.dataset.fxCategoryPositioning || '',
      deckTitle: document.querySelector('[data-fx-category-title]')?.textContent.trim() || '',
      deckCards: document.querySelectorAll('.fx-category-grid article').length,
      proofTitle: document.querySelector('[data-fx-proof-title]')?.textContent.trim() || '',
      proofCards: document.querySelectorAll('.fx-proof-grid article').length,
      emptyHeadings,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  assert.deepEqual(runtimeErrors, [], `runtime errors: ${runtimeErrors.join(' | ')}`);
  assert.equal(state.lang, language, `language mismatch: ${JSON.stringify(state)}`);
  assert.equal(state.categoryRuntime, 'v1', `category runtime missing: ${JSON.stringify(state)}`);
  assert.match(state.contentGate, /^reduced-motion-semantic-r243|^requested-r243$/,
    `semantic gate did not hydrate before interaction: ${JSON.stringify(state)}`);
  assert.ok(state.deckTitle.length > 0, `empty category title: ${JSON.stringify(state)}`);
  assert.equal(state.deckCards, 4, `category cards missing: ${JSON.stringify(state)}`);
  assert.ok(state.proofTitle.length > 0, `proof title missing: ${JSON.stringify(state)}`);
  assert.equal(state.proofCards, 4, `proof cards missing: ${JSON.stringify(state)}`);
  assert.deepEqual(state.emptyHeadings, [], `empty semantic headings: ${JSON.stringify(state.emptyHeadings)}`);
  assert.ok(state.overflow <= 2, `horizontal overflow ${state.overflow}px`);

  console.log(`PASS semantic-first-paint ${language} ${width}x${height}`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await runCase(browser, { width: 1440, height: 900, language: 'hu' });
    await runCase(browser, { width: 1440, height: 900, language: 'en' });
    await runCase(browser, { width: 390, height: 844, language: 'hu' });
    await runCase(browser, { width: 390, height: 844, language: 'en' });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
