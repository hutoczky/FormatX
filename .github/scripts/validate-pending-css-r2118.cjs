'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const path=require('node:path');
const out=process.env.FORMATX_CSS_PENDING_REPORT||'artifacts/r2118-pending-css/report.json';
fs.mkdirSync(path.dirname(out),{recursive:true});
const report={url,cases:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try{
  for(const [mobile,reducedMotion] of [[true,'no-preference'],[false,'no-preference'],[true,'reduce'],[false,'reduce']]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion});
   let release;
   const pending=new Promise(resolve=>{release=resolve;});
   const requests=[],failures=[],errors=[];
   try{
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('requestfailed',r=>{if(r.url().includes('formatx-living-habitat-r1530.css'))failures.push({url:r.url(),error:r.failure()?.errorText});});
    await page.route('**/formatx-living-habitat-r1530.css*',async route=>{
     requests.push(route.request().url());
     if(requests.length===1)await pending;
     await route.continue().catch(()=>{});
    });
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>document.documentElement.dataset.fxDeferredCssR487==='ready-fcp',null,{timeout:10000});
    // Let the original 1600ms missing-sheet watchdog actually fire while the
    // first real HTTP request remains unfinished. No product clock is changed.
    await new Promise(resolve=>setTimeout(resolve,2250));
    const before=await page.evaluate(()=>{
     const node=document.querySelector('link[data-fx-living-habitat-r1530]');
     return {href:node.href,media:node.media,materialized:Boolean(node.sheet),retry:node.dataset.fxCssRetryR2054||null,reason:node.dataset.fxCssRecoveryReasonR2054||null};
    });
    const item={mobile,reducedMotion,before,requests:[...requests],failures:[...failures],errors};report.cases.push(item);fs.writeFileSync(out,JSON.stringify(report,null,2));
    assert.equal(requests.length,1,'A slow unfinished stylesheet was requested twice: '+JSON.stringify(item));
    assert.equal(before.retry,null,'Missing-sheet watchdog replaced an in-flight stylesheet');
    assert.equal(before.materialized,false,'The first actual request must still be pending at the checkpoint');
    assert.equal(before.media,'all');assert.deepEqual(failures,[]);
    release();
    await page.waitForFunction(()=>Boolean(document.querySelector('link[data-fx-living-habitat-r1530]')?.sheet),null,{timeout:20000});
    item.after=await page.evaluate(()=>{const n=document.querySelector('link[data-fx-living-habitat-r1530]');return {href:n.href,media:n.media,materialized:Boolean(n.sheet),retry:n.dataset.fxCssRetryR2054||null};});
    assert.equal(requests.length,1,'Completing the original stylesheet must not start a retry');
    assert.equal(item.after.retry,null);assert.equal(item.after.materialized,true);assert.deepEqual(errors,[]);
    fs.writeFileSync(out,JSON.stringify(report,null,2));
    console.log('R2118_PENDING_CSS_COMPLETION_PASS '+JSON.stringify(item));
   }finally{release();await context.close();}
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
