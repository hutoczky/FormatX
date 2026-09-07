'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = [
  '--enable-unsafe-webgpu', '--enable-features=Vulkan,WebGPU', '--use-angle=swiftshader',
  '--use-gl=angle', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'
];
const report = { generatedAt: new Date().toISOString(), steps: [], error: null };

function mark(step, data) {
  report.steps.push({ step, data: data === undefined ? null : data });
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

async function activateImmersive(page, label) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const hit = document.querySelector('.fx-mag-heart-hit-r252');
    return root.dataset.fxOrganismInterface === 'ready'
      || (root.dataset.fxThreeLoader === 'deferred-user-activation'
        && root.dataset.fxHeartCoreR252 === 'ready'
        && root.dataset.fxMagHeartHitOwnerR542 === 'body-fixed-stage-synced'
        && root.dataset.fxMagHeartHitGeometryR542 === 'viewport-stage-synced'
        && root.dataset.fxMagHeartPhysicalRouteR546 === 'armed-trusted-stage-hit'
        && hit instanceof HTMLButtonElement
        && hit.parentElement === document.body
        && hit.dataset.fxHeartBound === 'true');
  }, null, { timeout: 30000 });
  const armed = await page.evaluate(() => ({
    threeLoader: document.documentElement.dataset.fxThreeLoader || '',
    organismInterface: document.documentElement.dataset.fxOrganismInterface || '',
    heart: document.documentElement.dataset.fxHeartCoreR252 || '',
    heartOwner: document.documentElement.dataset.fxMagHeartHitOwnerR542 || '',
    heartGeometry: document.documentElement.dataset.fxMagHeartHitGeometryR542 || '',
    heartPhysicalRoute: document.documentElement.dataset.fxMagHeartPhysicalRouteR546 || '',
    heartBound: document.querySelector('.fx-mag-heart-hit-r252')?.dataset.fxHeartBound || '',
    heartParent: document.querySelector('.fx-mag-heart-hit-r252')?.parentElement?.tagName || ''
  }));
  mark(label + ': immersive-loader-armed', armed);
  if (armed.organismInterface === 'ready') return;

  const heart = page.locator('.fx-mag-heart-hit-r252').first();
  await heart.waitFor({ state: 'visible', timeout: 10000 });
  const box = await heart.boundingBox();
  assert(box && box.width >= 80 && box.height >= 80, label + ': invalid MAG hit geometry ' + JSON.stringify(box));
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const isMobile = await page.evaluate(() => matchMedia('(max-width:900px),(pointer:coarse)').matches);
  if (isMobile) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await page.waitForFunction(() => document.documentElement.dataset.fxMagHeartPhysicalRouteR546 === 'captured-stage-hit', null, { timeout: 5000 });
  mark(label + ': immersive-activated', { source: 'trusted-physical-mag-stage-hit', x, y });

  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxThreeLoader === 'requested-on-demand'
      || root.dataset.fxOrganismInterface === 'ready';
  }, null, { timeout: 10000 });
}

async function enterSite(page, label) {
  mark(label + ': navigation-start');
  await page.goto(TEST_URL + '?organism-validation=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const skip = page.locator('.fx-intro-skip');
  if (await skip.isVisible().catch(() => false)) await skip.click({ force: true, timeout: 1500 }).catch(() => {});
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 30000 });
  await activateImmersive(page, label);
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismInterface === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismMenu === 'ready', null, { timeout: 30000 });
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
  }));
}

async function openPricingFunctionally(page) {
  const pricingTrigger = page.locator('[data-organism-open="pricing"]');
  await pricingTrigger.evaluate(node => node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }));
  await page.waitForTimeout(80);
  const box = await pricingTrigger.boundingBox();
  assert(box && box.width >= 44 && box.height >= 44, 'pricing trigger has no usable geometry: ' + JSON.stringify(box));
  await pricingTrigger.evaluate(node => node.click());
  return box;
}

async function validateDesktop() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'hu-HU', colorScheme: 'dark' });
    page = await context.newPage();
    const errors = []; diagnostics(page, errors);
    await enterSite(page, 'desktop');
    const current = await state(page); mark('desktop: initial-state', current);
    assert(current.ready === 'ready' && current.menuReady === 'ready', 'interface/menu not ready: ' + JSON.stringify(current));
    assert(current.triggers === 5 && current.panels === 5, 'chapter/panel count: ' + JSON.stringify(current));
    assert(current.actionLinks === 3, 'action bar links: ' + JSON.stringify(current));
    assert(current.overlayHidden === true, 'console must start hidden');
    assert(current.pricingChildren === 1, 'pricing section should contain only its interactive trigger');
    assert(current.pricingCards === 3 && current.qrCards === 3, 'commerce content was not moved intact');
    assert(current.footerInResources, 'footer must be inside the release/support console');
    assert(current.overflow <= 1, 'desktop horizontal overflow: ' + current.overflow);

    await openPricingFunctionally(page);
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden && !document.querySelector('[data-organism-panel="pricing"]').hidden);
    assert(await page.locator('body').evaluate(body => body.classList.contains('fx-organism-panel-open')), 'body panel lock missing');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'pricing cards missing');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-qr]').count() === 3, 'QR cards missing');

    await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkoutHref = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkoutHref).includes('currency=EUR'), 'EUR checkout did not update');
    mark('desktop: currency-updated', { checkoutHref });

    await page.locator('.fx-organism-console-close').click();
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);
    await page.locator('#menu-toggle').evaluate(node => node.click());
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
    await page.locator('#main-nav a[href="#pricing"]').evaluate(node => node.click());
    await page.waitForFunction(() => !document.querySelector('[data-organism-panel="pricing"]').hidden);

    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-plan-qr-image]')).every(image => image.complete && image.naturalWidth >= 32), null, { timeout: 15000 });
    const meaningful = meaningfulDiagnostics(errors); assert(!meaningful.length, 'desktop diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-desktop.png', fullPage: false, timeout: 5000 }).catch(() => {});
    await context.close(); mark('desktop: passed');
  } catch (error) {
    if (page) await page.screenshot({ path: 'organism-main-desktop-failure.png', fullPage: false, timeout: 5000 }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
}

async function validateMobile() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU' });
    page = await context.newPage();
    const errors = []; diagnostics(page, errors);
    await enterSite(page, 'mobile');
    const box = await openPricingFunctionally(page); mark('mobile: trigger-box', box);
    assert(box && box.x >= 0 && box.x + box.width <= 391, 'mobile pricing trigger outside viewport: ' + JSON.stringify(box));
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden);
    const shell = await page.locator('.fx-organism-console-shell').boundingBox(); mark('mobile: sheet-box', shell);
    assert(shell && shell.y > 0 && shell.height <= 845, 'mobile sheet geometry: ' + JSON.stringify(shell));
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'mobile pricing cards missing');
    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 1, 'mobile horizontal overflow: ' + overflow);
    await page.locator('.fx-organism-console-close').tap(); await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);
    await page.locator('#menu-toggle').evaluate(node => node.click()); await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
    const meaningful = meaningfulDiagnostics(errors); assert(!meaningful.length, 'mobile diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-mobile.png', fullPage: false, timeout: 5000 }).catch(() => {});
    await context.close(); mark('mobile: passed');
  } catch (error) {
    if (page) await page.screenshot({ path: 'organism-main-mobile-failure.png', fullPage: false, timeout: 5000 }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
}

(async () => {
  await validateDesktop(); await validateMobile(); mark('validation: passed'); writeReport();
  console.log('Organism-first main-site validation passed with R546 trusted physical MAG routing.');
})().catch(error => {
  report.error = error.stack || String(error); writeReport(); console.error(report.error); process.exit(1);
});