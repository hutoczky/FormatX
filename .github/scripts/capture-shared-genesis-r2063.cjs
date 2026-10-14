'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const output='artifacts/r2054-visitor-parity/genesis-r2063';
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
fs.mkdirSync(output,{recursive:true});
const report={sha:process.env.AUDITED_SHA,url,cases:[]};
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
  try{
    for(const profile of ['desktop','mobile']){
      const mobile=profile==='mobile';
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},
        isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale:'hu-HU',colorScheme:'dark',
        recordVideo:{dir:output,size:mobile?{width:390,height:844}:{width:1440,height:900}}});
      await context.addInitScript(()=>{
        const evidence=window.__fxGenesisCapture={start:[],ready:[],complete:[],errors:[]};
        document.addEventListener('formatx:magbirthstart',()=>evidence.start.push(performance.now()));
        addEventListener('formatx:real3dready',()=>{
          window.__fxGenesisCanvas=window.FormatXLivingCore?.canvas;
          evidence.ready.push({at:performance.now(),width:window.__fxGenesisCanvas?.width,height:window.__fxGenesisCanvas?.height});
        });
        document.addEventListener('formatx:magbirthcomplete',()=>evidence.complete.push({at:performance.now(),
          sameCanvas:window.FormatXLivingCore?.canvas===window.__fxGenesisCanvas,
          returnedHome:Boolean(window.__fxGenesisCanvas?.closest('#hero'))}));
      });
      const page=await context.newPage();
      const trace=await context.newCDPSession(page);
      await trace.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,v8',transferMode:'ReturnAsStream'});
      const errors=[];page.on('pageerror',error=>errors.push(String(error)));
      const item={profile,errors};
      try{
        await page.goto(url,{waitUntil:'domcontentloaded'});
        await page.waitForSelector('.fx-mag-birth-r533[data-fx-renderer="canonical"]',{state:'visible',timeout:5000});
        item.intro=await page.evaluate(()=>{
          const stage=window.FormatXLivingCore?.stage,style=stage&&getComputedStyle(stage);
          return {at:performance.now(),overlayVisible:Boolean(document.querySelector('.fx-mag-birth-r533[data-fx-renderer="canonical"]')),
            stageOpacity:style?.opacity,stageVisibility:style?.visibility,transform:style?.transform,
            position:style?.position,left:style?.left,top:style?.top,width:style?.width,height:style?.height,
            inline:stage?.getAttribute('style'),bounds:stage?.getBoundingClientRect().toJSON(),originalParent:Boolean(stage?.closest('#hero')),
            ancestors:stage?[stage.parentElement,stage.closest('.hero-grid'),stage.closest('#hero'),document.getElementById('main-content')].filter(Boolean).map(node=>{
              const css=getComputedStyle(node);return {className:node.className,id:node.id,transform:css.transform,translate:css.translate,
                scale:css.scale,perspective:css.perspective,filter:css.filter,contain:css.contain,willChange:css.willChange,zoom:css.zoom};
            }):[]};
        });
        const box=item.intro.bounds;
        assert.ok(box&&box.width>100&&box.height>100&&box.right>0&&box.left<(mobile?390:1440)
          &&box.bottom>0&&box.top<(mobile?844:900),'The actual native intro subject must remain inside the viewport');
        await page.waitForFunction(()=>window.__fxGenesisCapture.complete.length>0,null,{timeout:5000});
        await page.waitForFunction(()=>document.documentElement.dataset.fxCoreFirstFrameR1913==='painted',null,{timeout:5000});
        await page.screenshot({path:path.join(output,profile+'-mag.png')});
        item.evidence=await page.evaluate(()=>({events:window.__fxGenesisCapture,
          canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
          renderer:window.FormatXLivingCore?.renderer,
          continuity:document.documentElement.dataset.fxMagBirthContinuityR2063}));
        assert.equal(item.evidence.canvasCount,1);
        assert.equal(item.evidence.continuity,'same-canvas-context-geometry-input-and-lifecycle');
        assert.equal(item.evidence.events.complete[0].sameCanvas,true);
        assert.equal(item.evidence.events.complete[0].returnedHome,true);
        assert.equal(errors.length,0);
      }catch(error){item.failure=String(error);await page.screenshot({path:path.join(output,profile+'-failure.png')}).catch(()=>{});}
      const completed=new Promise(resolve=>trace.once('Tracing.tracingComplete',resolve));
      await trace.send('Tracing.end');
      const {stream}=await completed;
      let encoded='';
      for(;;){const part=await trace.send('IO.read',{handle:stream});encoded+=part.data;if(part.eof)break;}
      await trace.send('IO.close',{handle:stream});
      const events=JSON.parse(encoded).traceEvents;
      const names=new Map(events.filter(event=>event.name==='thread_name').map(event=>[event.pid+':'+event.tid,event.args?.name]));
      item.trace={longest:events.filter(event=>event.ph==='X'&&event.dur>=50000)
        .sort((a,b)=>b.dur-a.dur).slice(0,30).map(event=>({name:event.name,ms:event.dur/1000,
          at:event.ts/1000,thread:names.get(event.pid+':'+event.tid)||'',data:event.args?.data})),
        layoutMs:events.filter(event=>event.ph==='X'&&/^(Layout|UpdateLayoutTree)$/.test(event.name)).reduce((sum,event)=>sum+event.dur/1000,0)};
      fs.writeFileSync(path.join(output,profile+'-trace-summary.json'),JSON.stringify(item.trace,null,2));
      await trace.detach();
      const video=page.video();
      await context.close();
      if(video){const saved=path.join(output,profile+'-intro-to-mag.webm');await video.saveAs(saved);item.video=saved;}
      report.cases.push(item);
      fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
    }
  }finally{await browser.close();}
  console.log('SHARED_GENESIS_VISUAL_EVIDENCE',JSON.stringify(report));
  if(report.cases.some(item=>item.failure))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
