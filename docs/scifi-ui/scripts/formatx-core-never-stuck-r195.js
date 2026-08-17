(function () {
  'use strict';

  const root = document.documentElement;
  const RENDERER_PATH = '/scifi-ui/scripts/formatx-core-mobile-reference-r99.js';
  const RENDERER_URL = RENDERER_PATH + '?v=20260817-r196-painted-frame';
  const READY_EVENT = 'formatx:real3dready';
  let retryCount = 0;
  let retryTimer = 0;
  let fallbackTimer = 0;
  let completed = false;

  function hasPaintedFrame() {
    const renderMs = Number.parseFloat(root.dataset.fxCoreRenderMs || '');
    return Number.isFinite(renderMs) && renderMs >= 0;
  }

  function isReady() {
    const stage = document.querySelector('#hero .fx-core-mobile-v55-stage');
    const canvas = stage && stage.querySelector('canvas.fx-core-mobile-v55-canvas');
    return Boolean(
      root.dataset.fxCoreMobileR99 === 'ready-v69' &&
      root.dataset.fxCoreReal3d === 'ready-v69' &&
      stage && canvas && canvas.width > 2 && canvas.height > 2 &&
      hasPaintedFrame()
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
    root.dataset.fxCoreNeverStuck = 'ready-r196-painted-frame';
    root.dataset.fxCoreRecoverySource = source || 'painted-frame';
    root.dataset.fxCoreFirstPaintVerified = 'true';
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
    if (isReady()) return finishReady('late-painted-frame');
    ensureEmergencyNode();
    root.classList.add('fx-core-fallback-r195');
    root.dataset.fxCoreNeverStuck = 'fallback-r196';
    root.dataset.fxCoreRecoveryReason = reason || 'deadline';
    root.dataset.fxCoreReal3d = 'fallback-ready-r196';
    root.dataset.fxCoreReferenceLock = 'fallback-ready-r196';
    root.dataset.fxCoreMobileV55 = 'fallback-ready-r196';
    window.dispatchEvent(new CustomEvent('formatx:corevisualready', {
      detail: { renderer: 'css-emergency-r196', reason: reason || 'deadline' }
    }));
  }

  function clearFrameEvidence() {
    delete root.dataset.fxCoreRenderMs;
    delete root.dataset.fxCoreRenderAverageMs;
    delete root.dataset.fxCoreFrameMs;
    delete root.dataset.fxCoreReal3dFps;
    delete root.dataset.fxCoreFirstPaintVerified;
  }

  function resetRendererState() {
    try { window.FormatXCoreMobileV69?.destroy?.(); } catch (_) {}
    document.querySelectorAll('#hero .fx-core-mobile-v55-stage').forEach((node) => node.remove());
    document.querySelectorAll('script[src*="formatx-core-mobile-reference-r99.js"]').forEach((node) => node.remove());
    clearFrameEvidence();
    root.dataset.fxCoreMobileR99 = '';
    root.dataset.fxCoreMobileV69 = '';
    root.dataset.fxCoreMobileV55 = 'booting-v55';
    root.dataset.fxCoreReal3d = 'loading-r196-retry';
    root.dataset.fxCoreReferenceLock = 'loading-r196-retry';
  }

  function forceRenderer(reason) {
    if (isReady()) return finishReady('painted-before-retry');
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
    root.dataset.fxCoreNeverStuck = 'retry-' + retryCount + '-r196';
    root.dataset.fxCoreRecoveryReason = reason || 'first-frame-watchdog';

    const script = document.createElement('script');
    script.src = RENDERER_URL + '&attempt=' + retryCount;
    script.async = false;
    script.dataset.fxCoreRecoveryR195 = String(retryCount);
    script.dataset.fxCoreRecoveryR196 = String(retryCount);
    script.addEventListener('load', () => {
      setTimeout(() => {
        if (isReady()) finishReady('retry-' + retryCount + '-painted');
        else if (retryCount < 2) forceRenderer('script-loaded-without-painted-frame');
        else showFallback('script-loaded-without-painted-frame');
      }, 260);
    }, { once: true });
    script.addEventListener('error', () => {
      if (retryCount < 2) forceRenderer('renderer-network-error');
      else showFallback('renderer-network-error');
    }, { once: true });
    document.head.appendChild(script);
  }

  function start() {
    if (new URLSearchParams(location.search).get('lighthouse') === '1') return;
    root.dataset.fxCoreNeverStuck = 'watching-first-painted-frame-r196';

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (isReady()) finishReady('native-painted-fast');
        else forceRenderer('first-painted-frame-deadline');
      }, 700);
    });

    fallbackTimer = setTimeout(() => {
      if (isReady()) finishReady('native-painted-before-hard-deadline');
      else showFallback('hard-deadline-3800ms');
    }, 3800);
  }

  const frameObserver = new MutationObserver(() => {
    if (isReady()) finishReady('render-ms-first-frame');
  });
  frameObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-core-render-ms'] });

  window.addEventListener(READY_EVENT, () => {
    // The renderer historically emits this before its first draw. r196 deliberately
    // waits for data-fx-core-render-ms instead of trusting initialization alone.
    if (isReady()) finishReady('real3dready-with-painted-frame');
    else root.dataset.fxCoreNeverStuck = 'initialized-awaiting-painted-frame-r196';
  });
  window.addEventListener('formatx:core3dfallback', () => {
    if (!completed && !isReady()) forceRenderer('core3dfallback-event');
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && !isReady()) setTimeout(() => forceRenderer('bfcache-restore'), 80);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());
