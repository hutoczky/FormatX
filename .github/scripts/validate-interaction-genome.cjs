'use strict';

const fs = require('node:fs');
const { chromium } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4179/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skip.click({ force: true });
  }
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

async function waitGenome(page) {
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInteractionGenome === 'ready'
    && document.documentElement.dataset.fxInteractionGenomeExport === 'ready'
    && window.FormatXInteractionGenome
  ), null, { timeout: 30000 });
}

async function state(page) {
  return page.evaluate(() => {
    const api = window.FormatXInteractionGenome;
    const data = api.getState();
    const overlay = document.getElementById('fx-interaction-genome');
    const canvas = document.getElementById('fx-genome-canvas');
    const rect = canvas?.getBoundingClientRect();
    return {
      marker: document.documentElement.dataset.fxInteractionGenome,
      exportMarker: document.documentElement.dataset.fxInteractionGenomeExport,
      count: data.items.length,
      selected: data.selected,
      fingerprint: data.fingerprint,
      opened: data.opened,
      overlayOpen: overlay?.dataset.open,
      canvas: [Math.round(rect?.width || 0), Math.round(rect?.height || 0)],
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      lang: document.documentElement.lang,
      launcher: Boolean(document.querySelector('.fx-genome-launcher')),
      schemaReady: data.items.every(item => (
        typeof item.y === 'number'
        && typeof item.scene === 'number'
        && typeof item.lang === 'string'
      ))
    };
  });
}

async function desktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'hu-HU',
    colorScheme: 'dark',
    acceptDownloads: true
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(URL + '?lang=hu&genome-test=1', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await waitGenome(page);

  await page.evaluate(() => {
    scrollTo(0, 640);
    window.FormatXInteractionGenome.record('scroll', 'Desktop checkpoint A', {
      y: 640, progress: .18, scene: 1, lang: 'hu', audio: 'off', loop: 0
    });
    scrollTo(0, 1280);
    window.FormatXInteractionGenome.record('scene', 'Desktop checkpoint B', {
      y: 1280, progress: .36, scene: 2, lang: 'hu', audio: 'off', loop: 0
    });
  });

  const english = page.locator('[data-language="en"]').first();
  if (await english.count()) await english.evaluate(node => node.click());
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await page.evaluate(() => window.FormatXInteractionGenome.record(
    'language',
    'Language checkpoint',
    {
      y: scrollY,
      scene: Number(document.documentElement.dataset.fxThreeScene || 0),
      lang: 'en'
    }
  ));

  await page.locator('.fx-genome-launcher').click();
  await page.waitForFunction(() => document.getElementById('fx-interaction-genome')?.dataset.open === 'true');
  await page.waitForTimeout(180);

  let current = await state(page);
  assert(current.marker === 'ready', 'genome marker: ' + JSON.stringify(current));
  assert(current.exportMarker === 'ready', 'genome exporter marker: ' + JSON.stringify(current));
  assert(current.count >= 4, 'not enough genome nodes: ' + JSON.stringify(current));
  assert(current.fingerprint.length === 64, 'invalid SHA-256 fingerprint: ' + current.fingerprint);
  assert(
    current.overlayOpen === 'true' && current.canvas[0] > 700 && current.canvas[1] > 400,
    'desktop genome stage: ' + JSON.stringify(current)
  );
  assert(current.overflow <= 1, 'desktop horizontal overflow: ' + current.overflow);
  assert(current.schemaReady, 'invalid genome state schema');
  assert(
    /website remembers|honlap emlékszik/i.test(await page.locator('#fx-genome-title').textContent()),
    'translated genome title missing'
  );

  const checkpointIndex = await page.evaluate(() => (
    window.FormatXInteractionGenome.getState().items.findIndex(
      item => item.action === 'Desktop checkpoint A'
    )
  ));
  assert(checkpointIndex >= 0, 'checkpoint not found');
  await page.evaluate(index => window.FormatXInteractionGenome.restore(index), checkpointIndex);
  await page.waitForFunction(() => Math.abs(scrollY - 640) < 12, null, { timeout: 5000 });
  await page.waitForFunction(() => document.documentElement.lang === 'hu', null, { timeout: 5000 });

  await page.locator('.fx-genome-launcher').click();
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  await page.locator('#fx-genome-export').click();
  const download = await downloadPromise;
  const file = await download.path();
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert(payload.schema === 'formatx-interaction-genome-v1', 'export schema');
  assert(
    payload.local_only === true
      && payload.contains_form_values === false
      && payload.contains_personal_text === false,
    'privacy metadata'
  );
  assert(
    payload.fingerprint_sha256.length === 64 && payload.states.length >= 4,
    'export payload'
  );

  const meaningful = errors.filter(error => !/WebGL|WebGPU|GPU|favicon|ERR_ABORTED/i.test(error));
  assert(!meaningful.length, 'desktop browser errors: ' + meaningful.join(' | '));
  current = await state(page);
  console.log(JSON.stringify({
    case: 'interaction-genome-desktop',
    current,
    exportedStates: payload.states.length
  }));
  await context.close();
}

async function mobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    locale: 'hu-HU',
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  await page.goto(URL + '?lang=hu&genome-test=1', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await waitGenome(page);
  await page.evaluate(() => {
    window.FormatXInteractionGenome.record('click', 'Mobile checkpoint', {
      y: 260, progress: .1, scene: 0, lang: 'hu', audio: 'off', loop: 0
    });
    window.FormatXInteractionGenome.open();
  });
  await page.waitForFunction(() => document.getElementById('fx-interaction-genome')?.dataset.open === 'true');
  await page.waitForTimeout(150);
  const current = await state(page);
  assert(current.canvas[0] >= 360 && current.canvas[1] >= 420, 'mobile canvas: ' + JSON.stringify(current));
  assert(current.overflow <= 1, 'mobile horizontal overflow: ' + current.overflow);
  assert(current.launcher && current.count >= 2, 'mobile genome missing: ' + JSON.stringify(current));
  console.log(JSON.stringify({ case: 'interaction-genome-mobile', current }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--disable-smooth-scrolling']
  });
  try {
    await desktop(browser);
    await mobile(browser);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
