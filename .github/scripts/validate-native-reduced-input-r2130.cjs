'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const revision='20261019-r2130-native-reduced-input';
const read=file=>fs.readFileSync(file,'utf8');
const html=read('docs/scifi-ui/index.html');
const loader=read('docs/scifi-ui/scripts/formatx-deferred-reduced-style-r232.js');
const worker=read('billing-worker/src/production-content-entry.js');
const outer=read('billing-worker/src/production-content-entry-r529.js');
const canonical=read('docs/scifi-ui/styles/formatx-category-positioning.css').trim();
const guardedSelector='html[data-fx-design-system="2"]:not([data-fx-core-shape-mode-r413="single-living-organism-fixed-anatomy-r1723"]) body.living-architecture main#main-content section#hero#hero.scene.hero > .hero-grid > .hero-space';
assert(canonical.includes(guardedSelector),'Only the retired mobile reduced visual may collapse');
for(const name of ['formatx-critical-core-r227.css','formatx-critical-reduced-full-r298.css']){
 const css=read('docs/scifi-ui/styles/'+name);
 const block=css.split('/* ===== BEGIN formatx-category-positioning.css ===== */')[1]?.split('/* ===== END formatx-category-positioning.css ===== */')[0]?.trim();
 assert.equal(block,canonical,'Generated critical CSS must preserve its canonical source: '+name);
}
assert(loader.includes('formatx-critical-reduced-full-r298.css?v='+revision),'The same intent owner must request the corrected reduced stylesheet');
for(const asset of ['formatx-deferred-reduced-style-r232.js','formatx-critical-core-r227.css'])assert(html.includes(asset+'?v='+revision),'Authored HTML must request the corrected asset: '+asset);
assert(outer.includes("DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v="+revision+"'"),'The outer production owner must not pin the retired loader');
const rewriteBody=worker.match(/function cacheBustR502Runtime\(html\) \{([\s\S]*?)\n\}/)?.[1];assert(rewriteBody);
const rewrite=new Function('html',rewriteBody);
const fixture='<script src="/scifi-ui/scripts/formatx-deferred-reduced-style-r232.js?v=old"></script><link href="/scifi-ui/styles/formatx-critical-core-r227.css?v=old">';
const updated=rewrite(fixture);assert(updated.includes('formatx-deferred-reduced-style-r232.js?v='+revision));assert(updated.includes('formatx-critical-core-r227.css?v='+revision));assert.equal(rewrite(updated),updated,'Production cache adoption must remain idempotent');

const output='.archive-artifacts/native-reduced-input-r2130.json';
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const write=()=>{fs.mkdirSync('.archive-artifacts',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const snapshot=()=>{
 const core=window.FormatXLivingCore,canvas=core?.canvas,gl=canvas?.getContext('webgl2')||canvas?.getContext('webgl');
 const box=n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return{rect:r.toJSON(),display:s.display,visibility:s.visibility,opacity:s.opacity};};
 const full=document.querySelector('link[data-fx-critical-reduced-full-r299]');
 return{space:box(document.querySelector('#hero .hero-space')),stage:box(core.stage),sameCanvas:canvas===window.__originalReducedCanvas,sameContext:gl===window.__originalReducedContext,
  canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,contextCount:window.__reducedInput.contexts,glError:gl.getError(),lost:gl.isContextLost(),
  rotation:core.rotation,vertexCount:core.vertexCount,full:full?{href:full.href,loaded:!!full.sheet,media:full.media}:null,
  scheduler:document.documentElement.dataset.fxCoreSurfaceSchedulerR484,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),events:window.__reducedInput};
};
function visible(state,label){
 for(const part of ['space','stage']){
  const b=state[part];assert.notEqual(b.display,'none',label+': actual native '+part+' must remain displayed after user intent');assert.notEqual(b.visibility,'hidden',label+': native '+part+' must remain visible');assert(Number(b.opacity)>0,label+': native '+part+' must remain opaque');
  assert(b.rect.width>50&&b.rect.height>50,label+': original native '+part+' must not collapse');
 }
 assert(state.sameCanvas&&state.sameContext&&!state.lost,label+': same original canvas/context');assert.equal(state.canvasCount,1);assert.equal(state.contextCount,1);assert.equal(state.glError,0);assert.equal(state.overflow,0);assert.equal(state.events.complete.length,1,'One genuine intro completion');
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 report.browser=browser.version();
 try{
  for(const profile of [{name:'desktop',width:1440,height:900,mobile:false},{name:'mobile-320',width:320,height:568,mobile:true},{name:'mobile-390',width:390,height:844,mobile:true}])for(const reduced of [false,true]){
   const item={profile:profile.name,motion:reduced?'reduced':'normal',errors:[]};report.cases.push(item);
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:profile.mobile,hasTouch:profile.mobile,deviceScaleFactor:profile.mobile?2:1,reducedMotion:reduced?'reduce':'no-preference',locale:'hu-HU',colorScheme:'dark'});
   await context.addInitScript(()=>{
    const e=window.__reducedInput={contexts:0,draws:0,keys:[],physiology:[],start:[],complete:[]};
    const original=HTMLCanvasElement.prototype.getContext,seen=new WeakSet();
    HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=original.call(this,type,...args);if(gl&&/webgl/.test(type)&&!seen.has(gl)){seen.add(gl);e.contexts++;}return gl;};
    for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype]){const draw=proto.drawArrays;proto.drawArrays=function(...args){const result=draw.apply(this,args);if(this.canvas.classList.contains('fx-crystal-organism-r326-canvas'))e.draws++;return result;};}
    document.addEventListener('keydown',event=>e.keys.push({key:event.key,trusted:event.isTrusted,target:event.target.tagName}));
    addEventListener('formatx:organismphysiology',event=>e.physiology.push({...event.detail}));
    document.addEventListener('formatx:magbirthstart',()=>e.start.push(performance.now()));
    document.addEventListener('formatx:magbirthcomplete',()=>e.complete.push(performance.now()));
    addEventListener('formatx:real3dready',()=>{window.__originalReducedCanvas=window.FormatXLivingCore?.canvas;window.__originalReducedContext=__originalReducedCanvas?.getContext('webgl2')||__originalReducedCanvas?.getContext('webgl');});
   });
   const page=await context.newPage();page.on('pageerror',error=>item.errors.push(String(error)));
   try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'&&window.__reducedInput?.complete.length===1,null,{timeout:18000});
    await page.waitForLoadState('load');await page.waitForTimeout(300);
    item.before=await page.evaluate(snapshot);visible(item.before,item.profile+' before intent');
    await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
    if(reduced)await page.waitForFunction(()=>document.documentElement.dataset.fxReducedStyleR233==='activated-on-user-intent-r299',null,{timeout:8000});
    await page.waitForTimeout(400);
    item.afterIntent=await page.evaluate(snapshot);visible(item.afterIntent,item.profile+' after real keyboard intent');
    assert(item.afterIntent.events.keys.filter(e=>e.key==='ArrowRight'&&e.trusted).length===2,'The original CSS must be activated by genuine input, not injected');
    if(reduced)assert(item.afterIntent.full?.loaded,'Real reduced payload must still load');
    else assert.equal(item.afterIntent.full,null,'Normal motion must not fetch the reduced payload');
    await page.locator('button.fx-reference-mag-button').click();
    await page.waitForFunction(()=>window.__reducedInput.physiology.some(e=>e.kind==='response'&&String(e.source).includes('mag-button')),null,{timeout:8000});
    const beforeKey=await page.evaluate(()=>window.FormatXLivingCore.rotation[1]);
    await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
    await page.waitForFunction(prior=>window.FormatXLivingCore.rotation[1]>prior+.025,beforeKey,{timeout:8000});
    item.afterMag=await page.evaluate(snapshot);visible(item.afterMag,item.profile+' after genuine MAG input');
    assert(item.afterMag.events.draws>item.afterIntent.events.draws,'Real input must draw using the original native renderer');
    assert.equal(item.afterMag.vertexCount,item.before.vertexCount,'Input must retain the original geometry');
    assert.deepEqual(item.errors,[]);item.pass=true;
    console.log('NATIVE_REDUCED_INPUT_R2130_CASE_PASS '+JSON.stringify({profile:item.profile,motion:item.motion,space:item.afterIntent.space,rotation:item.afterMag.rotation,draws:item.afterMag.events.draws}));
   }catch(error){item.failure=String(error.stack||error);item.failureState=await page.evaluate(snapshot).catch(()=>null);throw error;}
   finally{write();await context.close();}
  }
 }finally{await browser.close();}
 for(const item of report.cases)if(item.motion==='reduced')assert(item.afterIntent.full.href.endsWith('formatx-critical-reduced-full-r298.css?v='+revision),'The actual browser must receive the corrected cache URL');
 console.log('NATIVE_REDUCED_INPUT_R2130_PASS '+JSON.stringify({sha:report.sha,browser:report.browser,cases:report.cases.map(c=>({profile:c.profile,motion:c.motion,pass:c.pass}))}));
})().catch(error=>{write();console.error(error);process.exitCode=1;});
