'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const HOME=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2103-real-mobile-fallback';
const CASES=[
  {name:'phone-390-dna',width:390,height:844,second:1.60,phase:'0'},
  {name:'phone-390-midfilm',width:390,height:844,second:4.40,phase:'2'},
  {name:'phone-390-identity',width:390,height:844,second:8.50,phase:'3'},
  {name:'phone-360-midfilm',width:360,height:780,second:4.40,phase:'2'},
  {name:'phone-360-identity',width:360,height:780,second:8.50,phase:'3'}
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
          let subjectPixels=0,highlightPixels=0;
          if(img&&canvas){
            const pixels=img.getImageData(0,0,canvas.width,canvas.height).data;
            const step=Math.max(1,Math.floor(Math.min(canvas.width,canvas.height)/230));
            for(let y=Math.floor(canvas.height*.13);y<canvas.height*.87;y+=step){
              for(let x=Math.floor(canvas.width*.22);x<canvas.width*.78;x+=step){
                const i=(y*canvas.width+x)*4;
                const r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=pixels[i+3];
                if(a>15&&b>r*1.1&&g>r*1.1&&g+b>80)subjectPixels++;
                if(a>30&&g>95&&b>110)highlightPixels++;
              }
            }
          }
          return {
            renderer:root.dataset.fxMagBirthRendererR1360,
            phase:root.dataset.fxMagBirthPhase,
            progress:root.dataset.fxMagBirthVisualFrameSeconds,
            silhouette:root.dataset.fxMagFallbackSilhouetteR2103,
            material:root.dataset.fxMagFallbackMaterialR2104||'',
            diameter:Number(root.dataset.fxMagFallbackDiameterR2103),
            width:innerWidth,height:innerHeight,
            canvasRect:{width:size?.width||0,height:size?.height||0},
            buffer:{width:canvas?.width||0,height:canvas?.height||0},
            pixel:[...(sampled||[])],
            subjectPixels,highlightPixels,
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
        assert.equal(info.phase,shot.phase,'DNA, living embryo and assembled MAG must keep their actual story order');
        if(shot.phase==='3'){
          assert.equal(info.material,'moving-softbox-smoked-chrome-sapphire-facets',
            'R2104 cinema material did not render on the completed MAG in the original phone canvas');
        }else{
          assert.equal(info.material,'',
            'The finished metal MAG must not replace the earlier DNA or living embryo chapter');
        }
        assert.ok(info.subjectPixels>1000&&info.highlightPixels>100,
          'The actual DNA/embryo/MAG framebuffer has no centered illuminated subject: '+JSON.stringify(info));
        assert.ok(
          info.renderer==='native-canvas-reference-film',
          'Expected actual painted 2D R649 fallback: '+JSON.stringify(info)
        );
        assert.ok(info.diameter>=shot.width*.45&&
          info.diameter<=shot.width*.75,
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
        assert.ok(info.loader.includes('formatx-mag-reference-film-r649.js?v=20261022-r2145-portrait-dna-genesis'),
          'The Android fallback is not loading the canonical DNA-to-embryo-to-MAG reference film');
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
      // R2143: verify that the real ESM module loads from the same path
      // from which the canonical root-domain intro imports it. A previous
      // location.href-relative URL silently downgraded high-end phones.
      const importedThree=await page.evaluate(async()=>{
        const url=new URL('/scifi-ui/scripts/three-r185.module.js',location.origin);
        const library=await import(url.href);
        return {path:url.pathname,webglRenderer:typeof library.WebGLRenderer==='function'};
      });
      assert.deepEqual(importedThree,{
        path:'/scifi-ui/scripts/three-r185.module.js',webglRenderer:true
      },'The native Three.js module cannot be imported on the public origin');
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
