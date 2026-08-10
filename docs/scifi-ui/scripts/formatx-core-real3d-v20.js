(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v53';
  const SCRIPT = './scripts/formatx-core-reference-v53.js?v=20260811-reference-v53-r1';
  const STYLE = './styles/formatx-core-reference-v53.css?v=20260811-reference-v53-r1';
  const MOBILE_SCRIPT = './scripts/formatx-core-mobile-v54.js?v=20260811-physical-mobile-v54-r1';
  const MOBILE_STYLE = './styles/formatx-core-mobile-v54.css?v=20260811-physical-mobile-v54-r1';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;

  /*
    Desktop authority remains the v53 native WebGL2 reference crystal.
    Physical mobile uses the v54 hero-local WebGL2 renderer with premultiplied
    alpha and a bounded mobile compositor path. The two renderers never boot
    together, so a phone gets exactly one WebGL2 context and one MAG canvas.
    No raster/image MAG path and no CSS fake silhouette are used.
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = mobile ? 'single-webgl2-mobile-crystal-v54' : 'single-webgl2-reference-crystal-v53';
  root.dataset.fxCoreReferenceLock = mobile ? 'loading-v54' : 'loading-v53';

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

  function addMobileStyle() {
    if (document.querySelector('link[data-fx-core-mobile-v54-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MOBILE_STYLE;
    link.dataset.fxCoreMobileV54Style = 'true';
    link.addEventListener('load', () => {
      root.dataset.fxCoreMobileStyle = 'ready-v54';
    }, { once: true });
    link.addEventListener('error', () => {
      root.dataset.fxCoreMobileStyle = 'failed-v54';
    }, { once: true });
    document.head.appendChild(link);
  }

  function addMobileScript() {
    if (document.querySelector('script[data-fx-core-mobile-v54-script], script[src*="formatx-core-mobile-v54.js"]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_SCRIPT;
    script.async = false;
    script.dataset.fxCoreMobileV54Script = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreReferenceLockLoad = 'ready-v54';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable-v54';
      root.dataset.fxCoreReferenceLock = 'load-failed-v54';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v54';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', {
        detail: { reason: 'mobile-crystal-load-failed', reference: 'v54' }
      }));
    }, { once: true });
    document.head.appendChild(script);
  }

  if (mobile) {
    addMobileStyle();
    addMobileScript();
  } else {
    addStyle();
    addScript();
  }
}());
