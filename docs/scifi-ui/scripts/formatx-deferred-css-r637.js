(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR637) return;
  const ACTIVATE_FLOOR_MS = 2100;
  root.dataset.fxDeferredCssR637 = 'critical-geometry-pre-fcp-decorative-post-fcp';
  root.dataset.fxDeferredCssPolicyR637 = 'critical-geometry-pre-fcp-decorative-autonomous-post-fcp-no-user-audit-gate';
  root.dataset.fxDeferredCssFloorR651 = String(ACTIVATE_FLOOR_MS);

  let activated = false;
  let frame = 0;
  let fallback = 0;
  let floorTimer = 0;
  let observer = null;

  function activateCriticalGeometry() {
    const link = document.querySelector('link[data-fx-critical-signature-r227][data-fx-r637-href]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCriticalGeometryR717 = 'unavailable';
      return false;
    }
    const targetMedia = link.dataset.fxR487Media || link.dataset.fxDeferredMediaR300 || 'all';
    const deferredHref = link.dataset.fxR637Href || '';
    if (targetMedia && link.media !== targetMedia) link.media = targetMedia;
    if (deferredHref && !link.getAttribute('href')) link.setAttribute('href', deferredHref);
    link.setAttribute('fetchpriority', 'high');
    root.dataset.fxCriticalGeometryR717 = 'requested-before-fcp';
    root.dataset.fxCriticalGeometryHrefR717 = deferredHref ? 'canonical-r637-href' : 'existing-href';
    return true;
  }

  function activate(reason) {
    if (activated) return;
    activated = true;
    if (frame) cancelAnimationFrame(frame);
    if (fallback) clearTimeout(fallback);
    if (floorTimer) clearTimeout(floorTimer);
    frame = 0;
    fallback = 0;
    floorTimer = 0;
    observer?.disconnect?.();

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style],link[data-fx-r637-href]'));
    let restored = 0;
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || link.dataset.fxDeferredMediaR300 || 'all';
      const deferredHref = link.dataset.fxR637Href || '';
      if (targetMedia && link.media !== targetMedia) link.media = targetMedia;
      if (deferredHref && !link.getAttribute('href')) {
        link.setAttribute('href', deferredHref);
        restored += 1;
      }
      link.removeAttribute('fetchpriority');
    }

    root.dataset.fxDeferredCssR487 = 'ready-fcp-r651';
    root.dataset.fxDeferredCssR637 = 'ready-post-fcp-floor-network-restored';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssNetworkRestoredR637 = String(restored);
    root.dataset.fxDeferredCssReasonR526 = reason;
    root.dataset.fxDeferredCssActivatedAtR651 = String(Math.round(performance.now()));
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, restored, scheduler: 'critical-geometry-pre-fcp-plus-autonomous-post-fcp-absolute-2100-r717', reason }
    }));
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame || floorTimer) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const delay = Math.max(0, ACTIVATE_FLOOR_MS - performance.now());
      if (delay <= 0) {
        setTimeout(() => activate(reason), 0);
        return;
      }
      floorTimer = setTimeout(() => {
        floorTimer = 0;
        activate(`${reason}-floor`);
      }, delay);
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
          observer?.disconnect?.();
          observer = null;
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

  activateCriticalGeometry();

  if (!observeFcp()) {
    const afterLoad = () => activateAfterCommittedFrame('load-fallback');
    if (document.readyState === 'complete') afterLoad();
    else addEventListener('load', afterLoad, { once: true });
  }

  addEventListener('visibilitychange', () => {
    if (activated || document.visibilityState !== 'visible') return;
    if (hasFcp()) activateAfterCommittedFrame('visibility-buffered-fcp');
  }, { passive: true });

  fallback = setTimeout(() => {
    if (!activated && document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
  }, 8000);
}());
