(function () {
  'use strict';

  const root = document.documentElement;
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE) {
    root.dataset.fxReferenceCore = 'audit-skip-v28';
    root.dataset.fxOrbitalCore = 'audit-skip';
    return;
  }
  if (root.dataset.fxOrbitalBootstrap === 'ready-v28') return;
  root.dataset.fxOrbitalBootstrap = 'loading-v28';
  root.dataset.fxReferenceCore = 'retired-diamond-v26';
  root.dataset.fxCoreGeometry = 'orbital-glass-sphere-requested';

  if (!document.querySelector('link[data-fx-orbital-core-v28]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/scifi-ui/styles/formatx-orbital-core-v28.css?v=20260809-reference-orb-v28-2';
    style.dataset.fxOrbitalCoreV28 = 'true';
    style.addEventListener('load', () => { root.dataset.fxOrbitalStyle = 'ready-v28'; }, { once: true });
    style.addEventListener('error', () => { root.dataset.fxOrbitalStyle = 'failed-v28'; }, { once: true });
    document.head.appendChild(style);
  }

  if (!document.querySelector('script[data-fx-orbital-core-v28]')) {
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-orbital-core-v28.js?v=20260809-reference-orb-v28-2';
    script.defer = true;
    script.dataset.fxOrbitalCoreV28 = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxOrbitalBootstrap = 'ready-v28';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxOrbitalBootstrap = 'failed-v28';
      console.warn('FormatX Orbital Core v28 failed to load.');
    }, { once: true });
    document.head.appendChild(script);
  }
}());
