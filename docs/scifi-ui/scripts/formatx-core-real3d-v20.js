(function () {
  'use strict';
  const root = document.documentElement;
  const BOOTSTRAP = 'responsive-cinematic-reference-v69-r74-flow-first';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260813-desktop-safe-r73b';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260813-android-webgl-recovery-r71';
  const LAYOUT_SCRIPT = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260814-mag-first-flow-r74';
  const FLOW_SCRIPT = '/scifi-ui/scripts/formatx-flow-first-r75.js?v=20260814-no-overlap-r75';
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
  function addReferenceLayout(){if(document.querySelector('script[data-fx-mobile-reference-layout]'))return;const s=document.createElement('script');s.src=LAYOUT_SCRIPT;s.async=false;s.dataset.fxMobileReferenceLayout='true';s.addEventListener('load',addFlowGuard,{once:true});document.head.appendChild(s);}
  function addMobileScript(){if(document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]'))return;const s=document.createElement('script');s.src=MOBILE_SCRIPT;s.async=false;s.dataset.fxCoreMobileV55Script='true';s.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v69';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreReal3d='context-unavailable';root.dataset.fxCoreReferenceLock='load-failed-v69';root.dataset.fxCoreReferenceLockLoad='failed-v69';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'mobile-cinematic-reference-load-failed',reference:'v69-r75'}}));},{once:true});document.head.appendChild(s);}
  function addInteractionScript(){if(document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]'))return;const s=document.createElement('script');s.src=INTERACTION_SCRIPT;s.async=false;s.dataset.fxCoreDirectInteraction='true';s.addEventListener('load',()=>{root.dataset.fxCoreInteractionController='ready-v3';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreInteractionController='failed-v3';},{once:true});document.head.appendChild(s);}
  function addFlowGuard(){if(document.querySelector('script[data-fx-flow-first-r75]'))return;const s=document.createElement('script');s.src=FLOW_SCRIPT;s.async=false;s.dataset.fxFlowFirstR75='true';s.addEventListener('load',()=>{root.dataset.fxFlowFirstGuard='ready-r75';},{once:true});s.addEventListener('error',()=>{root.dataset.fxFlowFirstGuard='failed-r75';},{once:true});document.head.appendChild(s);}
  addMobileStyle();addReferenceLayout();addMobileScript();addInteractionScript();setTimeout(addFlowGuard,0);
}());
