'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const URL=process.env.FORMATX_ARCHIVE_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html?archive=1&r486-optics-energy-check=1';
const out='.archive-artifacts';
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(viewport,isMobile,browser){
  const context=await browser.newContext({
    viewport,deviceScaleFactor:isMobile?2:1,
    isMobile,hasTouch:isMobile,
    reducedMotion:'no-preference'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>Boolean(window.FormatXArchiveExperience),null,{timeout:60000});
  await page.waitForFunction(()=>{
    const s=document.documentElement.dataset.fxArchiveExperience;
    return s==='ready'||s==='context-error'||s==='no-scenes';
  },null,{timeout:90000});
  const init=await page.evaluate(()=>({
    status:document.documentElement.dataset.fxArchiveExperience,
    shared:window.FormatXLivingCore?.sharedWebGL2||false,
    sceneCount:window.FormatXArchiveExperience.scenes.length,
    contextCount:document.documentElement.dataset.fxCoreContexts
  }));
  assert.equal(init.status,'ready',JSON.stringify(init));
  assert.equal(init.shared,true,JSON.stringify(init));
  assert.ok(init.sceneCount>=6,'Expected at least six real source sections');
  assert.equal(init.contextCount,'1','Original MAG owns the sole WebGL context');
  const scenes=await page.evaluate(()=>window.FormatXArchiveExperience.scenes);
  let passed=0;
  const coverage=[];
  for(const scene of scenes){
    const selector=/^[#.]/.test(scene.id)?scene.id:'#'+scene.id;
    await page.locator(selector).first().evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
    // Some FormatX sections have independent content-visibility sizing and
    // smooth-loop reconciliation. Use a native document scroll when a section
    // remains entirely outside the viewport after scrollIntoView.
    await page.evaluate(sel=>{
      const n=document.querySelector(sel),r=n?.getBoundingClientRect();
      if(r&&(r.top>innerHeight*.92||r.bottom<0)){
        window.scrollTo({top:scrollY+r.top-innerHeight*.32,behavior:'instant'});
      }
    },selector);
    await page.waitForFunction(key=>{
      const state=window.FormatXArchiveExperience?.state;
      return state?.active&&state?.scene===key;
    },scene.key,{timeout:8000}).catch(()=>{});
    const state=await page.evaluate(()=>window.FormatXArchiveExperience.state);
    let postRefresh=null;
    if(state.scene!==scene.key){
      await page.evaluate(()=>window.FormatXArchiveExperience.refresh());
      await page.waitForTimeout(240);
      postRefresh=await page.evaluate(()=>window.FormatXArchiveExperience.state);
    }
    const diagnostics=await page.evaluate(sel=>{
      const node=document.querySelector(sel),r=node?.getBoundingClientRect();
      return {scrollY,scrollHeight:document.documentElement.scrollHeight,innerHeight,
        target:r?{top:r.top,bottom:r.bottom,height:r.height,display:getComputedStyle(node).display}:null,
        archive:document.documentElement.dataset.fxArchiveDock,
        nearby:[...document.querySelectorAll('[data-fx-archive-scene]')].map(n=>{const b=n.getBoundingClientRect();return{key:n.dataset.fxArchiveScene,top:Math.round(b.top),bottom:Math.round(b.bottom)};}).slice(0,12)};
    },selector);
    console.log('ARCHIVE_SCENE_PROBE',JSON.stringify({expected:scene.key,actual:state.scene,active:state.active,progress:state.progress,postRefresh,diagnostics}));
    if(state.scene===scene.key&&state.active){
      passed++;
      coverage.push({key:scene.key,progress:state.progress,frames:state.frames});
      const inside=await page.locator(selector).first().evaluate(n=>{
        const focusable=n.querySelector('a[href],button,input,select,textarea');
        return{nativeText:((n.textContent||'').trim().length>10),focusable:!!focusable,tag:n.tagName};
      });
      assert.ok(inside.nativeText,'Native semantic content is missing: '+scene.key);
    }
  }
  assert.equal(passed,scenes.length,'Every real archive scene must activate: '+JSON.stringify({passed,total:scenes.length,coverage}));
  const one=scenes.find(s=>s.key==='capabilities')||scenes[0];
  const selector=one.id.startsWith('.')?one.id:'#'+one.id;
  await page.locator(selector).first().evaluate(n=>n.scrollIntoView({block:'center',behavior:'instant'}));
  await sleep(150);
  const center=await page.evaluate(()=>window.FormatXArchiveExperience.state);
  await page.evaluate(()=>scrollBy({top:-Math.max(60,Math.round(innerHeight*.2)),behavior:'instant'}));
  await sleep(140);
  const back=await page.evaluate(()=>window.FormatXArchiveExperience.state);
  if(back.scene===center.scene)assert.ok(back.progress<=center.progress+.03,'Reverse scroll must reverse the timeline');
  const native=await page.evaluate(()=>({
    renderer:document.documentElement.dataset.fxArchiveNativePass,
    drawCalls:Number(document.documentElement.dataset.fxArchiveDrawCalls||0),
    filamentCount:Number(document.documentElement.dataset.fxArchiveFilamentCount||0),
    frames:window.FormatXArchiveExperience.state.frames,
    controls:document.querySelectorAll('#menu-toggle,.fx-language-toggle,.fx-reference-ask').length,
    scrollHeight:document.documentElement.scrollHeight,
    viewport:innerHeight,
    magDomCanonical:!!document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage'),
    canvasRect:(()=>{const r=document.querySelector('#hero .fx-crystal-organism-r326-stage')?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null;})()
  }));
  assert.ok(native.frames>0,'Native WebGL archive never drew');
  assert.ok(native.magDomCanonical,'Native MAG must remain inside the original hero DOM');
  assert.ok(native.canvasRect?.w>110&&native.canvasRect?.h>110,'Archive canvas must have usable viewport geometry');
  if(isMobile){
    assert.ok(native.canvasRect.w>=viewport.width*.88,'Mobile archive must use the available screen width rather than a thumbnail: '+JSON.stringify(native.canvasRect));
    assert.ok(native.canvasRect.h>=Math.min(viewport.height*.50,400),'Mobile archive must show cinematic panel retrieval at a readable height: '+JSON.stringify(native.canvasRect));
  }
  assert.ok(native.drawCalls>0,'Archive WebGL geometry did not render');
  if (!isMobile && native.filamentCount < 1 && await page.evaluate(()=>document.documentElement.dataset.fxArchiveQuality==='high')) {
    throw new Error('High-quality archive scene did not emit any physical 3D filaments');
  }

  // The old suite merely counted GPU draw calls, so an entirely hidden archive
  // could still PASS. Prove the native MAG stage is layered over opaque chapters
  // and that scroll produces a visible, legible live chapter identifier.
  const handoff=await page.evaluate(()=>{
    const el=document.querySelector('.fx-archive-telemetry-r2022');
    const hero=document.querySelector('#hero');
    const stage=document.querySelector('#hero .fx-crystal-organism-r326-stage.fx-archive-native-docked');
    const hStyle=el?getComputedStyle(el):null;
    const heroStyle=hero?getComputedStyle(hero):null;
    const rect=el?.getBoundingClientRect();
    return {
      exists:!!el,
      active:el?.dataset.active,
      name:el?.querySelector('.fx-archive-telemetry-r2022__title')?.textContent||'',
      opacity:Number(hStyle?.opacity||0),
      visibility:hStyle?.visibility,
      heroZ:Number(heroStyle?.zIndex||0),
      stageZ:Number(stage?getComputedStyle(stage).zIndex:0),
      rect:rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null
    };
  });
  assert.ok(handoff.exists&&handoff.active==='true','Visible MAG handoff missing: '+JSON.stringify(handoff));
  assert.ok(handoff.name.length>5,'MAG handoff lacks native chapter identity: '+JSON.stringify(handoff));
  assert.ok(handoff.opacity>.7&&handoff.visibility==='visible','MAG archive telemetry is transparent or hidden: '+JSON.stringify(handoff));
  assert.ok(handoff.heroZ>4&&handoff.stageZ>4,'MAG WebGL stage is hidden below opaque section stacking contexts: '+JSON.stringify(handoff));
  assert.ok(handoff.rect&&handoff.rect.left>=0&&handoff.rect.top>=0&&handoff.rect.left+handoff.rect.width<=viewport.width+2,'MAG handoff outside mobile or desktop viewport: '+JSON.stringify(handoff));
  console.log('ARCHIVE_VISIBLE_HANDOFF_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',handoff}));

  assert.equal(native.renderer,'shared-webgl2');
  assert.ok(native.scrollHeight>native.viewport,'Native scrolling was lost');
  // Software WebGL readback can stall screenshots in CI even after all
  // native scroll/WebGL assertions pass. Capture is evidence, not a substitute
  // for functional testing; report incomplete captures explicitly.
  try {
    await page.screenshot({
      path:`${out}/archive-${isMobile?'mobile':'desktop'}.png`,
      fullPage:false,animations:'disabled',timeout:12000
    });
  } catch(error) {
    console.warn('ARCHIVE_CAPTURE_UNAVAILABLE',JSON.stringify({
      mode:isMobile?'mobile':'desktop',reason:String(error?.message||error).slice(0,400)
    }));
  }
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await sleep(200);
  const restored=await page.evaluate(()=>({dock:document.documentElement.dataset.fxArchiveDock,stage:!!document.querySelector('#hero .fx-crystal-organism-r326-stage')}));
  assert.ok(restored.stage,'MAG was not returned to original hero');
  assert.ok(errors.length===0,'Uncaught script errors: '+errors.join(' | '));
  console.log('ARCHIVE_PASS',JSON.stringify({mode:isMobile?'mobile':'desktop',init,passed,coverage,native,restored}));
  await context.close();
}
async function fallback(browser){
  const ctx=await browser.newContext({viewport:{width:1024,height:768},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(window.FormatXArchiveExperience),null,{timeout:30000});
  const v=await page.evaluate(()=>({
    state:document.documentElement.dataset.fxArchiveExperience,
    scene:document.querySelector('#experience')?.tagName,
    text:document.querySelector('#experience')?.textContent?.trim().length||0
  }));
  assert.equal(v.state,'reduced-html');
  assert.ok(v.text>20,'Reduced motion must preserve native HTML');
  console.log('ARCHIVE_REDUCED_PASS',JSON.stringify(v));
  await ctx.close();
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  try{
    await evaluate({width:1440,height:900},false,browser);
    await evaluate({width:390,height:844},true,browser);
    await fallback(browser);
  }finally{await browser.close();}
})().catch(e=>{console.error('ARCHIVE_FAIL',e.stack||String(e));process.exitCode=1;});
