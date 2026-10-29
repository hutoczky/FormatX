'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const home=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=process.env.FORMATX_DOCK_ENTRY_EVIDENCE_DIR||'artifacts/native-mag-dock-entry-r2173';

function observe({normal}){
  if(normal)Object.defineProperty(navigator,'webdriver',{get:()=>false});
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  let root=document.documentElement;
  const data=window.__dockEntry={firstDock:null,cinema:null,shifts:[],contexts:[],firstDraw:null};
  const rectangle=node=>{
    const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};
  };
  const capture=()=>{
    const stage=document.querySelector('.fx-crystal-organism-r326-stage.fx-archive-native-docked');
    const canvas=stage?.querySelector('.fx-crystal-organism-r326-canvas');
    if(root.dataset.fxArchiveDock!=='active'||!stage||!canvas)return;
    const c=getComputedStyle(canvas);
    const sample={at:performance.now(),stage:rectangle(stage),canvas:{width:c.width,height:c.height,scale:c.scale,filter:c.filter,objectFit:c.objectFit},viewport:{width:innerWidth,height:innerHeight},cinema:root.dataset.fxArchiveCinema||null};
    if(!data.firstDock){data.firstDock=sample;window.__dockCanvas=canvas;window.__dockStage=stage;}
    if(root.dataset.fxArchiveCinema==='active'&&!data.cinema)data.cinema=sample;
  };
  const attach=()=>{
    root=document.documentElement;if(!root)return;
    new MutationObserver(capture).observe(root,{attributes:true,attributeFilter:['data-fx-archive-dock','data-fx-archive-cinema']});
    capture();
  };
  if(root)attach();else new MutationObserver((_,o)=>{if(document.documentElement){o.disconnect();attach();}}).observe(document,{childList:true,subtree:true});
  try{new PerformanceObserver(list=>{
    for(const entry of list.getEntries()){
      const sources=entry.sources.filter(s=>s.node?.classList?.contains('fx-crystal-organism-r326-stage'));
      if(sources.length)data.shifts.push({at:entry.startTime,value:entry.value,recentInput:entry.hadRecentInput,sources:sources.map(s=>({previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))});
    }
  }).observe({type:'layout-shift',buffered:true});}catch(_){}
  const ids=new WeakMap();let nextId=0;
  const getContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type){
    const gl=Reflect.apply(getContext,this,arguments);
    if(gl&&/^webgl/.test(type)&&this.classList.contains('fx-crystal-organism-r326-canvas')){
      if(!ids.has(gl))ids.set(gl,++nextId);
      data.contexts.push(ids.get(gl));window.__dockGL=gl;
    }
    return gl;
  };
  for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
    if(!Type)continue;
    const draw=Type.prototype.drawArrays;
    Type.prototype.drawArrays=function(mode,first,count){
      const value=Reflect.apply(draw,this,arguments);
      if(!data.firstDraw&&this.canvas?.classList.contains('fx-crystal-organism-r326-canvas'))data.firstDraw={at:performance.now(),count,contextId:ids.get(this)};
      return value;
    };
  }
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),actualDockAndCinemaEvents:true,cases:[]};
  try{
    for(const config of [{name:'mobile-390-runtime',width:390,height:844,mobile:true,normal:false},{name:'mobile-430-normal-birth',width:430,height:932,mobile:true,normal:true},{name:'desktop-1350-runtime',width:1350,height:940,normal:false},{name:'desktop-1440-normal-birth',width:1440,height:900,normal:true}]){
      const context=await browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:config.mobile?2:1,isMobile:!!config.mobile,hasTouch:!!config.mobile,reducedMotion:'no-preference',userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'});
      try{
        await context.addInitScript(observe,{normal:config.normal});
        const page=await context.newPage(),errors=[],failedRequests=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
        await page.goto(home,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>window.__dockEntry?.cinema&&window.__dockEntry?.firstDraw,null,{timeout:45000});
        await page.waitForTimeout(350);
        const result=await page.evaluate(()=>{
          const root=document.documentElement,stage=document.querySelector('.fx-crystal-organism-r326-stage'),canvas=stage?.querySelector('.fx-crystal-organism-r326-canvas'),r=stage?.getBoundingClientRect();
          return{observation:window.__dockEntry,final:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,sameCanvas:canvas===window.__dockCanvas&&stage===window.__dockStage,canvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,shared:window.FormatXLivingCore?.sharedWebGL2,glError:window.__dockGL?.getError(),contextLost:window.__dockGL?.isContextLost(),dock:root.dataset.fxArchiveDock,cinema:root.dataset.fxArchiveCinema};
        });
        const record={profile:config.name,...result,errors,failedRequests};report.cases.push(record);
        console.log('NATIVE_MAG_DOCK_ENTRY',JSON.stringify(record));
        assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
        assert.equal(result.glError,0);assert.equal(result.contextLost,false);
        assert(result.shared);assert(result.sameCanvas);assert.equal(result.canvases,1);
        assert.equal(new Set(result.observation.contexts).size,1);
        assert(result.observation.firstDraw.count>0);
        const first=result.observation.firstDock,cinema=result.observation.cinema;
        assert(first&&cinema,'Missing actual native docking/cinema samples');
        for(const key of ['x','y','width','height']){
          assert(Math.abs(first.stage[key]-cinema.stage[key])<=1,`MAG ${key} jumps between first dock and cinema: ${first.stage[key]} -> ${cinema.stage[key]}`);
          assert(Math.abs(cinema.stage[key]-result.final[key])<=1,`MAG ${key} changes after cinema entry`);
        }
        if(!config.mobile)assert(first.stage.width<first.viewport.width*.5,'First dock exposed a full-viewport MAG stage');
        else assert(first.stage.width<=first.viewport.width+1,'First mobile dock escaped the viewport');
        assert(first.stage.height<first.viewport.height*.8,'First dock exposed a full-height MAG stage');
        assert.deepEqual(first.canvas,cinema.canvas,'The first dock must already use the final native canvas scale and optics');
        assert.deepEqual(result.observation.shifts.filter(s=>!s.recentInput&&s.at>=first.at),[],'Native stage shifts after its first real docking');
      }finally{await context.close();}
    }
  }finally{await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
