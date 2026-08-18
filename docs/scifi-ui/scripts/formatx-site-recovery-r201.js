(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxSiteRecoveryR201 === 'active') return;
  root.dataset.fxSiteRecoveryR201 = 'active';
  root.dataset.fxSiteRecoveryState = 'booting';

  const BROKEN_FIRSTPAINT = 'link[data-fx-mobile-firstpaint-r199],link[href*="formatx-mobile-firstpaint-r199.css"]';
  const CORE_RENDERER = '/scifi-ui/scripts/formatx-core-mobile-reference-r99.js?v=20260818-r201-direct-retry';
  let retried = false;
  let fallback = null;

  function removeBrokenFirstpaint() {
    document.querySelectorAll(BROKEN_FIRSTPAINT).forEach((node) => node.remove());
  }

  removeBrokenFirstpaint();
  const headObserver = new MutationObserver(removeBrokenFirstpaint);
  if (document.head) headObserver.observe(document.head, { childList: true, subtree: true });
  setTimeout(() => headObserver.disconnect(), 8000);

  function coreReady() {
    const stage = document.querySelector('#hero .fx-core-mobile-v55-stage');
    const canvas = stage && stage.querySelector('canvas.fx-core-mobile-v55-canvas');
    return Boolean(
      stage
      && canvas
      && canvas.width > 2
      && canvas.height > 2
      && stage.getBoundingClientRect().width > 2
      && stage.getBoundingClientRect().height > 2
    );
  }

  function removeFallback() {
    if (fallback?.isConnected) fallback.remove();
    fallback = null;
    root.classList.remove('fx-site-core-fallback-r201');
  }

  function publishReady(source) {
    if (!coreReady()) return false;
    removeFallback();
    root.dataset.fxSiteRecoveryState = 'native-ready';
    root.dataset.fxSiteRecoverySource = source || 'native';
    return true;
  }

  function releaseIntro(source) {
    const overlay = document.getElementById('formatx-event-horizon');
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
    }
    root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro = source || 'r201-hard-release';
  }

  function showFallback(reason) {
    if (publishReady('native-before-fallback')) return;
    const host = document.querySelector('#hero .hero-space');
    if (!host) return;
    if (!fallback || !fallback.isConnected) {
      fallback = document.createElement('div');
      fallback.className = 'fx-site-core-fallback-r201';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.innerHTML = '<span class="fx-site-core-fallback-r201__halo"></span><span class="fx-site-core-fallback-r201__shape"></span><span class="fx-site-core-fallback-r201__reactor"></span>';
      host.prepend(fallback);
    }
    root.classList.add('fx-site-core-fallback-r201');
    root.dataset.fxSiteRecoveryState = 'fallback-visible';
    root.dataset.fxSiteRecoveryReason = reason || 'renderer-timeout';
  }

  function retryRenderer() {
    if (publishReady('native-fast')) return;
    if (retried) return;
    const host = document.querySelector('#hero .hero-space');
    if (!host) return;
    retried = true;
    root.dataset.fxSiteRecoveryState = 'renderer-retry';

    try { window.FormatXCoreMobileV69?.destroy?.(); } catch (_) {}
    document.querySelectorAll('#hero .fx-core-mobile-v55-stage').forEach((node) => node.remove());
    document.querySelectorAll('script[data-fx-r201-renderer-retry]').forEach((node) => node.remove());

    root.dataset.fxCoreMobileR99 = '';
    root.dataset.fxCoreMobileV69 = '';
    root.dataset.fxCoreMobileV55 = 'booting-v55';
    root.dataset.fxCoreReal3d = 'r201-direct-retry';
    root.dataset.fxCoreReferenceLock = 'r201-direct-retry';

    const script = document.createElement('script');
    script.src = CORE_RENDERER;
    script.async = false;
    script.dataset.fxR201RendererRetry = 'true';
    script.addEventListener('load', () => {
      setTimeout(() => {
        if (!publishReady('r201-direct-retry')) showFallback('renderer-loaded-without-canvas');
      }, 700);
    }, { once: true });
    script.addEventListener('error', () => showFallback('renderer-network-error'), { once: true });
    document.head.appendChild(script);
  }

  function startWatchdogs() {
    removeBrokenFirstpaint();
    setTimeout(() => {
      if (!publishReady('native-1500ms')) retryRenderer();
    }, 1500);
    setTimeout(() => {
      if (!publishReady('native-3600ms')) showFallback('hard-deadline-3600ms');
    }, 3600);
    setTimeout(() => {
      if (root.classList.contains('fx-intro-pending') || root.classList.contains('fx-intro-running')) {
        releaseIntro('r201-intro-hard-deadline');
      }
    }, 4300);
  }

  addEventListener('formatx:real3dready', () => requestAnimationFrame(() => publishReady('real3dready')));
  addEventListener('formatx:corevisualready', () => requestAnimationFrame(() => publishReady('corevisualready')));
  addEventListener('pageshow', (event) => {
    removeBrokenFirstpaint();
    if (event.persisted) setTimeout(() => {
      if (!publishReady('bfcache')) retryRenderer();
    }, 100);
  });

  // Remove legacy cache state that can keep the r200 controller alive in a normal profile.
  try { localStorage.removeItem('formatx:client-cache-recovery'); } catch (_) {}
  try { sessionStorage.removeItem('formatx:r197-controller-reload'); } catch (_) {}

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((items) => Promise.all(items.map((item) => item.unregister())))
      .catch(() => {});
  }
  if ('caches' in window) {
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {});
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', startWatchdogs, { once: true })
    : startWatchdogs();
}());
