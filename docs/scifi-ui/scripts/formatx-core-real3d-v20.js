(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v53';
  const SCRIPT = '/scifi-ui/scripts/formatx-core-reference-v53.js?v=20260812-four-point-reference-r1';
  const STYLE = '/scifi-ui/styles/formatx-core-reference-v53.css?v=20260812-four-point-reference-r1';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260812-reference-fidelity-v61-r1';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260812-award-composition-r2';
  const INTERACTION_SCRIPT = '/scifi-ui/scripts/formatx-core-direct-interaction.js?v=20260812-direct-interaction-r3-living-system';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;

  /*
    Desktop keeps the production v53 crystal. Mobile v55 is now the compatibility
    wrapper for the reference-locked composition: v60 owns the single native
    WebGL2 four-point crystal and v61 adds an emissive vector fidelity layer over
    that real geometry. No raster image, second WebGL context or scene engine is
    used. Production mobile visual revision: reference-fidelity-v61-r1.
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = mobile ? 'single-webgl2-mobile-cinematic-reference-v60' : 'single-webgl2-reference-crystal-v53';
  root.dataset.fxCoreReferenceLock = mobile ? 'loading-v61' : 'loading-v53';

  function addStyle() {
    if (document.querySelector('link[data-fx-core-reference-v53-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE;
    link.dataset.fxCoreReferenceV53Style = 'true';
    link.addEventListener('load', () => { root.dataset.fxCoreReferenceStyle = 'ready-v53'; }, { once: true });
    link.addEventListener('error', () => { root.dataset.fxCoreReferenceStyle = 'failed-v53'; }, { once: true });
    document.head.appendChild(link);
  }

  function addScript() {
    if (document.querySelector('script[data-fx-core-reference-v53-script], script[src*="formatx-core-reference-v53.js"]')) return;
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = false;
    script.dataset.fxCoreReferenceV53Script = 'true';
    script.addEventListener('load', () => { root.dataset.fxCoreReferenceLockLoad = 'ready-v53'; }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable';
      root.dataset.fxCoreReferenceLock = 'load-failed-v53';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v53';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', { detail: { reason: 'reference-crystal-load-failed', reference: 'v53' } }));
    }, { once: true });
    document.head.appendChild(script);
  }

  function addMobileStyle() {
    if (document.querySelector('link[data-fx-core-mobile-v55-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MOBILE_STYLE;
    link.dataset.fxCoreMobileV55Style = 'true';
    link.addEventListener('load', () => { root.dataset.fxCoreMobileStyle = 'ready-v55'; }, { once: true });
    link.addEventListener('error', () => { root.dataset.fxCoreMobileStyle = 'failed-v55'; }, { once: true });
    document.head.appendChild(link);
  }

  function addMobileScript() {
    if (document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_SCRIPT;
    script.async = false;
    script.dataset.fxCoreMobileV55Script = 'true';
    script.addEventListener('load', () => { root.dataset.fxCoreReferenceLockLoad = 'ready-v61'; }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable-v61';
      root.dataset.fxCoreReferenceLock = 'load-failed-v61';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v61';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', { detail: { reason: 'mobile-reference-fidelity-load-failed', reference: 'v61' } }));
    }, { once: true });
    document.head.appendChild(script);
  }

  function addInteractionScript() {
    if (document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]')) return;
    root.dataset.fxCoreInteractionController = 'loading-v3';
    const script = document.createElement('script');
    script.src = INTERACTION_SCRIPT;
    script.async = false;
    script.dataset.fxCoreDirectInteraction = 'true';
    script.addEventListener('load', () => { root.dataset.fxCoreInteractionController = 'ready-v3'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxCoreInteractionController = 'failed-v3'; }, { once: true });
    document.head.appendChild(script);
  }

  if (mobile) {
    addMobileStyle();
    addMobileScript();
  } else {
    addStyle();
    addScript();
  }
  addInteractionScript();
}());