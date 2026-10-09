'use strict';
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context = await browser.newContext({
    viewport:{width:1350,height:940},
    deviceScaleFactor:1,
    reducedMotion:'no-preference',
    userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Chrome-Lighthouse'
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      const events=[], samples=[];
      const measure = label => {
        const el = document.querySelector('#hero .hero-title-main');
        if (!el) return;
        const s=getComputedStyle(el),r=el.getBoundingClientRect();
        const fields={
          font:s.font,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,
          textShadow:s.textShadow,letterSpacing:s.letterSpacing,filter:s.filter,
          opacity:s.opacity,visibility:s.visibility,contentVisibility:s.contentVisibility,
          animation:s.animationName,transform:s.transform,background:s.backgroundImage,
          textFill:s.webkitTextFillColor,color:s.color,
          rect:[r.x,r.y,r.width,r.height].map(v=>Math.round(v*100)/100),
          body:document.body?.className||'',
          hero:document.getElementById('hero')?.className||'',
          deferred:document.documentElement.dataset.fxDeferredCssR487||'',
          p0:document.documentElement.dataset.fxP0AuditModeR1728||''
        };
        samples.push({label,t:Math.round(performance.now()),fields});
      };
      window.__fxLcpProbe={events,samples};
      try {
        new PerformanceObserver(list => {
          for (const e of list.getEntries()){
            const node=e.element;
            events.push({type:'LCP',t:Math.round(e.startTime),size:e.size,
              node:node?.tagName,cls:node?.className||'',text:(node?.textContent||'').trim().slice(0,40)});
          }
        }).observe({type:'largest-contentful-paint',buffered:true});
      }catch(error){events.push({error:String(error)});}
      const times=[100,250,375,500,625,750,1000,1250,1500,1650,1800,2000,2500];
      for (const t of times) setTimeout(()=>measure('t'+t),t);
    });
    await page.goto('http://127.0.0.1:4178/scifi-ui/index.html',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(2800);
    const report=await page.evaluate(()=>window.__fxLcpProbe);
    for(const event of report.events)console.log('FX_LCP_EVENT',JSON.stringify(event));
    let previous=null;
    for(const sample of report.samples){
      const diff=previous?Object.fromEntries(Object.entries(sample.fields)
        .filter(([k,v])=>JSON.stringify(v)!==JSON.stringify(previous[k]))):sample.fields;
      console.log('FX_LCP_STYLE',JSON.stringify({t:sample.t,label:sample.label,diff}));
      previous=sample.fields;
    }
  }finally{await context.close();await browser.close();}
})().catch(error=>{console.error('FX_LCP_DIAG_ERROR',error.stack||String(error));process.exitCode=1;});
