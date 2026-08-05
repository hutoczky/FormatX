'use strict';

const { chromium, firefox } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = ['--enable-unsafe-swiftshader'];
const immersiveUrl = parameters => TEST_URL
  + (TEST_URL.includes('?') ? '&' : '?')
  + 'immersive=1'
  + (parameters ? '&' + parameters : '');

function assert(value, message) {
  if (!value) throw new Error(message);
}

function launchOptions(browserType) {
  if (browserType === chromium) return { headless: true, args: CHROMIUM_ARGS };
  return {
    headless: true,
    firefoxUserPrefs: {
      'webgl.disabled': false,
      'webgl.force-enabled': true,
      'webgl.enable-webgl2': true
    }
  };
}

function attachDiagnostics(page, diagnostics) {
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push('console-error: ' + message.text());
  });
  page.on('requestfailed', request => {
    diagnostics.push('requestfailed: ' + request.url() + ' — ' + (request.failure()?.errorText || 'unknown'));
  });
}

async function waitIntro(page, timeout = 15000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout });
}

async function waitRuntime(page, diagnostics, timeout = 30000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxThree === 'ready'
      && root.dataset.fxThreeRenderer === 'three-webgl-living-core-v2'
      && root.dataset.fxInfiniteController === 'boundary-v3'
      && root.dataset.fxInfiniteScroll === 'ready-v3'
      && root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'ready'
      && root.dataset.fxSingleLanguageToggle === 'ready';
  }, null, { timeout });

  const status = await page.evaluate(() => ({
    three: document.documentElement.dataset.fxThree,
    error: document.documentElement.dataset.fxThreeError || '',
  }));
  if (status.three !== 'ready') {
    throw new Error('Living Core V2 failed to start: ' + JSON.stringify(status) + ' | ' + diagnostics.join(' | '));
  }
}

async function readState(page) {
  return page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]'), element => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const frame = document.getElementById('fx-three-frame');
    const frameDocument = frame?.contentDocument;
    const canvases = frameDocument ? Array.from(frameDocument.querySelectorAll('canvas')) : [];
    const canvas = canvases.at(-1);
    const rect = canvas?.getBoundingClientRect();
    const apex = document.getElementById('fx-apex-canvas');
    const particles = document.getElementById('fx-particle-canvas');

    return {
      three: document.documentElement.dataset.fxThree || '',
      renderer: document.documentElement.dataset.fxThreeRenderer || '',
      coreForm: document.documentElement.dataset.fxCoreForm || '',
      mobileEngine: document.documentElement.dataset.fxMobile3dEngine || '',
      infiniteController: document.documentElement.dataset.fxInfiniteController || '',
      infiniteReady: document.documentElement.dataset.fxInfiniteScroll || '',
      loops: Number(document.documentElement.dataset.fxLoopCount || 0),
      loopSource: document.documentElement.dataset.fxLoopSource || '',
      scene: document.documentElement.dataset.fxScene || '',
      organism: document.documentElement.dataset.fxOrganismInterface || '',
      menu: document.documentElement.dataset.fxOrganismMenu || '',
      languageToggle: document.documentElement.dataset.fxSingleLanguageToggle || '',
      frame: Boolean(frame),
      frameSrc: frame instanceof HTMLIFrameElement ? frame.src : '',
      canvasCount: canvases.length,
      canvas: [Math.round(rect?.width || 0), Math.round(rect?.height || 0)],
      cloneCount: document.querySelectorAll('[data-fx-loop-bridge]').length,
      shellCount: document.querySelectorAll('.fx-three-stage-shell').length,
      mainCanvasCount: document.querySelectorAll('canvas').length,
      moduleCount: document.querySelectorAll('script[data-fx-transcend-module]').length,
      legacyCanvasHidden: !apex || getComputedStyle(apex).display === 'none',
      legacyParticleHidden: !particles || getComputedStyle(particles).display === 'none',
      oldRuntime: document.querySelectorAll('.fx-transcend-shell,.fx-worldstage-flow,.fx-worldstage-shock').length,
      rail: document.querySelectorAll('.fx-rail').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      duplicates,
      scripts: Array.from(document.scripts, script => script.src || '').join('|'),
      frameScripts: frameDocument ? Array.from(frameDocument.scripts, script => script.src || '').join('|') : ''
    };
  });
}

function meaningfulDiagnostics(diagnostics, state) {
  return diagnostics.filter(item => {
    if (/favicon|net::ERR_ABORTED/i.test(item)) return false;
    if (state.three === 'ready' && /WebGL stall due to ReadPixels|GPU stall/i.test(item)) return false;
    return true;
  });
}

async function verifyCommon(page, name, diagnostics, minimumWidth, minimumHeight) {
  await waitIntro(page);
  await waitRuntime(page, diagnostics);
  const state = await readState(page);
  const errors = meaningfulDiagnostics(diagnostics, state);

  assert(!errors.length, name + ' browser diagnostics: ' + errors.join(' | '));
  assert(state.three === 'ready', name + ' stage state: ' + JSON.stringify(state));
  assert(state.renderer === 'three-webgl-living-core-v2', name + ' renderer: ' + JSON.stringify(state));
  assert(state.coreForm === 'visible-organic-living-core-v2', name + ' core form: ' + JSON.stringify(state));
  assert(state.mobileEngine === 'living-core-v2-running', name + ' engine state: ' + JSON.stringify(state));
  assert(state.frame && state.shellCount === 1, name + ' must expose one stage iframe: ' + JSON.stringify(state));
  assert(state.frameSrc.includes('three-stage-mobile.html') && state.frameSrc.includes('20260729-living-stage-v2'), name + ' stale stage URL: ' + state.frameSrc);
  assert(state.canvasCount === 1, name + ' must expose exactly one active 3D canvas: ' + JSON.stringify(state));
  assert(state.canvas[0] >= minimumWidth && state.canvas[1] >= minimumHeight, name + ' canvas too small: ' + state.canvas);
  assert(state.infiniteController === 'boundary-v3' && state.infiniteReady === 'ready-v3', name + ' infinite controller: ' + JSON.stringify(state));
  assert(state.cloneCount === 0, name + ' clone-based loop returned: ' + JSON.stringify(state));
  assert(state.legacyCanvasHidden && state.legacyParticleHidden && state.oldRuntime === 0, name + ' legacy renderer still active');
  assert(state.rail === 1, name + ' missing chapter rail');
  assert(state.organism === 'ready' && state.menu === 'ready', name + ' Organism UI incomplete');
  assert(state.languageToggle === 'ready', name + ' single language toggle missing');
  assert(!state.duplicates.length, name + ' duplicate IDs: ' + state.duplicates.join(','));
  assert(state.overflow <= 1, name + ' horizontal overflow: ' + state.overflow);
  assert(state.scripts.includes('formatx-three-host-safe.js'), name + ' missing safe Three host');
  assert(state.scripts.includes('formatx-infinite-scroll.js'), name + ' missing boundary loop controller');
  assert(!/formatx-infinite-loop-(?:fix|controller-v2)\.js/.test(state.scripts), name + ' legacy loop controller loaded');
  assert(state.scripts.includes('organism-interface.js'), name + ' missing organism interface');
  assert(state.frameScripts.includes('mobile-webgl-entry.js'), name + ' missing Living Core entry module');
  return state;
}

async function openOrganismPanel(page, id) {
  const trigger = page.locator('[data-organism-open="' + id + '"]');
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForFunction(panelId => {
    const consoleRoot = document.getElementById('fx-organism-console');
    const panel = document.querySelector('[data-organism-panel="' + panelId + '"]');
    return consoleRoot && !consoleRoot.hidden && consoleRoot.classList.contains('is-authorised-open') && panel && !panel.hidden;
  }, id);
}

async function closeOrganismPanel(page) {
  const close = page.locator('.fx-organism-console-close');
  if (await close.isVisible().catch(() => false)) await close.click();
  await page.waitForFunction(() => document.getElementById('fx-organism-console')?.hidden === true);
}

async function footprint(page) {
  const state = await readState(page);
  return {
    shellCount: state.shellCount,
    canvasCount: state.canvasCount,
    mainCanvasCount: state.mainCanvasCount,
    moduleCount: state.moduleCount,
    cloneCount: state.cloneCount,
  };
}

async function performLoop(page, expectedCount) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(count => (
    Number(document.documentElement.dataset.fxLoopCount || 0) === count
    && document.documentElement.dataset.fxInfiniteInput === 'idle'
  ), expectedCount, { timeout: 15000 });
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxScene === '0'
    && document.documentElement.dataset.fxOrganismState === 'core'
    && location.hash === '#hero'
  ));
}

async function verifyTwoLoops(page, name) {
  await performLoop(page, 1);
  const first = await footprint(page);
  await page.waitForTimeout(420);
  await performLoop(page, 2);
  const second = await footprint(page);
  assert(JSON.stringify(first) === JSON.stringify(second), name + ' resources accumulated across loops: ' + JSON.stringify({ first, second }));
}

async function desktop(browserType, name) {
  const browser = await browserType.launch(launchOptions(browserType));
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'hu-HU', colorScheme: 'dark' });
    const page = await context.newPage();
    const diagnostics = [];
    attachDiagnostics(page, diagnostics);
    await page.goto(immersiveUrl('lang=hu'), { waitUntil: 'domcontentloaded' });
    await verifyCommon(page, name, diagnostics, 300, 300);

    await openOrganismPanel(page, 'experience');
    const flowCard = page.locator('[data-organism-panel="experience"] [data-flow="2"]');
    await flowCard.scrollIntoViewIfNeeded();
    await flowCard.hover();
    await page.waitForFunction(() => document.documentElement.dataset.fxFlow === '2');
    await closeOrganismPanel(page);

    const languageToggle = page.locator('.fx-language-toggle');
    await languageToggle.click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert((await languageToggle.textContent())?.trim() === 'EN', name + ' language toggle did not switch to EN');

    await openOrganismPanel(page, 'pricing');
    await page.locator('[data-organism-panel="pricing"] [data-currency="EUR"]').click();
    await page.waitForFunction(() => document.getElementById('preview-main-price')?.textContent.includes('44'));
    const checkout = await page.locator('#preview-checkout-link').getAttribute('href');
    assert(String(checkout).includes('currency=EUR'), name + ' checkout currency');
    await closeOrganismPanel(page);

    await verifyTwoLoops(page, name);
    console.log(JSON.stringify({ case: name, state: await readState(page) }));
    await context.close();
  } finally {
    await browser.close();
  }
}

async function skipIntro() {
  const browser = await chromium.launch(launchOptions(chromium));
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 840 } });
    const diagnostics = [];
    attachDiagnostics(page, diagnostics);
    await page.goto(immersiveUrl(), { waitUntil: 'domcontentloaded' });
    const button = page.locator('.fx-intro-skip');
    await button.waitFor({ state: 'visible', timeout: 3000 });
    const started = Date.now();
    await button.click();
    await waitIntro(page, 2500);
    assert(Date.now() - started < 2500, 'intro skip too slow');
    await waitRuntime(page, diagnostics);
  } finally {
    await browser.close();
  }
}

async function reducedMotion() {
  const browser = await chromium.launch(launchOptions(chromium));
  try {
    const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const diagnostics = [];
    attachDiagnostics(page, diagnostics);
    await page.goto(immersiveUrl(), { waitUntil: 'domcontentloaded' });
    const state = await verifyCommon(page, 'reduced-motion', diagnostics, 260, 260);
    assert(state.cloneCount === 0 && state.infiniteController === 'boundary-v3', 'reduced motion must retain clone-free infinite scrolling');
    await context.close();
  } finally {
    await browser.close();
  }
}

async function mobile() {
  const browser = await chromium.launch(launchOptions(chromium));
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const diagnostics = [];
    attachDiagnostics(page, diagnostics);
    await page.goto(immersiveUrl('lang=hu'), { waitUntil: 'domcontentloaded' });
    await verifyCommon(page, 'mobile', diagnostics, 300, 600);
    await page.locator('#menu-toggle').click();
    assert(await page.locator('#main-nav').evaluate(node => node.classList.contains('open')), 'mobile menu');
    await page.locator('#menu-toggle').click();
    await verifyTwoLoops(page, 'mobile');
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await desktop(chromium, 'chromium-living-core-v2');
  try {
    await desktop(firefox, 'firefox-living-core-v2');
  } catch (error) {
    if (/FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS|WebGL context|GLX|EGL/i.test(String(error))) {
      console.warn('Firefox WebGL skipped because the GitHub runner has no usable GL driver:', String(error));
    } else {
      throw error;
    }
  }
  await skipIntro();
  await reducedMotion();
  await mobile();
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
