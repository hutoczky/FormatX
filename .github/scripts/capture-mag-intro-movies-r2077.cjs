'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const PAGE='http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2077-real-mag-movie';
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  const results=[];
  const failures=[];
  try{
    for(const profile of [
      {name:'desktop-1280',viewport:{width:1280,height:720},mobile:false},
      {name:'mobile-390',viewport:{width:390,height:844},mobile:true}
    ]){
      const directory=path.join(OUT,profile.name+'-captures');
      fs.mkdirSync(directory,{recursive:true});
      const context=await browser.newContext({
        viewport:profile.viewport,isMobile:profile.mobile,
        hasTouch:profile.mobile,locale:'hu-HU',
        reducedMotion:'no-preference',
        recordVideo:{dir:directory,size:profile.viewport}
      });
      let video=null,summary=null,renderedInTimedFilm=false,recordingError=null;
      try{
        // Warm the exact SOURCE Three shader in the same Chromium context
        // before starting the real recorded 10-second film. Without this,
        // SwiftShader plus video encoding may finish the entire intro before
        // the first cold WebGL shader compile becomes visible.
        const warmup=await context.newPage();
        try{
          await warmup.goto(PAGE+'?intro=1&visualintro=1&introframe=4.40&r2077-prewarm='+profile.name,
            {waitUntil:'domcontentloaded',timeout:60000});
          await warmup.waitForFunction(()=>
            document.documentElement.dataset.fxMagIntroGeometryR2075?.includes('8-physical-inset-rails'),
            null,{timeout:45000});
        }finally{await warmup.close();}
        const page=await context.newPage();
        video=page.video();
        const errors=[];
        page.on('pageerror',error=>errors.push(String(error.message)));
        await page.goto(PAGE+'?intro=1&visualintro=1&fullfilm=1&r2077-film='+profile.name,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>document.documentElement.dataset.fxMagBirthLiveR533==='active',
          null,{timeout:40000});
        try{
          await page.waitForFunction(()=>
            document.documentElement.dataset.fxMagIntroGeometryR2075?.includes('8-physical-inset-rails'),
            null,{timeout:16000});
          renderedInTimedFilm=true;
        }catch(_){
          // Preserve actual video as diagnostic evidence even when CI's
          // software encoder outruns first-load physical shader preparation.
          renderedInTimedFilm=false;
        }
        // Playback is the ACTUAL user timeline, never introframe stills or
        // a six-image generated slideshow.
        await page.waitForFunction(()=>!document.querySelector('.fx-mag-birth-r533'),
          null,{timeout:45000});
        summary=await page.evaluate(()=>({
          renderer:document.documentElement.dataset.fxMagBirthRendererR1360,
          geometry:document.documentElement.dataset.fxMagIntroGeometryR2075,
          nativeMorphR2080:document.documentElement.dataset.fxMagIntroMorphR2080,
          nativeMorphProgressR2080:Number(document.documentElement.dataset.fxMagIntroMorphProgressR2080||0),
          identityCount:document.querySelectorAll('.fx-ai-core-ident-r1951').length,
          overlayCount:document.querySelectorAll('.fx-mag-birth-r533').length,
          nativeCTA:!!document.querySelector('#hero .hero-actions #hero-download'),
          home:document.documentElement.dataset.fxArchiveCinema,
          scrollY
        }));
        summary.renderedInTimedFilm=renderedInTimedFilm;
        summary.errors=errors;
        // Video must be safely saved before verifying strict acceptance; a
        // failing software-renderer environment still yields useful evidence.
      }catch(error){
        recordingError=String(error?.stack||error);
      }finally{
        await context.close();
      }
      assert.ok(video,'No original Chromium video stream available');
      const file=path.join(OUT,'FormatX_MAG_R2077_'+profile.name+'.webm');
      await video.saveAs(file);
      const bytes=fs.statSync(file).size;
      assert.ok(bytes>12000,'Chromium recording produced an empty video: '+bytes);
      const accepted=!recordingError&&!!summary?.renderedInTimedFilm
        &&summary.geometry?.includes('8-physical-inset-rails-3-coaxial-metal-rings')
        &&summary.nativeMorphR2080==='canonical-native-organism'
        &&summary.nativeMorphProgressR2080>.999
        &&summary.identityCount===0&&summary.overlayCount===0
        &&summary.nativeCTA&&summary.scrollY===0
        &&summary.errors.length===0;
      results.push({profile:profile.name,file,bytes,accepted,summary,
        error:recordingError});
      if(!accepted)failures.push(profile.name+': '+JSON.stringify({summary,recordingError}));
      console.log((accepted?'R2077_ACTUAL_THREE_MOVIE_RECORDED_PASS ':'R2077_ACTUAL_THREE_MOVIE_RECORDED_FAIL ')+JSON.stringify({
        profile:profile.name,bytes,renderedInTimedFilm,
        renderer:summary?.renderer,geometry:summary?.geometry,
        nativeCTA:summary?.nativeCTA,error:recordingError
      }));
    }
  }finally{await browser.close();}
  fs.writeFileSync(path.join(OUT,'recording-proof.json'),JSON.stringify(results,null,2)+'\n');
  assert.deepEqual(failures,[],'Recorded genuine Three cinema contains regressions: '+JSON.stringify(failures));
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1});
