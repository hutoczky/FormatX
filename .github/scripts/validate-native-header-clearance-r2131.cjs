'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output='.archive-artifacts/native-header-clearance-r2131.json';
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const write=()=>{fs.mkdirSync('.archive-artifacts',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
function snapshot(){
 const box=el=>{const s=getComputedStyle(el);return{...el.getBoundingClientRect().toJSON(),display:s.display,visibility:s.visibility,opacity:s.opacity,scale:s.scale,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth};};
 const brand=document.querySelector('.topbar > a.brand');
 const text=[...brand.querySelectorAll('strong,small')].map(el=>{const range=document.createRange();range.selectNodeContents(el);return{text:el.textContent,box:box(el),glyphs:range.getBoundingClientRect().toJSON()};});
 const core=window.FormatXLivingCore,canvas=core.canvas,gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
 return{brand:box(brand),logo:box(brand.querySelector('img')),text,
  controls:['.fx-reference-mag-button','.fx-language-toggle','#menu-toggle'].map(selector=>({selector,...box(document.querySelector(selector))})),
  language:document.documentElement.lang,fullReducedLoaded:!!document.querySelector('link[data-fx-critical-reduced-full-r299]')?.sheet,
  sameCanvas:canvas===window.__headerOriginalCanvas,sameContext:gl===window.__headerOriginalContext,contextCount:window.__headerEvents.contexts,
  canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,vertexCount:core.vertexCount,
  error:gl.getError(),lost:gl.isContextLost(),overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),events:window.__headerEvents};
}
function validate(s,label){
 assert(s.brand.width>=44&&s.brand.height>=44,label+': original brand touch target');
 assert(s.logo.width===44||label.startsWith('desktop'),label+': original mobile logo retained');
 for(const text of s.text){
  assert(text.text.trim(),label+': full brand text retained');
  assert(text.glyphs.left>=s.brand.left-.5&&text.glyphs.right<=s.brand.right+.5,label+': actual wordmark glyphs must fit their brand lane: '+JSON.stringify({brand:s.brand,text}));
 }
 const boxes=[s.brand,...s.controls];
 for(let i=0;i<boxes.length;i++){
  const a=boxes[i];assert(a.display!=='none'&&a.visibility!=='hidden'&&Number(a.opacity)>.02,label+': original control visible');
  assert(a.width>=44&&a.height>=44,label+': original control touch target');
  for(let j=i+1;j<boxes.length;j++){
   const b=boxes[j];assert(a.right+2<=b.left||b.right+2<=a.left||a.bottom+2<=b.top||b.bottom+2<=a.top,label+': original 2px header clearance including actual MAG scale: '+JSON.stringify({a,b}));
  }
 }
 assert(s.sameCanvas&&s.sameContext&&!s.lost,label+': same native canvas/context');
 assert.equal(s.contextCount,1);assert.equal(s.canvasCount,1);assert.equal(s.error,0);assert.equal(s.overflow,0);assert.equal(s.events.complete.length,1);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});report.browser=browser.version();
 try{
  for(const profile of [{name:'mobile-320',width:320,height:700,mobile:true},{name:'mobile-390',width:390,height:844,mobile:true},{name:'desktop-1440',width:1440,height:900,mobile:false}])for(const reduced of [false,true]){
   const row={profile:profile.name,reduced,errors:[]};report.cases.push(row);
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:profile.mobile,hasTouch:profile.mobile,deviceScaleFactor:profile.mobile?2:1,reducedMotion:reduced?'reduce':'no-preference',locale:'hu-HU',colorScheme:'dark'});
   await context.addInitScript(()=>{
    const events=window.__headerEvents={contexts:0,complete:[],physiology:[],menu:[],clicks:[]},seen=new WeakSet(),original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){const gl=original.call(this,type,...args);if(gl&&/webgl/.test(type)&&!seen.has(gl)){seen.add(gl);events.contexts++;}return gl;};
    addEventListener('formatx:real3dready',()=>{window.__headerOriginalCanvas=window.FormatXLivingCore?.canvas;window.__headerOriginalContext=__headerOriginalCanvas?.getContext('webgl2')||__headerOriginalCanvas?.getContext('webgl');});
    document.addEventListener('formatx:magbirthcomplete',()=>events.complete.push(performance.now()));
    addEventListener('formatx:organismphysiology',event=>events.physiology.push({...event.detail}));
    addEventListener('formatx:menustatechange',event=>events.menu.push({...event.detail}));
    document.addEventListener('click',event=>{if(event.target.closest('.topbar'))events.clicks.push({trusted:event.isTrusted});},true);
   });
   const page=await context.newPage();page.on('pageerror',e=>row.errors.push(String(e)));
   try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready'&&window.__headerEvents.complete.length===1,null,{timeout:20000});
    await page.waitForLoadState('load');await page.waitForTimeout(300);
    row.before=await page.evaluate(snapshot);validate(row.before,row.profile+' initial');
    await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
    if(reduced)await page.waitForFunction(()=>document.documentElement.dataset.fxReducedStyleR233==='activated-on-user-intent-r299',null,{timeout:8000});
    await page.waitForTimeout(400);
    row.afterIntent=await page.evaluate(snapshot);validate(row.afterIntent,row.profile+' actual reduced payload');
    assert.equal(row.afterIntent.fullReducedLoaded,reduced,'Only the genuine reduced path loads the full payload');
    await page.locator('.topbar .fx-reference-mag-button').click();
    await page.waitForFunction(()=>window.__headerEvents.physiology.some(e=>e.kind==='response'&&String(e.source).includes('mag-button')),null,{timeout:8000});
    await page.waitForTimeout(220);
    row.afterMag=await page.evaluate(snapshot);validate(row.afterMag,row.profile+' genuine MAG response');
    await page.locator('#menu-toggle').click();await page.waitForFunction(()=>document.getElementById('main-nav').classList.contains('open'));
    await page.locator('#menu-toggle').click();await page.waitForFunction(()=>!document.getElementById('main-nav').classList.contains('open'));
    await page.locator('.topbar .fx-language-toggle').click();await page.waitForFunction(()=>document.documentElement.lang==='en');
    row.english=await page.evaluate(snapshot);validate(row.english,row.profile+' English');
    assert.deepEqual(row.english.events.menu.map(e=>e.open),[true,false]);
    assert(row.english.events.clicks.length>=4&&row.english.events.clicks.every(e=>e.trusted),'Real unforced header controls must remain reachable');
    assert.equal(row.english.vertexCount,row.before.vertexCount);assert.deepEqual(row.errors,[]);row.pass=true;
    console.log('NATIVE_HEADER_CLEARANCE_R2131_CASE_PASS '+JSON.stringify({profile:row.profile,reduced,brand:row.afterMag.brand,mag:row.afterMag.controls[0],gap:row.afterMag.controls[0].left-row.afterMag.brand.right}));
   }catch(e){row.failure=String(e.stack||e);row.failureState=await page.evaluate(snapshot).catch(()=>null);throw e;}
   finally{write();await context.close();}
  }
 }finally{await browser.close();}
 const revision='20261020-r2131-header-wordmark-clearance',html=fs.readFileSync('docs/scifi-ui/index.html','utf8'),worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
 assert.equal((html.match(new RegExp('formatx-mobile-first-paint-r358\\.css\\?v='+revision,'g'))||[]).length,2,'Preload and applied source style must use the same exact corrected URL');
 assert(worker.includes('formatx-mobile-first-paint-r358.css?v='+revision),'Production insertion must adopt the same corrected style');
 const rewriteBody=worker.match(/function cacheBustR502Runtime\(html\) \{([\s\S]*?)\n\}/)?.[1];assert(rewriteBody);
 const rewrite=new Function('html',rewriteBody),fixture='<link rel="preload" as="style" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=old"><link rel="stylesheet" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=old">',updated=rewrite(fixture);
 assert.equal((updated.match(new RegExp('formatx-mobile-first-paint-r358\\.css\\?v='+revision,'g'))||[]).length,2,'Production must update both the old preload and the applied style');
 assert.equal(rewrite(updated),updated,'Corrected production cache adoption must remain idempotent');
 console.log('NATIVE_HEADER_CLEARANCE_R2131_PASS '+JSON.stringify({sha:report.sha,browser:report.browser,cases:report.cases.map(c=>({profile:c.profile,reduced:c.reduced,pass:c.pass}))}));
})().catch(e=>{write();console.error(e);process.exitCode=1;});
