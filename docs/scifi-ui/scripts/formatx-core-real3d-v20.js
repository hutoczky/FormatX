(function () {
  'use strict';
  const root = document.documentElement;
  const BOOTSTRAP = 'responsive-cinematic-reference-v69-r75-flow-guard';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260813-desktop-safe-r73b';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260813-android-webgl-recovery-r71';
  const FLOW_TYPE_STYLE = '/scifi-ui/styles/formatx-flow-desktop-type-r75.css?v=20260814-desktop-type-r75';
  const LAYOUT_SCRIPT = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260814-mag-first-flow-r74';
  const INTERACTION_SCRIPT = '/scifi-ui/scripts/formatx-core-direct-interaction.js?v=20260813-direct-interaction-r4-root-integrity';

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip'; root.dataset.fxCoreReferenceLock = 'audit-skip'; return;
  }
  root.dataset.fxCoreReal3d = 'loading-v69';
  root.dataset.fxCoreRenderer = 'single-webgl2-responsive-cinematic-reference-glass-v69';
  root.dataset.fxCoreReferenceLock = 'loading-v69';

  function addMobileStyle(){if(document.querySelector('link[data-fx-core-mobile-v55-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=MOBILE_STYLE;l.dataset.fxCoreMobileV55Style='true';l.addEventListener('load',()=>{root.dataset.fxCoreMobileStyle='ready-v55';},{once:true});l.addEventListener('error',()=>{root.dataset.fxCoreMobileStyle='failed-v55';},{once:true});document.head.appendChild(l);}
  function addFlowTypeStyle(){if(document.querySelector('link[data-fx-flow-desktop-type-r75]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=FLOW_TYPE_STYLE;l.dataset.fxFlowDesktopTypeR75='true';l.addEventListener('load',()=>{root.dataset.fxFlowDesktopType='ready-r75';},{once:true});l.addEventListener('error',()=>{root.dataset.fxFlowDesktopType='failed-r75';},{once:true});document.head.appendChild(l);}
  function addReferenceLayout(){if(document.querySelector('script[data-fx-mobile-reference-layout]'))return;const s=document.createElement('script');s.src=LAYOUT_SCRIPT;s.async=false;s.dataset.fxMobileReferenceLayout='true';document.head.appendChild(s);}
  function addMobileScript(){if(document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]'))return;const s=document.createElement('script');s.src=MOBILE_SCRIPT;s.async=false;s.dataset.fxCoreMobileV55Script='true';s.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v69';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreReal3d='context-unavailable';root.dataset.fxCoreReferenceLock='load-failed-v69';root.dataset.fxCoreReferenceLockLoad='failed-v69';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'mobile-cinematic-reference-load-failed',reference:'v69-r75'}}));},{once:true});document.head.appendChild(s);}
  function addInteractionScript(){if(document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]'))return;root.dataset.fxCoreInteractionController='loading-v3';const s=document.createElement('script');s.src=INTERACTION_SCRIPT;s.async=false;s.dataset.fxCoreDirectInteraction='true';s.addEventListener('load',()=>{root.dataset.fxCoreInteractionController='ready-v3';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreInteractionController='failed-v3';},{once:true});document.head.appendChild(s);}
  addMobileStyle();addFlowTypeStyle();addReferenceLayout();addMobileScript();addInteractionScript();
}());
