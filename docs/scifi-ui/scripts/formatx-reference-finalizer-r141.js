(function(){
'use strict';
const root=document.documentElement;
let raf=0,tries=0,observer=null;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};
function apply(){
  raf=0;
  if(innerWidth>900){root.dataset.fxReferenceFinalizerR141='desktop-skip';return true;}
  const hero=document.getElementById('hero');
  const stage=hero?.querySelector('.fx-core-r112-stage,.fx-core-mobile-v55-stage');
  if(!(stage instanceof HTMLElement)){
    if(++tries<360)schedule();
    return false;
  }

  /* The repaired reference canvas is intentionally scaled from 393.86px to the
     supplied 412px composition. The legacy stage was clipping those extra lower
     pixels at y≈462. Keep the stage transparent and allow the compositor to extend
     to its full reference height, while leaving WebGL/touch behavior untouched. */
  imp(stage,'overflow','visible');
  imp(stage,'box-shadow','none');
  imp(stage,'border','0');
  imp(stage,'outline','0');

  root.dataset.fxReferenceFinalizerR141='ready';
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
