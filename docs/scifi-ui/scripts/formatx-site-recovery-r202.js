(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxSiteRecoveryR202 === 'active') return;

  root.dataset.fxSiteRecoveryR202 = 'active';
  root.dataset.fxSiteRecoveryState = 'booting-r202';

  const BROKEN_FIRSTPAINT = 'link[data-fx-mobile-firstpaint-r199],link[href*="formatx-mobile-firstpaint-r199.css"]';
  const CORE_RENDERER = '/scifi-ui/scripts/formatx-core-mobile-reference-r99.js?v=20260818-r202-direct-retry';
  const FALLBACK_CLASS = 'fx-site-core-fallback-r202';
  const ROOT_FALLBACK_CLASS = 'fx-site-core-fallback-active-r202';

  let retried = false;
  let fallback = null;
  let finished = false;
  let heroWaitCount = 0;
  let retryTimer = 0;
  let fallbackTimer = 0;
  let introTimer = 0;

  function removeBrokenFirstpaint() {
    document.querySelectorAll(BROKEN_FIRSTPAINT).forEach((node) => node.remove());
  }

  function heroHost() {
    return document.querySelector('#hero .hero-space');
  }

  function coreReady() {
    const stage = document.querySelector('#hero .fx-core-mobile-v55-stage');
    const canvas = stage && stage.querySelector('canvas.fx-core-mobile-v55-canvas');
    const renderMs = Number.parseFloat(root.dataset.fxCoreRenderMs || '');
    return Boolean(
      stage
      && canvas
      && canvas.width > 2
      && canvas.height > 2
      && stage.getBoundingClientRect().width > 2
      && stage.getBoundingClientRect().height > 2
      && root.dataset.fxCoreMobileR99 === 'ready-v69'
      && root.dataset.fxCoreReal3d === 'ready-v69'
      && Number.isFinite(renderMs)
      && renderMs >= 0
    );
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
    root.dataset.fxIntro = source || 'r202-hard-release';
  }

  function removeFallback() {
    document.querySelectorAll('.' + FALLBACK_CLASS).forEach((node) => node.remove());
    fallback = null;
    root.classList.remove(ROOT_FALLBACK_CLASS);
  }

  function publishReady(source) {
    if (!coreReady()) return false;
    finished = true;
    clearTimeout(retryTimer);
    clearTimeout(fallbackTimer);
    clearTimeout(introTimer);
    removeFallback();
    releaseIntro('r202-native-ready');
    root.dataset.fxSiteRecoveryState = 'native-ready-r202';
    root.dataset.fxSiteRecoverySource = source || 'native';
    return true;
  }

  function ensureFallbackNode() {
    const host = heroHost();
    if (!host) return false;

    const existing = host.querySelector('.' + FALLBACK_CLASS);
    if (existing) {
      fallback = existing;
      return true;
    }

    fallback = document.createElement('div');
    fallback.className = FALLBACK_CLASS;
    fallback.setAttribute('aria-hidden', 'true');
    fallback.innerHTML = '<span class="fx-site-core-fallback-r202__halo"></span><span class="fx-site-core-fallback-r202__shape"></span><span class="fx-site-core-fallback-r202__reactor"></span>';
    host.prepend(fallback);
    return true;
  }

  function showFallback(reason) {
    if (publishReady('native-before-r202-fallback')) return;

    if (!ensureFallbackNode()) {
      if (heroWaitCount < 80) {
        heroWaitCount += 1;
        setTimeout(() => showFallback(reason || 'hero-host-wait'), 100);
      } else {
        releaseIntro('r202-no-hero-hard-release');
        root.dataset.fxSiteRecoveryState = 'released-without-hero-r202';
      }
      return;
    }

    finished = true;
    root.classList.add(ROOT_FALLBACK_CLASS);
    root.dataset.fxSiteRecoveryState = 'fallback-visible-r202';
    root.dataset.fxSiteRecoveryReason = reason || 'renderer-timeout';
    root.dataset.fxCoreReal3d = 'fallback-ready-r202';
    root.dataset.fxCoreReferenceLock = 'fallback-ready-r202';
    root.dataset.fxCoreMobileV55 = 'fallback-ready-r202';
    releaseIntro('r202-fallback-ready');

    window.dispatchEvent(new CustomEvent('formatx:corevisualready', {
      detail: { renderer: 'css-emergency-r202', reason: reason || 'renderer-timeout' }
    }));
  }

  function clearRendererState() {
    try { window.FormatXCoreMobileV69?.destroy?.(); } catch (_) {}
    document.querySelectorAll('#hero .fx-core-mobile-v55-stage').forEach((node) => node.remove());
    document.querySelectorAll('script[data-fx-r202-renderer-retry]').forEach((node) => node.remove());

    delete root.dataset.fxCoreRenderMs;
    delete root.dataset.fxCoreFrameMs;
    delete root.dataset.fxCoreReal3dFps;
    root.dataset.fxCoreMobileR99 = '';
    root.dataset.fxCoreMobileV69 = '';
    root.dataset.fxCoreMobileV55 = 'booting-v55';
    root.dataset.fxCoreReal3d = 'r202-direct-retry';
    root.dataset.fxCoreReferenceLock = 'r202-direct-retry';
  }

  function retryRenderer(reason) {
    if (publishReady('native-before-r202-retry')) return;
    if (retried || finished) return;

    const host = heroHost();
    if (!host) {
      retryTimer = setTimeout(() => retryRenderer('hero-host-wait'), 100);
      return;
    }

    retried = true;
    root.dataset.fxSiteRecoveryState = 'renderer-retry-r202';
    root.dataset.fxSiteRecoveryReason = reason || 'first-frame-timeout';
    clearRendererState();

    const script = document.createElement('script');
    script.src = CORE_RENDERER;
    script.async = true;
    script.dataset.fxR202RendererRetry = 'true';
    script.addEventListener('load', () => {
      setTimeout(() => {
        if (!publishReady('r202-direct-retry-painted-frame')) {
          showFallback('renderer-loaded-without-painted-frame');
        }
      }, 800);
    }, { once: true });
    script.addEventListener('error', () => showFallback('renderer-network-error'), { once: true });
    document.head.appendChild(script);
  }

  function startWatchdogs() {
    if (root.dataset.fxSiteRecoveryWatchdog === 'r202-active') return;
    root.dataset.fxSiteRecoveryWatchdog = 'r202-active';

    removeBrokenFirstpaint();

    // IMPORTANT: these timers start while the parser is still building the page.
    // They do not depend on DOMContentLoaded, load, deferred scripts or WebGL events.
    retryTimer = setTimeout(() => {
      if (!publishReady('native-1200ms-r202')) retryRenderer('native-frame-missed-1200ms');
    }, 1200);

    fallbackTimer = setTimeout(() => {
      if (!publishReady('native-3600ms-r202')) showFallback('hard-deadline-3600ms');
    }, 3600);

    introTimer = setTimeout(() => {
      if (!finished) releaseIntro('r202-intro-hard-deadline');
    }, 4200);
  }

  removeBrokenFirstpaint();

  const headObserver = new MutationObserver(removeBrokenFirstpaint);
  if (document.head) headObserver.observe(document.head, { childList: true, subtree: true });
  setTimeout(() => headObserver.disconnect(), 8000);

  const documentObserver = new MutationObserver(() => {
    if (coreReady()) publishReady('mutation-painted-frame-r202');
  });
  documentObserver.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-fx-core-render-ms'] });
  setTimeout(() => documentObserver.disconnect(), 10000);

  addEventListener('formatx:real3dready', () => {
    requestAnimationFrame(() => requestAnimationFrame(() => publishReady('real3dready-painted-frame-r202')));
  });
  addEventListener('formatx:corevisualready', () => {
    requestAnimationFrame(() => publishReady('corevisualready-r202'));
  });
  addEventListener('pageshow', (event) => {
    removeBrokenFirstpaint();
    if (event.persisted && !publishReady('bfcache-r202')) {
      setTimeout(() => retryRenderer('bfcache-r202'), 80);
    }
  });

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

  startWatchdogs();
}());
