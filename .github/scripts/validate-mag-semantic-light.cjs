'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const OUT=process.env.FORMATX_SEMANTIC_LIGHT_EVIDENCE_DIR||'artifacts/mag-semantic-light';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 const reports=[];
 try{
  for(const [name,width,height,mobile] of [['desktop',1440,900,false],['mobile',390,844,true]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.documentElement.dataset.fxMagSemanticLightR866==='listening'&&typeof window.FormatXLivingCore?.setScene==='function',null,{timeout:15000});
   await page.waitForFunction(()=>document.documentElement.classList.contains('fx-intro-complete'),null,{timeout:5000});
   const ask=page.locator('.fx-reference-ask');await ask.waitFor({state:'visible'});
   // Real focus/keyboard activation must provide the same optical attention as
   // pointer interaction; no renderer API or readiness state is injected here.
   await ask.press('Tab');await page.keyboard.press('Shift+Tab');
   await page.waitForFunction(()=>window.FormatXLivingCore.attention===1,null,{timeout:5000});
   const heart=page.locator('.fx-mag-heart-hit-r252');
   const box=await heart.boundingBox();assert.ok(box&&box.width>=80&&box.height>=80,'the living core must have a usable physical target');
   if(mobile)await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);else await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
   await page.waitForFunction(()=>document.documentElement.dataset.fxOrganismInterface==='ready',null,{timeout:10000});
   await page.waitForFunction(()=>document.documentElement.dataset.fxOrganismMenu==='ready',null,{timeout:10000});
   // The existing menu controls publish durable chapter state. The MAG must
   // follow the actual pricing/heart chapter and then return to the core.
   console.log('MAG_SEMANTIC_LIGHT_MENU',name,await page.evaluate(()=>{const menu=document.getElementById('menu-toggle'),rect=menu?.getBoundingClientRect();return{scene:document.documentElement.dataset.fxScene,consoleHidden:document.getElementById('fx-organism-console')?.hidden,active:document.activeElement?.outerHTML?.slice(0,300),scrollY,rect:rect?.toJSON()};}));
   await page.screenshot({path:path.join(OUT,name+'-before-menu.png')});
   await page.locator('#menu-toggle').click();
   const pricing=page.locator('#main-nav a[href$="#pricing"]');
   await pricing.click();
   await page.waitForFunction(()=>document.documentElement.dataset.fxScene==='3'&&window.FormatXLivingCore.scene===3,null,{timeout:5000});
   const scene=await page.evaluate(()=>({root:document.documentElement.dataset.fxScene,renderer:window.FormatXLivingCore.scene}));
   await page.locator('.fx-organism-console-close').click();
   await page.waitForFunction(()=>document.documentElement.dataset.fxScene==='0'&&window.FormatXLivingCore.scene===0,null,{timeout:5000});
   assert.deepEqual(errors,[]);
   const state=await page.evaluate(()=>({revision:window.FormatXLivingCore.revision,scene:window.FormatXLivingCore.scene,attention:window.FormatXLivingCore.attention,stages:document.querySelectorAll('#hero .fx-core-mobile-v55-stage').length,canvases:document.querySelectorAll('#hero canvas').length,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth}));
   assert.equal(state.stages,1);assert.ok(state.canvases<=1);assert.ok(state.overflow<=2);
   await page.screenshot({path:path.join(OUT,name+'.png')});reports.push({name,scene,state,errors});await context.close();
  }
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({auditedSha:process.env.AUDITED_SHA||'',reports},null,2));
  console.log('MAG_SEMANTIC_LIGHT_PASS',JSON.stringify(reports));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
