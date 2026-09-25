/* FormatX r477 — canonical ASK activation + R476 synchronized MAG iconography.
   The active HTML contains only current deferred enhancements. Mobile keeps the
   bounded R484 surface-energy budget and zero frames between sweeps, while the
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
root.dataset.fxIntroAwareMagR1541='no-concurrent-intro-and-permanent-webgl';
root.dataset.fxPerformancePolicyR1600='60hz-target-adaptive-resolution-effects-degrade-before-cadence';
root.dataset.fxPerformancePolicyR1606='exclusive-mobile-intro-budget-then-permanent-mag-60hz';
root.dataset.fxPerformancePolicyR1620='hard-60hz-webgl-ceiling-preemptive-resolution-headroom';
root.dataset.fxPerformancePolicyR1622='stable-refresh-divisor-never-intentionally-below-60fps';
root.dataset.fxPerformancePolicyR1642='preemptive-headroom-quality-resolution-degrade-before-cadence';
root.dataset.fxPerformancePolicyR1660='single-frame-panic-lod-global-minimum-60fps-target';
root.dataset.fxPerformancePolicyR1710='16-67ms-first-mobile-lite-shader-zero-idle-compositor-relief';
root.dataset.fxPerformancePolicyR1711='single-organism-physiology-preserves-r1710-60fps-budget';
root.dataset.fxPerformancePolicyR1717='fixed-anatomy-physiology-preserves-r1716-60fps-governor';
root.dataset.fxPerformancePolicyR1718='mobile-clarity-floor-readable-midtone-gradual-shedding';
root.dataset.fxPerformancePolicyR1719='healthy-smooth-organism-preserves-adaptive-60hz-budget';
root.dataset.fxPerformancePolicyR1720='hidpi-organism-plus-event-driven-living-world-adaptive-60hz';
root.dataset.fxPerformancePolicyR1721='cortical-detail-hidpi-event-driven-world-adaptive-60hz';
root.dataset.fxPerformancePolicyR1722='studio-organism-hidpi-msaa-zero-blur-all-input-adaptive-60hz';
root.dataset.fxPerformancePolicyR1723='canonical-organism-physiology-only-state-adaptive-60hz';
root.dataset.fxPerformancePolicyR1724='procedural-guardian-one-webgl-draw-event-driven-world-adaptive-60hz';
root.dataset.fxPerformancePolicyR1661='scroll-never-mounts-deferred-enhancements-click-keyboard-only';
root.dataset.fxPerformancePolicyR1676='phase-gated-intro-lighter-mobile-geometry-preemptive-60fps-headroom';
root.dataset.fxPerformancePolicyR1670='stable-60fps-headroom-no-fullscreen-blur-lower-start-resolution';
root.dataset.fxPerformancePolicyR1672='photoreal-material-lighting-no-extra-geometry-adaptive-60fps';

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const LANGUAGE_TOGGLE='/scifi-ui/scripts/single-language-toggle.js?v=20260830-r462-semantic-owner';
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260925-r1741-lighthouse-static-shell';
const CURRENT_SOLID_GLASS='/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js?v=20260831-r484-native-surface-filaments';
const CURRENT_RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260924-r1727b-photographic-audit-stable';
const CURRENT_STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260920-r594-semantic-hit-owner';
const CURRENT_OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260924-r1723-canonical-organism';
const CURRENT_LIFE_STYLE='/scifi-ui/styles/formatx-core-life-r455.css?v=20260924-r1722-zero-blur-hidpi';
const CURRENT_LIFE='/scifi-ui/scripts/formatx-core-life-r455.js?v=20260920-r629-deterministic-semantic-sweep';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';
const DIALOGUE_STYLE='/scifi-ui/styles/formatx-dialogue-surface-r475.css?v=20260925-r1746-immediate-open-owner';
const MAG_SHAPE_SYNC='/scifi-ui/scripts/formatx-mag-shape-sync-r476.js?v=20260924-r1723-canonical-organism';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
const deferred=Array.from(template.content.querySelectorAll('script[src]'));
const mounted=new Set();
const passive={passive:true};
const intentListeners=[['click',false],['keydown',false]];
let enhancementsStarted=false,currentRequested=false,languageRequested=false,shapeSyncRequested=false,askActivationPending=false,magRuntimeActivated=false;

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
  const activate=link=>{
    if(!(link instanceof HTMLLinkElement))return false;
    link.media='all';
    link.dataset.fxR487Media='all';
    link.removeAttribute('data-fx-r487-deferred-style');
    return true;
  };
  const openStyle=document.querySelector('link[data-fx-dialogue-open-critical-r1727]');
  activate(openStyle);
  let link=document.querySelector('link[data-fx-dialogue-surface-r475]');
  if(link instanceof HTMLLinkElement){
    activate(link);
    root.dataset.fxDialogueSurfaceR475=link.sheet?'ready':'loading';
    return;
  }
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=DIALOGUE_STYLE;
  link.media='all';
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
function magBirthActive(){
  const owner=String(root.dataset.fxMagBirthOwnerR533||'');
  if(owner && owner!=='active')return false;
  return root.getAttribute('data-fx-mag-birth-live')==='active'
    || owner==='active'
    || document.querySelector('.fx-mag-birth-r533:not(.fx-mag-birth-prepaint-r1606)') instanceof HTMLElement;
}
function activateMagRuntime(source='startup'){
  if(magRuntimeActivated)return;
  magRuntimeActivated=true;
  root.dataset.fxIntroAwareMagR618='starting-'+source;
  ensureMagShapeSync();
  ensureCurrentMag();
}
function onMagBirthWarmup(event){
  const source=String(event?.detail?.source||root.dataset.fxMagBirthCoreWarmupR618||'cinematic-warmup');
  const validationWarmup=/validated-skip|mobile-skip|automation|webdriver/i.test(source);
  if(mobile.matches && !validationWarmup){
    /* R1606: do not compile/link the permanent R326 WebGL program while the
       mobile intro is still animating. The intro owns the frame budget until
       handoff; R326 starts from formatx:magbirthcomplete. */
    root.dataset.fxIntroAwareMagR618='warmup-deferred-until-handoff-'+source;
    root.dataset.fxIntroAwareMagR1606='mobile-exclusive-intro-frame-budget';
    return;
  }
  root.dataset.fxIntroAwareMagR618='warmup-received-starting-'+source;
  activateMagRuntime('cinematic-warmup-'+source);
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
ensureLanguageToggle();
if(magBirthActive()){
  root.dataset.fxIntroAwareMagR618='waiting-for-core-formation';
  document.addEventListener('formatx:magbirthcorewarmup',onMagBirthWarmup,{once:true,passive:true});
  document.addEventListener('formatx:magbirthcomplete',()=>activateMagRuntime('cinematic-complete'),{once:true,passive:true});
  /* The intro shell is deliberately mounted before this loader. If its warmup
     event already fired, consume the published latch instead of losing it. */
  if(root.dataset.fxMagBirthCoreWarmupR618){
    queueMicrotask(()=>onMagBirthWarmup({detail:{source:root.dataset.fxMagBirthCoreWarmupR618}}));
  }
}else{
  activateMagRuntime('startup-no-cinematic');
}

document.addEventListener('click',activateCanonicalAsk,true);
for(const eventName of ['formatx:organismvoiceready','formatx:organisminterfaceready','formatx:thoughtgenomeready'])addEventListener(eventName,openPendingCanonicalAsk,{passive:true});

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();

  /* R1711 — the P0 scheduler can be loaded by the user's first key/click.
     That event happened before this file existed, so consume the scheduler's
     trusted launch latch instead of requiring a second user action. */
  const inheritedIntent=String(root.dataset.fxP0MotionSchedulerR490||'');
  if(/^(?:starting|loaded):user-(?:click|keydown|pointerdown|touchstart|wheel)-/.test(inheritedIntent)
    || /^(?:starting|loaded):user-(?:click|keydown|pointerdown|touchstart|wheel)$/.test(inheritedIntent)){
    root.dataset.fxMotionInheritedIntentR1711=inheritedIntent;
    queueMicrotask(mountEnhancements);
  }
}
}());
