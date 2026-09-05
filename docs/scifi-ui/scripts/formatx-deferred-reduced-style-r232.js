/* FormatX r455/R531 — CSP-safe mobile geometry seed + reduced-motion critical visibility bootstrap. */
(function(){
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stub=document.querySelector('link[data-fx-critical-reduced-r228]');
const FULL_URL='./styles/formatx-critical-reduced-full-r298.css?v=20260822-r299-reduced-only';
const REDUCED_STUB_URL='./styles/formatx-critical-reduced-r228.css?v=20260905-r531-reduced-mag-visible';
const MOBILE_FIRST_PAINT_URL='./styles/formatx-mobile-first-paint-r358.css?v=20260830-r455-csp-safe-geometry-seed';

function seedMobileGeometry(){
  let firstPaint=document.querySelector('link[data-fx-mobile-first-paint-r358]');
  if(!(firstPaint instanceof HTMLLinkElement)){
    firstPaint=document.createElement('link');
    firstPaint.rel='stylesheet';
    firstPaint.href=MOBILE_FIRST_PAINT_URL;
    firstPaint.media='all';
    firstPaint.fetchPriority='high';
    firstPaint.dataset.fxMobileFirstPaintR358='true';
    firstPaint.addEventListener('load',()=>{
      root.dataset.fxMobileFirstPaintR358='ready';
      root.dataset.fxMobileGeometrySeedR453='ready-external-css-csp-safe';
    },{once:true});
    firstPaint.addEventListener('error',()=>{
      root.dataset.fxMobileFirstPaintR358='load-failed';
      root.dataset.fxMobileGeometrySeedR453='external-css-load-failed';
    },{once:true});
    const critical=document.querySelector('link[data-fx-critical-core-r227]');
    if(critical?.parentNode)critical.parentNode.insertBefore(firstPaint,critical.nextSibling);
    else (document.head||document.documentElement).appendChild(firstPaint);
    root.dataset.fxMobileFirstPaintR358='loading';
  }else{
    root.dataset.fxMobileFirstPaintR358=firstPaint.sheet?'ready':'loading';
    root.dataset.fxMobileGeometrySeedR453='ready-external-css-csp-safe';
  }
}

if(!reduced.matches){
  const mobileDirect=matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;
  if(mobileDirect){
    seedMobileGeometry();

    /* R531: this bootstrap owns mobile geometry only. The Event Horizon runtime
       is the sole owner of the short preloader overlay lifecycle, so this early
       path must not hide or release #formatx-event-horizon. */
    root.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro='mobile-direct-early-r455';
    root.dataset.fxIntroStrategy='mobile-direct-zero-shift-csp-safe-r455';
  }
  root.dataset.fxReducedStyleR233='not-required-no-full-fetch-r455';
  return;
}

/* R531: reduced-motion still has a visible, automatically initialized MAG.
   Activate only the tiny critical visibility layer immediately; the historical
   full reduced payload remains interaction-gated to keep startup inexpensive. */
if(stub instanceof HTMLLinkElement){
  stub.href=REDUCED_STUB_URL;
  stub.media='all';
  stub.fetchPriority='high';
  root.dataset.fxReducedMagSurfaceR531='critical-visible-loading';
  stub.addEventListener('load',()=>{
    root.dataset.fxReducedMagSurfaceR531='critical-visible-ready';
    if(root.dataset.fxReducedStyleR233==='armed-no-full-fetch-r299')root.dataset.fxReducedStyleR233='armed-critical-visible-r531';
  },{once:true});
  stub.addEventListener('error',()=>{root.dataset.fxReducedMagSurfaceR531='critical-visible-load-failed';},{once:true});
}

let active=false;
function activate(){
  if(active)return;
  active=true;
  let full=document.querySelector('link[data-fx-critical-reduced-full-r299]');
  if(!(full instanceof HTMLLinkElement)){
    full=document.createElement('link');
    full.rel='stylesheet';
    full.href=FULL_URL;
    full.media='all';
    full.dataset.fxCriticalReducedFullR299='true';
    full.addEventListener('load',()=>{root.dataset.fxReducedStyleR233='activated-on-user-intent-r299';},{once:true});
    full.addEventListener('error',()=>{root.dataset.fxReducedStyleR233='full-style-load-failed';},{once:true});
    document.head.appendChild(full);
  }else{
    root.dataset.fxReducedStyleR233='activated-on-user-intent-r299';
  }
  for(const [type,opts] of listeners)removeEventListener(type,activate,opts);
}

const passive={passive:true};
const listeners=[['wheel',passive],['touchstart',passive],['pointerdown',passive],['scroll',passive],['keydown',false]];
for(const [type,opts] of listeners)addEventListener(type,activate,opts);
if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')activate();
else root.dataset.fxReducedStyleR233=stub instanceof HTMLLinkElement?'armed-critical-visible-r531':'armed-no-full-fetch-r299';
}());

/* deploy-ready-r455-csp-safe-mobile-geometry-r531-overlay-owner */
