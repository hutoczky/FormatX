'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const output='.archive-artifacts/native-intro-state-r2129.json';
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const write=()=>{fs.mkdirSync('.archive-artifacts',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const revision='20261018-r2129-genuine-intro-state';
const assets=['formatx-menu-owner-r1956.js','formatx-menu-owner-r1956.css','formatx-control-owner-r268.js','formatx-ai-core-ident-r1951.css','formatx-cinematic-archive-r1987.js'];
for(const asset of assets)assert(html.includes(`${asset}?v=${revision}`),'HTML must request the tested state/identity asset: '+asset);
const rewriteBody=worker.match(/function cacheBustR502Runtime\(html\) \{([\s\S]*?)\n\}/)?.[1];
assert(rewriteBody,'Existing production cache rewriter must remain present');
const rewrite=new Function('html',rewriteBody);
const oldFixture=assets.map(asset=>`<link href="/scifi-ui/${asset}?v=old-cache">`).join('\n');
const updatedFixture=rewrite(oldFixture);
for(const asset of assets)assert(updatedFixture.includes(`${asset}?v=${revision}`),'Production HTML must adopt the same tested asset: '+asset);
assert.equal(rewrite(updatedFixture),updatedFixture,'Production cache adoption remains idempotent');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 try{
  for(const profile of [{name:'desktop',width:1440,height:900,mobile:false},{name:'mobile-320',width:320,height:568,mobile:true},{name:'mobile-390',width:390,height:844,mobile:true}])for(const reduced of [false,true]){
   const {mobile}=profile;
   const item={profile:profile.name,motion:reduced?'reduced':'normal',errors:[]};report.cases.push(item);
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:reduced?'reduce':'no-preference',locale:'hu-HU',colorScheme:'dark'});
   await context.addInitScript(()=>{
    const e=window.__introStateR2129={menu:[],physiology:[],sweeps:[],complete:[],firstIdentity:null,firstExit:null,layout:{visibleSamples:0,overlaps:[]}};
    setInterval(()=>{
     const badge=document.querySelector('.fx-ai-core-ident-r1951');
     if(!badge||Number(getComputedStyle(badge).opacity)<=.05)return;
     const b=badge.getBoundingClientRect();e.layout.visibleSamples++;
     for(const selector of ['#hero .fx-three-sound','#hero .fx-reference-ask','#hero .fx-reference-ask span']){
      const control=document.querySelector(selector);if(!control)continue;
      const style=getComputedStyle(control),r=control.getBoundingClientRect();
      if(style.visibility==='hidden'||style.display==='none'||Number(style.opacity)<=.05||!r.width||!r.height)continue;
      const width=Math.max(0,Math.min(b.right,r.right)-Math.max(b.left,r.left)),height=Math.max(0,Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top));
      if(width>.5&&height>.5&&e.layout.overlaps.length<40)e.layout.overlaps.push({at:performance.now(),selector,width,height,badge:b.toJSON(),control:r.toJSON()});
     }
    },50);
    addEventListener('formatx:menustatechange',event=>e.menu.push({at:performance.now(),...event.detail}));
    addEventListener('formatx:organismphysiology',event=>e.physiology.push({at:performance.now(),...event.detail}));
    addEventListener('formatx:coresurfacesweep',event=>e.sweeps.push({at:performance.now(),...event.detail}));
    addEventListener('formatx:real3dready',()=>{
     window.__originalMagR2129=window.FormatXLivingCore?.canvas;
     window.__originalContextR2129=__originalMagR2129?.getContext('webgl2');
    });
    document.addEventListener('formatx:magbirthcomplete',()=>e.complete.push(performance.now()));
    new MutationObserver(()=>{
     const exiting=document.querySelector('.fx-ai-core-ident-r1951.is-exiting');
     if(exiting&&!e.firstExit){const style=getComputedStyle(exiting);e.firstExit={at:performance.now(),filter:style.filter,transition:style.transitionProperty};}
     const badge=document.querySelector('.fx-ai-core-ident-r1951.is-visible');
     if(!badge||e.firstIdentity)return;
     const style=getComputedStyle(badge),api=window.FormatXLivingCore;
     e.firstIdentity={at:performance.now(),filter:style.filter,transition:style.transitionProperty,text:badge.textContent,
      originalStage:badge.parentElement===api?.stage,sameCanvas:api?.canvas===window.__originalMagR2129,
      nativeReady:document.documentElement.dataset.fxCrystalOrganismR326==='ready',menuAtEntry:e.menu.slice(),physiologyAtEntry:e.physiology.slice(),sweepsAtEntry:e.sweeps.slice()};
    }).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});
   });
   const page=await context.newPage();page.on('pageerror',error=>item.errors.push(String(error)));
   try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>Boolean(window.__introStateR2129?.firstIdentity),null,{timeout:18000,polling:100});
    item.initial=await page.evaluate(()=>window.__introStateR2129.firstIdentity);
    assert.equal(item.initial.menuAtEntry.length,0,'Initial closed-menu reconciliation must not publish a transition');
    assert(!item.initial.physiologyAtEntry.some(e=>e.source==='menu-close'),'Native genesis must not receive an invented menu-close stimulus');
    assert(!item.initial.sweepsAtEntry.some(e=>e.source==='menu-close-physiology'),'No false menu-close sweep during genuine automatic genesis');
    assert.equal(item.initial.filter,'none','Native identity must be optically sharp from its first visible state');
    assert(!item.initial.transition.split(',').map(s=>s.trim()).includes('filter'),'Identity must not animate a blur/filter pass');
    assert(item.initial.originalStage&&item.initial.sameCanvas&&item.initial.nativeReady,'Identity belongs to the same genuinely ready native stage');
    assert.equal(item.initial.text,'MAG // AI COREONLINE · LOCAL INTELLIGENCE');
    await page.waitForTimeout(500);
    if(process.env.FORMATX_CAPTURE_IDENTITY==='1')await page.screenshot({path:`.archive-artifacts/identity-${item.profile}-${item.motion}-r2129.png`,timeout:30000});
    await page.locator('#menu-toggle').click();
    await page.waitForFunction(()=>document.getElementById('main-nav')?.classList.contains('open'));
    await page.locator('#menu-toggle').click();
    await page.waitForFunction(()=>!document.getElementById('main-nav')?.classList.contains('open'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>Boolean(window.__introStateR2129?.firstExit),null,{timeout:18000,polling:100});
    item.interaction=await page.evaluate(()=>{
     const api=window.FormatXLivingCore,canvas=api?.canvas,gl=canvas?.getContext('webgl2');
     const e=window.__introStateR2129;
     return {menu:e.menu,physiology:e.physiology.filter(e=>e.source==='menu-open'||e.source==='menu-close'),identityExit:e.firstExit,layout:e.layout,
      canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,sameCanvas:canvas===window.__originalMagR2129,
      sameContext:gl===window.__originalContextR2129,lost:gl?.isContextLost(),error:gl?.getError(),
      menuClosed:!document.getElementById('main-nav').classList.contains('open')&&document.getElementById('menu-toggle').getAttribute('aria-expanded')==='false',
      completed:e.complete.length,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
    });
    assert.deepEqual(item.interaction.menu.map(e=>e.open),[true,false],'Real clicks publish one open and one close; Escape on an already-closed menu is not another transition');
    assert.deepEqual(item.interaction.physiology.map(e=>[e.source,e.kind]),[['menu-open','attention'],['menu-close','stability']],'The real native MAG still responds to genuine menu states');
    assert.equal(item.interaction.identityExit.filter,'none','Native identity also remains sharp during its genuine exit');
    assert(!item.interaction.identityExit.transition.split(',').map(s=>s.trim()).includes('filter'),'Identity exit must not animate a filter pass');
    assert(item.interaction.layout.visibleSamples>0,'The real visible caption must have measured layout samples');
    assert.deepEqual(item.interaction.layout.overlaps,[],'Actual MAG identity must not overlap the real SOUND/ASK controls or their label during presentation');
    assert(item.interaction.sameCanvas&&item.interaction.sameContext&&!item.interaction.lost&&item.interaction.menuClosed,'Genuine input retains native ownership and closes the menu');
    assert.equal(item.interaction.canvasCount,1);assert.equal(item.interaction.error,0);assert.equal(item.interaction.completed,1);assert.equal(item.interaction.overflow,0);
    assert.deepEqual(item.errors,[]);item.pass=true;
   }catch(error){item.failure=String(error.stack||error);item.observation=await page.evaluate(()=>window.__introStateR2129).catch(()=>null);throw error;}
   finally{write();await context.close();}
  }
 }finally{await browser.close();}
 console.log('NATIVE_INTRO_STATE_R2129_PASS '+JSON.stringify(report));
})().catch(error=>{write();console.error(error);process.exitCode=1;});
