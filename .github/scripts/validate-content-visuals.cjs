const { chromium } = require(process.env.NODE_PATH ? `${process.env.NODE_PATH}/playwright` : 'playwright');
const fs = require('node:fs');
const path = require('node:path');

const target = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const outputDir = process.env.FORMATX_VISUAL_DIR || 'artifacts/content-visuals';
fs.mkdirSync(outputDir, { recursive: true });

function assert(value, message) {
  if (!value) throw new Error(message);
}

function overlap(a, b, tolerance = 2) {
  return !(
    a.right <= b.left + tolerance ||
    b.right <= a.left + tolerance ||
    a.bottom <= b.top + tolerance ||
    b.bottom <= a.top + tolerance
  );
}

async function box(page, selector, required = true) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) {
    if (required) throw new Error(`Missing required selector: ${selector}`);
    return null;
  }
  const result = await locator.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      display: style.display,
      visibility: style.visibility,
      opacity: Number(style.opacity || 1),
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
    };
  });
  if (required) {
    assert(result.width > 0 && result.height > 0, `${selector} has no layout box`);
    assert(result.display !== 'none' && result.visibility !== 'hidden' && result.opacity > 0, `${selector} is hidden`);
  }
  return result;
}

async function waitForStablePage(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete') || !document.documentElement.classList.contains('fx-intro-pending'), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(850);
}

async function primeScrollReveals(page) {
  // Full-page screenshots do not necessarily move the viewport through every
  // IntersectionObserver target. Visit the important production sections first
  // so screenshot geometry represents what a real user sees while scrolling.
  for (const selector of ['#experience', '#capabilities', '#pricing', '#system']) {
    const target = page.locator(selector).first();
    if (!(await target.count())) continue;
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  await page.waitForTimeout(180);
}

async function commonAssertions(page, mobile) {
  const title = await box(page, '#hero-title');
  const lead = await box(page, '#hero .hero-lead');
  const cta = await box(page, '#hero-download');
  assert(title.width > 100 && title.height > 20, 'Hero title is too small');
  assert(lead.text.length > 80 && lead.height > 20, 'Hero product definition is missing');
  assert(/teljes|full|multiplatform/i.test(cta.text) && !/public beta|nyilvános béta/i.test(cta.text), 'Primary CTA does not describe the full release');
  assert(!overlap(lead, cta), 'Primary CTA overlaps hero copy');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 2, 'Horizontal overflow detected: ' + overflow + 'px');

  // A two-button HU/EN switch is one language control. Count the visible
  // control container, not its individual choice buttons.
  const languageControls = await page.locator('.fx-language-toggle:visible, .language-switch:visible, .language-control:visible').count();
  assert(languageControls === 1, 'Production must expose exactly one visible language control: ' + languageControls);

  const proof = await box(page, '.fx-award-proof', false);
  if (proof) {
    const proofLinks = await page.locator('.fx-award-proof__grid > a:visible').count();
    assert(proofLinks === 4, 'Public proof layer must expose four distinct links, found ' + proofLinks);
  }

  if (mobile) {
    const menu = await box(page, '#menu-toggle');
    assert(menu.width >= 40 && menu.height >= 40, 'Mobile menu target is too small');

    const heroCopy = await box(page, '#hero .hero-copy');
    const heroSpace = await box(page, '#hero .hero-space');
    const cue = await box(page, '#hero .scroll-cue');
    const category = await box(page, '.fx-category-deck--standalone, .fx-category-deck');

    // Mobile is allowed to place the 3D stage before or after the text in the
    // visual order. What is forbidden is physical overlap between the blocks.
    assert(!overlap(heroCopy, heroSpace), 'Mobile hero copy overlaps the MAG stage');
    assert(!overlap(cue, heroSpace), 'Mobile scroll cue overlaps the MAG stage');
    assert(!overlap(category, heroSpace), 'Mobile category deck overlaps the MAG stage');
  }
}

async function capture(page, name, viewport, mobile) {
  await page.setViewportSize(viewport);
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForStablePage(page);
  await primeScrollReveals(page);
  await commonAssertions(page, mobile);
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newPage();
    await capture(desktop, 'desktop', { width: 1440, height: 960 }, false);
    await desktop.close();

    const mobile = await browser.newPage();
    await capture(mobile, 'mobile', { width: 390, height: 844 }, true);
    await mobile.close();
  } finally {
    await browser.close();
  }
  console.log('PASS: content visual contracts captured and validated.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
