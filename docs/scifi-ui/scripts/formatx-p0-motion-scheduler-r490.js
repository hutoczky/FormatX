/* FormatX R493 — deterministic post-first-paint MAG scheduler.
   The static MAG shell is part of first paint. Heavy R326/WebGL enhancement is
   never triggered by ambient startup events: explicit interaction starts it
   immediately, otherwise a genuinely late visible-tab fallback starts it.
   This preserves the living system without putting shader/runtime work on the
   LCP/TBT critical path. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;
root.dataset.fxP0MotionSchedulerR490='armed-r493';
const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260831-r484-periodic-native-energy';
const AUTO_DELAY_MS=6500;
let started=false;
let idleId=0;
let timer=0;

function clearPending(){
  if(timer){clearTimeout(timer);timer=0;}
  if(idleId&&'cancelIdleCallback' in window){cancelIdleCallback(idleId);idleId=0;}
}

function start(reason){
  if(started)return;
  started=true;
  clearPending();
  root.dataset.fxP0MotionSchedulerR490=`starting:${reason}`;
  if(document.querySelector('script[src*="formatx-motion-runtime-loader-r239.js"]')){
    root.dataset.fxP0MotionSchedulerR490='runtime-already-present';
    return;
  }
  const script=document.createElement('script');
  script.src=SRC;
  script.async=true;
  script.dataset.fxMotionRuntimeLoaderR239='true';
  script.dataset.fxP0PostPaintR490='true';
  script.addEventListener('load',()=>{root.dataset.fxP0MotionSchedulerR490=`loaded:${reason}`;},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxP0MotionSchedulerR490='load-failed';},{once:true});
  document.head.appendChild(script);
}

function runLateAuto(){
  if(started)return;
  if(document.visibilityState!=='visible'){
    root.dataset.fxP0MotionSchedulerR490='waiting-visible-r493';
    timer=setTimeout(runLateAuto,2000);
    return;
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    root.dataset.fxP0MotionSchedulerR490='reduced-motion-static-r493';
    return;
  }
  const launch=()=>start('late-auto-r493');
  if('requestIdleCallback' in window){
    idleId=requestIdleCallback(launch,{timeout:2500});
  }else{
    timer=setTimeout(launch,250);
  }
}

function armLateFallback(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    root.dataset.fxP0FirstPaintR490='committed-r493';
    timer=setTimeout(runLateAuto,AUTO_DELAY_MS);
  }));
}

function onIntent(event){
  if(event&&event.isTrusted===false)return;
  start(`user-${event?.type||'intent'}-r493`);
}

/* Deliberately exclude pointermove and scroll. Those can be emitted during
   browser startup/restoration and were the source of R492's 0.5–1.0 s random
   WebGL boot. These events represent explicit user action instead. */
for(const type of ['pointerdown','touchstart','keydown','wheel']){
  addEventListener(type,onIntent,{once:true,passive:true});
}

if(document.readyState==='loading'){
  addEventListener('DOMContentLoaded',armLateFallback,{once:true,passive:true});
}else{
  armLateFallback();
}
}());
