'use strict';

const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const origin = new URL(base).origin;
const out = process.env.FORMATX_VISUAL_DIR || 'artifacts/content-visuals';
const PAUSE = '.fx-reference-pause';
const CONTROLS = '#hero .fx-reference-controls-r204';
const ASK = `${CONTROLS} .fx-reference-ask`;
const SOUND = `${CONTROLS} .fx-three-sound`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function urlWith(params = {}) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  return url.href;
}

async function visibleBox(page, selector, required = true) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) {
    if (required) throw new Error(`Missing selector: ${selector}`);
    return null;
  }
  const state = await locator.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      display: style.display,
      visibility: style.visibility,
      opacity: Number(style.opacity || 1),
      text: (element.textContent || '').trim()
    };
  });
  state.visible = state.display !== 'none' && state.visibility !== 'hidden' && state.opacity > .02 && state.width > 0 && state.height > 0;
  if (required) assert(state.visible, `Selector is not visible: ${selector} ${JSON.stringify(state)}`);
  return state.visible ? state : null;
}

function overlaps(a, b, gap = 0) {
  if (!a || !b) return false;
  return !(a.right + gap <= b.left || b.right + gap <= a.left || a.bottom + gap <= b.top || b.bottom + gap <= a.top);
}

async function overflowState(page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
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
          className: typeof element.className === 'string' ? element.className.slice(0, 140) : '',
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          position: style.position
        });
      }
    }
    return { viewport, width, overflow: width - viewport, offenders: offenders.slice(0, 16) };
  });
}

async function waitForProductShell(page) {
  await page.waitForSelector('#hero', { state: 'visible', timeout: 20000 });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const ask = document.querySelector('#hero .fx-reference-ask');
    const core = document.querySelector('.topbar .fx-reference-mag-button');
    const lead = document.querySelector('#hero .hero-lead');
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .02 && rect.width > 0 && rect.height > 0;
    };
    return root.dataset.fxControlOwnerR268 === 'ready' && visible(ask) && visible(core) && visible(lead);
  }, null, { timeout: 20000 });
  await page.waitForTimeout(250);
}

async function assertCommon(page, { mobile = false, reduced = false } = {}) {
  const hero = await visibleBox(page, '#hero');
  const lead = await visibleBox(page, '#hero .hero-lead');
  const ask = await visibleBox(page, ASK);
  const core = await visibleBox(page, '.topbar .fx-reference-mag-button');
  assert(hero.width > 200 && hero.height > 200, `Hero geometry invalid: ${JSON.stringify(hero)}`);
  assert(lead.text.length > 80, 'Hero product definition is missing or too short');
  assert(ask.width >= 44 && ask.height >= 44, `ASK target is below 44px: ${JSON.stringify(ask)}`);
  assert(core.width >= 40 && core.height >= 40, `MAG header target is too small: ${JSON.stringify(core)}`);

  const pauseCount = await page.locator(PAUSE).count();
  assert(pauseCount === 0, `Obsolete manual PAUSE returned (${pauseCount})`);

  const controls = await visibleBox(page, CONTROLS);
  const soundExists = await page.locator(SOUND).count();
  assert(soundExists === 1, `Canonical SOUND control missing or duplicated (${soundExists})`);
  const sound = await visibleBox(page, SOUND, false);
  if (sound) {
    assert(sound.width >= 44 && sound.height >= 44, `Visible SOUND target is below 44px: ${JSON.stringify(sound)}`);
    assert(!overlaps(sound, ask, 2), `SOUND and ASK overlap: ${JSON.stringify({ sound, ask, controls })}`);
  }

  const language = await page.evaluate(() => {
    const toggles = [...document.querySelectorAll('.fx-language-toggle')];
    const visible = toggles.filter(element => {
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > .02 && rect.width > 0 && rect.height > 0;
    });
    return { total: toggles.length, visible: visible.length };
  });
  assert(language.total === 1 && language.visible === 1, `Language control ownership invalid: ${JSON.stringify(language)}`);

  const overflow = await overflowState(page);
  assert(overflow.overflow <= 2, `Horizontal overflow detected: ${JSON.stringify(overflow)}`);

  if (mobile) {
    const menu = await visibleBox(page, '#menu-toggle');
    const heroSpace = await visibleBox(page, '#hero .hero-space');
    const copy = await visibleBox(page, '#hero .hero-copy');
    assert(menu.width >= 40 && menu.height >= 40, `Mobile menu target is too small: ${JSON.stringify(menu)}`);
    assert(controls.left >= heroSpace.left - 1 && controls.right <= heroSpace.right + 1,
      `Mobile controls escaped MAG stage horizontally: ${JSON.stringify({ controls, heroSpace })}`);
    assert(controls.top >= heroSpace.top - 1 && controls.bottom <= heroSpace.bottom + 1,
      `Mobile controls escaped MAG stage vertically: ${JSON.stringify({ controls, heroSpace })}`);
    const owned = await page.locator(CONTROLS).evaluate(node => node.parentElement?.classList.contains('hero-space'));
    assert(owned, 'Mobile controls are not owned by .hero-space');
    assert(copy.width >= 280 && copy.top >= heroSpace.bottom - 2,
      `Mobile hero copy must follow the MAG stage in normal flow: ${JSON.stringify({ copy, heroSpace })}`);
  } else {
    const title = await visibleBox(page, '#hero-title');
    const cta = await visibleBox(page, '#hero-download');
    const copy = await visibleBox(page, '#hero .hero-copy');
    const heroSpace = await visibleBox(page, '#hero .hero-space', false);
    assert(title.width > 100 && title.height > 20, `Desktop hero title invalid: ${JSON.stringify(title)}`);
    assert(!overlaps(lead, cta), `Desktop CTA overlaps copy: ${JSON.stringify({ lead, cta })}`);
    if (heroSpace) assert(copy.right <= heroSpace.left + 4,
      `Desktop hero copy intrudes into MAG stage: ${JSON.stringify({ copy, heroSpace })}`);
  }

  if (reduced) {
    const state = await page.evaluate(() => {
      const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
      return {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        running: (canvas?.getAnimations?.() || []).filter(animation => animation.playState === 'running').length
      };
    });
    assert(state.reduced, 'Reduced-motion media query was not applied');
    assert(state.running === 0, `Reduced-motion MAG still has running animations: ${JSON.stringify(state)}`);
  }
}

async function capture(browser, name, viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    colorScheme: 'dark',
    isMobile: Boolean(options.mobile),
    hasTouch: Boolean(options.mobile),
    deviceScaleFactor: options.mobile ? 2 : 1,
    reducedMotion: options.reduced ? 'reduce' : 'no-preference',
    locale: options.lang === 'en' ? 'en-US' : 'hu-HU'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!/WebGL|WebGPU|GPU|favicon|cloudflareinsights/i.test(text)) errors.push(text);
  });
  let failure;
  try {
    await page.goto(urlWith({ visual: `${name}-${Date.now()}`, ...(options.lang ? { lang: options.lang } : {}) }), {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await waitForProductShell(page);
    if (options.lang) {
      await page.waitForFunction(lang => document.documentElement.lang === lang, options.lang, { timeout: 8000 });
    }
    await assertCommon(page, options);
    if (typeof options.after === 'function') await options.after(page);
    assert(errors.length === 0, `${name} browser errors: ${errors.join(' | ')}`);
  } catch (error) {
    failure = error;
  } finally {
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true }).catch(() => {});
    await context.close();
  }
  if (failure) throw failure;
}

async function publicPage(browser, name, pathname, selector) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  let failure;
  try {
    await page.goto(origin + pathname, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector(selector, { state: 'attached', timeout: 15000 });
    const overflow = await overflowState(page);
    assert(overflow.overflow <= 2, `${pathname} horizontal overflow: ${JSON.stringify(overflow)}`);
  } catch (error) {
    failure = error;
  } finally {
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true }).catch(() => {});
    await context.close();
  }
  if (failure) throw failure;
}

(async () => {
  await fs.mkdir(out, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || process.env.CHROME_BIN || undefined;
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
  });
  try {
    await capture(browser, 'desktop-hero-hu', { width: 1440, height: 900 });
    await capture(browser, 'desktop-small-height', { width: 1366, height: 600 });
    await capture(browser, 'mobile-390x844', { width: 390, height: 844 }, { mobile: true });
    await capture(browser, 'mobile-430x932', { width: 430, height: 932 }, { mobile: true });
    await capture(browser, 'reduced-motion', { width: 1440, height: 900 }, { reduced: true });
    await capture(browser, 'desktop-hero-en', { width: 1440, height: 900 }, { lang: 'en' });
    await capture(browser, 'mobile-menu-open', { width: 390, height: 844 }, {
      mobile: true,
      after: async page => {
        const menu = page.locator('#menu-toggle').first();
        await menu.click();
        await page.waitForTimeout(180);
        assert((await menu.getAttribute('aria-expanded')) === 'true', 'Mobile menu did not open');
        const nav = await visibleBox(page, '#main-nav');
        assert(nav.width > 100 && nav.height > 100, `Opened mobile navigation is not visible: ${JSON.stringify(nav)}`);
      }
    });

    await publicPage(browser, 'downloads', '/scifi-ui/downloads/', '[data-release-download="multiplatform"]');
    await publicPage(browser, 'verification', '/scifi-ui/verification.html', '[data-verification-root]');
    await publicPage(browser, 'test-matrix', '/scifi-ui/test-matrix.html', '[data-test-table-body]');
    await publicPage(browser, 'known-issues', '/scifi-ui/known-issues.html', 'main');
    await publicPage(browser, 'security', '/scifi-ui/security.html', 'main');
    await publicPage(browser, 'support', '/scifi-ui/support.html', 'main');
    console.log('PASS: R532 current hero visual contract — no manual PAUSE, stable controls, responsive geometry, reduced-motion, i18n and public pages.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error?.stack || error);
  process.exit(1);
});
