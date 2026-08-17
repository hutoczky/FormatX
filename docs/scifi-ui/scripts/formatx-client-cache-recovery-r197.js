(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'r197';
  const MARKER = 'formatx:client-cache-recovery';
  const RELOAD_GUARD = 'formatx:r197-controller-reload';

  function ensureWdaR198() {
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
    root.dataset.fxWdaAssets = 'r198-requested';
  }

  // r198 is a non-blocking award-hardening layer. It loads before any cache
  // migration early return, so both fresh and already-migrated clients receive
  // the visible MUTE/UNMUTE control and accessibility safeguards.
  ensureWdaR198();

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

  // No current FormatX build registers a Service Worker, but old browser profiles
  // may still retain one from a historic build. Remove such registrations once.
  if ('serviceWorker' in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => []),
    );
  }

  // CacheStorage is origin-scoped, so clearing it here cannot affect other sites.
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

    // An active historic Service Worker keeps controlling the current document
    // until navigation. Reload exactly once after unregistering it.
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
