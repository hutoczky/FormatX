'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4181/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) await skip.click({ force: true });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    if (root.classList.contains('fx-intro-complete') && (!overlay || overlay.hidden)) return true;
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
    root.classList.remove('fx-intro-running');
    root.classList.add('fx-intro-complete');
    return true;
  }, null, { timeout: 8000 });
}

async function openGenome(page) {
  await page.waitForFunction(() => window.FormatXInteractionGenome
    && window.FormatXGenome3DAdapter
    && document.documentElement.dataset.fxGenomeWebglAdapter === 'ready', null, { timeout: 30000 });

  await page.evaluate(() => {
    const api = window.FormatXInteractionGenome;
    for (let index = 0; index < 10; index += 1) {
      api.record(index % 3 === 0 ? 'scene' : 'scroll', 'WebGL validation node ' + index, {
        y: index * 180,
        progress: index / 10,
        scene: index % 6,
        lang: index % 2 ? 'en' : 'hu',
        audio: index % 4 === 0 ? 'on' : 'off',
        loop: Math.floor(index / 6)
      });
    }
    api.open();
  });

  await page.waitForFunction(() => document.getElementById('fx-interaction-genome')?.dataset.open === 'true');
  await page.waitForFunction(() => document.documentElement.dataset.fxInteractionGenomeRenderer === 'webgl2-pbr');
  await page.waitForFunction(() => Number(document.querySelector('.fx-genome-webgl-canvas')?.dataset.fxRenderedFrame || 0) >= 3, null, { timeout: 8000 });
}

async function rendererState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const stage = document.querySelector('.fx-genome-stage');
    const canvas = document.querySelector('.fx-genome-webgl-canvas');
    const original = document.getElementById('fx-genome-canvas');
    const rectangle = canvas?.getBoundingClientRect();
    const gl = canvas?.getContext('webgl2');
    const attributes = gl?.getContextAttributes();
    const adapterStatus = window.FormatXGenome3DAdapter?.getStatus?.() || {};
    return {
      adapter: root.dataset.fxGenomeWebglAdapter || '',
      resourcePolicy: root.dataset.fxGenomeResourcePolicy || '',
      renderer: root.dataset.fxInteractionGenomeRenderer || '',
      stageRenderer: stage?.dataset.renderer || '',
      stageQuality: stage?.dataset.quality || '',
      canvasCount: document.querySelectorAll('.fx-genome-webgl-canvas').length,
      canvas: [Math.round(rectangle?.width || 0), Math.round(rectangle?.height || 0)],
      backing: [canvas?.width || 0, canvas?.height || 0],
      originalOpacity: original ? getComputedStyle(original).opacity : '',
      webgl2: Boolean(gl),
      antialias: Boolean(attributes?.antialias),
      depth: Boolean(attributes?.depth),
      contextLost: gl ? gl.isContextLost() : true,
      glError: gl ? gl.getError() : -1,
      renderedFrames: Number(canvas?.dataset.fxRenderedFrame || 0),
      skippedFrames: Number(canvas?.dataset.fxSkippedFrames || 0),
      renderedNodes: Number(canvas?.dataset.fxRenderedNodes || 0),
      renderedAt: Number(canvas?.dataset.fxRenderedAt || 0),
      quality: canvas?.dataset.fxQuality || adapterStatus.quality || '',
      targetFps: Number(canvas?.dataset.fxTargetFps || adapterStatus.targetFps || 0),
      effectiveDpr: Number(canvas?.dataset.fxEffectiveDpr || adapterStatus.effectiveDpr || 0),
      resolutionScale: Number(canvas?.dataset.fxResolutionScale || adapterStatus.resolutionScale || 0),
      maxPixels: Number(canvas?.dataset.fxMaxPixels || adapterStatus.maxPixels || 0),
      backingPixels: Number(canvas?.dataset.fxBackingPixels || adapterStatus.backingPixels || 0),
      particles: Number(canvas?.dataset.fxParticleCount || adapterStatus.particles || 0),
      fourK: String(canvas?.dataset.fxIs4k || adapterStatus.fourK) === 'true',
      resizeCount: Number(canvas?.dataset.fxResizeCount || adapterStatus.resizeCount || 0),
      badge: document.querySelectorAll('.fx-genome-renderer-badge').length,
      depthScale: document.querySelectorAll('.fx-genome-depth-scale').length,
      roundedStage: parseFloat(getComputedStyle(stage).borderTopLeftRadius) || 0,
      polishLoaded: document.querySelectorAll('link[data-fx-4k-polish-style]').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      nodeCount: window.FormatXInteractionGenome?.getState?.().items.length || 0
    };
  });
}

async function verifyFrameCap(page, targetFps, name) {
  const before = await page.locator('.fx-genome-webgl-canvas').getAttribute('data-fx-rendered-frame').then(Number);
  await page.waitForTimeout(1000);
  const after = await page.locator('.fx-genome-webgl-canvas').getAttribute('data-fx-rendered-frame').then(Number);
  const rendered = after - before;
  assert(rendered <= targetFps + 5, name + ' exceeded FPS budget: ' + JSON.stringify({ before, after, rendered, targetFps }));
  assert(rendered >= 1, name + ' renderer stopped completely while open: ' + JSON.stringify({ rendered, targetFps }));
}

async function verifyStopsWhenClosed(page, name) {
  await page.evaluate(() => window.FormatXInteractionGenome.close());
  const before = await page.locator('.fx-genome-webgl-canvas').getAttribute('data-fx-rendered-frame').then(Number);
  await page.waitForTimeout(450);
  const after = await page.locator('.fx-genome-webgl-canvas').getAttribute('data-fx-rendered-frame').then(Number);
  assert(after - before <= 1, name + ' kept rendering while the 3D view was closed: ' + JSON.stringify({ before, after }));
}

async function verify(browser, contextOptions, name, minimumCanvas, expectedProfile) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });

  await page.goto(TEST_URL + '?lang=hu&genome-webgl-test=1', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await openGenome(page);

  const canvas = page.locator('.fx-genome-webgl-canvas');
  await canvas.hover();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.42);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.52, { steps: 8 });
    await page.mouse.up();
    await page.waitForFunction(() => Number(document.querySelector('.fx-genome-webgl-canvas')?.dataset.fxRenderedFrame || 0) >= 6, null, { timeout: 5000 });
  }

  const state = await rendererState(page);
  assert(state.adapter === 'ready', name + ' adapter: ' + JSON.stringify(state));
  assert(state.resourcePolicy === 'adaptive-4k-v2', name + ' resource policy: ' + JSON.stringify(state));
  assert(state.renderer === 'webgl2-pbr' && state.stageRenderer === 'webgl2-pbr', name + ' renderer markers: ' + JSON.stringify(state));
  assert(state.canvasCount === 1, name + ' WebGL canvas count: ' + JSON.stringify(state));
  assert(state.canvas[0] >= minimumCanvas[0] && state.canvas[1] >= minimumCanvas[1], name + ' canvas CSS size: ' + JSON.stringify(state));
  assert(state.backing[0] > 0 && state.backing[1] > 0, name + ' missing backing buffer: ' + JSON.stringify(state));
  assert(state.backingPixels === state.backing[0] * state.backing[1], name + ' backing telemetry mismatch: ' + JSON.stringify(state));
  assert(state.backingPixels <= state.maxPixels * 1.02, name + ' exceeded GPU pixel budget: ' + JSON.stringify(state));
  assert(state.webgl2 && state.depth, name + ' missing WebGL2 depth context: ' + JSON.stringify(state));
  assert(state.antialias, name + ' antialias disabled: ' + JSON.stringify(state));
  assert(!state.contextLost && state.glError === 0, name + ' WebGL runtime error: ' + JSON.stringify(state));
  assert(state.renderedFrames >= 6 && state.renderedAt > 0, name + ' renderer did not produce frames: ' + JSON.stringify(state));
  assert(state.renderedNodes >= 10, name + ' renderer did not receive genome nodes: ' + JSON.stringify(state));
  assert(state.originalOpacity === '0', name + ' original 2D canvas still visible: ' + JSON.stringify(state));
  assert(state.badge === 1 && state.depthScale === 1, name + ' professional HUD missing: ' + JSON.stringify(state));
  assert(state.roundedStage >= 20 && state.polishLoaded === 1, name + ' rounded 4K polish missing: ' + JSON.stringify(state));
  assert(state.overflow <= 1, name + ' horizontal overflow: ' + JSON.stringify(state));
  assert(state.nodeCount >= 10, name + ' genome nodes missing: ' + JSON.stringify(state));
  assert(state.resizeCount <= 4, name + ' canvas was repeatedly reallocated: ' + JSON.stringify(state));

  if (expectedProfile === '4k') {
    assert(state.fourK && /^4k-/.test(state.quality), name + ' did not select the 4K profile: ' + JSON.stringify(state));
    assert(state.targetFps <= 30, name + ' 4K FPS cap too high: ' + JSON.stringify(state));
    assert(state.maxPixels <= 2800000, name + ' 4K pixel budget too high: ' + JSON.stringify(state));
    assert(state.particles <= 260, name + ' 4K particle budget too high: ' + JSON.stringify(state));
    assert(state.effectiveDpr <= 1.25, name + ' 4K internal DPR too high: ' + JSON.stringify(state));
  }

  await verifyFrameCap(page, state.targetFps, name);
  await verifyStopsWhenClosed(page, name);

  const meaningful = errors.filter(error => !/WebGL stall|GPU stall|favicon|ERR_ABORTED/i.test(error));
  assert(!meaningful.length, name + ' browser diagnostics: ' + meaningful.join(' | '));
  console.log(JSON.stringify({ case: name, state }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader']
  });

  try {
    await verify(browser, { viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-desktop', [760, 520], 'desktop');
    await verify(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-mobile', [360, 430], 'mobile');
    await verify(browser, { viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce', locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-reduced-motion', [640, 450], 'reduced');
    await verify(browser, { viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 1.5, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-physical-4k', [1400, 680], '4k');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});