'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = [
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan,WebGPU',
  '--use-angle=swiftshader',
  '--use-gl=angle',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader'
];

function assert(value, message) {
  if (!value) throw new Error(message);
}

function diagnostics(page, output) {
  page.on('pageerror', error => output.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') output.push('console-error: ' + message.text());
  });
  page.on('requestfailed', request => {
    const url = request.url();
    if (/three|cdn|organism|scifi-ui/i.test(url)) {
      output.push('requestfailed: ' + url + ' — ' + (request.failure()?.errorText || 'unknown'));
    }
  });
}

async function enterSite(page) {
  await page.goto(TEST_URL + '?organism-validation=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const skip = page.locator('.fx-intro-skip');
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismInterface === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 10000 });
}

async function state(page) {
  return page.evaluate(() => ({
    ready: document.documentElement.dataset.fxOrganismInterface,
    triggers: document.querySelectorAll('[data-organism-open]').length,
    panels: document.querySelectorAll('[data-organism-panel]').length,
    actionLinks: document.querySelectorAll('.fx-organism-actionbar a').length,
    overlayHidden: document.getElementById('fx-organism-console')?.hidden,
    pricingChildren: document.getElementById('pricing')?.children.length,
    pricingCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-id]').length,
    qrCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-qr]').length,
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    footerInResources: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer'))
  }));
}

async function validateDesktop() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'hu-HU', colorScheme: 'dark' });
    const page = await context.newPage();
    const errors = [];
    diagnostics(page, errors);
    await enterSite(page);

    let current = await state(page);
    assert(current.ready === 'ready', 'interface not ready: ' + JSON.stringify(current));
    assert(current.triggers === 5 && current.panels === 5, 'chapter/panel count: ' + JSON.stringify(current));
    assert(current.actionLinks === 3, 'action bar links: ' + JSON.stringify(current));
    assert(current.overlayHidden === true, 'console must start hidden');
    assert(current.pricingChildren === 1, 'pricing section should contain only its interactive trigger');
    assert(current.pricingCards === 3 && current.qrCards === 3, 'commerce content was not moved intact');
    assert(current.footerInResources, 'footer must be inside the release/support console');
    assert(current.overflow <= 1, 'desktop horizontal overflow: ' + current.overflow);

    const pricingTrigger = page.locator('[data-organism-open="pricing"]');
    await pricingTrigger.scrollIntoViewIfNeeded();
    await pricingTrigger.click();
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden && !document.querySelector('[data-organism-panel="pricing"]').hidden);

    assert(await page.locator('body').evaluate(body => body.classList.contains('fx-organism-panel-open')), 'body panel lock missing');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'pricing cards missing in open console');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-qr]').count() === 3, 'QR cards missing in open console');

    await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkoutHref = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkoutHref).includes('currency=EUR'), 'EUR checkout did not update');

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);

    await page.keyboard.press('2');
    await page.waitForFunction(() => !document.querySelector('[data-organism-panel="capabilities"]').hidden);
    assert(await page.locator('[data-organism-panel="capabilities"] .card').count() === 6, 'six system organs are missing');
    await page.keyboard.press('Escape');

    await page.locator('#menu-toggle').click();
    assert(await page.locator('#main-nav').evaluate(node => node.classList.contains('open')), 'interactive system menu did not open');
    await page.locator('#main-nav a[href="#pricing"]').click();
    await page.waitForFunction(() => !document.querySelector('[data-organism-panel="pricing"]').hidden);

    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-plan-qr-image]')).every(image => image.complete && image.naturalWidth >= 32), null, { timeout: 15000 });
    const qrReady = await page.locator('[data-plan-qr-image]').evaluateAll(images => images.map(image => ({ width: image.naturalWidth, src: image.currentSrc || image.src })));
    assert(qrReady.length === 3 && qrReady.every(item => item.width >= 32), 'QR images not rendered: ' + JSON.stringify(qrReady));

    const meaningful = errors.filter(item => !/GPU stall|ReadPixels|WebGPU|WGSL|swizzle|Instance dropped/i.test(item));
    assert(!meaningful.length, 'desktop diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-desktop.png', fullPage: false });
    await context.close();
  } finally {
    await browser.close();
  }
}

async function validateMobile() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU' });
    const page = await context.newPage();
    const errors = [];
    diagnostics(page, errors);
    await enterSite(page);

    const pricingTrigger = page.locator('[data-organism-open="pricing"]');
    await pricingTrigger.scrollIntoViewIfNeeded();
    const box = await pricingTrigger.boundingBox();
    assert(box && box.x >= 0 && box.x + box.width <= 391, 'mobile pricing trigger outside viewport: ' + JSON.stringify(box));
    await pricingTrigger.tap();
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden);

    const shell = await page.locator('.fx-organism-console-shell').boundingBox();
    assert(shell && shell.y > 0 && shell.height <= 845, 'mobile sheet geometry: ' + JSON.stringify(shell));
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'mobile pricing cards missing');

    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 1, 'mobile horizontal overflow: ' + overflow);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);

    const meaningful = errors.filter(item => !/GPU stall|ReadPixels|WebGPU|WGSL|swizzle|Instance dropped/i.test(item));
    assert(!meaningful.length, 'mobile diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-mobile.png', fullPage: false });
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await validateDesktop();
  await validateMobile();
  console.log('Organism-first main-site validation passed.');
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
