/* FormatX r422 — direct-current-core startup.
   The static shell and r326 MAG are the only first-load visual owners. Retired
   recovery/material/signature generations remain available, but mount only after
   explicit user intent. This removes the serialized late CSS/JS cascade that
   repainted the mobile hero and delayed LCP without changing the current MAG. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMotionRuntimeR239)return;

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260829-r422-direct-r326-lcp';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
if(reduced.matches){root.dataset.fxMotionRuntimeR239='reduced-motion-skipped';return;}

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

function ensureStaticMotionCss(){
  if(document.getElementById('fx-r170-mobile-seam-override'))return;
  const stylesheet=document.createElement('link');stylesheet.id='fx-r170-mobile-seam-override';stylesheet.rel='stylesheet';stylesheet.href='./styles/formatx-runtime-static-r243.css?v=20260819-r243-csp';stylesheet.dataset.fxRuntimeStaticR243='true';document.head.appendChild(stylesheet);
  root.dataset.fxMotionCssR243='external-strict-csp-user-intent';
}

function markMobileStaticEnergy(){
  root.dataset.fxLivingEnergyR168='mobile-static-r422';
  root.dataset.fxLivingEnergyClockR168='event-driven-static-r422';
  root.dataset.fxLivingEnergyEffectModeR168='r326-native-heartbeat-r422';
  root.dataset.fxLivingEnergyInteractionR168='idle-living';
  root.dataset.fxMobileEnergyPolicyR271='no-idle-js-raf';
}

function ensureCurrentMag(){
  if(currentRequested||document.querySelector('script[data-fx-current-mag-loader-r422]'))return;
  currentRequested=true;
  const script=document.createElement('script');script.src=CURRENT_MAG;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';document.head.appendChild(script);
  root.dataset.fxMotionRuntimeMobileCoreR313='direct-r326-r422';
  root.dataset.fxMotionRuntimeRequestedR271='1';
}

function scheduleCurrentMag(){
  const request=()=>setTimeout(ensureCurrentMag,0);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',request,{once:true});else request();
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
  root.dataset.fxMotionRuntimeR239='enhanced-r422-user-intent';
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
root.dataset.fxMotionRuntimeR239=mobile.matches?'core-ready-r422-mobile-direct-r326':'core-ready-r422-desktop-direct-r326';
root.dataset.fxCoreCriticalPathR422='armed-direct-r326-no-legacy-material-chain';
scheduleCurrentMag();

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();
}
}());
