'use strict';

const fs = require('node:fs');
const { chromium } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'https://formatxsuite.com/';
const OUT = process.env.FORMATX_R515_DIAG_DIR || 'artifacts/r515-cls-activation';
const RUNS = Math.max(1, Math.min(8, Number(process.env.FORMATX_R515_DIAG_RUNS || 5)));
const CRITICAL = 'formatx-critical-core-r227.css';
fs.mkdirSync(OUT, { recursive: true });

function cacheBust(n) {
  const sep = URL.includes('?') ? '&' : '?';
  return `${URL}${sep}r515_cls_activation=${Date.now()}-${n}-${Math.random().toString(36).slice(2)}`;
}

async function installProbe(page) {
  await page.addInitScript((criticalName) => {
    const now = () => performance.now();
    const rectObj = r => r ? ({x:r.x,y:r.y,top:r.top,right:r.right,bottom:r.bottom,left:r.left,width:r.width,height:r.height}) : null;
    const selector = node => {
      if (!node) return null;
      if (node.nodeType !== 1) return String(node.nodeName || 'NODE');
      const el = node;
      if (el.id) return `${el.tagName.toLowerCase()}#${el.id}`;
      const cls = [...el.classList].slice(0,5).map(x => `.${CSS.escape(x)}`).join('');
      const parent = el.parentElement;
      if (!parent) return `${el.tagName.toLowerCase()}${cls}`;
      const same = [...parent.children].filter(x => x.tagName === el.tagName);
      const nth = same.length > 1 ? `:nth-of-type(${same.indexOf(el)+1})` : '';
      return `${parent.id ? '#'+CSS.escape(parent.id)+' > ' : ''}${el.tagName.toLowerCase()}${cls}${nth}`;
    };
    const linkState = () => {
      const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(l => l.href.includes(criticalName));
      if (!link) return null;
      return {href:link.href,media:link.media||'',disabled:Boolean(link.disabled),sheet:Boolean(link.sheet),deferred:link.hasAttribute('data-fx-r487-deferred-style'),targetMedia:link.dataset.fxR487Media||null};
    };
    const heroState = () => {
      const pick = sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return {selector:sel,rect:rectObj(r),display:s.display,position:s.position,width:s.width,height:s.height,minHeight:s.minHeight,margin:s.margin,padding:s.padding,gap:s.gap,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,boxSizing:s.boxSizing};
      };
      return {topbar:pick('header.topbar'),hero:pick('#hero'),heroGrid:pick('#hero > .hero-grid'),heart:pick('#hero .fx-mag-heart-hit-r252')};
    };
    const p = window.__fxR515 = {timeOrigin:performance.timeOrigin,events:[],paints:[],lcp:[],shifts:[],resources:[],errors:[]};
    const mark = (name, extra={}) => p.events.push({name,t:now(),critical:linkState(),geometry:heroState(),...extra});
    mark('init');

    document.addEventListener('DOMContentLoaded', () => mark('DOMContentLoaded'), {once:true});
    addEventListener('load', () => mark('load'), {once:true});
    addEventListener('formatx:deferredcssready', e => mark('formatx:deferredcssready',{detail:e.detail||null}), {once:true});

    requestAnimationFrame(() => {
      mark('probe-rAF-1');
      requestAnimationFrame(() => mark('probe-rAF-2'));
    });

    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          p.paints.push({name:e.name,startTime:e.startTime,duration:e.duration});
          if (e.name === 'first-contentful-paint') mark('FCP',{startTime:e.startTime});
        }
      }).observe({type:'paint',buffered:true});
    } catch (e) { p.errors.push({phase:'paint-observer',error:String(e)}); }

    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) p.lcp.push({startTime:e.startTime,size:e.size||0,url:e.url||'',element:selector(e.element)});
      }).observe({type:'largest-contentful-paint',buffered:true});
    } catch (e) { p.errors.push({phase:'lcp-observer',error:String(e)}); }

    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput) continue;
          p.shifts.push({
            t:e.startTime,
            value:e.value,
            sources:(e.sources||[]).map(s => ({selector:selector(s.node),previousRect:rectObj(s.previousRect),currentRect:rectObj(s.currentRect)})),
            critical:linkState(),
            geometry:heroState()
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    } catch (e) { p.errors.push({phase:'layout-shift-observer',error:String(e)}); }

    try {
      const mo = new MutationObserver(records => {
        for (const rec of records) {
          if (rec.type === 'attributes' && rec.target instanceof HTMLLinkElement && rec.target.href.includes(criticalName)) {
            mark(`critical-core-attr:${rec.attributeName}`,{href:rec.target.href,media:rec.target.media||'',disabled:Boolean(rec.target.disabled)});
          }
          for (const node of rec.addedNodes||[]) {
            if (!(node instanceof HTMLLinkElement) || !node.href.includes(criticalName)) continue;
            mark('critical-core-added',{href:node.href,media:node.media||'',disabled:Boolean(node.disabled)});
            node.addEventListener('load',() => mark('critical-core-link-load',{href:node.href,media:node.media||'',disabled:Boolean(node.disabled)}),{once:true});
          }
        }
      });
      mo.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['media','disabled','href']});
    } catch (e) { p.errors.push({phase:'mutation-observer',error:String(e)}); }
  }, CRITICAL);
}

function nearestActivation(run) {
  const events = run.probe.events;
  const activation = events.find(e => e.name === 'formatx:deferredcssready') ||
    events.find(e => e.name === 'critical-core-attr:media' && e.media && e.media !== 'print');
  if (!activation) return null;
  const candidates = run.probe.shifts.map(s => ({...s,deltaMs:s.t-activation.t})).sort((a,b)=>Math.abs(a.deltaMs)-Math.abs(b.deltaMs));
  return {activation,nearest:candidates[0]||null};
}

async function one(browser, index) {
  const context = await browser.newContext({viewport:{width:1350,height:940},screen:{width:1350,height:940},deviceScaleFactor:1,isMobile:false,hasTouch:false,locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference'});
  const page = await context.newPage();
  const consoleErrors=[];
  page.on('pageerror',e=>consoleErrors.push(String(e.message||e)));
  page.on('console',m=>{if(m.type()==='error') consoleErrors.push(m.text());});
  await installProbe(page);
  const response = await page.goto(cacheBust(index),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2800);
  const probe = await page.evaluate((criticalName) => {
    const p=window.__fxR515;
    const nav=performance.getEntriesByType('navigation')[0];
    p.navigation=nav?{startTime:nav.startTime,domContentLoadedEventStart:nav.domContentLoadedEventStart,domContentLoadedEventEnd:nav.domContentLoadedEventEnd,loadEventStart:nav.loadEventStart,loadEventEnd:nav.loadEventEnd,responseStart:nav.responseStart,responseEnd:nav.responseEnd}:null;
    p.resources=performance.getEntriesByType('resource').filter(r=>r.name.includes(criticalName)||/\.css(?:\?|$)/.test(r.name)).map(r=>({name:r.name,startTime:r.startTime,responseStart:r.responseStart,responseEnd:r.responseEnd,duration:r.duration,transferSize:r.transferSize,decodedBodySize:r.decodedBodySize,renderBlockingStatus:r.renderBlockingStatus||null}));
    const link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(l=>l.href.includes(criticalName));
    p.finalCritical=link?{href:link.href,media:link.media||'',disabled:Boolean(link.disabled),sheet:Boolean(link.sheet),deferred:link.hasAttribute('data-fx-r487-deferred-style'),targetMedia:link.dataset.fxR487Media||null}:null;
    return p;
  }, CRITICAL);
  const cls=probe.shifts.reduce((a,s)=>a+s.value,0);
  const lcp=probe.lcp.length?probe.lcp[probe.lcp.length-1]:null;
  const result={index,status:response?.status()||null,cls,lcp,consoleErrors,probe};
  result.correlation=nearestActivation(result);
  const ownerShift=probe.shifts.find(s=>s.value>=0.04 && s.sources.some(x=>/hero|topbar|fx-mag-heart-hit-r252/.test(x.selector||'')));
  result.rootCauseConfirmed=Boolean(cls>=0.05 && result.correlation && Math.abs(result.correlation.nearest?.deltaMs ?? Infinity)<=150 && ownerShift);
  await context.close();
  return result;
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const report={url:URL,viewport:{width:1350,height:940},critical:CRITICAL,startedAt:new Date().toISOString(),runs:[]};
  try {
    for(let i=1;i<=RUNS;i++){
      const r=await one(browser,i); report.runs.push(r);
      const activation=r.correlation?.activation?.t;
      const nearest=r.correlation?.nearest;
      console.log(`R515_CLS_RUN ${i} status=${r.status} CLS=${r.cls.toFixed(6)} activation=${Number.isFinite(activation)?activation.toFixed(1):'NONE'} nearestShift=${nearest?nearest.value.toFixed(6):'NONE'} deltaMs=${nearest?nearest.deltaMs.toFixed(1):'NONE'} root=${r.rootCauseConfirmed?'CONFIRMED':'UNCONFIRMED'}`);
      for(const s of r.probe.shifts.filter(x=>x.value>=0.005)) console.log(`  SHIFT t=${s.t.toFixed(1)} v=${s.value.toFixed(6)} sources=${s.sources.map(x=>x.selector).join('|')}`);
    }
  } finally { await browser.close(); }
  report.finishedAt=new Date().toISOString();
  const confirmed=report.runs.filter(r=>r.rootCauseConfirmed).length;
  report.summary={runs:report.runs.length,confirmed,maxCls:Math.max(...report.runs.map(r=>r.cls)),minCls:Math.min(...report.runs.map(r=>r.cls))};
  fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
  fs.writeFileSync(`${OUT}/summary.txt`,`R515_CLS_ACTIVATION_PROOF runs=${report.runs.length} confirmed=${confirmed} minCLS=${report.summary.minCls.toFixed(6)} maxCLS=${report.summary.maxCls.toFixed(6)}\n`);
  if(confirmed===0){console.error('R515_ROOT_CAUSE_NOT_CONFIRMED');process.exit(2);}
  console.log(`R515_ROOT_CAUSE_CONFIRMED ${confirmed}/${report.runs.length}`);
})().catch(e=>{console.error(e&&e.stack||e);process.exit(1);});
