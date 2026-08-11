'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = ['--enable-unsafe-swiftshader'];

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function activateRuntime(page) {
  // The current production architecture deliberately defers Organism/Thought
  // Genome modules until explicit activation. Some current surfaces keep the
  // legacy launch control in the DOM but visually retire it because the native
  // core already owns the hero. Only click a genuinely visible control;
  // otherwise dispatch the same activation event used by the runtime contract.
  const launch = page.locator('.fx-immersive-launch').first();
  if (await launch.count() && await launch.isVisible()) {
    await launch.click();
  } else {
    await page.evaluate(() => {
      document.documentElement.dataset.fxImmersive = 'active';
      document.documentElement.dataset.fxImmersiveSource = 'browser-validation';
      dispatchEvent(new CustomEvent('formatx:immersiveactivate', { detail: { source: 'browser-validation' } }));
    });
  }

  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxThoughtGenome === 'ready-v1'
      && root.dataset.fxThoughtGenomePrivacy === 'fingerprint-only'
      && Boolean(document.querySelector('.fx-organism-thought-trigger'))
      && Boolean(document.querySelector('.fx-thought-genome-controls'));
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

    await context.addInitScript(() => {
      try {
        localStorage.setItem('formatx:intro-seen-v1', '1');
        localStorage.removeItem('formatx-thought-genome-history-v1');
        localStorage.setItem('formatx-thought-genome-enabled', 'true');
        localStorage.setItem('formatx-thought-genome-form', 'auto');
      } catch (_) {}

      window.__fxThoughtGenomeEvents = [];
      window.__fxOrganismShapeEvents = [];
      addEventListener('formatx:thoughtgenome', event => {
        window.__fxThoughtGenomeEvents.push(event.detail);
      });
      addEventListener('formatx:organismshape', event => {
        window.__fxOrganismShapeEvents.push(event.detail);
      });
    });

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => {
      const text = message.text();
      if (
        message.type() === 'error'
        && !/favicon|Failed to load resource:.*status of 404 \(File not found\)|WebGL|WebGPU|GPU/i.test(text)
      ) {
        errors.push(text);
      }
    });

    await page.goto(TEST_URL + '?lang=hu&thought-genome-test=1', { waitUntil: 'domcontentloaded' });
    await activateRuntime(page);

    const initial = await page.evaluate(() => {
      const layer = document.querySelector('.fx-thought-genome-layer');
      const bubble = document.querySelector('.fx-organism-thought');
      const controls = document.querySelector('.fx-thought-genome-controls');
      const layerStyle = layer ? getComputedStyle(layer) : null;
      const controlsStyle = controls ? getComputedStyle(controls) : null;
      return {
        bubbleHidden: bubble?.hidden === true,
        layerExists: Boolean(layer),
        pointerEvents: layerStyle?.pointerEvents,
        layerZ: Number.parseInt(layerStyle?.zIndex || '0', 10),
        controlsVisible: Boolean(controls && controlsStyle?.display !== 'none'),
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        privacy: document.documentElement.dataset.fxThoughtGenomePrivacy,
        enabled: document.documentElement.dataset.fxThoughtGenomeEnabled,
        forms: document.documentElement.dataset.fxThoughtGenomeForms
      };
    });

    assert(initial.bubbleHidden, 'thought dialogue must remain closed on startup');
    assert(initial.layerExists && initial.pointerEvents === 'none', 'genome visual layer must exist and remain non-interactive after user activation');
    assert(initial.layerZ < 100, 'genome visual layer must remain behind interactive content');
    assert(initial.controlsVisible, 'genome controls were not created');
    assert(initial.overflow <= 1, 'genome introduced horizontal overflow');
    assert(initial.privacy === 'fingerprint-only', 'genome privacy marker is not fingerprint-only');
    assert(initial.enabled === 'true', 'genome did not start enabled for the validation session');
    assert(initial.forms === '6', 'six-form Thought Genome contract missing');

    await page.locator('.fx-organism-thought-trigger').click();
    await page.waitForFunction(() => {
      const bubble = document.querySelector('.fx-organism-thought');
      return bubble && bubble.hidden === false;
    });

    await page.locator('#fx-organism-question-input').fill('Mennyibe kerül a licenc?');
    await page.locator('.fx-organism-ask').click();

    await page.waitForFunction(() => (
      document.documentElement.dataset.fxThoughtGenomeLastScene === '3'
      && document.querySelectorAll('.fx-thought-genome-node').length === 1
      && Array.isArray(window.__fxThoughtGenomeEvents)
      && window.__fxThoughtGenomeEvents.some(event => event?.scene === 3 && event?.source === 'question')
    ), null, { timeout: 10000 });

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('formatx-thought-genome-history-v1') || '[]';
      const parsed = JSON.parse(raw);
      const event = window.__fxThoughtGenomeEvents.find(item => item?.source === 'question') || null;
      return {
        raw,
        parsed,
        event,
        privacy: document.documentElement.dataset.fxThoughtGenomePrivacy,
        count: document.querySelectorAll('.fx-thought-genome-node').length,
        layerDisabled: document.querySelector('.fx-thought-genome-layer')?.classList.contains('is-disabled')
      };
    });

    assert(stored.privacy === 'fingerprint-only', 'privacy marker is not fingerprint-only');
    assert(stored.count === 1 && stored.parsed.length === 1, 'thought fingerprint was not recorded');
    assert(!stored.raw.toLowerCase().includes('mennyibe') && !stored.raw.toLowerCase().includes('licenc?'), 'question text leaked into local storage');
    assert(Object.keys(stored.parsed[0]).sort().join(',') === 'at,fingerprint,intent,scene', 'stored genome schema contains unexpected data');
    assert(stored.event?.questionStored === false, 'public Thought Genome event incorrectly claims raw question storage');
    assert(stored.event?.enabled === true, 'public Thought Genome event lost enabled state');
    assert(!stored.layerDisabled, 'genome layer disabled unexpectedly');

    const disclosure = page.locator('.fx-thought-genome-disclosure > summary').first();
    if (await disclosure.count()) {
      await disclosure.click();
      await page.waitForFunction(() => document.querySelector('.fx-thought-genome-disclosure')?.open === true);
    }

    const shapeEventsBefore = await page.evaluate(() => window.__fxOrganismShapeEvents.length);
    await page.locator('.fx-thought-genome-form').click();
    await page.waitForFunction(count => (
      window.__fxOrganismShapeEvents.length > count
      && window.__fxOrganismShapeEvents.at(-1)?.source === 'manual-form-cycle'
    ), shapeEventsBefore, { timeout: 5000 });

    const toggleEventsBefore = await page.evaluate(() => window.__fxOrganismShapeEvents.length);
    await page.locator('.fx-thought-genome-toggle').click();
    await page.waitForFunction(count => (
      document.documentElement.dataset.fxThoughtGenomeEnabled === 'false'
      && document.querySelector('.fx-thought-genome-layer')?.classList.contains('is-disabled')
      && window.__fxOrganismShapeEvents.length > count
      && window.__fxOrganismShapeEvents.at(-1)?.source === 'genome-disabled'
    ), toggleEventsBefore, { timeout: 5000 });

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
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        history: JSON.parse(localStorage.getItem('formatx-thought-genome-history-v1') || '[]')
      };
    });

    assert(layout.controlsInside, 'genome controls escape the thought dialogue');
    assert(layout.overflow <= 1, 'genome controls introduced horizontal overflow');
    assert(layout.history.length === 1, 'disabling the genome unexpectedly destroyed local fingerprint history');
    assert(!errors.length, 'browser diagnostics: ' + errors.join(' | '));
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await verify({ width: 1440, height: 960 }, false);
  await verify({ width: 390, height: 844 }, true);
  console.log('Synaptic Thought Genome validation passed against the current deferred production runtime.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
