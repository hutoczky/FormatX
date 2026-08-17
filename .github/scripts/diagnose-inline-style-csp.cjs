'use strict';
const { chromium } = require('playwright');

const url = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4179/scifi-ui/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}

    document.addEventListener('securitypolicyviolation', event => {
      console.error('FX_CSP_TRACE ' + JSON.stringify({
        directive: event.effectiveDirective,
        violated: event.violatedDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sample: event.sample,
        disposition: event.disposition
      }));
    });

    const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(name, value, priority) {
      if (name && name !== 'scroll-behavior') {
        console.error('FX_STYLE_SET ' + JSON.stringify({ name, value, priority: priority || '', stack: new Error('style.setProperty').stack }));
      }
      return nativeSetProperty.call(this, name, value, priority);
    };

    const nativeSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (String(name).toLowerCase() === 'style') {
        console.error('FX_STYLE_ATTR ' + JSON.stringify({ value, stack: new Error('setAttribute(style)').stack }));
      }
      return nativeSetAttribute.call(this, name, value);
    };
  });

  const page = await context.newPage();
  page.on('console', message => {
    const text = message.text();
    if (text.includes('FX_CSP_TRACE') || text.includes('FX_STYLE_SET') || text.includes('FX_STYLE_ATTR') || text.includes('Applying inline style')) {
      const loc = message.location();
      console.log(`${text} @ ${loc.url || 'unknown'}:${loc.lineNumber ?? 0}:${loc.columnNumber ?? 0}`);
    }
  });
  page.on('pageerror', error => console.log('FX_PAGEERROR ' + error.message));

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(7000);
  console.log('FX_TRACE_DONE');
  await context.close();
  await browser.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
