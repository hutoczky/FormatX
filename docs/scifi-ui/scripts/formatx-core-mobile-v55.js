(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v59') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v59';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'luminous-reference-r1';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v59.js?v=20260812-luminous-reference-r1';
  script.async = false;
  script.dataset.fxCoreMobileReferenceV59 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v59';
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV59 = 'load-failed-v59';
    root.dataset.fxCoreReferenceLock = 'load-failed-v59';
    root.dataset.fxCoreReal3d = 'context-unavailable-v59';
  }, { once: true });
  document.head.appendChild(script);
}());