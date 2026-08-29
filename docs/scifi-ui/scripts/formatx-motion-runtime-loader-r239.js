/* FormatX r423 — direct-current-core startup with critical-path warming.
   The static shell and r326 MAG are the only first-load visual owners. Retired
   recovery/material/signature generations remain available, but mount only after
   explicit user intent. The current MAG assets are warmed as soon as this loader
   executes so slow mobile networks do not turn the renderer into a late LCP. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMotionRuntimeR239)return;

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260829-r426-mobile-idle-governor&rev=20260829-r425-balanced-mobile-optics';
const CURRENT_RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260829-r424-sharp-organic-core';
const CURRENT_STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260829-r422-direct-r326-lcp&rev=20260829-r425-balanced-mobile-optics';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260828-r418-final-owner';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
if(reduced.matches)root.dataset.fxMotionRuntimeR239='reduced-motion-static-core-r424';

const specs=Array.from(template.content.querySelectorAll('script[src]'));
const deferred=[];
const mounted=new Set();
const passive={passive:true};
const intentListeners=[['pointerdown',passive],['touchstart',passive],['wheel',passive],['scroll',passive],['keydown',false]];
let enhancementsStarted=false,currentRequested=false;

function srcOf(spec){return String(spec.getAttribute('src')||'');}
function isLegacyLivingEnergy(spec){return /\/formatx-living-energy-r168\.js(?:\?|$)/.test(srcOf(spec));}
function isRetiredCoreBootstrap(spec){return /\/formatx-core-real3d-v20\.js(?:\?|$)/.test(srcOf(spec));}

function mount(spec){
  const raw=srcOf(spec);if(!raw)return false;
  const absolute=new URL(raw,document.baseURI).href;
  if(mounted.has(absolute)||Array.from(document.scripts).some(script=>script.src===absolute))return false;
  mounted.add(absolute);
  const script=document.createElement('script');script.async=false;
  for(const attribute of spec.attributes){if(attribute.name==='defer'||attribute.name==='src')continue;script.setAttribute(attribute.name,attribute.value);}
  script.src=raw;document.head.appendChild(script);return true;
}

function warmAsset(href,as){
  const absolute=new URL(href,document.baseURI).href;
  const existing=Array.from(document.querySelectorAll('link[rel="preload"]')).find(link=>link.href===absolute&&link.as===as);
  if(existing)return;
  const preload=document.createElement('link');
  preload.rel='preload';
  preload.as=as;
  preload.href=href;
  preload.fetchPriority='high';
  preload.dataset.fxR423CriticalWarm='true';
  document.head.appendChild(preload);
}

function warmCurrentMag(){
  if(root.dataset.fxCurrentMagWarmR423==='ready')return;
  root.dataset.fxCurrentMagWarmR423='ready';
  warmAsset(CURRENT_MAG,'script');
  warmAsset(CURRENT_RENDERER,'script');
  warmAsset(CURRENT_STYLE,'style');
  if(mobile.matches)warmAsset(FINAL_HEADER,'style');
}

function ensureStaticMotionCss(){
  if(document.getElementById('fx-r170-mobile-seam-override'))return;
  const stylesheet=document.createElement('link');stylesheet.id='fx-r170-mobile-seam-override';stylesheet.rel='stylesheet';stylesheet.href='./styles/formatx-runtime-static-r243.css?v=20260819-r243-csp';stylesheet.dataset.fxRuntimeStaticR243='true';document.head.appendChild(stylesheet);
  root.dataset.fxMotionCssR243='external-strict-csp-user-intent';
}

function markMobileStaticEnergy(){
  root.dataset.fxLivingEnergyR168='mobile-static-r423';
  root.dataset.fxLivingEnergyClockR168='event-driven-static-r423';
  root.dataset.fxLivingEnergyEffectModeR168='r326-native-heartbeat-r423';
  root.dataset.fxLivingEnergyInteractionR168='idle-living';
  root.dataset.fxMobileEnergyPolicyR271='no-idle-js-raf';
}

function ensureCurrentMag(){
  if(currentRequested||document.querySelector('script[data-fx-current-mag-loader-r422]'))return;
  currentRequested=true;
  const script=document.createElement('script');script.src=CURRENT_MAG;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';document.head.appendChild(script);
  root.dataset.fxMotionRuntimeMobileCoreR313='direct-r326-r423-prewarmed';
  root.dataset.fxMotionRuntimeRequestedR271='1';
}

function scheduleCurrentMag(){
  warmCurrentMag();
  // This module is already deferred by the page shell. Waiting for another
  // DOMContentLoaded task added one full slow-network RTT before the r326 request.
  // Mount now; the renderer itself only touches the already-reserved hero-space.
  ensureCurrentMag();
}

function reservedInteraction(event){
  if(root.dataset.fxOrganismThought==='open')return true;
  const target=event?.target instanceof Element?event.target:null;
  return Boolean(target?.closest('.fx-organism-dialogue,.fx-reference-ask,.fx-reference-pause,.fx-three-sound,#menu-toggle,.fx-language-toggle,.fx-reference-mag-button'));
}
function disarm(){for(const [type,options] of intentListeners)removeEventListener(type,onIntent,options);}
function mountEnhancements(){
  if(enhancementsStarted)return;enhancementsStarted=true;disarm();ensureStaticMotionCss();
  let requested=0;for(const spec of deferred)if(mount(spec))requested+=1;
  root.dataset.fxMotionRuntimeDeferredRequestedR284=String(requested);
  root.dataset.fxMotionRuntimeR239='enhanced-r423-user-intent';
}
function onIntent(event){if(reservedInteraction(event))return;mountEnhancements();}

let skippedEnergy=0,retiredCore=0;
for(const spec of specs){
  if(isRetiredCoreBootstrap(spec)){retiredCore+=1;continue;}
  if(mobile.matches&&isLegacyLivingEnergy(spec)){skippedEnergy+=1;markMobileStaticEnergy();continue;}
  deferred.push(spec);
}

root.dataset.fxMotionRuntimeRequestedR271='0';
root.dataset.fxMotionRuntimeMobileEnergySkippedR271=String(skippedEnergy);
root.dataset.fxMotionRuntimeDeferredCountR284=String(deferred.length);
root.dataset.fxMotionRuntimeRetiredCoreSkippedR422=String(retiredCore);
root.dataset.fxMotionRuntimeR239=mobile.matches?'core-ready-r423-mobile-prewarmed-r326':'core-ready-r423-desktop-prewarmed-r326';
root.dataset.fxCoreCriticalPathR422='armed-direct-r326-r423-prewarmed';
scheduleCurrentMag();

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();
}
}());
