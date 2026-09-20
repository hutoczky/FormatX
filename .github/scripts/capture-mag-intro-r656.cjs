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

      const state=await page.evaluate(()=>({
        renderer:document.documentElement.dataset.fxMagBirthRendererR657||'',
        three:document.documentElement.dataset.fxMagBirthThreeR658||'',
        proof:document.documentElement.dataset.fxMagBirthVisualFrameR659||'',
        seconds:document.documentElement.dataset.fxMagBirthVisualFrameSeconds||'',
        phase:document.documentElement.dataset.fxMagBirthPhase||document.querySelector('.fx-mag-birth-r533')?.dataset.phase||'',
        overlay:document.querySelectorAll('.fx-mag-birth-r533').length
      }));

      await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false});
      report.push({seconds,name,state,errors});
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