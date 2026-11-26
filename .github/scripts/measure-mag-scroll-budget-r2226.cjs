'use strict';
/* R2226 - read-only native WebGL/DOM scroll budget audit. This is NOT a GPU
   frame-rate benchmark: RAF intervals reflect browser main-thread cadence. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const origin=process.env.FORMATX_SCROLL_AUDIT_URL||'https://www.formatxsuite.com/scifi-ui/';
const specs=[
  {name:'desktop',width:1366,height:768,mobile:false},
  {name:'mobile',width:390,height:844,mobile:true}
];
// This separate, post-benchmark check intentionally seeks exact native
// scroll coordinates. It does not contribute to the interaction FPS sample.
async function proveReactor(page,spec){
  const out=process.env.FORMATX_REACTOR_PROOF_DIR||'formatx-reactor-proof';
  fs.mkdirSync(out,{recursive:true});
  for(const kind of ['entry','corridor']){
    const before=await page.evaluate(kind=>{
      const a=window.FormatXArchiveExperience;
      const hosts=Array.from(document.querySelectorAll('main#main-content > [data-fx-cinema-anchor-height]'))
        .filter(n=>n.getBoundingClientRect().height>0);
      const host=hosts[kind==='entry'?0:1];
      if(!host||!a?.state?.reactorProof)throw Error('Missing native reactor chapter');
      // Both positions must lie INSIDE the active host's .52vh reading line.
      // .25 puts the target above that line and is ambiguous near boundaries.
      const p=kind==='entry'?.38:.43;
      const previous=a.state.reactorProof[kind==='entry'?'entryFrames':'corridorFrames'];
      return {previous,host:host.id||host.className,p};
    },kind);
    let sampled=false,lastPosition=null;
    for(let attempt=0;attempt<3&&!sampled;attempt++){
      lastPosition=await page.evaluate(({kind,p})=>{
        const hosts=Array.from(document.querySelectorAll('main#main-content > [data-fx-cinema-anchor-height]'))
          .filter(n=>n.getBoundingClientRect().height>0);
        const host=hosts[kind==='entry'?0:1];
        if(!host)throw Error('Missing proof host');
        const targetTop=innerHeight*(.88-1.15*p),r=host.getBoundingClientRect();
        // Re-read after native layout changes instead of scrolling against
        // a stale mobile viewport. Do not call a forced render API.
        if(Math.abs(r.top-targetTop)>2)
          window.scrollBy({top:r.top-targetTop,left:0,behavior:'instant'});
        return {top:r.top,targetTop,scrollY,host:host.id||host.className};
      },{kind,p:before.p});
      try{
        await page.waitForFunction(({kind,previous})=>{
          const s=window.FormatXArchiveExperience?.state;
          const root=document.documentElement.dataset;
          const hosts=Array.from(document.querySelectorAll('main#main-content > [data-fx-cinema-anchor-height]'))
            .filter(n=>n.getBoundingClientRect().height>0);
          const host=hosts[kind==='entry'?0:1];
          return host?.dataset.fxCinemaHostActive==='true' &&
            s?.reactorProof?.[kind==='entry'?'entryFrames':'corridorFrames']>previous &&
            (kind==='entry'?root.fxArchiveReactorEntryR2261==='ingress':
              Boolean(root.fxArchiveCorridorR2265&&root.fxArchiveCorridorR2265!=='clear'));
        },{kind,previous:before.previous},{timeout:6500});
        sampled=true;
      }catch(e){
        if(e.name!=='TimeoutError')throw e;
        const diagnostic=await page.evaluate(()=>({scrollY,viewport:innerHeight,
          scene:window.FormatXArchiveExperience?.state,
          gate:document.documentElement.dataset.fxArchiveReactorEntryR2261,
          corridor:document.documentElement.dataset.fxArchiveCorridorR2265,
          hosts:Array.from(document.querySelectorAll('main#main-content > [data-fx-cinema-anchor-height]')).map(n=>({id:n.id,top:n.getBoundingClientRect().top,active:n.dataset.fxCinemaHostActive}))}));
        console.warn('FX_REACTOR_PROOF_RETRY_R2275 '+JSON.stringify({profile:spec.name,kind,attempt:attempt+1,lastPosition,diagnostic}));
      }
    }
    assert(sampled,spec.name+' '+kind+' did not render in the actual active chapter after three native seeks');
    const result=await page.evaluate(()=>{
      const s=window.FormatXArchiveExperience.state;
      const root=document.documentElement.dataset;
      const canvas=window.FormatXLivingCore?.canvas;
      const r=canvas?.getBoundingClientRect();
      return {scene:s.scene,progress:s.progress,reactorProof:s.reactorProof,
        gate:root.fxArchiveReactorEntryR2261,corridor:root.fxArchiveCorridorR2265,
        canvasVisible:Boolean(r&&r.width>0&&r.height>0),
        pricingOpen:document.getElementById('pricing')?.dataset.fxExpanded,
        error:s.error};
    });
    assert(result.canvasVisible&&!result.error,spec.name+' reactor canvas unavailable');
    assert.equal(result.pricingOpen,'true',spec.name+' checkout collapsed in reactor proof');
    await page.screenshot({path:path.join(out,spec.name+'-'+kind+'.png'),fullPage:false,timeout:20000});
    console.log('FX_REACTOR_VISUAL_PROOF_R2270 '+JSON.stringify({profile:spec.name,kind,...before,...result}));
  }
}
async function measure(browser,spec,trial){
  const context=await browser.newContext({
    viewport:{width:spec.width,height:spec.height},isMobile:spec.mobile,
    hasTouch:spec.mobile,deviceScaleFactor:1,locale:'hu-HU',
    reducedMotion:'no-preference'
  });
  await context.addInitScript(()=>{
    try{
      localStorage.setItem('formatx:intro-seen-v1','1');
      sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');
    }catch(_){}
    const results={longtasks:[],shifts:[],errors:[]};
    window.__fxScrollAudit=results;
    try{new PerformanceObserver(entries=>{
      for(const e of entries.getEntries()){
        results.longtasks.push({start:Math.round(e.startTime),
          duration:Math.round(e.duration)});
      }
    }).observe({type:'longtask',buffered:true});}catch(e){
      results.errors.push(String(e));
    }
    try{new PerformanceObserver(entries=>{
      for(const e of entries.getEntries()){
        if(!e.hadRecentInput)results.shifts.push({
          start:Math.round(e.startTime),value:e.value
        });
      }
    }).observe({type:'layout-shift',buffered:true});}catch(e){
      results.errors.push(String(e));
    }
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
    const url=new URL(origin);
    url.searchParams.set('scroll-budget','r2229-'+spec.name+'-'+trial);
    url.searchParams.set('intro','0');
    const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:60000});
    assert.equal(response?.status(),200,spec.name+' production HTML unavailable');
    await page.waitForTimeout(3400);
    const idle=await page.evaluate(()=>{
      const audit=window.__fxScrollAudit;
      const core=window.FormatXLivingCore||window.FormatXCoreMobileV69;
      const archive=window.FormatXArchiveExperience;
      return {
        ms:Math.round(performance.now()),
        longtasks:audit.longtasks.slice(0,80),
        idleTaskTotalMs:audit.longtasks.reduce((sum,x)=>sum+x.duration,0),
        idleLongestTaskMs:Math.max(0,...audit.longtasks.map(x=>x.duration)),
        cls:audit.shifts.reduce((a,b)=>a+b.value,0),
        nativeCanvasCount:document.querySelectorAll('#hero canvas').length,
        paperFolios:document.querySelectorAll('.fx-archive-cinema-folio-r2030').length,
        anchorHeightOverrides:document.querySelectorAll('[data-fx-cinema-anchor-height]').length,
        layoutBatch:document.documentElement.dataset.fxArchiveLayoutBatchR2230||'',
        layoutReadCount:Number(document.documentElement.dataset.fxArchiveLayoutReadCountR2230)||0,
        magReady:!!core?.canvas,
        archiveState:archive?.state||null,
        idleSync:document.documentElement.dataset.fxArchiveIdleFirstSyncR2235||'',
        archiveExperience:document.documentElement.dataset.fxArchiveExperience||'',
        rendererClass:document.documentElement.dataset.fxCoreRendererClassR1541||'',
        qualityPolicy:document.documentElement.dataset.fxArchiveQualityPolicyR2227||'',
        archiveEngagement:document.documentElement.dataset.fxArchiveEngagementR2220||'',
        chapterCount:document.documentElement.dataset.fxMagChapterCount||'',
        sectionCount:document.querySelectorAll('main#main-content > section').length
      };
    });
    console.log('FX_SCROLL_IDLE_R2226 '+JSON.stringify({profile:spec.name,trial,...idle}));
    assert.equal(idle.archiveEngagement,'awaiting-visitor',
      spec.name+' archive started without gesture');
    if(idle.paperFolios>0){
      assert.equal(idle.idleSync,'complete',
        spec.name+' native home scene never completed first idle synchronization');
      assert(idle.archiveState?.idleComposed===true,
        spec.name+' idle archive remains in repeated DOM compose mode');
      assert(idle.archiveState?.domComposes<=5,
        spec.name+' repeated idle DOM compositions: '+idle.archiveState?.domComposes);
      assert.equal(idle.layoutBatch,'read-before-write',
        spec.name+' archiver did not batch native layout reads');
      assert(idle.layoutReadCount>=1&&idle.layoutReadCount<=idle.paperFolios,
        spec.name+' duplicate section geometry measurement '+JSON.stringify(idle));
    }
    const started=await page.evaluate(()=>{
      window.__fxScrollAudit.scrollStart=performance.now();
      window.__fxScrollAudit.frameTimes=[];
      window.__fxScrollAudit.sampleActive=true;
      function step(t){
        const a=window.__fxScrollAudit;
        if(!a)return;
        a.frameTimes.push(t);
        if(a.sampleActive)requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      return window.__fxScrollAudit.scrollStart;
    });
    // Real input, not programmatic scrollIntoView. No page interactions that
    // could submit an order or change checkout/legal state.
    for(let i=0;i<11;i++){
      await page.mouse.wheel(0,Math.round(spec.height*.56));
      await page.waitForTimeout(115);
    }
    await page.waitForTimeout(1900);
    const result=await page.evaluate(started=>{
      const a=window.__fxScrollAudit,now=performance.now();
      a.sampleActive=false;
      const frames=a.frameTimes.filter(t=>t>=started&&t<=now);
      const gaps=frames.slice(1).map((t,i)=>t-frames[i]);
      const sorted=gaps.slice().sort((a,b)=>a-b);
      const p95=sorted.length?sorted[Math.ceil(sorted.length*.95)-1]:null;
      const late=a.longtasks.filter(x=>x.start>=started);
      const root=document.documentElement;
      return {
        scrollY:Math.round(scrollY),
        frames:frames.length,
        observationMs:+(now-started).toFixed(2),
        raf60TargetMet:p95!==null&&p95<=20,
        rafSampleRateHz:frames.length>1?+((frames.length-1)*1000/(frames.at(-1)-frames[0])).toFixed(2):null,
        p95FrameGapMs:p95===null?null:+p95.toFixed(2),
        worstFrameGapMs:sorted.length?+sorted.at(-1).toFixed(2):null,
        gapsOver50Ms:gaps.filter(n=>n>50).length,
        longtasks:late.slice(0,50),
        longtaskTotalMs:late.reduce((sum,x)=>sum+x.duration,0),
        paperFolios:document.querySelectorAll('.fx-archive-cinema-folio-r2030').length,
        sectionCount:document.querySelectorAll('main#main-content > section').length,
        archiveEngagement:root.dataset.fxArchiveEngagementR2220||'',
        archiveCinema:root.dataset.fxArchiveCinema||'',
        archiveError:root.dataset.fxArchiveError||'',
        rendererClass:root.dataset.fxCoreRendererClassR1541||'',
        qualityPolicy:root.dataset.fxArchiveQualityPolicyR2227||'',
        drawCalls:Number(root.dataset.fxArchiveDrawCalls)||0,
        scalarWrites:Number(root.dataset.fxArchiveScalarWritesR2239)||0,
        scalarSkips:Number(root.dataset.fxArchiveScalarSkipsR2239)||0,
        attributeSetups:Number(root.dataset.fxArchiveAttributeSwitchesR2228)||0,
        archiveState:window.FormatXArchiveExperience?.state||null,
        chapters:window.FormatXMagChapters?.audit()||null,
        pricingOpen:document.getElementById('pricing')?.dataset.fxExpanded||null,
        pageErrors:a.errors
      };
    },started);
    console.log('FX_SCROLL_INPUT_R2226 '+JSON.stringify({profile:spec.name,trial,...result,errors}));
    assert.equal(errors.length,0,'Runtime errors '+spec.name+': '+errors.join(','));
    assert(result.frames>=2&&result.p95FrameGapMs!==null,spec.name+' insufficient RAF samples');
    if(!result.raf60TargetMet)console.warn('FX_SCROLL_60HZ_TARGET_MISSED '+JSON.stringify({profile:spec.name,trial,p95:result.p95FrameGapMs,renderer:result.rendererClass}));
    if(process.env.FORMATX_ENFORCE_60HZ==='1')assert(result.raf60TargetMet,spec.name+' missed 60Hz cadence budget');
    assert(result.scrollY>200,spec.name+' wheel did not advance native page scroll');
    assert(result.archiveEngagement.startsWith('visitor-'),
      spec.name+' genuine scroll did not activate cinematic navigation');
    if(result.rendererClass==='software-adaptive'){
      assert.equal(result.qualityPolicy,'software-lite-single-webgl2',
        spec.name+' software WebGL missed MAG archive fallback');
      assert.equal(result.archiveState?.quality,'low',
        spec.name+' software GPU still requests premium desktop paper meshes');
      assert(result.archiveState?.targetFrameMs>=32,
        spec.name+' software renderer should reserve a low-power frame budget');
    }
    if(result.rendererClass==='software-adaptive'&&!spec.mobile){
      assert(result.drawCalls<=26,
        spec.name+' low-power archive still draws auxiliary desktop struts: '+result.drawCalls);
    }
    if(result.rendererClass==='hardware-full'&&!spec.mobile){
      assert.equal(result.qualityPolicy,'hardware-photographic-full',
        'Do not downgrade the genuine GPU-backed desktop MAG');
    }
    const reactor=result.archiveState?.reactorProof;
    assert(reactor&&Number.isInteger(reactor.entryFrames)&&Number.isInteger(reactor.corridorFrames),'missing reactor render telemetry');
    console.log('FX_REACTOR_RENDER_PROOF_R2268 '+JSON.stringify({profile:spec.name,trial,...reactor}));
    if(reactor.entryFrames+reactor.corridorFrames===0)console.warn('FX_REACTOR_TRANSIT_NOT_SAMPLED '+spec.name+' '+trial);
    assert(result.drawCalls>0&&result.attributeSetups>0,
      spec.name+' R2228 shared native WebGL VAO pass did not draw');
    assert(result.attributeSetups<result.drawCalls*Math.max(1,result.archiveState?.frames||1),
      spec.name+' redundant WebGL2 vertex attribute setup exceeded draw budget');
    assert(result.pricingOpen==='true',spec.name+' checkout folded after scroll');
    assert(result.chapters?.total>=8,spec.name+' editorial chapter UI missing');
    if(trial===1)await proveReactor(page,spec);
  }finally{await context.close();}
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist','--enable-webgl'
  ]});
  try{for(const spec of specs)for(let trial=1;trial<=2;trial++)await measure(browser,spec,trial);}
  finally{await browser.close();}
})().catch(e=>{console.error('FX_SCROLL_MEASURE_FAIL '+String(e.stack||e));process.exit(1);});
