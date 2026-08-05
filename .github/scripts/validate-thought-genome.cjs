'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = ['--enable-unsafe-swiftshader'];

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function waitRuntime(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && (!overlay || overlay.hidden)
      && root.dataset.fxThoughtGenome === 'ready-v1'
      && root.dataset.fxThree === 'ready'
      && root.dataset.fxThreeRenderer === 'three-webgl-morphing-organism-v3'
      && root.dataset.fxCoreForm === 'synaptic-thought-genome-v1';
  }, null, { timeout: 30000 });
}

async function verify(viewport, mobile) {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  try {
    const context = await browser.newContext({
      viewport,
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 2 : 1,
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => {
      const text = message.text();
      if (
        message.type() === 'error'
        && !/favicon|Failed to load resource:.*status of 404 \(File not found\)/i.test(text)
      ) {
        errors.push(text);
      }
    });

    await page.goto(TEST_URL + '?lang=hu&immersive=1', { waitUntil: 'domcontentloaded' });
    await waitRuntime(page);

    const initial = await page.evaluate(() => {
      const layer = document.querySelector('.fx-thought-genome-layer');
      const bubble = document.querySelector('.fx-organism-thought');
      const stage = document.querySelector('.fx-three-stage-shell');
      const layerStyle = layer ? getComputedStyle(layer) : null;
      const stageStyle = stage ? getComputedStyle(stage) : null;
      return {
        bubbleHidden: bubble?.hidden === true,
        layerExists: Boolean(layer),
        pointerEvents: layerStyle?.pointerEvents,
        stageZ: Number.parseInt(stageStyle?.zIndex || '0', 10),
        layerZ: Number.parseInt(layerStyle?.zIndex || '0', 10),
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        renderer: document.documentElement.dataset.fxThreeRenderer,
        form: document.documentElement.dataset.fxCoreForm
      };
    });

    assert(initial.bubbleHidden, 'thought dialogue must remain closed on startup');
    assert(initial.layerExists && initial.pointerEvents === 'none', 'genome layer must be non-interactive');
    assert(initial.layerZ < 100 && initial.stageZ < 500, 'genome must remain behind content');
    assert(initial.overflow <= 1, 'genome introduced horizontal overflow');
    assert(initial.renderer === 'three-webgl-morphing-organism-v3', 'V3 renderer telemetry missing');
    assert(initial.form === 'synaptic-thought-genome-v1', 'thought genome core telemetry missing');

    await page.locator('.fx-organism-thought-trigger').click();
    await page.locator('#fx-organism-question-input').fill('Mennyibe kerül a licenc?');
    await page.locator('.fx-organism-ask').click();

    await page.waitForFunction(() => (
      document.documentElement.dataset.fxThoughtGenomeLastScene === '3'
      && document.documentElement.dataset.fxCoreMorph === '3'
      && document.querySelectorAll('.fx-thought-genome-node').length === 1
    ), null, { timeout: 8000 });

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('formatx-thought-genome-history-v1') || '[]';
      const parsed = JSON.parse(raw);
      return {
        raw,
        parsed,
        privacy: document.documentElement.dataset.fxThoughtGenomePrivacy,
        count: document.querySelectorAll('.fx-thought-genome-node').length,
        layerDisabled: document.querySelector('.fx-thought-genome-layer')?.classList.contains('is-disabled')
      };
    });

    assert(stored.privacy === 'fingerprint-only', 'privacy marker is not fingerprint-only');
    assert(stored.count === 1 && stored.parsed.length === 1, 'thought fingerprint was not recorded');
    assert(!stored.raw.toLowerCase().includes('mennyibe') && !stored.raw.toLowerCase().includes('licenc?'), 'question text leaked into local storage');
    assert(Object.keys(stored.parsed[0]).sort().join(',') === 'at,fingerprint,intent,scene', 'stored genome schema contains unexpected data');
    assert(!stored.layerDisabled, 'genome layer disabled unexpectedly');

    await page.locator('.fx-thought-genome-disclosure > summary').click();
    await page.waitForFunction(() => document.querySelector('.fx-thought-genome-disclosure')?.open === true);
    await page.locator('.fx-thought-genome-form').click();
    await page.waitForFunction(() => document.documentElement.dataset.fxCoreMorph === '0');

    await page.locator('.fx-thought-genome-toggle').click();
    await page.waitForFunction(() => (
      document.documentElement.dataset.fxThoughtGenomeEnabled === 'false'
      && document.querySelector('.fx-thought-genome-layer')?.classList.contains('is-disabled')
      && document.documentElement.dataset.fxCoreMorph === '0'
    ));

    const layout = await page.evaluate(() => {
      const bubble = document.querySelector('.fx-organism-thought');
      const controls = document.querySelector('.fx-thought-genome-controls');
      const bubbleRect = bubble?.getBoundingClientRect();
      const controlsRect = controls?.getBoundingClientRect();
      return {
        controlsInside: Boolean(
          bubbleRect && controlsRect
          && controlsRect.left >= bubbleRect.left - 1
          && controlsRect.right <= bubbleRect.right + 1
          && controlsRect.bottom <= bubbleRect.bottom + 1
        ),
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
      };
    });

    assert(layout.controlsInside, 'genome controls escape the thought dialogue');
    assert(layout.overflow <= 1, 'genome controls introduced horizontal overflow');
    assert(!errors.length, 'browser diagnostics: ' + errors.join(' | '));
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await verify({ width: 1440, height: 960 }, false);
  await verify({ width: 390, height: 844 }, true);
  console.log('Synaptic Thought Genome validation passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
