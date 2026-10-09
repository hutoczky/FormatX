(() => {
  'use strict';

  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  // Only an explicit user-selected HTML fallback or reduced motion may
  // omit the real living runtime. Lighthouse is a visitor, not a privileged
  // alternate static product. This prevents misleading quality metrics.
  const audit =
    params.get('archive') === 'off'
    || matchMedia('(prefers-reduced-motion: reduce)').matches;

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
