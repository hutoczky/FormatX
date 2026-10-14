'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

const ORIGIN=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const DIR='artifacts/r2110-actual-three-phone';
fs.mkdirSync(DIR,{recursive:true});
const frames=[
  {name:'phone-390-cortex',width:390,height:844,second:4.40},
  {name:'phone-390-optic',width:390,height:844,second:8.50},
  {name:'phone-390-handoff',width:390,height:844,second:9.98},
  {name:'desktop-1440-optic',width:1440,height:900,second:8.50}
];

(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage',
    '--enable-webgl','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]});
  const results=[];
  try{
    for(const frame of frames){
      const mobile=frame.width<900;
      const context=await browser.newContext({
        viewport:{width:frame.width,height:frame.height},
        deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,
        locale:'hu-HU',colorScheme:'dark',
        userAgent:mobile
          ?'Mozilla/5.0 (Linux; Android 16; SM-S928B) AppleWebKit/537.36 '+
            '(KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36'
          :'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '+
            '(KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
      });
      try{
        await context.addInitScript(()=>{
          Object.defineProperty(navigator,'webdriver',
            {configurable:true,get:()=>undefined});
          Object.defineProperty(navigator,'hardwareConcurrency',
            {configurable:true,get:()=>4});
          Object.defineProperty(navigator,'deviceMemory',
            {configurable:true,get:()=>4});
        });
        const page=await context.newPage(),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        const query='?intro=1&visualintro=1&introframe='+frame.second+
          '&r2110=real-three-'+frame.name;
        await page.goto(ORIGIN+query,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          return root.dataset.fxMagBirthVisualFrameR659==='ready';
        },null,{timeout:60000});
        const info=await page.evaluate(()=>{
          const root=document.documentElement;
          const owner=document.querySelector('.fx-mag-birth-r533');
          const canvas=owner?.querySelector('canvas.fxb-particles');
          const skip=owner?.querySelector('.fxb-skip');
          const box=skip?.getBoundingClientRect();
          return {
            capability:root.dataset.fxMagIntroCapabilityR2110||'',
            renderer:root.dataset.fxMagBirthRendererR1360||'',
            loader:root.dataset.fxMagBirthThreeLoaderR1608||'',
            peak:root.dataset.fxMagBirthFramePeakR1557||'',
            buffer:[canvas?.width||0,canvas?.height||0],
            oneCanvas:owner?.querySelectorAll('canvas.fxb-particles').length===1,
            mobileThreeDistance:Number(root.dataset.fxMagThreeMobileDistanceR2112||0),
            irisBlades:Number(root.dataset.fxMagThreeIrisBladesR2113||0),
            collars:Number(root.dataset.fxMagThreeCollarsR2113||0),
            optics:root.dataset.fxMagThreeOpticsR2113||'',
            threeSource:[...document.scripts]
              .find(el=>el.src.includes('formatx-mag-genesis-three-r1280.js'))?.src||'',
            skip:{width:box?.width||0,height:box?.height||0,
              opacity:Number(skip?getComputedStyle(skip).opacity:0)},
            scene:root.dataset.fxMagBirthCameraR2073||'',
            fallback:root.dataset.fxMagFallbackSilhouetteR2107||''
          };
        });
        await page.screenshot({
          path:DIR+'/'+frame.name+'.png',
          animations:'allow'
        });
        fs.writeFileSync(DIR+'/'+frame.name+'.json',
          JSON.stringify({frame,info,errors},null,2)+'\n');
        assert.equal(info.capability,'attempt-full-three-first',
          'Privacy-capped mobile hardware must get true 3D first');
        assert.equal(info.renderer,'threejs-active',
          'The visible film must really be the native Three scene, not the 2D fallback');
        assert.ok(info.oneCanvas&&info.buffer[0]>100&&info.buffer[1]>100,
          'No usable original WebGL framebuffer: '+JSON.stringify(info));
        assert.ok(info.threeSource.includes('r2113-physical-three-iris-mobile-frame'),
          'Stale pre-R2112 cropped Three.js source is still loaded: '+JSON.stringify(info));
        if(mobile){
          assert.ok(info.mobileThreeDistance>=7.7&&
            info.mobileThreeDistance<=10.3,
            'The premium mobile camera is still too close for the four-point width: '+
              JSON.stringify(info));
        }
        assert.ok(info.skip.width>=90&&info.skip.height>=44&&
          info.skip.opacity>.95,
          'Real Three intro must retain an accessible Skip control');
        assert.equal(info.irisBlades,8,
          'Every authored titanium iris blade must exist in the ACTUAL Three scene');
        assert.equal(info.collars,3,
          'All three precision optical collars must exist in the ACTUAL Three scene');
        assert.equal(info.optics,'three-metal-collars-eight-physical-iris-blades',
          'Optic provenance must be the real new 3D mesh, not a 2D illustration');
        assert.deepEqual(errors,[],'Three film runtime errors');
        results.push({frame,info});
        console.log('R2110_REAL_THREE_FILM_PASS',
          JSON.stringify({name:frame.name,...info}));
      }finally{await context.close();}
    }
  }finally{await browser.close();}
  fs.writeFileSync(DIR+'/report.json',JSON.stringify(results,null,2)+'\n');
})().catch(error=>{
  console.error(error.stack||String(error));
  process.exitCode=1;
});
