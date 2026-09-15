'use strict';

const fs = require('node:fs');
const { chromium } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'https://formatxsuite.com/';
const OUT = process.env.FORMATX_R502_DIAG_DIR || 'artifacts/r502-lighthouse-cls';
const RUNS = Math.max(1, Math.min(8, Number(process.env.FORMATX_R502_DIAG_RUNS || 6)));
fs.mkdirSync(OUT, { recursive: true });

function urlFor(n) {
  const sep = URL.includes('?') ? '&' : '?';
  return `${URL}${sep}r502_cls_diag=${Date.now()}-${n}-${Math.random().toString(36).slice(2)}`;
}

async function installProbe(page) {
  await page.addInitScript(() => {
    const rect = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {x:r.x,y:r.y,top:r.top,right:r.right,bottom:r.bottom,left:r.left,width:r.width,height:r.height};
    };
    const style = el => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        rect:rect(el),display:s.display,position:s.position,gridArea:s.gridArea,
        alignSelf:s.alignSelf,width:s.width,maxWidth:s.maxWidth,minWidth:s.minWidth,
        margin:s.margin,padding:s.padding,gap:s.gap,contain:s.contain,
        fontFamily:s.fontFamily,fontSize:s.fontSize,lineHeight:s.lineHeight,
        letterSpacing:s.letterSpacing,visibility:s.visibility,opacity:s.opacity,
        transform:s.transform,transitionProperty:s.transitionProperty,
        transitionDuration:s.transitionDuration
      };
    };
    const links = () => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l,i) => ({
      i,href:l.href,media:l.media || '',mediaMatches:l.media ? matchMedia(l.media).matches : true,
      sheet:Boolean(l.sheet),disabled:Boolean(l.disabled),
      p0:l.hasAttribute('data-fx-p0-first-paint-r501'),
      firstFrame:l.hasAttribute('data-fx-first-frame-stability-r500'),
      mobile:l.hasAttribute('data-fx-mobile-first-paint-r358')
    }));
    const snap = tag => ({
      tag,t:performance.now(),
      hero:style(document.querySelector('#hero')),
      grid:style(document.querySelector('#hero > .hero-grid')),
      copy:style(document.querySelector('#hero > .hero-grid > .hero-copy')),
      title:style(document.querySelector('#hero-title')),
      lead:style(document.querySelector('#hero .hero-lead')),
      actions:style(document.querySelector('#hero .hero-actions')),
      liveOs:style(document.querySelector('#hero [data-fx-live-os-cta]')),
      download:style(document.querySelector('#hero-download')),
      heart:style(document.querySelector('#hero .fx-mag-heart-hit-r252')),
      product:style(document.querySelector('#hero .fx-hero-product-state')),
      htmlClass:document.documentElement?.className || '',
      bodyClass:document.body?.className || '',
      htmlDataset:document.documentElement ? {...document.documentElement.dataset} : {},
      fonts:document.fonts?.status || 'unsupported',
      links:links()
    });
    const nodeName = n => !n ? null : `${n.tagName || 'NODE'}${n.id ? '#'+n.id : ''}${typeof n.className === 'string' && n.className.trim() ? '.'+n.className.trim().split(/\s+/).slice(0,5).join('.') : ''}`;
    window.__r502 = {samples:[],shifts:[],resources:[],linkEvents:[],errors:[]};

    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput) continue;
          window.__r502.shifts.push({
            t:e.startTime,value:e.value,
            sources:(e.sources||[]).map(s => ({node:nodeName(s.node),previousRect:s.previousRect ? {...s.previousRect} : null,currentRect:s.currentRect ? {...s.currentRect} : null})),
            state:snap('layout-shift')
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    } catch (e) { window.__r502.errors.push(String(e)); }

    try {
      const observer = new MutationObserver(records => {
        for (const rec of records) {
          for (const n of rec.addedNodes || []) {
            if (n.nodeType === 1 && n.matches?.('link[rel="stylesheet"]')) {
              window.__r502.linkEvents.push({type:'added',t:performance.now(),href:n.href,media:n.media||''});
              n.addEventListener('load', () => window.__r502.linkEvents.push({type:'load',t:performance.now(),href:n.href,media:n.media||''}), {once:true});
            }
          }
          if (rec.type === 'attributes' && rec.target?.matches?.('link[rel="stylesheet"]')) {
            window.__r502.linkEvents.push({type:`attr:${rec.attributeName}`,t:performance.now(),href:rec.target.href,media:rec.target.media||''});
          }
        }
      });
      observer.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['media','disabled','href']});
    } catch (e) { window.__r502.errors.push(String(e)); }

    const times = [0,10,20,30,40,50,60,75,90,110,140,180,240,320,450,650,900,1200,1600,2200];
    for (const ms of times) setTimeout(() => { try { window.__r502.samples.push(snap(`timer-${ms}`)); } catch(e) { window.__r502.errors.push(String(e)); } }, ms);
  });
}

async function run(browser, index) {
  const context = await browser.newContext({viewport:{width:1350,height:940},screen:{width:1350,height:940},deviceScaleFactor:1,isMobile:false,hasTouch:false,locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference'});
  const page = await context.newPage();
  const consoleErrors=[];
  page.on('pageerror',e=>consoleErrors.push(String(e.message||e)));
  page.on('console',m=>{ if(m.type()==='error') consoleErrors.push(m.text()); });
  await installProbe(page);
  const started=Date.now();
  const response=await page.goto(urlFor(index),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(3000);
  const probe=await page.evaluate(() => {
    const r=window.__r502;
    r.resources=performance.getEntriesByType('resource').filter(x=>x.initiatorType==='link' || /\.css(?:\?|$)/.test(x.name)).map(x=>({name:x.name,startTime:x.startTime,duration:x.duration,responseStart:x.responseStart,responseEnd:x.responseEnd,transferSize:x.transferSize,decodedBodySize:x.decodedBodySize,renderBlockingStatus:x.renderBlockingStatus||null}));
    return r;
  });
  const cls=probe.shifts.reduce((a,s)=>a+s.value,0);
  await context.close();
  return {index,status:response?.status()||null,elapsedMs:Date.now()-started,cls,consoleErrors,probe};
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const report={url:URL,viewport:{width:1350,height:940},startedAt:new Date().toISOString(),runs:[]};
  try {
    for(let i=1;i<=RUNS;i++) {
      const r=await run(browser,i);
      report.runs.push(r);
      const major=r.probe.shifts.filter(s=>s.value>=0.005);
      console.log(`R502_CLS_RUN ${i} CLS=${r.cls.toFixed(6)} shifts=${r.probe.shifts.length} major=${major.length}`);
      for(const s of major) {
        const c=s.state.copy?.rect, g=s.state.grid?.rect;
        console.log(`  SHIFT t=${s.t.toFixed(1)} v=${s.value.toFixed(6)} copy=${c?`${c.left},${c.top},${c.width},${c.height}`:'null'} grid=${g?`${g.left},${g.top},${g.width},${g.height}`:'null'} sources=${s.sources.map(x=>x.node).join('|')}`);
      }
    }
  } finally { await browser.close(); }
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
  const max=Math.max(...report.runs.map(r=>r.cls));
  console.log(`R502_CLS_MAX ${max.toFixed(6)}`);
})().catch(e=>{console.error(e&&e.stack||e);process.exit(1);});
