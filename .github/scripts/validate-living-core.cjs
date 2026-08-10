'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL
  ? new URL('/scifi-ui/living-core.html', process.env.FORMATX_TEST_URL).href
  : 'http://127.0.0.1:4178/scifi-ui/living-core.html';

const CHROMIUM_ARGS = [
  '--use-gl=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
  '--disable-dev-shm-usage'
];

function assert(value, message) {
  if (!value) throw new Error(message);
}

function diagnostics(page, entries) {
  page.on('pageerror', error => entries.push(`pageerror: ${String(error.stack || error)}`));
  page.on('console', message => {
    if (message.type() === 'error') entries.push(`console-error: ${message.text()}`);
  });
  page.on('requestfailed', request => {
    if (request.url().startsWith('https://api.github.com/')) return;
    entries.push(`requestfailed: ${request.url()} — ${request.failure()?.errorText || 'unknown'}`);
  });
}

async function readState(page) {
  return page.evaluate(() => {
    const app = window.__FORMATX_LIVING_CORE__;
    const canvas = document.getElementById('living-core-canvas');
    const panel = document.getElementById('lc-panel');
    return {
      ready: Boolean(app && app.renderer && app.scene && app.corePoints),
      nodes: document.querySelectorAll('.lc-node').length,
      lines: document.querySelectorAll('[data-link]').length,
      actionLinks: document.querySelectorAll('.lc-actionbar a').length,
      panelHidden: panel?.getAttribute('aria-hidden'),
      panelTitle: document.getElementById('lc-panel-title')?.textContent || '',
      activeNodes: document.querySelectorAll('.lc-node.is-active').length,
      canvas: canvas ? [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight] : null,
      drawCount: app?.coreGeometry?.drawRange?.count || 0,
      renderedPoints: app?.renderer?.info?.render?.points || 0,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      sound: document.getElementById('lc-sound')?.getAttribute('aria-pressed'),
      robots: document.querySelector('meta[name="robots"]')?.content || '',
      title: document.title,
      fullDownload: document.getElementById('lc-full-download')?.href || '',
      androidDownload: document.querySelector('.lc-actionbar a:nth-child(2)')?.href || '',
      releasePage: document.querySelector('.lc-actionbar a:nth-child(3)')?.href || ''
    };
  });
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const app = window.__FORMATX_LIVING_CORE__;
    return Boolean(app && app.renderer && app.corePoints && app.renderer.info.render.frame > 1);
  }, null, { timeout: 20000 });
}

function assertReleaseRoutes(state) {
  assert(state.robots === 'noindex,nofollow,noarchive', `Living Core robots policy: ${state.robots}`);
  assert(/Living Core Lab/i.test(state.title), `Living Core title: ${state.title}`);
  const fullReleaseTrusted = state.fullDownload.includes('FormatX-Updates/releases')
    || state.fullDownload.endsWith('/download/multiplatform');
  assert(fullReleaseTrusted, `Full release link: ${state.fullDownload}`);
  assert(state.androidDownload.endsWith('/download/android'), `Android full-release link: ${state.androidDownload}`);
  const releaseCentreTrusted = state.releasePage.endsWith('/FormatX-Updates/releases')
    || state.releasePage.endsWith('/scifi-ui/downloads/');
  assert(releaseCentreTrusted, `Release centre link: ${state.releasePage}`);
}

async function desktop() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    const page = await context.newPage();
    const errors = [];
    diagnostics(page, errors);
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitReady(page);
    await page.waitForTimeout(700);

    let state = await readState(page);
    assert(state.ready, 'Living Core engine is not ready');
    assert(state.nodes === 6 && state.lines === 6, `Living Core topology: ${JSON.stringify(state)}`);
    assert(state.actionLinks === 3, 'Living Core action bar is incomplete');
    assert(state.canvas[0] >= 1200 && state.canvas[1] >= 800, `Living Core canvas: ${state.canvas}`);
    assert(state.drawCount >= 4000 && state.renderedPoints > 0, `Living Core particle field: ${JSON.stringify(state)}`);
    assert(state.overflow <= 1, `Living Core horizontal overflow: ${state.overflow}`);
    assertReleaseRoutes(state);

    await page.keyboard.press('4');
    await page.waitForFunction(() => document.getElementById('lc-panel')?.getAttribute('aria-hidden') === 'false');
    await page.waitForTimeout(750);
    state = await readState(page);
    assert(/Biztonságos törlés/i.test(state.panelTitle), `Keyboard node selection: ${state.panelTitle}`);
    assert(state.activeNodes === 1, `Active node count after selection: ${state.activeNodes}`);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('lc-panel')?.getAttribute('aria-hidden') === 'true');
    state = await readState(page);
    assert(state.activeNodes === 0, `Active node remained after ESC: ${state.activeNodes}`);

    await page.locator('.lc-node[data-node="5"]').click();
    await page.waitForFunction(() => /AI Segítség/i.test(document.getElementById('lc-panel-title')?.textContent || ''));
    await page.locator('#lc-sound').click();
    state = await readState(page);
    assert(state.sound === 'true', 'Generative sound toggle did not activate');

    await page.screenshot({ path: 'living-core-desktop.png', fullPage: false });
    assert(errors.length === 0, `Living Core diagnostics: ${errors.join(' | ')}`);
    console.log(JSON.stringify({ case: 'living-core-desktop', state }));
    await context.close();
  } finally {
    await browser.close();
  }
}

async function mobile() {
  const browser = await chromium.launch({ headless: true, args: CHROMIUM_ARGS });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      colorScheme: 'dark'
    });
    const page = await context.newPage();
    const errors = [];
    diagnostics(page, errors);
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitReady(page);
    await page.locator('.lc-node[data-node="0"]').click();
    await page.waitForFunction(() => document.getElementById('lc-panel')?.getAttribute('aria-hidden') === 'false');
    await page.waitForTimeout(500);
    const state = await readState(page);
    assert(state.canvas[2] >= 380 && state.canvas[3] >= 800, `Mobile canvas: ${state.canvas}`);
    assert(state.overflow <= 1, `Mobile horizontal overflow: ${state.overflow}`);
    assert(state.activeNodes === 1 && /ISO/i.test(state.panelTitle), `Mobile panel: ${JSON.stringify(state)}`);
    assertReleaseRoutes(state);
    await page.screenshot({ path: 'living-core-mobile.png', fullPage: false });
    assert(errors.length === 0, `Living Core mobile diagnostics: ${errors.join(' | ')}`);
    console.log(JSON.stringify({ case: 'living-core-mobile', state }));
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  await desktop();
  await mobile();
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
