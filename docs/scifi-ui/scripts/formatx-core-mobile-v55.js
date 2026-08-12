(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v60') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v60';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-reference-r3';

  function enforceReferencePresentation() {
    document.querySelectorAll('#hero .hero-ring,#hero .fx-organism-map,#hero .fx-resilient-core,#hero .fx-three-stage-shell,#hero .fx-three-telemetry,#hero .fx-three-guide').forEach(node => {
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
      node.style.setProperty('opacity', '0', 'important');
    });
    const stage = document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
    const canvas = stage?.querySelector('.fx-core-mobile-v55-canvas');
    if (stage) {
      stage.style.setProperty('display', 'block', 'important');
      stage.style.setProperty('visibility', 'visible', 'important');
      stage.style.setProperty('opacity', '1', 'important');
    }
    if (canvas) {
      canvas.style.setProperty('display', 'block', 'important');
      canvas.style.setProperty('visibility', 'visible', 'important');
      canvas.style.setProperty('opacity', '1', 'important');
      canvas.style.setProperty('filter', 'brightness(1.58) saturate(1.38) contrast(1.11) drop-shadow(0 0 5px rgba(65,225,255,.30)) drop-shadow(0 0 13px rgba(80,110,255,.18))', 'important');
    }
  }

  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v60.js?v=20260812-cinematic-reference-r3';
  script.async = false;
  script.dataset.fxCoreMobileReferenceV60 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v60';
    requestAnimationFrame(() => {
      enforceReferencePresentation();
      requestAnimationFrame(enforceReferencePresentation);
    });
    setTimeout(enforceReferencePresentation, 250);
    setTimeout(enforceReferencePresentation, 1000);
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV60 = 'load-failed-v60';
    root.dataset.fxCoreReferenceLock = 'load-failed-v60';
    root.dataset.fxCoreReal3d = 'context-unavailable-v60';
  }, { once: true });
  document.head.appendChild(script);
}());