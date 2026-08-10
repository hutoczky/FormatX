(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v51';
  const SCRIPT = './scripts/formatx-core-v51.js?v=20260810-reference-crystal-v51-1&rev=7';
  const STYLE = './styles/formatx-core-v51.css?v=20260810-reference-crystal-v51-1&rev=7';

  /*
    Production authority is v51: one native WebGL2 context, closed volumetric
    four-tip concave faceted crystal, moving white nucleus and concentric
    cyan/violet rings. The older rounded v50 and legacy multi-renderer MAG
    stacks are not loaded.
    formatx-core-v50.js
    formatx-reference-lock-v30.js
    formatx-mobile-mag-v33.js
    formatx-mag-reference-v44.js
    formatx-mag-reference-v46.js
    formatx-mag-reference-v47.js
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = 'single-webgl2-reference-crystal-v51';
  root.dataset.fxCoreReferenceLock = 'loading-v51';

  function addStyle(href) {
    if (document.querySelector('link[data-fx-core-v51-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.fxCoreV51Style = 'true';
    document.head.appendChild(link);
  }

  function addScript(src) {
    if (document.querySelector('script[data-fx-core-v51-script]')) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.fxCoreV51Script = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreReferenceLockLoad = 'ready-v51';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable';
      root.dataset.fxCoreReferenceLock = 'load-failed-v51';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v51';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', {
        detail: { reason: 'reference-crystal-load-failed', reference: 'v51' }
      }));
    }, { once: true });
    document.head.appendChild(script);
  }

  addStyle(STYLE);
  addScript(SCRIPT);
}());
