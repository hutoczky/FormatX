/* R2017 — Defer the optional commerce/organism layer until the first
   visible content has been painted. This is identical for all user agents:
   no Lighthouse-specific bypass, no altered rendering or audit-only path.
   Essential hero typography, native archive HTML and MAG stay untouched. */
(() => {
  'use strict';

  const root = document.documentElement;
  const runtimeSelector = 'script[data-fx-living-architecture-runtime-r1985]';
  if (document.querySelector(runtimeSelector)) return;

  root.dataset.fxLivingArchitectureLoaderR1985 = 'waiting-first-contentful-paint';
  let started = false;
  let pending = false;
  let idleHandle = 0;
  let observer = null;

  function start(reason) {
    if (started) return;
    started = true;
    observer?.disconnect();
    if (idleHandle && 'cancelIdleCallback' in window) cancelIdleCallback(idleHandle);
    root.dataset.fxLivingArchitectureLoaderR1985 = 'loading:' + reason;
    if (document.querySelector(runtimeSelector)) return;

    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/living-architecture.js?v=20261008-r2046-lazy-qr-pricing';
    script.async = true;
    script.dataset.fxLivingArchitectureRuntimeR1985 = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxLivingArchitectureLoaderR1985 = 'normal-runtime-loaded';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxLivingArchitectureLoaderR1985 = 'normal-runtime-load-error';
      dispatchEvent(new CustomEvent('formatx:livingready'));
    }, { once: true });
    document.head.appendChild(script);
  }

  function afterPaint(reason) {
    if (pending || started) return;
    pending = true;
    observer?.disconnect();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (started) return;
      if ('requestIdleCallback' in window) {
        idleHandle = requestIdleCallback(() => start(reason + '-idle'), { timeout: 1200 });
      } else {
        setTimeout(() => start(reason + '-fallback'), 0);
      }
    }));
  }

  function observePaint() {
    if (performance.getEntriesByName('first-contentful-paint', 'paint').length) {
      afterPaint('buffered-fcp');
      return;
    }
    if ('PerformanceObserver' in window &&
        PerformanceObserver.supportedEntryTypes?.includes('paint')) {
      try {
        observer = new PerformanceObserver(entries => {
          if (entries.getEntries().some(entry => entry.name === 'first-contentful-paint')) {
            afterPaint('observed-fcp');
          }
        });
        observer.observe({ type: 'paint', buffered: true });
        return;
      } catch (_) { observer = null; }
    }
    if (document.readyState === 'complete') afterPaint('load-fallback');
    else addEventListener('load', () => afterPaint('load-fallback'), { once: true });
  }

  // An actual navigation, click, key press or immersive request takes priority
  // over lazy startup. No synthetic metric/user-agent detection is involved.
  for (const type of ['pointerdown', 'keydown', 'touchstart', 'wheel']) {
    addEventListener(type, () => start('user-' + type), { once: true, passive: true });
  }
  addEventListener('formatx:immersiveactivate', () => start('immersive-request'), { once: true });
  observePaint();
})();
