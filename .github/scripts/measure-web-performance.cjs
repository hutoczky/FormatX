'use strict';

const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const url = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const output = process.env.FORMATX_PERF_FILE || 'artifacts/performance/ci-chromium.json';

(async () => {
  await fs.mkdir(path.dirname(output), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    window.__fxPerf = { lcp: null, cls: 0, longTaskMs: 0, introComplete: null };
    try {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) window.__fxPerf.lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__fxPerf.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__fxPerf.longTaskMs += entry.duration;
      }).observe({ type: 'longtask', buffered: true });
    } catch (_) {}
    document.addEventListener('formatx:introcomplete', () => {
      window.__fxPerf.introComplete = performance.now();
    }, { once: true });
  });

  const page = await context.newPage();
  const started = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#hero-title');
  await page.waitForTimeout(2500);

  const interaction = await page.evaluate(async () => {
    const button = document.getElementById('menu-toggle');
    if (!button) return null;
    const before = performance.now();
    button.click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const after = performance.now();
    button.click();
    return after - before;
  });

  const scrollSample = await page.evaluate(async () => {
    let frames = 0;
    const start = performance.now();
    const duration = 1200;
    return new Promise(resolve => {
      function frame(now) {
        frames += 1;
        const progress = Math.min(1, (now - start) / duration);
        scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * progress);
        if (progress < 1) requestAnimationFrame(frame);
        else {
          scrollTo(0, 0);
          resolve({ frames, durationMs: now - start, estimatedFps: frames / ((now - start) / 1000) });
        }
      }
      requestAnimationFrame(frame);
    });
  });

  const beforeResize = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth }));
  await page.setViewportSize({ width: 900, height: 1440 });
  await page.waitForTimeout(350);
  const afterResize = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = Object.fromEntries(performance.getEntriesByType('paint').map(entry => [entry.name, entry.startTime]));
    const memory = performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    } : null;
    return {
      navigation: nav ? {
        domContentLoaded: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd,
        responseEnd: nav.responseEnd,
        transferSize: nav.transferSize
      } : null,
      firstContentfulPaint: paint['first-contentful-paint'] ?? null,
      largestContentfulPaint: window.__fxPerf.lcp,
      cumulativeLayoutShift: window.__fxPerf.cls,
      totalLongTaskMs: window.__fxPerf.longTaskMs,
      introComplete: window.__fxPerf.introComplete,
      renderer: document.documentElement.dataset.fxRenderer || null,
      mobileCoreState: document.documentElement.dataset.fxMobileCore || null,
      contentVisible: Boolean(document.querySelector('#hero-title')?.getClientRects().length),
      memory
    };
  });

  const second = await context.newPage();
  await second.goto('about:blank');
  const restoreStart = Date.now();
  await page.bringToFront();
  await page.waitForTimeout(50);
  const backgroundRestoreMs = Date.now() - restoreStart;
  await second.close();

  const report = {
    schema_version: 1,
    environment: 'GitHub Actions Chromium or equivalent local CI; not physical-device evidence',
    measured_at: new Date().toISOString(),
    url,
    wall_clock_ms: Date.now() - started,
    metrics,
    interaction_response_ms: interaction,
    scroll_sample: scrollSample,
    viewport_change: { before: beforeResize, after: afterResize },
    background_restore_ms: backgroundRestoreMs,
    interpretation: 'Raw CI measurement only. Do not present as phone, customer or production performance without a matching environment record.'
  };

  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  await context.close();
  await browser.close();
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
