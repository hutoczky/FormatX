'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

const out='artifacts/r2144-hero-mag-visibility';
const url=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
fs.mkdirSync(out,{recursive:true});

async function inspectPage(page,tag){
  const result=await page.evaluate(()=>{
    const root=document.documentElement;
    const hero=document.getElementById('hero');
    const canvas=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
    const box=canvas?.getBoundingClientRect();
    const r=box&&{x:box.x,y:box.y,width:box.width,height:box.height};
    const info=e=>{
      const cs=getComputedStyle(e);
      return{
        tag:e.tagName.toLowerCase(),
        id:e.id||'',
        classes:String(e.className?.baseVal||e.className||'').slice(0,200),
        rect:[...Object.values((()=>{
          const b=e.getBoundingClientRect();
          return {x:Math.round(b.x),y:Math.round(b.y),
            w:Math.round(b.width),h:Math.round(b.height)};
        })())],
        display:cs.display,visibility:cs.visibility,
        opacity:cs.opacity,zIndex:cs.zIndex,
        transform:cs.transform,filter:cs.filter,
        clipPath:cs.clipPath,maskImage:cs.maskImage,
        isolation:cs.isolation,position:cs.position,
        background:cs.backgroundColor
      };
    };
    const ancestry=[];
    for(let node=canvas;node&&ancestry.length<14;node=node.parentElement){
      ancestry.push(info(node));
    }
    const viewport=[];
    if(r&&r.width>10&&r.height>10){
      const pts=[[.50,.50],[.50,.27],[.27,.50],[.73,.50],[.50,.73]];
      for(const [px,py] of pts){
        const x=Math.max(1,Math.min(innerWidth-2,Math.round(r.x+r.width*px)));
        const y=Math.max(1,Math.min(innerHeight-2,Math.round(r.y+r.height*py)));
        viewport.push({x,y,top:document.elementsFromPoint(x,y)
          .slice(0,9).map(e=>info(e))});
      }
    }
    const overlays=[...document.querySelectorAll(
      '.fx-mag-birth-r533,.fx-archive-cinema-r1987,.fx-archive-layer-r1987,'+
      '.fx-crystal-organism-r326-stage,.fx-crystal-organism-r326-canvas'
    )].slice(0,20).map(e=>info(e));
    return{
      documentSize:[innerWidth,innerHeight],scrollY,hash:location.hash,
      canvas:r,canvasPixels:canvas&&[canvas.width,canvas.height],
      htmlFlags:{
        ...Object.fromEntries(Object.entries(root.dataset).filter(
          ([k])=>/^(fxCrystal|fxCore|fxMagBirth|fxArchive)/.test(k)
        ).slice(0,75)),
        fxNativeMagCompositorR2146:root.dataset.fxNativeMagCompositorR2146||'',
        fxCinematicMobileHandoffR2146:
          root.dataset.fxCinematicMobileHandoffR2146||'',
        fxNativeMagCompositorR2151:
          root.dataset.fxNativeMagCompositorR2151||'',
        fxNativeMagLateHandoffR2153:
          root.dataset.fxNativeMagLateHandoffR2153||''
      },
      hero:hero&&info(hero),ancestry,viewport,overlays
    };
  });
  const capture=await page.screenshot({
    path:out+'/'+tag+'-full.png',animations:'allow'
  });
  /* Measure the real COMPOSITED page, not just pixels inside the WebGL canvas.
     R2142 had a beautifully painted native framebuffer but a black viewport
     until the user scrolled 1 pixel. A DOM-ready/canvas-ready test missed it. */
  result.visiblePixelProof=await page.evaluate(async input=>{
    const image=new Image();
    image.src='data:image/png;base64,'+input.png;
    await image.decode();
    const probe=document.createElement('canvas');
    probe.width=image.naturalWidth;probe.height=image.naturalHeight;
    const ctx=probe.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(image,0,0);
    const rx=image.naturalWidth/innerWidth;
    const ry=image.naturalHeight/innerHeight;
    const box=input.rect;
    const x0=Math.max(0,Math.round((box.x+box.width*.19)*rx));
    const x1=Math.min(probe.width,Math.round((box.x+box.width*.81)*rx));
    const y0=Math.max(0,Math.round((box.y+box.height*.13)*ry));
    const y1=Math.min(probe.height,Math.round((box.y+box.height*.77)*ry));
    const width=x1-x0,height=y1-y0;
    if(width<10||height<10)return {visible:false,reason:'invalid-region'};
    const rgba=ctx.getImageData(x0,y0,width,height).data;
    let bright=0,total=0,mean=0,mean2=0;
    const stride=Math.max(1,Math.floor(Math.max(width,height)/240));
    for(let y=0;y<height;y+=stride){
      for(let x=0;x<width;x+=stride){
        const idx=(y*width+x)*4;
        const l=rgba[idx]*.2126+rgba[idx+1]*.7152+rgba[idx+2]*.0722;
        if(l>50)bright++;
        mean+=l;mean2+=l*l;total++;
      }
    }
    mean/=Math.max(1,total);
    const dev=Math.sqrt(Math.max(0,mean2/Math.max(1,total)-mean*mean));
    return {brightRatio:bright/Math.max(1,total),
      luminanceStdDev:dev,region:[x0,y0,x1,y1],
      samples:total,composited:bright/Math.max(1,total)>.07&&dev>16};
  },{png:capture.toString('base64'),rect:result.canvas});
  const native=page.locator('#hero .fx-crystal-organism-r326-canvas');
  await native.screenshot({path:out+'/'+tag+'-canvas.png',animations:'allow'});
  fs.writeFileSync(out+'/'+tag+'.json',JSON.stringify(result,null,2)+'\n');
  console.log('R2144_REAL_HERO_OCCLUSION',JSON.stringify({
    phase:tag,canvas:result.canvas,pixelProof:result.visiblePixelProof,
    ancestors:result.ancestry.map(v=>({
      classes:v.classes,opacity:v.opacity,visibility:v.visibility,
      display:v.display,clipPath:v.clipPath,maskImage:v.maskImage,zIndex:v.zIndex
    })),
    cover:result.viewport.map(p=>({
      x:p.x,y:p.y,stack:p.top.slice(0,5).map(v=>v.id||
        v.classes.slice(0,65)||v.tag)
    }))
  }));
  return result;
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
    '--use-angle=swiftshader','--enable-unsafe-swiftshader'
  ]});
  try{
    for(const view of [
      {name:'phone-390',width:390,height:844,mobile:true},
      /* R2146: R2144 intermittently passed once and failed the very next
         real Chromium attempt. Reboot a second INDEPENDENT mobile browser
         context and repeat the whole ten-second intro plus fully composited
         no-scroll MAG screenshot. Do not silently accept a flaky first pass. */
      {name:'phone-390-repeat',width:390,height:844,mobile:true},
      /* R2153: delayed real shader loading must not strand the hero after
         the genuine 10-second intro has already dispatched its event. */
      {name:'phone-390-late-webgl',width:390,height:844,mobile:true,
        lateWebgl:true},
      {name:'desktop-1440',width:1440,height:900,mobile:false}
    ]){
      const context=await browser.newContext({
        viewport:{width:view.width,height:view.height},
        isMobile:view.mobile,hasTouch:view.mobile,
        deviceScaleFactor:view.mobile?2:1,
        locale:'hu-HU',colorScheme:'dark'
      });
      try{
        await context.addInitScript(()=>{
          Object.defineProperty(navigator,'webdriver',{
            configurable:true,get:()=>undefined
          });
        });
        const page=await context.newPage(),errors=[];
        if(view.lateWebgl){
          await page.route('**/formatx-crystal-organism-r326.js?*',
            async route=>{
              await new Promise(resolve=>setTimeout(resolve,13250));
              await route.continue();
            });
        }
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(url+'?intro=1&r2144-hero-occlusion='+view.name,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          const overlay=document.querySelector('.fx-mag-birth-r533');
          return root.dataset.fxCrystalOrganismR326==='ready' &&
            (!overlay||getComputedStyle(overlay).visibility==='hidden'||
              Number(getComputedStyle(overlay).opacity)<.02);
        },null,{timeout:70000});
        await page.waitForTimeout(350);
        const original=await inspectPage(page,view.name+'-after-intro');
        // A non-interactive 1px scroll should not be needed to reveal a
        // persistent 3D hero. Probe this separately; do not hide the issue
        // by scrolling the native canvas before taking the first screenshot.
        await page.evaluate(()=>window.scrollTo(0,1));
        await page.waitForTimeout(600);
        const scrolled=await inspectPage(page,view.name+'-after-1px-scroll');
        assert.ok(original.canvas&&original.canvas.width>50&&original.canvas.height>50);
        if(view.lateWebgl){
          assert.equal(
            original.htmlFlags?.fxNativeMagLateHandoffR2153,
            'film-completed-before-original-webgl-ready',
            'The deferred original WebGL engine missed its 10s movie event '+
              'without the R2153 late-film recovery: '+
              JSON.stringify(original.htmlFlags));
        }
        if(view.mobile){
          /* The R326 compositor promotion is a recovery fallback only: on
             an already-visible original WebGL canvas, the film may finish
             before that listener is mounted, correctly making it unnecessary.
             Require the SAME original canvas to be visible in the final
             screenshot with NO scroll; never require the recovery code to
             execute on a healthy page. */
          assert.equal(original.htmlFlags?.fxCinematicMobileHandoffR2146,
            'direct-native-mag-no-secondary-cover',
            'Redundant second cinematic cut is still hiding the native MAG');
          /* R2151: before the fix the CSS !important rule returned 'none'
             even though the JS had assigned an ordinary inline translate3d.
             Do not certify mere WebGL readiness or a dummy status flag:
             actual COMPUTED transforms must contain the promoted matrix. */
          /* R2152: the original MAG can become COMPOSITED before the
             bounded r2151 recovery event fires (or on the healthy initial
             renderer path without needing it). Do not flag a genuinely
             painted, no-scroll WebGL hero as a failure because no recovery
             was necessary. Conversely, when recovery claims to have run,
             both computed transforms MUST defeat r422 !important CSS. The
             independent full-screenshot pixel assertions below remain
             mandatory in ALL cases; no black image can pass. */
          const promoted=Boolean(
            original.htmlFlags?.fxNativeMagCompositorR2151);
          if(promoted){
            assert.equal(original.htmlFlags.fxNativeMagCompositorR2151,
              'important-identity-transform-beats-r422-none-important',
              'Recovery ran but did not publish the canonical R2151 transform');
            assert.ok(original.ancestry[0]?.transform!=='none'&&
              original.ancestry[1]?.transform!=='none',
              'Canonical CSS still suppressed the real MAG compositor promotion: '+
                JSON.stringify(original.ancestry.slice(0,2)));
          }else{
            assert.ok(original.visiblePixelProof.composited,
              'Recovery was not called AND original MAG is invisible before any scroll: '+
                JSON.stringify(original.visiblePixelProof));
          }
        }
        assert.ok(original.visiblePixelProof.composited,
          'The original MAG is WebGL-ready but absent from the real '+
          'viewport BEFORE scrolling: '+JSON.stringify({
            viewport:view.name,proof:original.visiblePixelProof,
            stage:original.ancestry.slice(0,3)
          }));
        assert.ok(scrolled.visiblePixelProof.composited,
          'The native MAG disappeared after a harmless 1px scroll: '+
          JSON.stringify(scrolled.visiblePixelProof));
        assert.deepEqual(errors,[],'Uncaught runtime errors');
        fs.writeFileSync(out+'/'+view.name+'-summary.json',
          JSON.stringify({view,original,scrolled,errors},null,2)+'\n');
      }finally{await context.close()}
    }
  }finally{await browser.close()}
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
