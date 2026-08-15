(function(){
'use strict';
const root=document.documentElement;
let raf=0,tries=0,observer=null;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};
function apply(){
  raf=0;
  if(innerWidth>900){root.dataset.fxReferenceFinalizerR142='desktop-skip';return true;}
  const hero=document.getElementById('hero');
  const detail=hero?.querySelector('.fx-core-detail-r122');
  if(!(hero instanceof HTMLElement)||!(detail instanceof HTMLElement)){
    if(++tries<360)schedule();
    return false;
  }

  /* The compositor is 412px high while the legacy stage geometry is 393.86px at
     the locked viewport. Every ancestor between the detail canvas and #hero must
     allow overflow; otherwise the lower 18px of the supplied water/crystal field
     is clipped even when the immediate stage itself says overflow:visible. */
  let node=detail.parentElement;
  while(node&&node!==hero){
    imp(node,'overflow','visible');
    if(node.matches('.fx-core-r112-stage,.fx-core-mobile-v55-stage')){
      imp(node,'box-shadow','none');
      imp(node,'border','0');
      imp(node,'outline','0');
    }
    node=node.parentElement;
  }
  imp(hero,'overflow','visible');

  root.dataset.fxReferenceFinalizerR142='ready';
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
