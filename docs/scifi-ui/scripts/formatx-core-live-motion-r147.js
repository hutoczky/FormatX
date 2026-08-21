(function(){
'use strict';
const root=document.documentElement;
const VERSION='r285-webgl-only-interaction-bridge';
if(root.dataset.fxLiveMotionR147===VERSION)return;

for(const node of document.querySelectorAll('#hero .fx-core-live-r147-layer'))node.remove();

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.();}catch(_){/* native renderer stays authoritative */}
}
function bind(){
  const host=document.querySelector('#hero .hero-space');
  if(!(host instanceof HTMLElement))return false;
  if(host.dataset.fxLiveMotionBoundR147!=='r285'){
    host.dataset.fxLiveMotionBoundR147='r285';
    host.addEventListener('pointerdown',pulse,{passive:true});
    host.addEventListener('touchstart',pulse,{passive:true});
  }
  root.dataset.fxLiveMotionR147=VERSION;
  root.dataset.fxLiveMotionSchedulerR275='native-webgl-event-bridge-no-dom-layer';
  root.dataset.fxLiveMotionVisualR149='disabled-pure-webgl3d';
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
