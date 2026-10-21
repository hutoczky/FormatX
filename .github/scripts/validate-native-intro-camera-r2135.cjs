'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output='.archive-artifacts/native-intro-camera-r2135.json';
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const write=()=>{fs.mkdirSync('.archive-artifacts',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
function observe(){
 const state=window.__introCamera={poses:[],starts:[],ends:[],flags:[],contexts:0,shaders:[],csp:[],lost:0,paints:[],lcp:[]};
 new PerformanceObserver(l=>state.paints.push(...l.getEntries().map(e=>({name:e.name,startTime:e.startTime})))).observe({type:'paint',buffered:true});
 new PerformanceObserver(l=>state.lcp.push(...l.getEntries().map(e=>({at:e.startTime,id:e.element?.id,tag:e.element?.tagName})))).observe({type:'largest-contentful-paint',buffered:true});
 const locations=new WeakMap(),seen=new WeakSet(),uniforms={};
 const native=c=>c?.classList?.contains('fx-crystal-organism-r326-canvas');
 const get=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(){const r=Reflect.apply(get,this,arguments);if(r&&/webgl/.test(arguments[0])&&!seen.has(r)){seen.add(r);state.contexts++;}return r;};
 for(const T of [WebGLRenderingContext,WebGL2RenderingContext]){
  const p=T.prototype,l=p.getUniformLocation,s=p.shaderSource,d=p.drawArrays;
  p.getUniformLocation=function(){const r=Reflect.apply(l,this,arguments);if(r&&native(this.canvas))locations.set(r,arguments[1]);return r;};
  p.shaderSource=function(){if(native(this.canvas))state.shaders.push(arguments[1]);return Reflect.apply(s,this,arguments);};
  for(const method of ['uniform1f','uniform2f','uniform3f']){const f=p[method];p[method]=function(){const r=Reflect.apply(f,this,arguments),n=locations.get(arguments[0]);if(n&&native(this.canvas))uniforms[n]=Array.from(arguments).slice(1);return r;};}
  p.drawArrays=function(){
   const r=Reflect.apply(d,this,arguments);
   if(native(this.canvas)&&arguments[2]===6624&&state.poses.length<500){
    const g=uniforms.uGenesis?.[0];
    state.poses.push({at:performance.now(),genesis:g,rotation:uniforms.uRotation?.slice(),time:uniforms.uTime?.[0],width:this.drawingBufferWidth,height:this.drawingBufferHeight,paused:document.documentElement.dataset.fxReferenceMotionPaused,phase:document.documentElement.dataset.fxNativeGenesisR2064});

   }
   return r;
  };
 }
 document.addEventListener('formatx:magbirthstart',()=>state.starts.push(performance.now()));
 document.addEventListener('formatx:magbirthcomplete',e=>state.ends.push({at:performance.now(),source:e.detail?.source}));
 document.addEventListener('securitypolicyviolation',e=>state.csp.push(e.violatedDirective));
 document.addEventListener('webglcontextlost',()=>state.lost++,true);
 const root=()=>document.documentElement;
 const mo=new MutationObserver(records=>{for(const r of records)if(state.flags.length<200)state.flags.push({at:performance.now(),attribute:r.attributeName,paused:root().dataset.fxReferenceMotionPaused,source:root().dataset.fxMobileRenderPauseSourceR465,phase:root().dataset.fxNativeGenesisR2064,governor:root().dataset.fxMobileRenderGovernorR426});});
 if(root())mo.observe(root(),{attributes:true,attributeFilter:['data-fx-reference-motion-paused','data-fx-native-genesis-r2064','data-fx-mobile-render-governor-r426']});
 else{const wait=new MutationObserver(()=>{if(root()){wait.disconnect();mo.observe(root(),{attributes:true,attributeFilter:['data-fx-reference-motion-paused','data-fx-native-genesis-r2064','data-fx-mobile-render-governor-r426']});}});wait.observe(document,{childList:true});}
}

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 report.browser=browser.version();
 try{
  for(const mobile of [false,true])for(const reduced of [false,true]){
   const profile=(mobile?'mobile':'desktop')+(reduced?'-reduced':'-normal');
   const item={profile,errors:[]};report.cases.push(item);
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference',locale:'hu-HU'});
   await context.addInitScript(observe);const page=await context.newPage();page.on('pageerror',e=>item.errors.push(String(e)));
   try{
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>__introCamera.ends.length===1&&document.documentElement.dataset.fxCrystalOrganismR326==='ready'&&!document.querySelector('.fx-mag-birth-r533'),null,{timeout:20000});
    item.actual=await page.evaluate(()=>{
     const core=window.FormatXLivingCore,gl=core.canvas.getContext('webgl2')||core.canvas.getContext('webgl');
     return{...__introCamera,vertexCount:core.vertexCount,canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,gl:gl.getError(),overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),lost:Boolean(gl.isContextLost()||__introCamera.lost),phase:document.documentElement.dataset.fxNativeGenesisR2064||''};
    });
    item.shaderHashes=item.actual.shaders.map(hash);delete item.actual.shaders;
    item.early=item.actual.poses.filter(p=>p.genesis>=0&&p.genesis<.69);
    item.distinct=[...new Set(item.early.map(p=>p.genesis.toFixed(3)))];
    item.span=item.early.length?Math.max(...item.early.map(p=>p.genesis))-Math.min(...item.early.map(p=>p.genesis)):0;
    // Functional motion oracle; the original independent intro-duration gate
    // still owns unchanged wall-time bounds. Draw samples are not FPS proof.
    if(!reduced){
     assert(item.distinct.length>=(mobile?8:3),profile+': actual native camera must advance through the early film instead of freezing or using the legacy mobile 200ms sampler');
     assert(item.span>=.3,profile+': actual native genesis must cover a meaningful early camera trajectory');
    }else{
     assert.equal(item.early.length,0,profile+': reduced motion must retain the original direct final-camera shortcut');
    }
    assert.equal(item.actual.contexts,1);assert.equal(item.actual.canvasCount,1);assert.equal(item.actual.vertexCount,6624);
    assert.equal(item.actual.gl,0);assert.equal(item.actual.lost,false);assert.equal(item.actual.overflow,0);
    assert.equal(item.actual.starts.length,1);assert.equal(item.actual.ends.length,1);assert.equal(item.actual.phase,'');
    assert.deepEqual(item.actual.csp,[]);assert.deepEqual(item.errors,[]);
    item.elapsed=item.actual.ends[0].at-item.actual.starts[0];
    item.pass=true;console.log('NATIVE_INTRO_CAMERA_R2135_CASE_PASS '+JSON.stringify({profile,distinct:item.distinct.length,span:item.span,elapsed:item.elapsed}));
   }catch(e){item.pass=false;item.failure=String(e.stack||e);console.error('NATIVE_INTRO_CAMERA_R2135_CASE_FAIL '+JSON.stringify({profile,failure:item.failure}));}
   finally{write();await context.close();}
  }
 }finally{await browser.close();}
 assert(report.cases.every(c=>c.pass),'Native intro must retain actual camera motion and the original reduced shortcut on desktop and mobile');
})().catch(e=>{write();console.error(e);process.exitCode=1;});
