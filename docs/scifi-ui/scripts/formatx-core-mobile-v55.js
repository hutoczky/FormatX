(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v57') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v57';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'reference-lock-r1';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v57.js?v=20260812-reference-lock-r1';
  script.async = false;
  script.dataset.fxCoreMobileReferenceV57 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v57';
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV57 = 'load-failed-v57';
    root.dataset.fxCoreReferenceLock = 'load-failed-v57';
    root.dataset.fxCoreReal3d = 'context-unavailable-v57';
  }, { once: true });
  document.head.appendChild(script);
}());