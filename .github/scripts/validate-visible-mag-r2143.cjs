'use strict';
/* R2143 — visual evidence for the ACTUAL permanent WebGL MAG.
   Earlier content screenshots could be taken before the native shader's first
   painted frame, so a green layout test hid a still-flat mobile silhouette. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_VISIBLE_MAG_DIR||'artifacts/visible-mag-r2143';
async function capture(browser,{name,width,height,mobile}){
  const context=await browser.newContext({
    viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,
    hasTouch:mobile,colorScheme:'dark',locale:'hu-HU',
    reducedMotion:'no-preference'
  });
  const page=await context.newPage();
  const failures=[];
  page.on('pageerror',error=>failures.push(String(error)));
  await page.addInitScript(()=>{
    try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');}catch(_){}
  });
  let state=null;
  try{
    const url=new URL(BASE);
    url.searchParams.set('mobileproof','1');
    url.searchParams.set('magvisual','r2143');
    await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
    const hero=page.locator('#hero .hero-space');
    await hero.waitFor({state:'visible',timeout:20000});
    // Natural pointer movement activates the same deferred renderer that a
    // visitor's first interaction activates, without clicking controls.
    const rect=await hero.boundingBox();
    if(rect)await page.mouse.move(rect.x+Math.min(rect.width*.5,200),rect.y+Math.min(rect.height*.5,200));
    await page.waitForFunction(()=>{
      const root=document.documentElement;
      const canvas=document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas');
      return root.dataset.fxCrystalOrganismR326==='ready' &&
        root.dataset.fxCoreFirstFrameR1913==='painted' &&
        canvas instanceof HTMLCanvasElement &&
        canvas.width>150 && canvas.height>150;
    },null,{timeout:45000});
    // R2155: a painted WebGL canvas does not prove that the deferred hero
    // layout/CSS has settled. The earlier www proof captured a bare stage at
    // far left with the text entirely missing even though WebGL was ready.
    // Require the actual hero composition to be laid out before evidence.
    await page.waitForFunction(isMobile=>{
      const hero=document.querySelector('#hero');
      const space=hero?.querySelector('.hero-space');
      const headline=hero?.querySelector('h1');
      const shell=space?.getBoundingClientRect();
      const title=headline?.getBoundingClientRect();
      if(!shell||!title||title.width<100||title.height<20)return false;
      if(!isMobile && shell.x<innerWidth*.37)return false;
      return true;
    },mobile,{timeout:25000});
    await page.evaluate(()=>document.fonts?.ready);
    await page.waitForTimeout(650);
    state=await page.evaluate(()=>{
      const root=document.documentElement;
      const canvas=document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas');
      const box=canvas?.getBoundingClientRect();
      const style=canvas?getComputedStyle(canvas):null;
      return{
        ready:root.dataset.fxCrystalOrganismR326,
        firstFrame:root.dataset.fxCoreFirstFrameR1913,
        shader:root.dataset.fxCoreShaderCompileR600,
        renderer:root.dataset.fxCoreRenderer,
        rendererClass:root.dataset.fxCoreRendererClassR1541,
        geometry:root.dataset.fxCoreGeometryProfileR1603,
        canvasCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
        canvasWidth:canvas?.width,canvasHeight:canvas?.height,
        box:box?{x:box.x,y:box.y,width:box.width,height:box.height}:null,
        opacity:style?.opacity,visibility:style?.visibility,display:style?.display
      };
    });
    assert.equal(state.canvasCount,1,name+': must use one permanent MAG canvas');
    assert.equal(state.ready,'ready',name+': core not initialized');
    assert.equal(state.firstFrame,'painted',name+': screenshot predates WebGL first frame');
    assert(state.box?.width>=180&&state.box?.height>=180,name+': MAG is too small');
    assert.notEqual(state.display,'none',name+': canvas hidden');
    assert.notEqual(state.visibility,'hidden',name+': canvas hidden');
    assert(Number(state.opacity)>.15,name+': MAG opacity too low for a visible hero');
    assert.equal(failures.length,0,name+': '+failures.join(' | '));
    // R2152: replay belongs in the upper free-space of the actual MAG stage.
    // Guard against the previous overlap with the two native hit targets.
    const replayLayout=await page.evaluate(()=>{
      const rect=selector=>document.querySelector(selector)?.getBoundingClientRect()||null;
      const replay=rect('#hero .hero-space > .fx-mag-replay-r2150');
      const ask=rect('#hero .fx-reference-ask');
      const sound=rect('#hero .fx-three-sound');
      const intersects=(a,b)=>!!(a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);
      return{
        replay:replay?{x:replay.x,y:replay.y,width:replay.width,height:replay.height}:null,
        overlapAsk:intersects(replay,ask),overlapSound:intersects(replay,sound),
        withinViewport:!!replay&&replay.left>=0&&replay.right<=innerWidth
      };
    });
    state.replayLayout=replayLayout;
    assert(replayLayout.replay?.width>=130&&replayLayout.replay?.height>=44,
      name+': replay link missing or too small');
    assert(replayLayout.withinViewport,name+': replay escaped visible MAG viewport');
    assert(!replayLayout.overlapAsk&&!replayLayout.overlapSound,
      name+': replay overlaps SOUND or ASK controls');
    await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false});
  }finally{
    await fs.writeFile(path.join(OUT,name+'.json'),JSON.stringify({state,failures},null,2)+'\n');
    await context.close();
  }
}
(async()=>{
  await fs.mkdir(OUT,{recursive:true});
  const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||process.env.CHROME_BIN||undefined;
  const browser=await chromium.launch({
    headless:true,...(executablePath?{executablePath}:{}),
    args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']
  });
  try{
    await capture(browser,{name:'mobile-permanent-390x844',width:390,height:844,mobile:true});
    await capture(browser,{name:'desktop-permanent-1440x900',width:1440,height:900,mobile:false});
    console.log('R2143 permanent MAG visual screenshots captured AFTER a real WebGL first frame.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e?.stack||e);process.exitCode=1;});
