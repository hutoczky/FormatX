'use strict';
/* R2364: measure actual native MAG boot/fence/first frame and main-thread
 * long tasks on real Chromium, not synthetic geometry timing or fake frames.
 * Diagnostic-only: does not mutate production renderer or relax P0/LHR.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const home=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const dir=process.env.FORMATX_MAG_BUDGET_DIR||'artifacts/r2364-mag-frame-budget';
fs.mkdirSync(dir,{recursive:true});
function observe(){
  Object.defineProperty(navigator,'webdriver',{get:()=>false});
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  const state=window.__magBudgetR2364={
    longTasks:[],firstNativeDraw:null,nativeContexts:0,nativeContextRequests:0,
    warmupAt:null,completionAt:null,beginAt:performance.now()
  };
  try{
    const observer=new PerformanceObserver(list=>{
      for(const entry of list.getEntries()){
        if(state.longTasks.length<180)
          state.longTasks.push({start:+entry.startTime.toFixed(2),
            duration:+entry.duration.toFixed(2),name:entry.name});
      }
    });
    observer.observe({type:'longtask',buffered:true});
  }catch(error){state.longTaskObserverUnavailable=String(error);}
  document.addEventListener('formatx:magbirthcorewarmup',
    ()=>{if(state.warmupAt===null)state.warmupAt=performance.now();},
    {capture:true});
  document.addEventListener('formatx:magbirthcomplete',
    ()=>{if(state.completionAt===null)state.completionAt=performance.now();},
    {capture:true});
  const knownNativeContexts=new WeakSet();
  const originalGetContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type){
    const gl=Reflect.apply(originalGetContext,this,arguments);
    if(gl&&/^webgl/.test(type)&&this.classList.contains('fx-crystal-organism-r326-canvas')){
      state.nativeContextRequests+=1;
      if(!knownNativeContexts.has(gl)){
        knownNativeContexts.add(gl);
        state.nativeContexts+=1;
      }
      window.__magBudgetNativeGL=gl;
    }
    return gl;
  };
  for(const name of ['WebGLRenderingContext','WebGL2RenderingContext']){
    const Type=window[name];
    if(!Type)continue;
    const original=Type.prototype.drawArrays;
    if(typeof original!=='function')continue;
    Type.prototype.drawArrays=function(mode,first,count){
      const start=performance.now();
      const result=Reflect.apply(original,this,arguments);
      if(state.firstNativeDraw===null&&this.canvas?.classList?.contains('fx-crystal-organism-r326-canvas')){
        state.firstNativeDraw={at:start,returnAt:performance.now(),
          vertices:count,canvasWidth:this.canvas.width,canvasHeight:this.canvas.height,
          underFilm:!!document.querySelector('.fx-mag-birth-r533')};
      }
      return result;
    };
  }
}
(async()=>{
  const report={sourceSha:process.env.GITHUB_SHA||process.env.AUDITED_SHA||null,
    title:'R2364 actual Chromium native MAG main-thread/GPU budget diagnostic',
    scope:'software/WebGL emulation, not Android device FPS certification',
    changedRuntime:false,thresholdsUnchanged:true,results:[]};
  for(const mobile of [false,true])for(let trial=1;trial<=3;trial++){
    const browser=await chromium.launch({
      executablePath:process.env.CHROME_BIN||undefined,
      headless:true,
      args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
    });
    let context;
    const item={profile:mobile?'mobile':'desktop',trial,ok:false};
    report.results.push(item);
    try{
      context=await browser.newContext({
        viewport:mobile?{width:390,height:844}:{width:1280,height:720},
        deviceScaleFactor:mobile?2:1,
        isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference',
        locale:'hu-HU',colorScheme:'dark'
      });
      await context.addInitScript(observe);
      const page=await context.newPage();
      const errors=[],networkFailures=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('requestfailed',r=>networkFailures.push({url:r.url(),failure:r.failure()?.errorText}));
      const url=new URL(home);
      url.searchParams.set('intro','1');
      await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>{
        const root=document.documentElement;
        return root.dataset.fxCrystalOrganismR326==='ready'&&
          root.dataset.fxCoreFirstFrameR1913==='painted'&&
          document.querySelectorAll('.fx-mag-birth-r533').length===0;
      },null,{timeout:45000});
      await page.waitForTimeout(300);
      const observation=await page.evaluate(()=>{
        const root=document.documentElement;
        const diag=window.__magBudgetR2364;
        const gl=window.__magBudgetNativeGL;
        const raw=root.dataset.fxMagBootPhasesR2241;
        let bootPhases=null;
        try{bootPhases=JSON.parse(raw||'null');}catch(_){}
        const tasks=diag.longTasks.slice().sort((a,b)=>b.duration-a.duration);
        const phase={
          beforeWarmup:0,warmupToCompletion:0,afterCompletion:0
        };
        for(const task of diag.longTasks){
          const block=Math.max(0,task.duration-50);
          if(diag.warmupAt!==null&&task.start<diag.warmupAt)phase.beforeWarmup+=block;
          else if(diag.completionAt!==null&&task.start>=diag.completionAt)phase.afterCompletion+=block;
          else phase.warmupToCompletion+=block;
        }
        const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const bounds=canvas?.getBoundingClientRect();
        return {
          phaseStartMs:diag.beginAt,
          firstDraw:diag.firstNativeDraw,
          warmupMs:diag.warmupAt,completionMs:diag.completionAt,
          nativeContexts:diag.nativeContexts,
          nativeContextRequests:diag.nativeContextRequests,
          bootPhases,
          gpuFenceMs:Number(root.dataset.fxMagHandoffGpuMsR2226||NaN),
          gpuState:root.dataset.fxMagHandoffGpuR2226||null,
          gpuPolicy:root.dataset.fxMagReadbackPolicyR2264||null,
          nativeFirstFrame:root.dataset.fxCoreFirstFrameR1913||null,
          hiddenFramesSkipped:Number(root.dataset.fxMagHiddenFramesSkippedR2261||0),
          canvas:bounds?{width:bounds.width,height:bounds.height,
             pixelWidth:canvas.width,pixelHeight:canvas.height}:null,
          glError:gl?gl.getError():null,
          contextLost:gl?gl.isContextLost():null,
          longTaskCount:diag.longTasks.length,
          totalObservedBlockingMs:+diag.longTasks.reduce((v,t)=>v+Math.max(0,t.duration-50),0).toFixed(2),
          blockingByFilmPhase:Object.fromEntries(
            Object.entries(phase).map(([k,v])=>[k,+v.toFixed(2)])),
          topLongTasks:tasks.slice(0,14),
          observerUnavailable:diag.longTaskObserverUnavailable||null
        };
      });
      Object.assign(item,{observation,errors,networkFailures,ok:true});
      assert.deepEqual(errors,[],'No runtime JS errors');
      assert.deepEqual(networkFailures,[],'No failed resource requests');
      assert.equal(observation.nativeContexts,1,'Must preserve one original WebGL context owner');
      assert.equal(observation.glError,0,'Real native WebGL error');
      assert.equal(observation.contextLost,false,'Lost native context');
      assert.equal(observation.nativeFirstFrame,'painted','Real MAG first frame required');
      assert(observation.firstDraw?.vertices>0,'No real native GPU draw');
      assert(observation.bootPhases?.vertices>0,'Native geometry telemetry missing');
      assert(observation.warmupMs!==null,'Real cinematic warmup missing');
      assert(observation.completionMs!==null,'Original 10s film did not complete');
      console.log('R2364_MAG_ACTUAL_CHROME_BUDGET_SAMPLE',JSON.stringify(item));
    }catch(error){
      item.ok=false;
      item.error=String(error.stack||error);
      console.error('R2364_MAG_BUDGET_FAIL',JSON.stringify(item));
    }finally{
      await context?.close().catch(()=>{});
      await browser.close().catch(()=>{});
    }
  }
  fs.writeFileSync(dir+'/report.json',JSON.stringify(report,null,2)+'\n');
  const passed=report.results.filter(r=>r.ok).length;
  console.log('R2364_MAG_BUDGET_SUMMARY',JSON.stringify({
    passed,total:report.results.length,
    samples:report.results.map(r=>({profile:r.profile,trial:r.trial,ok:r.ok,
      geometryMs:r.observation?.bootPhases?.geometryMs,
      shaderMs:r.observation?.bootPhases?.shaderMs,
      uploadMs:r.observation?.bootPhases?.uploadMs,
      gpuFenceMs:r.observation?.gpuFenceMs,
      blockingMs:r.observation?.totalObservedBlockingMs}))}));
  if(passed!==report.results.length)process.exitCode=1;
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
