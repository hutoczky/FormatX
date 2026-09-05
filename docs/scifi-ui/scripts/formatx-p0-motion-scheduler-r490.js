/* FormatX R530 — navigation-owned MAG bootstrap.
   The static MAG shell is part of first paint. The current MAG runtime starts
   automatically immediately after the first paint boundary; no click, tap,
   key, scroll, idle callback or long timer is allowed to wake the living core.
   Reduced-motion still starts on navigation and is handled by the MAG runtime. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;

const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260905-r530-navigation-autostart';
let started=false;

function start(reason='navigation-r530'){
  if(started)return;
  started=true;
  root.dataset.fxP0MotionSchedulerR490=`starting:${reason}`;
  root.dataset.fxMagStartupContractR530='living-core-autostart-navigation-owned';
  root.dataset.fxMagCanonicalClockR530='compositor-heartbeat-navigation-owned';
  root.dataset.fxMagStartupNoInputR530='required';
  root.dataset.fxMagStartupModeR530=matchMedia('(prefers-reduced-motion: reduce)').matches
    ?'reduced-motion-navigation-owned'
    :'normal-navigation-owned';
  if(document.querySelector('script[src*="formatx-motion-runtime-loader-r239.js"]')){
    root.dataset.fxP0MotionSchedulerR490='runtime-already-present-navigation-owned';
    return;
  }
  const script=document.createElement('script');
  script.src=SRC;
  script.async=false;
  script.fetchPriority='high';
  script.dataset.fxMotionRuntimeLoaderR239='true';
  script.dataset.fxMagNavigationBootstrapR530='true';
  script.addEventListener('load',()=>{root.dataset.fxP0MotionSchedulerR490=`loaded:${reason}`;},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxP0MotionSchedulerR490='load-failed';},{once:true});
  document.head.appendChild(script);
}

function afterFirstPaintBoundary(){
  root.dataset.fxP0FirstPaintR490='committed-r530';
  start('navigation-r530');
}

function armNavigationStart(){
  root.dataset.fxP0MotionSchedulerR490='navigation-owned-r530';
  root.dataset.fxMagStartupContractR530='living-core-autostart-navigation-owned';
  root.dataset.fxMagCanonicalClockR530='compositor-heartbeat-navigation-owned';
  root.dataset.fxMagStartupNoInputR530='required';
  requestAnimationFrame(()=>requestAnimationFrame(afterFirstPaintBoundary));
}

if(document.readyState==='loading'){
  addEventListener('DOMContentLoaded',armNavigationStart,{once:true,passive:true});
}else{
  armNavigationStart();
}
}());
