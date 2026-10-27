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

function writeReport() {
  fs.writeFileSync('organism-main-report.json', JSON.stringify(report, null, 2) + '\n');
}

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

function meaningfulDiagnostics(items) {
  return items.filter(item => {
    if (/requestfailed: .*\/assets\/qr\/[^ ]+\.svg(?:\?[^ ]*)? — net::ERR_ABORTED/i.test(item)) {
      return false;
    }
    return !/GPU stall|ReadPixels|WebGPU|WGSL|swizzle|Instance dropped|Failed to load resource: the server responded with a status of 404 \(File not found\)/i.test(item);
  });
}

async function enterSite(page, label) {
  mark(label + ': navigation-start');
  // The legacy organism-console regression exercises genuine functionality in
  // the deliberately retained semantic HTML fallback, not the user-facing
  // exclusive MAG-only stage. The separate archive suite verifies original
  // clickable modules and Ask controls in the cinematic experience.
  await page.goto(TEST_URL + '?organism-validation=1&archive=off', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const skip = page.locator('.fx-intro-skip');
  if (await skip.isVisible().catch(() => false)) {
    await skip.click({ force: true, timeout: 1500 }).catch(() => {});
  }
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismInterface === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => ['ready','delegated-r264'].includes(document.documentElement.dataset.fxOrganismMenu || ''), null, { timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxControlOwnerR268 === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 30000 });
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
    pricingTriggers: document.querySelectorAll('#pricing > [data-organism-open="pricing"]').length,
    pricingCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-id]').length,
    qrCards: document.querySelectorAll('[data-organism-panel="pricing"] [data-plan-qr]').length,
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    footerInResources: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
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
    assert(current.ready === 'ready' && ['ready','delegated-r264'].includes(current.menuReady), 'interface/menu not ready: ' + JSON.stringify(current));
    assert(current.triggers === 5 && current.panels === 5, 'chapter/panel count: ' + JSON.stringify(current));
    assert(current.actionLinks === 3, 'action bar links: ' + JSON.stringify(current));
    assert(current.overlayHidden === true, 'console must start hidden');
    // R2207: the HTML hidden property alone is insufficient if a later
    // fullscreen display:block !important stylesheet overrides its display.
    const hiddenDisplay=await page.locator('#fx-organism-console').evaluate(node=>getComputedStyle(node).display);
    assert(hiddenDisplay==='none','hidden console is still painted: display='+hiddenDisplay);
    mark('desktop: hidden-console-css',hiddenDisplay);
    assert(current.pricingTriggers === 1, 'pricing section must expose exactly one organism trigger: ' + JSON.stringify(current));
    assert(current.pricingCards === 3 && current.qrCards === 3, 'commerce content was not moved intact');
    assert(current.footerInResources, 'footer must be inside the release/support console');
    assert(current.overflow <= 1, 'desktop horizontal overflow: ' + current.overflow);

    const pricingTrigger = page.locator('[data-organism-open="pricing"]');
    await pricingTrigger.scrollIntoViewIfNeeded();
    await pricingTrigger.click();
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden && !document.querySelector('[data-organism-panel="pricing"]').hidden);
    mark('desktop: pricing-panel-open');

    assert(await page.locator('body').evaluate(body => body.classList.contains('fx-organism-panel-open')), 'body panel lock missing');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'pricing cards missing in open console');
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-qr]').count() === 3, 'QR cards missing in open console');

    // R2217: CI intermittently stalls while waiting for a stable EUR
    // target. Record actual motion and hit-testing before the action.
    const currencyHit=await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').evaluate(async button=>{
      const samples=[];
      for(let n=0;n<12;n++){
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const rect=button.getBoundingClientRect();
        samples.push([Math.round(rect.x*100)/100,Math.round(rect.y*100)/100,
          Math.round(rect.width*100)/100,Math.round(rect.height*100)/100]);
      }
      const rect=button.getBoundingClientRect();
      const hit=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
      const panel=button.closest('.fx-organism-panel');
      return {samples,hitTag:hit?.tagName||'',hitClass:String(hit?.className||''),
        buttonIsHit:hit===button||button.contains(hit),
        panelAnimation:panel?getComputedStyle(panel).animation:'',
        panelTransform:panel?getComputedStyle(panel).transform:'',
        pointerEvents:getComputedStyle(button).pointerEvents};
    });
    mark('desktop: currency-hit-test',currencyHit);
    // R2224: let Playwright's click perform its own scroll. The prior
    // explicit evaluate() sometimes hung for 30 seconds while navigation
    // was pending, before the currency click could even be attempted.
    // R2222: the click itself succeeds, but Playwright waits for an unrelated
    // scheduled navigation and times out. Currency selection is an in-page
    // state change; assert the resulting price and checkout URL explicitly.
    await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').click({timeout:10000,noWaitAfter:true});
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkoutHref = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkoutHref).includes('currency=EUR'), 'EUR checkout did not update');
    mark('desktop: currency-updated', { checkoutHref });

    // R2205: Playwright previously timed out after the close button was
    // visible and stable. Capture the real hit target before clicking so a
    // fixed overlay/animation intercept is distinguishable from broken logic.
    const closeHit=await page.locator('.fx-organism-console-close').evaluate(button=>{
      const rect=button.getBoundingClientRect();
      const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
      const hit=document.elementFromPoint(x,y);
      return {x,y,hitTag:hit?.tagName||'',hitClass:String(hit?.className||''),
        buttonIsHit:hit===button||button.contains(hit),pointerEvents:getComputedStyle(button).pointerEvents};
    });
    mark('desktop: close-hit-test',closeHit);
    assert(closeHit.buttonIsHit,'close button is covered by another element: '+JSON.stringify(closeHit));
    // R2209: record bounding-box drift across animation frames. Playwright
    // requires a stable target before clicking; a continuously animated
    // ancestor can make a real, unobscured button impossible to click.
    const closeMotion=await page.locator('.fx-organism-console-close').evaluate(async button=>{
      const samples=[];
      for(let n=0;n<12;n++){
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const b=button.getBoundingClientRect();
        samples.push([Math.round(b.x*100)/100,Math.round(b.y*100)/100]);
      }
      const shell=button.closest('.fx-organism-console-shell');
      const style=shell?getComputedStyle(shell):null;
      return {samples,shellAnimation:style?.animation||'',shellTransform:style?.transform||''};
    });
    mark('desktop: close-motion',closeMotion);
    await page.locator('.fx-organism-console-close').click({timeout:10000});
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);
    const closedDisplay=await page.locator('#fx-organism-console').evaluate(node=>getComputedStyle(node).display);
    assert(closedDisplay==='none','closed console remains painted: display='+closedDisplay);
    mark('desktop: closed-console-css',closedDisplay);
    await page.waitForTimeout(550);
    mark('desktop: close-control-passed');

    const menuToggle=page.locator('#menu-toggle');
    await menuToggle.click();
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));
    const pricingNav=page.locator('#main-nav a[href="#pricing"]');
    await pricingNav.click();
    await page.waitForFunction(() => {
      const nav=document.getElementById('main-nav');
      const pricing=document.getElementById('pricing');
      return location.hash==='#pricing'
        && !nav?.classList.contains('open')
        && pricing instanceof HTMLElement;
    });
    const navState=await page.evaluate(()=>({
      hash:location.hash,
      navOpen:document.getElementById('main-nav')?.classList.contains('open')||false,
      pricingTop:document.getElementById('pricing')?.getBoundingClientRect().top??null
    }));
    assert(navState.hash==='#pricing','canonical header navigation did not land on pricing: '+JSON.stringify(navState));
    assert(navState.navOpen===false,'canonical header navigation did not close menu: '+JSON.stringify(navState));
    mark('desktop: header-navigation-passed',navState);

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
  } finally {
    await browser.close();
  }
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

    // R2208: verify that the fullscreen overlay is not rendered while
    // logically hidden, including on touch devices.
    const initialConsoleDisplay=await page.locator('#fx-organism-console').evaluate(node=>getComputedStyle(node).display);
    assert(initialConsoleDisplay==='none','mobile hidden console is painted: '+initialConsoleDisplay);
    mark('mobile: hidden-console-css',initialConsoleDisplay);

    const pricingTrigger = page.locator('[data-organism-open="pricing"]');
    await pricingTrigger.scrollIntoViewIfNeeded();
    const box = await pricingTrigger.boundingBox();
    mark('mobile: trigger-box', box);
    assert(box && box.x >= 0 && box.x + box.width <= 391, 'mobile pricing trigger outside viewport: ' + JSON.stringify(box));
    await pricingTrigger.tap();
    await page.waitForFunction(() => !document.getElementById('fx-organism-console').hidden);
    const openedConsoleDisplay=await page.locator('#fx-organism-console').evaluate(node=>getComputedStyle(node).display);
    assert(openedConsoleDisplay!=='none','mobile console failed to become visible after tap');
    mark('mobile: opened-console-css',openedConsoleDisplay);

    const shell = await page.locator('.fx-organism-console-shell').boundingBox();
    mark('mobile: sheet-box', shell);
    assert(shell && shell.x >= 0 && shell.y >= 0 && shell.x + shell.width <= 391 && shell.y + shell.height <= 845, 'mobile sheet geometry: ' + JSON.stringify(shell));
    assert(await page.locator('[data-organism-panel="pricing"] [data-plan-id]').count() === 3, 'mobile pricing cards missing');

    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    assert(overflow <= 1, 'mobile horizontal overflow: ' + overflow);
    await page.locator('.fx-organism-console-close').tap();
    await page.waitForFunction(() => document.getElementById('fx-organism-console').hidden);
    const closedConsoleDisplay=await page.locator('#fx-organism-console').evaluate(node=>getComputedStyle(node).display);
    assert(closedConsoleDisplay==='none','mobile closed console remains painted: '+closedConsoleDisplay);
    mark('mobile: closed-console-css',closedConsoleDisplay);

    await page.locator('#menu-toggle').tap();
    await page.waitForFunction(() => document.getElementById('main-nav')?.classList.contains('open'));

    const meaningful = meaningfulDiagnostics(errors);
    assert(!meaningful.length, 'mobile diagnostics: ' + meaningful.join(' | '));
    await page.screenshot({ path: 'organism-main-mobile.png', fullPage: false, timeout: 5000 }).catch(() => {});
    await context.close();
    mark('mobile: passed');
  } catch (error) {
    if (page) await page.screenshot({ path: 'organism-main-mobile-failure.png', fullPage: false, timeout: 5000 }).catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
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
