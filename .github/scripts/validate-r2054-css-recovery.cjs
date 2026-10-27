'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ROOT=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
 ]});
 try {
  for(const cfg of [{name:'phone',width:390,height:844,mobile:true},
                    {name:'desktop',width:1440,height:900,mobile:false}]){
   const context=await browser.newContext({
    viewport:{width:cfg.width,height:cfg.height},
    isMobile:cfg.mobile,hasTouch:cfg.mobile,reducedMotion:'no-preference'
   });
   try{
    const page=await context.newPage();
    let aborted=0;
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.route('**/formatx-living-habitat-r1530.css*',async route=>{
      if(!aborted){aborted++;await route.abort('failed');}
      else await route.continue();
    });
    await page.goto(ROOT+'?r2054-css-resilience='+cfg.name,{
      waitUntil:'domcontentloaded',timeout:60000
    });
    await page.waitForFunction(()=>{
      const sheet=document.querySelector('link[data-fx-living-habitat-r1530]');
      return sheet&&Boolean(sheet.sheet)&&sheet.media==='all'&&
        (!sheet.dataset.fxCssRetryR2054||sheet.dataset.fxCssRetryR2054==='loaded');
    },null,{timeout:20000});
    // R2240: the cinematic audio control's noncritical CSS must become active
    // after first paint on both phone and desktop, not remain print-only.
    await page.waitForFunction(()=>{
      const link=document.querySelector('link[data-fx-genesis-studio-r2160]');
      return link&&link.media==='all'&&Boolean(link.sheet);
    },null,{timeout:20000});
    const data=await page.evaluate(()=>{
      const sheet=document.querySelector('link[data-fx-living-habitat-r1530]');
      return {
       retry:sheet.dataset.fxCssRetryR2054,
       reason:sheet.dataset.fxCssRecoveryReasonR2054,
       media:sheet.media,loaded:Boolean(sheet.sheet),
       retryCount:Number(document.documentElement.dataset.fxCssRecoveriesR2054||0),
       chapterCount:document.querySelectorAll('#experience,#pricing,#system,#network').length,
       primaryCTA:Boolean(document.querySelector('#hero-download')),
       genesisAudioCss:(()=>{
         const link=document.querySelector('link[data-fx-genesis-studio-r2160]');
         return {media:link?.media,loaded:Boolean(link?.sheet),deferred:link?.dataset.fxR487DeferredStyle};
       })()
      };
    });
    assert.equal(aborted,1,'Did not inject exactly one true failed CSS request');
    assert.ok(data.retry===undefined||data.retry==='loaded',
      'Browser did not finish a CSS retry: '+JSON.stringify(data));
    assert.equal(data.loaded,true,'Recovered CSS is not applied to document');
    assert.equal(data.genesisAudioCss.media,'all','Genesis audio CSS stayed print-only');
    assert.equal(data.genesisAudioCss.loaded,true,'Genesis audio CSS did not load after FCP');
    assert.equal(data.genesisAudioCss.deferred,'true','Genesis audio CSS lost deferred loader contract');
    assert.ok(data.retryCount>=0&&data.retryCount<=1,
      'Must retry at most once: '+JSON.stringify(data));
    assert.ok(data.chapterCount>=2&&data.primaryCTA,'Actual page functions missing');
    assert.equal(errors.length,0,errors.join(' | '));
    console.log('R2054_CSS_RECOVERY_PASS',JSON.stringify({viewport:cfg.name,...data}));
   }finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
