'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_INTRO_KEYFRAME_DIR||'artifacts/r656-intro-keyframes';
const CHROME=process.env.CHROME_BIN||undefined;
fs.mkdirSync(OUT,{recursive:true});

const SHOTS=[
  [500,'00-0.50s'],
  [2500,'01-2.50s'],
  [3500,'02-3.50s'],
  [5500,'03-5.50s'],
  [7500,'04-7.50s'],
  [9250,'05-9.25s']
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
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text());});

  try{
    const u=new URL(BASE);
    u.searchParams.set('intro','1');
    u.searchParams.set('visualintro','1');
    u.searchParams.set('r656','reference-keyframes');
    await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('.fx-mag-birth-r533').waitFor({state:'visible',timeout:10000});

    const started=Date.now();
    for(const [target,name] of SHOTS){
      const wait=Math.max(0,target-(Date.now()-started));
      if(wait)await page.waitForTimeout(wait);
      await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false});
    }

    const state=await page.evaluate(()=>({
      renderer:document.documentElement.dataset.fxMagBirthRendererR651||'',
      automation:document.documentElement.dataset.fxMagBirthAutomationR654||'',
      art:document.documentElement.dataset.fxMagBirthArtR651||'',
      overlay:document.querySelectorAll('.fx-mag-birth-r533').length,
      phase:document.documentElement.dataset.fxMagBirthPhase||''
    }));
    fs.writeFileSync(path.join(OUT,'state.json'),JSON.stringify({state,errors},null,2)+'\n');
    if(errors.length)console.error(errors.join('\n'));
  }finally{
    await context.close();
    await browser.close();
  }
})().catch(error=>{
  fs.writeFileSync(path.join(OUT,'failure.txt'),String(error?.stack||error)+'\n');
  console.error(error);
  process.exitCode=1;
});