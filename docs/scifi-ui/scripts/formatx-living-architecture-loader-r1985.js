(() => {
  'use strict';

  const root = document.documentElement;
  if (document.querySelector('script[data-fx-living-architecture-runtime-r1985]')) return;

  root.dataset.fxLivingArchitectureLoaderR1985 = 'loading-normal-runtime';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/living-architecture.js?v=20261015-r2105-integrated-visible-native-genesis';
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
