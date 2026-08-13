(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-reference-glass-native-webgl2-v69-r1';

  function loadReferenceLayout() {
    if (!document.querySelector('link[data-fx-mobile-reference-layout-style]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260813-reference-pixel-lock-r70';
      link.dataset.fxMobileReferenceLayoutStyle = 'true';
      document.head.appendChild(link);
    }
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) return;
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260813-reference-pixel-lock-r70';
    script.async = false;
    script.dataset.fxMobileReferenceLayout = 'true';
    document.head.appendChild(script);
  }

  loadReferenceLayout();
  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v69.js?v=20260813-cinematic-glass-r70';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV69 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v69';
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV69 = 'load-failed-v69';
    root.dataset.fxCoreReferenceLock = 'load-failed-v69';
    root.dataset.fxCoreReal3d = 'context-unavailable-v69';
  }, { once: true });
  document.head.appendChild(renderer);
}());
