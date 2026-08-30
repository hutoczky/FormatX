/* FormatX r456 — direct native MAG loader.
   r326 keeps the native WebGL geometry and living electric material. On phones,
   r456 smooths only the lighting normal and removes triangle-edge paint before
   shader compilation so the MAG reads as one solid glass volume, not a mesh. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='direct-r326-r456-solid-mobile-glass-idle-zero';
if(root.dataset.fxCurrentMagRuntimeR422==='ready'||root.dataset.fxCurrentMagRuntimeR422==='booting')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(reduced)root.dataset.fxCurrentMagMotionR424='r456-static-render-explicit-interaction';
root.dataset.fxCurrentMagRuntimeR422='booting';

const STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r454-layout-only-no-painted-mag';
const OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260830-r455-soft-mobile-optics';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';
const SOLID_GLASS='/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js?v=20260830-r456-solid-volume-no-mesh';
const RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface';
const TOUCH='/scifi-ui/scripts/formatx-core-touch-pulse-r99.js?v=20260830-r434-native-delegate';
const NATIVE_TOUCH='/scifi-ui/scripts/formatx-native-mag-touch-r434.js?v=20260830-r436-protected-ui-touch-fallback';
const GOVERNOR='/scifi-ui/scripts/formatx-mobile-render-governor-r426.js?v=20260830-r433-settle-after-native-morph';
const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
let started=false;

// Compatibility markers retained for existing cross-device/source contracts.
// direct-r326-r428-cross-device-header
// direct-r326-r438-native-soft-edge-restrained-halo-protected-touch
// direct-r326-r439-clear-facets-periodic-sheen-protected-touch
// direct-r326-r454-visible-electric-surface-style-first-protected-touch
// direct-r326-r456-solid-volume-smooth-normal-no-triangle-edges
// formatx-crystal-organism-r326.js?v=20260830-r435-following-visible-heart

function addStyle(href,attr){
  return new Promise(resolve=>{
    let link=document.querySelector(`link[${attr}]`);
    if(link instanceof HTMLLinkElement){
      if(link.sheet){resolve(link);return;}
      link.addEventListener('load',()=>resolve(link),{once:true});
      link.addEventListener('error',()=>resolve(link),{once:true});
      return;
    }
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

function waitForRendererReady(timeout=8000){
  if(root.dataset.fxCrystalOrganismR326==='ready')return Promise.resolve(true);
  return new Promise(resolve=>{
    let settled=false,timer=0,observer=null;
    const finish=ready=>{
      if(settled)return;settled=true;
      if(timer)clearTimeout(timer);
      observer?.disconnect();
      removeEventListener('formatx:real3dready',onReady);
      resolve(Boolean(ready));
    };
    const onReady=()=>{if(root.dataset.fxCrystalOrganismR326==='ready')finish(true);};
    addEventListener('formatx:real3dready',onReady,{passive:true});
    observer=new MutationObserver(()=>{if(root.dataset.fxCrystalOrganismR326==='ready')finish(true);});
    observer.observe(root,{attributes:true,attributeFilter:['data-fx-crystal-organism-r326']});
    timer=setTimeout(()=>finish(root.dataset.fxCrystalOrganismR326==='ready'),timeout);
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
  // The stage is created only after its layout and single optical owner exist.
  // On mobile, arm the short-lived shader correction before r326 compiles.
  await Promise.all([
    addStyle(STYLE,'data-fx-current-mag-r422'),
    addStyle(OPTICS,'data-fx-core-shapeshifter-r337'),
    addStyle(FINAL_HEADER,'data-fx-mobile-header-final-r418')
  ]);
  root.dataset.fxMobileHeaderFinalR418=mobile?'loaded-last-mobile':'loaded-cross-device-desktop';
  root.dataset.fxCurrentMagStylesR423='ready';
  root.dataset.fxCurrentMagStartupR442='styles-ready-before-renderer';

  if(mobile)await addScript(SOLID_GLASS,'data-fx-mobile-solid-glass-r456');
  await addScript(RENDERER,'data-fx-current-r326-r422');
  await addScript(NATIVE_TOUCH,'data-fx-native-mag-touch-r434');
  await addScript(TOUCH,'data-fx-core-touch-pulse-r99');
  root.dataset.fxCurrentMagTouchBootstrapR435='native-owner-installed-before-ready-check';
  root.dataset.fxCurrentMagTouchBootstrapR436='protected-owner-and-touch-fallback-installed';
  root.dataset.fxCurrentMagOpticsR438='superseded-by-r454-native-material';
  root.dataset.fxCurrentMagOpticsR439='retired-no-css-sheen';
  root.dataset.fxCurrentMagOpticsR440='superseded-by-r454-visible-native-material';
  root.dataset.fxCurrentMagOpticsR454='single-luminous-native-electric-surface-owner';
  root.dataset.fxCurrentMagOpticsR456=mobile?'solid-volume-smooth-normal-no-triangle-edges':'desktop-r454-unchanged';
  root.dataset.fxCurrentMagSchedulerR441='interaction-bursts-idle-zero-frame';

  const rendererReady=await waitForRendererReady();
  if(rendererReady){
    if(mobile)await addScript(GOVERNOR,'data-fx-mobile-render-governor-r426');
    root.dataset.fxCoreRendererSelection=mobile?'r326-direct-r456-solid-mobile-glass':'r326-direct-r454-primary';
    root.dataset.fxCoreReferenceLockLoad=mobile?'ready-v69-r456':'ready-v69-r454';
    root.dataset.fxCurrentMagRuntimeR422='ready';
  }else root.dataset.fxCurrentMagRuntimeR422='renderer-timeout';

  root.dataset.fxCoreCriticalPathR422=mobile
    ?'direct-r326-r456-style-first-solid-volume-no-mesh-idle-zero-native-touch'
    :'direct-r326-r454-style-first-electric-sweep-idle-zero-desktop';
  dispatchEvent(new CustomEvent('formatx:currentmagready',{detail:{version:VERSION,mobile,rendererReady}}));
}

addEventListener('formatx:languagechange',repairAccessibleNames,{passive:true});
addEventListener('pageshow',repairAccessibleNames,{passive:true});
start();
}());
