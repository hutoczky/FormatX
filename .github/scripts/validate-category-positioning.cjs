'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4181/scifi-ui/';

async function mainPageCase(browser, language, viewport) {
  const context = await browser.newContext({ viewport, locale: language === 'hu' ? 'hu-HU' : 'en-GB' });
  const page = await context.newPage();
  await page.goto(BASE + 'index.html?lang=' + language, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.fxCategoryPositioning === 'v1', null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxSimulatorEntryState === 'ready', null, { timeout: 20000 });
  await page.waitForSelector('.fx-category-deck', { state: 'attached' });
  await page.waitForSelector('.fx-origin-proof', { state: 'attached' });

  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const heroLead = document.querySelector('.hero-lead')?.textContent.trim() || '';
    const deckTitle = document.querySelector('[data-fx-category-title]')?.textContent.trim() || '';
    const proofTitle = document.querySelector('[data-fx-proof-title]')?.textContent.trim() || '';
    const checkoutLinks = Array.from(document.querySelectorAll('a[href*="checkout.html"]')).map(anchor => anchor.href);
    const simulatorLinks = Array.from(document.querySelectorAll('[data-fx-simulator-entry]')).map(anchor => ({
      type: anchor.dataset.fxSimulatorEntry,
      text: anchor.textContent.trim(),
      href: anchor.href
    }));
    return {
      lang: root.lang,
      layer: root.dataset.fxCategoryLayer || '',
      simulatorEntry: root.dataset.fxSimulatorEntryState || '',
      heroLead,
      deckTitle,
      proofTitle,
      deckCards: document.querySelectorAll('.fx-category-grid article').length,
      proofCards: document.querySelectorAll('.fx-proof-grid article').length,
      planBullets: Array.from(document.querySelectorAll('[data-plan-id] ul')).map(list => list.children.length),
      checkoutLinks,
      simulatorLinks,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      nav: Array.from(document.querySelectorAll('.main-nav a')).map(anchor => anchor.textContent.trim())
    };
  });

  assert.equal(result.lang, language);
  assert.equal(result.layer, 'ready');
  assert.equal(result.simulatorEntry, 'ready');
  assert.equal(result.deckCards, 4);
  assert.equal(result.proofCards, 4);
  assert.deepEqual(result.planBullets, [5, 5, 5]);
  assert.ok(result.checkoutLinks.length >= 6);
  assert.ok(result.checkoutLinks.every(href => new URL(href).searchParams.get('lang') === language));
  assert.equal(result.simulatorLinks.length, 3);
  assert.deepEqual(result.simulatorLinks.map(link => link.type).sort(), ['footer', 'header', 'hero']);
  assert.ok(result.simulatorLinks.every(link => new URL(link.href).pathname.endsWith('/project-simulator.html')));
  assert.ok(result.simulatorLinks.every(link => new URL(link.href).searchParams.get('lang') === language));
  assert.ok(result.scrollWidth <= result.innerWidth + 2, 'horizontal overflow: ' + JSON.stringify(result));

  if (language === 'hu') {
    assert.match(result.heroLead, /letölthető, többplatformos technikusi rendszer/i);
    assert.match(result.deckTitle, /Saját technikusi kategória/i);
    assert.match(result.proofTitle, /Miért született meg a FormatX/i);
    assert.ok(result.simulatorLinks.some(link => /Projekt szimulátor/i.test(link.text)));
    assert.deepEqual(result.nav, ['Működés', 'Modulok', 'Licencek', 'Bizonyíték', 'Letöltés']);
  } else {
    assert.match(result.heroLead, /downloadable cross-platform technician system/i);
    assert.match(result.deckTitle, /technician category of its own/i);
    assert.match(result.proofTitle, /Why was FormatX created/i);
    assert.ok(result.simulatorLinks.some(link => /Project simulator/i.test(link.text)));
    assert.deepEqual(result.nav, ['How it works', 'Modules', 'Licences', 'Proof', 'Download']);
  }

  console.log(JSON.stringify({ case: 'main-' + language + '-' + viewport.width, result }));
  await context.close();
}

async function checkoutCase(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-GB' });
  const page = await context.newPage();
  await page.goto(BASE + 'checkout.html?plan=business_lite&cycle=monthly&currency=HUF&lang=en', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.fxCheckoutLanguage === 'authoritative-v4', null, { timeout: 15000 });

  let state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    heading: document.querySelector('.checkout-hero h1')?.textContent.trim(),
    summary: document.getElementById('checkout-title')?.textContent.trim(),
    company: document.querySelector('#checkout-form .form-grid label:nth-child(4) > span')?.textContent.trim(),
    planOption: document.querySelector('#plan-id option:checked')?.textContent.trim(),
    switchCount: document.querySelectorAll('[data-checkout-language]').length,
    body: document.body.innerText
  }));

  assert.equal(state.lang, 'en');
  assert.equal(state.title, 'Bank transfer | FormatX Suite Pro');
  assert.equal(state.heading, 'Direct bank transfer with QR');
  assert.equal(state.summary, 'Summary');
  assert.equal(state.company, 'Company or business name');
  assert.match(state.planOption, /month/);
  assert.equal(state.switchCount, 2);
  assert.doesNotMatch(state.body, /Rendelési adatok|Fizetendő|Kapcsolattartó neve|Mégsem/);

  await page.locator('[data-checkout-language="hu"]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'hu');
  state = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    heading: document.querySelector('.checkout-hero h1')?.textContent.trim(),
    summary: document.getElementById('checkout-title')?.textContent.trim(),
    urlLanguage: new URL(location.href).searchParams.get('lang')
  }));
  assert.deepEqual(state, {
    lang: 'hu',
    heading: 'Közvetlen banki átutalás QR-kóddal',
    summary: 'Összegzés',
    urlLanguage: 'hu'
  });

  console.log(JSON.stringify({ case: 'checkout-language', state }));
  await context.close();
}

async function simulatorCase(browser, viewport) {
  const context = await browser.newContext({ viewport, locale: 'hu-HU' });
  const page = await context.newPage();
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
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth
  }));

  assert.equal(state.lang, 'hu');
  assert.equal(state.mode, 'idle');
  assert.equal(state.scenarios, 4);
  assert.equal(state.platforms, 3);
  assert.equal(state.targets, 3);
  assert.match(state.title, /Teszteld a projektet/i);
  assert.ok(state.target);
  assert.ok(state.scrollWidth <= state.innerWidth + 2, 'simulator horizontal overflow: ' + JSON.stringify(state));

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
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth
  }));
  assert.equal(state.lang, 'en');
  assert.equal(state.title, 'FormatX Operational Twin | Project simulator');
  assert.match(state.heading, /Test the project/i);
  assert.equal(state.urlLanguage, 'en');
  assert.ok(state.scrollWidth <= state.innerWidth + 2, 'translated simulator horizontal overflow: ' + JSON.stringify(state));

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
