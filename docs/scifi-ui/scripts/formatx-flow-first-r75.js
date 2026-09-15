(function(){
'use strict';
const root=document.documentElement;
let queued=false;

/* r298: the r207/r244 + render-blocking r297 owners already define the physical
   mobile composition. This compatibility runtime may publish state, but it must
   never replay the old inline geometry pass during startup. */
const canonicalOwner=()=>innerWidth<=900&&(
  root.dataset.fxMobileLayoutOwner==='r207-normal-flow'||
  root.dataset.fxMobileLayoutOwner==='r244-reference-frame'||
  root.dataset.fxReferenceProductionR244==='ready'||
  document.querySelector('link[data-fx-mobile-layout-r207]') instanceof HTMLLinkElement||
  document.querySelector('link[data-fx-reference-production-r244]') instanceof HTMLLinkElement
);

function delegate(){
  root.dataset.fxReferenceComposition=root.dataset.fxReferenceProductionR244==='ready'
    ?'reference-frame-r244'
    :'r208-canonical-normal-flow';
  root.dataset.fxFlowFirstR75='delegated-r208';
  root.dataset.fxFlowFirstConflict='disabled-r208';
  root.dataset.fxFlowFirstScheduling='r298-state-only-no-layout-writes';
}

function apply(){
  queued=false;
  if(innerWidth>900){
    root.dataset.fxFlowFirstR75='desktop-bypass-r178';
    root.dataset.fxReferenceComposition='desktop-reference-r244';
    return true;
  }
  if(canonicalOwner()){
    delegate();
    return true;
  }

  /* The production homepage has a semantic #hero before the late owner markers
     settle. Treat that as canonical too; waiting for a later marker used to run
     hundreds of inline !important writes and created a long task with no visual
     benefit because r297 already owns first-paint geometry. */
  if(document.getElementById('hero')){
    delegate();
    root.dataset.fxFlowFirstR75='delegated-r208';
    return true;
  }

  root.dataset.fxFlowFirstR75='compatibility-dormant-r298';
  root.dataset.fxFlowFirstConflict='disabled-r208';
  return true;
}

function schedule(){
  if(queued)return;
  queued=true;
  queueMicrotask(apply);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
addEventListener('resize',schedule,{passive:true});
addEventListener('orientationchange',schedule,{passive:true});
for(const name of ['formatx:mobilelayoutready','formatx:languagechange'])addEventListener(name,schedule,{passive:true});
}());
