(function () {
  'use strict';

  const root = document.documentElement;
  const RENDERER_PATH = '/scifi-ui/scripts/formatx-core-mobile-reference-r99.js';
  const RENDERER_URL = RENDERER_PATH + '?v=20260817-r195-never-stuck';
  const READY_EVENT = 'formatx:real3dready';
  let retryCount = 0;
  let retryTimer = 0;
  let fallbackTimer = 0;
  let completed = false;

  function isReady() {
    const stage = document.querySelector('#hero .fx-core-mobile-v55-stage');
    const canvas = stage && stage.querySelector('canvas.fx-core-mobile-v55-canvas');
    return Boolean(
      root.dataset.fxCoreMobileR99 === 'ready-v69' &&
      root.dataset.fxCoreReal3d === 'ready-v69' &&
      stage && canvas && canvas.width > 2 && canvas.height > 2
    );
  }

  function removeEmergency() {
    document.querySelectorAll('.fx-core-emergency-r195').forEach((node) => node.remove());
    root.classList.remove('fx-core-fallback-r195');
  }

  function finishReady(source) {
    if (completed && isReady()) return;
    if (!isReady()) return;
    completed = true;
    clearTimeout(retryTimer);
    clearTimeout(fallbackTimer);
    removeEmergency();
    root.dataset.fxCoreNeverStuck = 'ready-r195';
    root.dataset.fxCoreRecoverySource = source || 'native-ready';
  }

  function ensureEmergencyNode() {
    const host = document.querySelector('#hero .hero-space');
    if (!host || host.querySelector('.fx-core-emergency-r195')) return;
    const fallback = document.createElement('div');
    fallback.className = 'fx-core-emergency-r195';
    fallback.setAttribute('aria-hidden', 'true');
    fallback.innerHTML = '<span class="fx-core-emergency-r195__shape"><i></i></span><b class="fx-core-emergency-r195__core"></b>';
    host.prepend(fallback);
  }

  function showFallback(reason) {
    if (isReady()) return finishReady('late-native-ready');
    ensureEmergencyNode();
    root.classList.add('fx-core-fallback-r195');
    root.dataset.fxCoreNeverStuck = 'fallback-r195';
    root.dataset.fxCoreRecoveryReason = reason || 'deadline';
    root.dataset.fxCoreReal3d = 'fallback-ready-r195';
    root.dataset.fxCoreReferenceLock = 'fallback-ready-r195';
    root.dataset.fxCoreMobileV55 = 'fallback-ready-r195';
    window.dispatchEvent(new CustomEvent('formatx:corevisualready', {
      detail: { renderer: 'css-emergency-r195', reason: reason || 'deadline' }
    }));
  }

  function resetRendererState() {
    try { window.FormatXCoreMobileV69?.destroy?.(); } catch (_) {}
    document.querySelectorAll('#hero .fx-core-mobile-v55-stage').forEach((node) => node.remove());
    document.querySelectorAll('script[src*="formatx-core-mobile-reference-r99.js"]').forEach((node) => node.remove());
    root.dataset.fxCoreMobileR99 = '';
    root.dataset.fxCoreMobileV69 = '';
    root.dataset.fxCoreMobileV55 = 'booting-v55';
    root.dataset.fxCoreReal3d = 'loading-r195-retry';
    root.dataset.fxCoreReferenceLock = 'loading-r195-retry';
  }

  function forceRenderer(reason) {
    if (isReady()) return finishReady('native-before-retry');
    const host = document.querySelector('#hero .hero-space');
    if (!host) {
      retryTimer = setTimeout(() => forceRenderer('host-wait'), 120);
      return;
    }
    if (retryCount >= 2) {
      showFallback(reason || 'retry-limit');
      return;
    }

    retryCount += 1;
    resetRendererState();
    root.dataset.fxCoreNeverStuck = 'retry-' + retryCount + '-r195';
    root.dataset.fxCoreRecoveryReason = reason || 'watchdog';

    const script = document.createElement('script');
    script.src = RENDERER_URL + '&attempt=' + retryCount;
    script.async = false;
    script.dataset.fxCoreRecoveryR195 = String(retryCount);
    script.addEventListener('load', () => {
      setTimeout(() => {
        if (isReady()) finishReady('retry-' + retryCount);
        else if (retryCount < 2) forceRenderer('renderer-loaded-without-ready');
        else showFallback('renderer-loaded-without-ready');
      }, 180);
    }, { once: true });
    script.addEventListener('error', () => {
      if (retryCount < 2) forceRenderer('renderer-network-error');
      else showFallback('renderer-network-error');
    }, { once: true });
    document.head.appendChild(script);
  }

  function start() {
    if (new URLSearchParams(location.search).get('lighthouse') === '1') return;
    root.dataset.fxCoreNeverStuck = 'watching-r195';

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (isReady()) finishReady('native-fast');
        else forceRenderer('native-ready-deadline');
      }, 650);
    });

    fallbackTimer = setTimeout(() => {
      if (isReady()) finishReady('native-before-hard-deadline');
      else showFallback('hard-deadline-3600ms');
    }, 3600);
  }

  window.addEventListener(READY_EVENT, () => finishReady('real3dready-event'));
  window.addEventListener('formatx:core3dfallback', () => {
    if (!completed && !isReady()) forceRenderer('core3dfallback-event');
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && !isReady()) setTimeout(() => forceRenderer('bfcache-restore'), 80);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());
