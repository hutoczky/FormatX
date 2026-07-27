'use strict';

const { chromium, firefox } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = [
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan,WebGPU',
  '--use-angle=swiftshader',
  '--use-gl=angle',
  '--disable-vulkan-surface',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader'
];

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

async function waitIntro(page, timeout = 8000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout });
}

async function waitThree(page, diagnostics, timeout = 20000) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxThree === 'ready' || root.dataset.fxThree === 'error';
  }, null, { timeout });
  const status = await page.evaluate(() => document.documentElement.dataset.fxThree);
  if (status !== 'ready') {
    await page.waitForTimeout(250);
    throw new Error('Three.js stage failed to start: ' + status + ' | ' + diagnostics.join(' | '));
  }
}

async function readState(page) {
  return page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]'), element => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const frame = document.getElementById('fx-three-frame');
    const frameDocument = frame?.contentDocument;
    const canvas = frameDocument?.querySelector('canvas');
    const rect = canvas?.getBoundingClientRect();
    const engine = getComputedStyle(document.documentElement)
      .getPropertyValue('--fx-experience-engine')
      .replace(/["']/g, '')
      .trim();

    return {
      three: document.documentElement.dataset.fxThree,
      renderer: document.documentElement.dataset.fxThreeRenderer,
      webgpu: document.documentElement.dataset.fxWebgpu || '',
      webgpuError: document.documentElement.dataset.fxWebgpuError || '',
      webgpuAvailable: Boolean(navigator.gpu),
      quality: document.documentElement.dataset.fxThreeQuality,
      engine,
      infinite: document.documentElement.dataset.fxInfinite,
      loops: Number(document.documentElement.dataset.fxLoopCount || 0),
      scene: document.documentElement.dataset.fxThreeScene,
      flow: document.documentElement.dataset.fxFlow,
      frame: Boolean(frame),
      frameSrc: frame instanceof HTMLIFrameElement ? frame.src : '',
      canvas: [Math.round(rect?.width || 0), Math.round(rect?.height || 0)],
      clone: document.querySelectorAll('[data-fx-loop-bridge="true"]').length,
      toggle: document.querySelectorAll('.loop-toggle').length,
      nextgen: document.documentElement.dataset.fxNextgenControls || '',
      xrControls: document.querySelectorAll('.fx-nextgen-xr').length,
      legacyCanvasHidden: Boolean(document.getElementById('fx-apex-canvas')?.hidden),
      legacyParticleHidden: Boolean(document.getElementById('fx-particle-canvas')?.hidden),
      oldRuntime: document.querySelectorAll('.fx-transcend-shell,.fx-worldstage-flow,.fx-worldstage-shock').length,
      rail: document.querySelectorAll('.fx-rail').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      duplicates,
      scripts: Array.from(document.scripts, script => script.src || '').join('|'),
      frameScripts: frameDocument ? Array.from(frameDocument.scripts, script => script.src || '').join('|') : ''
    };
  });
}

async function verifyCommon(page, name, diagnostics, minimumWidth, minimumHeight, expectedRenderer = null) {
  await waitIntro(page);
  await waitThree(page, diagnostics);
  const state = await readState(page);
  const meaningfulDiagnostics = diagnostics.filter(item => !/WebGL stall due to ReadPixels|GPU stall/i.test(item));
  assert(!meaningfulDiagnostics.length, name + ' browser diagnostics: ' + meaningfulDiagnostics.join(' | '));
  assert(state.three === 'ready', name + ' stage state: ' + JSON.stringify(state));
  assert(['webgpu-tsl', 'three-webgl'].includes(state.renderer), name + ' renderer: ' + JSON.stringify(state));
  if (expectedRenderer) assert(state.renderer === expectedRenderer, name + ' expected ' + expectedRenderer + ': ' + JSON.stringify(state));
  assert(state.frame, name + ' missing Three stage iframe');
  assert(state.frameSrc.includes('20260727-webgpu-1'), name + ' stale stage URL: ' + state.frameSrc);
  assert(state.canvas[0] >= minimumWidth && state.canvas[1] >= minimumHeight, name + ' canvas: ' + state.canvas);
  assert(state.infinite === 'ready' && state.clone === 1 && state.toggle === 0, name + ' mandatory loop: ' + JSON.stringify(state));
  assert(state.nextgen === 'ready' && state.xrControls === 1, name + ' missing next-generation controls');
  assert(state.legacyCanvasHidden && state.legacyParticleHidden && state.oldRuntime === 0, name + ' legacy renderer still active');
  assert(state.rail === 1, name + ' missing chapter rail');
  assert(!state.duplicates.length, name + ' duplicate IDs: ' + state.duplicates.join(','));
  assert(state.overflow <= 1, name + ' horizontal overflow: ' + state.overflow);
  assert(state.scripts.includes('formatx-three-host.js'), name + ' missing Three host script');
  assert(state.scripts.includes('formatx-nextgen-controls.js'), name + ' missing WebXR/audio controls');
  assert(state.frameScripts.includes('experience-entry.js'), name + ' missing Three entry module');
  return state;
}

async function desktop(browserType, name) {
  const browser = await browserType.launch(launchOptions(browserType));
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'hu-HU', colorScheme: 'dark' });
    const page = await context.newPage();
    const diagnostics = [];
    attachDiagnostics(page, diagnostics);
    await page.goto(TEST_URL + '?lang=hu', { waitUntil: 'domcontentloaded' });
    let state = await verifyCommon(page, name, diagnostics, 1200, 800);

    if (browserType === chromium && state.webgpuAvailable) {
      assert(state.webgpu === 'ready' && state.renderer === 'webgpu-tsl', name + ' WebGPU path did not activate: ' + JSON.stringify(state));
    }

    const flowCard = page.locator('[data-flow="2"]');
    await flowCard.scrollIntoViewIfNeeded();
    await flowCard.hover();
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
      const metrics = await page.locator('[data-fx-loop-bridge="true"]').evaluate(node => ({ top: node.offsetTop, height: node.offsetHeight }));
      await page.evaluate(({ top, height }) => scrollTo(0, top + height * 0.86), metrics);
      await page.waitForFunction(expected => Number(document.documentElement.dataset.fxLoopCount || 0) >= expected && scrollY < document.getElementById('experience').offsetTop, cycle, { timeout: 8000 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }

    state = await readState(page);
    assert(state.loops >= 2, name + ' loop count: ' + state.loops);
    console.log(JSON.stringify({ case: name, state }));
    await context.close();
  } finally {
    await browser.close();
  }
}

async function forcedWebGlFallback() {
  const browser = await chromium.launch(launchOptions(chromium));
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 840 } });
    await context.addInitScript(() => {
      try { Object.defineProperty(navigator, 'gpu', { configurable: true, value: undefined }); } catch (_) {}
    });
    const page = await context.newPage();
    const diagnostics = [];
    attachDiagnostics(page, diagnostics);
    await page.goto(TEST_URL + '?forced-webgl=1', { waitUntil: 'domcontentloaded' });
    const state = await verifyCommon(page, 'forced-webgl-fallback', diagnostics, 1000, 700, 'three-webgl');
    assert(state.webgpu === 'unsupported', 'fallback WebGPU state: ' + JSON.stringify(state));
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
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    const button = page.locator('.fx-intro-skip');
    await button.waitFor({ state: 'visible', timeout: 3000 });
    const started = Date.now();
    await button.click();
    await waitIntro(page, 2200);
    await waitThree(page, diagnostics);
    assert(Date.now() - started < 2200, 'intro skip too slow');
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
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    const state = await verifyCommon(page, 'reduced-motion', diagnostics, 1000, 700);
    assert(state.infinite === 'ready' && state.clone === 1, 'reduced motion must retain mandatory infinite loop');
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
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    await verifyCommon(page, 'mobile', diagnostics, 380, 800);
    await page.locator('#menu-toggle').click();
    assert(await page.locator('#main-nav').evaluate(node => node.classList.contains('open')), 'mobile menu');
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await desktop(chromium, 'chromium-webgpu');
  try {
    await desktop(firefox, 'firefox-webgl2');
  } catch (error) {
    if (/FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS|WebGL context|GLX|EGL/i.test(String(error))) {
      console.warn('Firefox WebGL skipped because the GitHub runner has no usable GL driver:', String(error));
    } else {
      throw error;
    }
  }
  await forcedWebGlFallback();
  await skipIntro();
  await reducedMotion();
  await mobile();
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
