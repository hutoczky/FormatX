'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {PNG}=require('pngjs');

const ORIGIN=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4173/scifi-ui/';
const OUT=process.env.FORMATX_CAPTURE_DIR||'artifacts/r528-canonical-mag';
const CANVAS='#hero .fx-crystal-organism-r326-canvas';
const STAGE='#hero .fx-crystal-organism-r326-stage';
fs.mkdirSync(OUT,{recursive:true});

function instrument(){
  const audit=window.__r528VisualAudit={frames:0,maximumPhase:-1,phases:[],events:[]};
  const names=new WeakMap();
  const states=new WeakMap();
  const stateFor=gl=>{if(!states.has(gl))states.set(gl,{layer:-1,phase:-1,depthWrite:true});return states.get(gl);};
  addEventListener('formatx:coresurfacesweep',event=>audit.events.push({...event.detail,at:performance.now()}));
  for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
    if(!Type)continue;
    const proto=Type.prototype;
    const getUniformLocation=proto.getUniformLocation;
    const uniform1f=proto.uniform1f;
    const depthMask=proto.depthMask;
    const drawArrays=proto.drawArrays;
    proto.getUniformLocation=function(program,name){const location=getUniformLocation.call(this,program,name);if(location)names.set(location,name);return location;};
    proto.uniform1f=function(location,value){
      if(Number.isFinite(window.__r528CapturePhase)){
        const fixed={uSurfacePulse:window.__r528CapturePhase,uTime:0,uEnergy:.5,uBreath:.12};
        const key=names.get(location);if(Object.hasOwn(fixed,key))value=fixed[key];
      }
      const state=stateFor(this);if(names.get(location)==='uLayer')state.layer=value;if(names.get(location)==='uSurfacePulse')state.phase=value;
      return uniform1f.call(this,location,value);
    };
    proto.depthMask=function(enabled){stateFor(this).depthWrite=enabled;return depthMask.call(this,enabled);};
    proto.drawArrays=function(...args){
      const result=drawArrays.apply(this,args);const state=stateFor(this);
      if(this.canvas?.matches(CANVAS)&&state.layer===0&&state.depthWrite){
        audit.frames++;audit.maximumPhase=Math.max(audit.maximumPhase,state.phase);
        if(state.phase>=0){audit.phases.push(state.phase);if(audit.phases.length>180)audit.phases.shift();}
      }
      return result;
    };
  }
}

async function capture(page,name,label,phase){
  const frameBefore=await page.evaluate(()=>window.__r528VisualAudit.frames);
  const wasSuspended=await page.evaluate(phase=>{
    const core=window.FormatXCoreMobileV69;
    const previous=Boolean(core?.lifecycleSuspended);
    window.__r528CapturePhase=phase;
    core?.setLifecycleSuspended?.(false,'r528-validator-capture');
    core?.requestRender?.(1);
    return previous;
  },phase);
  await page.waitForFunction(before=>window.__r528VisualAudit.frames>before,frameBefore,{timeout:3000});
  await page.waitForTimeout(80);
  const locator=page.locator(CANVAS).first();
  const buffer=await locator.screenshot({animations:'allow',timeout:10000});
  fs.writeFileSync(path.join(OUT,`${name}-${label}.png`),buffer);
  if(wasSuspended)await page.evaluate(()=>window.FormatXCoreMobileV69?.setLifecycleSuspended?.(true,'r528-validator-restore'));
  const png=PNG.sync.read(buffer);const grid=[];
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const px=Math.min(png.width-1,Math.floor((x+.5)*png.width/64));
    const py=Math.min(png.height-1,Math.floor((y+.5)*png.height/64));
    const i=(py*png.width+px)*4;grid.push(.2126*png.data[i]+.7152*png.data[i+1]+.0722*png.data[i+2]);
  }
  return{phase,grid,mean:grid.reduce((a,b)=>a+b,0)/grid.length,maximum:Math.max(...grid),coverage:grid.filter(v=>v>20).length/grid.length};
}

function difference(a,b){
  let energy=0,changed=0,weightedY=0;
  b.grid.forEach((value,index)=>{const delta=Math.abs(value-a.grid[index]);if(delta>4){changed++;energy+=delta;weightedY+=delta*Math.floor(index/64);}});
  return{energy,changed,centroidY:weightedY/Math.max(1,energy)};
}

async function verify(browser,name,viewport,mobile){
  const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference'});
  await context.addInitScript(instrument);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const report={name,viewport,mobile};
  try{
    const url=new URL(ORIGIN);url.searchParams.set('r528-canonical-visual',`${name}-${Date.now()}`);
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'&&window.FormatXCoreMobileV69?.renderer==='single-webgl-crystal-organism-r326',null,{timeout:20000});
    const state=await page.evaluate(({CANVAS,STAGE})=>{
      const root=document.documentElement,canvas=document.querySelector(CANVAS),gl=canvas?.getContext('webgl2')||canvas?.getContext('webgl');
      const rect=canvas?.getBoundingClientRect();return{
        canvasCount:document.querySelectorAll(CANVAS).length,stageCount:document.querySelectorAll(STAGE).length,
        pauseCount:document.querySelectorAll('#hero .fx-reference-pause').length,
        renderer:root.dataset.fxCoreRenderer||'',contract:root.dataset.fxMagProductContractR528||'',
        lifecycle:root.dataset.fxCoreLifecycleR528||'',overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
        visible:Boolean(rect&&rect.width>120&&rect.height>180),glError:gl?gl.getError():-1
      };
    },{CANVAS,STAGE});
    report.state=state;
    assert.equal(state.canvasCount,1,`${name}: canvas owner is not singular`);assert.equal(state.stageCount,1,`${name}: stage owner is not singular`);
    assert.equal(state.pauseCount,0,`${name}: obsolete manual PAUSE returned`);assert.equal(state.renderer,'single-webgl-crystal-organism-r326',`${name}: renderer owner invalid`);
    assert.equal(state.contract,'living-core-continuous-normal-motion',`${name}: product contract marker invalid`);assert.ok(state.visible,`${name}: MAG is not visible`);
    assert.ok(state.overflow<=2,`${name}: horizontal overflow ${state.overflow}`);assert.equal(state.glError,0,`${name}: WebGL error`);

    await page.waitForFunction(()=>window.__r528VisualAudit.events.some(e=>e.phase==='end'&&e.source==='autonomous'),null,{timeout:18000});
    const audit=await page.evaluate(()=>window.__r528VisualAudit);report.audit=audit;
    assert.ok(audit.phases.length>=3&&audit.maximumPhase>.5,`${name}: autonomous surface motion did not progress`);

    await page.locator(CANVAS).evaluate(canvas=>canvas.getAnimations().forEach(animation=>animation.pause()));
    report.captures={};
    report.captures.idle=await capture(page,name,'idle',-1);
    report.captures.early=await capture(page,name,'surface-early',.38);
    report.captures.late=await capture(page,name,'surface-late',.68);
    await page.evaluate(()=>{delete window.__r528CapturePhase;});
    await page.locator(CANVAS).evaluate(canvas=>canvas.getAnimations().forEach(animation=>animation.play()));
    assert.ok(report.captures.idle.maximum>60&&report.captures.idle.coverage>.02,`${name}: resting MAG is blank/dim`);
    report.earlyDifference=difference(report.captures.idle,report.captures.early);
    report.lateDifference=difference(report.captures.idle,report.captures.late);
    assert.ok(report.earlyDifference.changed>=8&&report.lateDifference.changed>=8,`${name}: surface energy is not visibly distinct`);
    assert.ok(Math.abs(report.lateDifference.centroidY-report.earlyDifference.centroidY)>2,`${name}: visible surface energy does not travel`);

    if(mobile){
      await page.locator('#pricing').evaluate(section=>section.scrollIntoView({block:'center',behavior:'instant'}));
      await page.waitForFunction(()=>document.documentElement.dataset.fxCoreSurfaceSchedulerR484==='suspended',null,{timeout:5000});
      const starts=await page.evaluate(()=>window.__r528VisualAudit.events.filter(e=>e.phase==='start').length);
      await page.waitForTimeout(6200);
      assert.equal(await page.evaluate(()=>window.__r528VisualAudit.events.filter(e=>e.phase==='start').length),starts,`${name}: offscreen surface work continued`);
      await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.fxCoreSurfaceSchedulerR484),'suspended',`${name}: reduced-motion scheduler not suspended`);
      const reducedStarts=await page.evaluate(()=>window.__r528VisualAudit.events.filter(e=>e.phase==='start').length);
      await page.waitForTimeout(6200);
      assert.equal(await page.evaluate(()=>window.__r528VisualAudit.events.filter(e=>e.phase==='start').length),reducedStarts,`${name}: reduced-motion autonomous sweep continued`);
      report.lifecycle='offscreen-and-reduced-motion-passed';
    }
    assert.deepEqual(errors,[],`${name}: page errors ${errors.join(' | ')}`);report.result='passed';
    console.log(`PASS ${name}: R528 canonical living MAG visual/lifecycle contract passed`);
  }catch(error){report.result='failed';report.error=String(error.stack||error);await page.screenshot({path:path.join(OUT,`${name}-failure.png`),animations:'disabled'}).catch(()=>{});throw error;}
  finally{report.pageErrors=errors;fs.writeFileSync(path.join(OUT,`${name}-report.json`),JSON.stringify(report,null,2)+'\n');await context.close();}
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{await verify(browser,'mobile-390',{width:390,height:844},true);await verify(browser,'desktop-1440',{width:1440,height:900},false);}finally{await browser.close();}
  console.log('PASS: R528 canonical MAG is visible, singular, alive, visually stateful, lifecycle-safe and reduced-motion safe.');
})().catch(error=>{console.error(error);process.exitCode=1;});
