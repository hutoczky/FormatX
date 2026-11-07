'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const home=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=process.env.FORMATX_RETIRED_INTRO_EVIDENCE_DIR||'artifacts/intro-retired-layout-r2173';

function observe(){
  Object.defineProperty(navigator,'webdriver',{get:()=>false});
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  const data=window.__retiredIntro={completed:null,targetReads:[],detachedFilmContexts:[],firstDraw:null,contexts:[]};
  document.addEventListener('formatx:magbirthcomplete',()=>{data.completed=performance.now();},{capture:true,once:true});
  const rect=Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect=function(){
    const start=performance.now(),result=Reflect.apply(rect,this,arguments);
    if((this.classList?.contains('fx-crystal-organism-r326-stage')||this.classList?.contains('hero-space'))&&
       String(new Error().stack).includes('formatx-mag-birth-live-r533.js')){
      data.targetReads.push({start,end:performance.now(),afterCompletion:data.completed!==null,connected:this.isConnected,width:result.width,height:result.height});
    }
    return result;
  };
  const getContext=HTMLCanvasElement.prototype.getContext;
  const ids=new WeakMap();let nextId=0;
  HTMLCanvasElement.prototype.getContext=function(type){
    const gl=Reflect.apply(getContext,this,arguments);
    if(data.completed!==null&&!this.isConnected&&this.classList.contains('fxb-particles'))data.detachedFilmContexts.push({at:performance.now(),type});
    if(gl&&/^webgl/.test(type)&&this.classList.contains('fx-crystal-organism-r326-canvas')){
      if(!ids.has(gl))ids.set(gl,++nextId);
      data.contexts.push(ids.get(gl));window.__retiredNativeGL=gl;
    }
    return gl;
  };
  for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
    if(!Type)continue;
    const original=Type.prototype.drawArrays;
    Type.prototype.drawArrays=function(mode,first,count){
      const result=Reflect.apply(original,this,arguments);
      if(!data.firstDraw&&this.canvas?.classList.contains('fx-crystal-organism-r326-canvas'))data.firstDraw={at:performance.now(),count,contextId:ids.get(this)};
      return result;
    };
  }
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),realCompletionAndViewportResize:true,cases:[]};
  try{
    for(const mobile of [false,true]){
      const profile=mobile?'mobile':'desktop';
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference',userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'});
      try{
        await context.addInitScript(observe);
        const page=await context.newPage(),errors=[],failedRequests=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
        await page.goto(home,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>document.documentElement.dataset.fxMagBirthPhase==='2',null,{timeout:15000});
        const before=await page.evaluate(()=>window.__retiredIntro.targetReads.length);
        await page.setViewportSize(mobile?{width:430,height:932}:{width:1365,height:960});
        await page.waitForFunction(n=>window.__retiredIntro.targetReads.length>n,before,{timeout:2000});
        await page.waitForFunction(()=>window.__retiredIntro.completed!==null&&window.__retiredIntro.firstDraw&&document.querySelectorAll('.fx-mag-birth-r533').length===0,null,{timeout:45000});
        const canvas=await page.locator('.fx-crystal-organism-r326-canvas').elementHandle();
        await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:900});
        await page.waitForTimeout(220);
        await page.setViewportSize(mobile?{width:430,height:932}:{width:1365,height:960});
        await page.waitForTimeout(220);
        const result=await page.evaluate(()=>({observation:window.__retiredIntro,nativeCanvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,overlays:document.querySelectorAll('.fx-mag-birth-r533').length,renderer:document.documentElement.dataset.fxMagBirthRendererR1360,glError:window.__retiredNativeGL?.getError(),contextLost:window.__retiredNativeGL?.isContextLost()}));
        result.sameCanvas=await canvas.evaluate(node=>node.isConnected&&node===document.querySelector('.fx-crystal-organism-r326-canvas'));
        const record={profile,...result,errors,failedRequests};report.cases.push(record);
        console.log('INTRO_RETIRED_LAYOUT',JSON.stringify(record));
        assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
        assert.equal(result.glError,0);assert.equal(result.contextLost,false);
        assert.equal(result.nativeCanvases,1);assert.equal(result.overlays,0);assert(result.sameCanvas);
        assert.equal(new Set(result.observation.contexts).size,1);
        assert(result.observation.firstDraw.count>0);
        assert(result.observation.targetReads.some(r=>!r.afterCompletion),'Active birth must still follow real resized stage geometry');
        assert.deepEqual(result.observation.detachedFilmContexts,[],'Completed intro must not acquire another detached film context');
        assert.deepEqual(result.observation.targetReads.filter(r=>r.afterCompletion),[],'Retired intro still forces geometry/layout work after the real completion event');
      }finally{await context.close();}
    }
  }finally{await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
