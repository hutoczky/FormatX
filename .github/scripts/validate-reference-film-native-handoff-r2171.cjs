'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const home=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=process.env.FORMATX_HANDOFF_EVIDENCE_DIR||'artifacts/reference-film-native-handoff-r2171';

// This is a controlled four-core reference-film capability case. It observes
// the real clock and native draw submission; it does not pin film frames,
// request a skip or certify the normal intro-duration / GPU cadence targets.
function observeHandoff(){
  Object.defineProperty(navigator,'webdriver',{get:()=>false});
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  const data=window.__referenceHandoff={contexts:[],firstDraw:null,warmup:null,completions:[]};
  const ids=new WeakMap();let nextId=0;
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type){
    const gl=Reflect.apply(getContext,this,arguments);
    if(gl&&/^webgl/.test(type)){
      if(!ids.has(gl))ids.set(gl,++nextId);
      data.contexts.push({at:performance.now(),id:ids.get(gl),native:this.classList.contains('fx-crystal-organism-r326-canvas')});
      if(this.classList.contains('fx-crystal-organism-r326-canvas'))window.__referenceNativeGL=gl;
    }
    return gl;
  };
  for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
    if(!Type)continue;
    const original=Type.prototype.drawArrays;
    Type.prototype.drawArrays=function(mode,first,count){
      const value=Reflect.apply(original,this,arguments);
      if(!data.firstDraw&&this.canvas?.classList.contains('fx-crystal-organism-r326-canvas')){
        data.firstDraw={at:performance.now(),count,contextId:ids.get(this),connected:this.canvas.isConnected,underFilm:!!document.querySelector('.fx-mag-birth-r533'),width:this.canvas.width,height:this.canvas.height};
      }
      return value;
    };
  }
  document.addEventListener('formatx:magbirthcorewarmup',()=>{data.warmup=performance.now();},{once:true,capture:true});
  document.addEventListener('formatx:magbirthcomplete',event=>{data.completions.push({at:performance.now(),source:event.detail?.source});},{capture:true});
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),capabilityFixture:'four-core 8GB reference film',realClock:true,notIntroDurationOrFpsCertification:true,cases:[]};
  try{
    for(const [mobile,reduced]of [[false,false],[true,false],[true,true]]){
      const profile=(mobile?'mobile':'desktop')+(reduced?'-reduced':'-normal');
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:reduced?'reduce':'no-preference',userAgent:mobile?'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'});
      try{
        await context.addInitScript(observeHandoff);
        const page=await context.newPage(),errors=[],failedRequests=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
        await page.goto(home,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>window.__referenceHandoff?.completions.length>0&&window.__referenceHandoff.firstDraw,null,{timeout:45000});
        const result=await page.evaluate(()=>({observation:window.__referenceHandoff,renderer:document.documentElement.dataset.fxMagBirthRendererR1360,nativeCanvases:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,overlays:document.querySelectorAll('.fx-mag-birth-r533').length,glError:window.__referenceNativeGL?.getError(),contextLost:window.__referenceNativeGL?.isContextLost()}));
        const record={profile,...result,errors,failedRequests};report.cases.push(record);
        console.log('REFERENCE_FILM_NATIVE_HANDOFF',JSON.stringify(record));
        assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
        assert.equal(result.renderer,'native-canvas-reference-film');
        assert.equal(result.nativeCanvases,1);assert.equal(result.overlays,0);
        assert.equal(result.glError,0);assert.equal(result.contextLost,false);
        assert.equal(result.observation.completions.length,1);
        assert.equal(new Set(result.observation.contexts.map(c=>c.id)).size,1,'Reference film must leave a single WebGL context owner');
        const first=result.observation.firstDraw,complete=result.observation.completions[0];
        assert(first.connected&&first.underFilm&&first.count>0&&first.width>2&&first.height>2,'The actual native MAG must draw under the still-mounted film');
        assert(first.at<complete.at,'The native MAG must submit its first frame before the film is removed');
      }finally{await context.close();}
    }
  }finally{await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
