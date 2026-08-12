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
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-reference-r2';

  if (!document.getElementById('fx-mobile-reference-lock-v60')) {
    const style = document.createElement('style');
    style.id = 'fx-mobile-reference-lock-v60';
    style.textContent = `
      @media (max-width:900px), (pointer:coarse), (max-aspect-ratio:27/25) {
        html[data-fx-core-mobile-v60="ready-v60"] #hero .hero-space > :not(.fx-core-mobile-v55-stage) {
          display:none !important;
          visibility:hidden !important;
          opacity:0 !important;
          pointer-events:none !important;
        }
        html[data-fx-core-mobile-v60="ready-v60"] #hero .fx-core-mobile-v55-stage,
        html[data-fx-core-mobile-v60="ready-v60"] #hero .fx-core-mobile-v55-canvas {
          display:block !important;
          visibility:visible !important;
          opacity:1 !important;
        }
        html[data-fx-core-mobile-v60="ready-v60"] #hero .fx-core-mobile-v55-canvas {
          filter:brightness(1.55) saturate(1.34) contrast(1.10)
            drop-shadow(0 0 5px rgba(65,225,255,.28))
            drop-shadow(0 0 12px rgba(80,110,255,.16)) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v60.js?v=20260812-cinematic-reference-r2';
  script.async = false;
  script.dataset.fxCoreMobileReferenceV60 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v60';
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV60 = 'load-failed-v60';
    root.dataset.fxCoreReferenceLock = 'load-failed-v60';
    root.dataset.fxCoreReal3d = 'context-unavailable-v60';
  }, { once: true });
  document.head.appendChild(script);
}());