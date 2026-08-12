(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v62') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v62';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'pixel-reference-native-webgl2-v62-r1a';

  function registerComposition() {
    const stage = document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
    const host = stage?.parentElement;
    if (host) {
      const compactPhone = matchMedia('(max-width:430px)').matches;
      const referenceHeight = compactPhone ? 'clamp(455px,57svh,510px)' : 'clamp(490px,60svh,545px)';
      host.style.setProperty('height', referenceHeight, 'important');
      host.style.setProperty('min-height', referenceHeight, 'important');
      host.style.setProperty('max-height', compactPhone ? '510px' : '545px', 'important');
    }
    if (stage) {
      stage.style.setProperty('background', 'radial-gradient(circle at 50% 48%, rgba(18,148,255,.13), transparent 40%), radial-gradient(circle at 55% 50%, rgba(133,56,255,.065), transparent 53%), linear-gradient(180deg,#010611 0%,#010915 65%,#021426 100%)', 'important');
      stage.style.setProperty('transform', 'translateY(-1.5%) scale(.975)', 'important');
      stage.style.setProperty('transform-origin', '50% 50%', 'important');
    }
  }

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v62.js?v=20260813-pixel-reference-native-r1a';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV62 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v62';
    requestAnimationFrame(() => {
      registerComposition();
      requestAnimationFrame(registerComposition);
    });
    setTimeout(registerComposition, 250);
    setTimeout(registerComposition, 1000);
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV62 = 'load-failed-v62';
    root.dataset.fxCoreReferenceLock = 'load-failed-v62';
    root.dataset.fxCoreReal3d = 'context-unavailable-v62';
  }, { once: true });
  document.head.appendChild(renderer);
}());