'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=path.resolve('.archive-artifacts/native-shader-payload-r2133.json');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const report={sha:process.env.AUDITED_SHA||'',cases:[]};
const write=()=>{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
// These are the actual R2132 WebGL2 program sources, captured on both native
// viewport paths. The payload correction must not replace the live material.
const fragment='f03ea76b4136220f6628ddff8f8b2f613733b7bcb695f86740aa82ee90b83739';
const vertices={desktop:'1ab17f04f8a3c0373e771369886f9b54ca61574fc9a899842b89313e9159c786',mobile:'535bc610349321b2c6e2bb56485f32f4f588620cf7586bc9ecf7817bc278bbc0'};
function observe(){
 const data=window.__nativePayload={shaders:[],contexts:0,draws:0,birth:[],contextLosses:0,csp:[]};
 document.addEventListener('securitypolicyviolation',event=>data.csp.push({directive:event.violatedDirective,blocked:event.blockedURI}));
 const contexts=new WeakSet(),native=canvas=>canvas?.classList?.contains('fx-crystal-organism-r326-canvas');
 const get=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(...args){const result=Reflect.apply(get,this,args);if(result&&native(this)&&/webgl/.test(args[0])&&!contexts.has(result)){contexts.add(result);data.contexts++;this.addEventListener('webglcontextlost',()=>data.contextLosses++);}return result;};
 for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(Type){
  const source=Type.prototype.shaderSource,draw=Type.prototype.drawArrays;
  Type.prototype.shaderSource=function(shader,text){if(native(this.canvas))data.shaders.push(text);return Reflect.apply(source,this,arguments);};
  Type.prototype.drawArrays=function(){const result=Reflect.apply(draw,this,arguments);if(native(this.canvas))data.draws++;return result;};
 }
 document.addEventListener('formatx:magbirthcomplete',event=>data.birth.push({at:performance.now(),source:event.detail?.source}));
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});report.browser=browser.version();
 try{for(const mobile of [false,true]){
  const profile=mobile?'mobile':'desktop',item={profile,errors:[]};report.cases.push(item);
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,locale:'hu-HU',reducedMotion:'no-preference'});
  await context.addInitScript(observe);const page=await context.newPage();let rendererResponse;
  page.on('pageerror',error=>item.errors.push(String(error)));
  page.on('response',response=>{if(new URL(response.url()).pathname.endsWith('/formatx-crystal-organism-r326.js'))rendererResponse=response;});
  try{
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>__nativePayload.birth.length===1&&__nativePayload.draws>0&&document.documentElement.dataset.fxCoreFirstFrameR1913==='painted',null,{timeout:18000,polling:100});
   item.actual=await page.evaluate(()=>{const api=window.FormatXLivingCore,gl=api?.canvas?.getContext('webgl2');return{...__nativePayload,canvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,apiOwnsCanvas:api?.canvas===document.querySelector('.fx-crystal-organism-r326-canvas'),vertexCount:api?.vertexCount,glError:gl?.getError(),overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};});
   item.shaderHashes=item.actual.shaders.map(hash);delete item.actual.shaders;
   assert.deepEqual(item.shaderHashes.slice(0,2),[vertices[profile],fragment],'The live native WebGL2 program changed');
   assert.equal(item.actual.contexts,1);assert.equal(item.actual.canvases,1);assert.equal(item.actual.apiOwnsCanvas,true);
   assert.ok(item.actual.vertexCount>0&&item.actual.draws>0);assert.equal(item.actual.birth.length,1);
   assert.equal(item.actual.glError,0);assert.equal(item.actual.contextLosses,0);assert.equal(item.actual.overflow,0);assert.deepEqual(item.actual.csp,[]);assert.deepEqual(item.errors,[]);
   assert.ok(rendererResponse,'The actual renderer response was not observed');
   const body=await rendererResponse.body();item.payloadBytes=body.length;item.payloadSha256=hash(body);item.rendererUrl=rendererResponse.url();
   assert.ok(item.payloadBytes<176548,'The retired shader payload still reaches the native visitor');
   assert.ok(!body.includes(Buffer.from('const fullFragmentSource ='))&&!body.includes(Buffer.from('const softwareFragmentSource =')),'Unused alternate materials remain in the delivered native runtime');
   item.pass=true;
  }catch(error){item.failure=String(error);}
  finally{write();await context.close();}
 }}finally{await browser.close();write();}
 assert.equal(report.cases.filter(item=>item.pass).length,2,'The actual desktop/mobile native payload contract failed');
 const rev='20261020-r2133-active-shader-only';
 for(const file of ['docs/scifi-ui/index.html','docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js','docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js','docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js','docs/scifi-ui/scripts/formatx-core-mobile-v55.js','docs/scifi-ui/scripts/formatx-core-real3d-v20.js','billing-worker/src/production-content-entry.js'])assert.ok(fs.readFileSync(file,'utf8').includes(rev),'The current native cache chain is stale: '+file);
 console.log('NATIVE_SHADER_PAYLOAD_R2133_PASS',JSON.stringify(report));
})().catch(error=>{write();console.error(error);process.exitCode=1;});
