/* FormatX R749 — intro-isolated navigation runtime bootstrap.
   The preloader is a visual cover, never an application boot barrier.
   SOUND ownership, the current MAG loader and lightweight MAG shape/lifecycle sync start
   only after durable canonical preloader completion has been published. Heavy enhancement
   runtime remains deferred. MAG startup remains automatic and has no user-intent gate.

   Stable semantic source contract retained: reduced-motion-critical-mag-only-r536.
   Reduced motion receives the same automatic critical MAG + shape/lifecycle readiness,
   while non-critical enhancement animation work remains deferred/omitted. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;
root.dataset.fxP0MotionSchedulerR490='armed-r749-post-intro-runtime';
const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260906-r549-first-paint-under-intro-no-user-gate';
const CRITICAL_MAG_SRC='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r549-first-paint-yield-under-intro';
const MAG_SHAPE_SYNC_SRC='/scifi-ui/scripts/formatx-mag-shape-sync-r476.js?v=20260906-r537-automatic-lifecycle';
const SOUND_CONTROL_SRC='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260906-r542-professional-owner-authoritative';
const AUTO_DELAY_MS=6500;
let started=false;
let criticalMagStarted=false;
let shapeSyncStarted=false;
let soundControlStarted=false;
let postIntroStarted=false;
let idleId=0;
let timer=0;

function isPreloaderComplete(){
  return window.__formatxPreloaderComplete===true
    || root.dataset.formatxPreloader==='complete'
    || root.dataset.preloaderComplete==='true'
    || document.body?.dataset.preloaderComplete==='true'
    || document.body?.classList.contains('fx-preloader-complete');
}
function clearPending(){
  if(timer){clearTimeout(timer);timer=0;}
  if(idleId&&'cancelIdleCallback' in window){cancelIdleCallback(idleId);idleId=0;}
}
function startSoundControl(){
  if(soundControlStarted)return;
  soundControlStarted=true;
  if(root.dataset.fxWdaHardening==='r263'){
    root.dataset.fxSoundNavigationOwnerR539='already-running';return;
  }
  if(document.querySelector('script[data-fx-wda-hardening-r539]')){
    root.dataset.fxSoundNavigationOwnerR539='already-requested';return;
  }
  root.dataset.fxSoundNavigationOwnerR539='requested-navigation-post-intro-r749';
  const script=document.createElement('script');script.src=SOUND_CONTROL_SRC;script.async=false;script.dataset.fxWdaHardeningR539='true';
  script.addEventListener('load',()=>{root.dataset.fxSoundNavigationOwnerR539=root.dataset.fxWdaHardening==='r263'?'ready-navigation':'loaded-awaiting-owner';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxSoundNavigationOwnerR539='load-failed';},{once:true});
  document.head.appendChild(script);
}
function startCriticalMag(){
  if(criticalMagStarted)return;
  criticalMagStarted=true;
  if(root.dataset.fxCurrentMagRuntimeR422==='ready'||root.dataset.fxCurrentMagRuntimeR422==='booting'){
    root.dataset.fxMagNavigationBootR536='already-running';return;
  }
  if(document.querySelector('script[data-fx-current-mag-loader-r422]')){
    root.dataset.fxMagNavigationBootR536='already-requested';return;
  }
  root.dataset.fxMagNavigationBootR536='requested-navigation-post-intro-r749';
  const script=document.createElement('script');script.src=CRITICAL_MAG_SRC;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';script.dataset.fxNavigationMagR536='true';
  script.addEventListener('load',()=>{root.dataset.fxMagNavigationBootR536=/^(?:ready|booting)$/.test(root.dataset.fxCurrentMagRuntimeR422||'')?'loaded-navigation':'loaded-awaiting-current-mag';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxMagNavigationBootR536='load-failed';},{once:true});
  document.head.appendChild(script);
}
function startShapeSync(){
  if(shapeSyncStarted)return;
  shapeSyncStarted=true;
  if(root.dataset.fxMagShapeSyncR476==='ready-r634'){
    root.dataset.fxMagShapeSyncBootstrapR749='already-ready';return;
  }
  if(document.querySelector('script[data-fx-mag-shape-sync-r476]')){
    root.dataset.fxMagShapeSyncBootstrapR749='already-requested';return;
  }
  root.dataset.fxMagShapeSyncBootstrapR749='requested-navigation-post-intro';
  const script=document.createElement('script');script.src=MAG_SHAPE_SYNC_SRC;script.async=false;script.dataset.fxMagShapeSyncR476='true';script.dataset.fxNavigationMagShapeR749='true';
  script.addEventListener('load',()=>{root.dataset.fxMagShapeSyncBootstrapR749=root.dataset.fxMagShapeSyncR476==='ready-r634'?'ready-navigation':'loaded-awaiting-sync';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxMagShapeSyncBootstrapR749='load-failed';},{once:true});
  document.head.appendChild(script);
}
function start(reason){
  if(started)return;
  started=true;clearPending();root.dataset.fxP0MotionSchedulerR490=`starting-enhancements:${reason}`;
  if(document.querySelector('script[src*="formatx-motion-runtime-loader-r239.js"]')){
    root.dataset.fxP0MotionSchedulerR490='enhancements-runtime-already-present';return;
  }
  const script=document.createElement('script');script.src=SRC;script.async=true;script.dataset.fxMotionRuntimeLoaderR239='true';script.dataset.fxP0PostPaintR490='true';
  script.addEventListener('load',()=>{root.dataset.fxP0MotionSchedulerR490=`enhancements-loaded:${reason}`;},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxP0MotionSchedulerR490='enhancements-load-failed';},{once:true});
  document.head.appendChild(script);
}
function runLateAuto(){
  if(started)return;
  if(document.visibilityState!=='visible'){
    root.dataset.fxP0MotionSchedulerR490='enhancements-waiting-visible-r536';timer=setTimeout(runLateAuto,2000);return;
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    root.dataset.fxP0MotionSchedulerR490='reduced-motion-critical-mag-only-r536';return;
  }
  const launch=()=>start('late-auto-r749');
  if('requestIdleCallback' in window)idleId=requestIdleCallback(launch,{timeout:2500});
  else timer=setTimeout(launch,250);
}
function armLateFallback(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    root.dataset.fxP0FirstPaintR490='committed-r749';timer=setTimeout(runLateAuto,AUTO_DELAY_MS);
  }));
}
function onIntent(event){if(event&&event.isTrusted===false)return;start(`user-${event?.type||'intent'}-r749`);}
function startPostIntroRuntime(){
  if(postIntroStarted)return;
  postIntroStarted=true;
  root.dataset.fxP0MotionSchedulerR490='post-intro-runtime-starting-r749';
  startCriticalMag();
  startShapeSync();
  startSoundControl();
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',armLateFallback,{once:true,passive:true});
  else armLateFallback();
  for(const type of ['pointerdown','touchstart','keydown','wheel'])addEventListener(type,onIntent,{once:true,passive:true});
}
if(isPreloaderComplete())queueMicrotask(startPostIntroRuntime);
else addEventListener('formatx:preloadercomplete',startPostIntroRuntime,{once:true,passive:true});
}());
