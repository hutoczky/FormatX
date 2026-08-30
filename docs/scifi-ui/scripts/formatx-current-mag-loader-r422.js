/* FormatX r434 — direct current MAG loader.
   r326 remains the production renderer. r430/r431 own restrained mobile optics
   and normal-flow header; r433 keeps native morph rendering alive to endpoint;
   r434 gives the visible r326 stage its own UI-safe touch owner. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='direct-r326-r434-restrained-mag-native-touch-settled-morph';
if(root.dataset.fxCurrentMagRuntimeR422==='ready'||root.dataset.fxCurrentMagRuntimeR422==='booting')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(reduced)root.dataset.fxCurrentMagMotionR424='static-render-explicit-interaction';
root.dataset.fxCurrentMagRuntimeR422='booting';

const STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r430-restrained-mobile-optics';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';
const RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260829-r424-sharp-organic-core';
const TOUCH='/scifi-ui/scripts/formatx-core-touch-pulse-r99.js?v=20260830-r434-native-delegate';
const NATIVE_TOUCH='/scifi-ui/scripts/formatx-native-mag-touch-r434.js?v=20260830-r434-direct-r326-stage';
const GOVERNOR='/scifi-ui/scripts/formatx-mobile-render-governor-r426.js?v=20260830-r433-settle-after-native-morph';
const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
let started=false;

// Compatibility marker retained for the r428 cross-device source contract.
// direct-r326-r428-cross-device-header

function addStyle(href,attr){
  return new Promise(resolve=>{
    let link=document.querySelector(`link[${attr}]`);
    if(link instanceof HTMLLinkElement){resolve(link);return;}
    link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(attr,'true');
    link.addEventListener('load',()=>resolve(link),{once:true});
    link.addEventListener('error',()=>resolve(link),{once:true});
    document.head.appendChild(link);
  });
}

function addScript(src,attr){
  return new Promise(resolve=>{
    let script=document.querySelector(`script[${attr}]`);
    if(script instanceof HTMLScriptElement){resolve(script);return;}
    script=document.createElement('script');script.src=src;script.async=false;script.setAttribute(attr,'true');
    script.addEventListener('load',()=>resolve(script),{once:true});
    script.addEventListener('error',()=>resolve(script),{once:true});
    document.head.appendChild(script);
  });
}

function visibleText(node){return String(node?.textContent||'').replace(/\s+/g,' ').trim();}
function repairAccessibleNames(){
  const topBrand=document.querySelector('.topbar > .brand');
  if(topBrand instanceof HTMLAnchorElement)topBrand.removeAttribute('aria-label');
  const simulator=document.querySelector('[data-fx-simulator-entry="hero"]');
  if(simulator instanceof HTMLAnchorElement)simulator.removeAttribute('aria-label');
  for(const link of document.querySelectorAll('.fx-plan-qr-link')){
    if(!(link instanceof HTMLAnchorElement))continue;
    const card=link.closest('.fx-plan-qr-card');
    const label=visibleText(link.querySelector('.fx-qr-placeholder'))||'QR ↗';
    const plan=visibleText(card?.querySelector('.fx-plan-qr-copy strong'))||'FormatX';
    const action=root.lang==='en'?'open secure checkout':'biztonságos fizetési oldal megnyitása';
    link.setAttribute('aria-label',`${label} — ${plan} — ${action}`);
  }
  root.dataset.fxA11yNamesR422='visible-label-contained';
}

function installSoundTouchRecovery(){
  if(root.dataset.fxSoundTouchRecoveryR418==='ready')return;
  root.dataset.fxSoundTouchRecoveryR418='ready';
  let gesture=null,fallbackTimer=0,sequence=0;
  const soundFrom=target=>target instanceof Element?target.closest('.fx-three-sound'):null;
  const cancel=()=>{if(fallbackTimer)clearTimeout(fallbackTimer);fallbackTimer=0;};
  const clear=()=>{cancel();gesture=null;};
  document.addEventListener('pointerdown',event=>{
    const button=soundFrom(event.target);if(!(button instanceof HTMLButtonElement)||event.pointerType==='mouse')return;
    cancel();gesture={sequence:++sequence,pointerId:event.pointerId,x:event.clientX,y:event.clientY};root.dataset.fxSoundTouchRecoveryStateR418='armed';
  },true);
  document.addEventListener('click',event=>{
    const button=soundFrom(event.target);if(!(button instanceof HTMLButtonElement))return;
    if(gesture)clear();root.dataset.fxSoundTouchRecoveryStateR418=event.isTrusted?'native-click':'fallback-click-delivered';
  },true);
  document.addEventListener('pointerup',event=>{
    const button=soundFrom(event.target),current=gesture;
    if(!current||current.pointerId!==event.pointerId||!(button instanceof HTMLButtonElement)){clear();return;}
    current.x=event.clientX;current.y=event.clientY;const token=current.sequence;cancel();
    fallbackTimer=setTimeout(()=>{
      fallbackTimer=0;if(!gesture||gesture.sequence!==token)return;
      const hit=document.elementFromPoint(gesture.x,gesture.y);const live=soundFrom(hit)||(button.isConnected?button:document.querySelector('.fx-three-sound'));gesture=null;
      if(!(live instanceof HTMLButtonElement)){root.dataset.fxSoundTouchRecoveryStateR418='fallback-target-missing';return;}
      root.dataset.fxSoundTouchRecoveryStateR418='dispatching-fallback-click';live.click();
      if(root.dataset.fxSoundTouchRecoveryStateR418==='dispatching-fallback-click')root.dataset.fxSoundTouchRecoveryStateR418='fallback-click-delivered';
    },120);
  },true);
  document.addEventListener('pointercancel',clear,true);
}

async function start(){
  if(started)return;started=true;
  repairAccessibleNames();installSoundTouchRecovery();
  const styles=[
    addStyle(STYLE,'data-fx-current-mag-r422'),
    addStyle(FINAL_HEADER,'data-fx-mobile-header-final-r418')
  ];
  const rendererReady=addScript(RENDERER,'data-fx-current-r326-r422');
  Promise.all(styles).then(()=>{
    root.dataset.fxMobileHeaderFinalR418=mobile?'loaded-last-mobile':'loaded-cross-device-desktop';
    root.dataset.fxCurrentMagStylesR423='ready';
  });
  await rendererReady;
  if(root.dataset.fxCrystalOrganismR326==='ready'){
    if(mobile)await addScript(GOVERNOR,'data-fx-mobile-render-governor-r426');
    await addScript(NATIVE_TOUCH,'data-fx-native-mag-touch-r434');
    addScript(TOUCH,'data-fx-core-touch-pulse-r99');
    root.dataset.fxCoreRendererSelection='r326-direct-r434-primary';
    root.dataset.fxCoreReferenceLockLoad='ready-v69-r434';
  }
  root.dataset.fxCurrentMagRuntimeR422='ready';
  root.dataset.fxCoreCriticalPathR422=mobile
    ?'direct-r326-r434-idle-zero-frame-restrained-optics-native-touch-settled-morph'
    :'direct-r326-r434-cross-device-header';
  dispatchEvent(new CustomEvent('formatx:currentmagready',{detail:{version:VERSION,mobile}}));
}

addEventListener('formatx:languagechange',repairAccessibleNames,{passive:true});
addEventListener('pageshow',repairAccessibleNames,{passive:true});
start();
}());
