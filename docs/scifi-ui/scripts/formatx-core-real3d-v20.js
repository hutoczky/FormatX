(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'reference-crystal-core-v53';
  const SCRIPT = './scripts/formatx-core-reference-v53.js?v=20260811-reference-v53-r1';
  const STYLE = './styles/formatx-core-reference-v53.css?v=20260811-reference-v53-r1';
  const MOBILE_SCRIPT = './scripts/formatx-core-mobile-v55.js?v=20260811-cinematic-mobile-v55-r1';
  const MOBILE_STYLE = './styles/formatx-core-mobile-v55.css?v=20260811-cinematic-mobile-v55-r1';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;

  /*
    Desktop authority remains the v53 native WebGL2 reference crystal.
    Physical mobile uses the v55 hero-local cinematic WebGL2 renderer with
    longer four-axis tips, deeper concave sides, thinner faceted Fresnel glass,
    a smaller hot white nucleus and denser cyan/violet reactor rings.
    The two renderers never boot together, so a phone gets exactly one WebGL2
    context and one MAG canvas. No raster/image or CSS fake silhouette is used.
    Production mobile visual revision: cinematic-reference-v55-r1.
  */

  if (root.dataset.fxCoreReal3dBootstrap === BOOTSTRAP) return;
  root.dataset.fxCoreReal3dBootstrap = BOOTSTRAP;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    root.dataset.fxCoreReferenceLock = 'audit-skip';
    return;
  }

  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreRenderer = mobile ? 'single-webgl2-mobile-cinematic-crystal-v55' : 'single-webgl2-reference-crystal-v53';
  root.dataset.fxCoreReferenceLock = mobile ? 'loading-v55' : 'loading-v53';

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
    if (document.querySelector('link[data-fx-core-mobile-v55-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MOBILE_STYLE;
    link.dataset.fxCoreMobileV55Style = 'true';
    link.addEventListener('load', () => {
      root.dataset.fxCoreMobileStyle = 'ready-v55';
    }, { once: true });
    link.addEventListener('error', () => {
      root.dataset.fxCoreMobileStyle = 'failed-v55';
    }, { once: true });
    document.head.appendChild(link);
  }

  function addMobileScript() {
    if (document.querySelector('script[data-fx-core-mobile-v55-script], script[src*="formatx-core-mobile-v55.js"]')) return;
    const script = document.createElement('script');
    script.src = MOBILE_SCRIPT;
    script.async = false;
    script.dataset.fxCoreMobileV55Script = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCoreReferenceLockLoad = 'ready-v55';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCoreReal3d = 'context-unavailable-v55';
      root.dataset.fxCoreReferenceLock = 'load-failed-v55';
      root.dataset.fxCoreReferenceLockLoad = 'failed-v55';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', {
        detail: { reason: 'mobile-crystal-load-failed', reference: 'v55' }
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
