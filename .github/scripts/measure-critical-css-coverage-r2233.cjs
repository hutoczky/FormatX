'use strict';
/* R2233 - Chromium CSS Coverage, read-only: first paint and an activated
   MAG chapter. Not a claim that uncovered CSS can always be removed. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.FORMATX_CSS_BASE||'https://www.formatxsuite.com/scifi-ui/';
const profiles=[
 {name:'desktop',width:1366,height:768,mobile:false},
 {name:'mobile',width:390,height:844,mobile:true}
];
async function audit(browser,spec){
 const context=await browser.newContext({
   viewport:{width:spec.width,height:spec.height},
   isMobile:spec.mobile,hasTouch:spec.mobile,deviceScaleFactor:1,
   reducedMotion:'no-preference',locale:'hu-HU'
 });
 await context.addInitScript(()=>{
   try{
     localStorage.setItem('formatx:intro-seen-v1','1');
     sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');
   }catch(_){}
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{
   await page.coverage.startCSSCoverage({resetOnNavigation:false});
   const url=new URL(BASE);url.searchParams.set('css-coverage','r2233-'+spec.name);
   const response=await page.goto(url.toString(),{
     waitUntil:'domcontentloaded',timeout:60000
   });
   assert.equal(response?.status(),200,'Production CSS source unavailable');
   await page.waitForTimeout(2900);
   // Real intent mounts the chapter titles and active cinema CSS.
   await page.mouse.wheel(0,Math.round(spec.height*.64));
   await page.waitForTimeout(1250);
   const entries=await page.coverage.stopCSSCoverage();
   const styles=await page.evaluate(()=>Array.from(document.querySelectorAll(
     'link[rel="stylesheet"]'
   )).map(node=>({
     href:node.href,
     declaredMedia:node.getAttribute('media')||'all',
     active:node.media==='all'||node.media===''||
       matchMedia(node.media).matches,
     critical:node.hasAttribute('fetchpriority')||
       node.hasAttribute('data-fx-mobile-first-paint-r358')||
       node.hasAttribute('data-fx-dna-first-frame-r2181')
   })));
   const data=entries.filter(e=>e.url.includes('/scifi-ui/')).map(e=>{
     const used=e.ranges.reduce((n,r)=>n+(r.end-r.start),0);
     const total=e.text.length;
     const ref=styles.find(x=>x.href===e.url);
     return {
       path:new URL(e.url).pathname.split('/').at(-1),
       total,used,
       unused:Math.max(0,total-used),
       usedPct:total?Math.round(100*used/total):100,
       critical:ref?.critical||false,
       active:ref?.active??true
     };
   }).sort((a,b)=>b.unused-a.unused);
   const totals={
     total:data.reduce((n,x)=>n+x.total,0),
     used:data.reduce((n,x)=>n+x.used,0),
     unused:data.reduce((n,x)=>n+x.unused,0)
   };
   console.log('FX_CSS_COVERAGE_R2233 '+JSON.stringify({
     profile:spec.name,totals,stylesheets:data.length,
     renderBlocking:styles.filter(x=>x.active&&x.critical).length,
     topUnused:data.slice(0,25),
     errors
   }));
   assert(data.length>8,spec.name+' CSS coverage did not collect stylesheets');
   assert.equal(errors.length,0,spec.name+' runtime errors: '+errors.join('; '));
 }finally{await context.close();}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--disable-dev-shm-usage',
   '--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'
 ]});
 try{for(const spec of profiles)await audit(browser,spec);}
 finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
