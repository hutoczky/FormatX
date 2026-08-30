/* FormatX r454 — current language, layout and native WebGL MAG critical path.
   One shader owns the MAG optics and its intermittent surface caustic. Retired
   recovery/material generations remain user-intent only. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMotionRuntimeR239)return;

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const LANGUAGE_TOGGLE='/scifi-ui/scripts/single-language-toggle.js?v=20260830-r429-initial-cross-device-header';
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260830-r455-soft-mobile-optics';
const CURRENT_RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface';
const CURRENT_STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r454-layout-a11y-touch';
const CURRENT_OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260830-r455-soft-mobile-optics';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
if(reduced.matches)root.dataset.fxMotionRuntimeR239='reduced-motion-static-core-r454';

const specs=Array.from(template.content.querySelectorAll('script[src]'));
const deferred=[];
const mounted=new Set();
const passive={passive:true};
const intentListeners=[['pointerdown',passive],['touchstart',passive],['wheel',passive],['scroll',passive],['keydown',false]];
let enhancementsStarted=false,currentRequested=false,languageRequested=false;

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

function warmCriticalOwners(){
  if(root.dataset.fxCurrentMagWarmR423==='ready')return;
  root.dataset.fxCurrentMagWarmR423='ready';
  warmAsset(LANGUAGE_TOGGLE,'script');
  warmAsset(CURRENT_MAG,'script');
  warmAsset(CURRENT_RENDERER,'script');
  warmAsset(CURRENT_STYLE,'style');
  warmAsset(CURRENT_OPTICS,'style');
  warmAsset(FINAL_HEADER,'style');
  root.dataset.fxLanguageCriticalWarmR429='ready';
}

function ensureLanguageToggle(){
  if(root.dataset.fxSingleLanguageToggle==='ready'&&root.dataset.fxSingleLanguageToggleVersion==='6'){
    root.dataset.fxLanguageCriticalPathR429='already-ready';
    return;
  }
  if(languageRequested||document.querySelector('script[data-fx-critical-language-r429]'))return;
  languageRequested=true;
  const script=document.createElement('script');
  script.src=LANGUAGE_TOGGLE;
  script.async=false;
  script.dataset.fxCriticalLanguageR429='true';
  script.addEventListener('load',()=>{
    root.dataset.fxLanguageCriticalPathR429=root.dataset.fxSingleLanguageToggle==='ready'
      ?'ready-initial-shell'
      :'loaded-awaiting-install';
  },{once:true});
  script.addEventListener('error',()=>{root.dataset.fxLanguageCriticalPathR429='failed';},{once:true});
  document.head.appendChild(script);
  root.dataset.fxLanguageCriticalPathR429='requested-initial-shell';
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
  root.dataset.fxMotionRuntimeMobileCoreR313='direct-r326-r429-prewarmed';
  root.dataset.fxMotionRuntimeRequestedR271='1';
}

function scheduleCriticalOwners(){
  warmCriticalOwners();
  // This module is already deferred by the page shell. Both controls can mount
  // immediately against the parsed topbar/hero instead of waiting for immersive
  // activation or another DOMContentLoaded task.
  ensureLanguageToggle();
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
  root.dataset.fxMotionRuntimeR239='enhanced-r429-user-intent';
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
root.dataset.fxMotionRuntimeR239=mobile.matches?'core-ready-r454-mobile-prewarmed-r326':'core-ready-r454-desktop-prewarmed-r326';
root.dataset.fxCoreCriticalPathR422='armed-direct-r326-r454-prewarmed';
scheduleCriticalOwners();

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();
}
}());
