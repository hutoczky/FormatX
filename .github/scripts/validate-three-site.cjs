'use strict';

const { chromium, firefox } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function waitIntro(page, timeout = 8000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout });
}

async function waitThree(page, timeout = 12000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxThree === 'ready' || root.dataset.fxThree === 'error';
  }, null, { timeout });
  const status = await page.evaluate(() => document.documentElement.dataset.fxThree);
  assert(status === 'ready', 'Three.js stage failed to start: ' + status);
}

async function readState(page) {
  return page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]'), element => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const frame = document.getElementById('fx-three-frame');
    const frameDocument = frame?.contentDocument;
    const canvas = frameDocument?.querySelector('canvas');
    const rect = canvas?.getBoundingClientRect();

    return {
      three: document.documentElement.dataset.fxThree,
      renderer: document.documentElement.dataset.fxThreeRenderer,
      quality: document.documentElement.dataset.fxThreeQuality,
      infinite: document.documentElement.dataset.fxInfinite,
      loops: Number(document.documentElement.dataset.fxLoopCount || 0),
      scene: document.documentElement.dataset.fxThreeScene,
      flow: document.documentElement.dataset.fxFlow,
      frame: Boolean(frame),
      canvas: [Math.round(rect?.width || 0), Math.round(rect?.height || 0)],
      clone: document.querySelectorAll('[data-fx-loop-bridge="true"]').length,
      toggle: document.querySelectorAll('.loop-toggle').length,
      legacyCanvasHidden: Boolean(document.getElementById('fx-apex-canvas')?.hidden),
      legacyParticleHidden: Boolean(document.getElementById('fx-particle-canvas')?.hidden),
      oldRuntime: document.querySelectorAll('.fx-transcend-shell,.fx-worldstage-flow,.fx-worldstage-shock').length,
      rail: document.querySelectorAll('.fx-rail').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      duplicates,
      styles: Array.from(document.styleSheets, sheet => sheet.href || '').join('|'),
      scripts: Array.from(document.scripts, script => script.src || '').join('|'),
      frameScripts: frameDocument ? Array.from(frameDocument.scripts, script => script.src || '').join('|') : ''
    };
  });
}

async function verifyCommon(page, name, errors, minimumWidth, minimumHeight) {
  await waitIntro(page);
  await waitThree(page);
  const state = await readState(page);
  assert(!errors.length, name + ' page errors: ' + errors.join(' | '));
  assert(state.three === 'ready' && state.renderer === 'three-webgl', name + ' renderer: ' + JSON.stringify(state));
  assert(state.frame, name + ' missing Three stage iframe');
  assert(state.canvas[0] >= minimumWidth && state.canvas[1] >= minimumHeight, name + ' canvas: ' + state.canvas);
  assert(state.infinite === 'ready' && state.clone === 1 && state.toggle === 0, name + ' mandatory loop: ' + JSON.stringify(state));
  assert(state.legacyCanvasHidden && state.legacyParticleHidden && state.oldRuntime === 0, name + ' legacy renderer still active');
  assert(state.rail === 1, name + ' missing chapter rail');
  assert(!state.duplicates.length, name + ' duplicate IDs: ' + state.duplicates.join(','));
  assert(state.overflow <= 1, name + ' horizontal overflow: ' + state.overflow);
  assert(state.styles.includes('formatx-three-host.css'), name + ' missing Three host CSS');
  assert(state.scripts.includes('formatx-three-host.js'), name + ' missing Three host script');
  assert(state.frameScripts.includes('experience-entry.js'), name + ' missing Three entry module');
  return state;
}

async function desktop(browserType, name) {
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

    await page.goto(TEST_URL + '?lang=hu', { waitUntil: 'domcontentloaded' });
    let state = await verifyCommon(page, name, errors, 1200, 800);

    await page.locator('[data-flow="2"]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.documentElement.dataset.fxFlow === '2');

    await page.locator('[data-language="en"]').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    const heading = await page.locator('#experience-title').textContent();
    assert(/core|spine|decision/i.test(heading || ''), name + ' language switch: ' + heading);

    await page.locator('[data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkout = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkout).includes('currency=EUR'), name + ' checkout currency');

    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    for (let cycle = 1; cycle <= 2; cycle += 1) {
      const metrics = await page.locator('[data-fx-loop-bridge="true"]').evaluate(node => ({
        top: node.offsetTop,
        height: node.offsetHeight
      }));
      await page.evaluate(({ top, height }) => scrollTo(0, top + height * 0.86), metrics);
      await page.waitForFunction(expected => {
        return Number(document.documentElement.dataset.fxLoopCount || 0) >= expected
          && scrollY < document.getElementById('experience').offsetTop;
      }, cycle, { timeout: 7000 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }

    state = await readState(page);
    assert(state.loops >= 2, name + ' loop count: ' + state.loops);
    assert(state.overflow <= 1, name + ' loop overflow: ' + state.overflow);
    console.log(JSON.stringify({ case: name, state }));
    await context.close();
  } finally {
    await browser.close();
  }
}

async function skipIntro() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } });
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    const button = page.locator('.fx-intro-skip');
    await button.waitFor({ state: 'visible', timeout: 3000 });
    const started = Date.now();
    await button.click();
    await waitIntro(page, 2200);
    await waitThree(page);
    assert(Date.now() - started < 2200, 'intro skip too slow');
  } finally {
    await browser.close();
  }
}

async function reducedMotion() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1180, height: 820 },
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    const state = await verifyCommon(page, 'reduced-motion', errors, 1000, 700);
    assert(state.infinite === 'ready' && state.clone === 1, 'reduced motion must retain mandatory infinite loop');
    await context.close();
  } finally {
    await browser.close();
  }
}

async function mobile() {
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
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    await verifyCommon(page, 'mobile', errors, 380, 800);
    await page.locator('#menu-toggle').click();
    assert(await page.locator('#main-nav').evaluate(node => node.classList.contains('open')), 'mobile menu');
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await desktop(chromium, 'chromium');
  await desktop(firefox, 'firefox');
  await skipIntro();
  await reducedMotion();
  await mobile();
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
