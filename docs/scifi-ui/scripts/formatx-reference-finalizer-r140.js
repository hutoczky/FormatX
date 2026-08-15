(function(){
'use strict';
const root=document.documentElement;
let raf=0,tries=0,observer=null;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};
function apply(){
  raf=0;
  if(innerWidth>900){root.dataset.fxReferenceFinalizerR140='desktop-skip';return true;}
  const hero=document.getElementById('hero');
  const stage=hero?.querySelector('.fx-core-r112-stage,.fx-core-mobile-v55-stage');
  const ask=hero?.querySelector('.fx-reference-ask i');
  if(!(stage instanceof HTMLElement)){
    if(++tries<360)schedule();
    return false;
  }

  /* This is intentionally inline + !important. A late legacy award layer adds an
     inset bottom rule after the reference CSS; this final guard removes that one
     seam without touching the WebGL canvas or the repaired reference compositor. */
  imp(stage,'box-shadow','none');
  imp(stage,'border','0');
  imp(stage,'outline','0');

  /* Match the supplied Android reference cloud: solid white centre with very
     small lilac lobes. Geometry remains unchanged and the control stays live. */
  if(ask instanceof HTMLElement){
    imp(ask,'background','rgba(252,251,255,.98)');
    imp(ask,'box-shadow','-5px 1px 0 -1px rgba(247,243,255,.98),5px 1px 0 -1px rgba(222,210,255,.94),0 -4px 0 -1px rgba(255,255,255,.98),0 0 9px rgba(190,158,255,.36)');
  }

  root.dataset.fxReferenceFinalizerR140='ready';
  return true;
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{const done=apply();if(done&&observer){observer.disconnect();observer=null;}});}
if(!apply()){
  observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,childList:true});
}
['formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:languagechange'].forEach(name=>addEventListener(name,schedule));
addEventListener('resize',schedule,{passive:true});
setTimeout(schedule,120);setTimeout(schedule,700);setTimeout(schedule,1800);setTimeout(schedule,3400);
}());
