'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const out=path.resolve('.archive-artifacts/native-framing-r2114.json');
const reports=[];

(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader',
  '--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'
 ]});
 try{
  for(const profile of [
   {name:'desktop-1024',width:1024,height:768,mobile:false},
   {name:'desktop-1440',width:1440,height:900,mobile:false},
   {name:'desktop-1920',width:1920,height:1080,mobile:false},
   {name:'mobile-320',width:320,height:568,mobile:true},
   {name:'mobile-390',width:390,height:844,mobile:true},
   {name:'desktop-delayed-identity',width:1920,height:1080,mobile:false,identityEntryDelay:2400},
   {name:'desktop-stalled-identity',width:1920,height:1080,mobile:false,identityEntryDelay:10000}
  ]){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},
    isMobile:profile.mobile,hasTouch:profile.mobile,deviceScaleFactor:profile.mobile?2:1,
    locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference'});
   try{
    const page=await context.newPage();
    if(profile.identityEntryDelay){
     await page.route('**/formatx-ai-core-ident-r1951.js?*',async route=>{
      const response=await route.fetch();
      const source=await response.text();
      // Delay only this label's first presentation callback. Keep the actual
      // native renderer, intro clock, readiness and original framing checks.
      const scheduling=`const nativeFrame=window.requestAnimationFrame.bind(window);let firstIdentityFrame=true;
       const requestAnimationFrame=callback=>{if(firstIdentityFrame){firstIdentityFrame=false;
        return setTimeout(()=>nativeFrame(callback),${profile.identityEntryDelay});}return nativeFrame(callback);};`;
      await route.fulfill({response,body:source.replace("'use strict';","'use strict';"+scheduling)});
     });
    }
    await page.addInitScript(()=>{
     const audit=window.__nativeFramingR2114={frames:[],identity:[],identityMotion:[],identityEvents:[],complete:[],errors:[]};
     let lastIdentity=null,lastIdentityClass='';
     new MutationObserver(()=>{
      const badge=document.querySelector('.fx-ai-core-ident-r1951');
      if(badge!==lastIdentity||badge?.className!==lastIdentityClass){
       audit.identityEvents.push({at:performance.now(),state:badge?.className||'absent'});
       lastIdentity=badge;lastIdentityClass=badge?.className;
      }
     }).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
     addEventListener('error',event=>audit.errors.push(event.message));
     document.addEventListener('formatx:magbirthcomplete',()=>audit.complete.push(performance.now()));
     // Pixel readback is confined to this separate framing check. The visitor
     // duration gate keeps unmodified production uniforms and performs no such
     // readback. No pinned phase, clock or readiness value is used here.
     for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
      if(!Type)continue;
      const proto=Type.prototype,names=new WeakMap(),states=new WeakMap(),programs=new WeakSet();
      const state=gl=>{if(!states.has(gl))states.set(gl,{layer:-1,genesis:-1,program:null});return states.get(gl);};
      const locate=proto.getUniformLocation,uniform=proto.uniform1f,draw=proto.drawArrays,use=proto.useProgram;
      proto.getUniformLocation=function(program,name){
       const location=locate.call(this,program,name);
       if(location)names.set(location,name);
       if(name==='uGenesis'&&location)programs.add(program);
       return location;
      };
      proto.useProgram=function(program){state(this).program=program;return use.call(this,program);};
      proto.uniform1f=function(location,value){
       if(names.get(location)==='uLayer')state(this).layer=value;
       if(names.get(location)==='uGenesis')state(this).genesis=value;
       return uniform.call(this,location,value);
      };
      proto.drawArrays=function(...args){
       const result=draw.apply(this,args),s=state(this);
       if(!this.canvas?.classList.contains('fx-crystal-organism-r326-canvas')||s.layer!==0
        ||!programs.has(s.program)||s.genesis<0||audit.frames.length>=3
        ||!document.documentElement.hasAttribute('data-fx-native-genesis-r2064'))return result;
       if(!window.__nativeFramingCanvasR2114){window.__nativeFramingCanvasR2114=this.canvas;window.__nativeFramingContextR2114=this;}
       const width=this.drawingBufferWidth,height=this.drawingBufferHeight,pixels=new Uint8Array(width*height*4);
       this.readPixels(0,0,width,height,this.RGBA,this.UNSIGNED_BYTE,pixels);
       let minX=width,minY=height,maxX=-1,maxY=-1,count=0,edge=0;
       for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const index=(y*width+x)*4;
        if(pixels[index+3]<32||Math.max(pixels[index],pixels[index+1],pixels[index+2])<10)continue;
        count++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
        if(x<2||y<2||x>=width-2||y>=height-2)edge++;
       }
       audit.frames.push({genesis:s.genesis,introPhase:document.documentElement.dataset.fxNativeGenesisR2064,
        completed:audit.complete.length>0,width,height,coverage:count/(width*height),edge,bounds:{minX,minY,maxX,maxY}});
       return result;
      };
     }
     let frames=0;
     function observeIdentity(){
      const badge=document.querySelector('.fx-ai-core-ident-r1951');
      if(badge&&Number(getComputedStyle(badge).opacity)>.05){
       const stage=window.FormatXLivingCore?.stage;
       const paper=document.querySelector('[data-fx-cinema-panel-active="true"]');
       const b=badge.getBoundingClientRect(),s=stage?.getBoundingClientRect(),p=paper?.getBoundingClientRect();
       const identity={at:performance.now(),nativeReady:document.documentElement.dataset.fxCrystalOrganismR326==='ready',
        originalStage:badge.parentElement===stage,text:badge.textContent,
        badgeRect:b.toJSON(),stageRect:s?.toJSON(),
        badgeStyle:{position:getComputedStyle(badge).position,left:getComputedStyle(badge).left,top:getComputedStyle(badge).top,
         width:getComputedStyle(badge).width,transform:getComputedStyle(badge).transform,offsetParent:badge.offsetParent?.className},
        insideStage:!!s&&b.left>=s.left-1&&b.right<=s.right+1&&b.top>=s.top-1&&b.bottom<=s.bottom+1,
        coversPaper:!!p&&Math.min(b.right,p.right)>Math.max(b.left,p.left)&&Math.min(b.bottom,p.bottom)>Math.max(b.top,p.top)};
       if(audit.identity.length===0)audit.identity.push(identity);
       audit.identityMotion.push(identity);
      }
      if(++frames<900&&!audit.stopped)requestAnimationFrame(observeIdentity);
     }requestAnimationFrame(observeIdentity);
    });
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__nativeFramingR2114.complete.length>0
     &&document.documentElement.dataset.fxArchiveCinema==='active',null,{timeout:20000});
    await page.waitForTimeout(600);
    await page.waitForFunction(()=>{
     const audit=window.__nativeFramingR2114;
     audit.waitStartedAt??=performance.now();
     return audit.identityMotion.length>0&&!document.querySelector('.fx-ai-core-ident-r1951');
    },null,{timeout:6000}).catch(async error=>{
      const failure=await page.evaluate(()=>({
       audit:window.__nativeFramingR2114,
       identity:document.documentElement.dataset.fxAiCoreIdentityR1951,
       ready:document.documentElement.dataset.fxCrystalOrganismR326,
       visibility:document.visibilityState,
       badge:document.querySelector('.fx-ai-core-ident-r1951')?.outerHTML||null,
       styles:[...document.querySelectorAll('link[data-fx-ai-core-ident-r1951]')].map(link=>({href:link.href,media:link.media,loaded:!!link.sheet}))
      }));
      reports.push({profile:profile.name,failure});fs.mkdirSync(path.dirname(out),{recursive:true});
      fs.writeFileSync(out,JSON.stringify(reports,null,2));
      console.error('NATIVE_FRAMING_FAILURE '+JSON.stringify({profile:profile.name,identity:failure.identity,
       ready:failure.ready,visibility:failure.visibility,badge:failure.badge,styles:failure.styles,
       frameCount:failure.audit.frames.length,identitySamples:failure.audit.identityMotion.length,
       waitStartedAt:failure.audit.waitStartedAt,identityEvents:failure.audit.identityEvents,errors:failure.audit.errors}));
      throw error;
     });
    const report=await page.evaluate(()=>{
     const audit=window.__nativeFramingR2114;audit.stopped=true;
     const canvas=window.FormatXLivingCore?.canvas;
     return {...audit,canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
      sameCanvas:canvas===window.__nativeFramingCanvasR2114,
      sameContext:(canvas?.getContext('webgl2')||canvas?.getContext('webgl'))===window.__nativeFramingContextR2114};
    });
    reports.push({profile:profile.name,...report});fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(reports,null,2));
    assert(report.frames.some(frame=>frame.introPhase==='active'&&!frame.completed),`${profile.name}: no actual native introductory frame before handoff`);
    for(const frame of report.frames){
     assert(frame.coverage>.02,`${profile.name}: actual native subject is empty or unreadably small`);
     assert.equal(frame.edge,0,`${profile.name}: the original 3D signature clips at its native buffer edge: ${JSON.stringify(frame)}`);
    }
    assert.equal(report.canvasCount,1,`${profile.name}: duplicated native canvas`);
    assert.equal(report.sameCanvas,true,`${profile.name}: changed native canvas`);
    assert.equal(report.sameContext,true,`${profile.name}: changed native context`);
    assert.equal(report.identity.length,1,`${profile.name}: actual post-intro MAG identity was not observed`);
    assert.equal(report.identity[0].nativeReady,true,`${profile.name}: an unready renderer claimed to be online`);
    assert.equal(report.identity[0].originalStage,true,`${profile.name}: identity left its native MAG stage`);
    assert.equal(report.identity[0].insideStage,true,`${profile.name}: identity overflowed its native MAG stage`);
    assert.equal(report.identity[0].coversPaper,false,`${profile.name}: identity covered the original reading surface`);
    assert.ok(report.identityMotion.length>0,`${profile.name}: complete native identity motion was not observed`);
    assert.ok(report.identityMotion.every(sample=>sample.nativeReady&&sample.originalStage&&sample.insideStage&&!sample.coversPaper),
     `${profile.name}: native identity left its lane during entry, hold or exit`);
    assert.deepEqual(report.errors,[],`${profile.name}: browser errors`);
    console.log('NATIVE_FRAMING_R2114_PASS '+JSON.stringify({profile:profile.name,frames:report.frames,identity:report.identity}));
   }finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
