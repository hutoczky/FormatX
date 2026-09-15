'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROMIUM_ARGS = ['--enable-unsafe-swiftshader'];

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function overflowDiagnostics(page) {
  return page.evaluate(() => {
    const viewport = innerWidth;
    const offenders = [];
    for (const element of document.querySelectorAll('body *')) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const rect = element.getBoundingClientRect();
      if (!Number.isFinite(rect.left) || !Number.isFinite(rect.right) || rect.width <= 0 || rect.height <= 0) continue;
      if (rect.left < -1 || rect.right > viewport + 1) {
        offenders.push({
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          className: typeof element.className === 'string' ? element.className.slice(0, 180) : '',
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          top: Math.round(rect.top * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          position: style.position,
          display: style.display,
          overflowX: style.overflowX,
          transform: style.transform
        });
      }
    }
    return {
      viewport,
      doc: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewport,
      rootClasses: document.documentElement.className,
      bodyClasses: document.body.className,
      immersive: document.documentElement.dataset.fxImmersive || '',
      interfaceReady: document.documentElement.classList.contains('fx-organism-interface-ready'),
      offenders: offenders
        .sort((a, b) => Math.max(b.right - viewport, -b.left) - Math.max(a.right - viewport, -a.left))
        .slice(0, 24)
    };
  });
}

async function activateRuntime(page) {
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
      window.__fxCspViolations = [];
      addEventListener('formatx:thoughtgenome', event => window.__fxThoughtGenomeEvents.push(event.detail));
      addEventListener('formatx:organismshape', event => window.__fxOrganismShapeEvents.push(event.detail));
      document.addEventListener('securitypolicyviolation', event => {
        window.__fxCspViolations.push({
          blockedURI: event.blockedURI || '',
          columnNumber: event.columnNumber || 0,
          disposition: event.disposition || '',
          documentURI: event.documentURI || '',
          effectiveDirective: event.effectiveDirective || '',
          lineNumber: event.lineNumber || 0,
          sample: event.sample || '',
          sourceFile: event.sourceFile || '',
          statusCode: event.statusCode || 0,
          violatedDirective: event.violatedDirective || ''
        });
      });
    });

    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => {
      const text = message.text();
      if (message.type() === 'error' && !/favicon|Failed to load resource:.*status of 404 \(File not found\)|WebGL|WebGPU|GPU/i.test(text)) errors.push(text);
    });

    await page.goto(TEST_URL + '?lang=hu&thought-genome-test=1', { waitUntil: 'domcontentloaded' });
    await activateRuntime(page);

    const initial = await page.evaluate(() => {
      const layer = document.querySelector('.fx-thought-genome-layer');
      const bubble = document.querySelector('.fx-organism-thought');
      const controls = document.querySelector('.fx-thought-genome-controls');
      const layerStyle = layer ? getComputedStyle(layer) : null;
      return {
        bubbleHidden: bubble?.hidden === true,
        layerExists: Boolean(layer),
        controlsExist: Boolean(controls),
        pointerEvents: layerStyle?.pointerEvents,
        layerZ: Number.parseInt(layerStyle?.zIndex || '0', 10),
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        privacy: document.documentElement.dataset.fxThoughtGenomePrivacy,
        enabled: document.documentElement.dataset.fxThoughtGenomeEnabled,
        forms: document.documentElement.dataset.fxThoughtGenomeForms
      };
    });

    const initialOverflow = initial.overflow > 1 ? await overflowDiagnostics(page) : null;
    assert(initial.bubbleHidden, 'thought dialogue must remain closed on startup');
    assert(initial.layerExists && initial.pointerEvents === 'none', 'genome visual layer must exist and remain non-interactive after user activation');
    assert(initial.layerZ < 100, 'genome visual layer must remain behind interactive content');
    assert(initial.controlsExist, 'genome controls were not created');
    assert(initial.overflow <= 1, `genome introduced horizontal overflow (${mobile ? 'mobile' : 'desktop'}): ${JSON.stringify(initialOverflow)}`);
    assert(initial.privacy === 'fingerprint-only', 'genome privacy marker is not fingerprint-only');
    assert(initial.enabled === 'true', 'genome did not start enabled for the validation session');
    assert(initial.forms === '6', 'six-form Thought Genome contract missing');

    const canonicalAsk = page.locator('#hero .fx-reference-controls-r204 .fx-reference-ask').first();
    assert(await canonicalAsk.count() === 1, 'canonical ASK control is missing');
    assert(await canonicalAsk.isVisible(), 'canonical ASK control is not visible');
    await canonicalAsk.click();
    await page.waitForFunction(() => {
      const bubble = document.querySelector('.fx-organism-thought');
      return bubble && bubble.hidden === false;
    });

    const bubble = page.locator('.fx-organism-thought').first();
    assert(await bubble.isVisible(), 'thought dialogue opened semantically but is not visible');

    const disclosure = page.locator('.fx-thought-genome-disclosure').first();
    const disclosureSummary = page.locator('.fx-thought-genome-disclosure > summary').first();
    const openControls = page.locator('.fx-thought-genome-controls').first();
    assert(await openControls.count() === 1, 'genome controls disappeared after opening dialogue');
    if (await disclosure.count()) {
      assert(await disclosureSummary.count() === 1, 'genome progressive-disclosure summary is missing');
      assert(await disclosureSummary.isVisible(), 'genome progressive-disclosure summary is not visible in the open dialogue');
      assert(!(await openControls.isVisible()), 'genome controls must remain collapsed before progressive disclosure is opened');
    } else {
      assert(await openControls.isVisible(), 'genome controls are not visible when no progressive disclosure is present');
    }

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

    if (await disclosure.count()) {
      await disclosureSummary.click();
      await page.waitForFunction(() => document.querySelector('.fx-thought-genome-disclosure')?.open === true);
      assert(await openControls.isVisible(), 'genome controls did not become visible after progressive disclosure opened');
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
      const bubbleNode = document.querySelector('.fx-organism-thought');
      const controls = document.querySelector('.fx-thought-genome-controls');
      const bubbleRect = bubbleNode?.getBoundingClientRect();
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

    const finalOverflow = layout.overflow > 1 ? await overflowDiagnostics(page) : null;
    const cspViolations = await page.evaluate(() => Array.isArray(window.__fxCspViolations) ? window.__fxCspViolations : []);
    assert(layout.controlsInside, 'genome controls escape the thought dialogue');
    assert(layout.overflow <= 1, `genome controls introduced horizontal overflow (${mobile ? 'mobile' : 'desktop'}): ${JSON.stringify(finalOverflow)}`);
    assert(layout.history.length === 1, 'disabling the genome unexpectedly destroyed local fingerprint history');
    assert(!errors.length, 'browser diagnostics: ' + errors.join(' | ') + ' | CSP=' + JSON.stringify(cspViolations));
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await verify({ width: 1440, height: 960 }, false);
  await verify({ width: 390, height: 844 }, true);
  console.log('Synaptic Thought Genome validation passed through the canonical production ASK and progressive-disclosure controls.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});