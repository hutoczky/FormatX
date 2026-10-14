'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const HOME=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2103-real-mobile-fallback';
const CASES=[
  {name:'phone-390-midfilm',width:390,height:844,second:4.40},
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
            filmStyle:getComputedStyle(overlay?.querySelector('.fxb-genome-field')||overlay).display,
            width:innerWidth,height:innerHeight,
            canvasRect:{width:size?.width||0,height:size?.height||0},
            buffer:{width:canvas?.width||0,height:canvas?.height||0},
            pixel:[...(sampled||[])],
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
          info.diameter<=shot.width*.67,
          'Giant phone-clipping orb regression: '+JSON.stringify(info));
        assert.ok(info.buffer.width>100&&info.buffer.height>100,
          'Canvas has no real backing surface');
        assert.ok(info.pixel.length===4&&info.pixel[3]>12,
          'No actual fallback center optic framebuffer pixel');
        assert.ok(info.skipOpacity>.95&&info.skipBox.width>=90
          &&info.skipBox.height>=44,
          'Unreadable or untappable Skip button: '+JSON.stringify(info));
        assert.ok(!info.legacyEggVisible,
          'Legacy CSS egg is obscuring the new machined MAG movie');
        assert.ok(info.loader.includes('r2104-sculpted-machined-sapphire'),
          'Stale browser cache is loading old giant-oval renderer');
        records.push({shot,info});
      }finally{await context.close()}
    }
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
