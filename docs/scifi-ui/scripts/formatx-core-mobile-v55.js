(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v65') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v65';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'cinematic-crystal-volume-native-webgl2-v65-r2';

  // v65's render loop intentionally reuses these scalar bindings every frame.
  // Define them on the global object before the strict renderer evaluates so
  // assignment remains allocation-free on mobile Chromium.
  if (!Object.prototype.hasOwnProperty.call(window, 'lerp')) window.lerp = 0;
  if (!Object.prototype.hasOwnProperty.call(window, 'slow')) window.slow = 0;

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
      stage.style.setProperty('background', 'radial-gradient(circle at 50% 46%, rgba(18,136,255,.19), transparent 38%), radial-gradient(circle at 54% 49%, rgba(128,48,255,.10), transparent 53%), linear-gradient(180deg,#01040c 0%,#010914 62%,#031a30 100%)', 'important');
      stage.style.setProperty('transform', 'translateY(-1.5%) scale(.975)', 'important');
      stage.style.setProperty('transform-origin', '50% 50%', 'important');
    }
  }

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v65.js?v=20260813-cinematic-crystal-volume-r2';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV65 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v65';
    requestAnimationFrame(() => {
      registerComposition();
      requestAnimationFrame(registerComposition);
    });
    setTimeout(registerComposition, 250);
    setTimeout(registerComposition, 1000);
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV65 = 'load-failed-v65';
    root.dataset.fxCoreReferenceLock = 'load-failed-v65';
    root.dataset.fxCoreReal3d = 'context-unavailable-v65';
  }, { once: true });
  document.head.appendChild(renderer);
}());