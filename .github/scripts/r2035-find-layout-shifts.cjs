'use strict';
const {chromium}=require('playwright');
const ORIGIN=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'hu-HU',reducedMotion:'no-preference'});
  const page=await context.newPage();
  await page.addInitScript(()=>{
   window.__shiftRecord=[];
   new PerformanceObserver(list=>{
    for(const e of list.getEntries()){
      if(e.hadRecentInput)continue;
      window.__shiftRecord.push({
        value:e.value,start:e.startTime,source:e.sources.map(s=>{
          const n=s.node;
          return {node:n?(n.id?'#'+n.id:(n.className&&typeof n.className==='string'?n.tagName.toLowerCase()+'.'+n.className.trim().replace(/\s+/g,'.').slice(0,90):n.tagName)):null,
           previous:s.previousRect,current:s.currentRect};
        })
      });
    }
   }).observe({type:'layout-shift',buffered:true});
  });
  await page.goto(ORIGIN,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(8500);
  const result=await page.evaluate(()=>{
    const shifts=window.__shiftRecord||[];
    const selectors=['#hero','.hero-grid','.hero-space','.hero-copy','#experience','.fx-category-deck--standalone','.fx-award-proof','.topbar','#main-content','.site-footer'];
    return {cls:shifts.reduce((a,e)=>a+e.value,0),shifts:shifts.sort((a,b)=>b.value-a.value).slice(0,13),
      elements:selectors.map(q=>{const n=document.querySelector(q);const r=n?.getBoundingClientRect();return {q,rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null,display:n?getComputedStyle(n).display:null}}),
      mode:document.documentElement.dataset.fxArchiveCinema,
      fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      deferred:document.documentElement.dataset.fxDeferredCssR487};
  });
  console.log('MOBILE_CLS_ROOT_CAUSES '+JSON.stringify(result));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
