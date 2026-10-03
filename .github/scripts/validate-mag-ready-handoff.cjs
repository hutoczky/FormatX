'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const URL=process.env.FORMATX_TEST_URL||'https://formatxsuite.com/';
const OUT=process.env.FORMATX_HANDOFF_EVIDENCE_DIR||'artifacts/mag-ready-handoff';
fs.mkdirSync(OUT,{recursive:true});

async function verify(browser,profile,staticFallback){
 const route=staticFallback==='script'?'script-unavailable':staticFallback?'static':'webgl';
 console.log('MAG_READY_HANDOFF_START',profile.name,route);
 const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.mobile,hasTouch:profile.mobile,reducedMotion:profile.reduced?'reduce':'no-preference'});
 await context.addInitScript(({staticFallback})=>{
  const NativeWorker=window.Worker;
  window.__handoff={workers:[],posts:0,oldPulseCalls:0,newPulseCalls:0,events:[],glWork:[]};
  const originalContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   const start=performance.now(),context=staticFallback===true&&['webgl','webgl2','experimental-webgl'].includes(type)?null:originalContext.call(this,type,...args);
   if(type==='webgl')window.__handoff.glWork.push({phase:'context',at:start,ms:performance.now()-start,previousStageConnected:Boolean(window.__handoff.oldStage?.isConnected)});
   return context;
  };
  for(const name of ['compileShader','linkProgram','getProgramParameter','getShaderParameter']){
   const original=WebGLRenderingContext.prototype[name];
   WebGLRenderingContext.prototype[name]=function(...args){const start=performance.now(),result=original.apply(this,args);window.__handoff.glWork.push({phase:name,at:start,ms:performance.now()-start});return result;};
  }
  window.Worker=class extends NativeWorker{
   constructor(url,options){super(url,options);if(String(url).includes('formatx-crystal-worker'))window.__handoff.workers.push(this);}
   postMessage(message,...args){if(message?.type==='state')window.__handoff.posts++;return super.postMessage(message,...args);}
  };
  addEventListener('formatx:real3dready',event=>window.__handoff.events.push({renderer:event.detail?.renderer,at:performance.now()}));
 },{staticFallback});
 if(staticFallback==='script')await context.route('**/formatx-crystal-bounded-fallback-r727.js*',request=>request.abort());
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(String(error)));
 const snapshot=()=>page.evaluate(()=>({
  at:performance.now(),ready:document.documentElement.dataset.fxCrystalOrganismR326,
  handoff:document.documentElement.dataset.fxCoreFallbackHandoffR753,
  revision:window.FormatXLivingCore?.revision,
  shape:window.FormatXLivingCore?.shape,
  stages:document.querySelectorAll('#hero .fx-core-mobile-v55-stage').length,
  canvases:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
  visibleCanvases:[...document.querySelectorAll('#hero canvas')].filter(node=>{const s=getComputedStyle(node);return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>.2;}).length,
  posts:window.__handoff.posts,
  oldPulseCalls:window.__handoff.oldPulseCalls,newPulseCalls:window.__handoff.newPulseCalls,
  retiredCanvasReference:Boolean(window.__handoff.oldApi?.canvas),retiredStageCanvases:window.__handoff.oldStage?.querySelectorAll('canvas').length||0,
  events:window.__handoff.events,glWork:window.__handoff.glWork,terminatedAt:window.__handoff.terminatedAt,
  overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
 }));
 try{
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.FormatXLivingCore&&document.documentElement.dataset.fxCoreLifeR455==='ready',null,{timeout:15000});
  const before=await snapshot();
  if(before.revision!=='r753-offscreen'){
   // A cold or unsupported worker may legitimately recover before publishing a
   // useful frame. Verify that route; still require real post-ready worker faults
   // for both desktop and mobile across this suite (see final assertions).
   assert.equal(before.ready,'ready');assert.equal(before.stages,1);
   assert.ok(before.canvases<=1&&before.visibleCanvases<=1);
   assert.match(before.revision,/fallback/,'startup recovery must use a real fallback owner');
   assert.match(before.handoff,/^candidate-ready-worker-retired-/,'primary ownership must retire before startup recovery');
   await page.waitForFunction(()=>document.documentElement.dataset.fxCoreLifeVisibilityR455==='visible',null,{timeout:5000});
   await page.evaluate(()=>{
    const api=window.FormatXLivingCore,original=api.surfacePulse;
    api.surfacePulse=function(...args){window.__handoff.newPulseCalls++;return original.apply(this,args);};
    api.stage.dispatchEvent(new PointerEvent('pointerdown'));
    api.setShape('sphere','startup-recovery-verification');
    document.getElementById('hero').dispatchEvent(new PointerEvent('pointermove',{clientX:920,clientY:320,pointerType:'mouse'}));
    document.dispatchEvent(new Event('visibilitychange'));
   });
   await page.waitForTimeout(120);
   const after=await snapshot();assert.equal(after.shape,'sphere');assert.deepEqual(errors,[]);
   assert.equal(after.posts,before.posts,'retired startup worker must receive no input or foreground state');
   assert.equal(after.newPulseCalls,profile.reduced?0:1,'one life adapter must own the startup fallback');
   assert.ok(after.overflow<=2);
   if(staticFallback)assert.equal(await page.locator('#hero .fx-core-static-semantic-r866 svg').count(),1,'semantic readiness requires a real fallback representation');
   const name=profile.name+'-'+route+'-startup-recovery';
   await page.screenshot({path:path.join(OUT,name+'.png')});
   return {name,profile:profile.name,mode:'startup-recovery',before,after};
  }
  assert.equal(before.canvases,1,'primary must produce a useful canvas before failure');
  assert.equal(before.ready,'ready');
  // Capture the composited primary frame before injecting the post-paint fault.
  // A queued WebGL command alone is insufficient evidence of that precondition.
  await page.screenshot({path:path.join(OUT,profile.name+'-primary-before-failure.png')});
  await page.evaluate(()=>{
   const api=window.FormatXLivingCore,original=api.surfacePulse;
   window.__handoff.oldApi=api;
   window.__handoff.oldStage=api.stage;
   api.surfacePulse=function(...args){window.__handoff.oldPulseCalls++;return original.apply(this,args);};
   const worker=window.__handoff.workers[0];
   window.__handoff.terminatedAt=performance.now();worker.terminate();
   // A real active Worker is terminated; deliver its normal error notification.
   // Neither readiness nor fallback state is fabricated by this fault injection.
   worker.dispatchEvent(new ErrorEvent('error',{message:'Active renderer terminated after first useful frame'}));
  });
  await page.waitForFunction(()=>document.documentElement.dataset.fxCoreFallbackHandoffR753?.startsWith('candidate-ready-worker-retired-'),null,{timeout:10000});
  await page.waitForFunction(()=>document.documentElement.dataset.fxCoreLifeVisibilityR455==='visible',null,{timeout:5000});
  const recovered=await snapshot();
  assert.equal(recovered.ready,'ready','handoff must preserve durable semantic readiness');
  assert.equal(recovered.stages,1,'retired primary stage must be removed');
  assert.equal(recovered.retiredCanvasReference,false,'late consumers of the retired API must not retain its transferred canvas');
  assert.equal(recovered.retiredStageCanvases,0,'the retired stage must release the transferred canvas before replacement context acquisition');
  assert.equal(recovered.canvases,staticFallback?0:1,'one canonical canvas after handoff');
  assert.equal(recovered.visibleCanvases,staticFallback?0:1);
  assert.ok(recovered.glWork.filter(work=>work.phase==='context').every(work=>!work.previousStageConnected),'failed transferred canvas must retire before recovery requests its context');
  assert.match(recovered.revision,staticFallback?/static-semantic/:/normal-lit-main-thread-fallback/);
  if(staticFallback)assert.equal(await page.locator('#hero .fx-core-static-semantic-r866 svg').count(),1,'semantic readiness requires a real fallback representation');
  assert.ok(recovered.events.length>=2,'replacement must publish actual readiness');
  await page.evaluate(()=>{
   const api=window.FormatXLivingCore,original=api.surfacePulse;
   api.surfacePulse=function(...args){window.__handoff.newPulseCalls++;return original.apply(this,args);};
   window.__handoff.oldStage.dispatchEvent(new PointerEvent('pointerdown'));
   api.stage.dispatchEvent(new PointerEvent('pointerdown'));
   api.setShape('sphere','handoff-verification');
   // Input and foreground notifications must reach only the current owner.
   document.getElementById('hero').dispatchEvent(new PointerEvent('pointermove',{clientX:920,clientY:320,pointerType:'mouse'}));
   document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(120);
  const after=await snapshot();
  assert.equal(after.posts,recovered.posts,'retired worker must not receive input or lifecycle state');
  assert.equal(after.oldPulseCalls,0,'life adapter must release the previous renderer API');
  assert.equal(after.newPulseCalls,profile.reduced?0:1,'one life adapter must adopt the new renderer');
  assert.equal(after.shape,'sphere','replacement must remain interactive');
  assert.ok(after.overflow<=2);
  assert.deepEqual(errors,[]);
  const name=profile.name+'-'+route;
  await page.screenshot({path:path.join(OUT,name+'.png')});
  return {name,profile:profile.name,mode:'ready-worker-failure',before,recovered,after};
 }catch(error){console.error('MAG_READY_HANDOFF_FAILURE',profile.name,staticFallback,JSON.stringify(await snapshot()),errors);throw error;}finally{await context.close();}
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try{
  const reports=[];
  for(const profile of [{name:'desktop',viewport:{width:1440,height:900},mobile:false},{name:'mobile',viewport:{width:390,height:844},mobile:true}]){
   reports.push(await verify(browser,profile,false));reports.push(await verify(browser,profile,true));
   reports.push(await verify(browser,profile,'script'));
  }
  reports.push(await verify(browser,{name:'desktop-reduced',viewport:{width:1440,height:900},mobile:false,reduced:true},false));
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({auditedSha:process.env.AUDITED_SHA||'',origin:URL,reports},null,2));
  for(const profile of ['desktop','mobile'])assert.ok(reports.some(report=>report.profile===profile&&report.mode==='ready-worker-failure'),profile+': a genuine already-ready worker must be failed and recovered; startup fallback alone cannot certify this contract');
  console.log('MAG_READY_HANDOFF_PASS',reports.map(report=>report.name).join(', '));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
