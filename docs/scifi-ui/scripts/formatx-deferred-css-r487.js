(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR487) return;
  root.dataset.fxDeferredCssR487 = 'queued-fcp';

  let activated = false;
  let frame = 0;
  let fallback = 0;
  let observer = null;
  const observedStyles = new WeakSet();
  // R2118: track the completed URL, not just a link that may later be reused.
  const completedStyleUrls = new WeakMap();
  function recoverStyle(link, reason) {
    if (!(link instanceof HTMLLinkElement) || link.dataset.fxCssRetryR2054) return;
    // Never loop indefinitely on an unavailable asset or replace the content
    // with a visually misleading success state.
    link.dataset.fxCssRetryR2054 = 'attempted';
    const url = new URL(link.href, location.href);
    url.searchParams.set('fx-style-retry', 'r2054');
    link.href = url.href;
    root.dataset.fxCssRecoveriesR2054 = String(
      Number(root.dataset.fxCssRecoveriesR2054 || 0) + 1
    );
    link.dataset.fxCssRecoveryReasonR2054 = reason;
  }
  function observeStyleLinks() {
    for (const link of document.querySelectorAll('link[data-fx-r487-deferred-style]')) {
      if (!(link instanceof HTMLLinkElement) || observedStyles.has(link)) continue;
      observedStyles.add(link);
      const entries = typeof performance.getEntriesByName === 'function'
        ? performance.getEntriesByName(link.href, 'resource') : [];
      if (link.sheet || entries.some(entry => entry.responseEnd > 0)) completedStyleUrls.set(link, link.href);
      link.addEventListener('error', () => recoverStyle(link, 'stylesheet-load-error'));
      link.addEventListener('load', () => {
        completedStyleUrls.set(link, link.href);
        if (link.dataset.fxCssRetryR2054 === 'attempted')
          link.dataset.fxCssRetryR2054 = 'loaded';
      });
    }
  }
  observeStyleLinks();

  function activate(reason) {
    if (activated) return;
    activated = true;
    if (frame) cancelAnimationFrame(frame);
    if (fallback) clearTimeout(fallback);
    observer?.disconnect?.();

    observeStyleLinks();
    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    let activatedCount = 0;
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
      activatedCount += 1;
    }

    // A CSS link can fail before its deferred media is activated. Validate
    // materialized browser styles after paint, then retry a settled failure.
    // An unfinished download is not a missing stylesheet: keep its request
    // alive instead of canceling it and downloading the same CSS again.
    // This covers transient CDN/cache failures without hiding permanent faults.
    setTimeout(() => {
      for (const link of links) {
        if (link.media !== 'print' && link.media !== 'not all'
            && !link.sheet && completedStyleUrls.get(link) === link.href && !link.dataset.fxCssRetryR2054)
          recoverStyle(link, 'missing-active-stylesheet');
      }
    }, 1600);
    root.dataset.fxDeferredCssR487 = 'ready-fcp';
    root.dataset.fxDeferredCssCountR487 = String(activatedCount);
    root.dataset.fxDeferredCssReasonR526 = reason;
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-first-contentful-paint-r526', reason }
    }));
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      setTimeout(() => activate(reason), 0);
    });
  }

  function hasFcp() {
    return performance.getEntriesByName('first-contentful-paint', 'paint').length > 0;
  }

  function observeFcp() {
    if (hasFcp()) {
      activateAfterCommittedFrame('buffered-fcp');
      return true;
    }
    if (!('PerformanceObserver' in window)) return false;
    const supported = PerformanceObserver.supportedEntryTypes;
    if (Array.isArray(supported) && !supported.includes('paint')) return false;
    try {
      observer = new PerformanceObserver(list => {
        if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) {
          activateAfterCommittedFrame('observed-fcp');
        }
      });
      observer.observe({ type: 'paint', buffered: true });
      return true;
    } catch (_) {
      observer = null;
      return false;
    }
  }

  if (!observeFcp()) {
    const afterLoad = () => activateAfterCommittedFrame('load-fallback');
    if (document.readyState === 'complete') afterLoad();
    else addEventListener('load', afterLoad, { once: true });
  }

  addEventListener('visibilitychange', () => {
    if (activated || document.visibilityState !== 'visible') return;
    if (hasFcp()) activateAfterCommittedFrame('visibility-buffered-fcp');
  }, { passive: true });

  // R2022 visible-tab fail-open: certain clients report no buffered FCP and
  // lose the PerformanceObserver event. Without a watchdog every cinematic
  // stylesheet remains at media=print indefinitely and the MAG appears missing.
  // Keep the critical first paint asynchronous, then guarantee activation.
  fallback = setTimeout(() => {
    if (activated) return;
    if (document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
    else activateAfterCommittedFrame('visible-tab-fcp-watchdog');
  }, 3500);
}());
