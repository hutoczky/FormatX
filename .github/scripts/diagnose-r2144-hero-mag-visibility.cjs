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
      htmlFlags:Object.fromEntries(Object.entries(root.dataset).filter(
        ([k])=>/^(fxCrystal|fxCore|fxMagBirth|fxArchive)/.test(k)
      ).slice(0,75)),
      hero:hero&&info(hero),ancestry,viewport,overlays
    };
  });
  await page.screenshot({path:out+'/'+tag+'-full.png',animations:'allow'});
  const native=page.locator('#hero .fx-crystal-organism-r326-canvas');
  await native.screenshot({path:out+'/'+tag+'-canvas.png',animations:'allow'});
  fs.writeFileSync(out+'/'+tag+'.json',JSON.stringify(result,null,2)+'\n');
  console.log('R2144_REAL_HERO_OCCLUSION',JSON.stringify({
    phase:tag,canvas:result.canvas,
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
        assert.deepEqual(errors,[],'Uncaught runtime errors');
        fs.writeFileSync(out+'/'+view.name+'-summary.json',
          JSON.stringify({view,original,scrolled,errors},null,2)+'\n');
      }finally{await context.close()}
    }
  }finally{await browser.close()}
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
