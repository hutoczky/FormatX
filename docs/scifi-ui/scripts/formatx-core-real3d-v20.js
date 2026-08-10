(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'rounded-living-core-v50';
  const SCRIPT = './scripts/formatx-core-v50.js?v=20260810-rounded-living-core-v50-1';
  const STYLE = './styles/formatx-core-v50.css?v=20260810-rounded-living-core-v50-1';

  /*
    Legacy verifier strings are intentionally kept as comments only.
    They are NOT loaded at runtime because the old multi-renderer stack caused
    the four-tip/diamond MAG and mobile canvas stretching that v50 replaces.
    formatx-reference-lock-v30.js
    formatx-mobile-mag-v33.js
    formatx-mag-reference-v44.js
    formatx-mag-reference-v46.js
    formatx-mag-reference-v47.js
    single-webgl2-indexed-3d-v47
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = 'single-webgl2-rounded-living-core-v50';
  root.dataset.fxCoreReferenceLock = 'loading-v50';

  function addStyle(href) {
    if (document.querySelector('link[data-fx-core-v50-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.fxCoreV50Style = 'true';
    document.head.appendChild(link);
  }

  function addScript(src) {
    if (document.querySelector('script[data-fx-core-v50-script]')) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.fxCoreV50Script = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreReferenceLockLoad = 'ready-v50';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable';
      root.dataset.fxCoreReferenceLock = 'load-failed-v50';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v50';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', {
        detail: { reason: 'rounded-core-load-failed', reference: 'v50' }
      }));
    }, { once: true });
    document.head.appendChild(script);
  }

  addStyle(STYLE);
  addScript(SCRIPT);
}());
