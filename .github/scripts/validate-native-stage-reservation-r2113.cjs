'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader',
  '--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'
 ]});
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'no-preference'});
   try{
    const page=await context.newPage();
    await page.addInitScript(()=>{
     const audit=window.__nativeStageReservationR2113={samples:[],shifts:[],errors:[]};
     addEventListener('error',event=>audit.errors.push(event.message));
     new PerformanceObserver(list=>{
      for(const entry of list.getEntries())if(!entry.hadRecentInput)audit.shifts.push({at:entry.startTime,value:entry.value});
     }).observe({type:'layout-shift',buffered:true});
     let frames=0;
     function sample(){
      const stage=document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage');
      if(stage){
       const rect=stage.getBoundingClientRect(),style=getComputedStyle(stage);
       const canvas=stage.querySelector('.fx-crystal-organism-r326-canvas');
       if(!window.__nativeStageCanvasR2113)window.__nativeStageCanvasR2113=canvas;
       const legacy=document.querySelector('#hero .hero-copy .kicker');
       const legacySurface=document.querySelector('#hero .hero-copy');
       const legacySurfaceOpacity=legacySurface?Number(getComputedStyle(legacySurface).opacity):0;
       let legacyTextPainted=false;
       if(legacy){
        const box=legacy.getBoundingClientRect(),own=getComputedStyle(legacy);
        legacyTextPainted=own.visibility==='visible'&&box.width>0&&box.height>0;
        let opacity=1;
        for(let node=legacy;node&&legacyTextPainted;node=node.parentElement){
         const ancestor=getComputedStyle(node);opacity*=Number(ancestor.opacity||1);
         if(ancestor.display==='none'||ancestor.contentVisibility==='hidden'||opacity<=.02)legacyTextPainted=false;
        }
       }
       const state={left:parseFloat(style.left),top:parseFloat(style.top),width:rect.width,height:rect.height,
        centerX:rect.left+rect.width/2,centerY:rect.top+rect.height/2,
        legacyTextPainted,legacySurfaceOpacity,
        genesis:document.documentElement.dataset.fxNativeGenesisR2064||'',
        docked:stage.classList.contains('fx-archive-native-docked')};
       if(audit.samples.length<100)audit.samples.push(state);
      }
      if(++frames<600&&!audit.stopped)requestAnimationFrame(sample);
     }
     requestAnimationFrame(sample);
    });
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.fxArchiveCinema==='active'
      &&!document.querySelector('.fx-mag-birth-r533'),null,{timeout:20000});
    await page.waitForTimeout(500);
    const result=await page.evaluate(()=>{
     const audit=window.__nativeStageReservationR2113;audit.stopped=true;
     const stage=window.FormatXLivingCore.stage,canvas=window.FormatXLivingCore.canvas;
     const style=getComputedStyle(stage),rect=stage.getBoundingClientRect();
     return {...audit,final:{left:parseFloat(style.left),top:parseFloat(style.top),width:rect.width,height:rect.height},
      sameCanvas:canvas===window.__nativeStageCanvasR2113,
      context:Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl')),
      canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
      viewport:{width:innerWidth,height:innerHeight}};
    });
    const name=mobile?'mobile':'desktop';
    assert(result.samples.length>1,`${name}: no actual native stage samples`);
    const first=result.samples[0],genesis=result.samples.filter(sample=>sample.genesis);
    assert(genesis.length>0,`${name}: no real intro stage observed`);
    for(const [index,sample] of result.samples.entries())for(const property of ['left','top','width','height']){
     assert(Math.abs(sample[property]-result.final[property])<1,
      `${name}: native ${property} changed between frame ${index} and handoff: ${JSON.stringify({sample,final:result.final})}`);
    }
    for(const sample of genesis){
     assert.equal(sample.legacyTextPainted,false,`${name}: original hero text paints over the real native intro`);
     assert(sample.legacySurfaceOpacity<=.02,`${name}: original hero card paints over the real native intro`);
     assert(Math.abs(sample.centerX-result.viewport.width*.5)<2,`${name}: actual intro subject is not horizontally centered`);
     assert(Math.abs(sample.centerY-result.viewport.height*.47)<2,`${name}: actual intro subject is not vertically centered`);
    }
    const cls=result.shifts.reduce((sum,entry)=>sum+entry.value,0);
    assert(cls<.05,`${name}: first-visit layout shifts exceed the original limit: ${cls}`);
    assert.equal(result.sameCanvas,true,`${name}: stage reservation replaced the native canvas`);
    assert.equal(result.canvasCount,1,`${name}: stage reservation duplicated the native canvas`);
    assert.equal(result.context,true,`${name}: no actual WebGL context at handoff`);
    assert.deepEqual(result.errors,[],`${name}: browser errors`);
    console.log('NATIVE_STAGE_RESERVATION_R2113_PASS '+JSON.stringify({name,first,final:result.final,cls,genesisFrames:genesis.length,sameCanvas:result.sameCanvas}));
   }finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
