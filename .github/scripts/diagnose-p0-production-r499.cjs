'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ORIGIN = process.env.FORMATX_TEST_URL || 'https://formatxsuite.com/';
const OUT = process.env.FORMATX_P0_DIAG_DIR || 'artifacts/p0-targeted-production';
const MAX_RUNS = Math.max(1, Math.min(20, Number(process.env.FORMATX_P0_DIAG_RUNS || 20)));
const SAMPLE_TIMES = [0, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000];
const CSS_NAMES = [
  'formatx-critical-shell-v56.css',
  'formatx-quality-r461.css',
  'formatx-critical-core-r227.css',
  'formatx-reference-production-r244.css',
  'single-language-toggle.css',
  'formatx-award-readiness.css',
  'formatx-content-standard.css',
  'formatx-first-paint-r206.css',
  'formatx-p0-first-paint-r490.css',
];

fs.mkdirSync(OUT, { recursive: true });

function cacheBust(kind, n) {
  const join = ORIGIN.includes('?') ? '&' : '?';
  return `${ORIGIN}${join}p0_target_diag=${kind}-${Date.now()}-${n}-${Math.random().toString(36).slice(2)}`;
}

async function installHeroProbe(page) {
  await page.addInitScript(({ sampleTimes, cssNames }) => {
    const rect = r => r ? ({ x:r.x, y:r.y, top:r.top, right:r.right, bottom:r.bottom, left:r.left, width:r.width, height:r.height }) : null;
    const dataset = (el, fxOnly = false) => {
      if (!el) return null;
      const out = {};
      for (const [k, v] of Object.entries(el.dataset || {})) {
        if (!fxOnly || /^fx/i.test(k)) out[k] = v;
      }
      return out;
    };
    const label = el => {
      if (!el) return null;
      const id = el.id ? `#${el.id}` : '';
      const cls = typeof el.className === 'string' && el.className.trim()
        ? `.${el.className.trim().split(/\s+/).slice(0, 6).join('.')}` : '';
      return `${el.tagName || 'NODE'}${id}${cls}`;
    };
    const animations = el => !el || typeof el.getAnimations !== 'function' ? [] : el.getAnimations().map(a => ({
      animationName: String(a.animationName || ''),
      currentTime: typeof a.currentTime === 'number' ? a.currentTime : null,
      playState: String(a.playState || ''),
      startTime: typeof a.startTime === 'number' ? a.startTime : null,
      playbackRate: typeof a.playbackRate === 'number' ? a.playbackRate : null,
      type: a.constructor && a.constructor.name || '',
    }));
    const styleSnapshot = el => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        rect: rect(el.getBoundingClientRect()),
        display: s.display,
        visibility: s.visibility,
        opacity: s.opacity,
        contentVisibility: s.contentVisibility,
        contain: s.contain,
        filter: s.filter,
        transform: s.transform,
        translate: s.translate,
        clipPath: s.clipPath,
        overflow: s.overflow,
        overflowX: s.overflowX,
        overflowY: s.overflowY,
        position: s.position,
        zIndex: s.zIndex,
        animationName: s.animationName,
        animationDuration: s.animationDuration,
        animationDelay: s.animationDelay,
        animationPlayState: s.animationPlayState,
        transitionProperty: s.transitionProperty,
        transitionDuration: s.transitionDuration,
        animations: animations(el),
      };
    };
    const heroMetric = el => {
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        x:r.x, y:r.y, width:r.width, height:r.height,
        fontFamily:s.fontFamily, fontSize:s.fontSize, fontWeight:s.fontWeight,
        lineHeight:s.lineHeight, letterSpacing:s.letterSpacing,
        margin:s.margin, padding:s.padding, gap:s.gap, maxWidth:s.maxWidth,
      };
    };
    const overlays = () => ['#formatx-event-horizon', '.fx-intro-overlay'].map(selector => {
      const el = document.querySelector(selector);
      if (!el) return { selector, exists:false };
      const s = getComputedStyle(el);
      return {
        selector, exists:true, rect:rect(el.getBoundingClientRect()),
        display:s.display, opacity:s.opacity, visibility:s.visibility,
        zIndex:s.zIndex, pointerEvents:s.pointerEvents,
        className:typeof el.className === 'string' ? el.className : '', dataset:dataset(el, false),
      };
    });
    const fullSnapshot = requestedMs => {
      const selectors = {
        heroLead: '.hero-lead', heroCopy: '.hero-copy', heroGrid: '.hero-grid',
        hero: '#hero', main: 'main', body: 'body', html: 'html',
      };
      const elements = {};
      for (const [key, selector] of Object.entries(selectors)) elements[key] = styleSnapshot(document.querySelector(selector));
      const lead = document.querySelector('.hero-lead');
      let hit = null;
      if (lead) {
        const r = lead.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        hit = { x, y, element: label(document.elementFromPoint(x, y)) };
      }
      return {
        requestedMs, actualMs:performance.now(), elements, heroLeadCenterHit:hit,
        htmlClass:document.documentElement?.className || '', bodyClass:document.body?.className || '',
        htmlFxDataset:dataset(document.documentElement, true), bodyDataset:dataset(document.body, false),
        visibilityState:document.visibilityState,
        fontsStatus:document.fonts ? document.fonts.status : 'unsupported',
        overlays:overlays(),
      };
    };
    const heroWindow = () => ({
      heroCopy:heroMetric(document.querySelector('.hero-copy')),
      heroTitle:heroMetric(document.querySelector('#hero-title, .hero-title-main')),
      heroLead:heroMetric(document.querySelector('.hero-lead')),
      heroActions:heroMetric(document.querySelector('.hero-actions')),
      htmlClass:document.documentElement?.className || '', bodyClass:document.body?.className || '',
      htmlFxDataset:dataset(document.documentElement, true), bodyDataset:dataset(document.body, false),
      fontsStatus:document.fonts ? document.fonts.status : 'unsupported',
    });

    window.__fxP0Diag = { samples:[], shifts:[], lcp:[], errors:[], resourceNames:cssNames };
    for (const t of sampleTimes) setTimeout(() => {
      try { window.__fxP0Diag.samples.push(fullSnapshot(t)); }
      catch (e) { window.__fxP0Diag.errors.push({ phase:'sample', requestedMs:t, error:String(e && e.stack || e) }); }
    }, t);

    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const sources = (entry.sources || []).map(src => ({
            node:label(src.node), previousRect:rect(src.previousRect), currentRect:rect(src.currentRect),
            inHeroCopy:Boolean(src.node && document.querySelector('.hero-copy') && (src.node === document.querySelector('.hero-copy') || document.querySelector('.hero-copy').contains(src.node))),
          }));
          if (sources.some(s => s.inHeroCopy)) {
            window.__fxP0Diag.shifts.push({
              timestamp:entry.startTime, value:entry.value, hadRecentInput:entry.hadRecentInput,
              sources, heroWindow:heroWindow(),
            });
          }
        }
      }).observe({ type:'layout-shift', buffered:true });
    } catch (e) { window.__fxP0Diag.errors.push({ phase:'layout-shift-observer', error:String(e) }); }

    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          window.__fxP0Diag.lcp.push({
            startTime:entry.startTime, renderTime:entry.renderTime || 0, loadTime:entry.loadTime || 0,
            size:entry.size || 0, id:entry.id || '', url:entry.url || '', element:label(entry.element),
          });
        }
      }).observe({ type:'largest-contentful-paint', buffered:true });
    } catch (e) { window.__fxP0Diag.errors.push({ phase:'lcp-observer', error:String(e) }); }
  }, { sampleTimes:SAMPLE_TIMES, cssNames:CSS_NAMES });
}

async function collectHeroRun(browser, index) {
  const context = await browser.newContext({
    viewport:{ width:1440, height:900 }, locale:'hu-HU', colorScheme:'dark', reducedMotion:'no-preference',
  });
  const page = await context.newPage();
  const consoleErrors = [], requestFailures = [];
  page.on('pageerror', e => consoleErrors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', r => requestFailures.push({ method:r.method(), url:r.url(), error:r.failure()?.errorText || '' }));
  await installHeroProbe(page);
  let response;
  try {
    response = await page.goto(cacheBust('hero', index), { waitUntil:'domcontentloaded', timeout:60000 });
    await page.waitForTimeout(5600);
    const probe = await page.evaluate(({ cssNames }) => {
      const d = window.__fxP0Diag || { samples:[], shifts:[], lcp:[], errors:[] };
      const resources = performance.getEntriesByType('resource')
        .filter(r => cssNames.some(name => r.name.includes(name)))
        .map(r => ({
          name:r.name, initiatorType:r.initiatorType, startTime:r.startTime,
          duration:r.duration, fetchStart:r.fetchStart, responseStart:r.responseStart,
          responseEnd:r.responseEnd, transferSize:r.transferSize, decodedBodySize:r.decodedBodySize,
          renderBlockingStatus:r.renderBlockingStatus || null,
        }));
      const stylesheets = [...document.styleSheets].map(s => ({ href:s.href || 'inline', disabled:Boolean(s.disabled), media:s.media?.mediaText || '' }))
        .filter(s => cssNames.some(name => s.href.includes(name)));
      return { ...d, resources, stylesheets };
    }, { cssNames:CSS_NAMES });
    const lastLcp = probe.lcp.length ? probe.lcp[probe.lcp.length - 1] : null;
    const headers = response ? await response.allHeaders() : {};
    return {
      index, url:page.url(), status:response?.status() || null, headers,
      lcp:lastLcp, classification:lastLcp ? (lastLcp.startTime < 1000 ? 'GOOD_LT_1S' : lastLcp.startTime > 4000 ? 'BAD_GT_4S' : 'MID') : 'NO_LCP',
      probe, consoleErrors, requestFailures,
    };
  } catch (e) {
    return { index, url:page.url(), error:String(e && e.stack || e), consoleErrors, requestFailures };
  } finally {
    await context.close();
  }
}

async function sampleMagState(page, phase, requestedMs) {
  return page.evaluate(({ phase, requestedMs }) => {
    const ds = el => el ? Object.fromEntries(Object.entries(el.dataset || {}).filter(([k]) => /^fx/i.test(k) || /paused|running|scheduler|frame|renderer/i.test(k))) : null;
    const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    const pause = document.querySelector('#hero .fx-reference-pause');
    const anims = canvas && canvas.getAnimations ? canvas.getAnimations().map(a => ({
      animationName:String(a.animationName || ''), currentTime:typeof a.currentTime === 'number' ? a.currentTime : null,
      playState:String(a.playState || ''), startTime:typeof a.startTime === 'number' ? a.startTime : null,
      playbackRate:typeof a.playbackRate === 'number' ? a.playbackRate : null,
      type:a.constructor && a.constructor.name || '',
    })) : [];
    return {
      phase, requestedMs, actualMs:performance.now(),
      pauseButtonDataset:pause ? { ...pause.dataset } : null,
      htmlDataset:ds(document.documentElement), bodyDataset:ds(document.body),
      scheduler:document.documentElement.dataset.fxP0MotionSchedulerR490 || document.documentElement.dataset.fxMotionScheduler || '',
      visibilityState:document.visibilityState,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
      animations:anims,
      runtime:{
        renderer:document.documentElement.dataset.fxCoreRenderer || '',
        crystal:document.documentElement.dataset.fxCrystalOrganismR326 || '',
        referencePaused:document.documentElement.dataset.fxReferenceMotionPaused || '',
        scheduler:document.documentElement.dataset.fxP0MotionSchedulerR490 || '',
      },
    };
  }, { phase, requestedMs });
}

async function runMagDiagnostic(browser) {
  const context = await browser.newContext({ viewport:{ width:1440, height:900 }, locale:'hu-HU', colorScheme:'dark', reducedMotion:'no-preference' });
  const page = await context.newPage();
  const out = { samples:[], errors:[] };
  try {
    await page.goto(cacheBust('mag', 1), { waitUntil:'domcontentloaded', timeout:60000 });
    const target = page.locator('#hero .fx-reference-mag-button, #hero .fx-reference-ask, #hero .fx-mag-heart-hit-r252').first();
    await target.waitFor({ state:'visible', timeout:30000 });
    await target.click();
    await page.waitForFunction(() => document.documentElement.dataset.fxCrystalOrganismR326 === 'ready' && document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length === 1, null, { timeout:60000 });
    const pause = page.locator('#hero .fx-reference-pause').first();
    await pause.waitFor({ state:'visible', timeout:15000 });
    out.samples.push(await sampleMagState(page, 'before-pause', 0));
    await pause.click();
    for (const t of [0,100,200,300,400,500,600,700]) {
      if (t) await page.waitForTimeout(100);
      out.samples.push(await sampleMagState(page, 'paused', t));
    }
    await pause.click();
    for (let t = 0; t <= 2000; t += 100) {
      if (t) await page.waitForTimeout(100);
      out.samples.push(await sampleMagState(page, 'after-second-click-resume', t));
    }
    out.final = out.samples[out.samples.length - 1] || null;
  } catch (e) {
    out.errors.push(String(e && e.stack || e));
  } finally {
    await context.close();
  }
  return out;
}

(async () => {
  const browser = await chromium.launch({ headless:true, args:['--disable-dev-shm-usage', '--no-sandbox', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const report = { auditedSha:process.env.AUDITED_SHA || '', origin:ORIGIN, startedAt:new Date().toISOString(), sampleTimes:SAMPLE_TIMES, heroRuns:[], mag:null };
  try {
    let haveGood = false, haveBad = false;
    for (let i = 1; i <= MAX_RUNS; i++) {
      const run = await collectHeroRun(browser, i);
      report.heroRuns.push(run);
      haveGood ||= run.classification === 'GOOD_LT_1S';
      haveBad ||= run.classification === 'BAD_GT_4S';
      console.log(`HERO_RUN ${i} ${run.classification || 'ERROR'} LCP=${run.lcp?.startTime ?? 'n/a'} CLS_sources=${run.probe?.shifts?.length ?? 0}`);
      if (haveGood && haveBad) break;
    }
    report.reproduced = { good:haveGood, bad:haveBad };
    report.mag = await runMagDiagnostic(browser);
  } finally {
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(JSON.stringify({ reproduced:report.reproduced, heroRuns:report.heroRuns.map(r => ({ index:r.index, classification:r.classification, lcp:r.lcp?.startTime ?? null, shifts:r.probe?.shifts?.length ?? 0 })), magErrors:report.mag?.errors || [] }, null, 2));
})().catch(err => {
  fs.mkdirSync(OUT, { recursive:true });
  fs.writeFileSync(path.join(OUT, 'fatal.json'), JSON.stringify({ error:String(err && err.stack || err), at:new Date().toISOString() }, null, 2));
  console.error(err && err.stack || err);
  process.exit(1);
});
