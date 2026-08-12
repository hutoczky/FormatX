(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v58') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v58';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'pixel-reference-r1';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v58.js?v=20260812-pixel-reference-r1';
  script.async = false;
  script.dataset.fxCoreMobileReferenceV58 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v58';
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV58 = 'load-failed-v58';
    root.dataset.fxCoreReferenceLock = 'load-failed-v58';
    root.dataset.fxCoreReal3d = 'context-unavailable-v58';
  }, { once: true });
  document.head.appendChild(script);
}());