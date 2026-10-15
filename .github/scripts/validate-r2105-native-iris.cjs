'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

/* R2114: the original permanent WebGL MAG must still take ownership after
   the repaired R2112 live fallback. A frame-perfect R2105 screenshot alone
   would not catch an accidental reversion to the blank phase-only film. */
const originalFilmOwner=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const originalFallback=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-reference-film-r649.js','utf8');
assert.ok(
  originalFilmOwner.includes('repainting-every-125ms-and-at-phase-changes') &&
  originalFilmOwner.includes('lastSoftwareFallbackPhase=visiblePhase;') &&
  originalFallback.includes('pendingQualityResize=true;'),
  'R2114 real R2112 nonblank film/graphics-canvas handoff has regressed'
);

const BASE=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2105-native-physical-optics';
fs.mkdirSync(OUT,{recursive:true});
/* The unchanged original download CTA may be resolved to the current signed
   release artifact by the ordinary download owner at runtime. Validate the
   exact first-party release repository rather than falsely requiring the
   initial /download/multiplatform path after hydration. */
const validDownloadHref=href=>
  href==='/download/multiplatform' ||
  /^https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/download\/v[0-9]+\/FormatX-Suite-Pro-V[0-9]+\.zip$/.test(href);
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
        await page.waitForTimeout(280);
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
            opticScale:root.dataset.fxNativeMagOpticScaleR2108||'',
            sapphireRadius:Number(root.dataset.fxNativeMagLensXRadiusR2108||0),
            count:canvases.length,
            webgl:root.dataset.fxCoreReal3d,
            width:rect?.width||0,height:rect?.height||0,
            pixelWidth:canvas?.width||0,pixelHeight:canvas?.height||0,
            visible:cs?.visibility==='visible'&&cs?.display!=='none'
              &&Number(cs.opacity)>0,
            heroCTA:!!document.querySelector('#hero .hero-actions #hero-download'),
            globalCTA:!!document.getElementById('hero-download'),
            CTAcount:document.querySelectorAll('#hero-download').length,
            CTAhref:document.getElementById('hero-download')?.getAttribute('href')||'',
            CTAholder:!!document.querySelector(
              '.fx-archive-final-cta-r2032 #hero-download'
            ),
            archiveCinema:root.dataset.fxArchiveCinema||'',
            archiveScene:root.dataset.fxArchiveCinemaChapter||'',
            heroElement:!!document.getElementById('hero'),
            heroCopy:!!document.querySelector('#hero .hero-copy'),
            heroChildren:document.getElementById('hero')?.children.length||0,
            heading:document.querySelector('#hero-title')?.textContent?.trim().slice(0,80)||'',
            heroClass:document.getElementById('hero')?.className||'',
            heroOpacity:getComputedStyle(document.getElementById('hero')||document.body).opacity,
            heroCopyStyle:(()=>{
              const el=document.querySelector('#hero .hero-copy');
              if(!el)return null;
              const style=getComputedStyle(el),rect=el.getBoundingClientRect();
              return {display:style.display,visibility:style.visibility,
                opacity:style.opacity,transform:style.transform,
                width:Math.round(rect.width),height:Math.round(rect.height),
                inlineStyle:el.getAttribute('style')||'',
                hidden:el.hasAttribute('hidden'),
                parent:el.parentElement?.className||'',
                parentStyle:(()=>{
                  const parent=el.parentElement;
                  const cs=parent?getComputedStyle(parent):null;
                  return cs?{display:cs.display,visibility:cs.visibility,
                    opacity:cs.opacity,inlineStyle:parent.getAttribute('style')||''}:null;
                })()};
            })(),
            hidingRules:(()=>{
              const el=document.querySelector('#hero .hero-copy');
              if(!el)return [];
              const results=[];
              const visit=(sheet)=>{
                let rules;
                try{rules=sheet.cssRules}catch(e){return}
                if(!rules)return;
                for(const rule of rules){
                  if(rule.cssRules){visit(rule);continue}
                  const selector=rule.selectorText,css=rule.style;
                  if(!selector||!css)continue;
                  if(!css.display&&!css.visibility&&!css.opacity)continue;
                  try{
                    if(el.matches(selector)){
                      results.push({selector,display:css.display||'',
                        visibility:css.visibility||'',opacity:css.opacity||'',
                        priority:css.getPropertyPriority('display')||
                          css.getPropertyPriority('visibility')||
                          css.getPropertyPriority('opacity')});
                    }
                  }catch(e){}
                }
              };
              for(const sheet of document.styleSheets)visit(sheet);
              return results.slice(-25);
            })(),
            rootIntroDataset:Object.fromEntries(
              Object.entries(root.dataset).filter(([key])=>
                /intro|birth|hero|preloader|handoff/i.test(key)
              ).slice(0,35)),
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
        assert.equal(info.opticScale,'1.29x-real-geometry',
          'R2108 did not enlarge actual native WebGL metal/glass geometry');
        assert.ok(info.sapphireRadius>=.205&&info.sapphireRadius<=.220,
          'The actual sapphire surface radius is still too small');
        assert.ok(info.visible&&info.width>50&&info.height>50,
          'Canonical MAG not genuinely visible: '+JSON.stringify(info));
        assert.ok(info.pixelWidth>100&&info.pixelHeight>100,
          'Original 3D canvas has no usable WebGL backing buffer');
        // The R1987 cinema moves the SINGLE original CTA (not a clone) to
        // the real final paper folio. While its immersive archive is active,
        // deliberately hiding .hero-copy is correct and expected.
        assert.ok(info.globalCTA&&info.CTAcount===1&&
          validDownloadHref(info.CTAhref),
          'Original canonical CTA is missing, duplicated or changed: '+
            JSON.stringify(info));
        if(info.archiveCinema==='active'){
          assert.ok(info.CTAholder&&!info.heroCTA&&
            info.heroCopyStyle?.display==='none',
            'Archive did not preserve exclusive scene/CTA final ownership: '+
              JSON.stringify(info));
        }else{
          assert.ok(info.CTAholder||info.heroCTA,
            'CTA must remain attached to its original location or actual final folio: '+
              JSON.stringify(info));
        }
        assert.ok(info.loader.includes('r2108=larger-convex-sapphire'),
          'Original renderer script stayed cached and cannot contain the bigger optic');
        assert.ok(info.loader.includes('r2105=physical-sapphire-iris'),
          'Cached obsolete R326 shader was loaded: '+JSON.stringify(info));
        // Accessibility transition actually DISPOSES of the exclusive
        // archive and must restore the exact original CTA/hero display.
        // This catches a genuine user-facing blank landing page.
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          const cta=document.querySelector('#hero .hero-actions #hero-download');
          const copy=document.querySelector('#hero .hero-copy');
          return root.dataset.fxArchiveCinema==='home'&&!!cta&&
            copy&&getComputedStyle(copy).display!=='none'&&
            getComputedStyle(copy).visibility!=='hidden';
        },null,{timeout:15000});
        const restored=await page.evaluate(()=>({
          stage:document.documentElement.dataset.fxArchiveCinema,
          CTAcount:document.querySelectorAll('#hero-download').length,
          CTAhref:document.getElementById('hero-download')?.getAttribute('href')||'',
          heroTextVisible:(()=>{
            const copy=document.querySelector('#hero .hero-copy');
            if(!copy)return false;
            const cs=getComputedStyle(copy),r=copy.getBoundingClientRect();
            return cs.display!=='none'&&cs.visibility==='visible'&&
              Number(cs.opacity)>0&&r.width>30;
          })()
        }));
        assert.equal(restored.CTAcount,1,'Original CTA became duplicated after archive handoff');
        assert.ok(validDownloadHref(restored.CTAhref), 'Restored CTA no longer links to official FormatX releases: '+JSON.stringify(restored));
        assert.ok(restored.heroTextVisible,'Original semantic hero never returned after archive disposal');
        await page.screenshot({
          path:OUT+'/'+view.name+'-semantic-hero-restored.png',
          animations:'allow'
        });
        /* R2115: R326 "ready" and canvas DOM dimensions do not prove it
           paints a visible MAG! Capture the actual WebGL canvas pixels on
           the returned semantic hero after the original film and archive.
           Do not substitute an image, CSS decoration or second renderer. */
        const realCanvas=page.locator(
          '#hero .fx-crystal-organism-r326-canvas');
        await realCanvas.scrollIntoViewIfNeeded({timeout:12000});
        await page.waitForTimeout(500);
        const nativeCanvasPixels=await realCanvas.screenshot({
          path:OUT+'/'+view.name+'-R2115-original-native-webgl-canvas.png',
          animations:'allow',timeout:15000
        });
        /* R2116 genuine screenshot pixel probe: the old 4KB PNG test
           could pass a large, almost black canvas with no visible MAG.
           Decode actual Chromium canvas screenshot and inspect luminance,
           tonal separation, and painted coverage inside the real image.
           No generated artwork, no extra app canvas or render context. */
        const nativeImageProof=await page.evaluate(async base64=>{
          const img=new Image();
          img.src='data:image/png;base64,'+base64;
          await img.decode();
          const probe=document.createElement('canvas');
          probe.width=Math.min(img.naturalWidth,420);
          probe.height=Math.max(1,Math.round(
            probe.width*img.naturalHeight/Math.max(1,img.naturalWidth)
          ));
          const ctx=probe.getContext('2d',{willReadFrequently:true});
          ctx.drawImage(img,0,0,probe.width,probe.height);
          const pixels=ctx.getImageData(0,0,probe.width,probe.height).data;
          const count=probe.width*probe.height;
          let solid=0,lit=0,maxLight=0,minLight=255,sum=0,sum2=0;
          const toneBins=new Set(),regionBins=new Set();
          let centerLit=0,centerSamples=0;
          for(let i=0;i<count;i++){
            const k=i*4;
            const red=pixels[k],green=pixels[k+1],blue=pixels[k+2];
            const alpha=pixels[k+3];
            const light=.2126*red+.7152*green+.0722*blue;
            const x=i%probe.width,y=Math.floor(i/probe.width);
            const central=Math.abs(x/probe.width-.5)<.34&&
              Math.abs(y/probe.height-.5)<.34;
            if(central)centerSamples++;
            if(alpha>16 && light>19){
              lit++;
              if(central)centerLit++;
            }
            if(alpha>16){
              solid++;
              minLight=Math.min(minLight,light);
              maxLight=Math.max(maxLight,light);
              sum+=light;sum2+=light*light;
              toneBins.add(Math.floor(light/8));
              if(central)regionBins.add([
                Math.floor(red/32),Math.floor(green/32),
                Math.floor(blue/32)
              ].join(':'));
            }
          }
          const mean=sum/Math.max(solid,1);
          return {
            source:'real-WebGL-canvas-Chromium-PNG',
            width:img.naturalWidth,height:img.naturalHeight,
            samples:count,litRatio:lit/count,
            centralLitRatio:centerLit/Math.max(centerSamples,1),
            coverage:solid/count,
            luminanceRange:maxLight-minLight,
            luminanceStdDev:Math.sqrt(Math.max(0,sum2/Math.max(solid,1)-mean*mean)),
            distinctLuminanceBands:toneBins.size,
            distinctCenterColorBuckets:regionBins.size
          };
        },nativeCanvasPixels.toString('base64'));
        const nativeGeometry=await page.evaluate(()=>{
          const canvas=document.querySelector(
            '#hero .fx-crystal-organism-r326-canvas');
          const stage=canvas?.parentElement;
          const r=canvas?.getBoundingClientRect();
          const s=canvas?getComputedStyle(canvas):null;
          const parent=stage?getComputedStyle(stage):null;
          return {
            canvas:{x:r?.x,y:r?.y,width:r?.width,height:r?.height,
              display:s?.display,opacity:s?.opacity,visibility:s?.visibility,
              filter:s?.filter,transform:s?.transform,zIndex:s?.zIndex},
            stage:{display:parent?.display,opacity:parent?.opacity,
              visibility:parent?.visibility,zIndex:parent?.zIndex},
            window:{scrollY,innerWidth,innerHeight},
            viewportCanvasVisible:!!r&&r.bottom>0&&r.top<innerHeight,
            archive:document.documentElement.dataset.fxArchiveCinema||'',
            nativePaint:document.documentElement.dataset.fxCoreReal3d||'',
            screenshotBytes:0
          };
        });
        nativeGeometry.screenshotBytes=nativeCanvasPixels.length;
        nativeGeometry.pixelProof=nativeImageProof;
        fs.writeFileSync(OUT+'/'+view.name+'-R2115-canvas-geometry.json',
          JSON.stringify(nativeGeometry,null,2)+'\n');
        console.log('R2116_REAL_NATIVE_WEBGL_PIXEL_PROOF',
          JSON.stringify({view:view.name,...nativeGeometry}));
        assert.ok(nativeCanvasPixels.length>4000&&
          nativeGeometry.viewportCanvasVisible,
          'Native 3D MAG viewport canvas was empty or off-screen');
        assert.ok(nativeImageProof.samples>=10000&&
          nativeImageProof.luminanceRange>=18&&
          nativeImageProof.luminanceStdDev>=3.0&&
          nativeImageProof.distinctLuminanceBands>=5&&
          nativeImageProof.distinctCenterColorBuckets>=5&&
          nativeImageProof.centralLitRatio>=.008,
          'Original post-intro MAG has no differentiated visible metal/glass pixels: '+
            JSON.stringify(nativeImageProof));
        assert.deepEqual(errors,[],'Runtime errors in original 3D MAG');
        reports.push({view,info,restored});
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
