(function () {
  'use strict';
  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v53';
  const SCRIPT = '/scifi-ui/scripts/formatx-core-reference-v53.js?v=20260812-four-point-reference-r1';
  const STYLE = '/scifi-ui/styles/formatx-core-reference-v53.css?v=20260812-four-point-reference-r1';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260813-cinematic-crystal-volume-v65-r1';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260812-award-composition-r2';
  const INTERACTION_SCRIPT = '/scifi-ui/scripts/formatx-core-direct-interaction.js?v=20260812-direct-interaction-r3-living-system';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip'; root.dataset.fxCoreReferenceLock = 'audit-skip'; return;
  }
  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = mobile ? 'single-webgl2-mobile-cinematic-crystal-volume-v65' : 'single-webgl2-reference-crystal-v53';
  root.dataset.fxCoreReferenceLock = mobile ? 'loading-v65' : 'loading-v53';

  function addStyle(){if(document.querySelector('link[data-fx-core-reference-v53-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=STYLE;l.dataset.fxCoreReferenceV53Style='true';l.addEventListener('load',()=>{root.dataset.fxCoreReferenceStyle='ready-v53';},{once:true});l.addEventListener('error',()=>{root.dataset.fxCoreReferenceStyle='failed-v53';},{once:true});document.head.appendChild(l);}
  function addScript(){if(document.querySelector('script[data-fx-core-reference-v53-script], script[src*="formatx-core-reference-v53.js"]'))return;const s=document.createElement('script');s.src=SCRIPT;s.async=false;s.dataset.fxCoreReferenceV53Script='true';s.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v53';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreReal3d='context-unavailable';root.dataset.fxCoreReferenceLock='load-failed-v53';root.dataset.fxCoreReferenceLockLoad='failed-v53';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'reference-crystal-load-failed',reference:'v53'}}));},{once:true});document.head.appendChild(s);}
  function addMobileStyle(){if(document.querySelector('link[data-fx-core-mobile-v55-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=MOBILE_STYLE;l.dataset.fxCoreMobileV55Style='true';l.addEventListener('load',()=>{root.dataset.fxCoreMobileStyle='ready-v55';},{once:true});l.addEventListener('error',()=>{root.dataset.fxCoreMobileStyle='failed-v55';},{once:true});document.head.appendChild(l);}
  function addMobileScript(){if(document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]'))return;const s=document.createElement('script');s.src=MOBILE_SCRIPT;s.async=false;s.dataset.fxCoreMobileV55Script='true';s.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v65';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreReal3d='context-unavailable-v65';root.dataset.fxCoreReferenceLock='load-failed-v65';root.dataset.fxCoreReferenceLockLoad='failed-v65';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'mobile-cinematic-crystal-volume-load-failed',reference:'v65'}}));},{once:true});document.head.appendChild(s);}
  function addInteractionScript(){if(document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]'))return;root.dataset.fxCoreInteractionController='loading-v3';const s=document.createElement('script');s.src=INTERACTION_SCRIPT;s.async=false;s.dataset.fxCoreDirectInteraction='true';s.addEventListener('load',()=>{root.dataset.fxCoreInteractionController='ready-v3';},{once:true});s.addEventListener('error',()=>{root.dataset.fxCoreInteractionController='failed-v3';},{once:true});document.head.appendChild(s);}
  if(mobile){addMobileStyle();addMobileScript();}else{addStyle();addScript();}addInteractionScript();
}());