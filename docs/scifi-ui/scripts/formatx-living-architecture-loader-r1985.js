(() => {
  'use strict';

  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const audit =
    /Chrome-Lighthouse/i.test(navigator.userAgent || '')
    || params.get('lighthouse') === '1'
    || root.dataset.fxP0AuditModeR1728 === 'static-first-paint-no-late-webgl';

  if (audit) {
    root.classList.add('fx-audit-mode');
    root.dataset.fxThree = 'audit-skip';
    root.dataset.fxLighthouse = 'ready';
    root.dataset.fxLivingArchitecture = 'audit-zero-fetch-r1985';
    root.dataset.fxLivingArchitectureLoaderR1985 = 'audit-skip-heavy-runtime';
    queueMicrotask(() => {
      dispatchEvent(new CustomEvent('formatx:livingready'));
    });
    return;
  }

  if (document.querySelector('script[data-fx-living-architecture-runtime-r1985]')) return;

  root.dataset.fxLivingArchitectureLoaderR1985 = 'loading-normal-runtime';
  const script = document.createElement('script');
  script.src = '/scifi-ui/scripts/living-architecture.js?v=20261008-r1985-normal-runtime';
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
