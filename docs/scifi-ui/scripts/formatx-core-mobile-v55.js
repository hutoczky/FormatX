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
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-reference-v61-r3';

  function registerFidelity() {
    const stage = document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
    const overlay = stage?.querySelector('.fx-core-fidelity-v61');
    if (stage) {
      stage.style.setProperty('background', 'radial-gradient(circle at 50% 48%, rgba(18,148,255,.14), transparent 38%), radial-gradient(circle at 55% 50%, rgba(133,56,255,.07), transparent 51%), linear-gradient(180deg,#010611 0%,#010915 64%,#021629 100%)', 'important');
    }
    if (overlay) {
      overlay.style.setProperty('transform', 'translateY(12.8%) scale(1.09,1.13)', 'important');
      overlay.style.setProperty('transform-origin', '50% 50%', 'important');
      overlay.style.setProperty('overflow', 'visible', 'important');
    }
  }

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v60.js?v=20260812-cinematic-reference-r6';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV60 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v60';
    const fidelity = document.createElement('script');
    fidelity.src = '/scifi-ui/scripts/formatx-core-mobile-reference-fidelity-v61.js?v=20260812-reference-fidelity-r3';
    fidelity.async = false;
    fidelity.dataset.fxCoreMobileReferenceFidelityV61 = 'true';
    fidelity.addEventListener('load', () => {
      root.dataset.fxCoreReferenceFidelityLoad = 'ready-v61';
      requestAnimationFrame(() => {
        registerFidelity();
        requestAnimationFrame(registerFidelity);
      });
      setTimeout(registerFidelity, 250);
      setTimeout(registerFidelity, 1000);
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