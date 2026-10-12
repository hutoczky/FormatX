'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
async function verify(browser,viewport){
  const mobile=viewport.width<=900;
  const context=await browser.newContext({
    viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference',
    colorScheme:'dark'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.goto(URL+'?lighthouse=1&lang=hu',{waitUntil:'domcontentloaded',timeout:60000});
  // Regression from actual R2045 Lighthouse mobile filmstrip: at 13.9s
  // everything readable disappeared while only the decorative MAG remained.
  await page.waitForTimeout(mobile?14500:3500);
  const state=await page.evaluate(()=>{
    const root=document.documentElement;
    const hero=document.querySelector('#hero .hero-copy');
    const title=document.getElementById('hero-title');
    const rect=hero?.getBoundingClientRect();
    const tr=title?.getBoundingClientRect();
    const style=hero?getComputedStyle(hero):null;
    const titleStyle=title?getComputedStyle(title):null;
    const folio=document.querySelector('[data-fx-cinema-panel-active="true"]');
    const folioStyle=folio?getComputedStyle(folio):null;
    const inViewport=r=>!!r&&r.width>100&&r.height>15
      &&r.bottom>0&&r.top<innerHeight-8;
    const actualText=(title?.textContent||'').trim();
    // Ancestor opacity/visibility also matter: a child can report opacity=1
    // while a global post-intro overlay has hidden the entire parent tree.
    const paintedHero=hero?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||false;
    const paintedTitle=title?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||false;
    const hasOriginalLinks=!!hero?.querySelector('a[href]');
    return {
      cinema:root.dataset.fxArchiveCinema||'home',
      experience:root.dataset.fxArchiveExperience||'unavailable',
      hero:hero?{display:style.display,visibility:style.visibility,opacity:style.opacity,
        x:rect.x,y:rect.y,w:rect.width,h:rect.height,inViewport:inViewport(rect)}:null,
      title:title?{display:titleStyle.display,visibility:titleStyle.visibility,
        x:tr.x,y:tr.y,w:tr.width,h:tr.height,inViewport:inViewport(tr),text:actualText}:null,
      workingFolio:!!folio&&folioStyle.display!=='none'&&folioStyle.visibility!=='hidden'
        &&inViewport(folio.getBoundingClientRect()),
      hasOriginalLinks,paintedHero,paintedTitle,
      scrollY,viewport:{width:innerWidth,height:innerHeight}
    };
  });
  assert.ok(state.workingFolio||(
    state.hero?.display!=='none'&&state.hero?.visibility==='visible'
    &&Number(state.hero?.opacity)>.2&&state.hero?.inViewport
    &&state.title?.display!=='none'&&state.title?.visibility==='visible'
    &&state.title?.inViewport&&state.title?.text?.includes('FORMATX')
    &&state.paintedHero&&state.paintedTitle&&state.hasOriginalLinks
  ),'After delayed rendering, show the true interactive HTML or real MAG folio, never an empty MAG-only viewport: '+JSON.stringify(state));
  // Real visual audit artefact: the screenshot is optional when software
  // WebGL compositor cannot capture within eight seconds. DOM checks above
  // remain mandatory.
  try{
    const fs=require('node:fs');
    fs.mkdirSync('.archive-artifacts',{recursive:true});
    await page.screenshot({
      path:'.archive-artifacts/r2046-long-load-'+(mobile?'phone':'desktop')+'.png',
      timeout:8000
    });
  }catch(error){
    console.log('R2046_CAPTURE_UNAVAILABLE',String(error.message).slice(0,190));
  }
    assert.ok(errors.length===0,'Uncaught errors: '+errors.join(' | '));
  console.log('MAG_CONTENT_CONTINUITY_PASS',JSON.stringify(state));
  await context.close();
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  try{
    await verify(browser,{width:390,height:844});
    await verify(browser,{width:1440,height:900});
  }finally{await browser.close();}
})().catch(error=>{console.error('MAG_CONTENT_CONTINUITY_FAIL',error.stack||String(error));process.exitCode=1;});
