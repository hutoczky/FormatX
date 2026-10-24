'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const out=process.env.FORMATX_GENESIS_AA_DIR||'artifacts/genesis-antialias-r2175';
// Fixed visual frames exercise the genuine Three default framebuffer. These
// observations are not normal-clock, hardware-GPU or frame-rate certification.
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),visualFramesOnly:true,notNormalClockOrHardwareOrFpsCertification:true,cases:[]};
 try{
  const cases=[[390,844,'dna',1.6],[390,844,'embryo',4.2],[390,844,'mag',8.3],[430,932,'dna',1.6],[430,932,'mag',8.3],[1440,900,'dna',1.6],[1440,900,'mag',8.3]];
  for(const [width,height,chapter,seconds]of cases){
   const mobile=width<901,label=width+'-'+chapter,context=await browser.newContext({viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference'});
   let record={label,seconds};
   try{
    await context.addInitScript(()=>{
     const get=HTMLCanvasElement.prototype.getContext,ids=new WeakMap();let next=0;
     window.__genesisAA={requests:[]};
     HTMLCanvasElement.prototype.getContext=function(type,options){
      const gl=Reflect.apply(get,this,arguments);
      if(gl&&/^webgl/.test(type)&&this.classList.contains('fxb-particles')){
       if(!ids.has(gl))ids.set(gl,++next);
       window.__genesisAA.requests.push({id:ids.get(gl),type,antialias:options?.antialias});window.__genesisAAGL=gl;
      }
      return gl;
     };
    });
    const page=await context.newPage(),errors=[],failedRequests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
    const url=new URL(base);url.searchParams.set('intro','1');url.searchParams.set('visualintro','1');url.searchParams.set('introframe',String(seconds));
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>document.documentElement.dataset.fxMagBirthVisualFrameR659==='ready',null,{timeout:35000});
    const state=await page.evaluate(()=>{
     const root=document.documentElement,gl=window.__genesisAAGL,cv=gl?.canvas;
     return{requests:window.__genesisAA.requests,renderer:root.dataset.fxMagBirthRendererR1360,phase:root.dataset.fxMagBirthPhase,peak:root.dataset.fxMagBirthFramePeakR1557,litPixels:root.dataset.fxMagBirthThreeLitPixelsR2146,armor:root.dataset.fxMagBirthVisibleArmorR2147,eye:root.dataset.fxMagBirthEyeOpacityR2148,genome:root.dataset.fxMagBirthGenomeParticlesR2160,attributes:gl?.getContextAttributes(),samples:gl?.getParameter(gl.SAMPLES),width:cv?.width,height:cv?.height,canvases:document.querySelectorAll('.fx-mag-birth-r533 canvas.fxb-particles').length,glError:gl?.getError(),contextLost:gl?.isContextLost()};
    });
    record={...record,...state,errors,failedRequests};
    await page.screenshot({path:path.join(out,label+'.png')});
    assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);assert.equal(state.renderer,'threejs-active');
    assert.equal(state.canvases,1);assert.equal(new Set(state.requests.map(r=>r.id)).size,1);
    assert.equal(state.glError,0);assert.equal(state.contextLost,false);
    const dpr=mobile?1.15:1;assert.equal(state.width,Math.floor(width*dpr));assert.equal(state.height,Math.floor(height*dpr));
    assert(Number(state.peak)>35&&Number(state.litPixels)>1);assert(Number(state.genome)>=1000);
    assert.equal(state.attributes?.antialias,true,'The actual cinematic context must retain antialiasing on mobile');
    assert(state.samples>0,'The real default framebuffer must contain multisample coverage');
    if(chapter==='dna')assert.equal(Number(state.armor),0);
    if(chapter==='mag'){assert(Number(state.armor)>=5);assert(Number(state.eye)>.07&&Number(state.eye)<.25);}
    record.pass=true;
   }catch(error){record.pass=false;record.error=error.message;}
   finally{report.cases.push(record);console.log('GENESIS_ANTIALIAS',JSON.stringify(record));await context.close();}
  }
  assert(report.cases.every(c=>c.pass),'Every unchanged-budget cinematic antialias case must pass');
 }finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
