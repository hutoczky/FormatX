'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const home=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=process.env.FORMATX_LAYOUT_EVIDENCE_DIR||'artifacts/mag-handoff-layout-r2181';

// Observe the real cold birth, live DOM transfers and native GL submission.
// No fixed film frame, skip, fake readiness event or substituted clock.
function observe(){
  Object.defineProperty(navigator,'webdriver',{get:()=>false});
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
  Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  const data=window.__magLayout={reads:[],moves:[],contexts:[],draws:0,completions:[]};
  const originals=window.__magLayoutOriginals=[];
  let sequence=0;
  const rect=Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect=function(){
    const preparing=String(new Error().stack).includes('prepareCinemaHosts');
    const value=Reflect.apply(rect,this,arguments);
    if(preparing)data.reads.push({sequence:++sequence,host:this.id,height:value.height});
    return value;
  };
  const append=Node.prototype.appendChild;
  Node.prototype.appendChild=function(node){
    if(this.classList?.contains('fx-archive-cinema-folio-r2030')&&node.parentNode&&node.parentNode!==this){
      const host=node.parentNode;
      originals.push({node,host});
      data.moves.push({sequence:++sequence,host:host.id});
    }
    return Reflect.apply(append,this,arguments);
  };
  const getContext=HTMLCanvasElement.prototype.getContext,ids=new WeakMap();let nextId=0;
  HTMLCanvasElement.prototype.getContext=function(type){
    const gl=Reflect.apply(getContext,this,arguments);
    if(gl&&/^webgl/.test(type)&&this.classList.contains('fx-crystal-organism-r326-canvas')){
      if(!ids.has(gl))ids.set(gl,++nextId);
      data.contexts.push(ids.get(gl));window.__magLayoutGl=gl;
    }
    return gl;
  };
  for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
    if(!Type)continue;
    const draw=Type.prototype.drawArrays;
    Type.prototype.drawArrays=function(){
      const result=Reflect.apply(draw,this,arguments);
      if(this.canvas?.classList.contains('fx-crystal-organism-r326-canvas'))data.draws++;
      return result;
    };
  }
  document.addEventListener('formatx:magbirthcomplete',e=>data.completions.push({at:performance.now(),source:e.detail?.source}),{capture:true});
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),cases:[]};
  try{
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference',userAgent:mobile?'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'});
      try{
        await context.addInitScript(observe);
        const page=await context.newPage(),errors=[],failedRequests=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
        await page.goto(home,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>window.__magLayout?.completions.length===1&&window.__magLayout.draws>0&&document.documentElement.dataset.fxArchiveCinemaPrepared,null,{timeout:45000});
        const result=await page.evaluate(()=>{
          const data=window.__magLayout,originals=window.__magLayoutOriginals;
          const hosts=[...new Set(originals.map(x=>x.host))];
          return {observation:data,hostCount:hosts.length,originalCount:originals.length,
            originalsPreserved:originals.every(({node,host})=>node.isConnected&&node.parentNode===host.querySelector(':scope > .fx-archive-cinema-folio-r2030')),
            onePanelPerHost:hosts.every(host=>host.querySelectorAll(':scope > .fx-archive-cinema-folio-r2030').length===1),
            nativeCanvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
            overlays:document.querySelectorAll('.fx-mag-birth-r533').length,
            glError:window.__magLayoutGl?.getError(),contextLost:window.__magLayoutGl?.isContextLost()};
        });
        const record={profile:mobile?'mobile':'desktop',...result,errors,failedRequests};
        report.cases.push(record);console.log('MAG_HANDOFF_LAYOUT',JSON.stringify(record));
        assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
        assert.equal(result.nativeCanvases,1);assert.equal(new Set(result.observation.contexts).size,1);
        assert.equal(result.glError,0);assert.equal(result.contextLost,false);assert.equal(result.overlays,0);
        assert.equal(result.observation.completions.length,1);assert(result.observation.draws>0);
        assert(result.hostCount>=6&&result.originalCount>result.hostCount,'Original content transfers were not observed');
        assert(result.originalsPreserved&&result.onePanelPerHost,'The handoff must preserve every original node and one folio per host');
        assert.equal(result.observation.reads.length,result.hostCount,'Measure each original host once');
        const firstMove=result.observation.moves[0].sequence;
        assert(result.observation.reads.every(read=>read.sequence<firstMove),'MAG preparation measured a chapter after moving live content; layout reads must precede all transfers');
      }finally{await context.close();}
    }
  }finally{await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
