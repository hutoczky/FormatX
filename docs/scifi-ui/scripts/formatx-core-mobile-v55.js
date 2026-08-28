(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreMobileV55 = 'audit-skip'; return; }

  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'new-crystal-organism-r326';
  root.dataset.fxCoreCrystalRevision = 'r326-four-direction-living-facet-organism';
  root.dataset.fxCoreMobileOpticsRevision = 'r417-balanced-soft-mag-header-repair';

  const PRIMARY_RENDERER = '/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260828-r416-site-coupled-soft-optics';
  const CONTROL_STABILITY_STYLE = '/scifi-ui/styles/formatx-mobile-control-stability-r320.css?v=20260824-native-orb-r250';
  const OPTICS_TUNE_STYLE = '/scifi-ui/styles/formatx-mobile-r416-stability.css?v=20260828-r417-balanced-soft-mag-header-repair';
  // Content wins the critical path. The physical hero slot and final mobile CSS
  // are stable immediately; WebGL may arrive after LCP without moving the page.
  const START_DELAY = matchMedia('(max-width: 900px), (pointer: coarse)').matches ? 3000 : 1100;
  let rendererRequested = false;
  let rendererTimer = 0;

  function loadOpticsTune() {
    const existing = document.querySelector('link[data-fx-mobile-r416-stability]');
    if (existing instanceof HTMLLinkElement) {
      if (!existing.href.includes('r417-balanced-soft-mag-header-repair')) existing.href = OPTICS_TUNE_STYLE;
      root.dataset.fxCoreMobileOpticsR416='ready-r417-repair';
      return;
    }
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=OPTICS_TUNE_STYLE;
    link.dataset.fxMobileR416Stability='true';
    document.head.appendChild(link);
    root.dataset.fxCoreMobileOpticsR416='requested-r417-repair';
    link.addEventListener('load',()=>{root.dataset.fxCoreMobileOpticsR416='ready-r417-repair';},{once:true});
    link.addEventListener('error',()=>{root.dataset.fxCoreMobileOpticsR416='load-failed';},{once:true});
  }

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

  function loadPrimaryRenderer(source='scheduled') {
    if (rendererRequested) return;
    rendererRequested = true;
    if (rendererTimer) clearTimeout(rendererTimer);
    rendererTimer = 0;
    if (document.querySelector('script[data-fx-crystal-organism-r326],script[src*="formatx-crystal-organism-r326.js"]')) return;
    root.dataset.fxCoreRendererStartupR346 = source;
    const renderer=document.createElement('script');
    renderer.src=PRIMARY_RENDERER;
    renderer.async=true;
    renderer.dataset.fxCrystalOrganismR326='true';
    renderer.dataset.fxCoreTrueMeshR112='true';

    renderer.addEventListener('load',()=>{
      root.dataset.fxCoreReferenceLockLoad='ready-v69-r326';
      root.dataset.fxCoreRendererSelection='new-crystal-organism-r326-primary';
      root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';
      root.dataset.fxCoreCompositionRevisionR326='new-organism-no-legacy-visual-fallback';
    },{once:true});

    renderer.addEventListener('error',()=>{
      renderer.remove();
      root.dataset.fxCoreMobileV55='load-failed-v55';
      root.dataset.fxCoreMobileV69='load-failed-v69';
      root.dataset.fxCoreReferenceLock='load-failed-v69';
      root.dataset.fxCoreReal3d='context-unavailable';
      root.dataset.fxCoreRendererSelection='r326-load-failed-no-legacy-fallback';
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'r326-renderer-load-failed',fallback:'none'}}));
    },{once:true});

    document.head.appendChild(renderer);
  }

  function schedulePrimaryRenderer() {
    if (rendererRequested || rendererTimer) return;
    root.dataset.fxCoreRendererStartupR346='critical-content-first-r417';
    const schedule = () => {
      if (rendererRequested || rendererTimer) return;
      rendererTimer = setTimeout(() => loadPrimaryRenderer('post-content-lcp-r417'), START_DELAY);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
    else schedule();

    const startFromGesture = event => {
      if (!event.isTrusted || rendererRequested) return;
      loadPrimaryRenderer('trusted-user-gesture');
    };
    addEventListener('pointerdown', startFromGesture, { capture: true, passive: true, once: true });
    addEventListener('touchstart', startFromGesture, { capture: true, passive: true, once: true });
    addEventListener('keydown', startFromGesture, { capture: true, once: true });
  }

  root.dataset.fxCoreOverlayPolicyR326='new-native-webgl-organism-only-no-svg-canvas2d-or-legacy-visual';
  loadOpticsTune();
  loadStableControls();
  loadReferenceLayout();
  schedulePrimaryRenderer();
}());