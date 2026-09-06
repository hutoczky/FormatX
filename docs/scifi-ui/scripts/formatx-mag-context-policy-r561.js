/* FormatX R564 — mobile OffscreenCanvas MAG startup owner.
   Compatibility owner name remains R561 because the current MAG loader already
   loads this same navigation-owned mobile context policy URL. On capable mobile
   browsers the one canonical canvas is transferred to a same-origin worker so
   WebGL context creation and shader compilation cannot monopolise the main thread.
   Unsupported/failed OffscreenCanvas falls back automatically to canonical R326.
   No audit, intro-release or user-input gate exists. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagContextPolicyR561)return;
const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
root.dataset.fxMagContextPolicyR561=mobile?'armed-mobile-webgl1-first':'desktop-no-op';
if(!mobile)return;
const WORKER='/scifi-ui/scripts/formatx-crystal-worker-r564.js?v=20260906-r564-offscreen-native';
const FALLBACK='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260906-r564-main-thread-fallback';
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let worker=null,stage=null,canvas=null,ro=null,io=null,destroyed=false,ready=false,fallbackStarted=false;
let shape=root.dataset.fxCoreShapeR337==='sphere'?'sphere':'crystal',morph=shape==='sphere'?1:0,energy=.50,breath=.12,pointerX=0,pointerY=0,rotationY=0,pulseStart=-Infinity,pulseTimer=0,visible=true;
function fallback(reason){
  if(fallbackStarted||destroyed)return;fallbackStarted=true;
  root.dataset.fxMagOffscreenR564=`fallback-${reason}`;
  try{worker?.terminate();}catch(_){}worker=null;
  try{ro?.disconnect();io?.disconnect();}catch(_){}
  if(stage?.isConnected)stage.remove();
  if(window.FormatXCoreMobileV69?.revision==='r564-offscreen')delete window.FormatXCoreMobileV69;
  if(window.FormatXLivingCore?.revision==='r564-offscreen')delete window.FormatXLivingCore;
  delete root.dataset.fxCrystalOrganismR326;
  delete root.dataset.fxCoreReal3d;
  const script=document.createElement('script');script.src=`${FALLBACK}&t=${Date.now()}`;script.async=false;script.dataset.fxR564Fallback='true';document.head.appendChild(script);
}
function size(){
  const rect=stage?.getBoundingClientRect();if(!rect||rect.width<2||rect.height<2)return null;
  const dpr=Math.min(devicePixelRatio||1,1.35),budget=560000;let width=Math.max(2,Math.round(rect.width*dpr)),height=Math.max(2,Math.round(rect.height*dpr));if(width*height>budget){const k=Math.sqrt(budget/(width*height));width=Math.round(width*k);height=Math.round(height*k);}return{width,height,cssWidth:rect.width,cssHeight:rect.height};
}
function postState(now=performance.now()){
  if(!worker||!ready||!visible||document.hidden)return;
  const elapsed=(now-pulseStart)/1160,surfacePulse=elapsed>=0&&elapsed<=1?elapsed:-1;
  worker.postMessage({type:'state',morph,energy,breath,pointerX,pointerY,rotationY,surfacePulse,now});
}
function setMorph(value,source='api',announce=true){morph=clamp(Number(value)||0,0,1);shape=morph>=.5?'sphere':'crystal';root.dataset.fxCoreShapeR337=shape;root.dataset.fxCoreTargetShape=shape;root.dataset.fxCoreShape=shape;root.dataset.fxCoreMorph=morph.toFixed(3);root.dataset.fxCoreMorphSource=source;postState();if(announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{shape,source,revision:'r564',renderer:'crystal-organism-r326',geometry:'closed-3d-volume'}}));return morph;}
function setShape(next,source='api'){return setMorph(next==='sphere'||next===1||next===true?1:0,source,true);}
function toggleShape(source='interaction'){return setShape(shape==='sphere'?'crystal':'sphere',source);}
function pulse(detail={}){if(Number.isFinite(detail.x))pointerX=clamp(detail.x,-1,1);if(Number.isFinite(detail.y))pointerY=clamp(detail.y,-1,1);energy=Math.max(.5,detail.phase==='drag'?.62:.92);breath=Math.max(.12,detail.phase==='drag'?.48:.72);postState();setTimeout(()=>{energy=.5;breath=.12;postState();},220);}
function surfacePulse(source='api'){
  if(reduced.matches||document.hidden||!visible)return false;pulseStart=performance.now();root.dataset.fxCoreSurfacePulseR454=`sweep-${source}`;const animate=()=>{if(destroyed)return;const elapsed=performance.now()-pulseStart;if(elapsed>1160){pulseStart=-Infinity;root.dataset.fxCoreSurfacePulseR454='idle';postState();return;}postState();setTimeout(animate,48);};animate();return true;
}
function schedulePulse(){clearTimeout(pulseTimer);if(destroyed||reduced.matches||document.hidden||!visible)return;pulseTimer=setTimeout(()=>{surfacePulse('autonomous');schedulePulse();},4200);}
function publishReady(count){
  if(ready||destroyed)return;ready=true;
  root.dataset.fxMagOffscreenR564='ready-worker-webgl1';root.dataset.fxMagContextR561='offscreen-worker-webgl1-antialias-off';root.dataset.fxMagContextPolicyR561='released-to-offscreen-worker';
  root.dataset.fxCrystalOrganismR326='ready';root.dataset.fxLivingOrganicCoreR413='ready';root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';root.dataset.fxCoreMobileR99='ready-v69';root.dataset.fxCoreMobileV69='ready-v69';root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';root.dataset.fxCoreMaterial='translucent-living-facet-organism-r326';root.dataset.fxCoreGeometry='four-direction-asymmetric-crystal-organism-r326';root.dataset.fxCoreRendererVersion='living-luminous-electric-crystal-r564-offscreen-worker';root.dataset.fxCoreGeometryTopology='12x24-closed-uv-surface';root.dataset.fxCoreVertexCount=String(count||0);root.dataset.fxCoreDimension='native-closed-3d-volume-r413';root.dataset.fxCoreContexts='1';root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';root.dataset.fxCoreSurfaceMotionR454='intermittent-native-electric-filament-every-five-to-six-seconds';root.dataset.fxCoreSurfacePulseR454='idle';root.dataset.fxCoreScheduler='interaction-bursts-idle-zero-frame-r441';root.dataset.fxCoreIdleRenderR441='zero-frame';root.dataset.fxCoreLifecycleR536='automatic-zero-idle-visible-pulse';root.dataset.fxGpuCapability='webgl1-offscreen';
  const api={version:'crystal-organism-r326',revision:'r564-offscreen',renderer:'single-webgl-crystal-organism-r326',material:'translucent-living-facet-organism-r326',geometry:'four-direction-asymmetric-crystal-organism-r326',scheduler:'interaction-bursts-idle-zero-frame-r441',pulse,surfacePulse,surfacePulseDurationMs:1160,setMorph:(v,s)=>setMorph(v,s||'api-morph',true),setShape:(v,s)=>setShape(v,s||'api-set'),toggleShape:s=>toggleShape(s||'api-toggle'),rotateBy:(x,y)=>{rotationY+=Number(y)||Number(x)||0;postState();},requestRender:postState,destroy,canvas,stage,get energy(){return energy;},get openness(){return .08+breath*.025;},get morph(){return morph;},get shape(){return shape;},get rotation(){return[0,rotationY,0];},get vertexCount(){return Number(count)||0;}};
  window.FormatXCoreMobileV69=api;window.FormatXLivingCore=api;postState();schedulePulse();
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'r564',renderer:'crystal-organism-r326',revision:'r564-offscreen',context:'webgl1-offscreen',geometry:'closed-3d-volume',morph:'crystal-sphere-native-webgl',interactive:true,organism:true,legacyFallback:false,shaderCompile:'worker-thread'}}));
}
function destroy(){if(destroyed)return;destroyed=true;clearTimeout(pulseTimer);try{worker?.postMessage({type:'destroy'});worker?.terminate();}catch(_){}try{ro?.disconnect();io?.disconnect();}catch(_){}stage?.remove();if(window.FormatXCoreMobileV69?.revision==='r564-offscreen')delete window.FormatXCoreMobileV69;if(window.FormatXLivingCore?.revision==='r564-offscreen')delete window.FormatXLivingCore;}
try{
  if(typeof Worker!=='function'||typeof HTMLCanvasElement.prototype.transferControlToOffscreen!=='function'){root.dataset.fxMagContextPolicyR561='offscreen-unavailable-main-r326';return;}
  const hero=document.getElementById('hero'),host=hero?.querySelector('.hero-space');if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement)){root.dataset.fxMagContextPolicyR561='host-unavailable-main-r326';return;}
  stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-crystal-organism-r326-stage';stage.dataset.renderer='crystal-organism-r326';stage.dataset.revision='r564-offscreen';stage.dataset.active='true';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  const initial=size();if(!initial){stage.remove();root.dataset.fxMagContextPolicyR561='geometry-unavailable-main-r326';return;}
  canvas.width=initial.width;canvas.height=initial.height;
  worker=new Worker(WORKER);const offscreen=canvas.transferControlToOffscreen();
  root.dataset.fxCrystalOrganismR326='booting';root.dataset.fxCoreReal3d='booting';root.dataset.fxMagStartupContractR530='living-core-autostart-navigation-owned';root.dataset.fxCurrentMagRequestR530='navigation-owned-r564-offscreen-started';root.dataset.fxMagOffscreenR564='worker-started-under-intro';
  worker.onmessage=event=>{const detail=event.data||{};if(detail.type==='ready'){publishReady(detail.count);return;}if(detail.type==='error')fallback('worker-error');};worker.onerror=()=>fallback('worker-event-error');worker.postMessage({type:'init',canvas:offscreen,width:initial.width,height:initial.height},[offscreen]);
  ro=new ResizeObserver(()=>{const next=size();if(next&&worker)worker.postMessage({type:'resize',width:next.width,height:next.height});});ro.observe(stage);
  io=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.04);if(visible)postState();schedulePulse();},{threshold:[0,.04]});io.observe(stage);
  hero.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const rect=stage.getBoundingClientRect();pointerX=clamp(((event.clientX-rect.left)/Math.max(1,rect.width)-.5)*2,-1,1);pointerY=clamp(-((event.clientY-rect.top)/Math.max(1,rect.height)-.5)*2,-1,1);postState();},{passive:true});
  addEventListener('formatx:coreinteraction',event=>{pulse(event.detail||{});if(event.detail?.phase==='release')toggleShape('core-tap');},{passive:true});addEventListener('formatx:organismpanelopen',()=>setShape('sphere','organism-listening'),{passive:true});addEventListener('formatx:organismresponse',()=>setShape('crystal','organism-response'),{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)postState();schedulePulse();},{passive:true});addEventListener('pagehide',destroy,{once:true});
  setTimeout(()=>{if(!ready)fallback('ready-timeout');},5000);
}catch(_){fallback('bootstrap-exception');}
}());
