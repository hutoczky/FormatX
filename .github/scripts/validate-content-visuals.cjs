'use strict';

const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const origin = new URL(base).origin;
const out = process.env.FORMATX_VISUAL_DIR || 'artifacts/content-visuals';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function injectContentLayer(page) {
  await page.addStyleTag({ url: origin + '/scifi-ui/styles/formatx-content-standard.css' });
  for (const src of [
    '/scifi-ui/scripts/release-metadata.js',
    '/scifi-ui/scripts/formatx-content-standard.js',
    '/scifi-ui/scripts/formatx-content-finalizer.js',
    '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
    '/scifi-ui/scripts/formatx-organism-semantic-state.js'
  ]) {
    await page.addScriptTag({ url: origin + src });
  }
  await page.waitForTimeout(1800);
}

async function visibleBox(page, selector) {
  return page.locator(selector).first().evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      display: style.display, visibility: style.visibility, opacity: Number(style.opacity),
      text: element.textContent.trim()
    };
  });
}

function overlap(a, b) {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

async function commonAssertions(page, mobile) {
  await page.waitForSelector('#hero-title');
  const title = await visibleBox(page, '#hero-title');
  const lead = await visibleBox(page, '#hero .hero-lead');
  const cta = await visibleBox(page, '#hero-download');
  assert(title.width > 100 && title.height > 20, 'Hero title is not visible');
  assert(lead.text.length > 80 && lead.height > 20, 'Concrete product definition is not visible');
  assert(/Windows|public beta|nyilvános béta/i.test(cta.text), 'Primary CTA does not communicate Windows beta status');
  assert(!overlap(lead, cta), 'Primary CTA overlaps the hero product definition');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 2, `Horizontal overflow detected: ${overflow}px`);
  const category = await page.locator('.fx-category-definition').first().textContent();
  assert(/Technikusi operációs réteg|Technician Operating Layer/.test(category || ''), 'Product category is missing');
  const method = await page.locator('.fx-method-inline li').count();
  assert(method === 4, `FormatX Method must have four steps, found ${method}`);
  const visibleLanguageControls = await page.locator('.fx-language-toggle:visible, .language-switch:visible, .language-control:visible').count();
  assert(visibleLanguageControls <= 1, `More than one visible language control: ${visibleLanguageControls}`);
  if (mobile) {
    const menu = await visibleBox(page, '#menu-toggle');
    assert(menu.width >= 40 && menu.height >= 40, 'Mobile menu target is too small');
  }
}

async function capture(browser, name, viewport, setup = async () => {}, contextSetup = async () => {}) {
  const context = await browser.newContext({ viewport, reducedMotion: name.includes('reduced') ? 'reduce' : 'no-preference' });
  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  await contextSetup(context);
  const page = await context.newPage();
  page.on('pageerror', error => console.warn(`[${name}] pageerror:`, error.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await injectContentLayer(page);
  await setup(page);
  await commonAssertions(page, viewport.width < 700);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  await context.close();
}

async function publicPage(browser, name, pathname, expectedSelector, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(origin + pathname, { waitUntil: 'networkidle' });
  await page.waitForSelector(expectedSelector);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 2, `${pathname} has horizontal overflow: ${overflow}px`);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
  await context.close();
}

(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await capture(browser, 'desktop-hero-hu', { width: 1440, height: 900 });
    await capture(browser, 'mobile-hero-hu', { width: 390, height: 844 });
    await capture(browser, 'small-height-hero', { width: 1366, height: 600 });
    await capture(browser, 'reduced-motion', { width: 1440, height: 900 });
    await capture(browser, 'desktop-hero-en', { width: 1440, height: 900 }, async page => {
      const single = page.locator('.fx-language-toggle:visible').first();
      if (await single.count()) await single.click();
      else await page.locator('[data-language="en"]:visible').first().click();
      await page.waitForTimeout(350);
      assert((await page.locator('html').getAttribute('lang')) === 'en', 'Language did not switch to English');
    });
    await capture(browser, 'mobile-menu-open', { width: 390, height: 844 }, async page => {
      await page.locator('#menu-toggle').click();
      await page.waitForTimeout(200);
      assert((await page.locator('#menu-toggle').getAttribute('aria-expanded')) === 'true', 'Mobile menu did not open');
      const nav = await visibleBox(page, '#main-nav');
      assert(nav.width > 100 && nav.height > 100, 'Opened mobile navigation is not visible');
    });
    await capture(browser, 'webgl-fallback', { width: 1440, height: 900 }, async () => {}, async context => {
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          if (/webgl|webgpu/i.test(String(type))) return null;
          return original.call(this, type, ...args);
        };
      });
    });
    await publicPage(browser, 'downloads', '/scifi-ui/downloads/', '[data-release-download="windows"]');
    await publicPage(browser, 'verification-centre', '/scifi-ui/verification.html', '[data-verification-root]');
    await publicPage(browser, 'test-matrix', '/scifi-ui/test-matrix.html', '[data-test-table-body]');
    console.log('Visual contract and fallback screenshots completed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
