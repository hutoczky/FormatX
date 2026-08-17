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

async function overflowState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const clientWidth = root.clientWidth;
    const overflow = root.scrollWidth - clientWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .map(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          selector: element.id ? '#' + element.id : element.tagName.toLowerCase() + (element.classList.length ? '.' + [...element.classList].slice(0, 4).join('.') : ''),
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          transform: style.transform
        };
      })
      .filter(item => item.display !== 'none' && item.width > 0 && (item.right > clientWidth + 2 || item.left < -2))
      .sort((a, b) => Math.max(b.right - clientWidth, -b.left) - Math.max(a.right - clientWidth, -a.left))
      .slice(0, 16);
    return { clientWidth, scrollWidth: root.scrollWidth, overflow, offenders };
  });
}

async function injectProductionLikeContent(page) {
  const styles = [
    '/scifi-ui/styles/formatx-content-standard.css',
    '/scifi-ui/styles/formatx-mobile-readability.css',
    '/scifi-ui/styles/formatx-mobile-unified.css',
    '/scifi-ui/styles/formatx-mobile-hero-flow.css',
    '/scifi-ui/styles/formatx-mobile-production-r5.css'
  ];
  const scripts = [
    '/scifi-ui/scripts/single-language-toggle.js',
    '/scifi-ui/scripts/release-metadata.js',
    '/scifi-ui/scripts/formatx-content-standard.js',
    '/scifi-ui/scripts/formatx-content-finalizer.js',
    '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
    '/scifi-ui/scripts/formatx-organism-semantic-state.js',
    '/scifi-ui/scripts/formatx-mobile-unified.js'
  ];

  await page.evaluate(async ({ styles, scripts }) => {
    const appendStyle = href => new Promise((resolve, reject) => {
      if ([...document.styleSheets].some(sheet => sheet.href && new URL(sheet.href).pathname === href)) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.fxCiProductionStyle = 'true';
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', () => reject(new Error('Stylesheet failed: ' + href)), { once: true });
      document.head.appendChild(link);
    });
    const appendScript = src => new Promise((resolve, reject) => {
      if ([...document.scripts].some(script => script.src && new URL(script.src).pathname === src)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.fxCiProductionScript = 'true';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('Script failed: ' + src)), { once: true });
      document.head.appendChild(script);
    });
    for (const href of styles) await appendStyle(href);
    for (const src of scripts) await appendScript(src);
  }, { styles, scripts });

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

async function commonAssertions(page, mobile) {
  const overflow = await overflowState(page);
  assert(overflow.overflow <= 2, 'Horizontal overflow detected: ' + JSON.stringify(overflow));

  const r190State = await page.evaluate(() => ({
    apex: document.documentElement.dataset.fxApexInlineStyleWrites || '',
    energy: document.documentElement.dataset.fxLivingEnergyInlineStylesR190 || '',
    heartbeat: document.documentElement.dataset.fxLiveHeartbeatInlineStylesR190 || '',
    shapeScale: document.documentElement.dataset.fxLivingShapeScaleR167 || '',
    shapePulse: document.documentElement.dataset.fxLivingShapePulseStateR167 || ''
  }));
  assert(r190State.apex === '0', 'APEX r190 must not write inline styles: ' + JSON.stringify(r190State));
  assert(r190State.energy === '0', 'Living Energy r190 must not write inline styles: ' + JSON.stringify(r190State));
  assert(r190State.heartbeat === '0', 'Heartbeat r190 must not write inline styles: ' + JSON.stringify(r190State));
  assert(r190State.shapeScale === '1.0000,1.0000', 'Crystal DOM silhouette must remain geometrically stable: ' + JSON.stringify(r190State));
  assert(/internal-canvas|reduced-motion-static/.test(r190State.shapePulse), 'Heartbeat must be internal-canvas/reduced-motion owned: ' + JSON.stringify(r190State));

  const languageState = await page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .02 && rect.width > 0 && rect.height > 0;
    };
    const primary = [...document.querySelectorAll('[data-fx-single-language-toggle="ready-v2"]')];
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

  if (!mobile) {
    const title = await box(page, '#hero-title');
    const lead = await box(page, '#hero .hero-lead');
    const cta = await box(page, '#hero-download');
    assert(title.width > 100 && title.height > 20, 'Desktop hero title is too small');
    assert(lead.text.length > 80 && lead.height > 20, 'Desktop hero product definition is missing');
    assert(/teljes|full|multiplatform/i.test(cta.text) && !/public beta|nyilvános béta/i.test(cta.text), 'Primary CTA does not describe the full release');
    assert(!overlap(lead, cta), 'Primary CTA overlaps hero copy');
    return;
  }

  assert((await page.locator('#hero-title').count()) === 1, 'Mobile must retain one semantic H1 even when the reference composition visually replaces it');
  assert((await page.locator('#hero-download').count()) === 1, 'Mobile must retain the canonical multiplatform download action in the DOM');

  const menu = await box(page, '#menu-toggle');
  const heroSpace = await box(page, '#hero .hero-space');
  const referenceHeading = await box(page, '#hero .fx-reference-heading');
  const referenceProof = await box(page, '#hero .fx-reference-proof');
  const liveOs = await box(page, '#hero .fx-reference-liveos');
  assert(menu.width >= 40 && menu.height >= 40, 'Mobile menu target is too small');
  assert(heroSpace.width >= 300 && heroSpace.height >= 300, 'Mobile MAG field is too small');
  assert(referenceHeading.text.length >= 10, 'Mobile reference heading is missing');
  assert(referenceProof.text.length >= 90, 'Mobile proof narrative is missing');
  assert(liveOs.width >= 44 && liveOs.height >= 44, 'Mobile Live OS target is too small');
  assert(!overlap(heroSpace, referenceHeading), 'Mobile MAG field overlaps reference heading');
  assert(!overlap(referenceHeading, referenceProof), 'Mobile reference heading overlaps proof card');
  const proofContainsLive = liveOs.left >= referenceProof.left - 2 && liveOs.right <= referenceProof.right + 2 && liveOs.top >= referenceProof.top - 2 && liveOs.bottom <= referenceProof.bottom + 2;
  assert(proofContainsLive, 'Mobile Live OS target escapes proof card');

  const visibleCanvas = await page.locator('#hero .hero-space canvas:visible').count();
  assert(visibleCanvas >= 1, 'Mobile MAG canvas is not visibly rendered');

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
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const location = message.location();
    const suffix = location?.url ? ` @ ${location.url}:${location.lineNumber || 0}:${location.columnNumber || 0}` : '';
    errors.push(message.text() + suffix);
  });

  let failure;
  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await injectProductionLikeContent(page);
    await primeScrollReveals(page);
    await setup(page);
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
    const overflow = await overflowState(page);
    assert(overflow.overflow <= 2, pathname + ' horizontal overflow: ' + JSON.stringify(overflow));
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
