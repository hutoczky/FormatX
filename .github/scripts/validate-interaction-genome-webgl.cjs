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
    && document.documentElement.dataset.fxGenomeWebglAdapter === 'ready-v3', null, { timeout: 45000 });
  await page.evaluate(() => {
    const api = window.FormatXInteractionGenome;
    for (let index = 0; index < 14; index += 1) {
      api.record(index % 4 === 0 ? 'scene' : index % 3 === 0 ? 'click' : 'scroll', 'Cinematic validation node ' + index, {
        y: index * 180,
        progress: index / 14,
        scene: index % 6,
        lang: index % 2 ? 'en' : 'hu',
        audio: index % 4 === 0 ? 'on' : 'off',
        loop: Math.floor(index / 6)
      });
    }
    api.open();
  });
  await page.waitForFunction(() => document.getElementById('fx-interaction-genome')?.dataset.open === 'true');
  await page.waitForFunction(() => document.documentElement.dataset.fxInteractionGenomeRenderer === 'webgl2-cinematic-pbr');
  await page.waitForFunction(() => Number(document.querySelector('.fx-genome-webgl-canvas')?.dataset.fxRenderedFrame || 0) >= 4, null, { timeout: 20000 });
}

async function rendererState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const stage = document.querySelector('.fx-genome-stage');
    const canvas = document.querySelector('.fx-genome-webgl-canvas');
    const original = document.getElementById('fx-genome-canvas');
    const rect = canvas?.getBoundingClientRect();
    const gl = canvas?.getContext('webgl2');
    const attributes = gl?.getContextAttributes();
    const status = window.FormatXGenome3DAdapter?.getStatus?.() || {};
    return {
      adapter: root.dataset.fxGenomeWebglAdapter || '',
      renderer: root.dataset.fxInteractionGenomeRenderer || '',
      stageRenderer: stage?.dataset.renderer || '',
      resourcePolicy: root.dataset.fxGenomeResourcePolicy || '',
      pipeline: root.dataset.fxGenomePipeline || '',
      geometry: root.dataset.fxGenomeGeometry || '',
      canvasCount: document.querySelectorAll('.fx-genome-webgl-canvas').length,
      canvas: [Math.round(rect?.width || 0), Math.round(rect?.height || 0)],
      backing: [canvas?.width || 0, canvas?.height || 0],
      originalOpacity: original ? getComputedStyle(original).opacity : '',
      webgl2: Boolean(gl),
      antialias: Boolean(attributes?.antialias),
      depth: Boolean(attributes?.depth),
      contextLost: gl ? gl.isContextLost() : true,
      glError: gl ? gl.getError() : -1,
      renderedFrames: Number(canvas?.dataset.fxRenderedFrame || 0),
      renderedNodes: Number(canvas?.dataset.fxRenderedNodes || 0),
      gesture: canvas?.dataset.fxGesture || '',
      overlayOpen: document.getElementById('fx-interaction-genome')?.dataset.open || '',
      roundedStage: parseFloat(getComputedStyle(stage).borderTopLeftRadius) || 0,
      polishLoaded: document.querySelectorAll('link[data-fx-4k-polish-style]').length,
      badge: document.querySelectorAll('.fx-genome-renderer-badge').length,
      depthScale: document.querySelectorAll('.fx-genome-depth-scale').length,
      pipelineHud: document.querySelectorAll('.fx-genome-pipeline').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      nodeCount: window.FormatXInteractionGenome?.getState?.().items.length || 0,
      status
    };
  });
}

async function verifyFrameCeiling(page, targetFps, name) {
  const canvas = page.locator('.fx-genome-webgl-canvas');
  const before = Number(await canvas.getAttribute('data-fx-rendered-frame'));
  await page.waitForTimeout(1000);
  const after = Number(await canvas.getAttribute('data-fx-rendered-frame'));
  const rendered = after - before;
  assert(rendered >= 1, name + ' renderer stopped while visible: ' + JSON.stringify({ before, after, rendered, targetFps }));
  assert(rendered <= targetFps + 5, name + ' renderer exceeded its FPS ceiling: ' + JSON.stringify({ before, after, rendered, targetFps }));
}

async function verifyStopsWhenClosed(page, name) {
  await page.evaluate(() => window.FormatXInteractionGenome.close());
  const canvas = page.locator('.fx-genome-webgl-canvas');
  const before = Number(await canvas.getAttribute('data-fx-rendered-frame'));
  await page.waitForTimeout(450);
  const after = Number(await canvas.getAttribute('data-fx-rendered-frame'));
  assert(after - before <= 1, name + ' renderer continued while closed: ' + JSON.stringify({ before, after }));
}

async function verify(browser, contextOptions, name, minimumCanvas, expectations = {}) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
  await page.goto(TEST_URL + '?lang=hu&genome-cinematic-test=1', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await openGenome(page);

  const canvas = page.locator('.fx-genome-webgl-canvas');
  await canvas.hover();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.38, box.y + box.height * 0.38);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.64, box.y + box.height * 0.54, { steps: 12 });
    await page.mouse.up();
    await page.waitForFunction(() => Number(document.querySelector('.fx-genome-webgl-canvas')?.dataset.fxRenderedFrame || 0) >= 8, null, { timeout: 10000 });
  }

  const state = await rendererState(page);
  const status = state.status;
  const minimumSphereTriangles = expectations.minimumSphereTriangles || 400;

  assert(state.adapter === 'ready-v3', name + ' adapter: ' + JSON.stringify(state));
  assert(state.renderer === 'webgl2-cinematic-pbr' && state.stageRenderer === 'webgl2-cinematic-pbr', name + ' renderer markers: ' + JSON.stringify(state));
  assert(state.resourcePolicy === 'cinematic-adaptive-v3', name + ' resource policy: ' + JSON.stringify(state));
  assert(state.geometry === 'instanced-meshes', name + ' instanced geometry marker missing: ' + JSON.stringify(state));
  assert(state.canvasCount === 1, name + ' WebGL canvas count: ' + JSON.stringify(state));
  assert(state.canvas[0] >= minimumCanvas[0] && state.canvas[1] >= minimumCanvas[1], name + ' canvas CSS size: ' + JSON.stringify(state));
  assert(state.backing[0] > 0 && state.backing[1] > 0, name + ' backing resolution missing: ' + JSON.stringify(state));
  assert(state.webgl2 && state.depth && state.antialias, name + ' WebGL2 quality context missing: ' + JSON.stringify(state));
  assert(!state.contextLost && state.glError === 0, name + ' WebGL runtime error: ' + JSON.stringify(state));
  assert(state.renderedFrames >= 8 && state.renderedNodes >= 14, name + ' renderer did not produce cinematic frames: ' + JSON.stringify(state));
  assert(state.originalOpacity === '0', name + ' original 2D canvas still visible: ' + JSON.stringify(state));
  assert(state.overlayOpen === 'true', name + ' drag unexpectedly closed the 3D view: ' + JSON.stringify(state));
  assert(['drag-complete', 'drag-suppressed-click'].includes(state.gesture), name + ' drag gesture was not separated from click: ' + JSON.stringify(state));
  assert(state.roundedStage >= 20 && state.polishLoaded === 1, name + ' rounded 4K polish missing: ' + JSON.stringify(state));
  assert(state.badge === 1 && state.depthScale === 1 && state.pipelineHud === 1, name + ' cinematic HUD missing: ' + JSON.stringify(state));
  assert(state.overflow <= 1, name + ' horizontal overflow: ' + JSON.stringify(state));
  assert(state.nodeCount >= 14, name + ' genome nodes missing: ' + JSON.stringify(state));

  assert(status.version === 'interaction-genome-cinematic-instanced-pbr-v3', name + ' renderer version: ' + JSON.stringify(status));
  assert(status.kind === 'webgl2-cinematic-instanced-pbr', name + ' renderer kind: ' + JSON.stringify(status));
  assert(status.instancedMeshes === true, name + ' instanced meshes disabled: ' + JSON.stringify(status));
  assert(status.nodeGeometry === 'uv-sphere' && status.tubeGeometry === 'instanced-cylinder', name + ' physical geometry missing: ' + JSON.stringify(status));
  assert(status.nodeInstances >= 28 && status.tubeInstances >= 40, name + ' insufficient 3D instances: ' + JSON.stringify(status));
  assert(status.sphereTriangles >= minimumSphereTriangles && status.tubeTriangles >= 20, name + ' profile geometry density too low: ' + JSON.stringify(status));
  assert(status.bloom === true && status.bloomPasses >= 1, name + ' bloom pipeline missing: ' + JSON.stringify(status));
  assert(status.toneMapping === 'ACES-filmic', name + ' filmic tone mapping missing: ' + JSON.stringify(status));
  assert(status.postProcessing === 'rgba8-bloom-aces-vignette', name + ' post-processing pipeline missing: ' + JSON.stringify(status));
  assert(status.adaptiveQuality === true && status.dynamicScale >= 0.68 && status.dynamicScale <= 1, name + ' adaptive quality invalid: ' + JSON.stringify(status));
  assert(status.drawCalls >= 9 && status.glErrors === 0, name + ' render pipeline incomplete: ' + JSON.stringify(status));
  assert(status.particles <= 190, name + ' particle budget too noisy: ' + JSON.stringify(status));
  assert(status.backingPixels <= status.maxPixels * 1.06, name + ' GPU pixel budget exceeded: ' + JSON.stringify(status));

  if (expectations.fourK) {
    assert(status.fourK === true, name + ' 4K profile was not selected: ' + JSON.stringify(status));
    assert(status.targetFps <= 30, name + ' 4K FPS ceiling too high: ' + JSON.stringify(status));
    assert(status.maxPixels <= 3400000, name + ' 4K internal pixel budget too high: ' + JSON.stringify(status));
    assert(status.effectiveDpr <= 1.08, name + ' 4K DPR budget too high: ' + JSON.stringify(status));
    assert(status.particles <= 160, name + ' 4K particle budget too high: ' + JSON.stringify(status));
    assert(status.bloomPasses <= 2, name + ' 4K bloom pass budget too high: ' + JSON.stringify(status));
  }
  if (expectations.reduced) assert(/reduced/.test(status.quality), name + ' reduced-motion profile missing: ' + JSON.stringify(status));

  await verifyFrameCeiling(page, status.targetFps, name);
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
    await verify(browser, { viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-cinematic-desktop', [760, 520]);
    await verify(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-cinematic-mobile', [360, 430], { minimumSphereTriangles: 300 });
    await verify(browser, { viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce', locale: 'hu-HU', colorScheme: 'dark' }, 'genome-cinematic-reduced-motion', [640, 450], { reduced: true, minimumSphereTriangles: 400 });
    await verify(browser, { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-cinematic-physical-4k', [1050, 560], { fourK: true, minimumSphereTriangles: 600 });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});