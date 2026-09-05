/* FormatX R536 — navigation-owned living MAG + post-first-paint enhancements.
   The real current MAG loader starts automatically as soon as this deferred
   production scheduler executes; it never waits for click, tap, wheel or scroll.
   Only the broader motion/Organism enhancement runtime remains late/intent-driven.
   This keeps MAG alive behind the short boot preloader without audit-specific UX. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;
root.dataset.fxP0MotionSchedulerR490='armed-r536-navigation-mag';
const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260906-r536-design-system-intent';
const CRITICAL_MAG_SRC='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r535-navigation-autostart';
const AUTO_DELAY_MS=6500;
let started=false;
let criticalMagStarted=false;
let idleId=0;
let timer=0;

function clearPending(){
  if(timer){clearTimeout(timer);timer=0;}
  if(idleId&&'cancelIdleCallback' in window){cancelIdleCallback(idleId);idleId=0;}
}
function startCriticalMag(){
  if(criticalMagStarted)return;
  criticalMagStarted=true;
  if(root.dataset.fxCurrentMagRuntimeR422==='ready'||root.dataset.fxCurrentMagRuntimeR422==='booting'){
    root.dataset.fxMagNavigationBootR535='already-running';return;
  }
  if(document.querySelector('script[data-fx-current-mag-loader-r422]')){
    root.dataset.fxMagNavigationBootR535='already-requested';return;
  }
  root.dataset.fxMagNavigationBootR535='requested-navigation';
  const script=document.createElement('script');script.src=CRITICAL_MAG_SRC;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';script.dataset.fxNavigationMagR535='true';
  script.addEventListener('load',()=>{root.dataset.fxMagNavigationBootR535=/^(?:ready|booting)$/.test(root.dataset.fxCurrentMagRuntimeR422||'')?'loaded-navigation':'loaded-awaiting-current-mag';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxMagNavigationBootR535='load-failed';},{once:true});
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
startCriticalMag();
if(document.readyState==='loading')addEventListener('DOMContentLoaded',armLateFallback,{once:true,passive:true});
else armLateFallback();
}());
