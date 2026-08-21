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

function overlap(a, b, gap = 0) {
  if (!a || !b) return false;
  return !(a.right + gap <= b.left || b.right + gap <= a.left || a.bottom + gap <= b.top || b.bottom + gap <= a.top);
}

async function box(page, selector, required = true) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) {
    if (required) throw new Error('Missing selector: ' + selector);
    return null;
  }
  const value = await locator.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
      width: rect.width, height: rect.height,
      visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .02 && rect.width > 0 && rect.height > 0,
      text: (element.textContent || '').trim()
    };
  });
  if (required) assert(value.visible, 'Selector is not visible: ' + selector);
  return value.visible ? value : null;
}

async function injectProductionLikeContent(page) {
  for (const href of [
    '/scifi-ui/styles/formatx-content-standard.css',
    '/scifi-ui/styles/formatx-mobile-readability.css',
    '/scifi-ui/styles/formatx-mobile-unified.css',
    '/scifi-ui/styles/formatx-mobile-hero-flow.css',
    '/scifi-ui/styles/formatx-mobile-production-r5.css'
  ]) {
    await page.addStyleTag({ url: origin + href });
  }

  for (const src of [
    '/scifi-ui/scripts/single-language-toggle.js',
    '/scifi-ui/scripts/release-metadata.js',
    '/scifi-ui/scripts/formatx-content-standard.js',
    '/scifi-ui/scripts/formatx-content-finalizer.js',
    '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
    '/scifi-ui/scripts/formatx-organism-semantic-state.js',
    '/scifi-ui/scripts/formatx-mobile-unified.js'
  ]) {
    await page.addScriptTag({ url: origin + src });
  }

  await page.waitForFunction(() => document.documentElement.dataset.fxSingleLanguageToggle === 'ready', null, { timeout: 8000 });
  await page.waitForTimeout(900);
}

async function primeScrollReveals(page) {
  for (const selector of ['#experience', '#capabilities', '#pricing', '#system']) {
    const target = page.locator(selector).first();
    if (!(await target.count())) continue;
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  await page.waitForTimeout(180);
}

async function waitForStableHero(page, mobile) {
  try {
    await page.waitForFunction(isMobile => {
      const visible = selector => {
        const element = document.querySelector(selector);
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .02 && rect.width > 0 && rect.height > 0;
      };
      if (isMobile) {
        return visible('#hero .hero-space')
          && visible('#hero .fx-reference-controls-r204')
          && visible('#hero .fx-reference-controls-r204 .fx-three-sound')
          && visible('#hero .fx-reference-controls-r204 .fx-reference-ask')
          && visible('#hero .fx-reference-controls-r204 .fx-reference-pause')
          && visible('#menu-toggle');
      }
      return visible('#hero-title') && visible('#hero .hero-lead') && visible('#hero-download');
    }, mobile, { timeout: 12000 });
  } catch (error) {
    const state = await page.evaluate(() => {
      const inspect = selector => {
        const element = document.querySelector(selector);
        if (!element) return { selector, exists: false };
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          selector,
          exists: true,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };
      };
      return [
        '#hero .hero-space',
        '#hero .fx-reference-controls-r204',
        '#hero .fx-reference-controls-r204 .fx-three-sound',
        '#hero .fx-reference-controls-r204 .fx-reference-ask',
        '#hero .fx-reference-controls-r204 .fx-reference-pause',
        '#menu-toggle',
        '#hero-title',
        '#hero .hero-lead',
        '#hero-download'
      ].map(inspect);
    });
    throw new Error('Hero readiness timeout: ' + JSON.stringify(state) + '\n' + (error.stack || error));
  }
}

async function horizontalOverflowDiagnostics(page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders = [];
    for (const element of document.querySelectorAll('body *')) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const rect = element.getBoundingClientRect();
      if (!Number.isFinite(rect.left) || !Number.isFinite(rect.right) || rect.width <= 0 || rect.height <= 0) continue;
      if (rect.left < -2 || rect.right > viewport + 2) {
        offenders.push({
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          className: typeof element.className === 'string' ? element.className.slice(0, 160) : '',
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          position: style.position,
          transform: style.transform
        });
      }
    }
    return {
      clientWidth: viewport,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth - viewport,
      offenders: offenders
        .sort((a, b) => Math.max(b.right - viewport, -b.left) - Math.max(a.right - viewport, -a.left))
        .slice(0, 16)
    };
  });
}

async function commonAssertions(page, mobile) {
  if (!mobile) {
    const title = await box(page, '#hero-title');
    const lead = await box(page, '#hero .hero-lead');
    const cta = await box(page, '#hero-download');
    assert(title.width > 100 && title.height > 20, 'Hero title is too small');
    assert(lead.text.length > 80 && lead.height > 20, 'Hero product definition is missing');
    assert(/teljes|full|multiplatform/i.test(cta.text) && !/public beta|nyilvános béta/i.test(cta.text), 'Primary CTA does not describe the full release');
    assert(!overlap(lead, cta), 'Primary CTA overlaps hero copy');
  }

  const overflowState = await horizontalOverflowDiagnostics(page);
  assert(overflowState.overflow <= 2, 'Horizontal overflow detected: ' + JSON.stringify(overflowState));

  const languageState = await page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .02 && rect.width > 0 && rect.height > 0;
    };
    const primary = [...document.querySelectorAll('[data-fx-single-language-toggle="ready-v3"]')];
    const toggles = [...document.querySelectorAll('.fx-language-toggle')];
    return { primary: primary.length, toggles: toggles.length, visibleToggles: toggles.filter(visible).length };
  });
  assert(languageState.primary === 1, 'Production must install exactly one semantic language switch: ' + JSON.stringify(languageState));
  assert(languageState.toggles === 1, 'Production must expose exactly one language-toggle button: ' + JSON.stringify(languageState));
  assert(languageState.visibleToggles <= 1, 'Duplicate visible language toggles detected: ' + JSON.stringify(languageState));
  if (mobile) assert(languageState.visibleToggles === 1, 'Mobile language toggle must be visible: ' + JSON.stringify(languageState));

  const proof = await box(page, '.fx-award-proof', false);
  if (proof) {
    const proofLinks = await page.locator('.fx-award-proof__grid > a:visible').count();
    assert(proofLinks === 4, 'Public proof layer must expose four distinct links, found ' + proofLinks);
  }

  if (mobile) {
    const menu = await box(page, '#menu-toggle');
    assert(menu.width >= 40 && menu.height >= 40, 'Mobile menu target is too small');

    const heroCopy = await box(page, '#hero .hero-copy', false);
    const heroSpace = await box(page, '#hero .hero-space');
    const controls = await box(page, '#hero .fx-reference-controls-r204');
    const sound = await box(page, '#hero .fx-reference-controls-r204 .fx-three-sound');
    const ask = await box(page, '#hero .fx-reference-controls-r204 .fx-reference-ask');
    const pause = await box(page, '#hero .fx-reference-controls-r204 .fx-reference-pause');
    const heading = await box(page, '#hero .fx-reference-heading');
    const category = await box(page, '.fx-category-deck--standalone, .fx-category-deck');

    assert(sound.width >= 44 && sound.height >= 44, 'Mobile sound target is too small');
    assert(ask.width >= 44 && ask.height >= 44, 'Mobile ASK target is too small');
    assert(pause.width >= 44 && pause.height >= 44, 'Mobile pause target is too small');
    assert(!overlap(sound, ask, 2), 'Mobile sound and ASK controls overlap');
    assert(!overlap(ask, pause, 2), 'Mobile ASK and pause controls overlap');
    assert(Math.abs(sound.top - ask.top) <= 8 && Math.abs(ask.top - pause.top) <= 8, 'Mobile hero controls are not one horizontal row');
    assert(controls.top >= heroSpace.bottom - 2, 'Mobile hero controls must follow the MAG in normal flow');
    if (heroCopy) assert(heroCopy.top >= controls.bottom - 2, 'Mobile hero copy must follow the controls');
    assert(heading.top >= (heroCopy?.bottom || controls.bottom) - 2, 'Mobile proof heading must follow hero content');
    assert(category.top >= heading.bottom - 2, 'Mobile next section must follow the hero reference content');

    const proofGrid = page.locator('.fx-award-proof__grid').first();
    if (await proofGrid.count()) {
      const columns = await proofGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns);
      assert(columns.trim().split(/\s+/).length === 1, 'Public proof cards are not single-column on mobile: ' + columns);
    }

    const qrBroken = await page.locator('.fx-plan-qr-card:not(.is-qr-ready) .fx-plan-qr-link img:visible').count();
    assert(qrBroken === 0, 'A not-ready QR image is visibly rendered on mobile');

    const scrollState = await page.evaluate(() => ({
      policy: document.documentElement.dataset.fxMobileScrollPolicy || '',
      mode: document.documentElement.dataset.fxMobileScrollMode || '',
      bridgeCount: document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"]').length
    }));
    assert(scrollState.policy === 'native-document-v1', 'Mobile native-document policy marker missing: ' + JSON.stringify(scrollState));
    assert(scrollState.bridgeCount === 0, 'Mobile visual loop bridge leaked into document: ' + JSON.stringify(scrollState));
  }
}

async function capture(browser, name, viewport, setup = async () => {}, targetUrl = base) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: name.includes('reduced') ? 'reduce' : 'no-preference',
    hasTouch: viewport.width < 700,
    isMobile: viewport.width < 700,
    deviceScaleFactor: viewport.width < 700 ? 2 : 1,
    colorScheme: 'dark'
  });
  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  let failure;
  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await injectProductionLikeContent(page);
    await primeScrollReveals(page);
    await setup(page);
    await waitForStableHero(page, viewport.width < 700);
    await commonAssertions(page, viewport.width < 700);
    const meaningful = errors.filter(value => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404/i.test(value));
    assert(!meaningful.length, name + ' browser errors: ' + meaningful.join(' | '));
  } catch (error) {
    failure = error;
  } finally {
    await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true }).catch(() => {});
    await context.close();
  }
  if (failure) throw failure;
}

async function publicPage(browser, name, pathname, selector, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, colorScheme: 'dark' });
  const page = await context.newPage();
  let failure;
  try {
    await page.goto(origin + pathname, { waitUntil: 'networkidle' });
    await page.waitForSelector(selector, { timeout: 10000 });
    const overflowState = await horizontalOverflowDiagnostics(page);
    assert(overflowState.overflow <= 2, pathname + ' horizontal overflow: ' + JSON.stringify(overflowState));
  } catch (error) {
    failure = error;
  } finally {
    await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true }).catch(() => {});
    await context.close();
  }
  if (failure) throw failure;
}

(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  const english = new URL(base);
  english.searchParams.set('lang', 'en');
  try {
    await capture(browser, 'desktop-hero-hu', { width: 1440, height: 900 });
    await capture(browser, 'desktop-small-height', { width: 1366, height: 600 });
    await capture(browser, 'mobile-390x844', { width: 390, height: 844 });
    await capture(browser, 'mobile-430x932', { width: 430, height: 932 });
    await capture(browser, 'reduced-motion', { width: 1440, height: 900 });
    await capture(browser, 'desktop-hero-en', { width: 1440, height: 900 }, async page => {
      await page.waitForFunction(() => document.documentElement.lang === 'en', null, { timeout: 8000 });
    }, english.href);
    await capture(browser, 'mobile-menu-open', { width: 390, height: 844 }, async page => {
      await page.locator('#menu-toggle').click();
      await page.waitForTimeout(180);
      assert((await page.locator('#menu-toggle').getAttribute('aria-expanded')) === 'true', 'Mobile menu did not open');
      const nav = await box(page, '#main-nav');
      assert(nav.width > 100 && nav.height > 100, 'Opened mobile navigation is not visible');
    });

    await publicPage(browser, 'downloads', '/scifi-ui/downloads/', '[data-release-download="multiplatform"]');
    await publicPage(browser, 'verification', '/scifi-ui/verification.html', '[data-verification-root]');
    await publicPage(browser, 'test-matrix', '/scifi-ui/test-matrix.html', '[data-test-table-body]');
    await publicPage(browser, 'known-issues', '/scifi-ui/known-issues.html', 'main');
    await publicPage(browser, 'security', '/scifi-ui/security.html', 'main');
    await publicPage(browser, 'support', '/scifi-ui/support.html', 'main');
    console.log('PASS production-like visual contracts and public pages');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});