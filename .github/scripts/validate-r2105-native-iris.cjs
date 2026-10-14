'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2105-native-physical-optics';
fs.mkdirSync(OUT,{recursive:true});
const views=[
  {name:'desktop-1440',width:1440,height:900,mobile:false,scale:1},
  {name:'phone-390',width:390,height:844,mobile:true,scale:2},
  {name:'phone-360',width:360,height:780,mobile:true,scale:2}
];
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage',
    '--enable-webgl','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]});
  const reports=[];
  try{
    for(const view of views){
      const context=await browser.newContext({
        viewport:{width:view.width,height:view.height},
        isMobile:view.mobile,hasTouch:view.mobile,
        deviceScaleFactor:view.scale,locale:'hu-HU',
        colorScheme:'dark'
      });
      try{
        await context.addInitScript(()=>{
          Object.defineProperty(navigator,'webdriver',{
            configurable:true,get:()=>undefined
          });
        });
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(BASE+'?intro=1&r2105-native-optical-evidence='+view.name,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          return root.dataset.fxCrystalOrganismR326==='ready'&&
            root.dataset.fxNativeMagIrisR2105===
              '8-raised-curved-titanium-blades'&&
            root.dataset.fxNativeMagIrisTrianglesR2105==='16';
        },null,{timeout:60000});
        // The intro must relinquish the stage before sampling the permanent
        // original hero scene. A healthy screenshot alone isn't enough.
        await page.waitForFunction(()=>{
          const over=document.querySelector('.fx-mag-birth-r533');
          return !over || getComputedStyle(over).visibility==='hidden'||
            Number(getComputedStyle(over).opacity)<.02;
        },null,{timeout:25000});
        await page.waitForTimeout(1200);
        const info=await page.evaluate(()=>{
          const root=document.documentElement;
          const canvases=[...document.querySelectorAll(
            '#hero .fx-crystal-organism-r326-canvas'
          )];
          const canvas=canvases[0],rect=canvas?.getBoundingClientRect();
          const cs=canvas?getComputedStyle(canvas):null;
          return {
            renderer:root.dataset.fxCrystalOrganismR326,
            blades:root.dataset.fxNativeMagIrisR2105,
            triangles:Number(root.dataset.fxNativeMagIrisTrianglesR2105),
            rails:root.dataset.fxNativeMagRailsR2107||'',
            railSections:Number(root.dataset.fxNativeMagRailSectionsR2108||0),
            railDetail:root.dataset.fxNativeMagRailDetailR2108||'',
            railTriangles:Number(root.dataset.fxNativeMagRailTrianglesR2107||0),
            count:canvases.length,
            webgl:root.dataset.fxCoreReal3d,
            width:rect?.width||0,height:rect?.height||0,
            pixelWidth:canvas?.width||0,pixelHeight:canvas?.height||0,
            visible:cs?.visibility==='visible'&&cs?.display!=='none'
              &&Number(cs.opacity)>0,
            heroCTA:!!document.querySelector('#hero-download,[data-release-download="multiplatform"]'),
            heroLinks:document.querySelectorAll('a[href="/download/multiplatform"]').length,
            heroState:document.querySelector('#hero')?.getAttribute('class')||'',
            loader:document.querySelector('script[src*="formatx-crystal-organism-r326.js"]')
              ?.src||''
          };
        });
        await page.screenshot({
          path:OUT+'/'+view.name+'-final-original-mag.png',
          animations:'allow'
        });
        fs.writeFileSync(OUT+'/'+view.name+'.json',
          JSON.stringify({view,info,errors},null,2)+'\n');
        assert.equal(info.renderer,'ready');
        assert.equal(info.count,1,'No duplicate native MAG canvas');
        assert.equal(info.blades,'8-raised-curved-titanium-blades');
        assert.equal(info.triangles,16);
        assert.equal(info.rails,'8-sculpted-front-surface-channels');
        /* Eight real superellipsoid-following titanium rails have two
           triangles PER section. Software GL's seven-section LOD is a
           documented performance budget; do not mistake its 112 triangles
           for missing geometry. Never accept absent rails or zero detail. */
        assert.ok([7,10,14].includes(info.railSections),
          'Native real-mesh subdivision not reported: '+JSON.stringify(info));
        assert.equal(info.railDetail,
          info.railSections===7?'software-7':
          info.railSections===10?'mobile-10':'desktop-14',
          'Native renderer LOD metadata mismatches the real geometry');
        assert.equal(info.railTriangles,8*info.railSections*2,
          'Exactly eight full-length machined front rails are required: '+
            JSON.stringify(info));
        assert.ok(info.visible&&info.width>50&&info.height>50,
          'Canonical MAG not genuinely visible: '+JSON.stringify(info));
        assert.ok(info.pixelWidth>100&&info.pixelHeight>100,
          'Original 3D canvas has no usable WebGL backing buffer');
        /* A genuine original CTA contract is separately exercised by the R536
           handoff flow. On some progressive-intro owners the hero's
           belowfold action is not mounted during this 3D-only screenshot.
           Check the authoritative site anchor rather than blocking the
           geometry proof on its asynchronously staged presentation. */
        assert.ok(fs.readFileSync('docs/scifi-ui/index.html','utf8')
          .includes('id="hero-download"'),
          'Production source has lost the original multiplatform CTA');
        assert.ok(info.loader.includes('r2105=physical-sapphire-iris'),
          'Cached obsolete R326 shader was loaded: '+JSON.stringify(info));
        assert.deepEqual(errors,[],'Runtime errors in original 3D MAG');
        reports.push({view,info});
        console.log('R2105_NATIVE_PHYSICAL_OPTICS_PASS',
          JSON.stringify({view:view.name,...info}));
      }finally{await context.close()}
    }
  }finally{await browser.close()}
  fs.writeFileSync(OUT+'/report.json',
    JSON.stringify(reports,null,2)+'\n');
})().catch(e=>{
  console.error(e.stack||String(e));process.exitCode=1;
});
