(function(){
'use strict';
const root=document.documentElement;
const VERSION='r285-native-webgl-energy-bridge';
if(root.dataset.fxLivingEnergyR168===VERSION)return;

for(const node of document.querySelectorAll('#hero [class^="fx-r168-"],#hero [class*=" fx-r168-"]'))node.remove();
document.getElementById('fx-r170-mobile-seam-override')?.remove();

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.();}catch(_){/* native renderer stays authoritative */}
  root.dataset.fxLivingEnergyInteractionR168='webgl-energy-burst';
}
function bind(){
  const host=document.querySelector('#hero .hero-space');
  if(!(host instanceof HTMLElement))return false;
  if(host.dataset.fxLivingEnergyBoundR168!=='r285'){
    host.dataset.fxLivingEnergyBoundR168='r285';
    host.addEventListener('pointerdown',pulse,{passive:true});
    host.addEventListener('touchstart',pulse,{passive:true});
  }
  root.dataset.fxLivingEnergyR168=VERSION;
  root.dataset.fxLivingEnergyClockR168='native-renderer-burst-clock-r285';
  root.dataset.fxLivingEnergyEffectModeR168='native-webgl-material-only-r285';
  root.dataset.fxLivingEnergySchedulerR175='no-2d-runtime';
  root.dataset.fxLivingEnergySchedulerR182='no-2d-runtime';
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
