/* FormatX R590 — all-device OffscreenCanvas MAG startup owner.
   Compatibility owner name remains R561 because the navigation MAG loader already
   loads this policy URL. The canonical stage, canvas and worker are created during
   normal navigation on mobile and desktop. Mobile keeps the proven 2200ms init.
   Desktop keeps navigation-owned zero-input startup but the expensive WebGL init
   is posted only after a real paint opportunity, with a 620ms floor and a bounded
   no-paint fallback. No Lighthouse, CI, audit, intro-complete or user-input gate. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagContextPolicyR561)return;
const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const profile=mobile?'mobile':'desktop';
root.dataset.fxMagContextPolicyR561=`armed-${profile}-offscreen-webgl1`;
const WORKER='/scifi-ui/scripts/formatx-crystal-worker-r564.js?v=20260906-r571-all-device-offscreen';
const FALLBACK='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260906-r571-main-thread-fallback';
const WORKER_INIT_AT_MS=mobile?2200:620;
const DESKTOP_INIT_FALLBACK_MS=1750;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let worker=null,stage=null,canvas=null,ro=null,io=null,destroyed=false,ready=false,fallbackStarted=false,initPosted=false,initTimer=0,readyTimer=0,paintFallbackTimer=0,paintObserver=null;
let shape=root.dataset.fxCoreShapeR337==='sphere'?'sphere':'crystal',morph=shape==='sphere'?1:0,energy=.50,breath=.12,pointerX=0,pointerY=0,rotationY=0,pulseStart=-Infinity,pulseTimer=0,visible=true;
function decontendIntroCompositor(){
  const overlay=document.getElementById('formatx-event-horizon');
  if(!(overlay instanceof HTMLElement)||overlay.hidden)return;
  const scan=overlay.querySelector('.fx-intro-scan');
  const flare=overlay.querySelector('.fx-intro-flare');
  const portal=overlay.querySelector('.fx-intro-portal');
  if(scan instanceof HTMLElement){scan.style.setProperty('filter','none','important');scan.style.setProperty('mix-blend-mode','normal','important');}
  if(flare instanceof HTMLElement){flare.style.setProperty('filter','none','important');flare.style.setProperty('box-shadow','none','important');flare.style.setProperty('width',mobile?'min(56vw,320px)':'min(42vw,460px)','important');flare.style.setProperty('height',mobile?'min(56vw,320px)':'min(42vw,460px)','important');flare.style.setProperty('background','radial-gradient(circle,rgba(210,251,255,.34) 0%,rgba(124,236,255,.24) 22%,rgba(143,114,255,.12) 48%,rgba(124,236,255,0) 74%)','important');}
  if(portal instanceof HTMLElement){portal.style.setProperty('filter','none','important');portal.style.setProperty('box-shadow','none','important');}
  root.dataset.fxPreloaderCompositorR571=`gradient-only-${profile}-glow-no-blur-stack`;
}
decontendIntroCompositor();
function cancelPaintSchedule(){clearTimeout(paintFallbackTimer);paintFallbackTimer=0;try{paintObserver?.disconnect();}catch(_){}paintObserver=null;}
function fallback(reason){
  if(fallbackStarted||destroyed)return;fallbackStarted=true;
  clearTimeout(initTimer);clearTimeout(readyTimer);cancelPaintSchedule();
  root.dataset.fxMagOffscreenR564=`fallback-${reason}`;root.dataset.fxMagOffscreenR571=`fallback-${reason}`;
  try{worker?.terminate();}catch(_){}worker=null;
  try{ro?.disconnect();io?.disconnect();}catch(_){}
  if(stage?.isConnected)stage.remove();
  if(window.FormatXCoreMobileV69?.revision==='r571-offscreen')delete window.FormatXCoreMobileV69;
  if(window.FormatXLivingCore?.revision==='r571-offscreen')delete window.FormatXLivingCore;
  delete root.dataset.fxCrystalOrganismR326;
  delete root.dataset.fxCoreReal3d;
  const script=document.createElement('script');script.src=`${FALLBACK}&t=${Date.now()}`;script.async=false;script.dataset.fxR571Fallback='true';document.head.appendChild(script);
}
function size(){
  const rect=stage?.getBoundingClientRect();if(!rect||rect.width<2||rect.height<2)return null;
  const dpr=Math.min(devicePixelRatio||1,mobile?1.35:1.25),budget=mobile?560000:650000;let width=Math.max(2,Math.round(rect.width*dpr)),height=Math.max(2,Math.round(rect.height*dpr));if(width*height>budget){const k=Math.sqrt(budget/(width*height));width=Math.round(width*k);height=Math.round(height*k);}return{width,height,cssWidth:rect.width,cssHeight:rect.height};
}
function postState(now=performance.now()){
  if(!worker||!ready||!visible||document.hidden)return;
  const elapsed=(now-pulseStart)/1160,surfacePulse=elapsed>=0&&elapsed<=1?elapsed:-1;
  worker.postMessage({type:'state',morph,energy,breath,pointerX,pointerY,rotationY,surfacePulse,now});
}
function setMorph(value,source='api',announce=true){morph=clamp(Number(value)||0,0,1);shape=morph>=.5?'sphere':'crystal';root.dataset.fxCoreShapeR337=shape;root.dataset.fxCoreTargetShape=shape;root.dataset.fxCoreShape=shape;root.dataset.fxCoreMorph=morph.toFixed(3);root.dataset.fxCoreMorphSource=source;postState();if(announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{shape,source,revision:'r571',renderer:'crystal-organism-r326',geometry:'closed-3d-volume'}}));return morph;}
function setShape(next,source='api'){return setMorph(next==='sphere'||next===1||next===true?1:0,source,true);}
function toggleShape(source='interaction'){return setShape(shape==='sphere'?'crystal':'sphere',source);}
function pulse(detail={}){if(Number.isFinite(detail.x))pointerX=clamp(detail.x,-1,1);if(Number.isFinite(detail.y))pointerY=clamp(detail.y,-1,1);energy=Math.max(.5,detail.phase==='drag'?.62:.92);breath=Math.max(.12,detail.phase==='drag'?.48:.72);postState();setTimeout(()=>{energy=.5;breath=.12;postState();},220);}
function surfacePulse(source='api'){
  if(reduced.matches||document.hidden||!visible)return false;pulseStart=performance.now();root.dataset.fxCoreSurfacePulseR454=`sweep-${source}`;const animate=()=>{if(destroyed)return;const elapsed=performance.now()-pulseStart;if(elapsed>1160){pulseStart=-Infinity;root.dataset.fxCoreSurfacePulseR454='idle';postState();return;}postState();setTimeout(animate,48);};animate();return true;
}
function schedulePulse(){clearTimeout(pulseTimer);if(destroyed||reduced.matches||document.hidden||!visible)return;pulseTimer=setTimeout(()=>{surfacePulse('autonomous');schedulePulse();},4200);}
function publishReady(count){
  if(ready||destroyed)return;ready=true;clearTimeout(readyTimer);cancelPaintSchedule();
  root.dataset.fxMagOffscreenR564='ready-worker-webgl1';root.dataset.fxMagOffscreenR571=`ready-${profile}-worker-webgl1`;root.dataset.fxMagContextR561='offscreen-worker-webgl1-antialias-off';root.dataset.fxMagContextPolicyR561=`released-${profile}-offscreen-worker`;root.dataset.fxMagDesktopDecontentionR578=mobile?'mobile-existing-2200':'desktop-first-paint-checkpoint-650k';root.dataset.fxMagDesktopDecontentionR590=mobile?'mobile-existing-2200':'paint-checkpoint-floor-620-no-intro-gate';
  root.dataset.fxCrystalOrganismR326='ready';root.dataset.fxLivingOrganicCoreR413='ready';root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';root.dataset.fxCoreMobileR99='ready-v69';root.dataset.fxCoreMobileV69='ready-v69';root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';root.dataset.fxCoreMaterial='translucent-living-facet-organism-r326';root.dataset.fxCoreGeometry='four-direction-asymmetric-crystal-organism-r326';root.dataset.fxCoreRendererVersion=`living-luminous-electric-crystal-r571-${profile}-offscreen-worker`;root.dataset.fxCoreGeometryTopology='12x24-closed-uv-surface';root.dataset.fxCoreVertexCount=String(count||0);root.dataset.fxCoreDimension='native-closed-3d-volume-r413';root.dataset.fxCoreContexts='1';root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';root.dataset.fxCoreSurfaceMotionR454='intermittent-native-electric-filament-every-five-to-six-seconds';root.dataset.fxCoreSurfacePulseR454='idle';root.dataset.fxCoreScheduler='interaction-bursts-idle-zero-frame-r441';root.dataset.fxCoreIdleRenderR441='zero-frame';root.dataset.fxCoreLifecycleR536='automatic-zero-idle-visible-pulse';root.dataset.fxGpuCapability='webgl1-offscreen';
  const api={version:'crystal-organism-r326',revision:'r571-offscreen',renderer:'single-webgl-crystal-organism-r326',material:'translucent-living-facet-organism-r326',geometry:'four-direction-asymmetric-crystal-organism-r326',scheduler:'interaction-bursts-idle-zero-frame-r441',pulse,surfacePulse,surfacePulseDurationMs:1160,setMorph:(v,s)=>setMorph(v,s||'api-morph',true),setShape:(v,s)=>setShape(v,s||'api-set'),toggleShape:s=>toggleShape(s||'api-toggle'),rotateBy:(x,y)=>{rotationY+=Number(y)||Number(x)||0;postState();},requestRender:postState,destroy,canvas,stage,get energy(){return energy;},get openness(){return .08+breath*.025;},get morph(){return morph;},get shape(){return shape;},get rotation(){return[0,rotationY,0];},get vertexCount(){return Number(count)||0;}};
  window.FormatXCoreMobileV69=api;window.FormatXLivingCore=api;postState();schedulePulse();
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'r571',renderer:'crystal-organism-r326',revision:`r571-${profile}-offscreen`,context:'webgl1-offscreen',geometry:'closed-3d-volume',morph:'crystal-sphere-native-webgl',interactive:true,organism:true,legacyFallback:false,shaderCompile:'worker-thread'}}));
}
function destroy(){if(destroyed)return;destroyed=true;clearTimeout(initTimer);clearTimeout(readyTimer);clearTimeout(pulseTimer);cancelPaintSchedule();try{worker?.postMessage({type:'destroy'});worker?.terminate();}catch(_){}try{ro?.disconnect();io?.disconnect();}catch(_){}stage?.remove();if(window.FormatXCoreMobileV69?.revision==='r571-offscreen')delete window.FormatXCoreMobileV69;if(window.FormatXLivingCore?.revision==='r571-offscreen')delete window.FormatXLivingCore;}
try{
  if(typeof Worker!=='function'||typeof HTMLCanvasElement.prototype.transferControlToOffscreen!=='function'){root.dataset.fxMagContextPolicyR561='offscreen-unavailable-main-r326';return;}
  const hero=document.getElementById('hero'),host=hero?.querySelector('.hero-space');if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement)){root.dataset.fxMagContextPolicyR561='host-unavailable-main-r326';return;}
  stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-crystal-organism-r326-stage';stage.dataset.renderer='crystal-organism-r326';stage.dataset.revision=`r571-${profile}-offscreen-scheduled`;stage.dataset.active='true';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  const initial=size();if(!initial){stage.remove();root.dataset.fxMagContextPolicyR561='geometry-unavailable-main-r326';return;}
  canvas.width=initial.width;canvas.height=initial.height;
  worker=new Worker(WORKER);const offscreen=canvas.transferControlToOffscreen();
  root.dataset.fxCrystalOrganismR326='booting';root.dataset.fxCoreReal3d='booting';root.dataset.fxMagStartupContractR530='living-core-autostart-navigation-owned';root.dataset.fxCurrentMagRequestR530=`navigation-owned-r571-${profile}-offscreen-started`;root.dataset.fxMagOffscreenR564='worker-started-under-intro';root.dataset.fxMagOffscreenR571=`worker-created-${profile}-init-scheduled`;root.dataset.fxMagWorkerInitAtR565=String(WORKER_INIT_AT_MS);root.dataset.fxMagDesktopDecontentionR578=mobile?'mobile-existing-2200':'desktop-paint-checkpoint-scheduled';root.dataset.fxMagDesktopDecontentionR590=mobile?'mobile-existing-2200':'await-first-paint-opportunity-floor-620';
  worker.onmessage=event=>{const detail=event.data||{};if(detail.type==='ready'){publishReady(detail.count);return;}if(detail.type==='error')fallback('worker-error');};worker.onerror=()=>fallback('worker-event-error');
  const beginInit=()=>{if(destroyed||fallbackStarted||!worker||initPosted)return;const start=size()||initial;initPosted=true;root.dataset.fxMagOffscreenR571=`worker-init-started-${profile}`;root.dataset.fxMagDesktopDecontentionR590=mobile?'mobile-init-2200':'desktop-init-after-paint-checkpoint';worker.postMessage({type:'init',canvas:offscreen,width:start.width,height:start.height},[offscreen]);readyTimer=setTimeout(()=>{if(!ready)fallback('ready-timeout');},5500);};
  if(mobile){
    const initDelay=Math.max(0,WORKER_INIT_AT_MS-performance.now());
    initTimer=setTimeout(beginInit,initDelay);
  }else{
    let paintArmed=false;
    const armAfterPaint=()=>{if(paintArmed||destroyed||fallbackStarted)return;paintArmed=true;cancelPaintSchedule();const floorDelay=Math.max(0,WORKER_INIT_AT_MS-performance.now());initTimer=setTimeout(beginInit,floorDelay);root.dataset.fxMagDesktopDecontentionR590='paint-observed-init-armed-floor-620';};
    const alreadyPainted=performance.getEntriesByType('paint').some(entry=>entry.name==='first-paint');
    if(alreadyPainted){armAfterPaint();}
    else{
      if(typeof PerformanceObserver==='function'){
        try{paintObserver=new PerformanceObserver(list=>{if(list.getEntries().some(entry=>entry.name==='first-paint'))armAfterPaint();});paintObserver.observe({type:'paint',buffered:true});}catch(_){}
      }
      if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(()=>armAfterPaint()));
      paintFallbackTimer=setTimeout(armAfterPaint,DESKTOP_INIT_FALLBACK_MS);
    }
  }
  ro=new ResizeObserver(()=>{const next=size();if(next&&worker&&initPosted)worker.postMessage({type:'resize',width:next.width,height:next.height});});ro.observe(stage);
  io=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.04);if(visible)postState();schedulePulse();},{threshold:[0,.04]});io.observe(stage);
  hero.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const rect=stage.getBoundingClientRect();pointerX=clamp(((event.clientX-rect.left)/Math.max(1,rect.width)-.5)*2,-1,1);pointerY=clamp(-((event.clientY-rect.top)/Math.max(1,rect.height)-.5)*2,-1,1);postState();},{passive:true});
  addEventListener('formatx:coreinteraction',event=>{pulse(event.detail||{});if(event.detail?.phase==='release')toggleShape('core-tap');},{passive:true});addEventListener('formatx:organismpanelopen',()=>setShape('sphere','organism-listening'),{passive:true});addEventListener('formatx:organismresponse',()=>setShape('crystal','organism-response'),{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)postState();schedulePulse();},{passive:true});addEventListener('pagehide',destroy,{once:true});
}catch(_){fallback('bootstrap-exception');}
}());