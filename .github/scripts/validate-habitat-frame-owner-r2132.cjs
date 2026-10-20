'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const out=path.resolve('.archive-artifacts/habitat-frame-owner-r2132.json');
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const write=()=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 report.browser=browser.version();
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,locale:'hu-HU',colorScheme:'dark'});
  const item={profile:mobile?'mobile':'desktop',errors:[]};report.cases.push(item);
  const page=await context.newPage();page.on('pageerror',e=>item.errors.push(String(e)));
  await page.addInitScript(()=>{
   const o=window.__habitatFrameOwner={contexts:0,requests:[],returns:[],cancels:[],draws:[],peakPending:0,birth:[],ready:[]},pending=new Set(),known=new WeakMap();
   document.addEventListener('formatx:magbirthcomplete',()=>o.birth.push(performance.now()));
   addEventListener('formatx:real3dready',()=>o.ready.push(performance.now()));
   let running=0;
   const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
   window.requestAnimationFrame=callback=>{
    let own=known.get(callback);if(own===undefined){own=callback.name==='draw'&&String(callback).includes('fxLivingHabitatFrameR1541');known.set(callback,own);}
    if(!own)return request(callback);
    const id=request(time=>{pending.delete(id);o.returns.push({id,at:performance.now(),frameTime:time});running++;try{return callback(time);}finally{running--;}});
    pending.add(id);o.peakPending=Math.max(o.peakPending,pending.size);o.requests.push({id,at:performance.now()});return id;
   };
   window.cancelAnimationFrame=id=>{if(pending.delete(id))o.cancels.push({id,at:performance.now()});return cancel(id);};
   const get=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(...args){if(this.classList.contains('fx-living-habitat-r1530'))o.contexts++;return Reflect.apply(get,this,args);};
   const clear=CanvasRenderingContext2D.prototype.clearRect;
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.classList.contains('fx-living-habitat-r1530'))o.draws.push({at:performance.now(),inOwnedFrame:running>0,pending:[...pending],width:this.canvas.width,height:this.canvas.height,viewport:{width:innerWidth,height:innerHeight}});return Reflect.apply(clear,this,args);};
  });
  await page.route('**/formatx-living-habitat-r1530.css?*',async route=>{
   const response=await route.fetch(),show=new URL(route.request().url()).searchParams.get('habitat-frame-fixture')==='visible';
   const selector='html'+':root'.repeat(24)+' body.living-architecture > canvas.fx-living-habitat-r1530';
   await route.fulfill({response,body:await response.text()+`\n${selector}{display:${show?'block':'none'}!important;visibility:visible!important;opacity:.78!important;}`});
  });
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>__habitatFrameOwner.birth.length===1&&document.documentElement.dataset.fxCoreFirstFrameR1913==='painted'&&!document.querySelector('.fx-mag-birth-r533')&&!document.getElementById('fx-mag-birth-prepaint-r1606'),null,{timeout:18000,polling:100});
   item.hidden=await page.evaluate(()=>({contexts:__habitatFrameOwner.contexts,draws:__habitatFrameOwner.draws.length,requests:__habitatFrameOwner.requests.length}));
   assert.deepEqual(item.hidden,{contexts:0,draws:0,requests:0},'CSS-hidden habitat must not allocate, paint or schedule a frame');
   await page.evaluate(()=>{
    window.__nativeFrameOwnerCanvas=FormatXLivingCore.canvas;
    const original=document.querySelector('link[data-fx-living-habitat-r1530]'),link=document.createElement('link');link.rel='stylesheet';link.dataset.fxLivingHabitatR1530='true';link.href=original.href+'&habitat-frame-fixture=visible';document.head.append(link);
   });
   await page.waitForFunction(()=>__habitatFrameOwner.draws.length>0,null,{timeout:6000,polling:100});
   await page.waitForTimeout(180);
   item.visible=await page.evaluate(()=>({proof:__habitatFrameOwner,sameNativeCanvas:FormatXLivingCore.canvas===__nativeFrameOwnerCanvas,nativeCanvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,nativeReady:document.documentElement.dataset.fxCoreFirstFrameR1913,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),glError:FormatXLivingCore.canvas.getContext('webgl2').getError()}));
   assert.equal(item.visible.proof.contexts,1);
   assert(item.visible.proof.draws.length>0);
   assert(item.visible.proof.draws.every(d=>d.inOwnedFrame),'Habitat painted outside its scheduled frame while losing the pending RAF owner');
   assert.equal(item.visible.proof.peakPending,1,'Only one native habitat frame may be queued at a time');
   assert.equal(item.visible.proof.birth.length,1,'One genuine native completion must be retained');
   assert(item.visible.proof.ready.length>0,'The original native MAG must really paint');
   assert(item.visible.sameNativeCanvas);assert.equal(item.visible.nativeCanvasCount,1);assert.equal(item.visible.nativeReady,'painted');assert.equal(item.visible.glError,0);assert.equal(item.visible.overflow,0);assert.deepEqual(item.errors,[]);
   item.pass=true;
  }catch(e){item.error=String(e);}
  finally{write();await context.close();}
 }}finally{await browser.close();}
 const failures=report.cases.filter(c=>!c.pass);console.log('HABITAT_FRAME_OWNER_R2132 '+JSON.stringify(report));assert.deepEqual(failures,[]);
 const revision='20261020-r2132-habitat-frame-owner',html=fs.readFileSync('docs/scifi-ui/index.html','utf8'),worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
 assert(html.includes('formatx-living-habitat-r1530.js?v='+revision));
 const body=worker.match(/function cacheBustR502Runtime\(html\) \{([\s\S]*?)\n\}/)?.[1];assert(body);
 const rewrite=new Function('html',body),old='<script src="/scifi-ui/scripts/formatx-living-habitat-r1530.js?v=20261018-r2126-presented-habitat"></script>',current=rewrite(old);
 assert.equal(current,'<script src="/scifi-ui/scripts/formatx-living-habitat-r1530.js?v='+revision+'"></script>');assert.equal(rewrite(current),current);
})().catch(e=>{write();console.error(e);process.exitCode=1;});
