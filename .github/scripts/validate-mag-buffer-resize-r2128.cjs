'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const output='.archive-artifacts/buffer-resize-r2128.json';
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
fs.mkdirSync('.archive-artifacts',{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
  try{
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
      const page=await context.newPage();const item={profile:mobile?'mobile':'desktop',errors:[]};
      page.on('pageerror',error=>item.errors.push(String(error)));
      await page.addInitScript(()=>{
        const o=window.__bufferResizeEvidence={batches:[],frameSizes:[],contexts:0,complete:[]};
        let pending=null;
        for(const key of ['width','height']){
          const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,key);
          Object.defineProperty(HTMLCanvasElement.prototype,key,{...descriptor,set:function(value){
            if(!this.classList.contains('fx-crystal-organism-r326-canvas'))return descriptor.set.call(this,value);
            if(!pending){
              const canvas=this,batch={before:{width:canvas.width,height:canvas.height},writes:[]};pending=batch;
              queueMicrotask(()=>{
                batch.after={width:canvas.width,height:canvas.height};o.batches.push(batch);pending=null;
                requestAnimationFrame(()=>o.frameSizes.push({width:canvas.width,height:canvas.height}));
              });
            }
            const at=performance.now();descriptor.set.call(this,value);
            pending.writes.push({key,value,at,ms:performance.now()-at,width:this.width,height:this.height});
          }});
        }
        const original=HTMLCanvasElement.prototype.getContext,seen=new WeakSet();
        HTMLCanvasElement.prototype.getContext=function(type,...args){
          const context=original.call(this,type,...args);
          if(context&&/webgl/.test(type)&&!seen.has(context)){seen.add(context);o.contexts++;}
          return context;
        };
        addEventListener('formatx:real3dready',()=>{
          window.__bufferOriginalCanvas=window.FormatXLivingCore?.canvas;
          window.__bufferOriginalContext=__bufferOriginalCanvas?.getContext('webgl2');
        });
        document.addEventListener('formatx:magbirthcomplete',()=>o.complete.push(performance.now()));
      });
      try{
        await page.goto(url,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>window.__bufferResizeEvidence?.complete.length>0,null,{timeout:18000});
        await page.waitForTimeout(700);
        item.views=[];
        for(const viewport of mobile?[{width:430,height:932},{width:360,height:800}]:[{width:1560,height:980},{width:1280,height:800}]){
          await page.setViewportSize(viewport);
          await page.waitForTimeout(700);
          item.views.push(await page.evaluate(()=>{
            const api=window.FormatXLivingCore,canvas=api?.captureFrame?.();
            if(!canvas)return {capture:false};
            const gl=canvas.getContext('webgl2');
            const rgba=new Uint8Array(canvas.width*canvas.height*4);
            gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
            let visible=0,peak=0;
            for(let i=0;i<rgba.length;i+=4){const value=Math.max(rgba[i],rgba[i+1],rgba[i+2]);peak=Math.max(peak,value);if(value>8&&rgba[i+3]>8)visible++;}
            return {capture:true,width:canvas.width,height:canvas.height,bufferWidth:gl.drawingBufferWidth,bufferHeight:gl.drawingBufferHeight,
              sameCanvas:canvas===window.__bufferOriginalCanvas,sameContext:gl===window.__bufferOriginalContext,
              lost:gl.isContextLost(),error:gl.getError(),visible,peak,canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length};
          }));
        }
        await page.waitForTimeout(50);
        item.evidence=await page.evaluate(()=>window.__bufferResizeEvidence);
        assert.equal(item.evidence.contexts,1,'The existing native MAG must retain one real WebGL context');
        assert.equal(item.evidence.complete.length,1,'The original automatic intro completes once');
        assert(item.evidence.frameSizes.length>0&&item.evidence.frameSizes.every(s=>s.width>1&&s.height>1),'No presented frame can retain the transient released dimension');
        const both=item.evidence.batches.filter(b=>b.before.width!==b.after.width&&b.before.height!==b.after.height);
        assert(both.length>=2,'Exercise actual two-axis native buffer changes');
        item.twoAxisBatches=both.map(b=>({...b,intermediateNonempty:b.writes.slice(0,-1).filter(w=>w.width>0&&w.height>0&&(w.width!==b.after.width||w.height!==b.after.height)).length}));
        if(mobile){
          assert(both.every(b=>b.writes.every(w=>w.value>0)),'Mobile keeps its original nonzero allocation sequence');
        }else{
          assert(item.twoAxisBatches.every(b=>b.intermediateNonempty===0),'Desktop must not allocate a nonfinal full-area intermediate pair');
        }
        for(const view of item.views){
          assert(view.capture&&view.sameCanvas&&view.sameContext&&!view.lost,'Viewport resize preserves the real original canvas and context');
          assert.equal(view.error,0,'Native resize and actual pixel readback have no GL error');
          assert.equal(view.canvasCount,1,'No replacement canvas');
          assert.equal(view.width,view.bufferWidth);assert.equal(view.height,view.bufferHeight);
          assert(view.width>2&&view.height>2&&view.visible>150&&view.peak>8,'Actual native pixels survive the resized backing store');
        }
        assert.equal(item.errors.length,0,'No page errors');item.pass=true;
      }catch(error){item.failure=String(error);item.evidence=await page.evaluate(()=>window.__bufferResizeEvidence).catch(()=>null);throw error;}
      finally{report.cases.push(item);fs.writeFileSync(output,JSON.stringify(report,null,2));await context.close();}
    }
  }finally{await browser.close();}
  console.log('MAG_BUFFER_RESIZE_R2128_PASS '+JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1;});
