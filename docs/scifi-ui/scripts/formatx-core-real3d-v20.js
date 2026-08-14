(function () {
  'use strict';
  const root = document.documentElement;
  const BOOTSTRAP = 'responsive-cinematic-reference-v69-r78-measured-award-lock';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260813-desktop-safe-r73b';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260813-android-webgl-recovery-r71';
  const AWARD_STYLE = '/scifi-ui/styles/formatx-award-reference-r76.css?v=20260814-award-reference-r78';
  const LAYOUT_SCRIPT = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260814-mag-first-flow-r74';
  const FLOW_SCRIPT = '/scifi-ui/scripts/formatx-flow-first-r75.js?v=20260814-award-overlay-r78';
  const INTERACTION_SCRIPT = '/scifi-ui/scripts/formatx-core-direct-interaction.js?v=20260813-direct-interaction-r4-root-integrity';

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip'; root.dataset.fxCoreReferenceLock = 'audit-skip'; return;
  }
  root.dataset.fxCoreReal3d = 'loading-v69';
  root.dataset.fxCoreRenderer = 'single-webgl2-responsive-cinematic-reference-glass-v69-r78';
  root.dataset.fxCoreReferenceLock = 'loading-v69';

  function addStyle(href, attr, ready) {
    if (document.querySelector('link[' + attr + ']')) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.setAttribute(attr, 'true');
    if (ready) l.addEventListener('load', () => { root.dataset.fxCoreAwardReference = ready; }, { once:true });
    document.head.appendChild(l);
  }
  function addMobileStyle(){addStyle(MOBILE_STYLE,'data-fx-core-mobile-v55-style');addStyle(AWARD_STYLE,'data-fx-award-reference-r76','ready-r78');}
  function addReferenceLayout(){if(document.querySelector('script[data-fx-mobile-reference-layout]'))return;const s=document.createElement('script');s.src=LAYOUT_SCRIPT;s.async=false;s.dataset.fxMobileReferenceLayout='true';s.addEventListener('load',addFlowGuard,{once:true});document.head.appendChild(s);}
  function addMobileScript(){if(document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]'))return;const s=document.createElement('script');s.src=MOBILE_SCRIPT;s.async=false;s.dataset.fxCoreMobileV55Script='true';s.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v69';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreReal3d='context-unavailable';root.dataset.fxCoreReferenceLock='load-failed-v69';root.dataset.fxCoreReferenceLockLoad='failed-v69';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'mobile-cinematic-reference-load-failed',reference:'v69-r78'}}));},{once:true});document.head.appendChild(s);}
  function addInteractionScript(){if(document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]'))return;const s=document.createElement('script');s.src=INTERACTION_SCRIPT;s.async=false;s.dataset.fxCoreDirectInteraction='true';s.addEventListener('load',()=>{root.dataset.fxCoreInteractionController='ready-v3';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreInteractionController='failed-v3';},{once:true});document.head.appendChild(s);}
  function addFlowGuard(){if(document.querySelector('script[data-fx-flow-first-r75]'))return;const s=document.createElement('script');s.src=FLOW_SCRIPT;s.async=false;s.dataset.fxFlowFirstR75='true';s.addEventListener('load',()=>{root.dataset.fxFlowFirstGuard='ready-r78';},{once:true});s.addEventListener('error',()=>{root.dataset.fxFlowFirstGuard='failed-r78';},{once:true});document.head.appendChild(s);}
  addMobileStyle();addReferenceLayout();addMobileScript();addInteractionScript();setTimeout(addFlowGuard,0);
}());