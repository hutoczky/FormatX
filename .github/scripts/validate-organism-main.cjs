'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const report = { generatedAt: new Date().toISOString(), steps: [], error: null };
const mark = (step, data) => {
  report.steps.push({ step, data: data === undefined ? null : data });
  console.log('ORGANISM STEP:', step, data === undefined ? '' : JSON.stringify(data));
};
const writeReport = () => fs.writeFileSync('organism-main-report.json', JSON.stringify(report, null, 2) + '\n');
const assert = (value, message) => { if (!value) throw new Error(message); };

function diagnostics(page, output) {
  page.on('pageerror', error => output.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') output.push('console-error: ' + message.text()); });
  page.on('requestfailed', request => {
    const url = request.url();
    if (/organism|scifi-ui/i.test(url)) output.push('requestfailed: ' + url + ' — ' + (request.failure()?.errorText || 'unknown'));
  });
  page.on('response', response => {
    if (response.status() >= 400 && /organism|scifi-ui/i.test(response.url())) output.push('http-' + response.status() + ': ' + response.url());
  });
}

function meaningfulDiagnostics(items) {
  return items.filter(item => {
    if (/requestfailed: .*\/assets\/qr\/[^ ]+\.svg(?:\?[^ ]*)? — net::ERR_ABORTED/i.test(item)) return false;
    return !/GPU stall|ReadPixels|WebGPU|WGSL|swizzle|Instance dropped|Failed to load resource: the server responded with a status of 404 \(File not found\)/i.test(item);
  });
}

async function enterSite(page, label) {
  mark(label + ': navigation-start');
  await page.goto(TEST_URL + '?organism-validation=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const skip = page.locator('.fx-intro-skip');
  if (await skip.isVisible().catch(() => false)) await skip.click({ force: true, timeout: 1500 }).catch(() => {});

  if (!await page.evaluate(() => document.documentElement.dataset.fxOrganismInterface === 'ready')) {
    const ask = page.locator('#hero .fx-reference-controls-r204 .fx-reference-ask').first();
    await ask.waitFor({ state: 'visible', timeout: 15000 });
    mark(label + ': canonical-ask-activation', await ask.boundingBox());
    if (label === 'mobile') await ask.tap({ timeout: 5000 });
    else await ask.click({ timeout: 5000 });
  }

  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'delegated-r264'
      && root.classList.contains('fx-intro-complete');
  }, null, { timeout: 30000 });
  mark(label + ': site-ready');
}

async function state(page) {
  return page.evaluate(() => ({
    ready: document.documentElement.dataset.fxOrganismInterface,
    menu: document.documentElement.dataset.fxOrganismMenu,
    triggers: document.querySelectorAll('[data-organism-open]').length,
    panels: document.querySelectorAll('[data-organism-panel]').length,
    actionLinks: document.querySelectorAll('.fx-organism-actionbar a').length,
    overlayHidden: document.getElementById('fx-organism-console')?.hidden,
    pricingTriggers: document.querySelectorAll('#pricing > [data-organism-open="pricing"]').length,
    pricingShellCommerce: document.querySelectorAll('#pricing > [data-plan-id], #pricing > [data-plan-qr], #pricing > .price-grid, #pricing > #formatx-plan-qr-dock').length,
    pricingSigils: document.querySelectorAll('#pricing > .fx-r179-organ-sigil[aria-hidden="true"]').length,
    pricingCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-id]').length,
    qrCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-qr]').length,
    footerInResources: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
  }));
}

function assertBaseState(current, label) {
  assert(current.ready === 'ready' && current.menu === 'delegated-r264', label + ' interface/menu contract: ' + JSON.stringify(current));
  assert(current.triggers === 5 && current.panels === 5, label + ' chapter/panel count: ' + JSON.stringify(current));
  assert(current.actionLinks === 3, label + ' action bar links: ' + JSON.stringify(current));
  assert(current.overlayHidden === true, label + ' console must start hidden');
  assert(current.pricingTriggers === 1, label + ' pricing shell must keep exactly one trigger: ' + JSON.stringify(current));
  assert(current.pricingShellCommerce === 0, label + ' commerce leaked into pricing shell: ' + JSON.stringify(current));
  assert(current.pricingSigils <= 1, label + ' duplicate pricing sigil: ' + JSON.stringify(current));
  assert(current.pricingCards === 3 && current.qrCards === 3, label + ' commerce content missing: ' + JSON.stringify(current));
  assert(current.footerInResources, label + ' footer must live in resources panel');
  assert(current.overflow <= 1, label + ' horizontal overflow: ' + current.overflow);
}

async function openPricing(page, mobile) {
  const trigger = page.locator('[data-organism-open="pricing"]');
  await trigger.scrollIntoViewIfNeeded();
  const box = await trigger.boundingBox();
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  assert(box && box.x >= -1 && box.x + box.width <= viewport.width + 1, 'pricing trigger outside viewport: ' + JSON.stringify({ box, viewport }));
  if (mobile) await trigger.tap(); else await trigger.click();
  await page.waitForFunction(() => !document.getElementById('fx-organism-console')?.hidden && !document.querySelector('[data-organism-panel="pricing"]')?.hidden);
  assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'pricing cards missing in open console');
  return viewport;
}

async function assertQr(page) {
  await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-plan-qr-image]')).every(image => image.complete && image.naturalWidth >= 32), null, { timeout: 15000 });
  const qr = await page.locator('[data-plan-qr-image]').evaluateAll(images => images.map(image => ({ width: image.naturalWidth, src: image.currentSrc || image.src })));
  assert(qr.length === 3 && qr.every(item => item.width >= 32), 'QR images not rendered: ' + JSON.stringify(qr));
}

async function runDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'hu-HU', colorScheme: 'dark' });
  const page = await context.newPage();
  const errors = [];
  diagnostics(page, errors);
  try {
    await enterSite(page, 'desktop');
    const current = await state(page);
    mark('desktop: initial-state', current);
    assertBaseState(current, 'desktop');
    await openPricing(page, false);

    await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkoutHref = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkoutHref).includes('currency=EUR'), 'EUR checkout did not update');

    await page.locator('.fx-organism-console-close').click();
    await page.waitForFunction(() => document.getElementById('fx-organism-console')?.hidden);
    await page.locator('#menu-toggle').evaluate(node => node.click());
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
    await page.locator('#main-nav a[href="#pricing"]').evaluate(node => node.click());
    await page.waitForFunction(() => !document.querySelector('[data-organism-panel="pricing"]')?.hidden);
    await assertQr(page);

    const meaningful = meaningfulDiagnostics(errors);
    assert(!meaningful.length, 'desktop diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-desktop.png', fullPage: false, timeout: 5000 }).catch(() => {});
    mark('desktop: passed');
  } finally {
    await context.close();
  }
}

async function runMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU' });
  const page = await context.newPage();
  const errors = [];
  diagnostics(page, errors);
  try {
    await enterSite(page, 'mobile');
    const current = await state(page);
    mark('mobile: initial-state', current);
    assertBaseState(current, 'mobile');
    const viewport = await openPricing(page, true);

    const shell = await page.locator('.fx-organism-console-shell').boundingBox();
    mark('mobile: sheet-box', { shell, viewport });
    assert(
      shell
      && shell.x >= -1
      && shell.y >= -1
      && shell.x + shell.width <= viewport.width + 1
      && shell.y + shell.height <= viewport.height + 1,
      'mobile sheet must remain fully inside viewport: ' + JSON.stringify({ shell, viewport })
    );
    await assertQr(page);

    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 1, 'mobile horizontal overflow: ' + overflow);
    await page.locator('.fx-organism-console-close').tap();
    await page.waitForFunction(() => document.getElementById('fx-organism-console')?.hidden);
    await page.locator('#menu-toggle').evaluate(node => node.click());
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));

    const meaningful = meaningfulDiagnostics(errors);
    assert(!meaningful.length, 'mobile diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-mobile.png', fullPage: false, timeout: 5000 }).catch(() => {});
    mark('mobile: passed');
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await runDesktop(browser);
    await runMobile(browser);
    mark('validation: passed');
    writeReport();
    console.log('Organism-first main-site validation passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  report.error = error.stack || String(error);
  writeReport();
  console.error(report.error);
  process.exit(1);
});
