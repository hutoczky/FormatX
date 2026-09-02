'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const ORIGIN = 'http://127.0.0.1:4186';
const canonical = fs.readFileSync('docs/scifi-ui/index.html', 'utf8');

function compactRect(r) {
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

async function run(browser, language) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: language === 'en' ? 'en-GB' : 'hu-HU',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();

  await page.route(`${ORIGIN}/scifi-ui/index.html*`, async route => {
    let html = canonical
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<script\b[^>]*\/>/gi, '')
      .replace(/<link\b[^>]*platform-status\.css[^>]*>/gi, '');
    if (!html.includes('formatx-p0-first-paint-r490.css')) {
      html = html.replace(
        '</head>',
        '<link rel="stylesheet" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=r500-local">\n</head>',
      );
    }
    await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
  });

  await page.goto(`${ORIGIN}/scifi-ui/index.html?lang=${language}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(lang => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.fxReferenceProductionR244 = 'desktop';
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      if (!element.matches('input,textarea')) element.textContent = element.dataset[lang] || element.textContent;
    });
  }, language);

  await page.waitForFunction(() => Array.from(document.styleSheets)
    .some(sheet => String(sheet.href || '').includes('formatx-p0-first-paint-r490.css')));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  const before = await page.evaluate(() => {
    const q = selector => document.querySelector(selector).getBoundingClientRect();
    const state = document.querySelector('#hero .fx-hero-product-state');
    return {
      count: document.querySelectorAll('#hero .fx-hero-product-state').length,
      canonical: state?.dataset.fxCanonicalHeroProductState || '',
      copy: q('#hero .hero-copy'),
      state: q('#hero .fx-hero-product-state'),
      download: q('#hero-download'),
    };
  });

  assert.equal(before.count, 1, `${language}: canonical product-state count before runtime`);
  assert.equal(before.canonical, 'true', `${language}: canonical product-state marker missing`);

  await page.evaluate(() => {
    window.__r500InsertedHeroStates = 0;
    const hero = document.querySelector('#hero .hero-copy');
    window.__r500Observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches?.('.fx-hero-product-state') || node.querySelector?.('.fx-hero-product-state')) {
            window.__r500InsertedHeroStates += 1;
          }
        }
      }
    });
    window.__r500Observer.observe(hero, { childList: true, subtree: true });
  });

  await page.addScriptTag({ url: `${ORIGIN}/scifi-ui/scripts/platform-status.js?v=r500-local-${language}` });
  await page.waitForFunction(() => document.documentElement.dataset.fxPlatformStatus === 'ready', null, { timeout: 10000 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  const after = await page.evaluate(() => {
    window.__r500Observer.disconnect();
    const q = selector => document.querySelector(selector).getBoundingClientRect();
    return {
      insertions: window.__r500InsertedHeroStates,
      count: document.querySelectorAll('#hero .fx-hero-product-state').length,
      owner: document.documentElement.dataset.fxHeroProductState || '',
      copy: q('#hero .hero-copy'),
      state: q('#hero .fx-hero-product-state'),
      download: q('#hero-download'),
    };
  });

  const deltas = {
    copyHeight: after.copy.height - before.copy.height,
    copyY: after.copy.y - before.copy.y,
    stateHeight: after.state.height - before.state.height,
    stateY: after.state.y - before.state.y,
    downloadY: after.download.y - before.download.y,
  };

  assert.equal(after.insertions, 0, `${language}: runtime inserted a new .fx-hero-product-state`);
  assert.equal(after.count, 1, `${language}: product-state count changed`);
  assert.equal(after.owner, 'canonical-reused', `${language}: runtime did not reuse canonical node`);
  for (const [name, value] of Object.entries(deltas)) {
    assert.ok(Math.abs(value) <= 1, `${language}: ${name} delta ${value}px`);
  }

  console.log(JSON.stringify({
    language,
    before: { copy: compactRect(before.copy), state: compactRect(before.state), download: compactRect(before.download) },
    after: { copy: compactRect(after.copy), state: compactRect(after.state), download: compactRect(after.download) },
    deltas,
    insertions: after.insertions,
    owner: after.owner,
  }, null, 2));

  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await run(browser, 'hu');
    await run(browser, 'en');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
