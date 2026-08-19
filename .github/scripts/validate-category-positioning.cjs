'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4181/scifi-ui/';

function watchBrowser(page) {
  const errors = [];
  page.on('pageerror', error => errors.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/^Failed to load resource:/i.test(text)) return;
    errors.push('console: ' + text);
  });
  return errors;
}

async function mainPageCase(browser, language, viewport) {
  const context = await browser.newContext({
    viewport,
    locale: language === 'hu' ? 'hu-HU' : 'en-GB',
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();
  const errors = watchBrowser(page);

  await page.goto(BASE + 'index.html?lang=' + language, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.fxCategoryPositioning === 'v1', null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxCategoryFirstPaint === 'semantic-immediate-r243', null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxSimulatorEntryState === 'ready', null, { timeout: 20000 });
  await page.waitForSelector('.fx-category-deck', { state: 'attached', timeout: 10000 });
  await page.waitForSelector('.fx-origin-proof', { state: 'attached', timeout: 10000 });

  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const checkoutLinks = Array.from(document.querySelectorAll('a[href*="checkout.html"]')).map(anchor => anchor.href);
    const simulatorLinks = Array.from(document.querySelectorAll('[data-fx-simulator-entry]')).map(anchor => ({
      type: anchor.dataset.fxSimulatorEntry,
      text: anchor.textContent.trim(),
      href: anchor.href
    }));
    const emptyHeadings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(node => !node.textContent.trim())
      .map(node => ({ tag: node.tagName, id: node.id, className: node.className }));

    return {
      lang: root.lang,
      category: root.dataset.fxCategoryPositioning || '',
      firstPaint: root.dataset.fxCategoryFirstPaint || '',
      simulatorEntry: root.dataset.fxSimulatorEntryState || '',
      heroLead: document.querySelector('.hero-lead')?.textContent.trim() || '',
      deckTitle: document.querySelector('[data-fx-category-title]')?.textContent.trim() || '',
      proofTitle: document.querySelector('[data-fx-proof-title]')?.textContent.trim() || '',
      deckCards: document.querySelectorAll('.fx-category-grid article').length,
      proofCards: document.querySelectorAll('.fx-proof-grid article').length,
      planBullets: Array.from(document.querySelectorAll('[data-plan-id] ul')).map(list => list.children.length),
      checkoutLinks,
      simulatorLinks,
      nav: Array.from(document.querySelectorAll('.main-nav a')).map(anchor => anchor.textContent.trim()),
      emptyHeadings,
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  assert.equal(result.lang, language);
  assert.equal(result.category, 'v1');
  assert.equal(result.firstPaint, 'semantic-immediate-r243');
  assert.equal(result.simulatorEntry, 'ready');
  assert.equal(result.deckCards, 4);
  assert.equal(result.proofCards, 4);
  assert.deepEqual(result.planBullets, [5, 5, 5]);
  assert.deepEqual(result.emptyHeadings, []);
  assert.ok(result.checkoutLinks.length >= 6);
  assert.ok(result.checkoutLinks.every(href => new URL(href).searchParams.get('lang') === language));
  assert.equal(result.simulatorLinks.length, 3);
  assert.deepEqual(result.simulatorLinks.map(link => link.type).sort(), ['footer', 'header', 'hero']);
  assert.ok(result.simulatorLinks.every(link => new URL(link.href).pathname.endsWith('/project-simulator.html')));
  assert.ok(result.simulatorLinks.every(link => new URL(link.href).searchParams.get('lang') === language));
  assert.equal(result.nav.length, 5);
  assert.ok(result.nav.every(Boolean));
  assert.ok(result.overflow <= 2, 'main horizontal overflow: ' + JSON.stringify(result));

  if (language === 'hu') {
    assert.match(result.heroLead, /A FormatX nem egy eszközdoboz/i);
    assert.match(result.deckTitle, /Saját technikusi kategória/i);
    assert.match(result.proofTitle, /Miért született meg a FormatX/i);
    assert.ok(result.simulatorLinks.some(link => /Projekt szimulátor/i.test(link.text)));
  } else {
    assert.match(result.heroLead, /FormatX is not a toolbox/i);
    assert.match(result.deckTitle, /technician category of its own/i);
    assert.match(result.proofTitle, /Why was FormatX created/i);
    assert.ok(result.simulatorLinks.some(link => /Project simulator/i.test(link.text)));
  }

  assert.deepEqual(errors, [], 'main browser/CSP errors: ' + JSON.stringify(errors));
  console.log(JSON.stringify({ case: 'main-' + language + '-' + viewport.width, result }));
  await context.close();
}

async function checkoutCase(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-GB' });
  const page = await context.newPage();
  const errors = watchBrowser(page);

  await page.goto(BASE + 'checkout.html?plan=business_lite&cycle=monthly&currency=HUF&lang=en', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.fxCheckoutLanguage === 'authoritative-v5', null, { timeout: 15000 });

  let state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    heading: document.querySelector('.checkout-hero h1')?.textContent.trim(),
    summary: document.getElementById('checkout-title')?.textContent.trim(),
    businessRequired: document.getElementById('business-buyer-consent')?.required === true,
    legalRequired: document.getElementById('checkout-consent')?.required === true,
    switchCount: document.querySelectorAll('[data-checkout-language]').length,
    overflow: document.documentElement.scrollWidth - innerWidth
  }));

  assert.equal(state.lang, 'en');
  assert.equal(state.title, 'Business licence order by bank transfer | FormatX Suite Pro');
  assert.equal(state.heading, 'Direct bank transfer with QR');
  assert.equal(state.summary, 'Summary');
  assert.equal(state.businessRequired, true);
  assert.equal(state.legalRequired, true);
  assert.equal(state.switchCount, 2);
  assert.ok(state.overflow <= 2, 'checkout horizontal overflow: ' + JSON.stringify(state));

  await page.locator('[data-checkout-language="hu"]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'hu');
  state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    heading: document.querySelector('.checkout-hero h1')?.textContent.trim(),
    summary: document.getElementById('checkout-title')?.textContent.trim(),
    urlLanguage: new URL(location.href).searchParams.get('lang')
  }));
  assert.equal(state.lang, 'hu');
  assert.equal(state.heading, 'Közvetlen banki átutalás QR-kóddal');
  assert.equal(state.summary, 'Összegzés');
  assert.equal(state.urlLanguage, 'hu');
  assert.deepEqual(errors, [], 'checkout browser errors: ' + JSON.stringify(errors));

  console.log(JSON.stringify({ case: 'checkout-language', state }));
  await context.close();
}

async function simulatorCase(browser, viewport) {
  const context = await browser.newContext({ viewport, locale: 'hu-HU' });
  const page = await context.newPage();
  const errors = watchBrowser(page);

  await page.goto(BASE + 'project-simulator.html?lang=hu', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.projectSimulator === 'operational-twin-v1', null, { timeout: 10000 });

  let state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    mode: document.documentElement.dataset.simulatorState,
    scenarios: document.querySelectorAll('[data-scenario]').length,
    platforms: document.querySelectorAll('[data-platform]').length,
    targets: document.querySelectorAll('[data-target-index]').length,
    title: document.querySelector('#sim-title')?.textContent.trim(),
    target: document.getElementById('fact-target')?.textContent.trim(),
    overflow: document.documentElement.scrollWidth - innerWidth
  }));

  assert.equal(state.lang, 'hu');
  assert.equal(state.mode, 'idle');
  assert.equal(state.scenarios, 4);
  assert.equal(state.platforms, 3);
  assert.equal(state.targets, 3);
  assert.match(state.title, /Teszteld a projektet/i);
  assert.ok(state.target);
  assert.ok(state.overflow <= 2, 'simulator horizontal overflow: ' + JSON.stringify(state));

  await page.locator('[data-scenario="partition"]').click();
  await page.locator('#fault-injection').check();
  await page.locator('#run-simulation').click();
  await page.waitForFunction(() => document.documentElement.dataset.simulatorState === 'blocked', null, { timeout: 10000 });
  state = await page.evaluate(() => ({
    mode: document.documentElement.dataset.simulatorState,
    exportEnabled: !document.getElementById('export-report').disabled,
    status: document.getElementById('console-status').textContent.trim(),
    log: document.getElementById('event-log').innerText
  }));
  assert.equal(state.mode, 'blocked');
  assert.equal(state.exportEnabled, true);
  assert.equal(state.status, 'FAIL-CLOSED');
  assert.match(state.log, /INTERLOCK/);

  await page.locator('#reset-simulation').click();
  await page.locator('[data-scenario="diagnostics"]').click();
  await page.locator('#fault-injection').uncheck();
  await page.locator('#run-simulation').click();
  await page.waitForFunction(() => document.documentElement.dataset.simulatorState === 'complete', null, { timeout: 12000 });
  state = await page.evaluate(() => ({
    mode: document.documentElement.dataset.simulatorState,
    progress: document.getElementById('progress-value').textContent.trim(),
    exportEnabled: !document.getElementById('export-report').disabled,
    completedNodes: document.querySelectorAll('.workflow-node.complete').length,
    log: document.getElementById('event-log').innerText
  }));
  assert.equal(state.mode, 'complete');
  assert.equal(state.progress, '100%');
  assert.equal(state.exportEnabled, true);
  assert.equal(state.completedNodes, 5);
  assert.match(state.log, /COMPLETE/);

  await page.locator('[data-language="en"]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    heading: document.querySelector('#sim-title')?.textContent.trim(),
    urlLanguage: new URL(location.href).searchParams.get('lang'),
    overflow: document.documentElement.scrollWidth - innerWidth
  }));
  assert.equal(state.lang, 'en');
  assert.equal(state.title, 'FormatX Operational Twin | Project simulator');
  assert.match(state.heading, /Test the project/i);
  assert.equal(state.urlLanguage, 'en');
  assert.ok(state.overflow <= 2, 'translated simulator horizontal overflow: ' + JSON.stringify(state));
  assert.deepEqual(errors, [], 'simulator browser errors: ' + JSON.stringify(errors));

  console.log(JSON.stringify({ case: 'operational-twin-' + viewport.width, state }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await mainPageCase(browser, 'hu', { width: 1440, height: 1000 });
    await mainPageCase(browser, 'en', { width: 1440, height: 1000 });
    await mainPageCase(browser, 'hu', { width: 390, height: 844 });
    await checkoutCase(browser);
    await simulatorCase(browser, { width: 1440, height: 1000 });
    await simulatorCase(browser, { width: 390, height: 844 });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
