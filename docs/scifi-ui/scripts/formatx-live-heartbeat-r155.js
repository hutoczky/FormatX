(function(){
'use strict';
const root=document.documentElement;
const VERSION='r285-native-webgl-heartbeat-bridge';
if(root.dataset.fxLiveHeartbeatR155===VERSION)return;

for(const node of document.querySelectorAll('#hero .fx-r155-heartbeat-core,#hero .fx-r155-heartbeat-ring,#hero .fx-r155-heartbeat-wave'))node.remove();

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.();}catch(_){/* native renderer remains authoritative */}
  root.dataset.fxLiveHeartbeatInteractionR155='webgl-energy-pulse';
}
function bind(){
  const host=document.querySelector('#hero .hero-space');
  if(!(host instanceof HTMLElement))return false;
  if(host.dataset.fxHeartbeatBoundR155!=='r285'){
    host.dataset.fxHeartbeatBoundR155='r285';
    host.addEventListener('pointerdown',pulse,{passive:true});
    host.addEventListener('touchstart',pulse,{passive:true});
  }
  root.dataset.fxLiveHeartbeatR155=VERSION;
  root.dataset.fxLivingHeartbeatModeR158='native-webgl-energy-only-r285';
  root.dataset.fxLivingShapeModeR167='native-webgl-mesh-only-r285';
  root.dataset.fxLivingShapePulseStateR167='shader-energy-pulse-no-dom';
  root.dataset.fxLiveHeartbeatClockR155='renderer-burst-clock-r285';
  root.dataset.fxHeartbeatSchedulerR183='event-driven-webgl-no-2d-layer';
  root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';
  return true;
}

if(!bind()){
  const observer=new MutationObserver(()=>{if(bind())observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),4000);
}
addEventListener('formatx:real3dready',bind,{passive:true});
}());
