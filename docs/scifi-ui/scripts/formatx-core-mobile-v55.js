(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-award-v56') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-award-v56';
  root.dataset.fxCoreRendererMode = 'mobile';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-mobile-award-v56.js?v=20260812-award-crystal-r1';
  script.async = false;
  script.dataset.fxCoreMobileAwardV56 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v56';
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV56 = 'load-failed-v56';
    root.dataset.fxCoreReferenceLock = 'load-failed-v56';
    root.dataset.fxCoreReal3d = 'context-unavailable-v56';
  }, { once: true });
  document.head.appendChild(script);
}());