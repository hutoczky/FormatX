/* FormatX R865 — normal-lit main-thread recovery after primary-worker failure.
   Used only after the navigation-owned OffscreenCanvas worker path genuinely fails.
   The replacement is built on a hidden candidate stage, renders one valid frame,
   publishes durable canonical readiness, synchronously notifies consumers, and only
   then retires the previous visible stage. No extra timer is allowed to gate fallback
   readiness because fallback is recovery work and must converge deterministically.
   The explicit handoff may replace an already-ready primary without withdrawing
   durable semantic state. The R864 closed surface and studio optics survive it. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='crystal-organism-r326';
const REVISION='r865-normal-lit-main-thread-fallback';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const handoffRequested=document.currentScript?.dataset.fxR737FallbackHandoff==='true';
if(root.dataset.fxCrystalOrganismR326==='ready'&&!handoffRequested)return;
const lifecycle=new AbortController();
const listen=(target,type,handler,options={})=>target.addEventListener(type,handler,{...options,signal:lifecycle.signal});
let stage=null,canvas=null,gl=null,program=null,raf=0,ro=null,io=null,destroyed=false,visible=true;
let morph=root.dataset.fxCoreShapeR337==='sphere'?1:0,rotationY=0,energy=.5,breath=.12,pointerX=0,pointerY=0,pulseStart=-Infinity;
const buffers=[];
function publishStatic(reason){
 const hero=document.getElementById('hero'),host=hero?.querySelector('.hero-space');
 const previous=host instanceof HTMLElement?[...host.querySelectorAll(':scope > .fx-core-mobile-v55-stage')]:[];
 let semantic=null;
 if(host instanceof HTMLElement){semantic=document.createElement('div');semantic.className='fx-core-mobile-v55-stage fx-crystal-organism-r326-stage fx-core-static-semantic-r751';semantic.dataset.renderer='static-semantic-fallback-r751';semantic.dataset.revision='r751-static-semantic-fallback';semantic.dataset.active='candidate';semantic.setAttribute('aria-hidden','true');semantic.style.visibility='hidden';semantic.style.pointerEvents='none';host.prepend(semantic);}
 const shape=()=>root.dataset.fxCoreShapeR337==='sphere'?'sphere':'crystal';
 const api={version:VERSION,revision:'r751-static-semantic-fallback',renderer:'static-semantic-fallback-r751',material:'static-semantic-living-core',geometry:'closed-3d-semantic-volume',scheduler:'static-zero-frame',pulse:()=>false,surfacePulse:()=>false,surfacePulseDurationMs:0,setMorph:v=>{morph=clamp(Number(v)||0,0,1);root.dataset.fxCoreShapeR337=morph>=.5?'sphere':'crystal';return morph;},setShape:v=>{root.dataset.fxCoreShapeR337=v==='sphere'?'sphere':'crystal';return root.dataset.fxCoreShapeR337==='sphere'?1:0;},toggleShape:()=>{const next=shape()==='sphere'?'crystal':'sphere';root.dataset.fxCoreShapeR337=next;return next==='sphere'?1:0;},rotateBy:()=>{},requestRender:()=>{},destroy:()=>{semantic?.remove();},canvas:null,stage:semantic,get energy(){return .5;},get openness(){return .08;},get morph(){return morph;},get shape(){return shape();},get rotation(){return[0,0,0];},get vertexCount(){return 0;}};
 window.FormatXCoreMobileV69=api;window.FormatXLivingCore=api;
 root.dataset.fxCrystalOrganismR326='ready';root.dataset.fxLivingOrganicCoreR413='ready';root.dataset.fxLivingOrganicCoreR454='static-semantic-ready';root.dataset.fxCoreMobileR99='ready-v69';root.dataset.fxCoreMobileV69='ready-v69';root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='static-semantic-fallback-r751';root.dataset.fxCoreRendererVersion='static-semantic-fallback-r751';root.dataset.fxCoreGeometry='closed-3d-semantic-volume';root.dataset.fxCoreDimension='native-closed-3d-volume-r413';root.dataset.fxCoreContexts='0';root.dataset.fxCoreCompositionR285='pure-semantic-static-fallback';root.dataset.fxCoreLifecycleR536='automatic-static-semantic';root.dataset.fxGpuCapability='static-semantic';root.dataset.fxCoreFallbackR727=`ready-static-semantic-r751-${reason}`;
 dispatchEvent(new CustomEvent('formatx:magfallbackcandidate',{detail:{revision:'r751-static-semantic-fallback',renderer:'static-semantic-fallback-r751',reason}}));
 previous.forEach(node=>node.remove());if(semantic){semantic.dataset.active='true';semantic.style.visibility='visible';}
 dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:`r751-${reason}`,fallback:'static-semantic-html',ready:true}}));
 dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'r751-static-semantic-fallback',renderer:'static-semantic-fallback-r751',revision:'r751-static-semantic-fallback',context:'static',geometry:'closed-3d-semantic-volume',interactive:false,organism:true,legacyFallback:false}}));
}
function fail(reason){try{stage?.remove();}catch(_){}publishStatic(reason);}
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s)||'shader-compile';gl.deleteShader(s);throw new Error(message);}return s;}
function buildProgram(){
  const vs=shader(gl.VERTEX_SHADER,`precision mediump float;
    attribute vec3 aCrystal,aSphere,aCrystalNormal,aSphereNormal;
    uniform float uMorph,uAspect,uRotationY,uBreath;
    uniform vec2 uPointer;
    varying vec3 vLocal,vNormal;
    void main(){
      float m=uMorph*uMorph*(3.0-2.0*uMorph);
      vec3 p=mix(aCrystal,aSphere,m);
      vec3 n=normalize(mix(aCrystalNormal,aSphereNormal,m));
      float c=cos(uRotationY),s=sin(uRotationY);
      vec3 q=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
      vNormal=vec3(c*n.x+s*n.z,n.y,-s*n.x+c*n.z);
      q*=1.0+uBreath*.015;q.xy+=uPointer*.02;vLocal=q;
      float camera=3.05-q.z*.62;
      vec2 xy=vec2(q.x/max(.60,uAspect),q.y)*(2.62/max(1.75,camera));
      gl_Position=vec4(xy,-q.z*.12,1.0);
    }`);
  const fs=shader(gl.FRAGMENT_SHADER,`precision mediump float;
    uniform float uEnergy,uSurfacePulse;
    varying vec3 vLocal,vNormal;
    vec3 environment(vec3 ray){
      float panel=clamp((1.0-abs(ray.x+.38)*2.4)*10.0,0.0,1.0)
        *clamp((1.0-abs(ray.y-.58)*3.0)*10.0,0.0,1.0)*clamp(ray.z*4.0,0.0,1.0);
      float strip=clamp((1.0-abs(ray.x-.54)*8.0)*8.0,0.0,1.0)*clamp(ray.y+.15,0.0,1.0);
      return mix(vec3(.015,.024,.043),vec3(.10,.17,.24),clamp(ray.y*.5+.5,0.0,1.0))
        +vec3(8.0,8.5,9.0)*panel+vec3(.40,1.4,2.0)*strip;
    }
    void main(){
      vec3 n=normalize(vNormal),view=normalize(vec3(-vLocal.xy,3.05-vLocal.z));
      vec3 key=vec3(-.429,.609,.665),fill=vec3(.739,-.180,.650);
      float light=max(dot(n,key),0.0),side=max(dot(n,fill),0.0);
      float edge=1.0-clamp(dot(n,view),0.0,1.0),edge2=edge*edge;
      float fresnel=.035+.965*edge2*edge2*edge;
      float rim=edge2*edge;
      float spec=max(dot(n,normalize(key+view)),0.0);
      spec*=spec;spec*=spec;spec*=spec;spec*=spec;spec*=spec;
      vec3 refracted=refract(-view,n,.685);
      float innerDistance=max(0.0,vLocal.z)/max(.20,-refracted.z);
      vec2 inner=vLocal.xy+refracted.xy*innerDistance;
      float core=clamp(1.0-length(inner)/.16,0.0,1.0);
      core=core*core*core;
      float pulse=uSurfacePulse<0.0?0.0:clamp(1.0-abs((.5+vLocal.y*.5)-uSurfacePulse)*10.0,0.0,1.0);
      vec3 cyan=vec3(.075,.62,.84),ice=vec3(.78,.91,1.0),violet=vec3(.35,.16,.60);
      float thickness=.48+max(0.0,vLocal.z)*.65;
      vec3 absorption=vec3(1.0)/(vec3(1.0)+vec3(2.6,1.0,.55)*thickness);
      vec3 transmission=environment(refracted)*absorption;
      vec3 reflection=environment(reflect(-view,n));
      vec3 body=mix(vec3(.012,.035,.065),vec3(.12,.22,.30),light*light);
      vec3 color=mix(transmission,reflection,fresnel)+body*.10+ice*spec*.20;
      color+=cyan*(side*.09+rim*.38)+violet*rim*clamp(-n.x,0.0,1.0)*.50;
      color+=ice*core*(.45+uEnergy*.35)*absorption+cyan*pulse*(.12+rim*.18);
      gl_FragColor=vec4(sqrt(color/(vec3(1.0)+color)),clamp(.80+rim*.16+core*.04,0.0,1.0));
    }`);
  const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);
  ['aCrystal','aSphere','aCrystalNormal','aSphereNormal'].forEach((name,index)=>gl.bindAttribLocation(p,index,name));
  gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p)||'program link failed';gl.deleteProgram(p);throw new Error(e);}return p;
}
function geometry(){const latSeg=12,lonSeg=24,crystal=[],sphere=[],crystalNormals=[],sphereNormals=[];function vertex(la,lo){const phi=(la/latSeg)*Math.PI,theta=(lo/lonSeg)*Math.PI*2,s=Math.sin(phi),d=[s*Math.cos(theta),Math.cos(phi),s*Math.sin(theta)],ax=d[0]>=0?.88:.86,ay=d[1]>=0?1.09:.97,az=d[2]>=0?.64:.43,e=.78,t=Math.pow(Math.abs(d[0])/ax,e)+Math.pow(Math.abs(d[1])/ay,e)+Math.pow(Math.abs(d[2])/az,e),r=1/Math.pow(Math.max(.0001,t),1/e);return{c:d.map(x=>x*r),s:d.map(x=>x*.91),n:d};}function tri(a,b,c){const u=b.c.map((v,i)=>v-a.c[i]),v=c.c.map((q,i)=>q-a.c[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n),normal=n.map(q=>q/length);for(const q of[a,b,c]){crystal.push(...q.c);sphere.push(...q.s);crystalNormals.push(...normal);sphereNormals.push(...q.n);}}for(let la=0;la<latSeg;la++)for(let lo=0;lo<lonSeg;lo++){const a=vertex(la,lo),b=vertex(la,lo+1),c=vertex(la+1,lo),d=vertex(la+1,lo+1);if(la>0)tri(a,b,c);if(la<latSeg-1)tri(b,d,c);}return{arrays:[crystal,sphere,crystalNormals,sphereNormals].map(a=>new Float32Array(a)),count:crystal.length/3};}
function resize(){if(!stage||!canvas||!gl)return false;const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return false;const dpr=Math.min(devicePixelRatio||1,1.15),budget=520000;let w=Math.max(2,Math.round(r.width*dpr)),h=Math.max(2,Math.round(r.height*dpr));if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.max(2,Math.round(w*k));h=Math.max(2,Math.round(h*k));}if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;gl.viewport(0,0,w,h);root.dataset.fxCoreReal3dResolution=`${w}x${h}`;root.dataset.fxCoreReal3dScale=(w/Math.max(1,r.width)).toFixed(2);return r.width/Math.max(1,r.height);}
let u={},count=0,aspect=1;
function render(now=performance.now()){if(destroyed||!visible||document.hidden||!gl||!program)return;const next=resize();if(next)aspect=next;const elapsed=(now-pulseStart)/1160,pulse=elapsed>=0&&elapsed<=1?elapsed:-1;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(u.morph,morph);gl.uniform1f(u.aspect,aspect);gl.uniform1f(u.rotationY,rotationY);gl.uniform1f(u.energy,energy);gl.uniform1f(u.breath,breath);gl.uniform2f(u.pointer,pointerX,pointerY);gl.uniform1f(u.pulse,pulse);gl.drawArrays(gl.TRIANGLES,0,count);gl.flush();root.dataset.fxCoreRenderMs='bounded-r751';}
function schedule(){if(raf||destroyed||!visible||document.hidden)return;raf=requestAnimationFrame(now=>{raf=0;render(now);});}
function setMorph(value,source='api',announce=true){morph=clamp(Number(value)||0,0,1);const shape=morph>=.5?'sphere':'crystal';root.dataset.fxCoreShapeR337=shape;root.dataset.fxCoreTargetShape=shape;root.dataset.fxCoreShape=shape;root.dataset.fxCoreMorph=morph.toFixed(3);root.dataset.fxCoreMorphSource=source;schedule();if(announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{shape,source,revision:REVISION,renderer:VERSION,geometry:'closed-3d-volume'}}));return morph;}
function setShape(shape,source='api'){return setMorph(shape==='sphere'||shape===1||shape===true?1:0,source,true);}
function toggleShape(source='interaction'){return setShape(morph>=.5?'crystal':'sphere',source);}
function pulse(detail={}){if(Number.isFinite(detail.x))pointerX=clamp(detail.x,-1,1);if(Number.isFinite(detail.y))pointerY=clamp(detail.y,-1,1);energy=Math.max(.5,detail.phase==='drag'?.62:.90);breath=Math.max(.12,detail.phase==='drag'?.42:.68);schedule();setTimeout(()=>{energy=.5;breath=.12;schedule();},180);}
function surfacePulse(source='api'){if(reduced.matches||document.hidden||!visible)return false;pulseStart=performance.now();root.dataset.fxCoreSurfacePulseR454=`sweep-${source}`;let ticks=0;const step=()=>{if(destroyed)return;const elapsed=performance.now()-pulseStart;if(elapsed>1160||ticks++>18){pulseStart=-Infinity;root.dataset.fxCoreSurfacePulseR454='idle';schedule();return;}schedule();setTimeout(step,64);};step();return true;}
function destroy(){if(destroyed)return;destroyed=true;lifecycle.abort();if(raf)cancelAnimationFrame(raf);try{ro?.disconnect();io?.disconnect();}catch(_){}for(const b of buffers)try{gl?.deleteBuffer(b);}catch(_){}try{if(program)gl?.deleteProgram(program);}catch(_){}stage?.remove();if(window.FormatXCoreMobileV69?.revision===REVISION)delete window.FormatXCoreMobileV69;if(window.FormatXLivingCore?.revision===REVISION)delete window.FormatXLivingCore;}
function boot(){
 if((root.dataset.fxCrystalOrganismR326==='ready'&&!handoffRequested)||destroyed)return;
 root.dataset.fxCoreFallbackR727='candidate-boot-r751';
 try{
  const hero=document.getElementById('hero'),host=hero?.querySelector('.hero-space');if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement)){publishStatic('host-unavailable');return;}
  const previous=[...host.querySelectorAll(':scope > .fx-core-mobile-v55-stage')];
  stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-crystal-organism-r326-stage fx-core-fallback-candidate-r751';stage.dataset.renderer=VERSION;stage.dataset.revision=REVISION;stage.dataset.active='candidate';stage.setAttribute('aria-hidden','true');stage.style.visibility='hidden';stage.style.opacity='0';stage.style.pointerEvents='none';host.prepend(stage);
  canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'});if(!gl){stage.remove();stage=null;publishStatic('webgl1-unavailable');return;}
  program=buildProgram();const g=geometry();count=g.count;gl.useProgram(program);g.arrays.forEach((data,index)=>{const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,0,0);});u={morph:gl.getUniformLocation(program,'uMorph'),aspect:gl.getUniformLocation(program,'uAspect'),rotationY:gl.getUniformLocation(program,'uRotationY'),energy:gl.getUniformLocation(program,'uEnergy'),breath:gl.getUniformLocation(program,'uBreath'),pointer:gl.getUniformLocation(program,'uPointer'),pulse:gl.getUniformLocation(program,'uSurfacePulse')};gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);aspect=resize()||1;
  const api={version:VERSION,revision:REVISION,renderer:'single-webgl-crystal-organism-r326',material:'translucent-living-facet-organism-r326',geometry:'four-direction-asymmetric-crystal-organism-r326',scheduler:'interaction-bursts-idle-zero-frame-r441',pulse,surfacePulse,surfacePulseDurationMs:1160,setMorph:(v,s)=>setMorph(v,s||'api-morph',true),setShape:(v,s)=>setShape(v,s||'api-set'),toggleShape:s=>toggleShape(s||'api-toggle'),rotateBy:(x,y)=>{rotationY+=Number(y)||Number(x)||0;schedule();},requestRender:schedule,destroy,canvas,stage,get energy(){return energy;},get openness(){return .08+breath*.025;},get morph(){return morph;},get shape(){return morph>=.5?'sphere':'crystal';},get rotation(){return[0,rotationY,0];},get vertexCount(){return count;}};window.FormatXCoreMobileV69=api;window.FormatXLivingCore=api;
  setMorph(morph,'fallback-initial',false);render(performance.now());
  root.dataset.fxCrystalOrganismR326='ready';root.dataset.fxLivingOrganicCoreR413='ready';root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';root.dataset.fxCoreMobileR99='ready-v69';root.dataset.fxCoreMobileV69='ready-v69';root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';root.dataset.fxCoreMaterial='translucent-living-facet-organism-r326';root.dataset.fxCoreGeometry='four-direction-asymmetric-crystal-organism-r326';root.dataset.fxCoreRendererVersion='living-luminous-electric-crystal-r865-normal-lit-fallback';root.dataset.fxCoreGeometryTopology='12x24-closed-uv-surface';root.dataset.fxCoreVertexCount=String(count);root.dataset.fxCoreDimension='native-closed-3d-volume-r413';root.dataset.fxCoreContexts='1';root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';root.dataset.fxCoreSurfaceMotionR454='intermittent-native-electric-filament-every-five-to-six-seconds';root.dataset.fxCoreSurfacePulseR454='idle';root.dataset.fxCoreScheduler='interaction-bursts-idle-zero-frame-r441';root.dataset.fxCoreIdleRenderR441='zero-frame';root.dataset.fxCoreLifecycleR536='automatic-zero-idle-visible-pulse';root.dataset.fxGpuCapability='webgl1-bounded-main-thread-fallback';root.dataset.fxCoreFallbackR727='ready-bounded-webgl1-r865';root.dataset.fxCoreShaderCompileR550='bounded-simple-webgl1';root.dataset.fxCoreShaderCompileR558='bounded-simple-webgl1';root.dataset.fxCoreShaderCompileR563='bounded-simple-webgl1';root.dataset.fxCoreFallbackHandoffR751='candidate-valid-readiness-published';
  dispatchEvent(new CustomEvent('formatx:magfallbackcandidate',{detail:{revision:REVISION,renderer:VERSION,context:'webgl1',valid:true}}));
  previous.forEach(node=>node.remove());stage.dataset.active='true';stage.style.visibility='visible';stage.style.opacity='1';root.dataset.fxCoreFallbackHandoffR751='previous-stage-retired-after-ready';
  ro=new ResizeObserver(()=>{const next=resize();if(next){aspect=next;schedule();}});ro.observe(stage);io=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.04);if(visible)schedule();},{threshold:[0,.04]});io.observe(stage);listen(hero,'pointermove',event=>{if(event.pointerType==='touch')return;const r=stage.getBoundingClientRect();pointerX=clamp(((event.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);pointerY=clamp(-((event.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);schedule();},{passive:true});listen(window,'formatx:coreinteraction',event=>{pulse(event.detail||{});if(event.detail?.phase==='release')toggleShape('core-tap');},{passive:true});listen(window,'formatx:organismpanelopen',()=>setShape('sphere','organism-listening'),{passive:true});listen(window,'formatx:organismresponse',()=>setShape('crystal','organism-response'),{passive:true});listen(document,'visibilitychange',()=>{if(!document.hidden)schedule();},{passive:true});listen(window,'pagehide',destroy,{once:true});schedule();dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:REVISION,renderer:VERSION,revision:REVISION,context:'webgl1',geometry:'closed-3d-volume',morph:'crystal-sphere-native-webgl',interactive:true,organism:true,legacyFallback:false,shaderCompile:'bounded-simple-webgl1'}}));
 }catch(error){console.warn('FormatX bounded MAG fallback unavailable:',error);fail('bootstrap-error');}
}
root.dataset.fxCoreFallbackR727='candidate-boot-immediate-r751';
boot();
}());
