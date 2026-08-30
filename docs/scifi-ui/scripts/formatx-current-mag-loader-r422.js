/* FormatX r465 — direct native MAG + persistent Mini MAG loader.
   R326 remains the only full-size hero WebGL organism. R465 softens mobile
   perimeter/bloom and freezes the painted canvas without pause-event redraws;
   desktop material/behaviour remains unchanged. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='direct-r326-r465-soft-optics-no-idle-redraw';
if(root.dataset.fxCurrentMagRuntimeR422==='ready'||root.dataset.fxCurrentMagRuntimeR422==='booting')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(reduced)root.dataset.fxCurrentMagMotionR424='r465-static-render-explicit-interaction';
root.dataset.fxCurrentMagRuntimeR422='booting';

const STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r454-layout-only-no-painted-mag';
const OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260831-r465-soft-perimeter-low-bloom';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';
const MINI_STYLE='/scifi-ui/styles/formatx-mini-mag-assistant-r459.css?v=20260830-r459-persistent-site-controller';
const MINI_ASSISTANT='/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js?v=20260830-r460-hero-controller-bridge';
const SOLID_GLASS='/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js?v=20260831-r465-soft-perimeter-low-bloom';
const RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface';
const TOUCH='/scifi-ui/scripts/formatx-core-touch-pulse-r99.js?v=20260830-r434-native-delegate';
const NATIVE_TOUCH='/scifi-ui/scripts/formatx-native-mag-touch-r434.js?v=20260830-r460-controller-tap-drag-safe';
const GOVERNOR='/scifi-ui/scripts/formatx-mobile-render-governor-r426.js?v=20260831-r465-direct-pause-flag-no-redraw';
const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
let started=false;

const LEGACY_STAGE_SELECTOR=[
  '#hero .fx-core-mobile-v55-stage',
  '#hero .fx-core-r112-stage',
  '#hero .fx-core-mesh3d-stage',
  '#hero .fx-core-fracture3d-stage',
  '#hero .fx-core-reference-v53-stage',
  '#hero .fx-core-mobile-v54-stage',
  '#hero .fx-resilient-core',
  '#hero .fx-premium-core-status',
  '#hero .fx-three-stage-shell',
  '#hero .fx-transcend-shell[data-fx-native-apex="true"]'
].join(',');

// Compatibility markers retained for cross-device/source contracts.
// direct-r326-r454-visible-electric-surface-style-first-protected-touch
// direct-r326-r456-uniform-solid-glass-no-vram-artifact
// direct-r326-r458-restrained-mobile-nucleus-soft-fresnel-rim
// direct-r326-r459-persistent-mini-mag-site-controller
// direct-r326-r460-primary-controller-clean-runtime
// direct-r326-r463-award-mobile-optics-strict-tbt
// direct-r326-r463-optics-r464-explicit-interaction-tbt
// direct-r326-r465-soft-optics-no-idle-redraw

function cleanupLegacyMagRuntime(){
  let removedStages=0;
  for(const node of document.querySelectorAll(LEGACY_STAGE_SELECTOR)){
    if(node.classList?.contains('fx-crystal-organism-r326-stage'))continue;
    node.remove();
    removedStages+=1;
  }
  root.dataset.fxLegacyMagDomCleanupR460='ready';
  root.dataset.fxLegacyMagDomRemovedR460=String(removedStages);
  root.dataset.fxPrimaryMagOwnerR460='r326-only';
}

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
  cleanupLegacyMagRuntime();
  repairAccessibleNames();installSoundTouchRecovery();
  await Promise.all([
    addStyle(STYLE,'data-fx-current-mag-r422'),
    addStyle(OPTICS,'data-fx-core-shapeshifter-r337'),
    addStyle(FINAL_HEADER,'data-fx-mobile-header-final-r418'),
    addStyle(MINI_STYLE,'data-fx-mini-mag-assistant-r459')
  ]);
  root.dataset.fxMobileHeaderFinalR418=mobile?'loaded-last-mobile':'loaded-cross-device-desktop';
  root.dataset.fxCurrentMagStylesR423='ready';
  root.dataset.fxCurrentMagStartupR442='styles-ready-before-renderer';
  root.dataset.fxCurrentMagOpticsR458='superseded-by-r465-soft-perimeter';
  root.dataset.fxCurrentMagOpticsR460=mobile?'superseded-by-r465-soft-perimeter':'desktop-optics-unchanged';
  root.dataset.fxCurrentMagOpticsR463=mobile?'superseded-by-r465-soft-perimeter':'desktop-optics-unchanged';
  root.dataset.fxCurrentMagOpticsR465=mobile?'soft-perimeter-low-bloom-low-cost-shader':'desktop-optics-unchanged';
  root.dataset.fxCurrentMagSchedulerR465=mobile?'direct-pause-flag-no-idle-redraw':'desktop-native-scheduler';
  root.dataset.fxMiniMagBootstrapR459='requested-alongside-primary-mag';
  void addScript(MINI_ASSISTANT,'data-fx-mini-mag-assistant-script-r459');

  await addScript(SOLID_GLASS,'data-fx-solid-glass-r456');
  await addScript(RENDERER,'data-fx-current-r326-r422');
  await addScript(NATIVE_TOUCH,'data-fx-native-mag-touch-r434');
  await addScript(TOUCH,'data-fx-core-touch-pulse-r99');
  root.dataset.fxCurrentMagTouchBootstrapR435='native-owner-installed-before-ready-check';
  root.dataset.fxCurrentMagTouchBootstrapR436='protected-owner-controller-tap-and-touch-fallback-installed';
  root.dataset.fxCurrentMagOpticsR454='single-luminous-native-electric-surface-owner';
  root.dataset.fxCurrentMagOpticsR456='uniform-solid-glass-shell-no-vram-artifact';
  root.dataset.fxCurrentMagSchedulerR441='interaction-bursts-idle-zero-frame';

  const rendererReady=await waitForRendererReady();
  if(rendererReady){
    if(mobile)await addScript(GOVERNOR,'data-fx-mobile-render-governor-r426');
    root.dataset.fxCoreRendererSelection=mobile?'r326-direct-r465-soft-optics-no-idle-redraw':'r326-direct-r460-desktop-glass';
    root.dataset.fxCoreReferenceLockLoad='ready-v69-r465';
    root.dataset.fxCurrentMagRuntimeR422='ready';
  }else root.dataset.fxCurrentMagRuntimeR422='renderer-timeout';

  root.dataset.fxCoreCriticalPathR422=mobile
    ?'direct-r326-r465-soft-optics-no-idle-redraw-native-touch'
    :'direct-r326-r460-primary-controller-desktop';
  dispatchEvent(new CustomEvent('formatx:currentmagready',{detail:{version:VERSION,mobile,rendererReady,miniMag:true,legacyCleanup:true}}));
}

addEventListener('formatx:languagechange',repairAccessibleNames,{passive:true});
addEventListener('pageshow',repairAccessibleNames,{passive:true});
start();
}());