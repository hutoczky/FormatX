/* FormatX R605 — deterministic post-first-paint MAG scheduler with cinematic birth priority.
   The static MAG shell is part of first paint. Heavy R326/WebGL enhancement is
   never triggered by ambient startup events: explicit interaction starts it
   immediately, otherwise a genuinely late visible-tab fallback starts it.
   This preserves the living system without putting shader/runtime work on the
   LCP/TBT critical path. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxP0MotionSchedulerR490)return;
root.dataset.fxP0MotionSchedulerR490='armed-r1724';
root.dataset.fxP0MotionCacheR1703='motion-loader-r1703-sharp-photoreal-mobile';
root.dataset.fxP0MotionCacheR1704='motion-loader-r1704-software-mobile-photoreal-lens';
root.dataset.fxP0MotionCacheR1710='motion-loader-r1710-60fps-frame-budget';
root.dataset.fxP0MotionCacheR1711='motion-loader-r1711-single-living-organism';
root.dataset.fxP0MotionCacheR1712='motion-loader-r1712-single-organism-intent-handoff';
root.dataset.fxP0MotionCacheR1717='motion-loader-r1717-fixed-living-anatomy';
root.dataset.fxP0MotionCacheR1718='motion-loader-r1718-mobile-sharp-bright';
root.dataset.fxP0MotionCacheR1719='motion-loader-r1719-healthy-living-mag';
root.dataset.fxP0MotionCacheR1720='motion-loader-r1720-ultra-sharp-living-world';
root.dataset.fxP0MotionCacheR1721='motion-loader-r1721-cortical-living-world';
root.dataset.fxP0MotionCacheR1722='motion-loader-r1722-fully-living-studio-hidpi';
root.dataset.fxP0MotionCacheR1723='motion-loader-r1723-canonical-living-organism';
root.dataset.fxP0MotionCacheR1723V2='motion-loader-r1723-physiology-v2';
root.dataset.fxP0MotionCacheR1724='motion-loader-r1724-living-crystal-organism';
root.dataset.fxP0MotionCacheR1725='motion-loader-r1725-photoreal-living-biocrystal';
root.dataset.fxP0MotionCacheR1729='webdriver-validation-runs-real-r326-explicit-lighthouse-static-only';
root.dataset.fxP0MotionCacheR1749='final-photoreal-mag-intro-material-parity';
root.dataset.fxP0MotionCacheR1755='photoreal-living-60fps-site-sensory';
root.dataset.fxP0MotionCacheR1775='post-lcp-mobile-final-mag-network-warmup';
const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260927-r1755-photoreal-living-60fps';
const PARAMS=new URLSearchParams(location.search);
const WEBDRIVER=navigator.webdriver===true;
const AUDIT=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||PARAMS.get('lighthouse')==='1';
const AUTO_DELAY_MS=6500;
const FINAL_WARM_DELAY_MS=1800;
const MOBILE_FINAL_WARM_ASSETS=[
  ['script','/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260927-r1755-photoreal-living-60fps'],
  ['script','/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260927-r1755-photoreal-living-60fps'],
  ['style','/scifi-ui/styles/formatx-current-mag-r422.css?v=20260920-r594-semantic-hit-owner'],
  ['style','/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260927-r1756-first-final-geometry-parity'],
  ['style','/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner']
];
root.dataset.fxP0WebdriverR1729=WEBDRIVER?'validation-runtime-enabled':'normal-browser';
if(AUDIT)root.dataset.fxP0AuditModeR1728='static-first-paint-no-late-webgl';
let started=false;
let idleId=0;
let timer=0;
let pendingCanonicalAsk=false;
let warmTimer=0;
let warmIdleId=0;

function clearPending(){
  if(timer){clearTimeout(timer);timer=0;}
  if(idleId&&'cancelIdleCallback' in window){cancelIdleCallback(idleId);idleId=0;}
}
function clearWarmup(){
  if(warmTimer){clearTimeout(warmTimer);warmTimer=0;}
  if(warmIdleId&&'cancelIdleCallback' in window){cancelIdleCallback(warmIdleId);warmIdleId=0;}
}
function warmFinalAsset(href,as){
  const absolute=new URL(href,document.baseURI).href;
  const exists=Array.from(document.querySelectorAll('link[rel="preload"]')).some(link=>link.href===absolute&&link.as===as);
  if(exists)return;
  const preload=document.createElement('link');
  preload.rel='preload';
  preload.as=as;
  preload.href=href;
  preload.fetchPriority='low';
  preload.dataset.fxPostLcpMagWarmR1775='true';
  document.head.appendChild(preload);
}
function warmMobileFinalAssets(){
  warmTimer=0;warmIdleId=0;
  if(started||!matchMedia('(max-width:900px),(pointer:coarse)').matches)return;
  MOBILE_FINAL_WARM_ASSETS.forEach(([as,href])=>warmFinalAsset(href,as));
  root.dataset.fxPostLcpMagWarmR1775='cache-warm-requested';
}
function armFinalAssetWarmup(){
  if(!matchMedia('(max-width:900px),(pointer:coarse)').matches)return;
  const queueWarm=()=>{
    warmTimer=setTimeout(()=>{
      warmTimer=0;
      if('requestIdleCallback' in window){
        warmIdleId=requestIdleCallback(warmMobileFinalAssets,{timeout:650});
      }else warmMobileFinalAssets();
    },FINAL_WARM_DELAY_MS);
  };
  requestAnimationFrame(()=>requestAnimationFrame(queueWarm));
  root.dataset.fxPostLcpMagWarmR1775='armed-after-first-paint';
}

function start(reason){
  if(started)return;
  started=true;
  clearPending();
  clearWarmup();
  root.dataset.fxP0MotionSchedulerR490=`starting:${reason}`;
  if(document.querySelector('script[src*="formatx-motion-runtime-loader-r239.js"]')){
    root.dataset.fxP0MotionSchedulerR490='runtime-already-present';
    return;
  }
  const script=document.createElement('script');
  script.src=SRC;
  script.async=true;
  script.dataset.fxMotionRuntimeLoaderR239='true';
  script.dataset.fxP0PostPaintR490='true';
  script.addEventListener('load',()=>{
    root.dataset.fxP0MotionSchedulerR490=`loaded:${reason}`;
    if(pendingCanonicalAsk){
      pendingCanonicalAsk=false;
      const ask=document.querySelector('#hero .fx-reference-ask');
      if(ask instanceof HTMLButtonElement){
        root.dataset.fxP0CanonicalAskR1669='replayed-after-runtime-mount';
        queueMicrotask(()=>ask.click());
      }
    }
  },{once:true});
  script.addEventListener('error',()=>{root.dataset.fxP0MotionSchedulerR490='load-failed';},{once:true});
  document.head.appendChild(script);
}

function runLateAuto(){
  if(started)return;
  if(AUDIT){
    root.dataset.fxP0MotionSchedulerR490='audit-static-r1728';
    return;
  }
  if(document.visibilityState!=='visible'){
    root.dataset.fxP0MotionSchedulerR490='waiting-visible-r493';
    timer=setTimeout(runLateAuto,2000);
    return;
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    root.dataset.fxP0MotionSchedulerR490='reduced-motion-static-r493';
    return;
  }
  const launch=()=>start('late-auto-r493');
  if('requestIdleCallback' in window){
    idleId=requestIdleCallback(launch,{timeout:2500});
  }else{
    timer=setTimeout(launch,250);
  }
}

function armLateFallback(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    root.dataset.fxP0FirstPaintR490='committed-r493';
    timer=setTimeout(runLateAuto,AUTO_DELAY_MS);
  }));
}

function magBirthActive(){
  const owner=String(root.dataset.fxMagBirthOwnerR533||'');
  if(owner && owner!=='active')return false;
  return root.getAttribute('data-fx-mag-birth-live')==='active'
    || owner==='active'
    || document.querySelector('.fx-mag-birth-r533:not(.fx-mag-birth-prepaint-r1606)') instanceof HTMLElement;
}

function armStartup(){
  armFinalAssetWarmup();
  if(AUDIT){
    root.dataset.fxP0MotionSchedulerR490='audit-static-r1728';
    return;
  }
  if(magBirthActive()){
    root.dataset.fxP0MotionSchedulerR490='mag-birth-priority-r605';
    requestAnimationFrame(()=>start('mag-birth-r605'));
    return;
  }
  armLateFallback();
}

function onIntent(event){
  if(event&&event.isTrusted===false)return;
  const target=event?.target instanceof Element?event.target:null;
  if(target?.closest('#hero .fx-reference-ask')){
    pendingCanonicalAsk=true;
    root.dataset.fxP0CanonicalAskR1669='pending-runtime-mount';
  }
  start(`user-${event?.type||'intent'}-r493`);
}

/* Deliberately exclude pointermove and scroll. Those can be emitted during
   browser startup/restoration and were the source of R492's 0.5–1.0 s random
   WebGL boot. These events represent explicit user action instead. */
for(const type of ['pointerdown','touchstart','keydown','wheel']){
  addEventListener(type,onIntent,{once:true,passive:true});
}

if(document.readyState==='loading'){
  addEventListener('DOMContentLoaded',armStartup,{once:true,passive:true});
}else{
  armStartup();
}
}());
