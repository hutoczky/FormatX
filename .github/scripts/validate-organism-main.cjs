'use strict';

const fs = require('fs');
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
const report = { generatedAt: new Date().toISOString(), steps: [], error: null };

function mark(step, data) {
  const entry = { step, data: data === undefined ? null : data };
  report.steps.push(entry);
  console.log('ORGANISM STEP:', step, data === undefined ? '' : JSON.stringify(data));
}
function writeReport() { fs.writeFileSync('organism-main-report.json', JSON.stringify(report, null, 2) + '\n'); }
function assert(value, message) { if (!value) throw new Error(message); }
function diagnostics(page, output) {
  page.on('pageerror', error => output.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') output.push('console-error: ' + message.text()); });
  page.on('requestfailed', request => {
    const url = request.url();
    if (/three|cdn|organism|scifi-ui/i.test(url)) output.push('requestfailed: ' + url + ' — ' + (request.failure()?.errorText || 'unknown'));
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
  await page.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  await page.goto(TEST_URL + '?organism-validation=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
  const launch = page.locator('#main-content > #hero .fx-immersive-launch').first();
  await launch.waitFor({ state: 'attached', timeout: 10000 });
  await launch.evaluate(node => node.click());
  await page.waitForFunction(() => document.documentElement.dataset.fxImmersive === 'active', null, { timeout: 10000 });
  mark(label + ': immersive-activated');
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismInterface === 'ready', null, { timeout: 45000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismMenu === 'ready', null, { timeout: 45000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxInfiniteController === 'seamless-v6', null, { timeout: 30000 });
  mark(label + ': site-ready');
}

async function state(page) {
  return page.evaluate(() => ({
    ready: document.documentElement.dataset.fxOrganismInterface,
    menuReady: document.documentElement.dataset.fxOrganismMenu,
    triggers: document.querySelectorAll('[data-organism-open]').length,
    panels: document.querySelectorAll('[data-organism-panel]').length,
    actionLinks: document.querySelectorAll('.fx-organism-actionbar a').length,
    overlayHidden: document.getElementById('fx-organism-console')?.hidden,
    pricingChildren: document.getElementById('pricing')?.children.length,
    pricingCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-id]').length,
    qrCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-qr]').length,
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    footerInResources: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
    footerInFlow: Boolean(document.querySelector('body > .site-footer')),
    scrollController: document.documentElement.dataset.fxInfiniteController || '',
    scripts: Array.from(document.scripts, item => item.src || '').join('|')
  }));
}

async function validateDesktop() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  let page = null;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'hu-HU', colorScheme: 'dark' });
    page = await context.newPage();
    const errors = [];
    diagnostics(page, errors);
    await enterSite(page, 'desktop');
    const current = await state(page);
    mark('desktop: initial-state', current);
    assert(current.ready === 'ready' && current.menuReady === 'ready', 'interface/menu not ready: ' + JSON.stringify(current));
    assert(current.scrollController === 'seamless-v6', 'seamless controller not active: ' + JSON.stringify(current));
    assert(current.triggers === 5 && current.panels === 5, 'chapter/panel count: ' + JSON.stringify(current));
    assert(current.actionLinks === 3, 'action bar links: ' + JSON.stringify(current));
    assert(current.overlayHidden === true, 'console must start hidden');
    assert(current.pricingChildren === 1, 'pricing section should contain only its interactive trigger');
    assert(current.pricingCards === 3 && current.qrCards === 3, 'commerce content was not moved intact');
    assert(current.footerInFlow && !current.footerInResources, 'footer must be normalised into document flow by seamless controller');
    assert(current.overflow <= 1, 'desktop horizontal overflow: ' + current.overflow);

    const pricingTrigger = page.locator('[data-organism-open="pricing"]');
    await pricingTrigger.scrollIntoViewIfNeeded();
    await pricingTrigger.click();
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden && !document.querySelector('[data-organism-panel="pricing"]').hidden);
    mark('desktop: pricing-panel-open');
    assert(await page.locator('body').evaluate(body => body.classList.contains('fx-organism-panel-open')), 'body panel lock missing');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'pricing cards missing in open console');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-qr]').count() === 3, 'QR cards missing in open console');
    await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkoutHref = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkoutHref).includes('currency=EUR'), 'EUR checkout did not update');
    mark('desktop: currency-updated', { checkoutHref });
    await page.locator('.fx-organism-console-close').click();
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);
    await page.waitForTimeout(550);
    mark('desktop: close-control-passed');
    await page.locator('#menu-toggle').evaluate(node => node.click());
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
    assert(await page.locator('#main-nav').evaluate(node => node.classList.contains('open')), 'interactive system menu did not open');
    await page.locator('#main-nav a[href="#pricing"]').evaluate(node => node.click());
    await page.waitForFunction(() => !document.querySelector('[data-organism-panel="pricing"]').hidden);
    mark('desktop: header-navigation-passed');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-plan-qr-image]')).every(image => image.complete && image.naturalWidth >= 32), null, { timeout: 15000 });
    const qrReady = await page.locator('[data-plan-qr-image]').evaluateAll(images => images.map(image => ({ width: image.naturalWidth, src: image.currentSrc || image.src })));
    assert(qrReady.length === 3 && qrReady.every(item => item.width >= 32), 'QR images not rendered: ' + JSON.stringify(qrReady));
    mark('desktop: qr-ready', qrReady);
    const meaningful = meaningfulDiagnostics(errors);
    assert(!meaningful.length, 'desktop diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-desktop.png', fullPage: false, timeout: 5000 }).catch(() => {});
    await context.close();
    mark('desktop: passed');
  } catch (error) {
    if (page) await page.screenshot({ path: 'organism-main-desktop-failure.png', fullPage: false, timeout: 5000 }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
}

async function validateMobile() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  let page = null;
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU' });
    page = await context.newPage();
    const errors = [];
    diagnostics(page, errors);
    await enterSite(page, 'mobile');
    const pricingTrigger = page.locator('[data-organism-open="pricing"]');
    await pricingTrigger.scrollIntoViewIfNeeded();
    const box = await pricingTrigger.boundingBox();
    mark('mobile: trigger-box', box);
    assert(box && box.x >= 0 && box.x + box.width <= 391, 'mobile pricing trigger outside viewport: ' + JSON.stringify(box));
    await pricingTrigger.tap();
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden);
    const shell = await page.locator('.fx-organism-console-shell').boundingBox();
    mark('mobile: sheet-box', shell);
    assert(shell && shell.y > 0 && shell.height <= 845, 'mobile sheet geometry: ' + JSON.stringify(shell));
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'mobile pricing cards missing');
    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 1, 'mobile horizontal overflow: ' + overflow);
    await page.locator('.fx-organism-console-close').tap();
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);
    await page.locator('#menu-toggle').evaluate(node => node.click());
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
    const meaningful = meaningfulDiagnostics(errors);
    assert(!meaningful.length, 'mobile diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-mobile.png', fullPage: false, timeout: 5000 }).catch(() => {});
    await context.close();
    mark('mobile: passed');
  } catch (error) {
    if (page) await page.screenshot({ path: 'organism-main-mobile-failure.png', fullPage: false, timeout: 5000 }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
}

(async () => {
  await validateDesktop();
  await validateMobile();
  mark('validation: passed');
  writeReport();
  console.log('Organism-first main-site validation passed.');
})().catch(error => {
  report.error = error.stack || String(error);
  writeReport();
  console.error(report.error);
  process.exit(1);
});
