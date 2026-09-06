/* FormatX R539 — navigation-owned living MAG + sound control + post-first-paint enhancements.
   The real current MAG loader and the lightweight SOUND click owner start automatically
   as soon as this deferred production scheduler executes; neither waits for user input.
   The professional audio engine itself remains strict user opt-in and is requested only
   by the SOUND control. Heavy motion/Organism enhancement runtime remains late/intent-driven. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;
root.dataset.fxP0MotionSchedulerR490='armed-r539-navigation-mag-sound-control';
const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260906-r537-automatic-lifecycle';
const CRITICAL_MAG_SRC='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r538-pause-free-optics';
const SOUND_CONTROL_SRC='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260906-r539-navigation-sound-opt-in-owner';
const AUTO_DELAY_MS=6500;
let started=false;
let criticalMagStarted=false;
let soundControlStarted=false;
let idleId=0;
let timer=0;

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
  root.dataset.fxSoundNavigationOwnerR539='requested-navigation';
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
  root.dataset.fxMagNavigationBootR536='requested-navigation';
  const script=document.createElement('script');script.src=CRITICAL_MAG_SRC;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';script.dataset.fxNavigationMagR536='true';
  script.addEventListener('load',()=>{root.dataset.fxMagNavigationBootR536=/^(?:ready|booting)$/.test(root.dataset.fxCurrentMagRuntimeR422||'')?'loaded-navigation':'loaded-awaiting-current-mag';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxMagNavigationBootR536='load-failed';},{once:true});
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
  const launch=()=>start('late-auto-r536');
  if('requestIdleCallback' in window)idleId=requestIdleCallback(launch,{timeout:2500});
  else timer=setTimeout(launch,250);
}
function armLateFallback(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    root.dataset.fxP0FirstPaintR490='committed-r536';timer=setTimeout(runLateAuto,AUTO_DELAY_MS);
  }));
}
function onIntent(event){if(event&&event.isTrusted===false)return;start(`user-${event?.type||'intent'}-r536`);}
for(const type of ['pointerdown','touchstart','keydown','wheel'])addEventListener(type,onIntent,{once:true,passive:true});
startSoundControl();
startCriticalMag();
if(document.readyState==='loading')addEventListener('DOMContentLoaded',armLateFallback,{once:true,passive:true});
else armLateFallback();
}());
