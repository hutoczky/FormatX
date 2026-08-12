(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreReferenceV53 === 'ready-v53' || root.dataset.fxCoreReferenceV53 === 'booting-reference-v1') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReferenceV53 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreReferenceV53 = 'booting-reference-v1';
  root.dataset.fxCoreRendererMode = 'desktop';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js?v=20260812-four-point-reference-r1';
  script.async = false;
  script.dataset.fxReferenceCoreCinematicScript = 'desktop';
  script.addEventListener('error', () => {
    root.dataset.fxCoreReferenceV53 = 'load-failed-v53';
    root.dataset.fxCoreReferenceLock = 'load-failed-v53';
    root.dataset.fxCoreReal3d = 'context-unavailable';
  }, { once: true });
  document.head.appendChild(script);
}());