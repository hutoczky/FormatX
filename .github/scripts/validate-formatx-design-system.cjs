'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4181/scifi-ui/';
const CASES = [
  {
    name: 'main',
    url: 'index.html?lang=hu&lighthouse=1',
    ready: '.fx-category-deck',
    panel: '.fx-category-deck',
    header: '.topbar',
    action: '.hero-actions .button'
  },
  {
    name: 'checkout',
    url: 'checkout.html?plan=business_pro&cycle=monthly&currency=HUF&lang=hu',
    ready: '.checkout-summary',
    panel: '.checkout-summary',
    header: '.site-header',
    action: '.checkout-language-control button'
  },
  {
    name: 'simulator',
    url: 'project-simulator.html?lang=hu',
    ready: '.sim-hero-manifest',
    panel: '.sim-hero-manifest',
    header: '.sim-header',
    action: '#run-simulation'
  }
];

function expectedStaticApiFailure(config, rawUrl) {
  try {
    const url = new URL(rawUrl);
    return config.name === 'checkout' && url.origin === 'http://127.0.0.1:4181' && url.pathname.startsWith('/api/');
  } catch (_) {
    return false;
  }
}

async function inspect(browser, config, viewport) {
  const context = await browser.newContext({ viewport, locale: 'hu-HU', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];

  page.on('pageerror', error => errors.push('pageerror: ' + error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/^Failed to load resource:/i.test(text)) return;
    errors.push('console: ' + text);
  });
  page.on('response', response => {
    if (response.status() < 400 || expectedStaticApiFailure(config, response.url())) return;
    const request = response.request();
    errors.push('http ' + response.status() + ' ' + request.resourceType() + ': ' + response.url());
  });
  page.on('requestfailed', request => {
    if (expectedStaticApiFailure(config, request.url())) return;
    errors.push('requestfailed ' + request.resourceType() + ': ' + request.url() + ' — ' + (request.failure()?.errorText || 'unknown'));
  });

  await page.goto(BASE + config.url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(config.ready, { state: 'attached', timeout: 20000 });
  await page.waitForFunction(() => {
    const link = document.querySelector('link[data-fx-design-system]');
    return document.documentElement.dataset.fxDesignSystem === '2' && link && link.sheet;
  }, null, { timeout: 20000 });

  const action = page.locator(config.action).first();
  await action.waitFor({ state: 'visible', timeout: 15000 });
  await action.focus();

  const result = await page.evaluate(({ panelSelector, headerSelector, actionSelector }) => {
    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);
    const bodyStyle = getComputedStyle(document.body);
    const panel = document.querySelector(panelSelector);
    const header = document.querySelector(headerSelector);
    const action = document.querySelector(actionSelector);
    const panelStyle = panel ? getComputedStyle(panel) : null;
    const headerStyle = header ? getComputedStyle(header) : null;
    const actionStyle = action ? getComputedStyle(action) : null;
    const rect = action?.getBoundingClientRect();
    const sheet = document.querySelector('link[data-fx-design-system]');

    return {
      designSystem: root.dataset.fxDesignSystem || '',
      sheetHref: sheet?.href || '',
      sheetLoaded: Boolean(sheet?.sheet),
      cyan: rootStyle.getPropertyValue('--fx-cyan').trim(),
      violet: rootStyle.getPropertyValue('--fx-violet').trim(),
      radius: rootStyle.getPropertyValue('--fx-radius-lg').trim(),
      bodyFont: bodyStyle.fontFamily,
      bodyColor: bodyStyle.color,
      panelRadii: panelStyle ? [
        panelStyle.borderTopLeftRadius,
        panelStyle.borderTopRightRadius,
        panelStyle.borderBottomRightRadius,
        panelStyle.borderBottomLeftRadius
      ] : [],
      panelBorder: panelStyle?.borderTopColor || '',
      headerBackdrop: headerStyle?.backdropFilter || headerStyle?.webkitBackdropFilter || '',
      actionHeight: rect?.height || 0,
      actionWidth: rect?.width || 0,
      outlineStyle: actionStyle?.outlineStyle || '',
      outlineWidth: actionStyle?.outlineWidth || '',
      overflow: document.documentElement.scrollWidth - innerWidth,
      viewport: { width: innerWidth, height: innerHeight }
    };
  }, { panelSelector: config.panel, headerSelector: config.header, actionSelector: config.action });

  assert.equal(result.designSystem, '2');
  assert.equal(result.sheetLoaded, true);
  assert.match(result.sheetHref, /formatx-design-system\.css\?v=20260728-ds2$/);
  assert.equal(result.cyan.toLowerCase(), '#7cecff');
  assert.equal(result.violet.toLowerCase(), '#8f72ff');
  assert.equal(result.radius, '30px 7px 30px 7px');
  assert.match(result.bodyFont, /Inter|system-ui/i);
  assert.deepEqual(result.panelRadii, ['30px', '7px', '30px', '7px']);
  assert.ok(result.headerBackdrop.includes('blur') || result.headerBackdrop === 'none');
  assert.ok(result.actionHeight >= 38, 'action too short: ' + JSON.stringify(result));
  assert.ok(result.actionWidth >= 38, 'action too narrow: ' + JSON.stringify(result));
  assert.equal(result.outlineStyle, 'solid');
  assert.equal(result.outlineWidth, '2px');
  assert.ok(result.overflow <= 2, 'horizontal overflow: ' + JSON.stringify(result));
  assert.deepEqual(errors, [], 'browser errors: ' + JSON.stringify(errors));

  if (viewport.width >= 1200) {
    await page.screenshot({
      path: path.join(process.cwd(), 'design-system-' + config.name + '.png'),
      fullPage: true
    });
  }

  console.log(JSON.stringify({ case: config.name + '-' + viewport.width, result }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const config of CASES) {
      await inspect(browser, config, { width: 1440, height: 1000 });
      await inspect(browser, config, { width: 390, height: 844 });
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
