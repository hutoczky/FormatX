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
  await page.addStyleTag({ url: origin + '/scifi-ui/styles/formatx-mobile-readability.css' });
  await page.addStyleTag({ url: origin + '/scifi-ui/styles/formatx-mobile-unified.css' });
  await page.addStyleTag({ url: origin + '/scifi-ui/styles/formatx-mobile-hero-flow.css' });
  for (const src of [
    '/scifi-ui/scripts/release-metadata.js',
    '/scifi-ui/scripts/formatx-content-standard.js',
    '/scifi-ui/scripts/formatx-content-finalizer.js',
    '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
    '/scifi-ui/scripts/formatx-organism-semantic-state.js'
  ]) {
    await page.addScriptTag({ url: origin + src });
  }
  await page.waitForTimeout(2600);
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

async function optionalVisibleBox(page, selector) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) return null;
  return locator.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const visible = style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > .02
      && rect.width > 0
      && rect.height > 0;
    return visible ? {
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      display: style.display, visibility: style.visibility, opacity: Number(style.opacity),
      text: element.textContent.trim()
    } : null;
  });
}

function overlap(a, b, gap = 0) {
  if (!a || !b) return false;
  return !(
    a.x + a.width + gap <= b.x
    || b.x + b.width + gap <= a.x
    || a.y + a.height + gap <= b.y
    || b.y + b.height + gap <= a.y
  );
}

async function mobileLayoutAssertions(page) {
  const heroCopy = await visibleBox(page, '#hero .hero-copy');
  const heroSpace = await visibleBox(page, '#hero .hero-space');
  const cue = await visibleBox(page, '#hero .scroll-cue');
  const category = await visibleBox(page, '.fx-category-deck--standalone, .fx-category-deck');

  assert(heroCopy.y + heroCopy.height <= heroSpace.y + 2, 'Reserved 3D field starts inside the hero copy');
  assert(heroSpace.y + heroSpace.height <= cue.y + 2, 'Chapter cue overlaps the reserved 3D field');
  assert(cue.y + cue.height <= category.y + 2, 'Next category heading overlaps the hero chapter cue');
  assert(!overlap(heroCopy, category), 'Category section overlaps the mobile hero copy');

  const thought = await optionalVisibleBox(page, '.fx-organism-dialogue:not(.is-open) .fx-organism-thought-trigger');
  const genome = await optionalVisibleBox(page, '.fx-genome-launcher');
  const sound = await optionalVisibleBox(page, '.fx-three-sound');
  const dock = await optionalVisibleBox(page, '.fx-organism-actionbar');

  for (const [name, control] of [['Thought trigger', thought], ['Genome trigger', genome], ['Sound trigger', sound]]) {
    if (!control) continue;
    assert(!overlap(control, heroCopy, 4), `${name} overlaps the mobile hero copy`);
    assert(!overlap(control, cue, 4), `${name} overlaps the chapter cue`);
    if (dock) assert(!overlap(control, dock, 4), `${name} overlaps the bottom action dock`);
  }

  assert(!overlap(thought, genome, 4), 'Thought and Genome triggers overlap');
  assert(!overlap(thought, sound, 4), 'Thought and sound triggers overlap');
  assert(!overlap(genome, sound, 4), 'Genome and sound triggers overlap');
}

async function commonAssertions(page, mobile) {
  await page.waitForSelector('#hero-title');
  const title = await visibleBox(page, '#hero-title');
  const lead = await visibleBox(page, '#hero .hero-lead');
  const cta = await visibleBox(page, '#hero-download');
  assert(title.width > 100 && title.height > 20, 'Hero title is not visible');
  assert(lead.text.length > 80 && lead.height > 20, 'Concrete product definition is not visible');
  assert(/multiplatform|public beta|nyilvános béta/i.test(cta.text), 'Primary CTA does not communicate multiplatform beta status');
  assert(!overlap(lead, cta), 'Primary CTA overlaps the hero product definition');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 2, `Horizontal overflow detected: ${overflow}px`);
  const category = await page.locator('.fx-category-definition').first().textContent();
  assert(/Technikusi operációs réteg|Technician Operating Layer/.test(category || ''), 'Product category is missing');
  const method = await page.locator('.fx-method-inline li').count();
  assert(method === 4, `FormatX Method must have four steps, found ${method}`);
  const visibleLanguageControls = await page.locator('.fx-language-toggle:visible, .language-switch [data-language]:visible, .language-control [data-language-choice]:visible').count();
  assert(visibleLanguageControls <= 1, `More than one visible language control: ${visibleLanguageControls}`);
  if (mobile) {
    const menu = await visibleBox(page, '#menu-toggle');
    assert(menu.width >= 40 && menu.height >= 40, 'Mobile menu target is too small');
    await mobileLayoutAssertions(page);
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
    await capture(browser, 'mobile-hero-wide', { width: 430, height: 932 });
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
