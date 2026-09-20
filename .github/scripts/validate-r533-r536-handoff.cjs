'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT = process.env.FORMATX_INTRO_EVIDENCE_DIR || 'artifacts/r533-r536-handoff';
const CANVAS = '#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas';
const STAGE = '#hero .hero-space > .fx-crystal-organism-r326-stage';
const OVERLAY = '.fx-mag-birth-r533';

fs.mkdirSync(OUT,{recursive:true});
const writeJson=(name,value)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');

function url(params={}){
  const u=new URL(BASE);
  for(const [key,value] of Object.entries(params))u.searchParams.set(key,String(value));
  return u.href;
}

async function snapshot(page){
  return page.evaluate(({CANVAS,STAGE,OVERLAY})=>{
    const root=document.documentElement;
    const visible=el=>{
      if(!(el instanceof Element))return false;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.02&&r.width>0&&r.height>0;
    };
    const stage=document.querySelector(STAGE);
    const canvas=document.querySelector(CANVAS);
    const sound=document.querySelector('#hero .fx-three-sound');
    const ask=document.querySelector('#hero .fx-reference-ask');
    const cinema=document.querySelector('.fx-c536-stage');
    return{
      birth:root.dataset.fxMagBirthLiveR533||'',
      birthOwner:root.dataset.fxMagBirthOwnerR533||'',
      phase:root.dataset.fxMagBirthPhase||document.querySelector(OVERLAY)?.dataset.phase||'',
      overlayCount:document.querySelectorAll(OVERLAY).length,
      legacyPreloaderCount:document.querySelectorAll('#formatx-event-horizon').length,
      crystal:root.dataset.fxCrystalOrganismR326||'',
      owner:root.dataset.fxPrimaryMagOwnerR460||'',
      renderer:root.dataset.fxCoreRenderer||'',
      scheduler:root.dataset.fxCoreScheduler||'',
      idle:root.dataset.fxCoreIdleRenderR441||'',
      stageCount:document.querySelectorAll(STAGE).length,
      canvasCount:document.querySelectorAll(CANVAS).length,
      stageIdentity:stage?.dataset.fxR548Identity||'',
      canvasIdentity:canvas?.dataset.fxR548Identity||'',
      soundVisible:visible(sound),
      askVisible:visible(ask),
      pauseCount:document.querySelectorAll('#hero .fx-reference-pause').length,
      cinemaReady:root.dataset.fxCinematicJourneyR536||'',
      cinemaContract:root.dataset.fxCinematicJourneyContractR536||'',
      cinemaMotion:root.dataset.fxCinematicJourneyMotionR536||'',
      cinemaPointerEvents:cinema?getComputedStyle(cinema).pointerEvents:'',
      scrollLock:root.getAttribute('data-fx-mag-birth-live')||'',
      overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
    };
  },{CANVAS,STAGE,OVERLAY});
}

function assertStable(state,label){
  assert.equal(state.crystal,'ready',`${label}: R326 core is not ready`);
  assert.equal(state.owner,'r326-only',`${label}: canonical R326 owner drift`);
  assert.equal(state.renderer,'single-webgl-crystal-organism-r326',`${label}: renderer drift`);
  assert.equal(state.stageCount,1,`${label}: expected one native R326 stage`);
  assert.equal(state.canvasCount,1,`${label}: expected one native R326 canvas`);
  assert.equal(state.pauseCount,0,`${label}: manual PAUSE returned`);
  assert.equal(state.scheduler,'interaction-bursts-idle-zero-frame-r441',`${label}: zero-idle scheduler drift`);
  assert.equal(state.idle,'zero-frame',`${label}: zero-idle state drift`);
  assert.ok(state.soundVisible,`${label}: SOUND is not visible`);
  assert.ok(state.askVisible,`${label}: ASK is not visible`);
  assert.equal(state.legacyPreloaderCount,0,`${label}: legacy preloader survived R533 ownership`);
  assert.ok(state.overflow<=2,`${label}: horizontal overflow ${state.overflow}px`);
}

async function installTimelineProbe(page){
  await page.evaluate(({CANVAS,STAGE,OVERLAY})=>{
    const root=document.documentElement;
    const timeline={phases:[],coreReadyPhase:null,coreSamples:[]};
    const sample=()=>{
      const overlay=document.querySelector(OVERLAY);
      const phase=String(root.dataset.fxMagBirthPhase||overlay?.dataset.phase||'');
      if(phase && timeline.phases[timeline.phases.length-1]!==phase)timeline.phases.push(phase);
      const ready=root.dataset.fxCrystalOrganismR326==='ready';
      const stage=document.querySelector(STAGE);
      const canvas=document.querySelector(CANVAS);
      if(ready){
        if(timeline.coreReadyPhase===null)timeline.coreReadyPhase=phase||'handoff';
        timeline.coreSamples.push({phase:phase||'handoff',stageCount:document.querySelectorAll(STAGE).length,canvasCount:document.querySelectorAll(CANVAS).length});
        if(stage && !stage.dataset.fxR548Identity)stage.dataset.fxR548Identity='native-stage-r548';
        if(canvas && !canvas.dataset.fxR548Identity)canvas.dataset.fxR548Identity='native-canvas-r548';
      }
    };
    window.__fxR548Timeline=timeline;
    const observer=new MutationObserver(sample);
    observer.observe(root,{attributes:true,attributeFilter:['data-fx-mag-birth-phase','data-fx-crystal-organism-r326']});
    const overlay=document.querySelector(OVERLAY);
    if(overlay)observer.observe(overlay,{attributes:true,attributeFilter:['data-phase']});
    window.__fxR548TimelineObserver=observer;
    sample();
  },{CANVAS,STAGE,OVERLAY});
}

async function readTimeline(page){
  return page.evaluate(()=>({
    phases:[...(window.__fxR548Timeline?.phases||[])],
    coreReadyPhase:window.__fxR548Timeline?.coreReadyPhase??null,
    coreSamples:[...(window.__fxR548Timeline?.coreSamples||[])]
  }));
}

async function verifyFullBirth(browser){
  const context=await browser.newContext({
    viewport:{width:1440,height:900},colorScheme:'dark',reducedMotion:'no-preference',locale:'hu-HU'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|WebGL|WebGPU|GPU/i.test(m.text()))errors.push(m.text());});
  try{
    await page.goto(url({intro:1,cinema:1,r548:'desktop-full'}),{waitUntil:'commit',timeout:30000});
    await installTimelineProbe(page);
    await page.locator(OVERLAY).waitFor({state:'visible',timeout:10000});
    const active=await snapshot(page);
    assert.equal(active.scrollLock,'active','desktop-full: R533 did not own the temporary scroll lock');
    assert.equal(active.legacyPreloaderCount,0,'desktop-full: second/legacy preloader remained');
    await page.waitForFunction(sel=>!document.querySelector(sel),OVERLAY,{timeout:12000});
    const timeline=await readTimeline(page);
    const phases=new Set(timeline.phases);
    for(const phase of ['0','1','2','3','4'])assert.ok(phases.has(phase),`desktop-full: R533 phase ${phase} not observed; got ${[...phases].join(',')}`);
    assert.notEqual(timeline.coreReadyPhase,null,'desktop-full: native R326 never became ready during birth/handoff');
    assert.ok(timeline.coreSamples.length>0,'desktop-full: no native R326 ownership samples captured');
    assert.ok(timeline.coreSamples.every(x=>x.stageCount===1&&x.canvasCount===1),'desktop-full: native R326 ownership changed during birth/handoff');

    const final=await snapshot(page);
    assertStable(final,'desktop-full');
    assert.equal(final.stageIdentity,'native-stage-r548','desktop-full: native stage was swapped during handoff');
    assert.equal(final.canvasIdentity,'native-canvas-r548','desktop-full: native canvas was swapped during handoff');
    assert.equal(final.scrollLock,'','desktop-full: intro scroll lock remained after handoff');
    assert.equal(final.cinemaReady,'ready','desktop-full: R536 cinematic journey not ready after handoff');
    assert.equal(final.cinemaContract,'all-content-actions-preserved-one-native-mag','desktop-full: R536 content/action contract drift');
    assert.equal(final.cinemaMotion,'scroll-interaction-driven-no-idle-raf','desktop-full: R536 motion contract drift');
    assert.equal(final.cinemaPointerEvents,'none','desktop-full: cinematic visual layer intercepts input');

    await page.goto(url({cinema:1,r548:'session-reload'}),{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(900);
    const reload=await snapshot(page);
    assert.notEqual(reload.birthOwner,'active','session-reload: R533 replayed despite session ownership');
    assert.equal(reload.overlayCount,0,'session-reload: birth overlay replayed in same session');
    assert.equal(reload.legacyPreloaderCount,0,'session-reload: legacy preloader returned');
    await page.waitForFunction(()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready',{timeout:20000});
    const reloadReady=await snapshot(page);
    assertStable(reloadReady,'session-reload');
    assert.equal(errors.length,0,`desktop-full: browser errors: ${errors.join(' | ')}`);
    return{phases:[...phases],coreReadyPhase:timeline.coreReadyPhase,coreSamples:timeline.coreSamples.length,final,reload:reloadReady};
  }finally{await context.close();}
}

async function verifySkip(browser){
  const context=await browser.newContext({
    viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,
    colorScheme:'dark',reducedMotion:'no-preference',locale:'hu-HU'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|WebGL|WebGPU|GPU/i.test(m.text()))errors.push(m.text());});
  try{
    await page.goto(url({intro:1,cinema:1,r548:'mobile-skip'}),{waitUntil:'commit',timeout:30000});
    const skip=page.locator(OVERLAY+' .fxb-skip');
    await skip.waitFor({state:'visible',timeout:10000});
    await installTimelineProbe(page);
    const box=await skip.boundingBox();
    assert.ok(box&&box.width>=44&&box.height>=44,`mobile-skip: skip hit target invalid ${JSON.stringify(box)}`);
    const aria=await skip.getAttribute('aria-label');
    assert.ok(aria&&aria.trim().length>0,'mobile-skip: skip has no accessible name');
    await page.waitForFunction(({CANVAS,STAGE})=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'&&document.querySelectorAll(CANVAS).length===1&&document.querySelectorAll(STAGE).length===1,{CANVAS,STAGE},{timeout:10000});
    await page.evaluate(({CANVAS,STAGE})=>{document.querySelector(STAGE).dataset.fxR548Identity='native-stage-r548';document.querySelector(CANVAS).dataset.fxR548Identity='native-canvas-r548';},{CANVAS,STAGE});
    await skip.focus();
    assert.equal(await skip.evaluate(el=>document.activeElement===el),true,'mobile-skip: skip cannot receive keyboard focus');
    await page.keyboard.press('Enter');
    await page.waitForFunction(sel=>!document.querySelector(sel),OVERLAY,{timeout:3000});
    const final=await snapshot(page);
    assertStable(final,'mobile-skip');
    assert.equal(final.stageIdentity,'native-stage-r548','mobile-skip: native stage swapped');
    assert.equal(final.canvasIdentity,'native-canvas-r548','mobile-skip: native canvas swapped');
    assert.equal(final.scrollLock,'','mobile-skip: scroll lock remained after skip');
    assert.equal(final.cinemaReady,'ready','mobile-skip: R536 not ready after skip handoff');
    assert.equal(final.cinemaPointerEvents,'none','mobile-skip: cinematic visual layer intercepts input');
    assert.equal(errors.length,0,`mobile-skip: browser errors: ${errors.join(' | ')}`);
    return{skipBox:box,skipAria:aria,final};
  }finally{await context.close();}
}

(async()=>{
  const browser=await chromium.launch({
    executablePath:process.env.CHROME_BIN||undefined,
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']
  });
  try{
    const desktop=await verifyFullBirth(browser);
    const mobile=await verifySkip(browser);
    const report={base:BASE,contract:'r552-r533-native-birth-to-r536-cinematic-handoff',desktop,mobile};
    writeJson('report.json',report);
    console.log('PASS: R533 full birth + skip + once-per-session hand off to the same single native R326 MAG and R536 journey without stuck scroll lock or duplicate preloader.');
  }finally{await browser.close();}
})().catch(error=>{
  writeJson('failure.json',{base:BASE,error:String(error?.stack||error)});
  console.error(error?.stack||error);
  process.exit(1);
});
