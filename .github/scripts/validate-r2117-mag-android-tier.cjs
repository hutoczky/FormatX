'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'../..');
const core=fs.readFileSync(path.join(ROOT,'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js'),'utf8');
const loaders=[
  'docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js',
  'docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js',
  'docs/scifi-ui/scripts/formatx-core-mobile-v55.js'
];
const TOKEN='&r2117=high-core-android-normal-mesh';
assert.ok(core.includes('hardwareConcurrency <= 4 || deviceMemory <= 2'),
  'The permanent MAG must match the intro capability policy on privacy-rounded 4GB Android');
assert.ok(core.includes("root.dataset.fxCoreCapabilityPolicyR2117="),
  'The current live WebGL tier is not externally auditable');
for(const file of loaders){
  const code=fs.readFileSync(path.join(ROOT,file),'utf8');
  assert.ok(code.includes(TOKEN),
    'A stale alternate MAG loader would keep the old mobile geometry: '+file);
}

const url=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2117-high-core-mag';
fs.mkdirSync(OUT,{recursive:true});
const cases=[
  {name:'fast-phone-8-core-4gb-reported',cores:8,ram:4,
    expected:'mobile-full-two-pass',selected:'normal-four-point-optics-with-measured-adaptive-governor'},
  {name:'low-core-phone-4-core-4gb',cores:4,ram:4,
    expected:'mobile-constrained-one-pass',selected:'measured-adaptive-low-geometry'},
  {name:'very-low-memory-8-core-2gb',cores:8,ram:2,
    expected:'mobile-constrained-one-pass',selected:'measured-adaptive-low-geometry'}
];

(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage',
    '--enable-webgl','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]});
  const reports=[];
  try{
    for(const fixture of cases){
      const context=await browser.newContext({
        viewport:{width:390,height:844},
        isMobile:true,hasTouch:true,deviceScaleFactor:2,
        locale:'hu-HU',colorScheme:'dark',
        userAgent:'Mozilla/5.0 (Linux; Android 16; SM-S928B) '+
          'AppleWebKit/537.36 (KHTML, like Gecko) '+
          'Chrome/133.0.0.0 Mobile Safari/537.36'
      });
      try{
        await context.addInitScript(({cores,ram})=>{
          Object.defineProperty(navigator,'hardwareConcurrency',{
            configurable:true,get:()=>cores
          });
          Object.defineProperty(navigator,'deviceMemory',{
            configurable:true,get:()=>ram
          });
          Object.defineProperty(navigator,'webdriver',{
            configurable:true,get:()=>undefined
          });
        },{cores:fixture.cores,ram:fixture.ram});
        const page=await context.newPage(),errors=[];
        page.on('pageerror',err=>errors.push(err.message));
        await page.goto(url+'?intro=1&r2117-actual-gpu-tier='+fixture.name,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          return root.dataset.fxCrystalOrganismR326==='ready'&&
            Boolean(root.dataset.fxCoreCapabilityTierR620)&&
            Boolean(root.dataset.fxCoreCapabilitySelectedR2117);
        },null,{timeout:60000});
        const report=await page.evaluate(()=>{
          const root=document.documentElement;
          const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
          return {
            cores:navigator.hardwareConcurrency,
            memory:navigator.deviceMemory,
            renderer:root.dataset.fxCrystalOrganismR326,
            tier:root.dataset.fxCoreCapabilityTierR620,
            capability:root.dataset.fxCoreCapabilityR620,
            policy:root.dataset.fxCoreCapabilityPolicyR2117,
            selected:root.dataset.fxCoreCapabilitySelectedR2117,
            loader:document.querySelector('script[src*="formatx-crystal-organism-r326.js"]')?.src||'',
            canvasCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
            backingWidth:canvas?.width||0,
            backingHeight:canvas?.height||0,
            headless:root.dataset.fxCoreRenderer||'',
            owner:root.dataset.fxPrimaryMagOwnerR460||''
          };
        });
        await page.screenshot({
          path:OUT+'/'+fixture.name+'.png',
          animations:'allow'
        });
        const record={fixture,report,errors};
        fs.writeFileSync(OUT+'/'+fixture.name+'.json',
          JSON.stringify(record,null,2)+'\n');
        assert.equal(report.cores,fixture.cores,
          'The real Android CPU hint fixture was not applied');
        assert.equal(report.memory,fixture.ram,
          'The real Android memory hint fixture was not applied');
        assert.equal(report.tier,fixture.expected,
          'Permanent MAG used the wrong physical detail tier: '+JSON.stringify(record));
        assert.equal(report.selected,fixture.selected,
          'Live measured geometry governor was unexpectedly bypassed');
        assert.ok(report.policy==='high-core-four-gb-phone-normal-mesh-adaptive-fps'&&
          report.loader.includes('r2117=high-core-android-normal-mesh'),
          'A stale original MAG file or old capability policy was used');
        assert.ok(report.canvasCount===1&&report.backingWidth>=100&&
          report.backingHeight>=100,
          'Actual original WebGL MAG has not drawn a usable canvas');
        assert.deepEqual(errors,[],'Actual Android WebGL runtime errors');
        console.log('PASS R2117_ANDROID_NATIVE_QUALITY',JSON.stringify(record));
        reports.push(record);
      }finally{await context.close()}
    }
  }finally{await browser.close()}
  fs.writeFileSync(OUT+'/summary.json',JSON.stringify(reports,null,2)+'\n');
})().catch(error=>{
  console.error(error.stack||String(error));
  process.exitCode=1;
});
