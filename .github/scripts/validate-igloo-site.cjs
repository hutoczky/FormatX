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

async function collectState(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('fx-hero-canvas');
    const hero = document.querySelector('.hero-copy');
    const engine = document.querySelector('.core-engine');
    const story = document.querySelector('.fx-story');
    return {
      ready: document.documentElement.dataset.fxIgloo === 'ready',
      overlayHidden: document.getElementById('formatx-event-horizon')?.hidden === true,
      heroOpacity: hero ? Number(getComputedStyle(hero).opacity) : -1,
      engineOpacity: engine ? Number(getComputedStyle(engine).opacity) : -1,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      storyActive: story ? story.dataset.active : null,
      railCount: document.querySelectorAll('.fx-chapter-rail').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      oldLayers: document.querySelectorAll('.fx-site-ambient, .fx-system-rail').length,
    };
  });
}

async function runDesktop(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      locale: 'hu-HU',
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));

    await page.goto(`${BASE_URL}?lang=hu`, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page);
    let state = await collectState(page);

    assert(errors.length === 0, `${name}: runtime errors: ${errors.join(' | ')}`);
    assert(state.ready, `${name}: Igloo experience did not initialise`);
    assert(state.overlayHidden, `${name}: intro overlay remained visible`);
    assert(state.heroOpacity >= 0.99 && state.engineOpacity >= 0.99, `${name}: hero content remained dimmed`);
    assert(state.canvasWidth > 400 && state.canvasHeight > 400, `${name}: immersive canvas was not sized`);
    assert(state.railCount === 1, `${name}: chapter rail count was ${state.railCount}`);
    assert(state.oldLayers === 0, `${name}: legacy ambient or rail layer still exists`);
    assert(state.overflow <= 1, `${name}: desktop overflow ${state.overflow}px`);

    const secondChapter = page.locator('[data-fx-story="1"]');
    await secondChapter.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.fx-story')?.dataset.active === '1', null, { timeout: 3000 });

    await page.locator('[data-language="en"]').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    const translated = await page.locator('.fx-story-label').textContent();
    assert(translated.includes('One controlled workflow'), `${name}: Igloo copy did not follow language switch`);

    state = await collectState(page);
    assert(state.overflow <= 1, `${name}: overflow after interactions ${state.overflow}px`);
    await context.close();
    console.log(JSON.stringify({ case: name, state }));
  } finally {
    await browser.close();
  }
}

async function runSkip() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const button = page.locator('.fx-intro-skip');
    await button.waitFor({ state: 'visible', timeout: 2600 });
    const started = Date.now();
    await button.click();
    await waitForIntro(page, 1900);
    const elapsed = Date.now() - started;
    assert(elapsed < 1800, `skip: intro took ${elapsed}ms to close`);
    console.log(JSON.stringify({ case: 'skip', elapsed }));
  } finally {
    await browser.close();
  }
}

async function runReducedMotion() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1180, height: 820 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const started = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page, 1900);
    const elapsed = Date.now() - started;
    const state = await collectState(page);
    assert(elapsed < 1800, `reduced-motion: intro took ${elapsed}ms`);
    assert(state.ready && state.overflow <= 1, 'reduced-motion: page did not settle cleanly');
    await context.close();
    console.log(JSON.stringify({ case: 'reduced-motion', elapsed, state }));
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
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForIntro(page);
    const state = await collectState(page);
    assert(errors.length === 0, `mobile: runtime errors: ${errors.join(' | ')}`);
    assert(state.ready, 'mobile: experience did not initialise');
    assert(state.canvasWidth > 300 && state.canvasHeight > 500, 'mobile: canvas was not sized');
    assert(state.overflow <= 1, `mobile: horizontal overflow ${state.overflow}px`);
    await context.close();
    console.log(JSON.stringify({ case: 'mobile', state }));
  } finally {
    await browser.close();
  }
}

(async () => {
  await runDesktop(chromium, 'chromium');
  await runDesktop(firefox, 'firefox');
  await runSkip();
  await runReducedMotion();
  await runMobile();
})().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
