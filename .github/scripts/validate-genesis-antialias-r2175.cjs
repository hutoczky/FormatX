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
     // Observe the actual owner returned to R533 without changing its frame,
     // clock, renderer selection, readiness, or geometry.
     let owner;
     Object.defineProperty(window,'FormatXMagGenesisThreeR1280',{
      configurable:true,get:()=>owner,set(value){
       const attach=value.attach;
       value.attach=async function(...args){
        const result=await Reflect.apply(attach,this,args);
        if(result?.engine)window.__genesisDnaEngine=result.engine;
        return result;
       };
       owner=value;
      }
     });
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
     let coherence=null;
     const engine=window.__genesisDnaEngine;
     if(root.dataset.fxMagBirthPhase==='0'&&engine){
      const T=engine.THREE,points=engine.genomeParticles.geometry.attributes.position;
      const founding=engine.dnas.find(h=>h.userData.primary),material=engine.genomeParticleMaterial;
      const program=engine.renderer.properties.get(material).currentProgram?.program;
      const location=program?gl.getUniformLocation(program,'uDnaMatrix'):null;
      const uploaded=location?Array.from(gl.getUniform(program,location)):null;
      const matrix=uploaded?new T.Matrix4().fromArray(uploaded):new T.Matrix4();
      let maxDistance=0,sumDistance=0,samples=0;
      for(let station=0;station<64;station++){
       for(let strand=0;strand<2;strand++){
        const index=Math.round(station/63*(points.count/2-1))*2+strand;
        const u=Math.floor(index/2)/(points.count/2-1);
        const actual=new T.Vector3().fromBufferAttribute(points,index).applyMatrix4(matrix);
        const path=founding.children[strand?3:2].geometry.parameters.path;
        const target=path.getPoint(u).applyMatrix4(founding.matrix);
        const distance=actual.distanceTo(target);
        maxDistance=Math.max(maxDistance,distance);sumDistance+=distance;samples++;
       }
      }
      coherence={samples,maxDistance,meanDistance:sumDistance/samples,
       uploadedMatrix:uploaded,matrixError:uploaded?Math.max(...uploaded.map((v,i)=>Math.abs(v-founding.matrix.elements[i]))):null,
       surfaceWidth:engine.bioticSurfaceTexture?.image.width,
       surfaceHeight:engine.bioticSurfaceTexture?.image.height,
       sharedSurface:founding.children[2].material.bumpMap===engine.bioticSurfaceTexture&&engine.embryoMaterial.bumpMap===engine.bioticSurfaceTexture};
     }
     return{coherence,requests:window.__genesisAA.requests,renderer:root.dataset.fxMagBirthRendererR1360,phase:root.dataset.fxMagBirthPhase,peak:root.dataset.fxMagBirthFramePeakR1557,litPixels:root.dataset.fxMagBirthThreeLitPixelsR2146,armor:root.dataset.fxMagBirthVisibleArmorR2147,eye:root.dataset.fxMagBirthEyeOpacityR2148,genome:root.dataset.fxMagBirthGenomeParticlesR2160,attributes:gl?.getContextAttributes(),samples:gl?.getParameter(gl.SAMPLES),width:cv?.width,height:cv?.height,canvases:document.querySelectorAll('.fx-mag-birth-r533 canvas.fxb-particles').length,glError:gl?.getError(),contextLost:gl?.isContextLost()};
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
    if(chapter==='dna'){
     assert.equal(Number(state.armor),0);
     assert.equal(state.coherence?.samples,128,'Actual phosphate paths must be sampled');
     assert.equal(state.coherence?.uploadedMatrix?.length,16,'GPU must receive the live DNA pose');
     assert(state.coherence.matrixError<1e-6,'GPU DNA pose differs from the photographed helix');
     assert(state.coherence.maxDistance<.012,'GPU nucleotides drift away from their physical DNA strands');
     assert.equal(state.coherence.surfaceWidth,256);assert.equal(state.coherence.surfaceHeight,128);
     assert.equal(state.coherence.sharedSurface,true,'DNA and biological membrane lost their shared microscopic relief');
    }
    if(chapter==='mag'){assert(Number(state.armor)>=5);assert(Number(state.eye)>.07&&Number(state.eye)<.25);}
    record.pass=true;
   }catch(error){record.pass=false;record.error=error.message;}
   finally{report.cases.push(record);console.log('GENESIS_ANTIALIAS',JSON.stringify(record));await context.close();}
  }
  assert(report.cases.every(c=>c.pass),'Every unchanged-budget cinematic antialias case must pass');
 }finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
