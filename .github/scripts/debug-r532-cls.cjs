'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME=process.env.CHROME_BIN||'/usr/bin/google-chrome';
const OUT=process.env.FORMATX_CLS_DEBUG_DIR||'artifacts/r532-cls-probe';

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'no-preference'});
  await context.addInitScript(()=>{
    window.__fxR532Shifts=[];
    try{
      new PerformanceObserver(list=>{
        for(const entry of list.getEntries()){
          if(entry.hadRecentInput)continue;
          const root=document.documentElement;
          const resources=performance.getEntriesByType('resource')
            .filter(item=>/\.css(?:\?|$)/.test(item.name)&&item.responseEnd<=entry.startTime+120&&item.responseEnd>=entry.startTime-180)
            .map(item=>({name:item.name.split('/').pop(),start:item.startTime,responseEnd:item.responseEnd,duration:item.duration}));
          const activeStyles=Array.from(document.styleSheets)
            .map(sheet=>String(sheet.href||''))
            .filter(Boolean)
            .map(href=>href.split('/').pop());
          window.__fxR532Shifts.push({
            at:entry.startTime,
            value:entry.value,
            preloader:root?.dataset?.fxPreloaderR531||'',
            release:root?.dataset?.fxPreloaderReleaseR531||'',
            geometry:root?.dataset?.fxPreloaderGeometryR532||'',
            reference:root?.dataset?.fxReferenceProductionR244||'',
            referenceRuntime:root?.dataset?.fxReferenceRuntimeR254||'',
            controlOwner:root?.dataset?.fxControlOwnerR268||'',
            crystal:root?.dataset?.fxCrystalOrganismR326||'',
            nearbyCss:resources,
            activeStyles,
            sources:(entry.sources||[]).map(source=>({
              selector:source.node instanceof Element?(()=>{const n=source.node;if(n.id)return '#'+n.id;if(n.classList?.length)return n.tagName.toLowerCase()+'.'+Array.from(n.classList).slice(0,3).join('.');return n.tagName?.toLowerCase()||'';})():'',
              previousRect:source.previousRect?{x:source.previousRect.x,y:source.previousRect.y,width:source.previousRect.width,height:source.previousRect.height}:null,
              currentRect:source.currentRect?{x:source.currentRect.x,y:source.currentRect.y,width:source.currentRect.width,height:source.currentRect.height}:null
            }))
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    }catch(error){window.__fxR532ObserverError=String(error?.message||error);}
  });
  const page=await context.newPage();
  await page.goto(URL,{waitUntil:'load',timeout:30000});
  await page.waitForTimeout(3200);
  const result=await page.evaluate(()=>({
    url:location.href,
    now:performance.now(),
    observerError:window.__fxR532ObserverError||'',
    shifts:window.__fxR532Shifts||[],
    cssResources:performance.getEntriesByType('resource')
      .filter(item=>/\.css(?:\?|$)/.test(item.name))
      .map(item=>({name:item.name.split('/').pop(),start:item.startTime,responseEnd:item.responseEnd,duration:item.duration}))
      .sort((a,b)=>a.responseEnd-b.responseEnd),
    root:{
      preloader:document.documentElement.dataset.fxPreloaderR531||'',
      release:document.documentElement.dataset.fxPreloaderReleaseR531||'',
      geometry:document.documentElement.dataset.fxPreloaderGeometryR532||'',
      reference:document.documentElement.dataset.fxReferenceProductionR244||'',
      referenceRuntime:document.documentElement.dataset.fxReferenceRuntimeR254||'',
      controlOwner:document.documentElement.dataset.fxControlOwnerR268||'',
      crystal:document.documentElement.dataset.fxCrystalOrganismR326||''
    },
    hero:(()=>{const n=document.querySelector('#hero .hero-copy');if(!n)return null;const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};})()
  }));
  fs.writeFileSync(path.join(OUT,'desktop-layout-shifts.json'),JSON.stringify(result,null,2));
  console.log('R532_CLS_PROBE '+JSON.stringify(result));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
