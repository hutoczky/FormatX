'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_STATIC_MAG_EVIDENCE_DIR||'artifacts/mag-static-fallback';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 const reports=[];
 try{
  for(const [name,width,height,mobile] of [['desktop',1440,900,false],['mobile',390,844,true]]){
   for(const failure of ['context-unavailable','script-unavailable']){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
    // Network and capability faults exercise the real product recovery path.
    // This does not inject a renderer, readiness event or readiness attribute.
    await context.route('**/formatx-crystal-worker-r564.js*',route=>route.abort());
    if(failure==='script-unavailable')await context.route('**/formatx-crystal-bounded-fallback-r727.js*',route=>route.abort());
    await context.addInitScript(({failure})=>{
     const original=HTMLCanvasElement.prototype.getContext;
     HTMLCanvasElement.prototype.getContext=function(type,...args){return failure==='context-unavailable'&&['webgl','webgl2','experimental-webgl'].includes(type)?null:original.call(this,type,...args);};
     window.__semanticReady=[];
     addEventListener('formatx:real3dready',()=>window.__semanticReady.push({stage:window.FormatXLivingCore?.stage?.isConnected,api:window.FormatXLivingCore?.revision,svg:Boolean(window.FormatXLivingCore?.stage?.querySelector('svg'))}));
    },{failure});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(URL,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.FormatXLivingCore?.revision==='r866-static-semantic-fallback'&&document.documentElement.dataset.fxCoreLifeR455==='ready',null,{timeout:15000});
    const before=await page.evaluate(()=>({revision:window.FormatXLivingCore.revision,stage:window.FormatXLivingCore.stage.isConnected,ready:document.documentElement.dataset.fxCrystalOrganismR326,dimension:document.documentElement.dataset.fxCoreDimension,stages:document.querySelectorAll('#hero .fx-core-mobile-v55-stage').length,canvases:document.querySelectorAll('#hero canvas').length,events:window.__semanticReady}));
    assert.equal(before.stage,true);assert.equal(before.ready,'ready');assert.equal(before.stages,1);assert.equal(before.canvases,0);assert.equal(before.dimension,'semantic-static-representation');
    assert.ok(before.events.length>=1&&before.events.every(e=>e.stage&&e.svg&&e.api==='r866-static-semantic-fallback'),'readiness must follow a connected representation and real API');
    const transitions=await page.evaluate(()=>{
     const api=window.FormatXLivingCore;
     const read=()=>({shape:api.shape,crystal:getComputedStyle(api.stage.querySelector('[data-static-crystal]')).display,sphere:getComputedStyle(api.stage.querySelector('[data-static-sphere]')).display,accent:api.stage.querySelector('[data-static-accent]').getAttribute('stop-color'),attention:api.stage.querySelector('[data-static-energy]').getAttribute('opacity')});
     const initial=read();api.setShape('sphere','fallback-verification');api.setScene(3);api.setAttention(1);const changed=read();
     let mutations=0;const observer=new MutationObserver(records=>mutations+=records.length);observer.observe(api.stage,{subtree:true,attributes:true});
     api.setShape('sphere','fallback-verification');api.setScene(3);api.setAttention(1);
     mutations+=observer.takeRecords().length;observer.disconnect();
     const same=window.FormatXMagStaticFallback('repeat-verification')===api;
     api.setShape('crystal','fallback-verification');api.setScene(0);api.setAttention(0);const restored=read();
     return{initial,changed,restored,mutations,same,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth};
    });
    assert.equal(transitions.changed.shape,'sphere');assert.equal(transitions.changed.crystal,'none');assert.notEqual(transitions.changed.sphere,'none');
    assert.notEqual(transitions.initial.accent,transitions.changed.accent);assert.notEqual(transitions.initial.attention,transitions.changed.attention);
    assert.deepEqual(transitions.restored,transitions.initial);assert.equal(transitions.mutations,0);assert.equal(transitions.same,true);assert.ok(transitions.overflow<=2);assert.deepEqual(errors,[]);
    await page.screenshot({path:path.join(OUT,name+'-'+failure+'.png')});
    reports.push({name,failure,before,transitions,errors});await context.close();
   }
  }
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({auditedSha:process.env.AUDITED_SHA||'',origin:URL,reports},null,2));
  console.log('MAG_STATIC_FALLBACK_PASS',reports.map(r=>r.name+'-'+r.failure).join(', '));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
