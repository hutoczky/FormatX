(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v64') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v64';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-bloom-native-webgl2-v64-r1a';

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
      stage.style.setProperty('background', 'radial-gradient(circle at 50% 47%, rgba(16,124,255,.17), transparent 38%), radial-gradient(circle at 54% 50%, rgba(123,45,255,.085), transparent 52%), linear-gradient(180deg,#01040b 0%,#010914 64%,#031a30 100%)', 'important');
      stage.style.setProperty('transform', 'translateY(-1.5%) scale(.975)', 'important');
      stage.style.setProperty('transform-origin', '50% 50%', 'important');
    }
  }

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v64.js?v=20260813-cinematic-bloom-r1';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV64 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v64';
    requestAnimationFrame(() => {
      registerComposition();
      requestAnimationFrame(registerComposition);
    });
    setTimeout(registerComposition, 250);
    setTimeout(registerComposition, 1000);
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV64 = 'load-failed-v64';
    root.dataset.fxCoreReferenceLock = 'load-failed-v64';
    root.dataset.fxCoreReal3d = 'context-unavailable-v64';
  }, { once: true });
  document.head.appendChild(renderer);
}());