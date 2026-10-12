'use strict';
/* R2048 — verify the ACTUAL default public URL after deployment.
 * Never use ?archive=1, a static prototype, or the mocked R486 optical probe.
 * The original 10-second first-visit film is tested separately by R533–R536.
 * This tests the normal returning/post-intro human visitor on both domains.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'https://formatxsuite.com/';
const OUT=process.env.FORMATX_LIVE_MAG_EVIDENCE_DIR||'artifacts/live-r2048-mag';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const write=(name,data)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(data,null,2)+'\n');

async function checkViewport(browser,isMobile){
  const context=await browser.newContext({
    viewport:isMobile?{width:390,height:844}:{width:1440,height:900},
    deviceScaleFactor:isMobile?2:1,isMobile,hasTouch:isMobile,reducedMotion:'no-preference',
    colorScheme:'dark',locale:'hu-HU'
  });
  // Playwright sets webdriver=true; site code treats this as an AUDIT and
  // suppresses the real MAG. Restore the standard non-automated browser
  // signal to exercise the SAME default URL/path a real visitor sees.
  await context.addInitScript(()=>{
    Object.defineProperty(Navigator.prototype,'webdriver',{configurable:true,get:()=>undefined});
    try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1')}catch(_){}
    try{localStorage.setItem('formatx:intro-seen-v1','1')}catch(_){}
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  try{
    const response=await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:65000});
    assert.ok(response&&response.ok(),'Live homepage unavailable: '+response?.status());
    await page.waitForFunction(()=>{
      const r=document.documentElement;
      return r.dataset.fxArchiveExperience==='ready'
        &&r.dataset.fxArchiveCinema==='active'
        &&window.FormatXArchiveExperience?.scenes?.length===8;
    },null,{timeout:85000});
    const initial=await page.evaluate(()=>{
      const r=document.documentElement;
      const stage=document.querySelector('#hero .fx-crystal-organism-r326-stage');
      const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
      const hero=document.querySelector('#hero .hero-copy');
      const panels=Array.from(document.querySelectorAll('.fx-archive-cinema-folio-r2030'));
      const active=panels.filter(p=>p.dataset.fxCinemaPanelActive==='true');
      return {url:location.href,webdriver:navigator.webdriver,
        archive:window.FormatXArchiveExperience?.version,
        mode:r.dataset.fxArchiveCinema,contexts:r.dataset.fxCoreContexts,
        originals:panels.length,active:active.length,activeText:active[0]?.textContent?.trim().length||0,
        uniqueHosts:new Set(panels.map(p=>p.parentElement)).size,
        oldHeroVisible:!!hero&&getComputedStyle(hero).display!=='none'
          &&getComputedStyle(hero).visibility!=='hidden'&&hero.getClientRects().length>0,
        stage:!!stage,canvas:!!canvas,
        shared:window.FormatXLivingCore?.sharedWebGL2||false};
    });
    assert.equal(initial.webdriver,undefined,'Not a real visitor-equivalent browser');
    assert.equal(initial.contexts,'1','Multiple MAG WebGL contexts allocated');
    assert.equal(initial.shared,true,'A second noncanonical MAG renderer was substituted');
    assert.equal(initial.originals,8,'Exactly eight real native HTML papyri required');
    assert.equal(initial.uniqueHosts,8,'Diagnostics/AI or another chapter shares a fake duplicate folio');
    assert.equal(initial.active,1,'Every chapter must show exactly ONE native folio');
    assert.ok(initial.activeText>40,'First MAG handoff is blank');
    assert.ok(initial.stage&&initial.canvas&&!initial.oldHeroVisible,
      'Old homepage competes with living MAG or the actual 3D core is absent');
    const chapters=await page.evaluate(()=>window.FormatXArchiveExperience.scenes.map(s=>s.key));
    assert.equal(new Set(chapters).size,8,'Repeated MAG source chapter');
    const journey=[];
    for(const key of chapters){
      await page.evaluate(target=>{
        const node=document.querySelector('[data-fx-archive-scene="'+target+'"]');
        assertNode(node,target);
        const anchor=target==='intelligence'
          ?document.querySelector('#fx-mag-ai-scroll-station-r2030')||node:node.closest('main#main-content > section')||node;
        const b=anchor.getBoundingClientRect();
        window.scrollTo({top:Math.max(0,scrollY+b.top+innerHeight*.20),behavior:'instant'});
        function assertNode(n,k){if(!n)throw new Error('Live chapter '+k+' missing')}
      },key);
      await page.waitForFunction(target=>
        document.documentElement.dataset.fxArchiveCurrent===target
          &&document.documentElement.dataset.fxArchiveCinema==='active',key,{timeout:10000});
      const item=await page.evaluate(target=>{
        const active=[...document.querySelectorAll('.fx-archive-cinema-folio-r2030')]
          .filter(p=>p.dataset.fxCinemaPanelActive==='true');
        const p=active[0],pr=p?.getBoundingClientRect();
        const stage=document.querySelector('#hero .fx-crystal-organism-r326-stage')?.getBoundingClientRect();
        return {key:target,count:active.length,
          text:p?.textContent?.trim().length||0,source:p?.dataset.fxCinemaSource||null,
          id:p?.parentElement?.id||null,inert:!!p?.inert,
          x:pr?.x,y:pr?.y,w:pr?.width,h:pr?.height,
          stageBottom:stage?.bottom,
          position:p?getComputedStyle(p).position:null};
      },key);
      assert.equal(item.count,1,'Old and new modules visible together: '+JSON.stringify(item));
      assert.ok(item.text>25&&!item.inert,'Active papyrus lost native interactive content: '+JSON.stringify(item));
      assert.ok(item.w>80&&item.h>80,'Native real HTML paper collapsed: '+JSON.stringify(item));
      if(isMobile)assert.ok(item.y>=(item.stageBottom||0)-18,
        'Real mobile papyrus physically overlaps living MAG: '+JSON.stringify(item));
      journey.push(item);
    }
    const final=await page.evaluate(()=>{
      const original=document.querySelector('#hero-download');
      const canonical=document.querySelectorAll('.fx-award-proof[data-fx-award-proof]');
      return {ctaOriginal:!!original&&!!original.closest('[data-fx-archive-scene="final"] .fx-archive-cinema-folio-r2030'),
        ctaHref:original?.getAttribute('href'),canonicalProofCount:canonical.length,
        proofLinks:canonical[0]?.querySelectorAll('a[href]').length||0};
    });
    assert.ok(final.ctaOriginal&&final.ctaHref,'The final CTA is not the working original HTML link');
    assert.equal(final.canonicalProofCount,1,'Duplicate proof block in deployed MAG');
    assert.ok(final.proofLinks>=2,'Public source verification links missing');
    assert.equal(errors.length,0,'Uncaught browser errors: '+errors.join(' | '));
    const report={profile:isMobile?'mobile-390x844':'desktop-1440x900',initial,chapters:journey,final};
    write(isMobile?'mobile.json':'desktop.json',report);
    console.log('MAG_LIVE_DEFAULT_8_FOLIOS_PASS',JSON.stringify({
      profile:report.profile,url:initial.url,chapterCount:journey.length,
      sharedWebGL2:initial.shared,originalNativeFolios:initial.originals,final}));
  }finally{await context.close();}
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader',
    '--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'
  ]});
  try{await checkViewport(browser,false);await checkViewport(browser,true);}
  finally{await browser.close();}
})().catch(e=>{
  write('failure.json',{url:BASE,error:String(e?.stack||e)});
  console.error('MAG_LIVE_DEFAULT_FAIL',e?.stack||String(e));process.exitCode=1;
});
