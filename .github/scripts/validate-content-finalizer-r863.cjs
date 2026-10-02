'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

// Run the real component in a small DOM so other runtime owners cannot conceal
// redundant writes. The query variation must have identical product behavior.
const fixture = `<!doctype html><html lang="hu"><body>
  <nav id="main-nav"><a href="#experience">Old label</a></nav>
  <section id="hero">
    <div class="hero-actions"><a data-fx-simulator-entry>Simulator</a></div>
    <a id="hero-download" download><span>Old download</span></a>
    <div class="hero-facts">${'<span><b>—</b><small>Loading</small></span>'.repeat(3)}</div>
    ${'<div class="hero-label"><span>—</span><b>Loading</b></div>'.repeat(3)}
  </section>
  <div class="fx-single-language-switch" hidden aria-hidden="true"><button class="fx-language-toggle" hidden>HU</button></div>
  <aside class="fx-organism-dialogue"><button class="fx-organism-thought-trigger">Thought</button></aside>
  <button class="fx-genome-launcher">Organism</button>
  <footer class="site-footer"><nav></nav></footer>
</body></html>`;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    for (const mobile of [false, true]) {
      for (const query of ['', '?lighthouse=1']) {
        const context = await browser.newContext({
          viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
          isMobile: mobile, hasTouch: mobile,
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://formatx.test/**', route => route.fulfill({ contentType: 'text/html', body: fixture }));
        await page.goto(`https://formatx.test/${query}`);
        await page.evaluate(() => {
          document.documentElement.__FORMATX_CONTENT_DATA__ = {
            status: { platforms: ['linux', 'windows', 'android', 'web'] },
            tests: { cases: [{ status: 'verified' }, { status: 'pending' }] },
            issues: { items: [{}] },
          };
        });
        await page.addScriptTag({ path: path.resolve('docs/scifi-ui/scripts/formatx-content-finalizer.js') });
        const initial = await page.evaluate(() => {
          const download = document.getElementById('hero-download');
          window.__stableDownloadText = download.firstElementChild.firstChild;
          window.__mutations = [];
          window.__observer = new MutationObserver(records => window.__mutations.push(...records));
          window.__observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
          for (const name of ['formatx:platformstatusready', 'formatx:releasemetadataready', 'formatx:organisminterfaceready', 'formatx:languagechange', 'resize']) {
            window.dispatchEvent(new Event(name));
            window.dispatchEvent(new Event(name));
          }
          return {
            href: download.getAttribute('href'),
            fallback: download.classList.contains('is-metadata-fallback'),
            facts: Array.from(document.querySelectorAll('.hero-facts b'), node => node.textContent),
            simulator: document.querySelector('[data-fx-simulator-entry]').getAttribute('href'),
          };
        });
        assert.equal(initial.href, '/scifi-ui/downloads/');
        assert.equal(initial.fallback, true);
        assert.deepEqual(initial.facts, ['04', '04', '01']);
        assert.equal(initial.simulator, '/scifi-ui/project-simulator.html');
        // Include both scheduled repairs, without replacing the product clock.
        await page.waitForTimeout(3800);
        const unchanged = await page.evaluate(() => {
          window.__mutations.push(...window.__observer.takeRecords());
          window.__observer.disconnect();
          return {
            mutations: window.__mutations.map(record => ({ type: record.type, name: record.attributeName, target: record.target.className || record.target.nodeName })),
            preservedText: window.__stableDownloadText === document.querySelector('#hero-download span').firstChild,
          };
        });
        assert.deepEqual(unchanged.mutations, [], `unchanged metadata must not mutate DOM: mobile=${mobile}, query=${query}`);
        assert(unchanged.preservedText, 'unchanged copy must retain its text node');

        const updated = await page.evaluate(() => {
          const root = document.documentElement;
          root.lang = 'en';
          root.__FORMATX_CONTENT_DATA__.tests.cases.push({ status: 'verified' });
          root.__FORMATX_RELEASE_METADATA__ = { release: { channels: { multiplatform: {
            available: true,
            download_url: 'https://github.com/hutoczky/FormatX-Updates/releases/download/fixture/formatx.zip',
          } } } };
          window.dispatchEvent(new Event('formatx:releasemetadataready'));
          const link = document.getElementById('hero-download');
          return {
            href: link.getAttribute('href'), label: link.textContent,
            fallback: link.classList.contains('is-metadata-fallback'),
            verified: document.querySelectorAll('.hero-facts b')[2].textContent,
            navigation: document.querySelector('#main-nav a').textContent,
            core: document.querySelector('[data-fx-mobile-core-button]')?.textContent,
          };
        });
        assert.equal(updated.href, 'https://github.com/hutoczky/FormatX-Updates/releases/download/fixture/formatx.zip');
        assert.equal(updated.label, 'Download full multiplatform version');
        assert.equal(updated.fallback, false);
        assert.equal(updated.verified, '02');
        assert.equal(updated.navigation, 'Nervous system — How it works');
        if (mobile) assert.equal(updated.core, 'CORE');
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ mobile, query, redundantMutations: unchanged.mutations.length, updated }));
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
