'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const output = 'artifacts/r2102-real-commerce-hydration';
const origin = process.env.FORMATX_TEST_URL ||
  'http://127.0.0.1:4178/scifi-ui/index.html';
fs.mkdirSync(output, { recursive: true });

const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 },
    isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 },
    isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
];

async function commercialState(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const cards = [...document.querySelectorAll('[data-plan-id]')];
    const qrCards = [...document.querySelectorAll('[data-plan-qr]')];
    return {
      locale: root.lang,
      hydration: root.dataset.fxCommerceHydrationR2102 || '',
      runtime: root.dataset.fxLivingArchitecture || '',
      selected: document.querySelector('[data-currency][aria-pressed="true"]')
        ?.getAttribute('data-currency') || '',
      prices: cards.map(card => ({
        id: card.dataset.planId,
        title: card.querySelector('.price strong')?.textContent || '',
        href: card.querySelector(':scope > a')?.getAttribute('href') || ''
      })),
      qr: qrCards.map(card => ({
        id: card.dataset.planQr,
        title: card.querySelector('[data-plan-qr-price]')?.textContent || '',
        href: card.querySelector('.fx-plan-qr-link')?.getAttribute('href') || '',
        imageLoading: card.querySelector('[data-plan-qr-image]')
          ?.getAttribute('loading') || ''
      })),
      heading: document.querySelector('#hero .hero-title-main')?.textContent || '',
      actions: !!document.querySelector('#hero .hero-actions #hero-download')
    };
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage',
      '--use-gl=angle', '--use-angle=swiftshader']
  });
  const results = [];
  try {
    for (const device of devices) {
      const context = await browser.newContext({
        viewport: device.viewport, isMobile: device.isMobile,
        hasTouch: device.hasTouch, deviceScaleFactor: device.deviceScaleFactor,
        locale: 'hu-HU', colorScheme: 'dark'
      });
      try {
        // Exercise the real first-visit runtime rather than automation-skip
        // branches; the site also runs a separate unmodified Lighthouse suite.
        await context.addInitScript(() => {
          Object.defineProperty(Navigator.prototype, 'webdriver', {
            configurable: true, get: () => undefined
          });
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => {
          const root = document.documentElement;
          const state = root.dataset.fxCommerceHydrationR2102;
          return root.dataset.fxLivingArchitecture === 'ready-performance-v3' &&
            (state === 'idle-complete' ||
             root.dataset.fxQrLoading === 'active-near-viewport');
        }, null, { timeout: 15000 });
        const initial = await commercialState(page);
        assert.equal(initial.prices.length, 3, 'All original pricing tiers must exist');
        assert.equal(initial.qr.length, 3, 'All original QR cards must exist');
        assert.ok(initial.actions, 'Original hero download CTA must survive');
        assert.equal(initial.selected, 'HUF', 'Initial currency must remain HUF');
        for (const item of initial.prices) {
          assert.ok(/currency=HUF/.test(item.href), 'HUF checkout link: ' + JSON.stringify(item));
          assert.ok(/Ft|HUF/.test(item.title), 'HUF amount: ' + JSON.stringify(item));
        }
        for (const item of initial.qr) {
          assert.ok(/currency=HUF/.test(item.href), 'HUF QR link: ' + JSON.stringify(item));
          assert.ok(/Ft|HUF/.test(item.title), 'HUF QR label: ' + JSON.stringify(item));
        }

        // The 10-second cinematic intentionally covers the page on first
        // visit; native click dispatch still verifies the real pricing event.
        await page.evaluate(() => {
          const eur = document.querySelector('[data-currency="EUR"]');
          if (!eur) throw new Error('EUR currency button missing');
          eur.click();
        });
        await page.waitForFunction(() => {
          const card = document.querySelector('[data-plan-id="business_pro"]');
          const link = card?.querySelector(':scope > a');
          return /currency=EUR/.test(link?.getAttribute('href') || '') &&
            /EUR|€/.test(card?.querySelector('.price strong')?.textContent || '');
        }, null, { timeout: 5000 });
        const eur = await commercialState(page);
        assert.equal(eur.selected, 'EUR');
        for (const item of [...eur.prices, ...eur.qr]) {
          assert.ok(/currency=EUR/.test(item.href),
            'Every checkout must reflect live EUR selection: ' + JSON.stringify(item));
          assert.ok(/EUR|€/.test(item.title),
            'Every amount must display EUR: ' + JSON.stringify(item));
        }

        const changed = await page.evaluate(() => {
          const language = document.querySelector('.fx-language-toggle');
          if (!language) return false;
          language.click();
          return true;
        });
        assert.ok(changed, 'Real language toggle must exist');
        await page.waitForFunction(() => document.documentElement.lang === 'en',
          null, { timeout: 5000 });
        await page.waitForFunction(() => {
          const card = document.querySelector('[data-plan-id="business_pro"]');
          return /currency=EUR/.test(card?.querySelector(':scope > a')
            ?.getAttribute('href') || '');
        }, null, { timeout: 5000 });
        const english = await commercialState(page);
        assert.equal(english.locale, 'en');
        for (const item of [...english.prices, ...english.qr]) {
          assert.ok(/currency=EUR/.test(item.href),
            'EN checkout keeps the selected currency: ' + JSON.stringify(item));
        }
        assert.deepEqual(errors, [], 'Live commerce/runtime JS errors');
        results.push({ device: device.name, initial, eur, english, errors });
        console.log('PASS R2102_REAL_COMMERCE', JSON.stringify({
          device: device.name, hydration: initial.hydration,
          prices: english.prices.length, qr: english.qr.length,
          selected: english.selected, locale: english.locale
        }));
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(output, 'evidence.json'),
    JSON.stringify(results, null, 2) + '\n');
})().catch(error => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
