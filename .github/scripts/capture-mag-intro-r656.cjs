'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_INTRO_KEYFRAME_DIR||'artifacts/r659-intro-keyframes';
const CHROME=process.env.CHROME_BIN||undefined;
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
  const browser=await chromium.launch({
    headless:true,
    executablePath:CHROME,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox']
  });
  const context=await browser.newContext({
    viewport:{width:1280,height:720},
    colorScheme:'dark',
    reducedMotion:'no-preference',
    locale:'hu-HU'
  });

  const report=[];
  try{
    for(const [seconds,name] of SHOTS){
      const page=await context.newPage();
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
      await page.locator('.fx-mag-birth-r533').waitFor({state:'visible',timeout:10000});
      await page.waitForFunction(
        ()=>document.documentElement.dataset.fxMagBirthVisualFrameR659==='ready',
        null,
        {timeout:30000}
      );
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
          overlay:document.querySelectorAll('.fx-mag-birth-r533').length
        };
      });

      await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false});
      report.push({seconds,name,state,errors});
      await page.close();
    }

    // Capture the real post-intro handoff and the one permanent native hero MAG.
    // This lives in the early artifact so visual continuity remains inspectable
    // even when a later workflow run is superseded by another master commit.
    {
      const page=await context.newPage();
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
      await page.locator('.fx-mag-birth-r533').waitFor({state:'visible',timeout:10000});
      await page.waitForFunction(
        ()=>document.querySelectorAll('.fx-mag-birth-r533').length===0
          && document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length===1,
        null,
        {timeout:30000}
      );
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
      if(await stage.count()){
        await stage.screenshot({path:path.join(OUT,'07-native-hero-mag.png')});
      }
      report.push({seconds:'post-intro',name:'06-post-intro-handoff',state,errors});
      await page.close();
    }

    fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify({report},null,2)+'\n');
    const allErrors=report.flatMap(x=>x.errors);
    if(allErrors.length){
      console.error(allErrors.join('\n'));
      process.exitCode=1;
    }
  }finally{
    await context.close();
    await browser.close();
  }
})().catch(error=>{
  fs.writeFileSync(path.join(OUT,'failure.txt'),String(error?.stack||error)+'\n');
  console.error(error);
  process.exitCode=1;
});