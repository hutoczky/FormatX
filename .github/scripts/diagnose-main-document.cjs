'use strict';

const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4181/scifi-ui/index.html?lang=hu';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'hu-HU' });
  const page = await context.newPage();
  const events = [];

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) events.push('main-navigation: ' + frame.url());
  });
  page.on('pageerror', error => events.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') events.push(message.type() + ': ' + message.text());
  });
  page.on('close', () => events.push('page-close'));

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const snapshot = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const main = document.getElementById('main-content');
    return {
      href: location.href,
      readyState: document.readyState,
      contentType: document.contentType,
      rootPresent: Boolean(root),
      rootTag: root?.tagName || '',
      bodyPresent: Boolean(body),
      mainPresent: Boolean(main),
      deckCount: document.querySelectorAll?.('.fx-category-deck')?.length || 0,
      proofCount: document.querySelectorAll?.('.fx-origin-proof')?.length || 0,
      simulatorEntryCount: document.querySelectorAll?.('[data-fx-simulator-entry]')?.length || 0,
      mainChildren: main ? Array.from(main.children, element => ({
        tag: element.tagName,
        id: element.id,
        className: element.className
      })) : [],
      scripts: Array.from(document.scripts || [], script => script.src || '[inline]'),
      dataset: root ? { ...root.dataset } : {},
      bodyStart: body ? body.innerHTML.slice(0, 1800) : '',
      rootStart: root ? root.outerHTML.slice(0, 1800) : ''
    };
  }).catch(error => ({ evaluateError: String(error) }));

  console.log(JSON.stringify({ case: 'main-document-diagnostic', events, snapshot }));
  await context.close();
  await browser.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
