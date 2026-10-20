'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ROOT=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
 ]});
 try{
  for(const c of [{label:'mobile-390',w:390,h:844,mobile:true},
                  {label:'mobile-412-lighthouse-geometry',w:412,h:823,mobile:true},
                  {label:'mobile-320-narrow',w:320,h:640,mobile:true},
                  {label:'desktop',w:1440,h:900,mobile:false}]){
   const context=await browser.newContext({
    viewport:{width:c.w,height:c.h},isMobile:c.mobile,hasTouch:c.mobile,
    reducedMotion:'no-preference',locale:'hu-HU'
   });
   try{
    await context.addInitScript(()=>{
      try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1')}catch(_){}
      try{localStorage.setItem('formatx:intro-seen-v1','1')}catch(_){}
    });
    const page=await context.newPage();
    const faults=[];
    page.on('pageerror',e=>faults.push(String(e)));
    // R2132: the live R2121 product deliberately preserves the ORIGINAL
    // hero (without .254 mobile CLS) until a real viewer scrolls. Test the
    // resting hero AND the actual user-initiated 3D paper handoff, never
    // force ?archive=1 or fake application telemetry.
    await page.goto(ROOT+'?r2054-normal-entry='+c.label,{
      waitUntil:'domcontentloaded',timeout:60000
    });
    await page.waitForFunction(()=>
      document.documentElement.dataset.fxArchiveExperience==='ready' &&
      document.documentElement.dataset.fxCrystalOrganismR326==='ready',
      null,{timeout:48000});
    const landing=await page.evaluate(()=>{
      const root=document.documentElement;
      const hero=document.querySelector('#hero .hero-copy');
      return {
        archive:root.dataset.fxArchiveCinema||'home',
        entry:root.dataset.fxArchiveScrollEntryR2121,
        originalHeroVisible:!!hero&&hero.getClientRects().length>0,
        scroll:window.scrollY
      };
    });
    assert.equal(landing.entry,'landing-hero-undisturbed',
      'Normal user must see stable MAG hero before intentional scroll: '+
      JSON.stringify(landing));
    assert.ok(landing.originalHeroVisible&&landing.scroll===0,
      'The original hero was replaced before visitor interaction: '+
      JSON.stringify(landing));
    await page.mouse.wheel(0,Math.round(c.h*1.20));
    try {
      await page.waitForFunction(()=>
        document.documentElement.dataset.fxArchiveCinema==='active' &&
        document.documentElement.dataset.fxArchiveScrollEntryR2121===
          'real-scroll-or-explicit-archive',
        null,{timeout:20000});
    } catch (error) {
      const diagnostics=await page.evaluate(()=>{
        const root=document.documentElement;
        const stage=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const panel=document.querySelector('[data-fx-cinema-panel-active="true"]');
        const scripts=[...document.scripts].filter(node=>
          /archive|mag|motion|core/.test(node.src)).map(node=>
          ({src:node.src.split('/').pop(),loaded:node.dataset.loaded||''}));
        return {
          root:Object.fromEntries(Object.entries(root.dataset).filter(([key])=>
            /archive|core|mag|webgl|gpu|intro|cinema/i.test(key))),
          stage:!!stage,webglReady:!!stage?.getContext('webgl2'),
          alive:root.dataset.fxCrystalOrganismR326,
          panel:!!panel,
          archiveApi:!!window.FormatXArchiveExperience,
          sharedCore:!!window.FormatXLivingCore?.sharedWebGL2,
          registered:typeof window.FormatXLivingCore?.registerScenePass,
          activeIntro:!!document.querySelector('.fx-mag-birth-r533:not([hidden])'),
          current:location.href,
          scripts
        };
      });
      console.error('R2130_NORMAL_ENTRY_BLOCKER',
        JSON.stringify({viewport:c.label,diagnostics,faults}));
      throw error;
    }
    await page.waitForTimeout(500);
    const sample=await page.evaluate(()=>{
      const root=document.documentElement;
      const panel=document.querySelector('[data-fx-cinema-panel-active="true"]');
      const rect=panel?.getBoundingClientRect();
      const style=panel?getComputedStyle(panel):null;
      const children=panel?[...panel.querySelectorAll('h2,h3,a[href],button')]:[];
      const visible=children.filter(node=>node.getBoundingClientRect().height>0&&
        getComputedStyle(node).display!=='none');
      const hero=document.querySelector('#hero .hero-copy');
      return {
        mode:root.dataset.fxArchiveCinema,scene:root.dataset.fxArchiveCurrent,
        error:root.dataset.fxArchiveError||'',shelves:root.dataset.fxArchiveSceneCount,
        folios:document.querySelectorAll('.fx-archive-cinema-folio-r2030').length,
        activeCount:document.querySelectorAll('[data-fx-cinema-panel-active="true"]').length,
        scrollY,visibleChildren:visible.length,
        panel:rect?{x:rect.x,y:rect.y,w:rect.width,h:rect.height}:null,
        style:style?{display:style.display,visibility:style.visibility,opacity:style.opacity}:null,
        legacyHidden:hero?hero.getClientRects().length===0:false,
        originalCTA:!!document.getElementById('hero-download')
      };
    });
    assert.equal(sample.mode,'active','Normal URL must show MAG cinema '+JSON.stringify(sample));
    assert.equal(sample.activeCount,1,'One original native panel visible at a time');
    assert.ok(sample.folios>=7&&Number(sample.shelves)===8,'Eight real MAG shelves required');
    assert.ok(sample.panel&&sample.panel.w>250&&sample.panel.h>100,
      'Readable folio never arrived: '+JSON.stringify(sample));
    assert.ok(sample.panel.y<c.h-110&&sample.panel.y+sample.panel.h>120,
      'Original folio is outside actual viewport: '+JSON.stringify(sample));
    assert.ok(sample.visibleChildren>=1,'Original functioning HTML is not presented');
    assert.ok(sample.legacyHidden,'Old hero competes with delivered MAG folio');
    assert.ok(sample.originalCTA,'Original CTA was replaced or lost');
    assert.ok(!sample.error,'MAG threw during default entry: '+sample.error);
    assert.equal(faults.length,0,'Browser JS error: '+faults.join(' | '));
    console.log('R2054_NORMAL_ENTRY_PASS',JSON.stringify({viewport:c.label,...sample}));
   }finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
