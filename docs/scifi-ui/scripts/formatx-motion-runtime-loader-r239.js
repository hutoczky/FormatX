/* FormatX r460 — current R326 MAG + R459 controller production path.
   Superseded MAG renderers/effect owners are removed from the active runtime
   template instead of being revived on first user interaction. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMotionRuntimeR239)return;

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const LANGUAGE_TOGGLE='/scifi-ui/scripts/single-language-toggle.js?v=20260830-r461-static-owner';
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260830-r460-primary-controller-clean-runtime';
const CURRENT_SOLID_GLASS='/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js?v=20260830-r460-soft-mobile-optics';
const CURRENT_RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface';
const CURRENT_STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r454-layout-a11y-touch';
const CURRENT_OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260830-r460-soft-mobile-rim';
const MINI_ASSISTANT='/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js?v=20260830-r460-hero-controller-bridge';
const MINI_STYLE='/scifi-ui/styles/formatx-mini-mag-assistant-r459.css?v=20260830-r459-persistent-site-controller';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
if(reduced.matches)root.dataset.fxMotionRuntimeR239='reduced-motion-static-core-r460';

const specs=Array.from(template.content.querySelectorAll('script[src]'));
const deferred=[];
const mounted=new Set();
const passive={passive:true};
const intentListeners=[['pointerdown',passive],['touchstart',passive],['wheel',passive],['scroll',passive],['keydown',false]];
let enhancementsStarted=false,currentRequested=false,languageRequested=false;

function srcOf(spec){return String(spec.getAttribute('src')||'');}
function isRetiredCoreBootstrap(spec){return /\/formatx-core-real3d-v20\.js(?:\?|$)/.test(srcOf(spec));}
function isLegacyLivingEnergy(spec){return /\/formatx-living-energy-r168\.js(?:\?|$)/.test(srcOf(spec));}
function isRetiredMagRuntime(spec){
  return /\/(?:formatx-premium-finish|formatx-live-heartbeat-r155|formatx-signature-system-r185|formatx-seamless-enforcer-r159|formatx-living-energy-r168|formatx-desktop-apex-loader-r224)\.js(?:\?|$)/.test(srcOf(spec));
}

function retireLegacyStyleLinks(){
  let removed=0;
  for(const link of document.querySelectorAll('link[data-fx-living-energy-r168],link[data-fx-desktop-apex-r181]')){
    link.remove();
    removed+=1;
  }
  root.dataset.fxLegacyMagStyleCleanupR460='ready';
  root.dataset.fxLegacyMagStylesRemovedR460=String(removed);
}

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
  preload.rel='preload';preload.as=as;preload.href=href;preload.fetchPriority='high';
  preload.dataset.fxR423CriticalWarm='true';document.head.appendChild(preload);
}

function warmCriticalOwners(){
  if(root.dataset.fxCurrentMagWarmR423==='ready')return;
  root.dataset.fxCurrentMagWarmR423='ready';
  warmAsset(LANGUAGE_TOGGLE,'script');
  warmAsset(CURRENT_MAG,'script');
  warmAsset(CURRENT_SOLID_GLASS,'script');
  warmAsset(CURRENT_RENDERER,'script');
  warmAsset(CURRENT_STYLE,'style');
  warmAsset(CURRENT_OPTICS,'style');
  warmAsset(MINI_ASSISTANT,'script');
  warmAsset(MINI_STYLE,'style');
  warmAsset(FINAL_HEADER,'style');
  root.dataset.fxLanguageCriticalWarmR429='ready';
  root.dataset.fxSolidGlassCriticalWarmR456='ready-all-devices';
  root.dataset.fxCurrentMagOpticsWarmR458='superseded-by-r460-soft-mobile-optics';
  root.dataset.fxCurrentMagOpticsWarmR460='ready-soft-mobile-rim';
  root.dataset.fxMiniMagWarmR459='ready-persistent-site-controller';
}

function ensureLanguageToggle(){
  if(root.dataset.fxSingleLanguageToggle==='ready'&&root.dataset.fxSingleLanguageToggleVersion==='7'){
    root.dataset.fxLanguageCriticalPathR429='already-ready';return;
  }
  if(languageRequested||document.querySelector('script[data-fx-critical-language-r429]'))return;
  languageRequested=true;
  const script=document.createElement('script');script.src=LANGUAGE_TOGGLE;script.async=false;script.dataset.fxCriticalLanguageR429='true';
  script.addEventListener('load',()=>{
    root.dataset.fxLanguageCriticalPathR429=root.dataset.fxSingleLanguageToggle==='ready'?'ready-initial-shell':'loaded-awaiting-install';
  },{once:true});
  script.addEventListener('error',()=>{root.dataset.fxLanguageCriticalPathR429='failed';},{once:true});
  document.head.appendChild(script);root.dataset.fxLanguageCriticalPathR429='requested-initial-shell';
}

function ensureStaticMotionCss(){
  if(document.getElementById('fx-r170-mobile-seam-override'))return;
  const stylesheet=document.createElement('link');stylesheet.id='fx-r170-mobile-seam-override';stylesheet.rel='stylesheet';stylesheet.href='./styles/formatx-runtime-static-r243.css?v=20260819-r243-csp';stylesheet.dataset.fxRuntimeStaticR243='true';document.head.appendChild(stylesheet);
  root.dataset.fxMotionCssR243='external-strict-csp-user-intent';
}

function markMobileStaticEnergy(){
  root.dataset.fxLivingEnergyR168='retired-r460-r326-native-owner';
  root.dataset.fxLivingEnergyClockR168='retired-no-idle-js-raf-r460';
  root.dataset.fxLivingEnergyEffectModeR168='r326-native-only-r460';
  root.dataset.fxMobileEnergyPolicyR271='r326-native-no-legacy-energy';
}

function ensureCurrentMag(){
  if(currentRequested||document.querySelector('script[data-fx-current-mag-loader-r422]'))return;
  currentRequested=true;
  const script=document.createElement('script');script.src=CURRENT_MAG;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';document.head.appendChild(script);
  root.dataset.fxMotionRuntimeMobileCoreR313='direct-r326-r460-primary-controller-prewarmed';
  root.dataset.fxMotionRuntimeRequestedR271='1';
}

function scheduleCriticalOwners(){warmCriticalOwners();ensureLanguageToggle();ensureCurrentMag();}

function reservedInteraction(event){
  if(root.dataset.fxOrganismThought==='open')return true;
  const target=event?.target instanceof Element?event.target:null;
  return Boolean(target?.closest('.fx-crystal-organism-r326-stage,.fx-mini-mag-assistant-r459,.fx-organism-dialogue,.fx-reference-ask,.fx-reference-pause,.fx-three-sound,#menu-toggle,.fx-language-toggle,.fx-reference-mag-button'));
}
function disarm(){for(const [type,options] of intentListeners)removeEventListener(type,onIntent,options);}
function mountEnhancements(){
  if(enhancementsStarted)return;enhancementsStarted=true;disarm();ensureStaticMotionCss();
  let requested=0;for(const spec of deferred)if(mount(spec))requested+=1;
  root.dataset.fxMotionRuntimeDeferredRequestedR284=String(requested);
  root.dataset.fxMotionRuntimeR239='enhanced-r460-user-intent-clean';
}
function onIntent(event){if(reservedInteraction(event))return;mountEnhancements();}

retireLegacyStyleLinks();
let skippedEnergy=0,retiredCore=0,retiredLegacy=0;
for(const spec of specs){
  if(isRetiredCoreBootstrap(spec)){retiredCore+=1;spec.remove();continue;}
  if(isRetiredMagRuntime(spec)){
    retiredLegacy+=1;
    if(isLegacyLivingEnergy(spec)){skippedEnergy+=1;markMobileStaticEnergy();}
    spec.remove();
    continue;
  }
  deferred.push(spec);
}

root.dataset.fxMotionRuntimeRequestedR271='0';
root.dataset.fxMotionRuntimeMobileEnergySkippedR271=String(skippedEnergy);
root.dataset.fxMotionRuntimeDeferredCountR284=String(deferred.length);
root.dataset.fxMotionRuntimeRetiredCoreSkippedR422=String(retiredCore);
root.dataset.fxLegacyMagRuntimeCleanupR460='ready';
root.dataset.fxLegacyMagRuntimesRetiredR460=String(retiredLegacy+retiredCore);
root.dataset.fxMotionRuntimeR239=mobile.matches?'core-ready-r460-mobile-r326-controller':'core-ready-r460-desktop-r326-controller';
root.dataset.fxCoreCriticalPathR422='armed-direct-r326-r460-primary-controller-clean';
scheduleCriticalOwners();

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();
}
}());