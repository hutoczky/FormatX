'use strict';

const { chromium, firefox } = require('playwright');
const BASE_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForIntro(page, timeout = 7000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout });
}

async function waitForApex(page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.fxApex === 'ready',
    null,
    { timeout: 5000 }
  );
}

async function collectState(page) {
  return page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const canvas = document.getElementById('fx-apex-canvas');
    const particles = document.getElementById('fx-particle-canvas');

    return {
      renderer: document.documentElement.dataset.fxRenderer,
      rendererGuard: document.documentElement.dataset.fxRendererGuard,
      infinite: document.documentElement.dataset.fxInfinite,
      loops: Number(document.documentElement.dataset.fxLoopCount || 0),
      scene: document.documentElement.dataset.fxScene,
      flow: document.documentElement.dataset.fxFlow,
      canvas: [canvas?.width || 0, canvas?.height || 0],
      particles: [particles?.width || 0, particles?.height || 0],
      cloneCount: document.querySelectorAll('[data-loop-clone]').length,
      toggleCount: document.querySelectorAll('.loop-toggle').length,
      railCount: document.querySelectorAll('.fx-rail').length,
      oldLayerCount: document.querySelectorAll('.reference-commerce, .fx-site-ambient, .fx-system-rail').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      duplicates,
      styles: [...document.styleSheets].map(sheet => sheet.href || '').join('|'),
      scripts: [...document.scripts].map(script => script.src || '').join('|')
    };
  });
}

async function runDesktop(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));

    await page.goto(`${BASE_URL}?lang=hu&fx-renderer=webgl`, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page);
    await waitForApex(page);
    let state = await collectState(page);

    assert(errors.length === 0, `${name}: runtime errors: ${errors.join(' | ')}`);
    assert(state.renderer === 'webgl2', `${name}: forced WebGL renderer was ${state.renderer}`);
    assert(state.rendererGuard === 'forced-webgl', `${name}: guard was ${state.rendererGuard}`);
    assert(state.infinite === 'ready' && state.cloneCount === 1 && state.toggleCount === 1, `${name}: infinite scroll did not initialise`);
    assert(state.railCount === 1 && state.oldLayerCount === 0, `${name}: runtime architecture is not clean`);
    assert(state.duplicates.length === 0, `${name}: duplicate IDs: ${state.duplicates.join(', ')}`);
    assert(state.canvas[0] > 600 && state.canvas[1] > 500, `${name}: APEX canvas was not sized`);
    assert(state.overflow <= 1, `${name}: horizontal overflow ${state.overflow}px`);
    assert(state.styles.includes('formatx-apex.css') && !/formatx-igloo|reference-commerce|professional-sections/.test(state.styles), `${name}: stale styles loaded`);
    assert(state.scripts.includes('formatx-apex.js') && state.scripts.includes('formatx-performance-guard.js'), `${name}: APEX scripts missing`);
    assert(!/formatx-igloo|landing\.js|pricing-sync/.test(state.scripts), `${name}: stale scripts loaded`);

    await page.locator('[data-flow="2"]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.documentElement.dataset.fxFlow === '2');

    await page.locator('[data-language="en"]').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert((await page.locator('#experience-title').textContent()).includes('One operation'), `${name}: language switch failed`);

    await page.locator('[data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    assert((await page.locator('#preview-checkout-link').getAttribute('href')).includes('currency=EUR'), `${name}: checkout currency failed`);

    await page.locator('#resources').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    state = await collectState(page);
    assert(state.particles[0] > 500 && state.particles[1] > 250, `${name}: particle scene was not sized`);

    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    for (let cycle = 1; cycle <= 2; cycle += 1) {
      const cloneTop = await page.locator('[data-loop-clone]').evaluate(node => node.offsetTop);
      await page.evaluate(y => scrollTo(0, y + 8), cloneTop);
      await page.waitForFunction(expected => (
        Number(document.documentElement.dataset.fxLoopCount || 0) >= expected
        && scrollY < document.getElementById('experience').offsetTop
      ), cycle, { timeout: 5000 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }

    state = await collectState(page);
    assert(state.loops >= 2, `${name}: only ${state.loops} loop cycles completed`);
    assert(state.overflow <= 1, `${name}: overflow after loops ${state.overflow}px`);
    console.log(JSON.stringify({ case: name, state }));
    await context.close();
  } finally {
    await browser.close();
  }
}

async function runCanvasFallback() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } });
    const started = Date.now();
    await page.goto(`${BASE_URL}?fx-renderer=canvas`, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page, 2200);
    await waitForApex(page);
    const elapsed = Date.now() - started;
    const state = await collectState(page);

    assert(state.renderer === 'canvas2d', `fallback: renderer was ${state.renderer}`);
    assert(state.rendererGuard === 'canvas-fallback', `fallback: guard was ${state.rendererGuard}`);
    assert(elapsed < 1900, `fallback: cinematic reveal took ${elapsed}ms`);
    assert(state.infinite === 'ready' && state.overflow <= 1, 'fallback: page did not settle cleanly');
    console.log(JSON.stringify({ case: 'canvas-fallback', elapsed, state }));
  } finally {
    await browser.close();
  }
}

async function runSkip() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } });
    await page.goto(`${BASE_URL}?fx-renderer=canvas`, { waitUntil: 'domcontentloaded' });
    const button = page.locator('.fx-intro-skip');
    await button.waitFor({ state: 'visible', timeout: 1800 });
    const started = Date.now();
    await button.click();
    await waitForIntro(page, 1900);
    await waitForApex(page);
    assert(Date.now() - started < 1800, 'skip: intro did not close promptly');
  } finally {
    await browser.close();
  }
}

async function runReducedMotion() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1180, height: 820 },
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}?fx-renderer=canvas`, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page, 1900);
    await waitForApex(page);
    const state = await collectState(page);
    assert(state.renderer === 'canvas2d', 'reduced-motion: Canvas fallback did not run');
    assert(state.infinite === 'reduced-motion-disabled' && state.cloneCount === 0 && state.toggleCount === 0, 'reduced-motion: infinite scroll was not disabled');
    assert(state.overflow <= 1, 'reduced-motion: horizontal overflow');
    await context.close();
  } finally {
    await browser.close();
  }
}

async function runMobile() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(`${BASE_URL}?fx-renderer=canvas`, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page, 2200);
    await waitForApex(page);
    const state = await collectState(page);

    assert(errors.length === 0, `mobile: runtime errors: ${errors.join(' | ')}`);
    assert(state.renderer === 'canvas2d', `mobile: renderer was ${state.renderer}`);
    assert(state.canvas[0] >= 380 && state.canvas[1] >= 800, 'mobile: canvas was not sized');
    assert(state.infinite === 'ready' && state.cloneCount === 1, 'mobile: infinite scroll did not initialise');
    assert(state.overflow <= 1, `mobile: horizontal overflow ${state.overflow}px`);
    await page.locator('#menu-toggle').click();
    assert(await page.locator('#main-nav').evaluate(node => node.classList.contains('open')), 'mobile: menu did not open');
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await runDesktop(chromium, 'chromium-webgl');
  await runDesktop(firefox, 'firefox-webgl');
  await runCanvasFallback();
  await runSkip();
  await runReducedMotion();
  await runMobile();
})().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
