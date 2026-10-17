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
    // The real normal site: no forced archive and no Lighthouse bypass.
    // Late WebGL must NOT make the original hero disappear while at scroll=0.
    // Scrolling to the actual first shelf must then deliver a native folio.
    await page.goto(ROOT+'?r2054-normal-entry='+c.label,{
      waitUntil:'domcontentloaded',timeout:60000
    });
    await page.waitForFunction(()=>document.documentElement.dataset.fxArchiveExperience==='ready',
      null,{timeout:48000});
    await page.waitForTimeout(450);
    const entry=await page.evaluate(()=>{
      const hero=document.querySelector('#hero .hero-copy');
      const cta=document.getElementById('hero-download');
      const visible=node=>!!node&&getComputedStyle(node).display!=='none'
        &&getComputedStyle(node).visibility==='visible'&&node.getClientRects().length>0;
      return {scrollY,cinema:document.documentElement.dataset.fxArchiveCinema,
        heroVisible:visible(hero),ctaVisible:visible(cta),focusable:!cta?.closest('[inert]'),
        ctaOnOriginalHero:!!document.querySelector('#hero .hero-actions')?.contains(cta),
        ctaOwner:document.documentElement.dataset.fxArchiveCtaLane,
        continuity:document.documentElement.dataset.fxArchiveHomeContinuity};
    });
    assert.ok(entry.scrollY<8&&entry.cinema!=='active'&&entry.heroVisible
      &&entry.ctaVisible&&entry.focusable&&entry.ctaOnOriginalHero,
      'R2064 normal first-visit hero disappeared during delayed MAG readiness: '+JSON.stringify(entry));
    console.log('R2064_NORMAL_HOME_CONTINUITY_PASS',JSON.stringify({viewport:c.label,...entry}));
    await page.evaluate(()=>{
      const first=window.FormatXArchiveExperience?.scenes?.[0];
      const node=first&&document.querySelector('[data-fx-archive-scene="'+first.key+'"]');
      (node?.closest('main#main-content > section')||node)?.scrollIntoView({
        block:'center',behavior:'instant'
      });
    });
    await page.waitForFunction(()=>document.documentElement.dataset.fxArchiveCinema==='active',
      null,{timeout:12000});
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
