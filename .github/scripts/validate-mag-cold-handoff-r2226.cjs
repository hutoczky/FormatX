'use strict';
// R2226: three truly independent browser cold starts. A single "green"
// compositor handoff has repeatedly been followed by a black one on identical
// geometry. This is NOT a screenshot retry and must not conceal failures.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_COLD_HANDOFF_DIR||'artifacts/r2226-handoff-coldstarts';
fs.mkdirSync(OUT,{recursive:true});
const launch=()=>chromium.launch({
  executablePath:process.env.CHROME_BIN||undefined,
  headless:true,
  args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']
});
const pause=(page,ms)=>page.waitForTimeout(ms);
async function ready(page){
  const deadline=Date.now()+45000;
  while(Date.now()<deadline){
    if(await page.evaluate(()=>{
      const root=document.documentElement;
      return !document.querySelector('.fx-mag-birth-r533') &&
        root.dataset.fxCrystalOrganismR326==='ready' &&
        !!document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    }).catch(()=>false))return true;
    await pause(page,130);
  }
  return false;
}
async function pixels(page,bytes,rect){
  return page.evaluate(async({encoded,rect})=>{
    if(!rect||rect.w<40||rect.h<40)return {bright:0,samples:0,reason:'missing-canvas'};
    const image=new Image();
    image.src='data:image/png;base64,'+encoded;
    await image.decode();
    const cv=document.createElement('canvas');
    cv.width=image.naturalWidth;cv.height=image.naturalHeight;
    const ctx=cv.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(image,0,0);
    const x0=Math.max(0,Math.floor(rect.x+rect.w*.23));
    const y0=Math.max(0,Math.floor(rect.y+rect.h*.20));
    const x1=Math.min(cv.width,Math.ceil(rect.x+rect.w*.77));
    const y1=Math.min(cv.height,Math.ceil(rect.y+rect.h*.80));
    if(x1<=x0||y1<=y0)return {bright:0,samples:0,reason:'outside-viewport'};
    const data=ctx.getImageData(x0,y0,x1-x0,y1-y0);
    let bright=0,samples=0;
    for(let y=0;y<data.height;y+=3)
      for(let x=0;x<data.width;x+=3){
        const i=(y*data.width+x)*4;
        const r=data.data[i],g=data.data[i+1],b=data.data[i+2];
        if((r+g+b)/3>60&&Math.max(r,g,b)>105)bright++;
        samples++;
      }
    return {bright,samples,region:{x:x0,y:y0,w:x1-x0,h:y1-y0}};
  },{encoded:bytes.toString('base64'),rect});
}
(async()=>{
  const report=[];
  for(let attempt=1;attempt<=3;attempt++){
    const browser=await launch();
    let context;
    const result={attempt,ok:false,errors:[]};
    report.push(result);
    try{
      context=await browser.newContext({
        viewport:{width:1280,height:720},colorScheme:'dark',
        reducedMotion:'no-preference',locale:'hu-HU'
      });
      const page=await context.newPage();
      page.on('pageerror',error=>result.errors.push(String(error)));
      await page.addInitScript(()=>{
        try{sessionStorage.clear();localStorage.removeItem('formatx:mag-birth-live-r533-seen');}catch(_){}
      });
      // R2247 browser-only profiler. Instrument the real WebGL calls BEFORE
      // page JS starts, without patching the production source or screenshot.
      // Preserve return values/exceptions and never invoke rendering.
      await page.addInitScript(()=>{
        const events=[];
        const counts=Object.create(null);
        const methods=['compileShader','linkProgram','bufferData','drawArrays','finish'];
        const maxPerMethod=24;
        for(const name of ['WebGLRenderingContext','WebGL2RenderingContext']){
          const proto=window[name]?.prototype;
          if(!proto)continue;
          for(const method of methods){
            const original=proto[method];
            if(typeof original!=='function')continue;
            Object.defineProperty(proto,method,{
              configurable:true,writable:true,value:function(...args){
                const start=performance.now();
                try{return Reflect.apply(original,this,args);}
                finally{
                  const canvas=this.canvas;
                  const owner=canvas?.classList?.contains('fx-crystal-organism-r326-canvas')
                    ?'native-mag':'intro-film';
                  const key=owner+':'+method;
                  const number=(counts[key]||0)+1;
                  counts[key]=number;
                  if(number<=maxPerMethod){
                    events.push({
                      owner,method,index:number,
                      startMs:+start.toFixed(2),
                      durationMs:+(performance.now()-start).toFixed(2)
                    });
                  }
                }
              }
            });
          }
        }
        window.__fxMagBootProfilerR2247={events,counts};
      });
      const url=new URL(BASE);
      url.searchParams.set('intro','1');
      url.searchParams.set('visualintro','1');
      url.searchParams.set('r720handoff','1');
      url.searchParams.set('r2226cold',String(attempt));
      await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
      if(!await ready(page))throw new Error('native MAG did not become ready after the film');
      await pause(page,350);
      const state=await page.evaluate(()=>{
        const root=document.documentElement;
        const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const box=canvas?.getBoundingClientRect();
        return {
          overlay:document.querySelectorAll('.fx-mag-birth-r533').length,
          canvases:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
          firstFrame:root.dataset.fxCoreFirstFrameR1913||'',
          gpu:root.dataset.fxMagHandoffGpuR2226||'',
          gpuPixel:root.dataset.fxMagHandoffPixelR2226||'',
          gpuMs:root.dataset.fxMagHandoffGpuMsR2226||'',
          gpuCapability:root.dataset.fxGpuCapability||'',
          gpuSyncMode:root.dataset.fxMagHandoffSyncR2253||'',
          bootPhases:(()=>{
            try{return JSON.parse(root.dataset.fxMagBootPhasesR2241||'null');}
            catch(_){return null;}
          })(),
          // Real browser context API cost, not synthetic geometry microbench.
          gpuCallTrace:(()=>{
            const probe=window.__fxMagBootProfilerR2247;
            if(!probe)return null;
            const native=probe.events.filter(event=>event.owner==='native-mag');
            const summary={};
            for(const method of ['compileShader','linkProgram','bufferData','drawArrays','finish']){
              const samples=native.filter(event=>event.method===method);
              summary[method]={
                calls:probe.counts['native-mag:'+method]||0,
                sampled:samples.length,
                cpuSumMs:+samples.reduce((a,e)=>a+e.durationMs,0).toFixed(2),
                cpuMaxMs:+Math.max(0,...samples.map(e=>e.durationMs)).toFixed(2)
              };
            }
            return summary;
          })(),
          postRender:root.dataset.fxMagNativePresentR2220||'',
          nativeCompositor:root.dataset.fxMagNativeCompositorR2222||'',
          viewport:{w:innerWidth,h:innerHeight,scrollY},
          rect:box?{x:box.x,y:box.y,w:box.width,h:box.height}:null
        };
      });
      result.state=state;
      // Critical: the FIRST full-viewport capture is measured without ANY
      // locator, hit-testing, scroll, retry or extra forced frame.
      const shot=await page.screenshot({
        path:path.join(OUT,'cold-handoff-'+attempt+'.png'),
        fullPage:false
      });
      result.pixels=await pixels(page,shot,state.rect);
      // R2227: the R2226 GL owner independently reads a small center patch
      // of its *actual* framebuffer. Compare that to the FIRST full page
      // screenshot to distinguish genuine empty WebGL content from an
      // already-painted MAG hidden by stale compositor/DOM layers.
      // Do NOT trigger a second readback, scroll, hit test or repaint here.
      const gpuPair=/^(\d+),(\d+)$/.exec(state.gpuPixel);
      const luma=gpuPair?Number(gpuPair[1]):null;
      const alpha=gpuPair?Number(gpuPair[2]):null;
      result.ownership={
        framebufferPeak:luma,framebufferAlpha:alpha,
        browserBright:result.pixels?.bright||0,
        failureClass:
          luma===null?'framebuffer-not-measured':
          luma===0?'gpu-framebuffer-black':
          (result.pixels?.bright||0)<40?'browser-compositor-not-presented':
          'both-framebuffer-and-viewport-visible'
      };
      if(state.overlay!==0||state.canvases!==1)
        result.errors.push('cinematic layer/renderer duplication');
      if(!state.bootPhases||!Number.isFinite(state.bootPhases.geometryMs)
        ||!Number.isFinite(state.bootPhases.uploadMs)
        ||!Number.isFinite(state.bootPhases.shaderMs)
        ||state.bootPhases.vertices<10000)
        result.errors.push('R2241 MAG phase timing missing from actual cold start');
      if(state.gpu!=='finished')
        result.errors.push('GL final frame was not finished');
      // R2253: the WebGL2 path must never fall back to an unconditional
      // blocking gl.finish. WebGL1 retains its proven synchronous safety.
      if(state.gpuCapability==='webgl2'&&
         (state.gpuSyncMode!=='webgl2-nonblocking-fence'||
          (state.gpuCallTrace?.finish?.calls||0)!==0))
        result.errors.push('R2253 WebGL2 GPU sync blocked the main thread: '+
          JSON.stringify({mode:state.gpuSyncMode,
            finishes:state.gpuCallTrace?.finish?.calls||0}));
      if(state.gpuCapability==='webgl1'&&
         state.gpuSyncMode!=='webgl1-finish-fallback')
        result.errors.push('R2253 WebGL1 fallback not recorded');
      if(luma===null||alpha===null)
        result.errors.push('R2227 GPU center readback telemetry invalid');
      // Center patch is diagnostic, not a standalone visual oracle:
      // the optical body can be off-center in legitimate camera profiles.
      // Trust the original first-full-viewport pixel gate for acceptance.
      if(!result.pixels||result.pixels.bright<40)
        result.errors.push('black FIRST full viewport; bright='+result.pixels?.bright+
          '; cause='+result.ownership.failureClass);
      result.ok=result.errors.length===0;
    }catch(error){result.errors.push(String(error));}
    finally{
      if(context)await context.close().catch(()=>{});
      await browser.close().catch(()=>{});
    }
    console.log('R2226_COLD_START '+JSON.stringify(result));
  }
  fs.writeFileSync(path.join(OUT,'evidence.json'),JSON.stringify(report,null,2)+'\n');
  if(report.some(x=>!x.ok)){
    console.error('R2226_COLD_START_RELIABILITY_FAIL '+report.filter(x=>!x.ok).length+'/3');
    process.exitCode=1;
  }else console.log('R2226_COLD_START_RELIABILITY_PASS 3/3');
})().catch(error=>{console.error(error);process.exitCode=1;});
