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
     window.__genesisLivingOpticPrograms=[];
     // Observe the actual owner returned to R533 without changing its frame,
     // clock, renderer selection, readiness, or geometry.
     let owner;
     Object.defineProperty(window,'FormatXMagGenesisThreeR1280',{
      configurable:true,get:()=>owner,set(value){
       const attach=value.attach;
       value.attach=async function(...args){
        const result=await Reflect.apply(attach,this,args);
        if(result?.engine){
         const engine=result.engine;window.__genesisDnaEngine=engine;
         // Observe the real body draw after Three has uploaded its material.
         // No substituted shader, additional draw, clock or render request.
         const body=engine.mechBody,after=body.onAfterRender;
         body.onAfterRender=function(renderer){
          const gl=renderer.getContext(),program=gl.getParameter(gl.CURRENT_PROGRAM);
          const diffuse=gl.getUniform(program,gl.getUniformLocation(program,'diffuse'));
          const pointLights=[];
          engine.scene.traverseVisible(object=>{if(object.isPointLight&&object.layers.test(engine.camera.layers))pointLights.push(object);});
          const keyIndex=pointLights.indexOf(engine.mechLight);
          const keyUniform=keyIndex<0?null:gl.getUniform(program,gl.getUniformLocation(program,'pointLights['+keyIndex+'].color'));
          window.__genesisMetalDraw={diffuse:Array.from(diffuse),keyIndex,keyColor:keyUniform?Array.from(keyUniform):null,draws:(window.__genesisMetalDraw?.draws||0)+1};
          return Reflect.apply(after,this,arguments);
         };
        }
        return result;
       };
       owner=value;
      }
     });
     HTMLCanvasElement.prototype.getContext=function(type,options){
      const gl=Reflect.apply(get,this,arguments);
      if(gl&&/^webgl/.test(type)&&this.classList.contains('fxb-particles')){
       if(!ids.has(gl)){
        ids.set(gl,++next);
        // Observe linked programs and actual draws on the existing film GL.
        // This proof never substitutes shaders, uniforms, geometry or time.
        const link=gl.linkProgram,use=gl.useProgram,
         arrays=gl.drawArrays,elements=gl.drawElements,programs=new WeakMap();
        let active=null;
        gl.linkProgram=function(program){
         const result=Reflect.apply(link,this,arguments);
         const fragment=(gl.getAttachedShaders(program)||[])
          .filter(shader=>gl.getShaderParameter(shader,gl.SHADER_TYPE)===gl.FRAGMENT_SHADER)
          .map(shader=>gl.getShaderSource(shader)||'').join('\n');
         if(fragment.includes('void fxLivingMagCell(')){
          const record={program,linked:gl.getProgramParameter(program,gl.LINK_STATUS),draws:0,
           physicalEmission:fragment.includes('totalEmissiveRadiance+=fxCellRadiance*1.35;')};
          programs.set(program,record);window.__genesisLivingOpticPrograms.push(record);
         }
         return result;
        };
        gl.useProgram=function(program){const result=Reflect.apply(use,this,arguments);active=program;return result;};
        gl.drawArrays=function(){const result=Reflect.apply(arrays,this,arguments);const record=programs.get(active);if(record)record.draws++;return result;};
        gl.drawElements=function(){const result=Reflect.apply(elements,this,arguments);const record=programs.get(active);if(record)record.draws++;return result;};
       }
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
     let continuity=null;
     const engine=window.__genesisDnaEngine;
     if(root.dataset.fxMagBirthPhase==='0'&&engine){
      const T=engine.THREE,g=engine.genomeParticles.geometry;
      const initial=g.attributes.position,cell=g.attributes.aCell,arm=g.attributes.aArm;
      const armIndex=g.attributes.aArmIndex,seed=g.attributes.aSeed;
      let maxCellPair=0,minArmPair=Infinity,maxArmPair=0,pairedArmMismatches=0,
       strandPaletteMismatches=0,samples=0;
      const arms=new Set();
      for(let station=0;station<64;station++){
       const pair=Math.round(station/63*(initial.count/2-1)),a=pair*2,b=a+1;
       maxCellPair=Math.max(maxCellPair,
        new T.Vector3().fromBufferAttribute(cell,a).distanceTo(
         new T.Vector3().fromBufferAttribute(cell,b)));
       const armPair=new T.Vector3().fromBufferAttribute(arm,a).distanceTo(
        new T.Vector3().fromBufferAttribute(arm,b));
       minArmPair=Math.min(minArmPair,armPair);maxArmPair=Math.max(maxArmPair,armPair);
       if(armIndex.getX(a)!==armIndex.getX(b))pairedArmMismatches++;
       if(!(seed.getX(a)<.5&&seed.getX(b)>.5))strandPaletteMismatches++;
       arms.add(armIndex.getX(a));samples++;
      }
      continuity={samples,maxCellPair,minArmPair,maxArmPair,pairedArmMismatches,
       strandPaletteMismatches,armCoverage:[...arms].sort(),
       attributes:{initial:initial.count,cell:cell.count,arm:arm.count}};
     }
     const livingOptic=(window.__genesisLivingOpticPrograms||[]).map(record=>({
      linked:record.linked,draws:record.draws,physicalEmission:record.physicalEmission,
      time:gl.getUniform(record.program,gl.getUniformLocation(record.program,'uTime')),
      energy:gl.getUniform(record.program,gl.getUniformLocation(record.program,'uEnergy'))
     }));
     const metals=engine?['mechMaterial','mechMidMaterial','silverMaterial'].map(name=>({name,color:engine[name].color.toArray()})):[];
     const opticalKey=engine?{color:engine.mechLight.color.toArray(),intensity:engine.mechLight.intensity,distance:engine.mechLight.distance,decay:engine.mechLight.decay}:null;
     return{continuity,livingOptic,metals,opticalKey,metalDraw:window.__genesisMetalDraw||null,opticOpacity:engine?.mechEyeCore?.material?.opacity,
      opticGeometry:engine?{positions:engine.mechEyeCore.geometry.attributes.position.count,indices:engine.mechEyeCore.geometry.index.count}:null,
      renderInfo:engine?{calls:engine.renderer.info.render.calls,programs:engine.renderer.info.programs.length,textures:engine.renderer.info.memory.textures}:null,
      requests:window.__genesisAA.requests,renderer:root.dataset.fxMagBirthRendererR1360,phase:root.dataset.fxMagBirthPhase,peak:root.dataset.fxMagBirthFramePeakR1557,litPixels:root.dataset.fxMagBirthThreeLitPixelsR2146,armor:root.dataset.fxMagBirthVisibleArmorR2147,eye:root.dataset.fxMagBirthEyeOpacityR2148,genome:root.dataset.fxMagBirthGenomeParticlesR2160,attributes:gl?.getContextAttributes(),samples:gl?.getParameter(gl.SAMPLES),width:cv?.width,height:cv?.height,canvases:document.querySelectorAll('.fx-mag-birth-r533 canvas.fxb-particles').length,glError:gl?.getError(),contextLost:gl?.isContextLost()};
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
     assert.equal(state.continuity?.samples,64,'The actual paired genome must be sampled');
     assert.equal(state.continuity.pairedArmMismatches,0,'A DNA pair split across MAG arms');
     assert.equal(state.continuity.strandPaletteMismatches,0,'Cyan/violet strand identity was lost');
     assert.deepEqual(state.continuity.armCoverage,[0,1,2,3],'All four MAG arms need paired DNA');
     assert(state.continuity.maxCellPair<.04,'A DNA pair separated inside the living nucleus');
     assert(state.continuity.minArmPair>.05&&state.continuity.maxArmPair<.10,
      'Paired coils no longer seat around one titanium arm');
     assert.equal(state.continuity.attributes.initial,Number(state.genome));
     assert.equal(state.continuity.attributes.cell,Number(state.genome));
     assert.equal(state.continuity.attributes.arm,Number(state.genome));
    }
    if(chapter==='dna'||chapter==='embryo')assert.equal(state.opticOpacity,0,'The MAG optic must remain dark before metal assembly');
    if(chapter==='mag'){
     assert.equal(state.metals.length,3);
     for(const metal of state.metals){
      const [r,g,b]=metal.color;
      assert(Math.abs(r-g)<1e-8&&Math.abs(g-b)<1e-8,'The actual animated '+metal.name+' must stay neutral silver');
     }
     assert(state.metalDraw?.draws>0,'The actual chassis draw must be observed');
     const [red,green,blue]=state.metalDraw.diffuse;
     assert(Math.abs(red-green)<1e-6&&Math.abs(green-blue)<1e-6,'The actual WebGL chassis diffuse uniform must stay neutral');
     const key=state.opticalKey;
     assert(key&&key.intensity>0);assert.equal(key.distance,4.2);assert.equal(key.decay,2);
     assert(Math.abs(key.color[0]-key.color[1])<1e-8&&Math.abs(key.color[1]-key.color[2])<1e-8,'The existing physical key must be neutral');
     const keyDraw=state.metalDraw.keyColor;
     assert(keyDraw&&keyDraw.every(channel=>channel>.01),'The actual local key uniform must illuminate the chassis draw');
     assert(Math.abs(keyDraw[0]-keyDraw[1])<1e-6&&Math.abs(keyDraw[1]-keyDraw[2])<1e-6,'The actual linked physical key must be neutral');
     assert(Math.abs(keyDraw[0]-key.color[0]*key.intensity)<1e-4,'The observed light slot must be the existing local optical key');
     assert(Number(state.armor)>=5);assert(Number(state.eye)>.07&&Number(state.eye)<.25);
     assert.deepEqual(state.opticGeometry,{positions:1225,indices:6624},'The original physical lens geometry must stay unchanged');
     assert(state.opticOpacity>.9,'The existing physical lens must wake after arm seating');
     assert(state.livingOptic.some(program=>program.linked&&program.draws>0&&program.physicalEmission&&program.time>0&&program.energy>.45&&program.energy<=.5),
      'The actual linked Three.js living-cell lens program must draw with the original real film clock');
    }
    record.pass=true;
   }catch(error){record.pass=false;record.error=error.message;}
   finally{report.cases.push(record);console.log('GENESIS_ANTIALIAS',JSON.stringify(record));await context.close();}
  }
  assert(report.cases.every(c=>c.pass),'Every unchanged-budget cinematic antialias case must pass');
 }finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
