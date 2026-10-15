'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

/* R2116 GPU proof: the capability check cannot retain an auxiliary
   WebGL context on constrained Android hardware. Ensure the real visitor
   loader uses this exact patched Three owner rather than stale cache. */
const threeOwner=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const filmOwner=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const fallbackSource=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-reference-film-r649.js','utf8');
assert.ok(
  fallbackSource.includes('const irisTravel=.058*engage*(1-.52*seat);') &&
  fallbackSource.includes('ctx.translate(rx*irisTravel,0);') &&
  fallbackSource.includes('const rot=.29*engage-.14*seat'),
  'R2122 requires actual moving metal shutters, not static decorative iris art'
);
const pageSource=fs.readFileSync('docs/scifi-ui/index.html','utf8');
assert.ok(
  threeOwner.includes("gl?.getExtension('WEBGL_lose_context')?.loseContext()") &&
  threeOwner.includes('fxMagGpuProbeR2116') &&
  filmOwner.includes('formatx-mag-genesis-three-r1280.js?v=20261015-r2116-release-capability-webgl-context') &&
  pageSource.includes('formatx-mag-birth-live-r533.js?v=20261015-r2116-three-first-gpu-probe'),
  'R2116 native Three route must release the probe GPU and use exact up-to-date loader URLs'
);
const HOME=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2103-real-mobile-fallback';
const CASES=[
  {name:'phone-390-midfilm',width:390,height:844,second:4.40},
  {name:'phone-390-iris-engaged',width:390,height:844,second:6.35},
  {name:'phone-390-identity',width:390,height:844,second:8.50},
  {name:'phone-360-midfilm',width:360,height:780,second:4.40}
];
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage',
    '--enable-webgl','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]});
  const records=[];
  try{
    for(const shot of CASES){
      const context=await browser.newContext({
        viewport:{width:shot.width,height:shot.height},
        isMobile:true,hasTouch:true,deviceScaleFactor:2,
        locale:'hu-HU',reducedMotion:'no-preference'
      });
      try{
        const page=await context.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(
          HOME+'?intro=1&visualintro=1&proofrenderer=reference&introframe='+
          shot.second+'&r2103='+shot.name,
          {waitUntil:'domcontentloaded',timeout:60000}
        );
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          return root.dataset.fxMagBirthVisualFrameR659==='ready'
            &&root.dataset.fxMagFallbackSilhouetteR2103===
              'four-point-bevelled-metal-glass-iris';
        },null,{timeout:45000});
        const info=await page.evaluate(()=>{
          const root=document.documentElement;
          const overlay=document.querySelector('.fx-mag-birth-r533');
          const canvas=overlay?.querySelector('canvas.fxb-particles');
          const skip=overlay?.querySelector('.fxb-skip');
          const img=canvas?.getContext('2d');
          const size=canvas?.getBoundingClientRect();
          const button=skip?.getBoundingClientRect();
          const css=skip?getComputedStyle(skip):null;
          const egg=overlay?.querySelector('.fxb-embryo');
          const eggCss=egg?getComputedStyle(egg):null;
          const sampled=img?.getImageData(
            Math.max(0,Math.floor((canvas?.width||2)*.5)),
            Math.max(0,Math.floor((canvas?.height||2)*.5)),1,1
          ).data;
          return {
            renderer:root.dataset.fxMagBirthRendererR1360,
            progress:root.dataset.fxMagBirthVisualFrameSeconds,
            silhouette:root.dataset.fxMagFallbackSilhouetteR2103,
            premium:root.dataset.fxMagFallbackSilhouetteR2104,
            optic:root.dataset.fxMagFallbackOpticR2104,
            diameter:Number(root.dataset.fxMagFallbackDiameterR2103),
            viewportRatio:Number(root.dataset.fxMagMobileViewportRatioR2115||0),
            genomeTimeline:root.dataset.fxMagGenomeFadeR2115||'',
            filmStyle:getComputedStyle(overlay?.querySelector('.fxb-genome-field')||overlay).display,
            width:innerWidth,height:innerHeight,
            canvasRect:{width:size?.width||0,height:size?.height||0},
            buffer:{width:canvas?.width||0,height:canvas?.height||0},
            pixel:[...(sampled||[])],
            // Optical richness is evaluated from *actual rendered pixels*
            // around the center, rather than from source flags alone.
            opticalSamples:(()=>{
              if(!img||!canvas)return {distinct:0,lumaSpread:0,opaque:0};
              const radius=Math.max(16,Math.floor(
                Number(root.dataset.fxMagFallbackDiameterR2103||0)*
                (canvas.width/Math.max(1,innerWidth))*.26));
              const x=Math.max(0,Math.floor(canvas.width/2-radius));
              const y=Math.max(0,Math.floor(canvas.height/2-radius));
              const w=Math.min(canvas.width-x,2*radius);
              const h=Math.min(canvas.height-y,2*radius);
              if(w<10||h<10)return {distinct:0,lumaSpread:0,opaque:0};
              const data=img.getImageData(x,y,w,h).data;
              const bins=new Set();
              let min=255,max=0,opaque=0;
              for(let py=0;py<h;py+=Math.max(1,Math.floor(h/35))){
                for(let px=0;px<w;px+=Math.max(1,Math.floor(w/35))){
                  const j=(py*w+px)*4;
                  if(data[j+3]<30)continue;
                  opaque++;
                  const lum=.2126*data[j]+.7152*data[j+1]+.0722*data[j+2];
                  min=Math.min(min,lum);max=Math.max(max,lum);
                  bins.add([data[j]>>3,data[j+1]>>3,data[j+2]>>3].join('-'));
                }
              }
              return {distinct:bins.size,lumaSpread:Math.round(max-min),opaque};
            })(),
            skip:skip?.textContent?.trim()||'',
            skipOpacity:Number(css?.opacity||0),
            skipColor:css?.color,
            skipBox:{x:button?.x||0,y:button?.y||0,
              width:button?.width||0,height:button?.height||0},
            legacyEggVisible:!!egg && eggCss?.display!=='none'
              &&Number(eggCss?.opacity||0)>.01,
            loader:[...document.scripts]
              .find(x=>x.src.includes('formatx-mag-reference-film-r649.js'))?.src||'',
            fallBackQuality:root.dataset.fxMagFallbackBudgetR1727||''
          };
        });
        await page.screenshot({
          path:OUT+'/'+shot.name+'.png',animations:'allow'
        });
        fs.writeFileSync(OUT+'/'+shot.name+'.json',
          JSON.stringify({shot,info,errors},null,2)+'\n');
        console.log('R2103_REAL_FALLBACK',JSON.stringify({shot:shot.name,...info}));
        assert.deepEqual(errors,[],'Fallback produces browser runtime errors');
        assert.equal(info.silhouette,'four-point-bevelled-metal-glass-iris');
        assert.equal(info.premium,'sculpted-fourpoint-3d-illusion-machined-optic');
        assert.equal(info.optic,'eight-deep-shutter-blades-sapphire-glass');
        assert.equal(info.filmStyle,'none',
          'Legacy DNA strands still intrude into the final MAG composition');
        assert.ok(
          info.renderer==='native-canvas-reference-film',
          'Expected actual painted 2D R649 fallback: '+JSON.stringify(info)
        );
        assert.ok(info.diameter>=shot.width*.48&&
          info.diameter<=shot.width*.53,
          'R2115 mobile MAG must be a full, centered 48-53% wide solid object: '+
            JSON.stringify(info));
        assert.ok(info.viewportRatio>=.48&&info.viewportRatio<=.53,
          'Physical camera/framing deviates from measured phone width: '+
            JSON.stringify(info));
        assert.equal(info.genomeTimeline,'fully-off-by-2.82-seconds',
          'Legacy DNA waves must disappear before premium MAG hero scene');
        assert.ok(info.buffer.width>100&&info.buffer.height>100,
          'Canvas has no real backing surface');
        assert.ok(info.pixel.length===4&&info.pixel[3]>12,
          'No actual fallback center optic framebuffer pixel');
        assert.ok(info.opticalSamples.distinct>=40&&
          info.opticalSamples.lumaSpread>=36&&
          info.opticalSamples.opaque>=100,
          'Flat, dark or detail-free fallback is not acceptable: '+
            JSON.stringify(info.opticalSamples));
        assert.ok(info.skipOpacity>.95&&info.skipBox.width>=90
          &&info.skipBox.height>=44,
          'Unreadable or untappable Skip button: '+JSON.stringify(info));
        assert.ok(!info.legacyEggVisible,
          'Legacy CSS egg is obscuring the new machined MAG movie');
        assert.ok(info.loader.includes('r2115-premium-contained-no-dna-overlap'),
          'Stale browser cache is loading old giant-oval renderer');
        records.push({shot,info});
      }finally{await context.close()}
    }
    /* R2107: record the actual 10-second animated R649 film instead of
       accepting three frozen reference-frame screenshots as complete proof.
       Capture includes the original late overlay teardown, not an artistic
       mock-up. The entire mobile film is an Actions artifact. */
    const realFilm=await browser.newContext({
      viewport:{width:390,height:844},isMobile:true,hasTouch:true,
      deviceScaleFactor:2,locale:'hu-HU',reducedMotion:'no-preference',
      recordVideo:{dir:OUT,size:{width:390,height:844}}
    });
    let filmVideo=null;
    let filmStatus=null;
    try{
      const page=await realFilm.newPage();
      filmVideo=page.video();
      /* R2119: capture BOTH actual native film phases in the page's own
         animation clock, not 3.6/5.4 seconds AFTER the async renderer-ready
         wait (which can finish when the 10s film is almost over on CI).
         This makes the acceptance stricter and temporally correct: a real
         painted 35-50% frame and a real painted 55-73% frame are required. */
      await page.addInitScript(() => {
        const captured={first:null,second:null};
        window.__fxR2119ActualFrames=captured;
        let previous=0;
        const record=(phase,seconds,progress,canvas)=>{
          const ctx=canvas?.getContext('2d');
          if(!ctx||!canvas.width||!canvas.height)return;
          const x=Math.floor(canvas.width/2),y=Math.floor(canvas.height/2);
          const width=Math.min(65,canvas.width-x);
          const height=Math.min(65,canvas.height-y);
          const pixel=[...ctx.getImageData(x,y,1,1).data];
          const bytes=ctx.getImageData(x,y,width,height).data;
          const bins=new Set();
          let min=255,max=0;
          for(let k=0;k<bytes.length;k+=36){
            if(bytes[k+3]<20)continue;
            const luminance=bytes[k]*.2126+bytes[k+1]*.7152+
              bytes[k+2]*.0722;
            min=Math.min(min,luminance);
            max=Math.max(max,luminance);
            bins.add([bytes[k]>>4,bytes[k+1]>>4,bytes[k+2]>>4].join('-'));
          }
          captured[phase]={
            actualSeconds:seconds,
            easedProgress:progress,
            canvasWidth:canvas.width,canvasHeight:canvas.height,
            center:pixel,
            detail:{differentColors:bins.size,lightSpread:Math.round(max-min)},
            renderer:document.documentElement.dataset.fxMagBirthRendererR1360||'',
            shape:document.documentElement.dataset.fxMagFallbackSilhouetteR2104||'',
            time:Math.round(performance.now())
          };
        };
        const loop=()=>{
          if(captured.first&&captured.second)return;
          const root=document.documentElement;
          const film=document.querySelector('.fx-mag-birth-r533');
          const canvas=film?.querySelector('canvas.fxb-particles');
          const value=Number(film?.querySelector('progress')?.value||0);
          const seconds=Number(film?.dataset.fxActualFilmSecondsR2121||0);
          /* R2120: the original progress meter can lead the first actual
             fallback paint by one or more animation ticks. Never mark the
             WebGL/canvas frame as a rendered MAG merely because progress
             reached 35%. Require the exact post-draw material identity
             published by drawMagStudio(), plus a visible owning canvas. */
          const style=canvas?getComputedStyle(canvas):null;
          const painted=(
            root.dataset.fxMagFallbackSilhouetteR2104===
              'sculpted-fourpoint-3d-illusion-machined-optic' &&
            root.dataset.fxMagFallbackOpticR2104===
              'eight-deep-shutter-blades-sapphire-glass'
          );
          if(root.dataset.fxMagBirthRendererR1360===
             'native-canvas-reference-film' && painted && canvas &&
             style?.display!=='none' && style?.visibility!=='hidden' &&
             Number(style?.opacity||0)>.85 &&
             canvas.width>100&&canvas.height>100){
            try{
              if(!captured.first&&seconds>=3.40&&seconds<=4.90)
                record('first',seconds,value,canvas);
              if(!captured.second&&seconds>=5.40&&seconds<=7.30)
                record('second',seconds,value,canvas);
            }catch(error){
              captured.error=String(error);
            }
          }
          if(value<100&&performance.now()<25000)
            requestAnimationFrame(loop);
        };
        document.addEventListener('DOMContentLoaded',
          ()=>requestAnimationFrame(loop),{once:true});
      });
      await page.goto(HOME+'?intro=1&visualintro=1&proofrenderer=reference'
        +'&r2107-real-mobile-film=1',{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>
        document.documentElement.dataset.fxMagBirthRendererR1360
        ==='native-canvas-reference-film',null,{timeout:35000});
      /* R2109: sample ACTUAL moving film, not just isolated proof frames. */
      const liveSamples=[];
      for(const [i,ms] of [1800,1800,1800,1800,1800].entries()){
        await page.waitForTimeout(ms);
        const sample=await page.evaluate(()=>{
          const root=document.documentElement;
          const film=document.querySelector('.fx-mag-birth-r533');
          const canvas=film?.querySelector('canvas.fxb-particles');
          const cs=canvas?getComputedStyle(canvas):null;
          let center=[],detail={differentColors:0,lightSpread:0};
          try{
            const ctx=canvas?.getContext('2d');
            if(ctx&&canvas?.width>0&&canvas?.height>0){
              const x=Math.floor(canvas.width*.5),y=Math.floor(canvas.height*.5);
              center=[...ctx.getImageData(x,y,1,1).data];
              const w=Math.min(65,canvas.width-x),h=Math.min(65,canvas.height-y);
              const pixels=ctx.getImageData(x,y,w,h).data;
              const bins=new Set();let min=255,max=0;
              for(let j=0;j<pixels.length;j+=4*9){
                if(pixels[j+3]<20)continue;
                const lum=pixels[j]*.2126+pixels[j+1]*.7152+pixels[j+2]*.0722;
                min=Math.min(min,lum);max=Math.max(max,lum);
                bins.add([pixels[j]>>4,pixels[j+1]>>4,pixels[j+2]>>4].join('-'));
              }
              detail={differentColors:bins.size,lightSpread:Math.round(max-min)};
            }
          }catch(error){detail.error=String(error)}
          return{
            phase:root.dataset.fxMagBirthPhase||'',
            filmPhase:film?.dataset.phase||'',
            renderer:root.dataset.fxMagBirthRendererR1360||'',
            visualVersion:root.dataset.fxMagFallbackSilhouetteR2104||'',
            canvasDisplay:cs?.display||'',canvasOpacity:cs?.opacity||'',
            canvasVisibility:cs?.visibility||'',canvasZ:cs?.zIndex||'',
            canvasStyle:canvas?.getAttribute('style')||'',
            performance:film?.dataset.performance||'',
            introR649:film?.dataset.fxIntroR649||'',
            progress:film?.querySelector('progress')?.value??null,
            center,detail
          };
        });
        liveSamples.push({elapsedSeconds:(i+1)*1.8,...sample});
        await page.screenshot({
          path:OUT+'/r2109-real-running-'+(i+1)+'-frame.png',
          animations:'allow'
        });
      }
      /* R2110 acceptance: inspect motion-driven *rendered* film samples,
         not screenshots of isolated forced clock frames. During the two
         central close-up scenes the real canvas must be visible and its
         native painted iris must contain tonal and chromatic detail. */
      /* The real 10-second film clock starts at shell mount, not when
         Playwright's delayed renderer-ready wait completes. By 7.2 seconds
         after that wait, the normal original film may already have finished
         and removed its canvas. That is a valid handoff, not a blank frame.
         Evaluate both observed mid-film frames; the later original hero
         and absence of the overlay are asserted independently below. */
      const actualFilmFrames=await page.evaluate(()=>
        window.__fxR2119ActualFrames||{});
      const midFilm=[
        actualFilmFrames.first,
        actualFilmFrames.second
      ].filter(Boolean);
      assert.ok(midFilm.length===2 &&
        midFilm[0].actualSeconds>=3.40&&midFilm[0].actualSeconds<=4.90 &&
        midFilm[1].actualSeconds>=5.40&&midFilm[1].actualSeconds<=7.30,
        'R2121 requires two separate ACTUAL painted four-point MAG frames at '+
        '3.4-4.9 and 5.4-7.3 seconds of the genuine 10-second film. '+
        'The visible progress uses cubic easing and is NOT elapsed time: '+
        JSON.stringify({
          captured:actualFilmFrames,lateSamples:liveSamples
        }));
      for(const sample of midFilm){
        assert.equal(sample.renderer,'native-canvas-reference-film',
          'Real fall-back film renderer changed during the animation');
        assert.equal(sample.shape,
          'sculpted-fourpoint-3d-illusion-machined-optic',
          'Real film did not paint the revised MAG at '+sample.actualSeconds);
        assert.ok(sample.canvasWidth>100&&sample.canvasHeight>100,
          'Real movie canvas has no pixels');
        assert.ok(sample.center.length===4&&sample.center[3]>=25,
          'Running film optical core was missing at '+sample.actualSeconds);
        assert.ok(sample.detail.differentColors>=5&&
          sample.detail.lightSpread>=12,
          'Real 3D-material silhouette is flat/undrawn at '+
          sample.actualSeconds+': '+JSON.stringify(sample));
      }
      fs.writeFileSync(OUT+'/r2119-real-time-inpage-film-proofs.json',
        JSON.stringify(actualFilmFrames,null,2)+'\\n');
      fs.writeFileSync(OUT+'/r2109-real-film-samples.json',
        JSON.stringify(liveSamples,null,2)+'\n');
      console.log('R2109_REAL_RUNNING_FRAME_SAMPLES',JSON.stringify(liveSamples));
      await page.waitForTimeout(2500);
      filmStatus=await page.evaluate(()=>{
        const intro=document.querySelector('.fx-mag-birth-r533');
        const css=intro?getComputedStyle(intro):null;
        return {
          renderer:document.documentElement.dataset.fxMagBirthRendererR1360||'',
          expectedPhysicalOptic:
            document.documentElement.dataset.fxMagFallbackOpticR2104||'',
          overlayVisible:!!intro&&css?.visibility!=='hidden'&&
            Number(css?.opacity||0)>.02,
          originalCanvas:document.querySelectorAll(
            '#hero .fx-crystal-organism-r326-canvas').length,
          originalDownloadCount:document.querySelectorAll('#hero-download').length
        };
      });
      await page.screenshot({
        path:OUT+'/r2107-ten-second-completed-mobile.png'
      });
    }finally{await realFilm.close()}
    if(filmVideo){
      const oldPath=await filmVideo.path();
      fs.renameSync(oldPath,OUT+'/r2107-390px-genuine-ten-second-mobile.webm');
    }
    fs.writeFileSync(OUT+'/r2107-film-handoff.json',
      JSON.stringify(filmStatus,null,2)+'\n');
    assert.equal(filmStatus?.expectedPhysicalOptic,
      'eight-deep-shutter-blades-sapphire-glass',
      'Genuine mobile film did not use the real R2104 optic');
    assert.ok(filmStatus&&!filmStatus.overlayVisible,
      'Original ten-second movie did not relinquish the screen: '+
        JSON.stringify(filmStatus));
    assert.equal(filmStatus.originalCanvas,1,
      'Film handoff created no original WebGL MAG or duplicated the canvas');
    assert.equal(filmStatus.originalDownloadCount,1,
      'Original checkout CTA disappeared or was duplicated during the movie');
    console.log('PASS R2107_REAL_TEN_SECOND_FILM',JSON.stringify(filmStatus));

    /* R2103 high-core 4GB Android routing: unlike the old <=4GB gate,
       the user agent must attempt the actual Three cinema first.
       Browser GPU compilation is tested separately by the full Three film
       gate; this case checks the precise capability decision before fallback. */
    const capable=await browser.newContext({
      viewport:{width:390,height:844},isMobile:true,hasTouch:true,
      deviceScaleFactor:2,locale:'hu-HU',reducedMotion:'no-preference',
      userAgent:'Mozilla/5.0 (Linux; Android 16; SM-S928B) '+
        'AppleWebKit/537.36 (KHTML, like Gecko) '+
        'Chrome/133.0.0.0 Mobile Safari/537.36'
    });
    try{
      await capable.addInitScript(()=>{
        Object.defineProperty(navigator,'hardwareConcurrency',
          {configurable:true,get:()=>8});
        Object.defineProperty(navigator,'deviceMemory',
          {configurable:true,get:()=>4});
        Object.defineProperty(navigator,'webdriver',
          {configurable:true,get:()=>undefined});
      });
      const page=await capable.newPage();
      await page.goto(HOME+'?intro=1&r2103-device-classification=1',
        {waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>{
        const root=document.documentElement;
        const loader=root.dataset.fxMagBirthThreeLoaderR1608||'';
        return loader.startsWith('lazy-owner')||loader==='existing-owner-wait'
          ||root.dataset.fxMagBirthRendererR1360==='threejs-active';
      },null,{timeout:18000});
      const info=await page.evaluate(()=>({
        cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory,
        loader:document.documentElement.dataset.fxMagBirthThreeLoaderR1608||'',
        renderer:document.documentElement.dataset.fxMagBirthRendererR1360||'',
        constraint:document.documentElement.dataset.fxMagBirthRendererR1729||'',
        owner:document.documentElement.dataset.fxMagBirthOwnerR533||''
      }));
      assert.equal(info.cores,8);
      assert.equal(info.memory,4);
      assert.ok(!info.constraint.includes('constrained'),
        '8-core, 4GB-reported high-end phone was incorrectly forced into the obsolete 2D movie: '+JSON.stringify(info));
      assert.ok(info.owner==='active',
        'Normal Android visit was incorrectly skipped: '+JSON.stringify(info));
      records.push({shot:{name:'high-core-phone-uses-real-three-first'},info});
      console.log('PASS R2103_HIGH_CORE_ANDROID',JSON.stringify(info));
    }finally{await capable.close()}
  }finally{await browser.close()}
  fs.writeFileSync(OUT+'/summary.json',JSON.stringify(records,null,2)+'\n');
})().catch(error=>{
  console.error(error.stack||String(error));
  process.exitCode=1;
});
