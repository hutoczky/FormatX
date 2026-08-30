/* FormatX r465 — compact current-path loader.
   The active HTML contains only current deferred enhancements. R465 owns the
   softer low-bloom mobile glass and a pause-flag governor that never redraws
   merely to become idle. Desktop remains on its proven R326 path. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMotionRuntimeR239)return;

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const template=document.getElementById('fx-motion-runtime-r239');
const LANGUAGE_TOGGLE='/scifi-ui/scripts/single-language-toggle.js?v=20260830-r462-semantic-owner';
const CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260831-r465-soft-optics-no-idle-redraw';
const CURRENT_SOLID_GLASS='/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js?v=20260831-r465-soft-perimeter-low-bloom';
const CURRENT_RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface';
const CURRENT_STYLE='/scifi-ui/styles/formatx-current-mag-r422.css?v=20260830-r454-layout-a11y-touch';
const CURRENT_OPTICS='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260831-r465-soft-perimeter-low-bloom';
const FINAL_HEADER='/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260830-r428-cross-device-language-owner';

if(!(template instanceof HTMLTemplateElement)){root.dataset.fxMotionRuntimeR239='missing-template';return;}
const deferred=Array.from(template.content.querySelectorAll('script[src]'));
const mounted=new Set();
const passive={passive:true};
const intentListeners=[['pointerdown',passive],['touchstart',passive],['wheel',passive],['scroll',passive],['keydown',false]];
let enhancementsStarted=false,currentRequested=false,languageRequested=false;

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
  warmAsset(FINAL_HEADER,'style');
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
  if(document.getElementById('fx-r170-mobile-seam-override'))return;
  const stylesheet=document.createElement('link');stylesheet.id='fx-r170-mobile-seam-override';stylesheet.rel='stylesheet';stylesheet.href='./styles/formatx-runtime-static-r243.css?v=20260819-r243-csp';stylesheet.dataset.fxRuntimeStaticR243='true';document.head.appendChild(stylesheet);
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
  root.dataset.fxMotionRuntimeR239='enhanced-r465-user-intent';
}
function onIntent(event){if(!reservedInteraction(event))mountEnhancements();}

root.dataset.fxMotionRuntimeRequestedR271='0';
root.dataset.fxMotionRuntimeDeferredCountR284=String(deferred.length);
root.dataset.fxLegacyMagRuntimeCleanupR460='static-html-clean-r461';
root.dataset.fxLegacyMagRuntimesRetiredR460='static-not-requested';
root.dataset.fxLivingEnergyR168='retired-r461-r326-native-owner';
root.dataset.fxMotionRuntimeR239=reduced.matches?'reduced-motion-static-core-r465':mobile.matches?'core-ready-r465-mobile-r326-controller':'core-ready-r465-desktop-r326-controller';
root.dataset.fxCoreCriticalPathR422='armed-direct-r326-r465-soft-optics-no-idle-redraw';
warmCriticalOwners();
ensureLanguageToggle();
ensureCurrentMag();

if(deferred.length){
  for(const [type,options] of intentListeners)addEventListener(type,onIntent,options);
  addEventListener('formatx:immersiveactivate',mountEnhancements,{passive:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')mountEnhancements();
}
}());