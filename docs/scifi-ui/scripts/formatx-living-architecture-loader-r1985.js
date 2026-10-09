(() => {
  'use strict';

  const root = document.documentElement;
  // R2040: HTML fallback and reduced-motion do NOT mean no interactive
  // application. The original pricing, network, diagnostics and licensing
  // controller must initialize on all capable browsers. Only visuals fall
  // back, through independent MAG/animation capability checks.
  if (document.querySelector('script[data-fx-living-architecture-runtime-r1985]')) return;

  root.dataset.fxLivingArchitectureLoaderR1985 = 'loading-normal-runtime';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/living-architecture.js?v=20261009-r2041-unified-technical-ui';
  script.async = false;
  script.dataset.fxLivingArchitectureRuntimeR1985 = 'true';
  script.addEventListener('load', () => {
    root.dataset.fxLivingArchitectureLoaderR1985 = 'normal-runtime-loaded';
  }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxLivingArchitectureLoaderR1985 = 'normal-runtime-load-error';
    dispatchEvent(new CustomEvent('formatx:livingready'));
  }, { once: true });
  (document.head || document.documentElement).appendChild(script);
})();
