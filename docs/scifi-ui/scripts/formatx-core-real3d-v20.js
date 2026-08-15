(function () {
  'use strict';
  // r134 bootstrap: repaired supplied material + locked mobile reference geometry.
  const root = document.documentElement;
  const BOOTSTRAP = 'responsive-cinematic-reference-v69-r99-luminous-interactive-r134';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260814-luminous-cinematic-r99&rev=20260815-prismatic-organic-r120';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260813-android-webgl-recovery-r71';
  const AWARD_STYLE = '/scifi-ui/styles/formatx-award-reference-r80.css?v=20260814-pixel-aspect-r80';
  const R87_STYLE = '/scifi-ui/styles/formatx-award-reference-r87.css?v=20260814-size-lock-r87&rev=20260814-supplied-reference-r108';
  const SIZE_LOCK_STYLE = '/scifi-ui/styles/formatx-size-lock-r105.css?v=20260814-user-approved-size-r110';
  const MATERIAL_STYLE = '/scifi-ui/styles/formatx-award-material-r88.css?v=20260814-material-reactor-r88';
  const FACET_STYLE = '/scifi-ui/styles/formatx-award-material-r89.css?v=20260814-faceted-crystal-r89';
  const CLARITY_STYLE = '/scifi-ui/styles/formatx-award-material-r90.css?v=20260814-reference-clarity-r90';
  const RAYGLASS_STYLE = '/scifi-ui/styles/formatx-award-material-r91.css?v=20260814-rayglass-r95';
  const R99_OPTICAL_STYLE = '/scifi-ui/styles/formatx-award-material-r99.css?v=20260814-cinematic-atmosphere-r99&rev=20260814-faceted-crystal-r111';
  const POLISH_STYLE = '/scifi-ui/styles/formatx-reference-polish-r109.css?v=20260814-crystal-contrast-r109';
  const EXACT_STYLE = '/scifi-ui/styles/formatx-reference-exact-r112.css?v=20260815-prismatic-caustic-r121';
  const DETAIL_STYLE = '/scifi-ui/styles/formatx-core-detail-overlay-r122.css?v=20260815-reference-material-r131';
  const FINAL_STYLE = '/scifi-ui/styles/formatx-reference-final-r132.css?v=20260815-pixel-lock-r134';
  const DETAIL_SCRIPT = '/scifi-ui/scripts/formatx-core-detail-overlay-r122.js?v=20260815-reference-material-r131';
  const PROOF_STYLE = '/scifi-ui/styles/formatx-award-proof-r85.css?v=20260814-proof-geometry-r86';
  const LAYOUT_SCRIPT = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260814-desktop-safe-r84';
  const FLOW_SCRIPT = '/scifi-ui/scripts/formatx-flow-first-r75.js?v=20260815-reference-geometry-r134';
  const INTERACTION_SCRIPT = '/scifi-ui/scripts/formatx-core-direct-interaction.js?v=20260814-wake-safe-r98';
  const TOUCH_SCRIPT = '/scifi-ui/scripts/formatx-core-touch-pulse-r99.js?v=20260814-wake-safe-r99';
  const INTERACTION_BRIDGE = '/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js?v=20260814-capture-bridge-r109';
  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP && root.dataset.fxCoreDetailR122 === 'ready') return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreReal3d='audit-skip';root.dataset.fxCoreReferenceLock='audit-skip';return; }
  root.dataset.fxCoreReal3d='loading-v69';root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';root.dataset.fxCoreReferenceLock='loading-v69';
  function addStyle(href,attr,ready){if(document.querySelector('link['+attr+']'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(attr,'true');if(ready)l.addEventListener('load',()=>{root.dataset[ready]='ready';},{once:true});document.head.appendChild(l);}
  function addExactStyle(){addStyle(EXACT_STYLE,'data-fx-reference-exact-r112','fxCoreExactR112');addStyle(DETAIL_STYLE,'data-fx-core-detail-r122-style','fxCoreDetailStyleR122');addStyle(FINAL_STYLE,'data-fx-reference-final-r132','fxReferenceFinalR132');}
  function addMobileStyle(){addStyle(MOBILE_STYLE,'data-fx-core-mobile-v55-style');addStyle(AWARD_STYLE,'data-fx-award-reference-r80');addStyle(R87_STYLE,'data-fx-award-reference-r87');addStyle(SIZE_LOCK_STYLE,'data-fx-size-lock-r105');addStyle(MATERIAL_STYLE,'data-fx-award-material-r88');addStyle(FACET_STYLE,'data-fx-award-material-r89');addStyle(CLARITY_STYLE,'data-fx-award-material-r90');addStyle(RAYGLASS_STYLE,'data-fx-award-material-r91','fxCoreMaterialR94');addStyle(R99_OPTICAL_STYLE,'data-fx-award-material-r99','fxCoreMaterialR99');addStyle(POLISH_STYLE,'data-fx-reference-polish-r109','fxCorePolishR109');addStyle(PROOF_STYLE,'data-fx-award-proof-r85');}
  function addReferenceLayout(){if(document.querySelector('script[data-fx-mobile-reference-layout]')){addExactStyle();return;}const s=document.createElement('script');s.src=LAYOUT_SCRIPT;s.async=false;s.dataset.fxMobileReferenceLayout='true';s.addEventListener('load',()=>{addExactStyle();addFlowGuard();},{once:true});document.head.appendChild(s);}
  function addDetailScript(){if(document.querySelector('script[data-fx-core-detail-r122], script[src*="formatx-core-detail-overlay-r122.js"]'))return;const s=document.createElement('script');s.src=DETAIL_SCRIPT;s.async=false;s.dataset.fxCoreDetailR122='true';s.addEventListener('load',()=>{root.dataset.fxCoreDetailLoadR122='ready-r132';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreDetailLoadR122='failed-r132';},{once:true});document.head.appendChild(s);}
  function addMobileScript(){if(document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]')){addDetailScript();return;}const s=document.createElement('script');s.src=MOBILE_SCRIPT;s.async=false;s.dataset.fxCoreMobileV55Script='true';s.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v69-r134';addDetailScript();},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreReal3d='context-unavailable';root.dataset.fxCoreReferenceLock='load-failed-v69';root.dataset.fxCoreReferenceLockLoad='failed-v69-r134';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'mobile-reference-material-load-failed',reference:'v69-r134'}}));},{once:true});document.head.appendChild(s);}
  function addInteractionScript(){if(!document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]')){const s=document.createElement('script');s.src=INTERACTION_SCRIPT;s.async=false;s.dataset.fxCoreDirectInteraction='true';s.addEventListener('load',()=>{root.dataset.fxCoreInteractionController='ready-v3';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreInteractionController='failed-v3';},{once:true});document.head.appendChild(s);}if(!document.querySelector('script[data-fx-core-touch-pulse-r99], script[src*="formatx-core-touch-pulse-r99.js"]')){const t=document.createElement('script');t.src=TOUCH_SCRIPT;t.async=false;t.dataset.fxCoreTouchPulseR99='true';document.head.appendChild(t);}if(!document.querySelector('script[data-fx-core-interaction-bridge-r109], script[src*="formatx-core-interaction-bridge-r109.js"]')){const b=document.createElement('script');b.src=INTERACTION_BRIDGE;b.async=false;b.dataset.fxCoreInteractionBridgeR109='true';document.head.appendChild(b);}}
  function addFlowGuard(){if(document.querySelector('script[data-fx-flow-first-r75]'))return;const s=document.createElement('script');s.src=FLOW_SCRIPT;s.async=false;s.dataset.fxFlowFirstR75='true';s.addEventListener('load',()=>{root.dataset.fxFlowFirstGuard='ready-r134';},{once:true});s.addEventListener('error',()=>{root.dataset.fxFlowFirstGuard='failed-r134';},{once:true});document.head.appendChild(s);}
  addMobileStyle();addReferenceLayout();addMobileScript();addInteractionScript();setTimeout(()=>{addExactStyle();addDetailScript();addFlowGuard();},0);
}());
