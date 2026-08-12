(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v61') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v61';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-reference-v61';

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v60.js?v=20260812-cinematic-reference-r4';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV60 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v60';
    const fidelity = document.createElement('script');
    fidelity.src = '/scifi-ui/scripts/formatx-core-mobile-reference-fidelity-v61.js?v=20260812-reference-fidelity-r1';
    fidelity.async = false;
    fidelity.dataset.fxCoreMobileReferenceFidelityV61 = 'true';
    fidelity.addEventListener('load', () => {
      root.dataset.fxCoreReferenceFidelityLoad = 'ready-v61';
    }, { once: true });
    fidelity.addEventListener('error', () => {
      root.dataset.fxCoreReferenceFidelityLoad = 'load-failed-v61';
    }, { once: true });
    document.head.appendChild(fidelity);
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV60 = 'load-failed-v60';
    root.dataset.fxCoreReferenceLock = 'load-failed-v60';
    root.dataset.fxCoreReal3d = 'context-unavailable-v60';
  }, { once: true });
  document.head.appendChild(renderer);
}());