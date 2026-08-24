(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreMobileV55 = 'audit-skip'; return; }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'native-mechanical-energy-orb-r250';
  root.dataset.fxCoreMechanicalOrbRevision = 'r250-depth-buffered-metal-plasma-orbitals';

  const PRIMARY_RENDERER = '/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js?v=20260824-native-mechanical-orb-r251-performance';
  const LEGACY_RENDERER = '/scifi-ui/scripts/formatx-core-mobile-reference-r317.js?v=20260824-r321-native-soft-rim';
  const CONTROL_STABILITY_STYLE = '/scifi-ui/styles/formatx-mobile-control-stability-r320.css?v=20260824-native-orb-r250';

  function loadStableControls() {
    if (document.querySelector('link[data-fx-mobile-control-stability-r320]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=CONTROL_STABILITY_STYLE;
    link.dataset.fxMobileControlStabilityR320='true';
    document.head.appendChild(link);
    root.dataset.fxMobileControlStabilityR320='requested';
    link.addEventListener('load',()=>{root.dataset.fxMobileControlStabilityR320='ready';},{once:true});
    link.addEventListener('error',()=>{root.dataset.fxMobileControlStabilityR320='load-failed';},{once:true});
  }

  function loadReferenceLayout() {
    if (!document.querySelector('link[data-fx-mobile-reference-layout-style]')) {
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260813-android-webgl-recovery-r71';
      link.dataset.fxMobileReferenceLayoutStyle='true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[data-fx-responsive-text-guard]')) {
      const guard=document.createElement('link');
      guard.rel='stylesheet';
      guard.href='/scifi-ui/styles/formatx-responsive-text-guard-r72.css?v=20260813-responsive-text-wrap-r72';
      guard.dataset.fxResponsiveTextGuard='true';
      document.head.appendChild(guard);
    }
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) return;
    const script=document.createElement('script');
    script.src='/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260824-native-orb-r250';
    script.async=false;
    script.dataset.fxMobileReferenceLayout='true';
    document.head.appendChild(script);
  }

  function loadRenderer(src, fallback) {
    const renderer=document.createElement('script');
    renderer.src=src;
    renderer.async=false;
    renderer.dataset.fxCoreMobileReferenceV69='true';
    renderer.dataset.fxCoreTrueMeshR112='true';
    if (!fallback) renderer.dataset.fxCoreMechanicalR250='true';
    else renderer.dataset.fxCoreModernFallbackR317='true';

    renderer.addEventListener('load',()=>{
      root.dataset.fxCoreReferenceLockLoad=fallback?'ready-v69-r317-fallback':'ready-v69-r250';
      root.dataset.fxCoreRendererSelection=fallback?'modern-r317-fallback':'native-mechanical-orb-r250-primary';
    },{once:true});

    renderer.addEventListener('error',()=>{
      renderer.remove();
      if (!fallback) {
        root.dataset.fxCoreRendererSelection='r250-load-failed-trying-r317';
        loadRenderer(LEGACY_RENDERER,true);
        return;
      }
      root.dataset.fxCoreMobileV55='load-failed-v55';
      root.dataset.fxCoreMobileV69='load-failed-v69';
      root.dataset.fxCoreMobileR317='load-failed-r317';
      root.dataset.fxCoreReferenceLock='load-failed-v69';
      root.dataset.fxCoreReal3d='context-unavailable';
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'native-webgl-renderer-load-failed',reference:'r250+r317'}}));
    },{once:true});

    document.head.appendChild(renderer);
  }

  function loadPrimaryRenderer() {
    root.dataset.fxCoreOverlayPolicyR250='native-webgl-only-no-svg-or-canvas2d-overlay';
    loadRenderer(PRIMARY_RENDERER,false);
  }

  loadStableControls();
  loadReferenceLayout();
  loadPrimaryRenderer();
}());
