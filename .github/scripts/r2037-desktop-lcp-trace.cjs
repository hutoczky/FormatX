'use strict';
const {chromium}=require('playwright');
const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900},
    deviceScaleFactor:1,locale:'hu-HU',reducedMotion:'no-preference'});
  const page=await context.newPage();
  await page.addInitScript(()=>{
    window.__lcpTimeline=[];
    window.__paintTimeline=[];
    try{new PerformanceObserver(list=>{
      for(const e of list.getEntries()){
        window.__lcpTimeline.push({start:e.startTime,render:e.renderTime,
          size:e.size,selector:e.element?.id||e.element?.className||e.element?.tagName,
          url:e.url||''});
      }
    }).observe({type:'largest-contentful-paint',buffered:true});}catch(_){}
    try{new PerformanceObserver(list=>{
      for(const e of list.getEntries())window.__paintTimeline.push({name:e.name,start:e.startTime});
    }).observe({type:'paint',buffered:true});}catch(_){}
  });
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  const snapshots=await page.evaluate(async()=>{
    const record=[],start=performance.now();let previous='';
    while(performance.now()-start<3500){
      const title=document.querySelector('#hero .hero-title-main');
      const hero=document.querySelector('#hero .hero-copy');
      const h=document.querySelector('#hero');
      const computed=title?getComputedStyle(title):null;
      const r=title?.getBoundingClientRect();
      const data={time:Math.round(performance.now()),rect:r?
        {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,
        display:computed?.display,visibility:computed?.visibility,
        opacity:computed?.opacity,font:computed?.fontFamily,size:computed?.fontSize,
        color:computed?.color,fill:computed?.webkitTextFillColor,
        background:computed?.backgroundImage?.slice(0,80),
        heroDisplay:hero?getComputedStyle(hero).display:null,
        heroOpacity:hero?getComputedStyle(hero).opacity:null,
        heroTransform:hero?getComputedStyle(hero).transform:null,
        heroHeight:h?.getBoundingClientRect().height,
        audit:document.documentElement.dataset.fxP0AuditModeR1728,
        css:document.documentElement.dataset.fxDeferredCssR487,
        intro:document.documentElement.dataset.fxIntroPrepaintR1611,
        fontStatus:document.fonts?.status,
        fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime||null};
      const str=JSON.stringify({...data,time:0});
      if(str!==previous){record.push(data);previous=str;}
      await new Promise(r=>setTimeout(r,95));
    }
    return record;
  });
  const data=await page.evaluate(()=>({lcp:window.__lcpTimeline,
    paints:window.__paintTimeline,
    deferred:document.documentElement.dataset.fxDeferredCssR487}));
  console.log('DESKTOP_LCP_GEOMETRY_TIMELINE '+JSON.stringify({data,snapshots}).slice(0,30000));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
