'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL
  || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});

  const completed = await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout: 5000 }).then(() => true).catch(() => false);

  if (completed) return;
  await page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending', 'fx-intro-reveal');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.classList.contains('fx-intro-complete')
      && root.dataset.fxSingleLanguageToggle === 'ready'
      && root.dataset.fxCopyPolish === 'ready-v1'
      && /^(ready|fallback)-v4$/.test(root.dataset.fxReleaseMetadata || '')
      && root.dataset.fxInteractionGenomeExport === 'ready'
      && root.dataset.fxTranscendLoader === 'safe-ready-v26'
      && Boolean(document.getElementById('fx-licence-clarity'))
      && document.querySelector('#hero-download [data-release-download-label]')?.textContent.trim()
        === 'Multiplatform nyilvános béta letöltése'
      && document.querySelector('.site-footer [data-fx-licence-link]')?.textContent.trim()
        === 'Licenc';
  }, null, { timeout: 45000 });
}

async function readCopy(page) {
  return page.evaluate(() => ({
    lang: document.documentElement.lang,
    nav: Array.from(
      document.querySelectorAll('#main-nav a'),
      node => node.textContent.trim()
    ),
    heroDownload: document.querySelector('#hero-download span')?.textContent.trim() || '',
    trialLabel: document.querySelector('.hero-facts > span:nth-child(3) small')?.textContent.trim() || '',
    pricingTitle: Array.from(
      document.querySelectorAll('#pricing-title > span, #pricing-title > em'),
      node => node.textContent.trim()
    ).join(' '),
    licenceTitle: document.getElementById('fx-licence-clarity-title')?.textContent.trim() || '',
    licenceItems: Array.from(
      document.querySelectorAll('#fx-licence-clarity li'),
      node => node.textContent.trim()
    ),
    footerLicence: document.querySelector('.site-footer a[data-fx-licence-link]')?.textContent.trim() || '',
    visibleLanguageButtons: Array.from(
      document.querySelectorAll('.fx-language-toggle, .language-switch [data-language]')
    ).filter(node => getComputedStyle(node).display !== 'none' && !node.hidden).length,
    legacyVersionCopy: /\bV(?:92|120)\b|92\.00|Windows nyilvános béta letöltése/i.test(
      document.body.innerText
    ),
    horizontalOverflow: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    ) - innerWidth,
  }));
}

async function assertHungarian(page, name) {
  const state = await readCopy(page);
  assert(state.lang === 'hu', name + ': language is not Hungarian: ' + JSON.stringify(state));
  assert(
    JSON.stringify(state.nav) === JSON.stringify([
      'Működés', 'Modulok', 'Licenc és árak', 'Biztonság', 'Letöltés'
    ]),
    name + ': Hungarian navigation mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.heroDownload === 'Multiplatform nyilvános béta letöltése',
    name + ': Hungarian multiplatform download label mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.trialLabel === 'napos próbalicenc',
    name + ': Hungarian trial fact mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.pricingTitle === 'A licenccsomag a munkádhoz igazodik.',
    name + ': Hungarian licence heading mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.licenceTitle === 'Mit ad a FormatX licenc?',
    name + ': Hungarian licence clarification missing: ' + JSON.stringify(state)
  );
  assert(
    state.licenceItems.length === 4,
    name + ': licence clarification must contain four points: ' + JSON.stringify(state)
  );
  assert(
    state.footerLicence === 'Licenc',
    name + ': footer licence link mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.visibleLanguageButtons === 1,
    name + ': exactly one visible language button required: ' + JSON.stringify(state)
  );
  assert(
    !state.legacyVersionCopy,
    name + ': public legacy or hardcoded version copy remains: ' + JSON.stringify(state)
  );
  assert(
    state.horizontalOverflow <= 1,
    name + ': horizontal overflow: ' + JSON.stringify(state)
  );
}

async function assertEnglish(page, name) {
  const state = await readCopy(page);
  assert(state.lang === 'en', name + ': language is not English: ' + JSON.stringify(state));
  assert(
    JSON.stringify(state.nav) === JSON.stringify([
      'Workflow', 'Modules', 'Licence & pricing', 'Safety', 'Downloads'
    ]),
    name + ': English navigation mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.heroDownload === 'Download multiplatform public beta',
    name + ': English multiplatform download label mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.trialLabel === 'day trial licence',
    name + ': English trial fact mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.pricingTitle === 'The licence plan fits your work.',
    name + ': English licence heading mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.licenceTitle === 'What does the FormatX licence grant?',
    name + ': English licence clarification missing: ' + JSON.stringify(state)
  );
  assert(
    state.licenceItems.length === 4,
    name + ': English licence clarification must contain four points: ' + JSON.stringify(state)
  );
  assert(
    state.footerLicence === 'Licence',
    name + ': English footer licence link mismatch: ' + JSON.stringify(state)
  );
  assert(
    state.visibleLanguageButtons === 1,
    name + ': exactly one visible language button required after language change: '
      + JSON.stringify(state)
  );
  assert(
    !state.legacyVersionCopy,
    name + ': public legacy or hardcoded version copy remains in English: '
      + JSON.stringify(state)
  );
  assert(
    state.horizontalOverflow <= 1,
    name + ': horizontal overflow after language change: ' + JSON.stringify(state)
  );
}

async function testViewport(browser, viewport, name, mobile) {
  const context = await browser.newContext({
    viewport,
    isMobile: Boolean(mobile),
    hasTouch: Boolean(mobile),
    locale: 'hu-HU',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await waitReady(page);
  await assertHungarian(page, name);

  await page.locator('.fx-language-toggle').click();
  await page.waitForFunction(() => (
    document.documentElement.lang === 'en'
    && document.documentElement.dataset.fxCopyPolish === 'ready-v1'
    && /^(ready|fallback)-v4$/.test(document.documentElement.dataset.fxReleaseMetadata || '')
    && document.querySelector('#hero-download [data-release-download-label]')?.textContent.trim()
      === 'Download multiplatform public beta'
    && document.querySelector('.site-footer [data-fx-licence-link]')?.textContent.trim()
      === 'Licence'
  ));
  await assertEnglish(page, name);

  const meaningful = errors.filter(
    item => !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED/i.test(item)
  );
  assert(!meaningful.length, name + ': browser errors: ' + meaningful.join(' | '));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-swiftshader'],
  });
  try {
    await testViewport(browser, { width: 1440, height: 900 }, 'desktop', false);
    await testViewport(browser, { width: 390, height: 844 }, 'mobile', true);
    console.log(
      'PASS FormatX bilingual labels, multiplatform CTA and licence clarification'
    );
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
