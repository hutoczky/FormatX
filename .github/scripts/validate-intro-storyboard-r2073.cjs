'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const HOME='http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2073-intro-storyboard';
const SHOTS=[
  {label:'dna-approach',second:1.40,expected:'dna-approach',mobile:false},
  {label:'cortical-orbit',second:4.40,expected:'cortical-orbit',mobile:false},
  {label:'organism-pullback',second:6.45,expected:'organism-pullback',mobile:false},
  {label:'identity-stabilized',second:8.50,expected:'identity-stabilized',mobile:false},
  {label:'native-organism-handoff',second:9.98,expected:'handoff-locked',mobile:false},
  {label:'mobile-depth',second:4.40,expected:'cortical-orbit',mobile:true},
  {label:'mobile-identity',second:8.50,expected:'identity-stabilized',mobile:true},
  {label:'mobile-native-handoff',second:9.98,expected:'handoff-locked',mobile:true}
];
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  const result=[];
  try{
    for(const shot of SHOTS){
      const context=await browser.newContext({
        viewport:shot.mobile?{width:390,height:844}:{width:1440,height:900},
        isMobile:shot.mobile,hasTouch:shot.mobile,
        locale:'hu-HU',reducedMotion:'no-preference'
      });
      try{
        const page=await context.newPage();
        const issues=[];
        page.on('pageerror',e=>issues.push(e.message));
        await page.goto(HOME+'?intro=1&visualintro=1&introframe='+shot.second+'&r2073-film='+shot.label,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>document.documentElement.dataset.fxMagBirthVisualFrameR659==='ready',
          null,{timeout:45000});
        if(shot.second>=8.05 && shot.second<9.5){
          await page.waitForFunction(()=>{
            const label=document.querySelector('.fx-ai-core-ident-r1951.is-visible');
            return !!label&&Number(getComputedStyle(label).opacity)>.90;
          },null,{timeout:3000});
          // Photograph the settled optical label, not the first blurred
          // transition frame that immediately follows its DOM insertion.
          await page.waitForTimeout(150);
        }
        // Real touch/pointer must reach the live Three instance BEFORE
        // expensive CPU/software-WebGL screenshot readback or film teardown.
        // Otherwise headless photography can wait until after the 10s shot
        // and falsely diagnose physical input as broken.
        if(shot.second===4.40){
          if(shot.mobile){
            await page.touchscreen.tap(180,320);
          }else{
            await page.mouse.move(540,390);
            await page.mouse.down();
            await page.mouse.up();
          }
          await page.waitForFunction(()=>
            document.documentElement.dataset.fxMagIntroInteractionR2073==='physical-core-pulse',
            null,{timeout:4000});
        }
        const info=await page.evaluate(()=>{
          const root=document.documentElement;
          const overlay=document.querySelector('.fx-mag-birth-r533');
          const badge=document.querySelector('.fx-ai-core-ident-r1951');
          const canvas=overlay?.querySelector('canvas.fxb-particles');
          const badgeCss=badge?getComputedStyle(badge):null;
          return {
            phase:overlay?.dataset.phase,progress:root.dataset.fxMagBirthVisualFrameSeconds,
            camera:root.dataset.fxMagIntroCameraR2073,
            mobileCameraDepth:Number(root.dataset.fxMagIntroMobileCameraDepthR2079||0),
            renderer:root.dataset.fxMagBirthRendererR1360,
            birthState:root.dataset.fxMagBirthLiveR533,
            realPixelPeak:Number(root.dataset.fxMagBirthFramePeakR1557||0),
            realLitSamples:Number(root.dataset.fxMagBirthFrameLitSamplesR2073||0),
            realReadback:root.dataset.fxMagBirthFrameR1557,
            physicalGeometryR2075:root.dataset.fxMagIntroGeometryR2075,
            morphR2080:root.dataset.fxMagIntroMorphR2080,
            morphProgressR2080:Number(root.dataset.fxMagIntroMorphProgressR2080||'0'),
            opticEnergyR2082:Number(root.dataset.fxMagIntroOpticEnergyR2082||'0'),
            studioR2083:JSON.parse(root.dataset.fxMagIntroStudioR2083||'null'),
            finalSignatureR2084:
              JSON.parse(root.dataset.fxMagIntroFinalSignatureR2084||'null'),
            genesisVersion:[...document.scripts]
              .find(x=>x.src.includes('formatx-mag-genesis-three-r1280.js'))?.src||'',
            identity:badge?.querySelector('.fx-ai-core-ident-r1951__title')?.textContent,
            insideFilm:badge?.dataset.fxAiCoreShot==='inside-the-original-10s-film',
            identityAlpha:Number(badgeCss?.opacity||0),
            identityX:badge?badge.getBoundingClientRect().left+
              badge.getBoundingClientRect().width*.5:null,
            innerWidth,
            canvasWidth:canvas?.width,canvasHeight:canvas?.height,
            coreCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
            duplicateIdentity:document.querySelectorAll('.fx-ai-core-ident-r1951').length
          };
        });
        // Keep the photographic evidence even on an assertion failure:
        // an unreadable black visual should never be hidden by test failure.
        await page.screenshot({
          path:OUT+'/'+shot.label+'.png',animations:'allow'
        });
        console.log('R2073_FRAME_EVIDENCE '+JSON.stringify({shot:shot.label,
          renderer:info.renderer,peak:info.realPixelPeak,
          lit:info.realLitSamples,camera:info.camera,phase:info.phase}));
        assert.equal(info.camera,shot.expected,
          'R2073 3D camera is not travelling through its authored cinematic arc: '+JSON.stringify(info));
        // The permanent hero MAG is allowed to bootstrap later: at an early
        // 1.4s deterministic frame it is not yet mounted. The real scene must
        // have its own live Three renderer, but never duplicate the hero MAG.
        assert.ok(info.canvasWidth>0&&info.canvasHeight>0
          &&info.renderer==='threejs-active'&&info.coreCount<=1
          &&info.realPixelPeak>=20&&info.realLitSamples>=2,
          'Cinematic original Three framebuffer is black or MAG scene missing: '+JSON.stringify(info));
        assert.ok(info.duplicateIdentity<=1,'No duplicate MAG boot identifiers');
        // R2083: verify real moving physical lights INSIDE the original
        // Three renderer, not a CSS screenshot or passive metadata marker.
        const studio=info.studioR2083;
        assert.ok(info.genesisVersion.includes('r2083-studio-cinema-reactive-mag'),
          'Stale cached MAG film asset: '+JSON.stringify(info));
        assert.ok(studio&&Number.isFinite(studio.key)
          &&Number.isFinite(studio.fill)&&Number.isFinite(studio.rim)
          &&Number.isFinite(studio.back)&&Number.isFinite(studio.optic)
          &&studio.key>1.80&&studio.key<2.60
          &&studio.fill>.45&&studio.fill<1.10
          &&studio.rim>.80&&studio.rim<1.50
          &&studio.back>.40&&studio.back<1.10,
          'The REAL Three.js studio-light rig is not responding to the film: '+JSON.stringify(info));
        if(shot.second===1.40){
          assert.ok(studio.key<2.08&&studio.rim<1.02,
            'DNA setup must use the original restrained studio light: '+JSON.stringify(studio));
        }
        if(shot.second===4.40){
          assert.ok(studio.key>2.15&&studio.fill>.68,
            'Cortical camera orbit must activate actual brighter photographic key/fill: '+
              JSON.stringify(studio));
        }
        if(shot.second===8.50){
          assert.ok(studio.rim>1.15&&studio.optic>.18,
            'Identity phase must visibly illuminate the machined optic: '+
              JSON.stringify(studio));
        }
        const signature=info.finalSignatureR2084;
        assert.ok(signature&&Number.isFinite(signature.coreScale)
          &&Number.isFinite(signature.shellOpacity)
          &&Number.isFinite(signature.organicScale),
          'Real source Three MAG geometry signature was not measured: '+JSON.stringify(info));
        if(shot.second===4.40){
          assert.ok(signature.coreScale>.49&&signature.organicScale<.70,
            'The four-point MAG must dominate the cortical orbit, not an oversized ball: '+
              JSON.stringify(signature));
        }
        if(shot.second>=9.98){
          assert.ok(signature.coreScale>.78&&signature.shellOpacity>.75
            &&signature.organicScale<.44&&signature.cellScale<.48
            &&signature.mechanicalVisible===false,
            'Final MAG must remain a readable original four-point living crystal: '+
              JSON.stringify(signature));
        }
        if(shot.second<8.96){
          assert.equal(info.morphR2080,'physical-metal-crest',
            'The iconic optical four-point metal crest must remain throughout the main intro: '+JSON.stringify(info));
        }else{
          assert.ok(info.morphR2080==='canonical-native-organism'
            &&info.morphProgressR2080>.999
            &&info.opticEnergyR2082>1.65,
            'Last filmed frame does not match the real permanent native living MAG: '+JSON.stringify(info));
        }
        if(shot.mobile){
          assert.ok(info.mobileCameraDepth>=6.18,
            'R2079 portrait camera clips the real cortex or final MAG arms: '+JSON.stringify(info));
        }
        assert.ok(/closed-beveled-3d-rim-8-physical-inset-rails-3-coaxial-metal-rings-and-8-iris-blades/.test(
          info.physicalGeometryR2075||''),
          'The living MAG must have the actual new machined 3D shell/optic assemblies: '+
            JSON.stringify(info));
        if(shot.second>=8.05 && shot.second<9.5){
          assert.equal(info.identity,'MAG // AI CORE');
          assert.ok(info.insideFilm&&info.identityAlpha>.90
            &&Math.abs(info.identityX-info.innerWidth*.5)<12,
            'MAG identity must settle sharply on its real 3D optical axis: '+JSON.stringify(info));
        }else{
          assert.ok(!info.identity,'AI telemetry should not precede stabilization');
        }
        if(shot.second>=9.5){
          assert.ok(!info.identity,
            'Native organism frame must not show expired detached MAG boot title: '+JSON.stringify(info));
        }
        assert.deepEqual(issues,[],'Intro runtime exceptions: '+JSON.stringify(issues));
        await page.screenshot({
          path:OUT+'/'+shot.label+'.png',animations:'allow'
        });
        result.push({shot:shot.label,...info});
        console.log('R2073_REAL_THREE_STORYBOARD_PASS '+JSON.stringify({
          shot:shot.label,phase:info.phase,camera:info.camera,
          coreCount:info.coreCount,renderer:info.renderer,identity:info.identity
        }));
      }finally{await context.close();}
    }
  }finally{await browser.close();}
  fs.writeFileSync(OUT+'/storyboard.json',JSON.stringify(result,null,2)+'\n');
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
