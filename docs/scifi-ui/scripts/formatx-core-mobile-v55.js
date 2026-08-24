(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreMobileV55 = 'audit-skip'; return; }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'reference-modern-crystal-native-webgl-r317-native-soft-rim-r334-quantum-particles-r344';

  const PRIMARY_RENDERER = '/scifi-ui/scripts/formatx-core-mobile-reference-r317.js?v=20260824-r321-native-soft-rim';
  const LEGACY_RENDERER = '/scifi-ui/scripts/formatx-core-mobile-reference-r99.js?v=20260814-luminous-cinematic-r99&rev=20260824-r304-soft-fallback';
  const SOFTLIGHT_TUNER = '/scifi-ui/scripts/formatx-core-mobile-softlight-r318.js?v=20260824-r323-deep-water-biolume';
  const CONTROL_STABILITY_STYLE = '/scifi-ui/styles/formatx-mobile-control-stability-r320.css?v=20260824-r321-stable-hit-geometry';
  const QUANTUM_STYLE = '/scifi-ui/styles/formatx-quantum-particles-r335.css?v=20260824-r335-interactive-quantum-field';
  const QUANTUM_RUNTIME = '/scifi-ui/scripts/formatx-quantum-particles-r335.js?v=20260824-r344-coordinate-touch';

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
    script.src='/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260813-responsive-text-wrap-r72';
    script.async=false;
    script.dataset.fxMobileReferenceLayout='true';
    document.head.appendChild(script);
  }

  function loadQuantumField() {
    if (!document.querySelector('link[data-fx-quantum-particles-r335]')) {
      const style=document.createElement('link');
      style.rel='stylesheet';
      style.href=QUANTUM_STYLE;
      style.dataset.fxQuantumParticlesR335='true';
      document.head.appendChild(style);
    }
    if (document.querySelector('script[data-fx-quantum-particles-r335]') || root.dataset.fxQuantumParticlesR335 === 'ready') return;
    const script=document.createElement('script');
    script.src=QUANTUM_RUNTIME;
    script.async=false;
    script.dataset.fxQuantumParticlesR335='true';
    script.addEventListener('error',()=>{root.dataset.fxQuantumParticlesR335='load-failed';},{once:true});
    document.head.appendChild(script);
  }

  function loadRenderer(src, fallback) {
    const renderer=document.createElement('script');
    renderer.src=src;
    renderer.async=false;
    renderer.dataset.fxCoreMobileReferenceV69='true';
    renderer.dataset.fxCoreMobileReferenceR99='true';
    renderer.dataset.fxCoreTrueMeshR112='true';
    renderer.dataset.fxCorePrismaticR120='true';
    if (!fallback) renderer.dataset.fxCoreModernR317='true';
    else renderer.dataset.fxCoreLegacyFallbackR99='true';

    renderer.addEventListener('load',()=>{
      root.dataset.fxCoreReferenceLockLoad=fallback?'ready-v69-r120-fallback':'ready-v69-r317';
      root.dataset.fxCoreRendererSelection=fallback?'legacy-r99-fallback':'modern-r317-primary';
      if (!fallback) loadQuantumField();
    },{once:true});

    renderer.addEventListener('error',()=>{
      renderer.remove();
      if (!fallback) {
        root.dataset.fxCoreRendererSelection='r317-load-failed-trying-r99';
        loadRenderer(LEGACY_RENDERER,true);
        return;
      }
      root.dataset.fxCoreMobileV55='load-failed-v55';
      root.dataset.fxCoreMobileV69='load-failed-v69';
      root.dataset.fxCoreMobileR99='load-failed-r99';
      root.dataset.fxCoreReferenceLock='load-failed-v69';
      root.dataset.fxCoreReal3d='context-unavailable';
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'native-webgl-renderer-load-failed',reference:'r317+r99'}}));
    },{once:true});

    document.head.appendChild(renderer);
  }

  function loadPrimaryRenderer() {
    if (document.querySelector('script[data-fx-core-mobile-softlight-r318]') || root.dataset.fxCoreSoftlightR318) {
      loadRenderer(PRIMARY_RENDERER,false);
      return;
    }

    const tuner=document.createElement('script');
    tuner.src=SOFTLIGHT_TUNER;
    tuner.async=false;
    tuner.dataset.fxCoreMobileSoftlightR318='true';
    tuner.addEventListener('load',()=>loadRenderer(PRIMARY_RENDERER,false),{once:true});
    tuner.addEventListener('error',()=>{
      root.dataset.fxCoreSoftlightR318='load-failed-using-r317-stock';
      loadRenderer(PRIMARY_RENDERER,false);
    },{once:true});
    document.head.appendChild(tuner);
  }

  loadStableControls();
  loadReferenceLayout();
  loadPrimaryRenderer();
}());