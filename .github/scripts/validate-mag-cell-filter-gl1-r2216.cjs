'use strict';
// Genuine WebGL1 via Chrome's existing capability flag, never a spoofed GPU.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=process.env.FORMATX_CELL_GL1_DIR||'artifacts/mag-cell-filter-gl1-r2216';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-webgl2','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),genuineWebGl1:true,notHardwareOrFpsCertification:true,cases:[]};
 try{
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:width===390?2:1,
    isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
   try{
    await context.addInitScript(()=>{
     const get=HTMLCanvasElement.prototype.getContext,ids=new WeakMap();let next=0;
     window.__cellFilterGL1={requests:[],draw:null};
     HTMLCanvasElement.prototype.getContext=function(type){
      const gl=Reflect.apply(get,this,arguments);
      if(gl&&/^webgl/.test(type)&&this.classList.contains('fx-crystal-organism-r326-canvas')){
       if(!ids.has(gl)){
        ids.set(gl,++next);const draw=gl.drawArrays;
        gl.drawArrays=function(mode,first,count){
         const result=Reflect.apply(draw,this,arguments);
         if(!window.__cellFilterGL1.draw){
          const program=gl.getParameter(gl.CURRENT_PROGRAM);
          const fragment=(gl.getAttachedShaders(program)||[]).filter(s=>gl.getShaderParameter(s,gl.SHADER_TYPE)===gl.FRAGMENT_SHADER)
           .map(s=>gl.getShaderSource(s)||'').join('\n');
          window.__cellFilterGL1.draw={count,linked:gl.getProgramParameter(program,gl.LINK_STATUS),
           version:gl.getParameter(gl.VERSION),derivatives:Boolean(gl.getExtension('OES_standard_derivatives')),
           filterEnabled:fragment.includes('#define FX_MAG_CELL_DERIVATIVES'),
           sharedFilter:fragment.includes('float fineFootprint=max(fwidth(tissuePhaseA),fwidth(tissuePhaseB));')&&fragment.includes('tissueIslands*=fineVisibility;'),
           glError:gl.getError(),contextLost:gl.isContextLost()};
         }
         return result;
        };
       }
       window.__cellFilterGL1.requests.push({id:ids.get(gl),type});
      }
      return gl;
     };
    });
    const page=await context.newPage(),errors=[],failedRequests=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failedRequests.push(r.failure()?.errorText));
    const url=new URL(base);url.searchParams.set('intro','0');url.searchParams.set('r486-optics-energy-check','cell-gl1-'+width);
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.keyboard.press('Shift');
    await page.waitForFunction(()=>window.__cellFilterGL1?.draw&&document.documentElement.dataset.fxCrystalOrganismR326==='ready',null,{timeout:30000});
    const result=await page.evaluate(()=>({...window.__cellFilterGL1,canvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length}));
    report.cases.push({width,...result,errors,failedRequests});
    assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);assert.equal(result.canvases,1);
    assert.equal(new Set(result.requests.map(x=>x.id)).size,1);assert(result.requests.every(x=>x.type==='webgl'));
    assert.match(result.draw.version,/WebGL 1\.0/);assert(result.draw.linked&&result.draw.count>1000);
    assert.equal(result.draw.sharedFilter,true);assert.equal(result.draw.filterEnabled,result.draw.derivatives);
    assert.equal(result.draw.glError,0);assert.equal(result.draw.contextLost,false);
    console.log('MAG_CELL_FILTER_GL1',JSON.stringify(report.cases.at(-1)));
   }finally{await context.close();}
  }
 }finally{await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error);process.exitCode=1;});
