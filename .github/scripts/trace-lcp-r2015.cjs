'use strict';
// Diagnostic-only: this does not alter production site behavior.
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({
    viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'no-preference',
    userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Chrome-Lighthouse'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{
    const report=window.__fxLcpProbe={lcp:[],paints:[],cssChanges:[],samples:[]};
    for(const [type,field] of [['largest-contentful-paint','lcp'],['paint','paints']]){
      try{
        new PerformanceObserver(list=>{
          for(const e of list.getEntries()){
            const target=e.element;
            report[field].push({
              seenAt:Math.round(performance.now()),startTime:Math.round(e.startTime),
              size:e.size||null,selector:target?target.tagName+'.'+String(target.className).slice(0,120):'',
              text:target?.textContent?.trim().slice(0,45)||'',renderTime:Math.round(e.renderTime||0),
              name:e.name||''
            });
          }
        }).observe({type,buffered:true});
      }catch(e){report[type+'Error']=String(e);}
    }
    document.addEventListener('DOMContentLoaded',()=>{
      const root=document.documentElement;
      new MutationObserver(records=>{
        for(const m of records){
          if(m.attributeName!=='media')continue;
          const n=m.target;
          if(n instanceof HTMLLinkElement && report.cssChanges.length<100){
            report.cssChanges.push({at:Math.round(performance.now()),href:n.getAttribute('href'),media:n.media});
          }
        }
      }).observe(document.head,{subtree:true,attributes:true,attributeFilter:['media']});
      setInterval(()=>{
        if(performance.now()>4200)return;
        const main=document.querySelector('#hero .hero-title-main');
        const css=main?getComputedStyle(main):null;
        const box=main?.getBoundingClientRect();
        report.samples.push({
          at:Math.round(performance.now()),
          main:main?{width:Math.round(box.width),height:Math.round(box.height),
            display:css.display,opacity:css.opacity,color:css.color,
            font:css.fontSize,weight:css.fontWeight,shadow:css.textShadow,
            transform:css.transform,background:css.backgroundImage,contentVisibility:css.contentVisibility}:null,
          deferred:root.dataset.fxDeferredCssR487||null,
          deferredCount:root.dataset.fxDeferredCssCountR487||null,
          magOwner:root.dataset.fxMagBirthOwnerR533||null,
          firstFrame:root.dataset.fxCoreFirstFrameR1913||null
        });
      },100);
    },{once:true});
  });
  await page.goto('http://127.0.0.1:4178/scifi-ui/index.html?lighthouse=1',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(4500);
  const report=await page.evaluate(()=>window.__fxLcpProbe);
  report.errors=errors;
  fs.mkdirSync('.archive-artifacts',{recursive:true});
  fs.writeFileSync('.archive-artifacts/formatx-r2015-lcp-probe.json',JSON.stringify(report,null,2));
  console.log('R2015_LCP_PROBE',JSON.stringify({
    lcp:report.lcp,paints:report.paints,
    changedStyles:report.cssChanges.length,
    samples:report.samples.filter((_,i)=>i%5===0)
  }).slice(0,9000));
  await context.close();
  await browser.close();
})().catch(e=>{console.error('R2015_LCP_PROBE_ERROR',e.stack||String(e));process.exitCode=1;});
