'use strict';
// R2264: one genuine ordinary visitor. The native MAG must appear after the
// cinematic film WITHOUT diagnostic GL readPixels, test-side scroll, retry,
// query-based visual proof, or a duplicate renderer.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_VISITOR_FENCE_DIR||'artifacts/r2264-normal-visitor';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const browser=await chromium.launch({
    executablePath:process.env.CHROME_BIN||undefined,
    headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl',
      '--ignore-gpu-blocklist','--no-sandbox']
  });
  let context;
  const report={ok:false,errors:[]};
  try{
    context=await browser.newContext({
      viewport:{width:1280,height:720},
      colorScheme:'dark',reducedMotion:'no-preference',locale:'hu-HU'
    });
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push(String(e)));
    await page.addInitScript(()=>{
      try{
        sessionStorage.clear();
        localStorage.removeItem('formatx:mag-birth-live-r533-seen');
      }catch(_){}
      window.__r2264ReadbackCount=0;
      for(const key of ['WebGLRenderingContext','WebGL2RenderingContext']){
        const proto=window[key]?.prototype;
        if(!proto||typeof proto.readPixels!=='function')continue;
        const original=proto.readPixels;
        Object.defineProperty(proto,'readPixels',{
          configurable:true,writable:true,value:function(...args){
            if(this.canvas?.classList?.contains('fx-crystal-organism-r326-canvas'))
              window.__r2264ReadbackCount++;
            return Reflect.apply(original,this,args);
          }
        });
      }
    });
    const url=new URL(BASE);
    url.searchParams.set('intro','1');
    url.searchParams.set('r2264normal','1');
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>{
      const root=document.documentElement;
      return !document.querySelector('.fx-mag-birth-r533')&&
        root.dataset.fxCrystalOrganismR326==='ready'&&
        root.dataset.fxMagHandoffGpuR2226==='finished'&&
        !!document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    },null,{timeout:60000,polling:150});
    // FIRST viewport screenshot, before any locator, hit-test, scroll, or
    // style inspection by this test. Do not replace the visual oracle with
    // renderer-ready flags, which previously masked an all-black page.
    const png=await page.screenshot({
      path:path.join(OUT,'normal-visitor-first-handoff.png'),fullPage:false
    });
    const state=await page.evaluate(()=>{
      const root=document.documentElement;
      const el=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
      const box=el?.getBoundingClientRect();
      return {
        policy:root.dataset.fxMagReadbackPolicyR2264||'',
        gpu:root.dataset.fxMagHandoffGpuR2226||'',
        gpuPixel:root.dataset.fxMagHandoffPixelR2226||'',
        sync:root.dataset.fxMagHandoffSyncR2253||'',
        readbacks:window.__r2264ReadbackCount,
        canvases:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
        overlays:document.querySelectorAll('.fx-mag-birth-r533').length,
        rect:box?{x:box.x,y:box.y,w:box.width,h:box.height}:null
      };
    });
    const pixels=await page.evaluate(async({encoded,rect})=>{
      if(!rect||rect.w<40||rect.h<40)return {bright:0,samples:0};
      const img=new Image();
      img.src='data:image/png;base64,'+encoded;
      await img.decode();
      const cv=document.createElement('canvas');
      cv.width=img.naturalWidth;cv.height=img.naturalHeight;
      const ctx=cv.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(img,0,0);
      const x0=Math.max(0,Math.floor(rect.x+rect.w*.23));
      const y0=Math.max(0,Math.floor(rect.y+rect.h*.20));
      const x1=Math.min(cv.width,Math.ceil(rect.x+rect.w*.77));
      const y1=Math.min(cv.height,Math.ceil(rect.y+rect.h*.80));
      if(x1<=x0||y1<=y0)return {bright:0,samples:0};
      const data=ctx.getImageData(x0,y0,x1-x0,y1-y0);
      let bright=0,samples=0;
      for(let y=0;y<data.height;y+=3)
        for(let x=0;x<data.width;x+=3){
          const i=(y*data.width+x)*4;
          const r=data.data[i],g=data.data[i+1],b=data.data[i+2];
          if((r+g+b)/3>60&&Math.max(r,g,b)>105)bright++;
          samples++;
        }
      return {bright,samples};
    },{encoded:png.toString('base64'),rect:state.rect});
    report.state=state;report.pixels=pixels;
    if(state.policy!=='production-gpu-fence-only')
      report.errors.push('normal visitor did not take production fence-only path');
    if(state.readbacks!==0||state.gpuPixel!=='not-sampled')
      report.errors.push('normal visitor performed a blocking GPU readback');
    if(state.gpu!=='finished'||state.sync!=='webgl2-nonblocking-fence')
      report.errors.push('native GPU completion fence was lost');
    if(state.canvases!==1||state.overlays!==0)
      report.errors.push('single-MAG or cinematic teardown violated');
    if(pixels.bright<40)
      report.errors.push('black FIRST full viewport after GPU-fence-only handoff');
    report.ok=report.errors.length===0;
  }catch(error){report.errors.push(String(error));}
  finally{if(context)await context.close().catch(()=>{});await browser.close();}
  fs.writeFileSync(path.join(OUT,'evidence.json'),JSON.stringify(report,null,2)+'\n');
  console.log('MAG_R2264_NORMAL_VISITOR_FENCE '+JSON.stringify(report));
  if(!report.ok)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
