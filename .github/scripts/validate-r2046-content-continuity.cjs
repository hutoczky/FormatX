'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
async function verify(browser,viewport){
  const mobile=viewport.width<=900;
  const context=await browser.newContext({
    viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'no-preference',
    deviceScaleFactor:mobile&&viewport.width===412?1.75:1,
    colorScheme:'dark'
  });
  const page=await context.newPage();
  if(mobile){
    const cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions',{
      offline:false,latency:150,downloadThroughput:200*1024,uploadThroughput:200*1024
    });
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  }
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  await page.goto(URL+'?lighthouse=1&lang=hu',{waitUntil:'domcontentloaded',timeout:60000});
  // Regression from actual R2045 Lighthouse mobile filmstrip: at 13.9s
  // everything readable disappeared while only the decorative MAG remained.
  await page.waitForTimeout(mobile?14500:3500);
  const state=await page.evaluate(()=>{
    const root=document.documentElement;
    const hero=document.querySelector('#hero .hero-copy');
    const title=document.getElementById('hero-title');
    const rect=hero?.getBoundingClientRect();
    const tr=title?.getBoundingClientRect();
    const style=hero?getComputedStyle(hero):null;
    const titleStyle=title?getComputedStyle(title):null;
    const folio=document.querySelector('[data-fx-cinema-panel-active="true"]');
    const folioStyle=folio?getComputedStyle(folio):null;
    const inViewport=r=>!!r&&r.width>100&&r.height>15
      &&r.bottom>0&&r.top<innerHeight-8;
    const actualText=(title?.textContent||'').trim();
    // Ancestor opacity/visibility also matter: a child can report opacity=1
    // while a global post-intro overlay has hidden the entire parent tree.
    const paintedHero=hero?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||false;
    const paintedTitle=title?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||false;
    const hasOriginalLinks=!!hero?.querySelector('a[href]');
    return {
      cinema:root.dataset.fxArchiveCinema||'home',
      experience:root.dataset.fxArchiveExperience||'unavailable',
      hero:hero?{display:style.display,visibility:style.visibility,opacity:style.opacity,
        x:rect.x,y:rect.y,w:rect.width,h:rect.height,inViewport:inViewport(rect)}:null,
      title:title?{display:titleStyle.display,visibility:titleStyle.visibility,
        x:tr.x,y:tr.y,w:tr.width,h:tr.height,inViewport:inViewport(tr),text:actualText}:null,
      workingFolio:!!folio&&folioStyle.display!=='none'&&folioStyle.visibility!=='hidden'
        &&inViewport(folio.getBoundingClientRect()),
      hasOriginalLinks,paintedHero,paintedTitle,
      scrollY,viewport:{width:innerWidth,height:innerHeight}
    };
  });
  assert.ok(state.workingFolio||(
    state.hero?.display!=='none'&&state.hero?.visibility==='visible'
    &&Number(state.hero?.opacity)>.2&&state.hero?.inViewport
    &&state.title?.display!=='none'&&state.title?.visibility==='visible'
    &&state.title?.inViewport&&state.title?.text?.includes('FORMATX')
    &&state.paintedHero&&state.paintedTitle&&state.hasOriginalLinks
  ),'After delayed rendering, show the true interactive HTML or real MAG folio, never an empty MAG-only viewport: '+JSON.stringify(state));
  // A CSS visibility check is insufficient: our October 12 filmstrip
  // showed a MAG-only image even when the real H1 reported visible.
  // Require actual contrasting title pixels in a real Chromium screenshot.
  const fs=require('node:fs');
  fs.mkdirSync('.archive-artifacts',{recursive:true});
  const png=await page.screenshot({
    path:'.archive-artifacts/r2046-long-load-'+(mobile?'phone-'+viewport.width:'desktop')+'.png',
    timeout:30000
  });
  const visual=await page.evaluate(async (encoded)=>{
    const title=document.getElementById('hero-title');
    const rect=title?.getBoundingClientRect();
    const stack=rect?document.elementsFromPoint(
      Math.min(innerWidth-2,Math.max(2,rect.left+rect.width*.5)),
      Math.min(innerHeight-2,Math.max(2,rect.top+rect.height*.5))
    ).slice(0,12).map(el=>{
      const st=getComputedStyle(el);
      return {tag:el.tagName,id:el.id,cls:String(el.className||'').slice(0,65),
        z:st.zIndex,opacity:st.opacity,background:st.backgroundColor,
        position:st.position,pointer:st.pointerEvents};
    }):[];
    const ancestors=[];
    for(let el=title;el&&ancestors.length<10;el=el.parentElement){
      const st=getComputedStyle(el);
      ancestors.push({tag:el.tagName,id:el.id,cls:String(el.className||'').slice(0,50),
        visible:st.visibility,opacity:st.opacity,display:st.display,
        z:st.zIndex,transform:st.transform,clip:st.clipPath});
    }
    if(!rect)return {bright:0,ratio:0,stack,ancestors};
    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
    const canvas=document.createElement('canvas');
    canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0);
    bitmap.close();
    const scaleX=canvas.width/innerWidth,scaleY=canvas.height/innerHeight;
    const x=Math.max(0,Math.floor(rect.left*scaleX));
    const y=Math.max(0,Math.floor(rect.top*scaleY));
    const w=Math.min(canvas.width-x,Math.ceil(rect.width*scaleX));
    const h=Math.min(canvas.height-y,Math.ceil(rect.height*scaleY));
    if(w<=0||h<=0)return {bright:0,ratio:0,stack,ancestors};
    const pixels=ctx.getImageData(x,y,w,h).data;
    let bright=0,examined=0;
    for(let i=0;i<pixels.length;i+=16){
      examined++;
      if(pixels[i]>.67*255&&pixels[i+1]>.67*255&&pixels[i+2]>.67*255)bright++;
    }
    return {bright,ratio:bright/Math.max(1,examined),w,h,stack,ancestors};
  },png.toString('base64'));
  console.log('MAG_CONTENT_ACTUAL_PAINT',JSON.stringify({
    viewport:state.viewport,mode:state.cinema,ratio:visual.ratio,
    bright:visual.bright,stack:visual.stack,ancestors:visual.ancestors
  }));
  assert.ok(visual.ratio>.005&&visual.bright>=75,
    'MAG-only compositor overpainted the real native H1 despite CSS being visible: '+
    JSON.stringify({state,visual}));
  assert.ok(errors.length===0,'Uncaught errors: '+errors.join(' | '));
  console.log('MAG_CONTENT_CONTINUITY_PASS',JSON.stringify(state));
  await context.close();
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  try{
    await verify(browser,{width:390,height:844});
    // Exact Lighthouse mobile viewport in the saved R2045 trace: 412 CSS
    // pixels, 823 high, device-scale-factor 1.75 and 4x CPU slowdown.
    await verify(browser,{width:412,height:823});
    await verify(browser,{width:1440,height:900});
  }finally{await browser.close();}
})().catch(error=>{console.error('MAG_CONTENT_CONTINUITY_FAIL',error.stack||String(error));process.exitCode=1;});
