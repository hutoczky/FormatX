'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_INTRO_KEYFRAME_DIR||'artifacts/r659-intro-keyframes';
const CHROME=process.env.CHROME_BIN||undefined;
const SKIP_HANDOFF=process.env.FORMATX_SKIP_HANDOFF==='1';
const MOBILE_ONLY=process.env.FORMATX_MOBILE_ONLY==='1';
fs.mkdirSync(OUT,{recursive:true});

const SHOTS=[
  [0.50,'00-0.50s'],
  [2.50,'01-2.50s'],
  [3.50,'02-3.50s'],
  [5.50,'03-5.50s'],
  [7.50,'04-7.50s'],
  [9.25,'05-9.25s']
];

(async()=>{
  const launchBrowser=()=>chromium.launch({
    headless:true,
    executablePath:CHROME,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']
  });
  const contextOptions={
    viewport:{width:1280,height:720},
    colorScheme:'dark',
    reducedMotion:'no-preference',
    locale:'hu-HU'
  };

  async function pollPage(page,predicate,timeout=30000,interval=100){
    const deadline=Date.now()+timeout;
    while(Date.now()<deadline){
      try{if(await page.evaluate(predicate))return true;}catch(_){}
      await page.waitForTimeout(interval);
    }
    return false;
  }

  async function captureLocatorClip(page,locator,fileName){
    if(!await locator.count())return false;
    const box=await locator.boundingBox();
    const viewport=page.viewportSize();
    if(!box||!viewport)return false;
    const x=Math.max(0,box.x);
    const y=Math.max(0,box.y);
    const width=Math.min(box.width,viewport.width-x);
    const height=Math.min(box.height,viewport.height-y);
    if(width<2||height<2)return false;
    await page.screenshot({
      path:path.join(OUT,fileName),
      clip:{x,y,width,height},
      animations:'disabled',
      caret:'hide',
      timeout:90000
    });
    return true;
  }

  async function captureMobileNativePreflight(){
    const mobileBrowser=await launchBrowser();
    const mobileContext=await mobileBrowser.newContext({
      viewport:{width:390,height:844},
      isMobile:true,
      hasTouch:true,
      deviceScaleFactor:2,
      colorScheme:'dark',
      reducedMotion:'no-preference',
      locale:'hu-HU'
    });
    const page=await mobileContext.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('console',m=>{
      if(m.type()==='error'&&!/favicon|WebGL|GPU/i.test(m.text()))errors.push(m.text());
    });
    try{
      const u=new URL(BASE);
      u.searchParams.set('mobileproof','r1500-preflight');
      await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
      const ready=await pollPage(
        page,
        ()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'
          && document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length===1,
        30000,
        120
      );
      if(!ready)throw new Error('R1500 mobile preflight MAG did not become ready');
      await page.waitForTimeout(650);
      const state=await page.evaluate(()=>{
        const root=document.documentElement;
        const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const box=canvas?.getBoundingClientRect();
        const ring=document.querySelector('#hero .hero-ring');
        const ringStyle=ring?getComputedStyle(ring):null;
        return {
          visual:root.dataset.fxNativeMagVisualR1590||root.dataset.fxNativeMagVisualR1589||root.dataset.fxNativeMagVisualR1588||root.dataset.fxNativeMagVisualR1587||root.dataset.fxNativeMagVisualR1586||root.dataset.fxNativeMagVisualR1585||root.dataset.fxNativeMagVisualR1584||root.dataset.fxNativeMagVisualR1559||root.dataset.fxNativeMagVisualR1500||'',
          shape:root.dataset.fxCoreShapeR337||'',
          renderer:root.dataset.fxCoreRenderer||'',
          resolution:root.dataset.fxCoreReal3dResolution||'',
          optics:root.dataset.fxPrimaryMagOpticsR1410||root.dataset.fxPrimaryMagOpticsR1408||root.dataset.fxPrimaryMagOpticsR1383||'',
          filter:canvas?getComputedStyle(canvas).filter:'',
          animation:canvas?getComputedStyle(canvas).animationName:'',
          ring:ring?{display:ringStyle.display,visibility:ringStyle.visibility,opacity:Number(ringStyle.opacity||0)}:{display:'none',visibility:'hidden',opacity:0},
          canvas:{x:box?.x||0,y:box?.y||0,width:box?.width||0,height:box?.height||0},
          overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
        };
      });
      await page.screenshot({path:path.join(OUT,'08-mobile-native-hero.png'),fullPage:false});
      const stage=page.locator('#hero .fx-crystal-organism-r326-stage').first();
      await captureLocatorClip(page,stage,'09-mobile-native-mag.png');
      if(state.shape!=='organism')errors.push('R1500 preflight shape is not organism: '+state.shape);
      if(/blur\((?!0(?:px)?\))/i.test(state.filter||''))errors.push('R1500 preflight still blurred: '+state.filter);
      if(state.ring.display!=='none'&&state.ring.visibility!=='hidden'&&state.ring.opacity>.01)errors.push('R1500 preflight hero ring visible: '+JSON.stringify(state.ring));
      if(state.overflow>2)errors.push('R1500 preflight overflow: '+state.overflow);
      report.push({seconds:'mobile-preflight',name:'08-mobile-native-hero',state,errors});
    }finally{
      await page.close();
      await mobileContext.close();
      await mobileBrowser.close();
    }
  }

  const report=[];
  try{
    // Always capture the exact phone hero first. Even if an intro-keyframe
    // renderer later fails, the artifact still contains the user-facing MAG.
    await captureMobileNativePreflight();
    if(MOBILE_ONLY){
      fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify({report},null,2)+'\n');
      const mobileErrors=report.flatMap(x=>x.errors);
      if(mobileErrors.length){
        console.error(mobileErrors.join('\n'));
        process.exitCode=1;
      }
      return;
    }
    // R1450 early mobile proof: capture the user's actual 390x844 composition
    // before the slower intro keyframe suite, so a later intro failure never
    // hides the permanent mobile MAG evidence.
    {
      const mobileBrowser=await launchBrowser();
      const mobileContext=await mobileBrowser.newContext({
        viewport:{width:390,height:844},
        isMobile:true,
        hasTouch:true,
        deviceScaleFactor:2,
        colorScheme:'dark',
        reducedMotion:'no-preference',
        locale:'hu-HU'
      });
      const page=await mobileContext.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('console',m=>{if(m.type()==='error'&&!/favicon|WebGL|GPU/i.test(m.text()))errors.push(m.text());});
      const u=new URL(BASE);
      u.searchParams.set('mobileproof','r1500');
      await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
      const mobileReady=await pollPage(
        page,
        ()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'
          && document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length===1,
        30000,
        120
      );
      if(!mobileReady)throw new Error('R1500 early mobile native MAG did not become ready');
      await page.waitForTimeout(700);
      const state=await page.evaluate(()=>{
        const root=document.documentElement;
        const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        const box=canvas?.getBoundingClientRect();
        const ring=document.querySelector('#hero .hero-ring');
        const ringStyle=ring?getComputedStyle(ring):null;
        return {
          stageCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
          canvasCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
          renderer:root.dataset.fxCoreRenderer||'',
          visual:root.dataset.fxNativeMagVisualR1590||root.dataset.fxNativeMagVisualR1589||root.dataset.fxNativeMagVisualR1588||root.dataset.fxNativeMagVisualR1587||root.dataset.fxNativeMagVisualR1586||root.dataset.fxNativeMagVisualR1585||root.dataset.fxNativeMagVisualR1584||root.dataset.fxNativeMagVisualR1559||root.dataset.fxNativeMagVisualR1500||'',
          shape:root.dataset.fxCoreShapeR337||'',
          canvasFilter:canvas?getComputedStyle(canvas).filter:'',
          heroRing:ring?{present:true,display:ringStyle.display,visibility:ringStyle.visibility,opacity:Number(ringStyle.opacity||0)}:{present:false,display:'none',visibility:'hidden',opacity:0},
          canvas:{x:box?.x||0,y:box?.y||0,width:box?.width||0,height:box?.height||0},
          overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
        };
      });
      await page.screenshot({path:path.join(OUT,'08-mobile-native-hero.png'),fullPage:false});
      const stage=page.locator('#hero .fx-crystal-organism-r326-stage').first();
      await captureLocatorClip(page,stage,'09-mobile-native-mag.png');
      if(state.visual!=='cinematic-vertex-normal-obsidian-shard-smooth-reflections-readable-hand-cut-silhouette-subtle-fissure')errors.push('R1723 living organism visual marker missing: '+state.visual);
      if(state.shape!=='organism')errors.push('R1500 mobile MAG shape is not organism: '+state.shape);
      if(/blur\((?!0(?:px)?\))/i.test(state.canvasFilter||''))errors.push('R1500 mobile MAG still has blur: '+state.canvasFilter);
      if(state.heroRing.present&&state.heroRing.display!=='none'&&state.heroRing.visibility!=='hidden'&&state.heroRing.opacity>.01)errors.push('R1500 legacy hero ring visible: '+JSON.stringify(state.heroRing));
      if(state.overflow>2)errors.push('R1500 horizontal overflow: '+state.overflow);
      report.push({seconds:'mobile-native-early',name:'08-mobile-native-hero',state,errors});
      await page.close();
      await mobileContext.close();
      await mobileBrowser.close();
    }

    if(MOBILE_ONLY){
      fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify({report},null,2)+'\n');
      const mobileErrors=report.flatMap(x=>x.errors);
      if(mobileErrors.length){
        console.error(mobileErrors.join('\n'));
        process.exitCode=1;
      }
      return;
    }

    const shotBrowser=await launchBrowser();
    try{
    for(const [seconds,name] of SHOTS){
      const shotContext=await shotBrowser.newContext(contextOptions);
      const page=await shotContext.newPage();
      await page.addInitScript(()=>{try{sessionStorage.clear();localStorage.removeItem('formatx:mag-birth-live-r533-seen');}catch(_){}});
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('console',m=>{
        if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text());
      });

      const u=new URL(BASE);
      u.searchParams.set('intro','1');
      u.searchParams.set('visualintro','1');
      u.searchParams.set('introframe',String(seconds));
      u.searchParams.set('r659','deterministic-frame');

      await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
      const overlayReady=await pollPage(
        page,
        ()=>document.querySelectorAll('.fx-mag-birth-r533').length===1,
        15000,
        100
      );
      if(!overlayReady){
        const debug=await page.evaluate(()=>({
          href:location.href,
          owner:document.documentElement.dataset.fxMagBirthOwnerR533||'',
          live:document.documentElement.dataset.fxMagBirthLiveR533||'',
          overlayCount:document.querySelectorAll('.fx-mag-birth-r533').length,
          birthScript:[...document.scripts].find(s=>/formatx-mag-birth-live-r533\.js/.test(s.src))?.src||'',
          genesisScript:[...document.scripts].find(s=>/formatx-mag-genesis-three-r1360\.js/.test(s.src))?.src||'',
          ready:document.readyState
        }));
        throw new Error('R1500 intro overlay missing '+JSON.stringify({debug,errors}));
      }
      const frameReady=await pollPage(
        page,
        ()=>document.documentElement.dataset.fxMagBirthVisualFrameR659==='ready',
        30000,
        100
      );
      if(!frameReady)throw new Error('R1500 deterministic intro frame did not become ready at '+seconds+'s');
      await page.waitForTimeout(150);

      const state=await page.evaluate(()=>{
        const root=document.documentElement;
        const rendererEntry=Object.entries(root.dataset)
          .filter(([key])=>/^fxMagBirthRendererR\d+$/.test(key))
          .sort(([a],[b])=>Number((b.match(/\d+/)||['0'])[0])-Number((a.match(/\d+/)||['0'])[0]))[0];
        return {
          renderer:rendererEntry?.[1]||'',
          rendererKey:rendererEntry?.[0]||'',
          three:root.dataset.fxMagBirthThreeR658||'',
          proof:root.dataset.fxMagBirthVisualFrameR659||'',
          seconds:root.dataset.fxMagBirthVisualFrameSeconds||'',
          phase:root.dataset.fxMagBirthPhase||document.querySelector('.fx-mag-birth-r533')?.dataset.phase||'',
          frameSync:root.dataset.fxMagBirthFrameR1557||'',
          framePeak:Number(root.dataset.fxMagBirthFramePeakR1557||0),
          proofSync:root.dataset.fxMagBirthVisualFrameR1557||'',
          overlay:document.querySelectorAll('.fx-mag-birth-r533').length
        };
      });

      if(!/^(?:threejs-active|three-primary-active|threejs-active-production-path|cinematic-three-active|cinematic-cortical-three-active|realistic-cinematic-three-active|photoreal-cinematic-three-active)$/.test(state.renderer)){
        errors.push('R1500 intro is not using the cinematic Three.js renderer: '+state.renderer);
      }
      await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false});
      report.push({seconds,name,state,errors});
      await page.close();
      await shotContext.close();
    }
    }finally{
      await shotBrowser.close();
    }

    if(!SKIP_HANDOFF){
      // Capture the real post-intro handoff and the one permanent native hero MAG.
      // This lives in the early artifact so visual continuity remains inspectable
      // even when a later workflow run is superseded by another master commit.
      {
        const handoffBrowser=await launchBrowser();
        const handoffContext=await handoffBrowser.newContext(contextOptions);
        const page=await handoffContext.newPage();
        await page.addInitScript(()=>{try{sessionStorage.clear();localStorage.removeItem('formatx:mag-birth-live-r533-seen');}catch(_){}});
        const errors=[];
        page.on('pageerror',e=>errors.push(String(e)));
        page.on('console',m=>{
          if(m.type()==='error'&&!/favicon|WebGL|GPU/i.test(m.text()))errors.push(m.text());
        });
  
        const u=new URL(BASE);
        u.searchParams.set('intro','1');
        u.searchParams.set('visualintro','1');
        u.searchParams.set('r720handoff','1');
  
        await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
        // R1406: deterministic intro keyframes above already prove the overlay.
        // The handoff proof must tolerate fast automation teardown and only require
        // the one permanent native MAG to own the final state.
        const handoffReady=await pollPage(
          page,
          ()=>document.querySelectorAll('.fx-mag-birth-r533').length===0
            && document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length===1
            && document.documentElement.dataset.fxCrystalOrganismR326==='ready',
          30000,
          120
        );
        if(!handoffReady)throw new Error('R1440 post-intro native handoff did not settle');
        await page.waitForTimeout(350);
  
        const state=await page.evaluate(()=>{
          const root=document.documentElement;
          return {
            overlay:document.querySelectorAll('.fx-mag-birth-r533').length,
            stageCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
            canvasCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
            coreRenderer:root.dataset.fxCoreRenderer||'',
            coreRevision:root.dataset.fxCoreRendererVersion||'',
            referenceGeometry:root.dataset.fxCoreReferenceGeometryR669
              ||root.dataset.fxCoreReferenceGeometry
              ||'',
            coreGeometry:root.dataset.fxCoreGeometry||'',
            handoff:root.dataset.fxMagBirthHandoff||root.dataset.fxMagBirthLive||''
          };
        });
  
        await page.screenshot({path:path.join(OUT,'06-post-intro-handoff.png'),fullPage:false});
        const stage=page.locator('#hero .fx-crystal-organism-r326-stage').first();
        await captureLocatorClip(page,stage,'07-native-hero-mag.png');
        report.push({seconds:'post-intro',name:'06-post-intro-handoff',state,errors});
        await page.close();
        await handoffContext.close();
        await handoffBrowser.close();
      }

      // R1440: capture the exact phone layout the user sees. The normal intro is
      // intentionally skipped by Playwright automation; this proves the permanent
      // native MAG, full-page chamber, controls and copy together at 390x844.
      {
        const mobileBrowser=await launchBrowser();
        const mobileContext=await mobileBrowser.newContext({
          viewport:{width:390,height:844},
          isMobile:true,
          hasTouch:true,
          deviceScaleFactor:2,
          colorScheme:'dark',
          reducedMotion:'no-preference',
          locale:'hu-HU'
        });
        const page=await mobileContext.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(String(e)));
        page.on('console',m=>{
          if(m.type()==='error'&&!/favicon|WebGL|GPU/i.test(m.text()))errors.push(m.text());
        });
        const u=new URL(BASE);
        u.searchParams.set('mobileproof','r1500');
        await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
        const mobileReady=await pollPage(
          page,
          ()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'
            && document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length===1,
          30000,
          120
        );
        if(!mobileReady)throw new Error('R1500 mobile native MAG did not become ready');
        await page.waitForTimeout(700);
        const state=await page.evaluate(()=>{
          const root=document.documentElement;
          const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
          const box=canvas?.getBoundingClientRect();
          return {
            stageCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
            canvasCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
            renderer:root.dataset.fxCoreRenderer||'',
            visual:root.dataset.fxNativeMagVisualR1590||root.dataset.fxNativeMagVisualR1589||root.dataset.fxNativeMagVisualR1588||root.dataset.fxNativeMagVisualR1587||root.dataset.fxNativeMagVisualR1586||root.dataset.fxNativeMagVisualR1585||root.dataset.fxNativeMagVisualR1584||root.dataset.fxNativeMagVisualR1559||root.dataset.fxNativeMagVisualR1500||'',
            optics:root.dataset.fxPrimaryMagOpticsR1383||'',
            resolution:root.dataset.fxCoreReal3dResolution||'',
            shape:root.dataset.fxCoreShapeR337||'',
            canvasFilter:canvas?getComputedStyle(canvas).filter:'',
            heroRing:(()=>{
              const el=document.querySelector('#hero .hero-ring');
              if(!el)return {present:false,display:'none',visibility:'hidden',opacity:0};
              const s=getComputedStyle(el);
              return {present:true,display:s.display,visibility:s.visibility,opacity:Number(s.opacity||0)};
            })(),
            canvas:{x:box?.x||0,y:box?.y||0,width:box?.width||0,height:box?.height||0},
            overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
          };
        });
        await page.screenshot({path:path.join(OUT,'08-mobile-native-hero.png'),fullPage:false});
        const stage=page.locator('#hero .fx-crystal-organism-r326-stage').first();
        await captureLocatorClip(page,stage,'09-mobile-native-mag.png');
        if(state.visual!=='cinematic-vertex-normal-obsidian-shard-smooth-reflections-readable-hand-cut-silhouette-subtle-fissure'){
          errors.push('R1723 living organism visual marker missing: '+state.visual);
        }
        if(state.shape!=='organism'){
          errors.push('Mobile MAG is not in organism state: '+state.shape);
        }
        if(/blur\((?!0(?:px)?\))/i.test(state.canvasFilter||'')){
          errors.push('Mobile MAG still has blur: '+state.canvasFilter);
        }
        if(state.heroRing.present && state.heroRing.display!=='none' && state.heroRing.visibility!=='hidden' && state.heroRing.opacity>.01){
          errors.push('Legacy hero ring still visible: '+JSON.stringify(state.heroRing));
        }
        if(state.overflow>2){
          errors.push('Mobile horizontal overflow: '+state.overflow);
        }
        report.push({seconds:'mobile-native',name:'08-mobile-native-hero',state,errors});
        await page.close();
        await mobileContext.close();
        await mobileBrowser.close();
      }
  
    }

    fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify({report},null,2)+'\n');
    const allErrors=report.flatMap(x=>x.errors);
    if(allErrors.length){
      console.error(allErrors.join('\n'));
      process.exitCode=1;
    }
  }finally{
    // R1420 reuses one browser for deterministic intro frames while each frame
    // still owns an isolated context. Handoff and mobile proof stay separate.
  }
})().catch(error=>{
  fs.writeFileSync(path.join(OUT,'failure.txt'),String(error?.stack||error)+'\n');
  console.error(error);
  process.exitCode=1;
});