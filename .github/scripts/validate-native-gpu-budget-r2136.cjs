'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const output='.archive-artifacts/native-gpu-budget-r2136.json';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const write=()=>{fs.mkdirSync('.archive-artifacts',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
function observe(noTimer){
 const audit=window.__gpuBudgetAudit={contexts:0,draws:0,queryCalls:0,peakPending:0,resolved:[],completed:[],shaders:[],trustedClicks:0,csp:[],lost:0};
 const contexts=new WeakSet(),queries=new WeakMap(),pending=new Set(),active=new WeakMap(),lastDisjoint=new WeakMap();
 const native=gl=>gl?.canvas?.classList?.contains('fx-crystal-organism-r326-canvas');
 const get=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(){const r=Reflect.apply(get,this,arguments);if(r&&/webgl/.test(arguments[0])&&native(r)&&!contexts.has(r)){contexts.add(r);audit.contexts++;}return r;};
 for(const Type of [WebGLRenderingContext,WebGL2RenderingContext]){
  const p=Type.prototype,extension=p.getExtension,shader=p.shaderSource,draw=p.drawArrays;
  p.getExtension=function(){if(noTimer&&arguments[0]==='EXT_disjoint_timer_query_webgl2')return null;return Reflect.apply(extension,this,arguments);};
  p.shaderSource=function(){if(native(this))audit.shaders.push(arguments[1]);return Reflect.apply(shader,this,arguments);};
  p.drawArrays=function(){const r=Reflect.apply(draw,this,arguments);if(native(this)&&arguments[2]===6624)audit.draws++;return r;};
 }
 const p=WebGL2RenderingContext.prototype,begin=p.beginQuery,end=p.endQuery,param=p.getQueryParameter,del=p.deleteQuery,getParam=p.getParameter;
 p.beginQuery=function(){const r=Reflect.apply(begin,this,arguments);if(native(this)&&arguments[0]===0x88BF){const q=arguments[1];queries.set(q,{startedAt:performance.now(),width:this.drawingBufferWidth,height:this.drawingBufferHeight,ended:false,available:false});pending.add(q);active.set(this,q);audit.queryCalls++;audit.peakPending=Math.max(audit.peakPending,pending.size);}return r;};
 p.endQuery=function(){const r=Reflect.apply(end,this,arguments);if(native(this)&&arguments[0]===0x88BF){const q=active.get(this),info=queries.get(q);if(info)info.ended=true;active.delete(this);}return r;};
 p.getParameter=function(){const r=Reflect.apply(getParam,this,arguments);if(native(this)&&arguments[0]===0x8FBB)lastDisjoint.set(this,r);return r;};
 p.getQueryParameter=function(){const r=Reflect.apply(param,this,arguments),info=queries.get(arguments[0]);if(info){if(arguments[1]===this.QUERY_RESULT_AVAILABLE&&r===true)info.available=true;if(arguments[1]===this.QUERY_RESULT)audit.resolved.push({...info,at:performance.now(),gpuMs:r/1e6,disjoint:lastDisjoint.get(this)});}return r;};
 p.deleteQuery=function(){const r=Reflect.apply(del,this,arguments);pending.delete(arguments[0]);return r;};
 document.addEventListener('formatx:magbirthcomplete',e=>audit.completed.push({at:performance.now(),source:e.detail?.source}));
 document.addEventListener('click',e=>{if(e.isTrusted)audit.trustedClicks++;},true);
 document.addEventListener('securitypolicyviolation',e=>audit.csp.push(e.violatedDirective));
 document.addEventListener('webglcontextlost',()=>audit.lost++,true);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});report.browser=browser.version();
 try{for(const mobile of [false,true])for(const noTimer of [false,true]){
  const profile=(mobile?'mobile':'desktop')+(noTimer?'-timer-unavailable':'-gpu-timer');
  const item={profile,errors:[]};report.cases.push(item);
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:2,isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference',locale:'hu-HU'});
  await context.addInitScript(observe,noTimer);const page=await context.newPage();page.on('pageerror',e=>item.errors.push(String(e)));
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__gpuBudgetAudit.completed.length===1&&document.documentElement.dataset.fxCrystalOrganismR326==='ready',null,{timeout:20000});
   await page.locator('button.fx-reference-mag-button').click();
   await page.waitForTimeout(1500);
   item.actual=await page.evaluate(()=>{const core=window.FormatXLivingCore,gl=core.canvas.getContext('webgl2');return{...__gpuBudgetAudit,timerAvailable:!!gl.getExtension('EXT_disjoint_timer_query_webgl2'),canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,sameCanvas:core.canvas===document.querySelector('.fx-crystal-organism-r326-canvas'),vertexCount:core.vertexCount,gl:gl.getError(),overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),telemetry:Object.fromEntries(Object.entries(document.documentElement.dataset).filter(([k])=>k.startsWith('fxCoreGpu'))),resolution:{width:gl.drawingBufferWidth,height:gl.drawingBufferHeight}};});
   item.shaderHashes=item.actual.shaders.map(hash);delete item.actual.shaders;
   assert.equal(item.actual.contexts,1);assert.equal(item.actual.canvasCount,1);assert.equal(item.actual.sameCanvas,true);assert.equal(item.actual.vertexCount,6624);
   assert(item.actual.draws>0);assert.equal(item.actual.completed.length,1);assert(item.actual.trustedClicks>=1);
   assert.equal(item.actual.gl,0);assert.equal(item.actual.lost,0);assert.equal(item.actual.overflow,0);assert.deepEqual(item.actual.csp,[]);assert.deepEqual(item.errors,[]);
   assert.deepEqual(item.shaderHashes.slice(0,2),[mobile?'ec7eea99e6c145efa91b0fe30c4dd0f21aeb169f118cbfb1b6cb2924ef29f91a':'4df951d53bf20e9968c823993af312968a391f841ae3b820d8823adf85a34568','f61a6fa2c682aeb36b29c1613615ed5f8be0fddccf537f5081f01464db35420c']);
   if(item.actual.timerAvailable){
    assert(item.actual.resolved.length>=2,profile+': native adaptive quality must use multiple completed real GPU measurements');
    assert(item.actual.peakPending<=1,profile+': native GPU queries must remain bounded on the original context');
    assert(item.actual.resolved.every(x=>x.ended&&x.available&&x.disjoint===false&&Number.isFinite(x.gpuMs)&&x.gpuMs>=0&&x.width>0&&x.height>0),profile+': quality evidence must be actual available non-disjoint GPU time');
    const first=item.actual.resolved[0],last=item.actual.resolved.at(-1),t=item.actual.telemetry;
    assert.equal(t.fxCoreGpuStartupMsR2136,first.gpuMs.toFixed(3),'Keep the actual initialization cost visible');
    assert.equal(t.fxCoreGpuLastMsR2136,last.gpuMs.toFixed(3),'Telemetry must retain the exact real GPU measurement');
    assert.equal(t.fxCoreGpuSampleResolutionR2136,last.width+'x'+last.height,'Associate each completed sample with its actual backing store');
   }else{
    assert.equal(item.actual.queryCalls,0,'Unavailable timers retain the original renderer path');
    assert.equal(item.actual.resolved.length,0,'Do not invent GPU timings when the extension is absent');
   }
   item.pass=true;console.log('NATIVE_GPU_BUDGET_R2136_CASE_PASS '+JSON.stringify({profile,timerAvailable:item.actual.timerAvailable,completedSamples:item.actual.resolved.length,queryPeak:item.actual.peakPending,resolution:item.actual.resolution,contexts:item.actual.contexts,gl:item.actual.gl}));
  }catch(e){item.pass=false;item.failure=String(e.stack||e);console.error('NATIVE_GPU_BUDGET_R2136_CASE_FAIL '+JSON.stringify({profile,failure:item.failure}));}
  finally{write();await context.close();}
 }}finally{await browser.close();}
 assert(report.cases.every(x=>x.pass),'Native GPU accounting and unavailable-timer fallback must retain the actual MAG');
})().catch(e=>{write();console.error(e);process.exitCode=1;});

