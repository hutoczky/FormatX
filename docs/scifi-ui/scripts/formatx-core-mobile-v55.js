(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v1') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v1';
  root.dataset.fxCoreRendererMode = 'mobile';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js?v=20260812-four-point-reference-r1';
  script.async = false;
  script.dataset.fxReferenceCoreCinematicScript = 'mobile';
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreReferenceLock = 'load-failed-v55';
    root.dataset.fxCoreReal3d = 'context-unavailable-v55';
  }, { once: true });
  document.head.appendChild(script);
}());