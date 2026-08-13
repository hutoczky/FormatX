(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v67') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v67';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'reference-locked-native-webgl2-v67-r2';

  function registerComposition() {
    const stage = document.querySelector('#hero .hero-space > .fx-core-mobile-v55-stage');
    const host = stage?.parentElement;
    if (host) {
      const referenceHeight = 'clamp(350px,94vw,525px)';
      host.style.setProperty('height', referenceHeight, 'important');
      host.style.setProperty('min-height', referenceHeight, 'important');
      host.style.setProperty('max-height', '525px', 'important');
      host.style.setProperty('overflow', 'visible', 'important');
    }
    if (stage) {
      stage.style.setProperty('background', 'radial-gradient(circle at 50% 47%, rgba(12,151,255,.23), transparent 35%), radial-gradient(circle at 50% 48%, rgba(130,54,255,.115), transparent 52%), linear-gradient(180deg,#01040c 0%,#010b17 55%,#031b30 78%,#02101d 100%)', 'important');
      stage.style.setProperty('transform', 'translateY(-2.5%) scaleX(1.01) scaleY(1.00)', 'important');
      stage.style.setProperty('transform-origin', '50% 50%', 'important');
      stage.style.setProperty('filter', 'brightness(1.08) saturate(1.12) drop-shadow(0 0 10px rgba(0,210,255,.32))', 'important');
    }
  }

  function loadReferenceLayout() {
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) return;
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260813-reference-layout-r1';
    script.async = false;
    script.dataset.fxMobileReferenceLayout = 'true';
    document.head.appendChild(script);
  }

  const renderer = document.createElement('script');
  renderer.src = '/scifi-ui/scripts/formatx-core-mobile-reference-v67.js?v=20260813-reference-lock-r1';
  renderer.async = false;
  renderer.dataset.fxCoreMobileReferenceV67 = 'true';
  renderer.addEventListener('load', () => {
    root.dataset.fxCoreReferenceLockLoad = 'ready-v67';
    loadReferenceLayout();
    requestAnimationFrame(() => {
      registerComposition();
      requestAnimationFrame(registerComposition);
    });
    setTimeout(registerComposition, 250);
    setTimeout(registerComposition, 1000);
  }, { once: true });
  renderer.addEventListener('error', () => {
    root.dataset.fxCoreMobileV55 = 'load-failed-v55';
    root.dataset.fxCoreMobileV67 = 'load-failed-v67';
    root.dataset.fxCoreReferenceLock = 'load-failed-v67';
    root.dataset.fxCoreReal3d = 'context-unavailable-v67';
  }, { once: true });
  document.head.appendChild(renderer);
}());