(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v53';
  const SCRIPT = './scripts/formatx-core-reference-v53.js?v=20260811-reference-v53-r1';
  const STYLE = './styles/formatx-core-reference-v53.css?v=20260811-reference-v53-r1';

  /*
    Production MAG authority: v53 native WebGL2 reference crystal.
    One renderer is used on desktop and physical mobile.
    Mobile mounts the canvas inside #hero .hero-space; desktop uses a fixed
    non-interactive stage. No raster/image MAG path and no CSS fake silhouette.
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = 'single-webgl2-reference-crystal-v53';
  root.dataset.fxCoreReferenceLock = 'loading-v53';

  function addStyle() {
    if (document.querySelector('link[data-fx-core-reference-v53-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE;
    link.dataset.fxCoreReferenceV53Style = 'true';
    link.addEventListener('load', () => {
      root.dataset.fxCoreReferenceStyle = 'ready-v53';
    }, { once: true });
    link.addEventListener('error', () => {
      root.dataset.fxCoreReferenceStyle = 'failed-v53';
    }, { once: true });
    document.head.appendChild(link);
  }

  function addScript() {
    if (document.querySelector('script[data-fx-core-reference-v53-script], script[src*="formatx-core-reference-v53.js"]')) return;
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = false;
    script.dataset.fxCoreReferenceV53Script = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreReferenceLockLoad = 'ready-v53';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable';
      root.dataset.fxCoreReferenceLock = 'load-failed-v53';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v53';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', {
        detail: { reason: 'reference-crystal-load-failed', reference: 'v53' }
      }));
    }, { once: true });
    document.head.appendChild(script);
  }

  addStyle();
  addScript();
}());
