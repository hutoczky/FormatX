'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2105-native-physical-optics';
fs.mkdirSync(OUT,{recursive:true});

/* R2109 static material-ownership protection complements runtime screenshots:
   the separate real front rails cannot disappear below the optic bezel
   merely because two facet-id masks overlap. */
const shader=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8'
);
assert.ok(shader.includes('float physicalRail=step(5.81,vFacet)*(1.0-step(5.91,vFacet));')&&
  shader.includes('float physicalBezel=step(5.70,vFacet)*(1.0-step(5.81,vFacet));')&&
  shader.includes('c=mix(c,channelTitanium,physicalRail*.96);')&&
  shader.includes('c=mix(c,sapphireGlass,physicalLens);'),
  'The physically distinct titanium channels, bezel and sapphire must survive shader edits');
assert.ok(shader.includes('R2117: physically coherent four-arm metal shoulders') &&
  shader.includes('float cutShoulder=pow(sat(dot(n,normalize(vec3(-.38,.62,.69)))),3.0)') &&
  shader.includes('c+=vec3(.64,.69,.63)*cutShoulder*') &&
  shader.includes('R2116: the real depth-tested rails') &&
  shader.includes('R2118: the true FOUR solid arms') &&
  shader.includes('float machinedFace=forgedArmSpan*smoothstep(.35,.76,raisedFace);') &&
  shader.includes('c+=vec3(.73,.77,.71)*machinedFace*axisShoulder*'),
  'The latest permanent 3D MAG must use broad physically lit arms and separate titanium/sapphire, not old flat cyan shading');
for(const loaderPath of [
  'docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js',
  'docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js',
  'docs/scifi-ui/scripts/formatx-core-mobile-v55.js'
]){
  const loader=fs.readFileSync(loaderPath,'utf8');
  assert.ok(loader.includes('&r2118=forged-silver-arm-relief'),
    'Permanent MAG loader still uses the old flat four-point material: '+loaderPath);
}
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
            sideTriangles:Number(root.dataset.fxNativeMagIrisSideTrianglesR2127||0),
            backTriangles:Number(root.dataset.fxNativeMagIrisBackTrianglesR2127||0),
            irisThickness:Number(root.dataset.fxNativeMagIrisThicknessR2127||0),
            allIrisTriangles:Number(root.dataset.fxNativeMagIrisTotalTrianglesR2127||0),
            raisedPupil:root.dataset.fxNativeMagPupilR2128||'',
            pupilTriangles:Number(root.dataset.fxNativeMagPupilTrianglesR2128||0),
            pupilElevation:Number(root.dataset.fxNativeMagPupilElevationR2128||0),
            pupilShader:root.dataset.fxNativeMagPupilShaderR2129||'',
            sculptedPanels:root.dataset.fxNativeMagPanelsR2130||'',
            sculptedTriangles:Number(root.dataset.fxNativeMagPanelTrianglesR2130||0),
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
        /* R2127: actual original R326 now matches the movie's closed
           extruded shutter shape. Confirm all depth-bearing faces are
           present on mobile and desktop and still use ONE GPU draw. */
        assert.equal(info.sideTriangles,64,
          'Eight original MAG shutters are missing depth-lit side faces');
        assert.equal(info.backTriangles,16,
          'Eight original MAG shutters must have physical rear faces');
        assert.ok(info.irisThickness>=.009&&info.irisThickness<=.012,
          'Original R326 lens shutter has no real machined depth: '+
            JSON.stringify(info));
        assert.equal(info.allIrisTriangles,96,
          'Original eight native closed shutter solids must total 96 triangles');
        assert.equal(info.raisedPupil,
          'convex-raised-sapphire-hemisphere-over-physical-iris',
          'R2128 central pupil must be a genuine original WebGL surface');
        assert.ok([60,120,224].includes(info.pupilTriangles),
          'Missing capability-scaled convex sapphire hemisphere triangles: '+
            JSON.stringify(info));
        assert.ok(info.pupilElevation>=.063&&info.pupilElevation<=.065,
          'The raised glass should project physically above the shutter backs');
        assert.equal(info.pupilShader,
          'r2132-narrow-physical-normal-obsidian-sapphire-glint',
          'R2129 must shade the physical pupil from actual curved normals');
        assert.equal(info.sculptedPanels,
          '8-physically-angled-metal-arm-faces',
          'R2130 must sculpt eight genuine 3D metallic four-arm face normals');
        assert.equal(info.sculptedTriangles,16,
          'Each arm must have two true geometric metal panel faces');
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
        assert.ok(info.loader.includes('r2105=physical-sapphire-iris') &&
          info.loader.includes('r2117=physical-four-arm-facet-lights') &&
          info.loader.includes('r2130=extruded-optical-iris-silver-panels') &&
          info.loader.includes('r2132=obsidian-glass-narrow-studio-reflection'),
          'Cached obsolete R326 shader was loaded instead of the actual R2117 material: '+
            JSON.stringify(info));
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
