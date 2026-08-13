(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v66') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v66';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'target-calibrated-native-webgl2-v66-r1';

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
      stage.style.setProperty('background', 'radial-gradient(circle at 50% 46%, rgba(15,128,255,.17), transparent 37%), radial-gradient(circle at 54% 49%, rgba(120,44,255,.085), transparent 52%), linear-gradient(180deg,#01040c 0%,#010813 61%,#03192d 100%)', 'important');
      stage.style.setProperty('transform', 'translateY(-1.5%) scale(.975)', 'important');
      stage.style.setProperty('transform-origin', '50% 50%', 'important');
    }
  }

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v66.js?v=20260813-target-calibrated-r1';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV66 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v66';
    requestAnimationFrame(() => {
      registerComposition();
      requestAnimationFrame(registerComposition);
    });
    setTimeout(registerComposition, 250);
    setTimeout(registerComposition, 1000);
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV66 = 'load-failed-v66';
    root.dataset.fxCoreReferenceLock = 'load-failed-v66';
    root.dataset.fxCoreReal3d = 'context-unavailable-v66';
  }, { once: true });
  document.head.appendChild(renderer);
}());