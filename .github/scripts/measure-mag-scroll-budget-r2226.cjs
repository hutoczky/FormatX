'use strict';
/* R2226 - read-only native WebGL/DOM scroll budget audit. This is NOT a GPU
   frame-rate benchmark: RAF intervals reflect browser main-thread cadence. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const origin=process.env.FORMATX_SCROLL_AUDIT_URL||'https://www.formatxsuite.com/scifi-ui/';
const specs=[
  {name:'desktop',width:1366,height:768,mobile:false},
  {name:'mobile',width:390,height:844,mobile:true}
];
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
        cls:audit.shifts.reduce((a,b)=>a+b.value,0),
        nativeCanvasCount:document.querySelectorAll('#hero canvas').length,
        paperFolios:document.querySelectorAll('.fx-archive-cinema-folio-r2030').length,
        anchorHeightOverrides:document.querySelectorAll('[data-fx-cinema-anchor-height]').length,
        magReady:!!core?.canvas,
        archiveState:archive?.state||null,
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
    const started=await page.evaluate(()=>{
      window.__fxScrollAudit.scrollStart=performance.now();
      window.__fxScrollAudit.frameTimes=[];
      const finishAt=performance.now()+3300;
      function step(t){
        const a=window.__fxScrollAudit;
        if(!a)return;
        a.frameTimes.push(t);
        if(t<finishAt)requestAnimationFrame(step);
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
      const frames=a.frameTimes.filter(t=>t>=started&&t<=now);
      const gaps=frames.slice(1).map((t,i)=>t-frames[i]);
      const sorted=gaps.slice().sort((a,b)=>a-b);
      const p95=sorted[Math.floor(sorted.length*.95)]||null;
      const late=a.longtasks.filter(x=>x.start>=started);
      const root=document.documentElement;
      return {
        scrollY:Math.round(scrollY),
        frames:frames.length,
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
        attributeSetups:Number(root.dataset.fxArchiveAttributeSwitchesR2228)||0,
        archiveState:window.FormatXArchiveExperience?.state||null,
        chapters:window.FormatXMagChapters?.audit()||null,
        pricingOpen:document.getElementById('pricing')?.dataset.fxExpanded||null,
        pageErrors:a.errors
      };
    },started);
    console.log('FX_SCROLL_INPUT_R2226 '+JSON.stringify({profile:spec.name,trial,...result,errors}));
    assert.equal(errors.length,0,'Runtime errors '+spec.name+': '+errors.join(','));
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
    assert(result.drawCalls>0&&result.attributeSetups>0,
      spec.name+' R2228 shared native WebGL VAO pass did not draw');
    assert(result.attributeSetups<result.drawCalls*Math.max(1,result.archiveState?.frames||1),
      spec.name+' redundant WebGL2 vertex attribute setup exceeded draw budget');
    assert(result.pricingOpen==='true',spec.name+' checkout folded after scroll');
    assert(result.chapters?.total>=8,spec.name+' editorial chapter UI missing');
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
