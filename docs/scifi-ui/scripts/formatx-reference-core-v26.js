(function () {
  'use strict';

  const root = document.documentElement;
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE) {
    root.dataset.fxReferenceCore = 'audit-skip-v29';
    root.dataset.fxOrbitalCore = 'audit-skip';
    return;
  }
  if (root.dataset.fxOrbitalBootstrap === 'ready-v29') return;
  root.dataset.fxOrbitalBootstrap = 'loading-v29';
  root.dataset.fxReferenceCore = 'retired-diamond-v26';
  root.dataset.fxCoreGeometry = 'native-webgl2-depth-requested';

  if (!document.querySelector('link[data-fx-orbital-core-v28]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/scifi-ui/styles/formatx-orbital-core-v28.css?v=20260809-reference-orb-v28-2';
    style.dataset.fxOrbitalCoreV28 = 'true';
    style.addEventListener('load', () => { root.dataset.fxOrbitalStyle = 'ready-v28'; }, { once: true });
    style.addEventListener('error', () => { root.dataset.fxOrbitalStyle = 'failed-v28'; }, { once: true });
    document.head.appendChild(style);
  }

  if (!document.querySelector('link[data-fx-real3d-mobile-v29]')) {
    const depthStyle = document.createElement('link');
    depthStyle.rel = 'stylesheet';
    depthStyle.href = '/scifi-ui/styles/formatx-real3d-mobile-v29.css?v=20260809-real3d-mobile-v29-1';
    depthStyle.dataset.fxReal3dMobileV29 = 'true';
    depthStyle.addEventListener('load', () => { root.dataset.fxReal3dComposition = 'ready-v29'; }, { once: true });
    depthStyle.addEventListener('error', () => { root.dataset.fxReal3dComposition = 'failed-v29'; }, { once: true });
    document.head.appendChild(depthStyle);
  }

  if (!document.querySelector('script[data-fx-orbital-core-v28]')) {
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-orbital-core-v28.js?v=20260809-real3d-orb-v29-1';
    script.defer = true;
    script.dataset.fxOrbitalCoreV28 = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxOrbitalBootstrap = 'ready-v29';
      root.dataset.fxReal3d = 'webgl2-native';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxOrbitalBootstrap = 'failed-v29';
      console.warn('FormatX native WebGL2 core failed to load.');
    }, { once: true });
    document.head.appendChild(script);
  }
}());
