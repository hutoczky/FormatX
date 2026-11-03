(()=>{'use strict';
const r=document.documentElement,p=new URLSearchParams(location.search),m=matchMedia('(max-width:900px),(max-aspect-ratio:27/25)').matches;
r.dataset.fxIntroBootstrapRescueR1945g='active-prism-depth-signature-cinematic';
r.dataset.fxReferenceProductionR244=m?'ready':'desktop';
r.dataset.fxReferenceComposition=m?'reference-frame-r244':'desktop-reference-r244';
r.dataset.fxReferencePrepaintR1620=m?'mobile-ready-first-byte':'desktop-first-byte';
const f=p.get('intro')==='1'||p.get('visualintro')==='1';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
r.dataset.fxIntroMotionR2105=reduced?'reduced':'full';
let s=false;try{s=sessionStorage.getItem('formatx:mag-birth-live-r533-seen')==='1'}catch(_){}
// R2266: no agent-specific static film/critical CSS; explicit user skip only.
const a=navigator.webdriver===true&&f;
const v=f||(!a&&p.get('intro')!=='0'),o=v?(f?'forced-intro':'fresh-navigation-genesis'):(a?'automation-skip':'explicit-skip');
r.dataset.fxIntroPrepaintR1611=v?'show':'skip';
r.dataset.fxIntroPrepaintOwnerR1611=o;
r.dataset.fxMagBirthOwnerR533=v?'active':o;

function activateStyles(){
  for(const selector of ['link[data-fx-mag-birth-live-r533]','link[data-fx-mag-birth-critical-r1572]']){
    const style=document.querySelector(selector);
    if(style instanceof HTMLLinkElement){
      style.media='all';
      style.dataset.fxR1755IntroRescueStyle='active';
    }
  }
}

const RUNTIME_SRC='/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v=20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals-r2318-cell-photon-depth-r2319-native-own-final-presentation';
let retryCount=0,retryTimer=0;
const RETRY_LIMIT=3;
const runtimeReady=()=>document.querySelector('.fx-mag-birth-r533') instanceof HTMLElement;
function requestRuntime(reason='rescue'){
  if(runtimeReady()){
    r.dataset.fxIntroBootstrapRescueR1755='runtime-ready';
    return;
  }
  let e=document.querySelector('script[data-fx-mag-birth-live-r533="true"]');
  if(!(e instanceof HTMLScriptElement)){
    e=document.createElement('script');
    e.async=false;
    e.dataset.fxMagBirthLiveR533='true';
    e.dataset.fxIntroRescueR1755='true';
    const retry=retryCount++;
    e.src=RUNTIME_SRC+(retry?('&retry=r1813-'+retry):'');
    document.head.appendChild(e);
    r.dataset.fxIntroBootstrapRescueR1755=retry?'retry-requested':'requested';
  }else{
    r.dataset.fxIntroBootstrapRescueR1755='owner-present-observed';
  }
  let verified=false;
  const verify=()=>{
    if(verified)return;
    verified=true;
    clearTimeout(retryTimer);
    if(runtimeReady()){
      r.dataset.fxIntroBootstrapRescueR1755='loaded-and-running';
      return;
    }
    // A loaded script may have acquired the owner latch while its overlay is still mounting.
    // Never detach or re-request it in that state: duplicate runtime instances are worse than a late intro.
    if(window.__formatxMagBirthR533Owner===true){
      r.dataset.fxIntroBootstrapRescueR1755='owner-already-active';
      return;
    }
    if(retryCount>=RETRY_LIMIT){
      r.dataset.fxIntroBootstrapRescueR1755='retry-exhausted';
      return;
    }
    if(e.isConnected)e.remove();
    r.dataset.fxIntroBootstrapRescueR1755='retry-'+reason;
    requestRuntime('verification');
  };
  e.addEventListener('load',()=>setTimeout(verify,0),{once:true});
  e.addEventListener('error',()=>verify(),{once:true});
  clearTimeout(retryTimer);
  retryTimer=setTimeout(verify,3000);
}
function b(){
  document.getElementById('formatx-event-horizon')?.remove();
  if(!v){
    document.getElementById('fx-mag-birth-prepaint-r1606')?.remove();
    r.dataset.fxMagBirthLiveR533=o;
    return;
  }
  activateStyles();
  r.dataset.fxIntroBootstrapVisualR1775='photoreal-intro-core';
  r.dataset.fxIntroBootstrapVisualR1776='cinematic-irregular-crystal-depth';
  r.dataset.fxIntroBootstrapRecoveryR1813='verified-runtime-retry';
  requestRuntime('startup');
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',b,{once:true}):b();
})();
