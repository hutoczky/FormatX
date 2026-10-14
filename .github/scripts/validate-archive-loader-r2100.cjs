'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_SITE_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const dir='artifacts/r2100-archive-loader';
fs.mkdirSync(dir,{recursive:true});

async function run(){
  const browser=await chromium.launch({
    headless:true,args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const report=[];
  try{
    for(const profile of [
      {name:'desktop',viewport:{width:1440,height:900},mobile:false},
      {name:'mobile',viewport:{width:390,height:844},mobile:true}
    ]){
      const context=await browser.newContext({
        viewport:profile.viewport,isMobile:profile.mobile,
        hasTouch:profile.mobile,
        reducedMotion:'no-preference'
      });
      await context.addInitScript(()=>{
        try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');}
        catch(e){}
      });
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      try{
        await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>!!document.documentElement.dataset.fxArchiveLoaderR2100,
          null,{timeout:15000});
        await page.waitForTimeout(950);
        const first=await page.evaluate(()=>({
          loader:document.documentElement.dataset.fxArchiveLoaderR2100,
          loadedArchive:performance.getEntriesByType('resource').some(entry=>
            entry.name.includes('/formatx-cinematic-archive-r1987.js')),
          nativeCTA:!!document.querySelector('#hero .hero-actions #hero-download'),
          heroTitle:document.querySelector('#hero-title .hero-title-main')?.textContent,
          sceneTop:Math.round(document.getElementById('experience')?.getBoundingClientRect().top||0)
        }));
        assert.ok(first.nativeCTA&&first.heroTitle==='FORMATX',
          'First-frame core content or real download CTA regressed: '+JSON.stringify(first));
        assert.equal(first.loadedArchive,false,
          'Below-fold cinematic archive was fetched before first-frame budget: '+JSON.stringify(first));
        assert.equal(first.loader,'armed',
          'Lazy archive loader should remain armed before first interaction: '+JSON.stringify(first));
        await page.evaluate(()=>{
          document.getElementById('experience')?.scrollIntoView({
            block:'center',behavior:'instant'
          });
        });
        await page.waitForFunction(()=>
          !!window.FormatXArchiveExperience &&
          ['ready','context-error','no-scenes','reduced-html','audit-html']
            .includes(document.documentElement.dataset.fxArchiveExperience),
          null,{timeout:45000});
        const after=await page.evaluate(()=>({
          loader:document.documentElement.dataset.fxArchiveLoaderR2100,
          archiveState:document.documentElement.dataset.fxArchiveExperience,
          moduleCount:document.querySelectorAll('script[data-fx-archive-module-r2100]').length,
          moduleFetched:performance.getEntriesByType('resource').some(entry=>
            entry.name.includes('/formatx-cinematic-archive-r1987.js')),
          origCTA:!!document.querySelector('#hero .hero-actions #hero-download'),
          introCount:document.querySelectorAll('.fx-mag-birth-r533').length,
          currentCanvas:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length
        }));
        assert.equal(after.moduleCount,1,
          'Archive loader created duplicate module scripts: '+JSON.stringify(after));
        assert.ok(after.moduleFetched&&after.origCTA,
          'Native archive did not load after actual scroll: '+JSON.stringify(after));
        assert.equal(after.archiveState,'ready',
          'Original eight-scene cinematic experience unavailable: '+JSON.stringify(after));
        assert.ok(after.currentCanvas<=1,
          'Archive generated a second permanent MAG canvas: '+JSON.stringify(after));
        assert.deepEqual(errors,[],'First-visit archive browser errors');
        await page.screenshot({path:path.join(dir,profile.name+'-archive-scroll.png')});
        report.push({viewport:profile.name,first,after,errors});
      }finally{
        await context.close();
      }
    }
    const eager=await browser.newContext({
      viewport:{width:1440,height:900},reducedMotion:'no-preference'
    });
    try{
      const page=await eager.newPage();
      await page.goto(BASE+'?archive=1&r486-optics-energy-check=1',
        {waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>
        document.documentElement.dataset.fxArchiveLoaderR2100?.startsWith('loaded-'),
        null,{timeout:25000});
      const result=await page.evaluate(()=>({
        state:document.documentElement.dataset.fxArchiveLoaderR2100,
        dynamicModuleCount:document.querySelectorAll('script[data-fx-archive-module-r2100]').length,
        originalApi:typeof window.FormatXArchiveExperience
      }));
      assert.equal(result.dynamicModuleCount,1);
      assert.equal(result.originalApi,'object');
      assert.ok(result.state.includes('explicit-cinematic-request'));
      report.push({viewport:'forced-archive',result});
    }finally{await eager.close();}
  }finally{await browser.close();}
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log('R2100_LAZY_ARCHIVE_CINEMATIC_PARITY_PASS',JSON.stringify(report));
}

run().catch(error=>{console.error(error.stack||String(error));process.exitCode=1});
