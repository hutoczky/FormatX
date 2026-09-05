'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME = process.env.CHROME_BIN;
const OUT = process.env.FORMATX_R533_EVIDENCE_DIR || 'artifacts/r533-preloader-timing';
fs.mkdirSync(OUT, { recursive: true });

function testUrl(name) {
  const url = new URL(BASE);
  url.searchParams.set('r533_preloader', `${name}-${Date.now()}`);
  return url.href;
}

async function verify(browser, spec) {
  const context = await browser.newContext({
    viewport: spec.viewport,
    isMobile: spec.mobile,
    hasTouch: spec.mobile,
    deviceScaleFactor: spec.mobile ? 2 : 1,
    locale: 'hu-HU',
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!/favicon|WebGL|WebGPU|GPU/i.test(text)) errors.push(text);
  });

  await page.addInitScript(() => {
    window.__fxR533PreloaderEvidence = { completeAt: null, source: null };
    document.addEventListener('formatx:preloadercomplete', event => {
      window.__fxR533PreloaderEvidence.completeAt = performance.now();
      window.__fxR533PreloaderEvidence.source = String(event?.detail?.source || '');
    }, { once: true, capture: true });
  });

  try {
    await page.goto(testUrl(spec.name), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.documentElement.dataset.fxPreloaderR531 === 'done', null, { timeout: 10000 });
    const state = await page.evaluate(() => {
      const root = document.documentElement;
      const overlay = document.getElementById('formatx-event-horizon');
      const hero = document.getElementById('hero');
      const heroStyle = hero ? getComputedStyle(hero) : null;
      return {
        evidence: window.__fxR533PreloaderEvidence || {},
        timing: root.dataset.fxPreloaderTimingR533 || '',
        preloader: root.dataset.fxPreloaderR531 || '',
        release: root.dataset.fxPreloaderReleaseR531 || '',
        intro: root.dataset.fxIntro || '',
        overlayHidden: overlay ? overlay.hidden : true,
        heroVisible: Boolean(hero && heroStyle && heroStyle.display !== 'none' && heroStyle.visibility !== 'hidden' && hero.getBoundingClientRect().height > 0),
        pauseCount: document.querySelectorAll('#hero .fx-reference-pause').length,
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      };
    });

    const completeAt = Number(state.evidence.completeAt);
    const source = String(state.evidence.source || state.release || '');
    assert.ok(Number.isFinite(completeAt), `${spec.name}: preloader completion event was not measured`);
    assert.equal(state.timing, spec.timing, `${spec.name}: wrong R533 timing contract`);
    assert.equal(state.preloader, 'done', `${spec.name}: preloader did not finish`);
    assert.equal(state.overlayHidden, true, `${spec.name}: overlay remained visible`);
    assert.equal(state.heroVisible, true, `${spec.name}: hero not visible after release`);
    assert.equal(state.pauseCount, 0, `${spec.name}: obsolete manual PAUSE returned`);
    assert.ok(state.overflow <= 2, `${spec.name}: horizontal overflow ${state.overflow}`);
    assert.ok(!/runtime-error|promise-error/.test(source), `${spec.name}: preloader escaped through ${source}`);
    assert.ok(completeAt >= spec.min - 20, `${spec.name}: released before minimum contract (${completeAt}ms)`);
    assert.ok(completeAt <= spec.max + 350, `${spec.name}: exceeded bounded release window (${completeAt}ms)`);
    assert.equal(errors.length, 0, `${spec.name}: browser errors ${errors.join(' | ')}`);

    return {
      name: spec.name,
      viewport: spec.viewport,
      minMs: spec.min,
      maxMs: spec.max,
      completeAtMs: completeAt,
      source,
      timing: state.timing,
      overflow: state.overflow,
    };
  } finally {
    await context.close();
  }
}

(async () => {
  assert.ok(CHROME, 'CHROME_BIN is required');
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  try {
    const report = {
      auditedSha: process.env.AUDITED_SHA || '',
      contract: 'r533-roadmap-bounded-preloader',
      mobile: await verify(browser, {
        name: 'mobile-390x844',
        viewport: { width: 390, height: 844 },
        mobile: true,
        min: 440,
        max: 1360,
        timing: 'mobile-440-1360',
      }),
      desktop: await verify(browser, {
        name: 'desktop-1440x900',
        viewport: { width: 1440, height: 900 },
        mobile: false,
        min: 560,
        max: 1640,
        timing: 'desktop-560-1640',
      }),
    };
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('R533_PRELOADER_TIMING_PASS');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => {
  fs.writeFileSync(path.join(OUT, 'report-failure.json'), JSON.stringify({ error: String(error?.stack || error) }, null, 2) + '\n');
  console.error(error?.stack || error);
  process.exit(1);
});