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
    window.__fxPerf = { lcp: null, cls: 0, longTaskMs: 0, introComplete: null, shifts: [] };
    const fxCssSnapshot = node => {
      if (!(node instanceof Element)) return null;
      const rect = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      const matched = [];
      const visit = (rules, source, active = true) => {
        for (const rule of Array.from(rules || [])) {
          if (rule instanceof CSSMediaRule) {
            visit(rule.cssRules, source, active && matchMedia(rule.conditionText).matches);
            continue;
          }
          if (rule instanceof CSSSupportsRule) {
            let ok = false;
            try { ok = CSS.supports(rule.conditionText); } catch (_) {}
            visit(rule.cssRules, source, active && ok);
            continue;
          }
          if (!(rule instanceof CSSStyleRule) || !active) continue;
          let yes = false;
          try { yes = node.matches(rule.selectorText); } catch (_) {}
          if (!yes) continue;
          const d = {};
          for (const name of ['position','display','width','min-width','max-width','height','min-height','max-height','padding','inset','top','right','bottom','left','aspect-ratio','box-sizing','transform']) {
            const value = rule.style.getPropertyValue(name);
            if (value) d[name] = value + (rule.style.getPropertyPriority(name) ? ' !important' : '');
          }
          if (Object.keys(d).length) matched.push({ source, selector: rule.selectorText, declarations: d });
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try { rules = sheet.cssRules; } catch (_) { continue; }
        visit(rules, sheet.href || 'inline');
      }
      return {
        rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
        computed:{position:cs.position,display:cs.display,width:cs.width,minWidth:cs.minWidth,maxWidth:cs.maxWidth,height:cs.height,minHeight:cs.minHeight,maxHeight:cs.maxHeight,padding:cs.padding,boxSizing:cs.boxSizing,top:cs.top,right:cs.right,bottom:cs.bottom,left:cs.left,transform:cs.transform},
        matched
      };
    };
    try {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) window.__fxPerf.lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        const selector = node => {
          if (!(node instanceof Element)) return '';
          if (node.id) return '#' + node.id;
          const classes = [...node.classList].slice(0, 3);
          return node.tagName.toLowerCase() + (classes.length ? '.' + classes.join('.') : '');
        };
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__fxPerf.cls += entry.value;
          window.__fxPerf.shifts.push({
            at: entry.startTime,
            value: entry.value,
            sources: (entry.sources || []).map(source => ({
              selector: selector(source.node),
              previousRect: source.previousRect,
              currentRect: source.currentRect,
              css: /fx-three-sound|fx-reference-ask|fx-reference-controls-r204/.test(selector(source.node)) ? fxCssSnapshot(source.node) : null
            }))
          });
        }
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
    let previous = 0;
    const deltas = [];
    const start = performance.now();
    const duration = 1200;
    return new Promise(resolve => {
      function frame(now) {
        frames += 1;
        if (previous) deltas.push(now - previous);
        previous = now;
        const progress = Math.min(1, (now - start) / duration);
        scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * progress);
        if (progress < 1) requestAnimationFrame(frame);
        else {
          scrollTo(0, 0);
          const ordered = deltas.slice().sort((a,b) => a-b);
          const percentile = p => ordered.length ? ordered[Math.min(ordered.length - 1, Math.floor((ordered.length - 1) * p))] : 0;
          resolve({
            frames,
            durationMs: now - start,
            estimatedFps: frames / ((now - start) / 1000),
            frameDeltaMs: {
              median: percentile(.50),
              p90: percentile(.90),
              p95: percentile(.95),
              p99: percentile(.99),
              max: ordered[ordered.length - 1] || 0,
              over20ms: ordered.filter(v => v > 20).length,
              over25ms: ordered.filter(v => v > 25).length,
              over33ms: ordered.filter(v => v > 33.34).length
            }
          });
        }
      }
      requestAnimationFrame(frame);
    });
  });

  const controlCssDiagnostic = await page.evaluate(() => {
    const element = document.querySelector('#hero .fx-three-sound');
    if (!(element instanceof HTMLElement)) return null;
    const rect = element.getBoundingClientRect();
    const computed = getComputedStyle(element);
    const matches = [];
    const visit = (rules, source, active = true) => {
      for (const rule of Array.from(rules || [])) {
        if (rule instanceof CSSMediaRule) {
          const mediaActive = active && matchMedia(rule.conditionText).matches;
          visit(rule.cssRules, source, mediaActive);
          continue;
        }
        if (rule instanceof CSSSupportsRule) {
          let supports = false;
          try { supports = CSS.supports(rule.conditionText); } catch (_) {}
          visit(rule.cssRules, source, active && supports);
          continue;
        }
        if (!(rule instanceof CSSStyleRule) || !active) continue;
        let matched = false;
        try { matched = element.matches(rule.selectorText); } catch (_) {}
        if (!matched) continue;
        const interesting = {};
        for (const name of ['position','display','width','min-width','max-width','height','min-height','max-height','padding','inset','top','right','bottom','left','aspect-ratio','box-sizing','transform']) {
          const value = rule.style.getPropertyValue(name);
          if (value) interesting[name] = value + (rule.style.getPropertyPriority(name) ? ' !important' : '');
        }
        if (Object.keys(interesting).length) matches.push({ source, selector: rule.selectorText, declarations: interesting });
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try { rules = sheet.cssRules; } catch (_) { continue; }
      visit(rules, sheet.href || 'inline');
    }
    return {
      rect: { x:rect.x,y:rect.y,width:rect.width,height:rect.height },
      computed: {
        position:computed.position,display:computed.display,width:computed.width,minWidth:computed.minWidth,maxWidth:computed.maxWidth,
        height:computed.height,minHeight:computed.minHeight,maxHeight:computed.maxHeight,padding:computed.padding,boxSizing:computed.boxSizing,
        top:computed.top,right:computed.right,bottom:computed.bottom,left:computed.left,transform:computed.transform
      },
      matches
    };
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
      layoutShifts: window.__fxPerf.shifts,
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
    control_css_diagnostic: controlCssDiagnostic,
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
