'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const forceWebGL1=process.env.FORMATX_OPTICAL_WEBGL1==='1';
const output='.archive-artifacts/native-optical-parallax-r2134'+(forceWebGL1?'-webgl1':'')+'.json';
const report={sha:process.env.AUDITED_SHA||'',backend:forceWebGL1?'webgl1-fallback':'webgl2',cases:[]};
const write=()=>{fs.mkdirSync('.archive-artifacts',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function observe(forceWebGL1){
 const state=window.__opticalSpace={contexts:0,samples:[],keys:[],completions:[],want:null,uniforms:{},shaderSources:[],trustedClicks:0,csp:[],contextLosses:0};
 const native=c=>c?.classList?.contains('fx-crystal-organism-r326-canvas');
 const seen=new WeakSet(),locations=new WeakMap();
 const original=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(){if(forceWebGL1&&arguments[0]==='webgl2')return null;const r=Reflect.apply(original,this,arguments);if(r&&/webgl/.test(arguments[0])&&!seen.has(r)){seen.add(r);state.contexts++;}return r;};
 for(const Type of [WebGLRenderingContext,WebGL2RenderingContext]){
  const p=Type.prototype,location=p.getUniformLocation,shader=p.shaderSource,draw=p.drawArrays;
  p.getUniformLocation=function(){const r=Reflect.apply(location,this,arguments);if(r&&native(this.canvas))locations.set(r,arguments[1]);return r;};
  p.shaderSource=function(){if(native(this.canvas))state.shaderSources.push(arguments[1]);return Reflect.apply(shader,this,arguments);};
  for(const method of ['uniform1f','uniform2f','uniform3f']){
   const fn=p[method];p[method]=function(){const r=Reflect.apply(fn,this,arguments);const name=locations.get(arguments[0]);if(name&&native(this.canvas))state.uniforms[name]=Array.from(arguments).slice(1);return r;};
  }
  p.drawArrays=function(){
   const r=Reflect.apply(draw,this,arguments);
   if(state.want&&native(this.canvas)&&arguments[2]===window.FormatXLivingCore?.vertexCount){
    const label=state.want;state.want=null;const width=this.drawingBufferWidth,height=this.drawingBufferHeight;
    const pixels=new Uint8Array(width*height*4);this.readPixels(0,0,width,height,this.RGBA,this.UNSIGNED_BYTE,pixels);
    let binary='';for(let i=0;i<pixels.length;i+=4096)binary+=String.fromCharCode(...pixels.subarray(i,i+4096));
    state.samples.push({label,at:performance.now(),width,height,pixelsBase64:btoa(binary),uniforms:JSON.parse(JSON.stringify(state.uniforms)),vertexCount:arguments[2]});
   }
   return r;
  };
 }
 document.addEventListener('keydown',e=>state.keys.push({key:e.key,trusted:e.isTrusted,target:e.target.tagName}),true);
 document.addEventListener('click',e=>{if(e.isTrusted)state.trustedClicks++;},true);
 document.addEventListener('formatx:magbirthcomplete',()=>state.completions.push(performance.now()));
 document.addEventListener('securitypolicyviolation',e=>state.csp.push(e.violatedDirective));
 document.addEventListener('webglcontextlost',()=>state.contextLosses++,true);
}
function opticalPeak(frame){
 const bytes=Buffer.from(frame.pixelsBase64,'base64'),{width,height}=frame;
 assert.equal(bytes.length,width*height*4,'Read actual native RGBA pixels');
 let peak=-1,x=0,y=0;
 for(let py=0;py<height;py++)for(let px=0;px<width;px++){
  if(px<=width*.35||px>=width*.65||py<=height*.35||py>=height*.65)continue;
  const i=(py*width+px)*4;if(bytes[i+3]<=127)continue;
  const luminance=bytes[i]*.2126+bytes[i+1]*.7152+bytes[i+2]*.0722;
  if(luminance>peak){peak=luminance;x=px;y=py;}
 }
 assert(peak>150,'The actual internal optical feature must remain readable');
 return{x:x/width,y:y/height,luminance:peak,pixel:[x,y],rgbaSha256:hash(bytes)};
}
function projectBodyAnchor(frame,mobile){
 // Independent projection of the authored internal 3D anchor through the
 // retained native camera. Refraction may offset its image; a genuine body
 // attachment must still follow the direction and a meaningful fraction of
 // its geometric parallax in BOTH legs of a real keyboard turn.
 const u=frame.uniforms,[px,py]=u.uPointer,[rx,ry,rz]=u.uRotation,t=u.uTime[0],aspect=u.uAspect[0];
 const yaw=(mobile?.405:.335)+ry+px*(mobile?.12:.16)+t*.007;
 const pitch=-.070+rx-py*(mobile?.085:.125)+.006*Math.sin(t*.19);
 const roll=-.045+rz+px*py*(mobile?.022:.034)+.005*Math.sin(t*.23);
 let x=.008+px*.016,y=.012-py*.013,z=.15;
 [y,z]=[Math.cos(pitch)*y+Math.sin(pitch)*z,-Math.sin(pitch)*y+Math.cos(pitch)*z];
 [x,z]=[Math.cos(yaw)*x-Math.sin(yaw)*z,Math.sin(yaw)*x+Math.cos(yaw)*z];
 [x,y]=[Math.cos(roll)*x+Math.sin(roll)*y,-Math.sin(roll)*x+Math.cos(roll)*y];
 const k=2.76/Math.max(1.72,3.12-z*.70)*(mobile?.585:.790)*Math.min(1,Math.max(.56,aspect)/.88);
 return{x:(x/Math.max(.56,aspect)*1.02*k+(mobile?.002:.018)+1)*.5,y:(y*1.03*k+(mobile?.010:-.006)+1)*.5};
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
 report.browser=browser.version();
 try{
  for(const [profile,viewport,mobile] of [['desktop',{width:1440,height:900},false],['mobile',{width:390,height:844},true]]){
   const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion:'no-preference',locale:'hu-HU'});
   const item={profile,errors:[]};report.cases.push(item);await context.addInitScript(observe,forceWebGL1);
   const page=await context.newPage();page.on('pageerror',e=>item.errors.push(String(e)));
   try{
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>window.FormatXLivingCore&&document.documentElement.dataset.fxCrystalOrganismR326==='ready'&&window.__opticalSpace.completions.length===1,null,{timeout:18000});
    await page.waitForLoadState('load');await page.waitForTimeout(200);
    await page.evaluate(()=>{window.__opticalSpace.want='initial';});
    await page.locator('button.fx-reference-mag-button').click();
    await page.waitForFunction(()=>window.__opticalSpace.samples.length===1,null,{timeout:8000});
    for(let pose=1;pose<=2;pose++){
     const key=pose===1?'ArrowRight':'ArrowLeft',count=pose===1?12:24;
     for(let k=0;k<count-1;k++)await page.keyboard.press(key);
     await page.waitForTimeout(180);
     await page.evaluate(label=>{window.__opticalSpace.want=label;},'rotation-'+pose);
     await page.keyboard.press(key);
     await page.waitForFunction(n=>window.__opticalSpace.samples.length===n,pose+1,{timeout:8000});
    }
    item.actual=await page.evaluate(()=>{const core=window.FormatXLivingCore,gl=core.canvas.getContext('webgl2')||core.canvas.getContext('webgl');return{...window.__opticalSpace,contextVersion:gl.getParameter(gl.VERSION),glError:gl.getError(),lost:gl.isContextLost(),canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,vertexCount:core.vertexCount,renderMs:document.documentElement.dataset.fxCoreRenderMs,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};});
    item.shaderHashes=item.actual.shaderSources.map(hash);delete item.actual.shaderSources;
    assert.equal(item.actual.contexts,1,'One original real WebGL context');assert.equal(item.actual.canvasCount,1,'One original native canvas');
    assert(item.actual.contextVersion.startsWith(forceWebGL1?'WebGL 1.0':'WebGL 2.0'),'The actual supported native context must match the availability scenario');
    assert.equal(item.actual.glError,0);assert.equal(item.actual.lost,false);assert.equal(item.actual.contextLosses,0);assert.equal(item.actual.overflow,0);
    assert.equal(item.actual.completions.length,1,'One actual normal intro completion');assert.deepEqual(item.actual.csp,[]);assert.deepEqual(item.errors,[]);
    assert.equal(item.actual.keys.length,36);assert(item.actual.keys.every(e=>e.trusted));assert(item.actual.trustedClicks>=1,'A genuine unforced MAG click must precede keyboard rotation');
    assert(item.actual.samples.every(s=>s.vertexCount===item.actual.vertexCount),'The original mesh must survive every input');
    item.poses=item.actual.samples.map(s=>({label:s.label,peak:opticalPeak(s),bodyAnchor:projectBodyAnchor(s,mobile),rotation:s.uniforms.uRotation}));
    item.legs=item.poses.slice(1).map((pose,i)=>{
     const prior=item.poses[i],expected=pose.bodyAnchor.x-prior.bodyAnchor.x,actual=pose.peak.x-prior.peak.x;
     return{from:prior.label,to:pose.label,expectedHorizontalParallax:expected,actualHorizontalParallax:actual,ratio:actual/expected};
    });
    for(const leg of item.legs){
     assert(Math.abs(leg.expectedHorizontalParallax)>.02,profile+': real keyboard rotation must provide a measurable geometric baseline');
     assert(leg.ratio>=.5,profile+': internal optical feature must follow the rotating body in both directions: '+JSON.stringify(leg));
    }
    item.pass=true;
    console.log('NATIVE_OPTICAL_PARALLAX_R2134_CASE_PASS '+JSON.stringify({profile,legs:item.legs,contexts:item.actual.contexts,vertexCount:item.actual.vertexCount,glError:item.actual.glError}));
   }catch(e){item.failure=String(e.stack||e);item.pass=false;console.error('NATIVE_OPTICAL_PARALLAX_R2134_CASE_FAIL '+JSON.stringify({profile,failure:item.failure,legs:item.legs}));}
   finally{write();await context.close();}
  }
 }finally{await browser.close();}
 assert(report.cases.every(c=>c.pass),'Both original native desktop/mobile optical trajectories must remain attached to the 3D body');
 console.log('NATIVE_OPTICAL_PARALLAX_R2134_PASS '+JSON.stringify({sha:report.sha,browser:report.browser,cases:report.cases.map(c=>({profile:c.profile,pass:c.pass}))}));
})().catch(e=>{write();console.error(e);process.exitCode=1;});
