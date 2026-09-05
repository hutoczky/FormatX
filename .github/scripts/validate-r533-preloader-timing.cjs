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
function cssTimeToMs(value) {
  const first = String(value || '').split(',')[0].trim();
  if (first.endsWith('ms')) return Number.parseFloat(first);
  if (first.endsWith('s')) return Number.parseFloat(first) * 1000;
  return NaN;
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
    window.__fxR533PreloaderEvidence = { completeAt: null, source: null, activeContract: null };
    const captureActiveContract = () => {
      const evidence = window.__fxR533PreloaderEvidence;
      if (!evidence || evidence.activeContract) return;
      const overlay = document.getElementById('formatx-event-horizon');
      if (!(overlay instanceof HTMLElement) || overlay.dataset.fxPreloaderR531 !== 'active') return;
      const main = document.querySelector('main');
      const hero = document.getElementById('hero');
      const overlayStyle = getComputedStyle(overlay);
      const mainStyle = main ? getComputedStyle(main) : null;
      const heroStyle = hero ? getComputedStyle(hero) : null;
      evidence.activeContract = {
        capturedAt: performance.now(),
        animationName: overlayStyle.animationName,
        animationDuration: overlayStyle.animationDuration,
        animationFillMode: overlayStyle.animationFillMode,
        clipPath: overlayStyle.clipPath,
        overlayVisibility: overlayStyle.visibility,
        mainVisibility: mainStyle?.visibility || '',
        mainDisplay: mainStyle?.display || '',
        heroVisibility: heroStyle?.visibility || '',
        heroDisplay: heroStyle?.display || '',
        heroHeight: hero?.getBoundingClientRect().height || 0,
      };
    };
    const observer = new MutationObserver(captureActiveContract);
    observer.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-fx-preloader-r531'] });
    document.addEventListener('readystatechange', captureActiveContract, { capture: true });
    document.addEventListener('DOMContentLoaded', captureActiveContract, { once: true, capture: true });
    document.addEventListener('formatx:preloadercomplete', event => {
      captureActiveContract();
      window.__fxR533PreloaderEvidence.completeAt = performance.now();
      window.__fxR533PreloaderEvidence.source = String(event?.detail?.source || '');
      observer.disconnect();
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
        bootAt: Number(root.dataset.fxPreloaderBootR533 || NaN),
        lateSkip: root.dataset.fxPreloaderLateSkipR533 === 'true',
        preloader: root.dataset.fxPreloaderR531 || '',
        release: root.dataset.fxPreloaderReleaseR531 || '',
        intro: root.dataset.fxIntro || '',
        overlayHidden: overlay ? overlay.hidden : true,
        overlayDisplay: overlay ? getComputedStyle(overlay).display : 'none',
        heroVisible: Boolean(hero && heroStyle && heroStyle.display !== 'none' && heroStyle.visibility !== 'hidden' && hero.getBoundingClientRect().height > 0),
        pauseCount: document.querySelectorAll('#hero .fx-reference-pause').length,
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      };
    });

    const completeAt = Number(state.evidence.completeAt);
    const source = String(state.evidence.source || state.release || '');
    const duration = completeAt - state.bootAt;
    const active = state.evidence.activeContract;
    assert.ok(Number.isFinite(completeAt), `${spec.name}: preloader completion event was not measured`);
    assert.ok(Number.isFinite(state.bootAt), `${spec.name}: preloader boot timestamp missing`);
    assert.equal(state.timing, spec.timing, `${spec.name}: wrong R533 timing contract`);
    assert.equal(state.preloader, 'done', `${spec.name}: preloader did not finish`);
    assert.equal(state.overlayHidden, true, `${spec.name}: overlay remained visible`);
    assert.equal(state.heroVisible, true, `${spec.name}: hero not visible after release`);
    assert.equal(state.pauseCount, 0, `${spec.name}: obsolete manual PAUSE returned`);
    assert.ok(state.overflow <= 2, `${spec.name}: horizontal overflow ${state.overflow}`);
    assert.ok(!/runtime-error|promise-error/.test(source), `${spec.name}: preloader escaped through ${source}`);

    if (source === 'late-boot-skip') {
      assert.equal(state.lateSkip, true, `${spec.name}: late boot did not declare safe skip`);
      assert.ok(state.bootAt >= spec.max - 20, `${spec.name}: late-skip activated before hard deadline (${state.bootAt}ms)`);
      assert.ok(duration >= 0 && duration <= 180, `${spec.name}: late-skip was not immediate (${duration}ms)`);
      assert.equal(state.overlayDisplay, 'none', `${spec.name}: late-skip overlay became paintable`);
    } else {
      assert.equal(state.lateSkip, false, `${spec.name}: normal path incorrectly marked late-skip`);
      assert.ok(active, `${spec.name}: active preloader computed-style contract was not captured`);
      assert.match(String(active.animationName), /fx-r533-preloader-visual-bound/, `${spec.name}: compositor visual-bound animation missing`);
      const animationMs = cssTimeToMs(active.animationDuration);
      assert.ok(Number.isFinite(animationMs) && Math.abs(animationMs - spec.max) <= 20, `${spec.name}: wrong compositor deadline ${active.animationDuration}`);
      assert.match(String(active.animationFillMode), /both/, `${spec.name}: compositor deadline does not retain terminal clip`);
      assert.notEqual(active.mainVisibility, 'hidden', `${spec.name}: main content is hidden behind preloader`);
      assert.notEqual(active.mainDisplay, 'none', `${spec.name}: main content is not paintable behind preloader`);
      assert.notEqual(active.heroVisibility, 'hidden', `${spec.name}: hero visibility is gated by preloader`);
      assert.notEqual(active.heroDisplay, 'none', `${spec.name}: hero display is gated by preloader`);
      assert.ok(active.heroHeight > 0, `${spec.name}: hero has no paintable geometry behind preloader`);
      assert.ok(duration >= spec.min - 20, `${spec.name}: visible intro released before minimum contract (${duration}ms)`);
      if (duration > spec.max + 220) {
        assert.equal(source, 'bounded-timeout', `${spec.name}: delayed logical release is not the bounded-timeout path (${source}, ${duration}ms)`);
      }
    }
    assert.equal(errors.length, 0, `${spec.name}: browser errors ${errors.join(' | ')}`);

    return {
      name: spec.name,
      viewport: spec.viewport,
      minMs: spec.min,
      maxMs: spec.max,
      bootAtMs: state.bootAt,
      completeAtMs: completeAt,
      logicalDurationMs: duration,
      source,
      lateSkip: state.lateSkip,
      timing: state.timing,
      activeContract: active,
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
      contract: 'r533-paintable-hero-plus-compositor-bounded-preloader',
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