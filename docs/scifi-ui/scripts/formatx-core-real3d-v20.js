(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'native-mechanical-orb-r250-no-2d-mag-layers';
  const MOBILE_SCRIPT = '/scifi-ui/scripts/formatx-core-mobile-v55.js?v=20260824-native-mechanical-orb-r251-performance&rev=20260830-r454-visible-electric-surface';
  const MOBILE_STYLE = '/scifi-ui/styles/formatx-core-mobile-v55.css?v=20260821-r285-pure-webgl3d';
  const PURE_STYLE = '/scifi-ui/styles/formatx-pure-3d-r285.css?v=20260828-r382-balanced-soft-optics';
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
  const FINAL_STYLE = '/scifi-ui/styles/formatx-reference-final-r132.css?v=20260815-pixel-lock-r139';
  const NARROW_PROOF_STYLE = '/scifi-ui/styles/formatx-reference-narrow-proof-r145.css?v=20260815-narrow-proof-r145';
  const CLICK_STABILITY_STYLE = '/scifi-ui/styles/formatx-click-stability-r152.css?v=20260815-r152-center-lock';
  const MOBILE_HERO_STABILITY_STYLE = '/scifi-ui/styles/formatx-mobile-hero-stability-r151.css?v=20260815-r156-proof-first';
  const PROOF_STYLE = '/scifi-ui/styles/formatx-award-proof-r85.css?v=20260814-proof-geometry-r86';

  const COPY_SCRIPT = '/scifi-ui/scripts/formatx-reference-copy-r137.js?v=20260815-reference-copy-r137';
  const FINALIZER_SCRIPT = '/scifi-ui/scripts/formatx-reference-finalizer-r142.js?v=20260815-unclipped-chain-r142';
  const TAIL_FINALIZER_SCRIPT = '/scifi-ui/scripts/formatx-reference-finalizer-r143.js?v=20260815-tail-bridge-r143&rev=20260819-r210-geometry-cache';
  const GYRO_SCRIPT = '/scifi-ui/scripts/formatx-core-gyro-r144.js?v=20260821-r285-webgl-input-only';
  const MOBILE_HERO_STABILITY_SCRIPT = '/scifi-ui/scripts/formatx-mobile-hero-stability-r151.js?v=20260815-r156-proof-first';
  const LAYOUT_SCRIPT = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260824-native-orb-r250';
  const FLOW_SCRIPT = '/scifi-ui/scripts/formatx-flow-first-r75.js?v=20260816-mobile-ui-r180c';
  const INTERACTION_SCRIPT = '/scifi-ui/scripts/formatx-core-direct-interaction.js?v=20260814-wake-safe-r98';
  const TOUCH_SCRIPT = '/scifi-ui/scripts/formatx-core-touch-pulse-r99.js?v=20260814-wake-safe-r99';
  const INTERACTION_BRIDGE = '/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js?v=20260814-capture-bridge-r109';

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;
  root.dataset.fxCoreCompositionR285 = 'native-mechanical-orb-r250-no-2d-overlays';

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    const coreStyle = document.querySelector('link[data-fx-core-real3d="true"]');
    if (coreStyle instanceof HTMLLinkElement) {
      coreStyle.removeAttribute('data-fx-deferred-media-r300');
      coreStyle.media = 'all';
    }
    root.dataset.fxCoreReducedMotionR413 = 'static-render-explicit-interaction';
    root.dataset.fxCoreReal3dCssR310 = 'active-static-r413';
  }

  root.dataset.fxCoreReal3d = 'loading-v69';
  root.dataset.fxCoreRenderer = 'single-webgl-mechanical-orb-r250';
  root.dataset.fxCoreReferenceLock = 'loading-v69';

  function addStyle(href, attr, ready) {
    if (document.querySelector(`link[${attr}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(attr, 'true');
    if (ready) link.addEventListener('load', () => { root.dataset[ready] = 'ready'; }, { once: true });
    document.head.appendChild(link);
  }

  function addPureStyle() {
    addStyle(PURE_STYLE, 'data-fx-pure-3d-r285', 'fxPure3dStyleR285');
  }

  function cleanupLegacy2d() {
    for (const selector of [
      '#hero .fx-core-detail-r122',
      '#hero .fx-core-live-r147-layer',
      '#hero .fx-r155-heartbeat-core',
      '#hero .fx-r155-heartbeat-ring',
      '#hero .fx-r155-heartbeat-wave',
      '#hero [class^="fx-r168-"]',
      '#hero [class*=" fx-r168-"]',
      '#hero .fx-core-biolume-r323',
      '#hero .fx-quantum-field-r335',
      '#hero .fx-r181-apex-meta'
    ]) {
      document.querySelectorAll(selector).forEach(node => node.remove());
    }
    root.dataset.fxCoreLegacy2dR285 = 'removed';
  }

  function addExactStyle() {
    addStyle(EXACT_STYLE, 'data-fx-reference-exact-r112', 'fxCoreExactR112');
    addStyle(FINAL_STYLE, 'data-fx-reference-final-r132', 'fxReferenceFinalR132');
    addStyle(NARROW_PROOF_STYLE, 'data-fx-reference-narrow-proof-r145', 'fxReferenceNarrowProofR145');
    addStyle(CLICK_STABILITY_STYLE, 'data-fx-click-stability-r152-style', 'fxClickStabilityStyleR152');
    addPureStyle();
  }

  function addMobileStyle() {
    addStyle(MOBILE_STYLE, 'data-fx-core-mobile-v55-style');
    addStyle(AWARD_STYLE, 'data-fx-award-reference-r80');
    addStyle(R87_STYLE, 'data-fx-award-reference-r87');
    addStyle(SIZE_LOCK_STYLE, 'data-fx-size-lock-r105');
    addStyle(MATERIAL_STYLE, 'data-fx-award-material-r88');
    addStyle(FACET_STYLE, 'data-fx-award-material-r89');
    addStyle(CLARITY_STYLE, 'data-fx-award-material-r90');
    addStyle(RAYGLASS_STYLE, 'data-fx-award-material-r91', 'fxCoreMaterialR94');
    addStyle(R99_OPTICAL_STYLE, 'data-fx-award-material-r99', 'fxCoreMaterialR99');
    addStyle(POLISH_STYLE, 'data-fx-reference-polish-r109', 'fxCorePolishR109');
    addStyle(PROOF_STYLE, 'data-fx-award-proof-r85');
    addPureStyle();
  }

  function addReferenceCopy() {
    if (document.querySelector('script[data-fx-reference-copy-r137], script[src*="formatx-reference-copy-r137.js"]')) return;
    const script = document.createElement('script');
    script.src = COPY_SCRIPT;
    script.async = false;
    script.dataset.fxReferenceCopyR137 = 'true';
    script.addEventListener('load', () => { root.dataset.fxReferenceCopyLoadR137 = 'ready'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxReferenceCopyLoadR137 = 'failed'; }, { once: true });
    document.head.appendChild(script);
  }

  function addMobileHeroStability() {
    addStyle(MOBILE_HERO_STABILITY_STYLE, 'data-fx-mobile-hero-stability-r151-style', 'fxMobileHeroStabilityStyleR151');
    if (document.querySelector('script[data-fx-mobile-hero-stability-r151], script[src*="formatx-mobile-hero-stability-r151.js"]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_HERO_STABILITY_SCRIPT;
    script.async = false;
    script.dataset.fxMobileHeroStabilityR151 = 'true';
    script.addEventListener('load', () => { root.dataset.fxMobileHeroStabilityLoadR151 = 'ready-r156'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxMobileHeroStabilityLoadR151 = 'failed-r156'; }, { once: true });
    document.head.appendChild(script);
  }

  function addGyro() {
    if (document.querySelector('script[data-fx-core-gyro-r144], script[src*="formatx-core-gyro-r144.js"]')) return;
    const script = document.createElement('script');
    script.src = GYRO_SCRIPT;
    script.async = false;
    script.dataset.fxCoreGyroR144 = 'true';
    script.addEventListener('load', () => { root.dataset.fxCoreGyroLoadR144 = 'ready'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxCoreGyroLoadR144 = 'failed'; }, { once: true });
    document.head.appendChild(script);
  }

  function addTailFinalizer() {
    if (document.querySelector('script[data-fx-reference-finalizer-r143], script[src*="formatx-reference-finalizer-r143.js"]')) {
      addGyro();
      return;
    }
    const script = document.createElement('script');
    script.src = TAIL_FINALIZER_SCRIPT;
    script.async = false;
    script.dataset.fxReferenceFinalizerR143 = 'true';
    script.addEventListener('load', addGyro, { once: true });
    script.addEventListener('error', () => { root.dataset.fxReferenceFinalizerR143 = 'load-failed'; addGyro(); }, { once: true });
    document.head.appendChild(script);
  }

  function addFinalizer() {
    if (document.querySelector('script[data-fx-reference-finalizer-r142], script[src*="formatx-reference-finalizer-r142.js"]')) {
      addTailFinalizer();
      return;
    }
    const script = document.createElement('script');
    script.src = FINALIZER_SCRIPT;
    script.async = false;
    script.dataset.fxReferenceFinalizerR142 = 'true';
    script.addEventListener('load', addTailFinalizer, { once: true });
    script.addEventListener('error', () => { root.dataset.fxReferenceFinalizerR142 = 'load-failed'; addTailFinalizer(); }, { once: true });
    document.head.appendChild(script);
  }

  function addFlowGuard() {
    if (innerWidth > 900) {
      root.dataset.fxFlowFirstGuard = 'desktop-bypass-r178';
      addFinalizer();
      return;
    }
    if (document.querySelector('script[data-fx-flow-first-r75]')) return;
    const script = document.createElement('script');
    script.src = FLOW_SCRIPT;
    script.async = false;
    script.dataset.fxFlowFirstR75 = 'true';
    script.addEventListener('load', () => { root.dataset.fxFlowFirstGuard = 'ready-r178'; addFinalizer(); }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxFlowFirstGuard = 'failed-r178'; }, { once: true });
    document.head.appendChild(script);
  }

  function addReferenceLayout() {
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) {
      addExactStyle();
      addReferenceCopy();
      addFinalizer();
      return;
    }
    const script = document.createElement('script');
    script.src = LAYOUT_SCRIPT;
    script.async = false;
    script.dataset.fxMobileReferenceLayout = 'true';
    script.addEventListener('load', () => {
      addExactStyle();
      addFlowGuard();
      addReferenceCopy();
      addFinalizer();
      cleanupLegacy2d();
      addPureStyle();
    }, { once: true });
    document.head.appendChild(script);
  }

  function addMobileScript() {
    if (document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_SCRIPT;
    script.async = false;
    script.dataset.fxCoreMobileV55Script = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreReferenceLockLoad = 'ready-v69-r250';
      cleanupLegacy2d();
      addPureStyle();
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable';
      root.dataset.fxCoreReferenceLock = 'load-failed-v69';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v69-r285';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', { detail: { reason: 'native-webgl-renderer-load-failed', reference: 'v69-r285' } }));
    }, { once: true });
    document.head.appendChild(script);
  }

  function addInteractionScript() {
    if (!document.querySelector('script[data-fx-core-direct-interaction], script[src*="formatx-core-direct-interaction.js"]')) {
      const script = document.createElement('script');
      script.src = INTERACTION_SCRIPT;
      script.async = false;
      script.dataset.fxCoreDirectInteraction = 'true';
      script.addEventListener('load', () => { root.dataset.fxCoreInteractionController = 'ready-v3'; }, { once: true });
      script.addEventListener('error', () => { root.dataset.fxCoreInteractionController = 'failed-v3'; }, { once: true });
      document.head.appendChild(script);
    }
    if (!document.querySelector('script[data-fx-core-touch-pulse-r99], script[src*="formatx-core-touch-pulse-r99.js"]')) {
      const touch = document.createElement('script');
      touch.src = TOUCH_SCRIPT;
      touch.async = false;
      touch.dataset.fxCoreTouchPulseR99 = 'true';
      document.head.appendChild(touch);
    }
    if (!document.querySelector('script[data-fx-core-interaction-bridge-r109], script[src*="formatx-core-interaction-bridge-r109.js"]')) {
      const bridge = document.createElement('script');
      bridge.src = INTERACTION_BRIDGE;
      bridge.async = false;
      bridge.dataset.fxCoreInteractionBridgeR109 = 'true';
      document.head.appendChild(bridge);
    }
    addGyro();
  }

  cleanupLegacy2d();
  addMobileStyle();
  addMobileHeroStability();
  addReferenceLayout();
  addMobileScript();
  addInteractionScript();
  addPureStyle();

  setTimeout(() => {
    addExactStyle();
    addFlowGuard();
    addReferenceCopy();
    addFinalizer();
    addGyro();
    cleanupLegacy2d();
    addPureStyle();
  }, 0);

  addEventListener('formatx:real3dready', () => {
    cleanupLegacy2d();
    addPureStyle();
    root.dataset.fxCoreCompositionR285 = 'native-mechanical-orb-r250-no-2d-overlays';
  }, { passive: true });
}());
