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
  await page.waitForFunction(() => window.FormatXInteractionGenome && document.documentElement.dataset.fxGenomeWebglAdapter === 'ready', null, { timeout: 30000 });
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
    const rect = canvas?.getBoundingClientRect();
    const gl = canvas?.getContext('webgl2');
    const attributes = gl?.getContextAttributes();
    return {
      adapter: root.dataset.fxGenomeWebglAdapter || '',
      renderer: root.dataset.fxInteractionGenomeRenderer || '',
      stageRenderer: stage?.dataset.renderer || '',
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
      renderedAt: Number(canvas?.dataset.fxRenderedAt || 0),
      badge: document.querySelectorAll('.fx-genome-renderer-badge').length,
      depthScale: document.querySelectorAll('.fx-genome-depth-scale').length,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      nodeCount: window.FormatXInteractionGenome?.getState?.().items.length || 0
    };
  });
}

async function verify(browser, contextOptions, name, minimumCanvas) {
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
    await page.mouse.move(box.x + box.width * .42, box.y + box.height * .42);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .62, box.y + box.height * .52, { steps: 8 });
    await page.mouse.up();
    await page.waitForFunction(() => Number(document.querySelector('.fx-genome-webgl-canvas')?.dataset.fxRenderedFrame || 0) >= 6, null, { timeout: 5000 });
  }

  const state = await rendererState(page);
  assert(state.adapter === 'ready', name + ' adapter: ' + JSON.stringify(state));
  assert(state.renderer === 'webgl2-pbr' && state.stageRenderer === 'webgl2-pbr', name + ' renderer markers: ' + JSON.stringify(state));
  assert(state.canvasCount === 1, name + ' WebGL canvas count: ' + JSON.stringify(state));
  assert(state.canvas[0] >= minimumCanvas[0] && state.canvas[1] >= minimumCanvas[1], name + ' canvas CSS size: ' + JSON.stringify(state));
  assert(state.backing[0] >= state.canvas[0] && state.backing[1] >= state.canvas[1], name + ' backing resolution: ' + JSON.stringify(state));
  assert(state.webgl2 && state.depth, name + ' missing WebGL2 depth context: ' + JSON.stringify(state));
  assert(state.antialias, name + ' antialias disabled: ' + JSON.stringify(state));
  assert(!state.contextLost && state.glError === 0, name + ' WebGL runtime error: ' + JSON.stringify(state));
  assert(state.renderedFrames >= 6 && state.renderedAt > 0, name + ' renderer did not produce continuous frames: ' + JSON.stringify(state));
  assert(state.renderedNodes >= 10, name + ' renderer did not receive genome nodes: ' + JSON.stringify(state));
  assert(state.originalOpacity === '0', name + ' original 2D canvas still visible: ' + JSON.stringify(state));
  assert(state.badge === 1 && state.depthScale === 1, name + ' professional HUD missing: ' + JSON.stringify(state));
  assert(state.overflow <= 1, name + ' horizontal overflow: ' + JSON.stringify(state));
  assert(state.nodeCount >= 10, name + ' genome nodes missing: ' + JSON.stringify(state));
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
    await verify(browser, { viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-desktop', [760, 520]);
    await verify(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-mobile', [360, 430]);
    await verify(browser, { viewport: { width: 1180, height: 820 }, reducedMotion: 'reduce', locale: 'hu-HU', colorScheme: 'dark' }, 'genome-webgl-reduced-motion', [650, 450]);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
