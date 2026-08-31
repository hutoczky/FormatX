/* FormatX r477 — canonical ASK activation + R476 synchronized MAG iconography.
   The active HTML contains only current deferred enhancements. Mobile keeps the
   zero-idle R465 render budget and R468 explicit-interaction energy, while the
   final full-size MAG compositor uses the R474 softer-glow, feathered-facet
   phone tone. R476 mirrors the primary MAG crystal/sphere state into the header
   and Mini MAG icons. R477 makes the visible ASK control the explicit deferred
   Organism activation path. Desktop stays on the existing R326 material path. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMotionRuntimeR239)return;
root.dataset.fxMotionCspR239='external-strict-csp';
root.dataset.fxFinalValidationR470='r468-live-mag-full-suite';
root.dataset.fxFinalVisualRevisionR471='superseded-by-r472';
root.dataset.fxFinalVisualRevisionR472='superseded-by-r474';
root.dataset.fxFinalVisualRevisionR474='softer-mobile-glow-feathered-facets';
root.dataset.fxFullSuiteR474='r474-mobile-mag';
root.dataset.fxDialogueSurfaceR475='booting';
root.dataset.fxMagShapeSyncR476='booting';
root.dataset.fxCanonicalAskActivationR477='armed';

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const LANGUAGE_TOGGLE='/scifi-ui/scripts/single-language-toggle.js?v=20260830-r462-semantic-owner';
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260831-r474-softer-mobile-glow';
const CURRENT_SOLID_GLASS='/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js?v=20260831-r465-soft-perimeter-low-bloom';
const CURRENT_RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface';
const CURRENT_STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r454-layout-a11y-touch';
const CURRENT_OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260831-r468-soft-mobile-bloom';
const CURRENT_LIFE_STYLE='/scifi-ui/styles/formatx-core-life-r455.css?v=20260831-r474-softer-mobile-glow';
const CURRENT_LIFE='/scifi-ui/scripts/formatx-core-life-r455.js?v=20260831-r468-explicit-surface-energy';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';
const DIALOGUE_STYLE='/scifi-ui/styles/formatx-dialogue-surface-r475.css?v=20260831-r475-canonical-ask-surface';
const MAG_SHAPE_SYNC='/scifi-ui/scripts/formatx-mag-shape-sync-r476.js?v=20260831-r476-shape-sync-soft-phone-optics';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
const deferred=Array.from(template.content.querySelectorAll('script[src]'));
const mounted=new Set();
const passive={passive:true};
const intentListeners=[['pointerdown',passive],['touchstart',passive],['wheel',passive],['scroll',passive],['keydown',false]];
let enhancementsStarted=false,currentRequested=false,languageRequested=false,shapeSyncRequested=false,askActivationPending=false;

function srcOf(spec){return String(spec.getAttribute('src')||'');}
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
  if(Array.from(document.querySelectorAll('link[rel="preload"]')).some(link=>link.href===absolute&&link.as===as))return;
  const preload=document.createElement('link');preload.rel='preload';preload.as=as;preload.href=href;preload.fetchPriority='high';preload.dataset.fxR461CriticalWarm='true';document.head.appendChild(preload);
}
function warmCriticalOwners(){
  if(root.dataset.fxCurrentMagWarmR461==='ready')return;
  root.dataset.fxCurrentMagWarmR461='ready';
  warmAsset(LANGUAGE_TOGGLE,'script');
  warmAsset(CURRENT_MAG,'script');
  warmAsset(CURRENT_SOLID_GLASS,'script');
  warmAsset(CURRENT_RENDERER,'script');
  warmAsset(CURRENT_STYLE,'style');
  warmAsset(CURRENT_OPTICS,'style');
  warmAsset(CURRENT_LIFE_STYLE,'style');
  warmAsset(CURRENT_LIFE,'script');
  warmAsset(FINAL_HEADER,'style');
  warmAsset(DIALOGUE_STYLE,'style');
  warmAsset(MAG_SHAPE_SYNC,'script');
}
function ensureDialogueSurface(){
  let link=document.querySelector('link[data-fx-dialogue-surface-r475]');
  if(link instanceof HTMLLinkElement){root.dataset.fxDialogueSurfaceR475=link.sheet?'ready':'loading';return;}
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=DIALOGUE_STYLE;
  link.dataset.fxDialogueSurfaceR475='true';
  link.addEventListener('load',()=>{root.dataset.fxDialogueSurfaceR475='ready';},{once:true});
  link.addEventListener('error',()=>{root.dataset.fxDialogueSurfaceR475='load-failed';},{once:true});
  document.head.appendChild(link);
}
function ensureMagShapeSync(){
  if(shapeSyncRequested||document.querySelector('script[data-fx-mag-shape-sync-r476]'))return;
  shapeSyncRequested=true;
  const script=document.createElement('script');
  script.src=MAG_SHAPE_SYNC;
  script.async=false;
  script.dataset.fxMagShapeSyncR476='true';
  script.addEventListener('load',()=>{root.dataset.fxMagShapeSyncBootstrapR476='loaded';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxMagShapeSyncBootstrapR476='failed';},{once:true});
  document.head.appendChild(script);
}
function ensureLanguageToggle(){
  if(root.dataset.fxSingleLanguageToggle==='ready'&&root.dataset.fxSingleLanguageToggleVersion==='7')return;
  if(languageRequested||document.querySelector('script[data-fx-critical-language-r461]'))return;
  languageRequested=true;
  const script=document.createElement('script');script.src=LANGUAGE_TOGGLE;script.async=false;script.dataset.fxCriticalLanguageR461='true';
  script.addEventListener('load',()=>{root.dataset.fxLanguageCriticalPathR461=root.dataset.fxSingleLanguageToggle==='ready'?'ready':'loaded-awaiting-install';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxLanguageCriticalPathR461='failed';},{once:true});
  document.head.appendChild(script);
}
function ensureCurrentMag(){
  if(currentRequested||document.querySelector('script[data-fx-current-mag-loader-r422]'))return;
  currentRequested=true;
  const script=document.createElement('script');script.src=CURRENT_MAG;script.async=false;script.dataset.fxCurrentMagLoaderR422='true';document.head.appendChild(script);
  root.dataset.fxMotionRuntimeRequestedR271='1';
}
function ensureStaticMotionCss(){
  const existing=document.getElementById('fx-r170-mobile-seam-override');
  if(existing instanceof HTMLLinkElement){
    if(existing.sheet)root.dataset.fxMotionCssR243='external-strict-csp-user-intent';
    return;
  }
  const stylesheet=document.createElement('link');
  stylesheet.id='fx-r170-mobile-seam-override';
  stylesheet.rel='stylesheet';
  stylesheet.href='./styles/formatx-runtime-static-r243.css?v=20260819-r243-csp';
  stylesheet.dataset.fxRuntimeStaticR243='true';
  stylesheet.addEventListener('load',()=>{root.dataset.fxMotionCssR243='external-strict-csp-user-intent';},{once:true});
  stylesheet.addEventListener('error',()=>{root.dataset.fxMotionCssR243='external-strict-csp-load-failed';},{once:true});
  document.head.appendChild(stylesheet);
}
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
  root.dataset.fxMotionRuntimeR239='enhanced-r468-user-intent';
}
function onIntent(event){if(!reservedInteraction(event))mountEnhancements();}
function openPendingCanonicalAsk(){
  if(!askActivationPending)return false;
  const api=window.FormatXOrganismVoice;
  if(!api||typeof api.open!=='function')return false;
  askActivationPending=false;
  queueMicrotask(()=>{
    try{
      api.open();
      root.dataset.fxCanonicalAskActivationR477='dialogue-opened';
    }catch(_){
      root.dataset.fxCanonicalAskActivationR477='dialogue-open-failed';
    }
  });
  return true;
}
function activateCanonicalAsk(event){
  const target=event.target instanceof Element?event.target.closest('#hero .fx-reference-controls-r204 .fx-reference-ask'):null;
  if(!(target instanceof HTMLButtonElement))return;
  if(typeof window.FormatXOrganismVoice?.open==='function')return;
  askActivationPending=true;
  root.dataset.fxCanonicalAskActivationR477='loading-deferred-organism';
  if(root.dataset.fxImmersive!=='active'){
    root.dataset.fxImmersive='active';
    root.dataset.fxImmersiveSource='canonical-ask-r477';
    dispatchEvent(new CustomEvent('formatx:immersiveactivate',{detail:{source:'canonical-ask-r477'}}));
  }else mountEnhancements();
  queueMicrotask(openPendingCanonicalAsk);
}

root.dataset.fxMotionRuntimeRequestedR271='0';
root.dataset.fxMotionRuntimeDeferredCountR284=String(deferred.length);
root.dataset.fxLegacyMagRuntimeCleanupR460='static-html-clean-r461';
root.dataset.fxLegacyMagRuntimesRetiredR460='static-not-requested';
root.dataset.fxLivingEnergyR168='retired-r461-r326-native-owner';
root.dataset.fxMotionRuntimeR239=reduced.matches?'reduced-motion-static-core-r468':mobile.matches?'core-ready-r468-mobile-r326-controller':'core-ready-r468-desktop-r326-controller';
root.dataset.fxCoreCriticalPathR422='armed-direct-r326-r468-soft-optics-live-energy-zero-idle';
warmCriticalOwners();
ensureDialogueSurface();
ensureMagShapeSync();
ensureLanguageToggle();
ensureCurrentMag();

document.addEventListener('click',activateCanonicalAsk,true);
for(const eventName of ['formatx:organismvoiceready','formatx:organisminterfaceready','formatx:thoughtgenomeready'])addEventListener(eventName,openPendingCanonicalAsk,{passive:true});

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();
}
}());
