'use strict';
// R2054: genuine Chromium fault-injection — lose exactly one same-origin
// photographic habitat CSS request, then verify the real stylesheet is loaded
// again WITHOUT cloning nodes, blocking first paint or weakening error checks.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const URL='http://127.0.0.1:4178/scifi-ui/index.html?archive=off&css-recovery-r2054=1';

async function verify(browser,viewport,mobile){
  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,
    reducedMotion:'no-preference'});
  const page=await context.newPage();
  let attempts=0;
  try{
    await page.route('**/formatx-living-habitat-r1530.css*',async route=>{
      attempts++;
      if(attempts===1){
        // Let the defer-owned recovery listeners attach before the network
        // fails. This reproduces a request lost under visual loading.
        await new Promise(r=>setTimeout(r,650));
        await route.abort('failed');
      }else{
        await route.continue();
      }
    });
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>{
      const link=document.querySelector('link[data-fx-living-habitat-r1530]');
      return link?.dataset.fxCssRecoveryState==='recovered'
        ||link?.dataset.fxCssRecoveryState==='failed';
    },null,{timeout:30000});
    const result=await page.evaluate(()=>{
      const link=document.querySelector('link[data-fx-living-habitat-r1530]');
      return {
        cssState:link?.dataset.fxCssRecoveryState||'',
        href:link?.href||'',
        stylesheet:!!link?.sheet,
        visualApplied:link?.media==='all',
        duplicateLinks:document.querySelectorAll('link[data-fx-living-habitat-r1530]').length,
        scheduler:document.documentElement.dataset.fxDeferredCssR487,
        recovery:document.documentElement.dataset.fxDeferredCssRecovery,
        count:document.documentElement.dataset.fxDeferredCssRecovered||'0'
      };
    });
    assert.equal(attempts,2,'Expected exactly one failed request and one genuine recovery: '+JSON.stringify(result));
    assert.equal(result.cssState,'recovered','CSS recovery did not complete: '+JSON.stringify(result));
    assert.ok(result.stylesheet&&result.visualApplied,'The real photographic habitat CSS is still missing: '+JSON.stringify(result));
    assert.equal(result.duplicateLinks,1,'Stylesheet was duplicated instead of recovered');
    assert.equal(result.recovery,'recovered','Missing network recovery telemetry');
    assert.ok(result.href.includes('fx_css_retry=1'),'New CSS request was not cache-busted');
    console.log('MAG_HABITAT_CSS_RESILIENCE_PASS',JSON.stringify({viewport,attempts,...result}));
  }finally{await context.close();}
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  try{
    await verify(browser,{width:390,height:844},true);
    await verify(browser,{width:1440,height:900},false);
  }finally{await browser.close();}
})().catch(e=>{console.error('MAG_HABITAT_CSS_RESILIENCE_FAIL',e.stack||String(e));process.exitCode=1;});
