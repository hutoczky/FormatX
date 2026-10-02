(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'r197';
  const MARKER = 'formatx:client-cache-recovery';
  const RELOAD_GUARD = 'formatx:r197-controller-reload';
  let gpuRequested = false;

  function ensureWdaR198Base() {
    if (!document.querySelector('link[data-fx-wda-hardening-r198]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/scifi-ui/styles/formatx-wda-hardening-r198.css?v=20260817-r198';
      link.dataset.fxWdaHardeningR198 = 'true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-fx-wda-hardening-r198]')) {
      const script = document.createElement('script');
      script.src = '/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260817-r198';
      script.defer = true;
      script.dataset.fxWdaHardeningR198 = 'true';
      document.head.appendChild(script);
    }
    root.dataset.fxWdaAssets = 'r198-base-requested';
  }

  function hasPaintedCore() {
    const renderMs = Number.parseFloat(root.dataset.fxCoreRenderMs || '');
    return root.dataset.fxCoreMobileR99 === 'ready-v69'
      && root.dataset.fxCoreReal3d === 'ready-v69'
      && Number.isFinite(renderMs)
      && renderMs >= 0;
  }

  function ensureGpuR198() {
    if (gpuRequested || !hasPaintedCore()) return false;
    gpuRequested = true;
    if (!document.querySelector('script[data-fx-wda-gpu-r198]')) {
      const gpu = document.createElement('script');
      gpu.src = '/scifi-ui/scripts/formatx-wda-gpu-r198.js?v=20260818-r203-post-painted-frame';
      gpu.defer = true;
      gpu.dataset.fxWdaGpuR198 = 'true';
      document.head.appendChild(gpu);
    }
    root.dataset.fxWdaAssets = 'r198-gpu-post-paint-requested';
    return true;
  }

  // Controls and inclusive styling remain early. The canvas governor is explicitly
  // NOT allowed to patch width/height/gl.viewport until native WebGL has completed
  // at least one real painted frame.
  ensureWdaR198Base();

  if (!ensureGpuR198()) {
    const paintedObserver = new MutationObserver(() => {
      if (ensureGpuR198()) paintedObserver.disconnect();
    });
    paintedObserver.observe(root, {
      attributes: true,
      attributeFilter: ['data-fx-core-render-ms', 'data-fx-core-mobile-r99', 'data-fx-core-real3d']
    });
    setTimeout(() => paintedObserver.disconnect(), 12000);
    addEventListener('formatx:real3dready', () => {
      requestAnimationFrame(() => requestAnimationFrame(ensureGpuR198));
    });
  }

  if (root.dataset.fxClientCacheRecovery === VERSION) return;
  root.dataset.fxClientCacheRecovery = 'checking-r197';

  let alreadyMigrated = false;
  try { alreadyMigrated = localStorage.getItem(MARKER) === VERSION; } catch (_) {}
  if (alreadyMigrated) {
    root.dataset.fxClientCacheRecovery = VERSION;
    return;
  }

  // Only the old intro/runtime marker is reset. User content and preferences are
  // not wiped. This removes the one persistent state that differs between a
  // long-lived normal profile and a fresh incognito profile during startup.
  try { localStorage.removeItem('formatx:intro-seen-v1'); } catch (_) {}

  const hadController = Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);
  const tasks = [];

  if ('serviceWorker' in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => []),
    );
  }

  if ('caches' in window) {
    tasks.push(
      caches.keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => []),
    );
  }

  Promise.allSettled(tasks).finally(() => {
    try { localStorage.setItem(MARKER, VERSION); } catch (_) {}
    root.dataset.fxClientCacheRecovery = VERSION;

    if (!hadController) return;
    try {
      if (sessionStorage.getItem(RELOAD_GUARD) === '1') return;
      sessionStorage.setItem(RELOAD_GUARD, '1');
      const target = new URL(location.href);
      target.searchParams.set('_fx_client_recovery', VERSION);
      target.searchParams.set('_fxcb', String(Date.now()));
      location.replace(target.toString());
    } catch (_) {}
  });
}());
