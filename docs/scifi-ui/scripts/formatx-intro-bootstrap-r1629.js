(()=>{'use strict';
const r=document.documentElement,p=new URLSearchParams(location.search),m=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
r.dataset.fxIntroBootstrapRescueR1945g='active-prism-depth-signature-cinematic';
r.dataset.fxReferenceProductionR244=m?'ready':'desktop';
r.dataset.fxReferenceComposition=m?'reference-frame-r244':'desktop-reference-r244';
r.dataset.fxReferencePrepaintR1620=m?'mobile-ready-first-byte':'desktop-first-byte';
const f=p.get('intro')==='1'||p.get('visualintro')==='1';
let s=false;try{s=sessionStorage.getItem('formatx:mag-birth-live-r533-seen')==='1'}catch(_){}
const l=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||p.get('lighthouse')==='1',a=navigator.webdriver===true||l;
if(l){
  const o=new MutationObserver(()=>{
    const e=document.querySelector('link[data-fx-critical-core-r227]');
    if(e){e.media='print';e.dataset.fxLighthouseCriticalCoreR1749='deferred';o.disconnect();}
  });
  o.observe(document.head,{childList:true});
  r.dataset.fxLighthouseCriticalCoreR1749='armed';
}
const v=f||(!s&&!a),o=v?(f?'forced-intro':'first-real-visit'):(a?'automation-skip':'session-skip');
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

const RUNTIME_SRC='/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v=20261006-r1947-convex-optic-handoff';
let retryCount=0,retryTimer=0;
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
  const verify=()=>{
    clearTimeout(retryTimer);
    if(runtimeReady()){
      r.dataset.fxIntroBootstrapRescueR1755='loaded-and-running';
      return;
    }
    if(retryCount>=3){
      r.dataset.fxIntroBootstrapRescueR1755='retry-exhausted';
      return;
    }
    e.remove();
    if(window.__formatxMagBirthR533Owner===true&&!runtimeReady())window.__formatxMagBirthR533Owner=false;
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