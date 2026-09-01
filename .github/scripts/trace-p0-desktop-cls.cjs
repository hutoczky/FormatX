'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT = path.resolve('p0-evidence/p0-desktop-cls.json');
const MOBILE_OUT = path.resolve('p0-evidence/p0-mobile-overflow.json');

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__fxP0Shifts = [];
      window.__fxP0Mutations = [];
      const selector = node => {
        if (!(node instanceof Element)) return '';
        if (node.id) return `#${node.id}`;
        const classes = [...node.classList].slice(0, 5).join('.');
        return `${node.tagName.toLowerCase()}${classes ? `.${classes}` : ''}`;
      };
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__fxP0Shifts.push({
            t: +entry.startTime.toFixed(2),
            value: entry.value,
            sources: (entry.sources || []).map(source => ({
              node: selector(source.node),
              previous: source.previousRect ? {
                x: +source.previousRect.x.toFixed(2), y: +source.previousRect.y.toFixed(2),
                w: +source.previousRect.width.toFixed(2), h: +source.previousRect.height.toFixed(2)
              } : null,
              current: source.currentRect ? {
                x: +source.currentRect.x.toFixed(2), y: +source.currentRect.y.toFixed(2),
                w: +source.currentRect.width.toFixed(2), h: +source.currentRect.height.toFixed(2)
              } : null
            }))
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });

      const started = performance.now();
      new MutationObserver(records => {
        if (performance.now() - started > 5000) return;
        for (const record of records) {
          window.__fxP0Mutations.push({
            t: +performance.now().toFixed(2),
            type: record.type,
            target: selector(record.target),
            attr: record.attributeName || '',
            added: record.addedNodes?.length || 0,
            removed: record.removedNodes?.length || 0
          });
        }
      }).observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [
          'class','style','hidden','lang',
          'data-fx-reference-production-r244','data-fx-reference-composition',
          'data-fx-control-owner-r268','data-fx-current-mag-runtime-r422',
          'data-fx-current-mag-styles-r423','data-fx-motion-runtime-r239',
          'data-fx-p0-geometry-r496'
        ]
      });
    });

    const samples = [];
    async function sample(label) {
      samples.push(await page.evaluate(label => {
        const box = selector => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            x:+rect.x.toFixed(2), y:+rect.y.toFixed(2), w:+rect.width.toFixed(2), h:+rect.height.toFixed(2),
            minHeight:style.minHeight, height:style.height, display:style.display,
            position:style.position, margin:style.margin, padding:style.padding,
            opacity:style.opacity, transform:style.transform
          };
        };
        return {
          label,
          t:+performance.now().toFixed(2),
          root:{
            reference:document.documentElement.dataset.fxReferenceProductionR244 || '',
            composition:document.documentElement.dataset.fxReferenceComposition || '',
            controlOwner:document.documentElement.dataset.fxControlOwnerR268 || '',
            currentMag:document.documentElement.dataset.fxCurrentMagRuntimeR422 || '',
            currentMagStyles:document.documentElement.dataset.fxCurrentMagStylesR423 || '',
            motion:document.documentElement.dataset.fxMotionRuntimeR239 || '',
            geometry:document.documentElement.dataset.fxP0GeometryR496 || ''
          },
          hero:box('#hero'),
          grid:box('#hero > .hero-grid'),
          copy:box('#hero .hero-copy'),
          category:box('#hero .fx-category-definition'),
          title:box('#hero-title'),
          titleMain:box('#hero .hero-title-main'),
          lead:box('#hero .hero-lead'),
          actions:box('#hero .hero-actions'),
          download:box('#hero-download'),
          space:box('#hero .hero-space'),
          controls:box('#hero .fx-reference-controls-r204'),
          brand:box('.topbar .brand'),
          brandSmall:box('.topbar .brand small'),
          mag:box('.topbar .fx-reference-mag-button'),
          language:box('.topbar .fx-language-toggle'),
          menu:box('#menu-toggle')
        };
      }, label));
    }

    await page.goto(`${URL}?p0_cls_trace=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sample('dcl');
    let elapsed = 0;
    for (const delay of [25,25,50,50,100,100,150,250,250,500,500,1000,2000]) {
      await page.waitForTimeout(delay);
      elapsed += delay;
      await sample(`${elapsed}ms`);
    }

    const final = await page.evaluate(() => ({
      shifts: window.__fxP0Shifts || [],
      mutations: window.__fxP0Mutations || [],
      cls: (window.__fxP0Shifts || []).reduce((sum, entry) => sum + entry.value, 0)
    }));
    const report = { generatedAt: new Date().toISOString(), url: URL, samples, ...final };
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');
    await page.screenshot({ path: 'p0-evidence/screenshots/desktop-cls-trace.png', fullPage: false, animations: 'disabled', caret: 'hide' });
    console.log(`P0 desktop CLS trace: cls=${report.cls.toFixed(9)}, shifts=${report.shifts.length}`);
    for (const shift of report.shifts) console.log(JSON.stringify(shift));
    await context.close();

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${URL}?p0_overflow_trace=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await mobilePage.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await mobilePage.waitForTimeout(1100);

    const overflowSamples = [];
    async function overflowProbe(label) {
      overflowSamples.push(await mobilePage.evaluate(label => {
        const root = document.documentElement;
        const body = document.body;
        const vw = root.clientWidth;
        const offenders = [];
        for (const el of document.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (cs.display === 'none' || cs.visibility === 'hidden' || r.width < .5 || r.height < .5) continue;
          const right = r.right - vw;
          const left = -r.left;
          const scrollExtra = el.scrollWidth - el.clientWidth;
          if (right > .5 || left > .5 || (scrollExtra > 1 && cs.overflowX === 'visible')) {
            offenders.push({
              tag: el.tagName,
              id: el.id || '',
              className: String(el.className || '').slice(0, 160),
              left: +r.left.toFixed(2),
              right: +r.right.toFixed(2),
              width: +r.width.toFixed(2),
              rightOverflow: +Math.max(0, right).toFixed(2),
              leftOverflow: +Math.max(0, left).toFixed(2),
              clientWidth: el.clientWidth,
              scrollWidth: el.scrollWidth,
              scrollExtra,
              position: cs.position,
              boxSizing: cs.boxSizing,
              overflowX: cs.overflowX,
              transform: cs.transform
            });
          }
        }
        offenders.sort((a,b) => Math.max(b.rightOverflow,b.leftOverflow,b.scrollExtra) - Math.max(a.rightOverflow,a.leftOverflow,a.scrollExtra));
        return {
          label,
          scrollY: +scrollY.toFixed(2),
          viewport: innerWidth,
          clientWidth: vw,
          rootScrollWidth: root.scrollWidth,
          bodyScrollWidth: body?.scrollWidth || 0,
          overflow: Math.max(root.scrollWidth, body?.scrollWidth || 0) - vw,
          offenders: offenders.slice(0, 60)
        };
      }, label));
    }

    await overflowProbe('settled-top');
    const pageHeight = await mobilePage.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0));
    const innerHeight = await mobilePage.evaluate(() => window.innerHeight);
    const maxScroll = Math.max(0, pageHeight - innerHeight);
    for (const ratio of [0.25, 0.5, 0.75, 1]) {
      await mobilePage.evaluate(y => window.scrollTo(0, y), Math.round(maxScroll * ratio));
      await mobilePage.waitForTimeout(140);
      await overflowProbe(`scroll-${Math.round(ratio * 100)}`);
    }
    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await mobilePage.waitForTimeout(140);
    await overflowProbe('returned-top');

    const mobileOverflow = overflowSamples[overflowSamples.length - 1];
    const mobileReport = {
      generatedAt: new Date().toISOString(),
      pageHeight,
      innerHeight,
      maxScroll,
      samples: overflowSamples,
      ...mobileOverflow
    };
    fs.writeFileSync(MOBILE_OUT, JSON.stringify(mobileReport, null, 2) + '\n');
    console.log(`P0 mobile overflow trace: overflow=${mobileOverflow.overflow}px, offenders=${mobileOverflow.offenders.length}`);
    for (const sample of overflowSamples) {
      console.log(`P0 overflow sample ${sample.label}: y=${sample.scrollY} overflow=${sample.overflow}px root=${sample.rootScrollWidth} body=${sample.bodyScrollWidth}`);
      for (const offender of sample.offenders.slice(0, 12)) console.log(`P0 overflow offender ${sample.label} ${JSON.stringify(offender)}`);
    }
    await mobileContext.close();
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || String(error));
  process.exit(1);
});