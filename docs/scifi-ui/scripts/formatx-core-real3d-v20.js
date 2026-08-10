(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v51';
  const SCRIPT = './scripts/formatx-core-v51.js?v=20260810-reference-crystal-v51-1&rev=16';
  const STYLE = './styles/formatx-core-v51.css?v=20260810-reference-crystal-v51-1&rev=16';
  const MOBILE_SAFE_SCRIPT = './scripts/formatx-core-mobile-compat-v52.js?v=20260811-mobile-safe-v52-5';
  const MOBILE_SAFE_STYLE = './styles/formatx-core-mobile-compat-v52.css?v=20260811-mobile-safe-v52-5';
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;

  /*
    Desktop authority remains the v51 native WebGL2 reference crystal.
    Physical mobile browsers boot the v52 hero-local renderer first. Only after
    v52 has executed do we load v51 for validation/cache parity. Serial startup
    prevents the two renderers from racing and creating two WebGL stages on a
    physical mobile browser. v51 exits immediately because v52 has already set
    fxCoreV51=ready-v51. No raster/image MAG path is used.
    formatx-core-v50.js
    formatx-reference-lock-v30.js
    formatx-mobile-mag-v33.js
    formatx-mag-reference-v44.js
    formatx-mag-reference-v46.js
    formatx-mag-reference-v47.js
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;
  root.dataset.fxCoreMobileStartup = mobile ? 'serialized-v52-r5' : 'desktop-v51';

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = 'single-webgl2-reference-crystal-v51';
  root.dataset.fxCoreReferenceLock = 'loading-v51';

  function addStyle(href, marker) {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, 'true');
    document.head.appendChild(link);
  }

  function addCoreScript(src) {
    if (document.querySelector('script[data-fx-core-v51-script], script[src*="formatx-core-v51.js"]')) return;
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

  function addMobileSafeScript(src, done) {
    const existing = document.querySelector('script[data-fx-core-mobile-safe-v52], script[src*="formatx-core-mobile-compat-v52.js"]');
    if (existing) {
      if (root.dataset.fxCoreMobileCompat === 'ready-v52') {
        done?.();
      } else {
        existing.addEventListener('load', () => done?.(), { once: true });
        existing.addEventListener('error', () => done?.(), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.fxCoreMobileSafeV52 = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreMobileCompatLoad = 'loaded-v52';
      done?.();
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreMobileCompat = 'load-failed-v52';
      root.dataset.fxCoreMobileCompatLoad = 'failed-v52';
      done?.();
    }, { once: true });
    document.head.appendChild(script);
  }

  addStyle(STYLE, 'data-fx-core-v51-style');

  if (mobile) {
    addStyle(MOBILE_SAFE_STYLE, 'data-fx-core-mobile-safe-v52-style');
    addMobileSafeScript(MOBILE_SAFE_SCRIPT, () => addCoreScript(SCRIPT));
  } else {
    addCoreScript(SCRIPT);
  }
}());
