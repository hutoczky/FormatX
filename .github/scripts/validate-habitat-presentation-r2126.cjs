'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const out=path.resolve('.archive-artifacts/habitat-presentation-r2126.json');
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const write=()=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2));};

(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader',
  '--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'
 ]});
 report.browser=browser.version();
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},
   deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,locale:'hu-HU',colorScheme:'dark'});
  const item={profile:mobile?'mobile':'desktop',fixture:'real external CSS hides then reveals the habitat',errors:[]};
  report.cases.push(item);
  const page=await context.newPage();
  page.on('pageerror',error=>item.errors.push(String(error)));
  await page.addInitScript(()=>{
   const proof=window.__habitatPresentation={contexts:0,draws:0,birth:[],ready:[]};
   const get=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(...args){
    if(this.classList.contains('fx-living-habitat-r1530'))proof.contexts++;
    return Reflect.apply(get,this,args);
   };
   const clear=CanvasRenderingContext2D.prototype.clearRect;
   CanvasRenderingContext2D.prototype.clearRect=function(...args){
    if(this.canvas.classList.contains('fx-living-habitat-r1530'))proof.draws++;
    return Reflect.apply(clear,this,args);
   };
   document.addEventListener('formatx:magbirthcomplete',()=>proof.birth.push(performance.now()));
   addEventListener('formatx:real3dready',()=>proof.ready.push(performance.now()));
  });
  // Fault only the real external stylesheet's presentation. Native renderer,
  // uniforms, clock, hardware identity and readiness remain untouched.
  await page.route('**/formatx-living-habitat-r1530.css?*',async route=>{
   const response=await route.fetch();
   const show=new URL(route.request().url()).searchParams.get('habitat-presentation-fixture')==='visible';
   const selector='html'+':root'.repeat(24)+' body.living-architecture > canvas.fx-living-habitat-r1530';
   await route.fulfill({response,body:await response.text()+`\n${selector}{display:${show?'block':'none'}!important;visibility:visible!important;opacity:.78!important;}`});
  });
  const state=()=>page.evaluate(()=>{
   const canvas=document.querySelector('.fx-living-habitat-r1530'),core=window.FormatXLivingCore;
   return{...__habitatPresentation,display:canvas?getComputedStyle(canvas).display:null,
    width:canvas?.width,height:canvas?.height,viewport:{width:innerWidth,height:innerHeight},
    nativeCanvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
    nativeReady:document.documentElement.dataset.fxCoreFirstFrameR1913,
    sameOwner:!window.__nativeBeforePresentation||window.__nativeBeforePresentation===core?.canvas,
    habitatState:document.documentElement.dataset.fxLivingHabitatStartR1737};
  });
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>__habitatPresentation.birth.length>0&&__habitatPresentation.ready.length>0,null,{timeout:18000,polling:100});
   item.hidden=await state();
   assert.equal(item.hidden.display,'none');
   assert.equal(item.hidden.contexts,0,'CSS-hidden habitat allocated a rendering context');
   assert.equal(item.hidden.draws,0,'CSS-hidden habitat painted');
   assert.equal(item.hidden.width,300,'Hidden habitat allocated a viewport backing store');
   assert.equal(item.hidden.height,150);
   assert.equal(item.hidden.nativeCanvases,1);
   assert.equal(item.hidden.nativeReady,'painted');
   await page.evaluate(()=>{
    window.__nativeBeforePresentation=FormatXLivingCore.canvas;
    const original=document.querySelector('link[data-fx-living-habitat-r1530]');
    const link=document.createElement('link');link.rel='stylesheet';
    link.dataset.fxLivingHabitatR1530='true';
    link.href=original.href+'&habitat-presentation-fixture=visible';document.head.append(link);
   });
   // The actual stylesheet load must start painting; no click, forged event,
   // forced context or private runtime API is used to make the fixture pass.
   await page.waitForFunction(()=>__habitatPresentation.draws>0,null,{timeout:6000,polling:100});
   item.visible=await state();
   assert.equal(item.visible.display,'block');
   assert.equal(item.visible.contexts,1);
   assert.ok(item.visible.width>300&&item.visible.height>150);
   assert.equal(item.visible.sameOwner,true);
   assert.equal(item.visible.nativeCanvases,1);
   const before=item.visible.draws;
   await page.setViewportSize(mobile?{width:412,height:915}:{width:1536,height:960});
   await page.waitForFunction(previous=>__habitatPresentation.draws>previous,before,{timeout:6000,polling:100});
   item.resized=await state();
   assert.equal(item.resized.contexts,1,'Viewport change allocated a second habitat context');
   assert.notEqual(item.resized.width,item.visible.width);
   assert.equal(item.resized.sameOwner,true);
   assert.deepEqual(item.errors,[]);
   item.pass=true;
  }catch(error){item.error=String(error);item.failureState=await state().catch(()=>null);throw error;}
  finally{write();await context.close();}
 }}finally{await browser.close();}
 console.log('HABITAT_PRESENTATION_R2126_PASS',JSON.stringify(report));
})().catch(error=>{write();console.error(error);process.exitCode=1;});
