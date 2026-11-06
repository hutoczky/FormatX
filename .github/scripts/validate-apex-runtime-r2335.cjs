/* FormatX R2335: real Chromium smoke proof for split APEX init.
   Source guard alone cannot prove apexready, language, observer hydration
   and hero markup survive R2330 macrotask splitting. No visual bypass. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
  const browser=await chromium.launch({
    headless:true,
    executablePath:process.env.CHROME_BIN||undefined,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
      '--enable-webgl','--ignore-gpu-blocklist']
  });
  try{
    const page=await browser.newPage({
      viewport:{width:1280,height:720},locale:'hu-HU',colorScheme:'dark'
    });
    const failures=[];
    page.on('pageerror',e=>failures.push(String(e)));
    await page.addInitScript(()=>{
      window.__fxApexReadyEventsR2335=[];
      addEventListener('formatx:apexready',e=>{
        window.__fxApexReadyEventsR2335.push(e.detail?.renderer||'unknown');
      });
    });
    const url=new URL(BASE);
    url.searchParams.set('intro','0');
    url.searchParams.set('lang','hu');
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>{
      const r=document.documentElement.dataset;
      return r.fxApex==='controller-performance-v2'&&
        r.fxApexObserversR2330==='installed'&&
        Number.isFinite(Number(r.fxApexCriticalMsR2330))&&
        Number.isFinite(Number(r.fxApexDeferredMsR2330));
    },null,{timeout:18000});
    const state=await page.evaluate(()=>{
      const root=document.documentElement;
      return {
        language:root.lang,
        apex:root.dataset.fxApex,
        mobileMode:root.dataset.fxApexMobileR293||'',
        readyEvents:window.__fxApexReadyEventsR2335,
        criticalMs:Number(root.dataset.fxApexCriticalMsR2330),
        revealMs:Number(root.dataset.fxApexRevealMsR2330),
        deferredMs:Number(root.dataset.fxApexDeferredMsR2330),
        observers:root.dataset.fxApexObserversR2330,
        scene:root.dataset.fxScene||'',
        flow:root.dataset.fxFlow||'',
        heading:document.querySelector('#hero-title')?.textContent?.trim()||'',
        navCount:document.querySelectorAll('#main-nav a').length,
        currencyCount:document.querySelectorAll('[data-currency]').length
      };
    });
    assert.equal(state.language,'hu');
    assert.equal(state.apex,'controller-performance-v2');
    assert.equal(state.mobileMode,'');
    assert.deepEqual(state.readyEvents,['three-host']);
    assert.equal(state.observers,'installed');
    assert.ok([state.criticalMs,state.revealMs,state.deferredMs].every(Number.isFinite));
    assert.ok(state.heading.length>0,'real hero heading absent');
    assert.ok(state.navCount>0,'desktop nav not wired');
    assert.match(state.scene,/^[0-5]$/);
    assert.match(state.flow,/^[0-3]$/);
    assert.deepEqual(failures,[],'APEX browser page errors');
    console.log('R2335_APEX_REAL_BROWSER_STARTUP_PASS',JSON.stringify(state));
    await page.close();
  }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
