'use strict';
/* R2058: observational diagnosis, never loaded by the production website.
 * Compare identical 1440x900 returning-session state in browser, browser
 * automation, and Lighthouse UA. This does NOT manipulate Lighthouse scores.
 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const ORIGIN=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4195/scifi-ui/index.html';
const OUT=process.env.FORMATX_LCP_DIAGNOSTICS||'artifacts/diagnostics/r2058-lcp.json';

async function run(name,options) {
  const flags=['--no-sandbox','--disable-dev-shm-usage'];
  if (options.webdriverOff) flags.push('--disable-blink-features=AutomationControlled');
  const browser=await chromium.launch({headless:true,args:flags});
  const context=await browser.newContext({
    viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'no-preference',
    ...(options.lhUserAgent?{userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Chrome-Lighthouse'}:{})
  });
  const page=await context.newPage();
  if (options.returning) await page.addInitScript(()=>{try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1')}catch(_){}});
  await page.addInitScript(()=>{
    const state=window.__fxR2058={samples:[],lcp:[],paints:[],rootChanges:[],errors:[],scriptReadyAt:performance.now()};
    for(const type of ['largest-contentful-paint','paint']){
      try{
        new PerformanceObserver(list=>list.getEntries().forEach(e=>{
          const dst=type==='paint'?state.paints:state.lcp;
          dst.push({time:Math.round(e.startTime),at:Math.round(performance.now()),name:e.name,
            text:e.element?.textContent?.trim()?.slice(0,48)||'',selector:e.element?.id||e.element?.className||'',size:e.size||0});
        })).observe({type,buffered:true});
      }catch(e){state.errors.push(String(e))}
    }
    const watch=()=>{const e=document.getElementById('hero-title'),span=e?.querySelector('.hero-title-main');
      const root=document.documentElement;if(!e||!span)return;
      const s=getComputedStyle(span),c=getComputedStyle(e),b=span.getBoundingClientRect();
      state.samples.push({ms:Math.round(performance.now()),opacity:s.opacity,visibility:s.visibility,display:s.display,
        fill:s.webkitTextFillColor,font:s.font,clip:s.backgroundClip,transform:s.transform,
        titleOpacity:c.opacity,rect:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],
        intro:root.dataset.fxIntroPrepaintR1611||'',css:root.dataset.fxDeferredCssR487||'',
        audit:root.dataset.fxP0AuditModeR1728||'',mag:root.dataset.fxCurrentMagRuntimeR422||'',
        scene:root.dataset.fxCinematicSceneR536||''});
    };
    const timer=setInterval(()=>{watch();if(performance.now()>3000){clearInterval(timer);watch()}},75);
    const obs=new MutationObserver(list=>{for(const r of list){
      if(state.rootChanges.length>=140){obs.disconnect();break}
      const key=r.attributeName;
      if(key.startsWith('data-fx-')||key==='class')state.rootChanges.push({
        ms:Math.round(performance.now()),key,value:document.documentElement.getAttribute(key)?.slice(0,100)});
    }});
    obs.observe(document.documentElement,{attributes:true});
    addEventListener('error',e=>state.errors.push(String(e.message||e.error)),{passive:true});
  });
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const response=await page.goto(ORIGIN,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(3200);
  const data=await page.evaluate(()=>{
    const x=window.__fxR2058;
    return {...x,nav:performance.getEntriesByType('navigation').map(n=>({dom:n.domContentLoadedEventEnd,load:n.loadEventEnd})),
      webdriver:navigator.webdriver,ua:navigator.userAgent,ready:document.readyState,
      root:{intro:document.documentElement.dataset.fxIntroPrepaintR1611,
        audit:document.documentElement.dataset.fxP0AuditModeR1728,
        apex:document.documentElement.dataset.fxApex,
        renderer:document.documentElement.dataset.fxRenderer},
      cssLinks:[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>({
        href:l.getAttribute('href'),media:l.media,tag:l.dataset.fxR487DeferredStyle||''
      })).filter(v=>/critical-core|reference-production|desktop-critical|p0-first|mag-birth/.test(v.href||''))};
  });
  await browser.close();
  return {name,status:response.status(),pageErrors:errors,...data};
}
(async()=>{
  const cases=[
    ['normal-return',{returning:true,webdriverOff:true}],
    ['webdriver-return',{returning:true}],
    ['lighthouse-return',{returning:true,lhUserAgent:true}],
    ['normal-first-visit',{returning:false,webdriverOff:true}]
  ];const results=[];
  for(const [name,options] of cases){const data=await run(name,options);results.push(data);
    console.log('R2058_CASE',JSON.stringify({case:name,status:data.status,webdriver:data.webdriver,
      lcp:data.lcp,paints:data.paints,root:data.root,errors:data.pageErrors.concat(data.errors),
      sampleCount:data.samples.length}));
  }
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify({schema:'r2058-timing-probe-1',results},null,2)+'\n');
  if(results.some(x=>x.status!==200||x.pageErrors.length))process.exitCode=1;
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
