'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'../..');
const base=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2127-android-three-first';
fs.mkdirSync(OUT,{recursive:true});

const source=fs.readFileSync(
  path.join(ROOT,'docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js'),'utf8');
assert.ok(
  source.includes('const CONSTRAINED = HARDWARE_CONCURRENCY <= 4 || DEVICE_MEMORY <= 2;'),
  'Eight-core devices with 4GB reported RAM must be eligible for real 3D cinema'
);
assert.ok(source.includes('three-owner-timeout-fallback')&&
  source.includes("ROOT.dataset.fxMagBirthRendererR1360='threejs-active';"),
  'Runtime must expose actual THREE success or a real error state');

const fixtures=[
  {name:'phone-390-fast',width:390,height:844,cores:8,ram:4,expectThree:true},
  {name:'phone-360-low-core',width:360,height:780,cores:4,ram:4,expectThree:false}
];
(async()=>{
  const browser=await chromium.launch({
    headless:true,
    args:[
      '--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
      '--use-gl=angle','--use-angle=swiftshader',
      '--enable-unsafe-swiftshader'
    ]
  });
  try{
    for(const fixture of fixtures){
      const context=await browser.newContext({
        viewport:{width:fixture.width,height:fixture.height},
        isMobile:true,hasTouch:true,deviceScaleFactor:2,
        colorScheme:'dark',locale:'hu-HU',
        userAgent:'Mozilla/5.0 (Linux; Android 16; SM-S928B) '+
          'AppleWebKit/537.36 (KHTML, like Gecko) '+
          'Chrome/133.0.0.0 Mobile Safari/537.36'
      });
      try{
        await context.addInitScript(({cores,ram})=>{
          Object.defineProperty(navigator,'hardwareConcurrency',
            {configurable:true,get:()=>cores});
          Object.defineProperty(navigator,'deviceMemory',
            {configurable:true,get:()=>ram});
          Object.defineProperty(navigator,'webdriver',
            {configurable:true,get:()=>undefined});
        },{cores:fixture.cores,ram:fixture.ram});
        const page=await context.newPage();
        const errors=[],statuses=[];
        page.on('pageerror',err=>errors.push(err.message));
        await page.goto(base+'?intro=1&r2127-active3d='+fixture.name,
          {waitUntil:'domcontentloaded',timeout:60000});
        const start=Date.now();
        for(let step=0;step<7;step++){
          await page.waitForTimeout(750);
          statuses.push(await page.evaluate(()=>{
            const d=document.documentElement.dataset;
            const over=document.querySelector('.fx-mag-birth-r533');
            return {
              when:Math.round(performance.now()),
              owner:d.fxMagBirthOwnerR533,
              renderer:d.fxMagBirthRendererR1360,
              loader:d.fxMagBirthThreeLoaderR1608,
              reason:d.fxMagBirthRendererR1450,
              legacy:d.fxMagBirthRendererR1729,
              overlay:over?.dataset.fxRenderer||'',
              oneCanvas:over?.querySelectorAll('canvas.fxb-particles').length||0,
              webglMode:d.fxMagBirthWebglModeR2116||''
            };
          }));
          if(fixture.expectThree &&
            statuses[statuses.length-1].renderer==='threejs-active'){
            break;
          }
        }
        const last=statuses[statuses.length-1];
        await page.screenshot({
          path:OUT+'/'+fixture.name+'-during-intro.png',
          animations:'allow'
        });
        const report={fixture,msElapsed:Date.now()-start,statuses,errors};
        fs.writeFileSync(OUT+'/'+fixture.name+'.json',
          JSON.stringify(report,null,2)+'\n');
        console.log('R2127_REAL_INTRO_RENDERER',JSON.stringify(report));
        assert.deepEqual(errors,[],
          'Real intro JavaScript errors, not mere loader timeouts');
        assert.equal(last.owner,'active',
          'The site must display the actual first-visit intro');
        if(fixture.expectThree){
          assert.equal(last.renderer,'threejs-active',
            'An eight-core, 4GB-reported phone never reached real THREE: '+
              JSON.stringify(report));
          assert.equal(last.overlay,'three',
            'Renderer telemetry falsely reports THREE while the visible film remains fallback');
          assert.equal(last.oneCanvas,1,
            'The introduction must have exactly one film canvas');
        }else{
          assert.ok(last.renderer==='native-canvas-reference-film' &&
            /fallback/.test(last.overlay),
            'Actual constrained phone must use the safe vector fallback: '+
              JSON.stringify(report));
        }
      }finally{await context.close()}
    }
  }finally{await browser.close()}
})().catch(error=>{
  console.error(error.stack||String(error));
  process.exitCode=1;
});
