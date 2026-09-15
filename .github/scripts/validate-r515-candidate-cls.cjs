'use strict';

const fs = require('node:fs');
const { chromium } = require('playwright');

const URL = process.env.FORMATX_R515_CANDIDATE_URL || 'https://formatxsuite.com:8787/';
const OUT = process.env.FORMATX_R515_CANDIDATE_DIR || 'artifacts/r515-candidate-cls';
const RUNS = Math.max(5, Number(process.env.FORMATX_R515_CANDIDATE_RUNS || 5));
fs.mkdirSync(OUT, { recursive: true });

async function run(browser, index) {
  const context = await browser.newContext({
    viewport:{width:1350,height:940},
    screen:{width:1350,height:940},
    deviceScaleFactor:1,
    isMobile:false,
    hasTouch:false,
    locale:'hu-HU',
    colorScheme:'dark',
    reducedMotion:'no-preference',
    ignoreHTTPSErrors:true,
  });
  const page = await context.newPage();
  const consoleErrors=[];
  page.on('pageerror', e => consoleErrors.push(String(e.message||e)));
  page.on('console', m => { if (m.type()==='error') consoleErrors.push(m.text()); });
  await page.addInitScript(() => {
    window.__fxR515Candidate = {cls:0, shifts:[], lcp:[]};
    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (e.hadRecentInput) continue;
          window.__fxR515Candidate.cls += e.value;
          window.__fxR515Candidate.shifts.push({
            t:e.startTime,
            value:e.value,
            sources:(e.sources||[]).map(s=>({
              node:s.node instanceof Element ? (s.node.id ? `#${s.node.id}` : `${s.node.tagName.toLowerCase()}.${[...s.node.classList].slice(0,4).join('.')}`) : null,
              previousRect:s.previousRect?{x:s.previousRect.x,y:s.previousRect.y,width:s.previousRect.width,height:s.previousRect.height}:null,
              currentRect:s.currentRect?{x:s.currentRect.x,y:s.currentRect.y,width:s.currentRect.width,height:s.currentRect.height}:null,
            }))
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    } catch (_) {}
    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) window.__fxR515Candidate.lcp.push({t:e.startTime,size:e.size||0});
      }).observe({type:'largest-contentful-paint',buffered:true});
    } catch (_) {}
  });

  const target = `${URL}${URL.includes('?')?'&':'?'}r515_candidate=${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`;
  const response = await page.goto(target,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2500);
  const data = await page.evaluate(() => {
    const critical=[...document.querySelectorAll('link[rel="stylesheet"]')].find(l=>l.href.includes('formatx-critical-core-r227.css'));
    const nav=performance.getEntriesByType('navigation')[0];
    const p=window.__fxR515Candidate;
    return {
      cls:p.cls,
      shifts:p.shifts,
      lcp:p.lcp.length?p.lcp[p.lcp.length-1]:null,
      critical:critical?{
        href:critical.href,
        media:critical.media||'',
        deferred:critical.hasAttribute('data-fx-r487-deferred-style'),
        targetMedia:critical.dataset.fxR487Media||null,
        sheet:Boolean(critical.sheet),
        fetchpriority:critical.getAttribute('fetchpriority')||''
      }:null,
      horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      navigation:nav?{responseStart:nav.responseStart,domContentLoadedEventEnd:nav.domContentLoadedEventEnd,loadEventEnd:nav.loadEventEnd}:null,
      cssScheduler:document.querySelector('meta[name="x-formatx-css-scheduler"]')?.content||null,
    };
  });
  const headers = response ? await response.allHeaders() : {};
  const result={index,status:response?.status()||null,headers,consoleErrors,...data};
  await context.close();
  return result;
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const report={url:URL,runs:[],startedAt:new Date().toISOString()};
  try {
    for(let i=1;i<=RUNS;i++){
      const r=await run(browser,i);
      report.runs.push(r);
      console.log(`R515_CANDIDATE_RUN ${i} status=${r.status} CLS=${r.cls.toFixed(6)} LCP=${r.lcp?.t?.toFixed?.(1)??'NONE'} overflow=${r.horizontalOverflow} criticalMedia=${JSON.stringify(r.critical?.media||'')} deferred=${r.critical?.deferred}`);
      for(const s of r.shifts.filter(x=>x.value>=0.005)) console.log(`  SHIFT t=${s.t.toFixed(1)} v=${s.value.toFixed(6)} sources=${s.sources.map(x=>x.node).join('|')}`);
    }
  } finally { await browser.close(); }

  const failures=[];
  for(const r of report.runs){
    if(r.status!==200) failures.push(`run ${r.index}: HTTP ${r.status}`);
    if(!(r.cls<0.05)) failures.push(`run ${r.index}: CLS ${r.cls}`);
    if(!r.critical) failures.push(`run ${r.index}: critical-core link missing`);
    if(r.critical?.deferred) failures.push(`run ${r.index}: critical-core still deferred`);
    if((r.critical?.media||'').trim()==='print') failures.push(`run ${r.index}: critical-core media=print`);
    if((r.horizontalOverflow||0)>0) failures.push(`run ${r.index}: horizontal overflow ${r.horizontalOverflow}`);
    if(r.consoleErrors.length) failures.push(`run ${r.index}: console errors ${r.consoleErrors.join(' || ')}`);
    if(!String(r.headers['x-formatx-css-scheduler']||'').includes('r515-critical-core-first-paint')) failures.push(`run ${r.index}: R515 scheduler header missing`);
  }
  report.summary={runs:report.runs.length,maxCls:Math.max(...report.runs.map(r=>r.cls)),minCls:Math.min(...report.runs.map(r=>r.cls)),failures};
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
  fs.writeFileSync(`${OUT}/summary.txt`,`R515_CANDIDATE runs=${report.summary.runs} minCLS=${report.summary.minCls.toFixed(6)} maxCLS=${report.summary.maxCls.toFixed(6)} failures=${failures.length}\n${failures.join('\n')}\n`);
  if(failures.length){console.error('R515_CANDIDATE_FAIL');for(const f of failures)console.error(f);process.exit(1);}
  console.log(`R515_CANDIDATE_PASS CLS<0.05 x${report.runs.length} max=${report.summary.maxCls.toFixed(6)}`);
})().catch(e=>{console.error(e&&e.stack||e);process.exit(1);});
