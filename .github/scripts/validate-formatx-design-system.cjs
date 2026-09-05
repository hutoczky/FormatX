'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4181/scifi-ui/';
const CASES = [
  {
    name: 'main',
    url: 'index.html?lang=hu',
    ready: '.fx-category-deck',
    panel: '.fx-category-deck',
    header: '.topbar',
    action: '.hero-actions .button',
    mobileAction: '#menu-toggle',
    sheet: 'link[data-fx-critical-core-r227]',
    sheetPattern: /formatx-critical-core-r227\.css/,
    waitForMotionCss: true
  },
  {
    name: 'checkout',
    url: 'checkout.html?plan=business_pro&cycle=monthly&currency=HUF&lang=hu',
    ready: '.checkout-summary',
    panel: '.checkout-summary',
    header: '.site-header',
    action: '.checkout-language-control button',
    sheet: 'link[data-fx-design-system]',
    sheetPattern: /formatx-design-system\.css\?v=20260728-ds2$/
  },
  {
    name: 'simulator',
    url: 'project-simulator.html?lang=hu',
    ready: '.sim-hero-manifest',
    panel: '.sim-hero-manifest',
    header: '.sim-header',
    action: '#run-simulation',
    sheet: 'link[data-fx-design-system]',
    sheetPattern: /formatx-design-system\.css\?v=20260728-ds2$/
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
  await page.waitForFunction(selector => {
    const link = document.querySelector(selector);
    return document.documentElement.dataset.fxDesignSystem === '2' && link && link.sheet;
  }, config.sheet, { timeout: 20000 });

  if (config.waitForMotionCss) {
    /* R536: main keeps the full DS2 stylesheet out of first paint. Exercise a
       genuine non-reserved intent and require both the enhancement CSS and the
       canonical DS2 sheet before validating its tokens and component geometry. */
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => {
      const motion = document.querySelector('link[data-fx-runtime-static-r243="true"]');
      const design = document.querySelector('link[data-fx-design-system-main-r536="true"]');
      const state = document.documentElement.dataset.fxMotionRuntimeR239 || '';
      return document.documentElement.dataset.fxMotionCssR243 === 'external-strict-csp-user-intent'
        && document.documentElement.dataset.fxDesignSystemRuntimeR536 === 'ready-user-intent'
        && state === 'enhanced-r468-user-intent'
        && motion && motion.sheet && design && design.sheet;
    }, null, { timeout: 20000 });
  }

  const actionSelector = viewport.width <= 900 && config.mobileAction
    ? config.mobileAction
    : config.action;
  const action = page.locator(actionSelector).first();
  await action.waitFor({ state: 'visible', timeout: 15000 });
  await action.focus();

  const result = await page.evaluate(({ panelSelector, headerSelector, actionSelector, sheetSelector }) => {
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
    const sheet = document.querySelector(sheetSelector);
    const overflowElements = Array.from(document.querySelectorAll('body *'))
      .map(element => {
        const r = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(), id: element.id || '',
          className: typeof element.className === 'string' ? element.className : '',
          left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10,
          width: Math.round(r.width * 10) / 10, position: getComputedStyle(element).position,
          overflowX: getComputedStyle(element).overflowX
        };
      })
      .filter(item => item.width > 0 && (item.left < -2 || item.right > innerWidth + 2))
      .sort((a, b) => Math.max(b.right - innerWidth, -b.left) - Math.max(a.right - innerWidth, -a.left))
      .slice(0, 20);

    return {
      designSystem: root.dataset.fxDesignSystem || '',
      designSystemRuntime: root.dataset.fxDesignSystemRuntimeR536 || '',
      motionCss: root.dataset.fxMotionCssR243 || '',
      motionRuntime: root.dataset.fxMotionRuntimeR239 || '',
      sheetHref: sheet?.href || '', sheetLoaded: Boolean(sheet?.sheet),
      cyan: rootStyle.getPropertyValue('--fx-cyan').trim(),
      violet: rootStyle.getPropertyValue('--fx-violet').trim(),
      radius: rootStyle.getPropertyValue('--fx-radius-lg').trim(),
      bodyFont: bodyStyle.fontFamily, bodyColor: bodyStyle.color,
      panelRadii: panelStyle ? [panelStyle.borderTopLeftRadius,panelStyle.borderTopRightRadius,panelStyle.borderBottomRightRadius,panelStyle.borderBottomLeftRadius] : [],
      panelBorder: panelStyle?.borderTopColor || '',
      headerBackdrop: headerStyle?.backdropFilter || headerStyle?.webkitBackdropFilter || '',
      actionHeight: rect?.height || 0, actionWidth: rect?.width || 0,
      outlineStyle: actionStyle?.outlineStyle || '', outlineWidth: actionStyle?.outlineWidth || '',
      overflow: document.documentElement.scrollWidth - innerWidth, overflowElements,
      viewport: { width: innerWidth, height: innerHeight }
    };
  }, { panelSelector: config.panel, headerSelector: config.header, actionSelector, sheetSelector: config.sheet });

  assert.equal(result.designSystem, '2');
  if (config.waitForMotionCss) {
    assert.equal(result.motionCss, 'external-strict-csp-user-intent');
    assert.equal(result.motionRuntime, 'enhanced-r468-user-intent');
    assert.equal(result.designSystemRuntime, 'ready-user-intent');
  }
  assert.equal(result.sheetLoaded, true);
  assert.match(result.sheetHref, config.sheetPattern);
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

  if (viewport.width >= 1200) await page.screenshot({ path: path.join(process.cwd(), 'design-system-' + config.name + '.png'), fullPage: true });
  console.log(JSON.stringify({ case: config.name + '-' + viewport.width, result }));
  await context.close();
}

(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    for (const config of CASES) {
      await inspect(browser, config, { width: 1440, height: 1000 });
      await inspect(browser, config, { width: 390, height: 844 });
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
