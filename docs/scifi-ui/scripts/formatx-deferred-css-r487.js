(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR487) return;
  root.dataset.fxDeferredCssR487 = 'queued-fcp';

  let activated = false;
  let frame = 0;
  let fallback = 0;
  let quietTimer = 0;
  let observer = null;

  function activate(reason) {
    if (activated) return;
    activated = true;
    if (frame) cancelAnimationFrame(frame);
    if (fallback) clearTimeout(fallback);
    if (quietTimer) clearTimeout(quietTimer);
    observer?.disconnect?.();

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    let activatedCount = 0;
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
      activatedCount += 1;
    }

    root.dataset.fxDeferredCssR487 = 'ready-fcp';
    root.dataset.fxDeferredCssCountR487 = String(activatedCount);
    root.dataset.fxDeferredCssReasonR526 = reason;
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-first-contentful-paint-r526', reason }
    }));
  }

  /* R2020: the canonical hero is already painted and fully styled by the
     render-blocking P0 and reference sheets. The remaining 15 optional CSS
     bundles are for below-the-fold sections/interaction. Applying all of
     them in the first post-FCP task forces a large site-wide style recalc
     while the visible FORMATX heading is becoming the LCP candidate.
     Give that real first frame time to settle. Real user intent activates
     every optional bundle immediately; no audit/user-agent branching. */
  function activateAfterCommittedFrame(reason) {
    if (activated || frame || quietTimer) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      // R2020: hero disclosure is critical state, not optional below-fold UI.
      // Keep the single-organism scene overlay contract identical to the
      // previous immediate-post-FCP activation on every device.
      const sceneCss = document.querySelector('link[data-fx-cinematic-journey-r536][data-fx-r487-deferred-style]');
      if (sceneCss instanceof HTMLLinkElement) {
        sceneCss.media = sceneCss.dataset.fxR487Media || 'all';
      }
      quietTimer = setTimeout(() => {
        quietTimer = 0;
        activate(reason + '-quiet-window');
      }, 2200);
    });
  }
  const intentTypes = ['pointerdown','wheel','touchstart','keydown','scroll'];
  function onIntent() { activate('user-intent'); }
  for (const type of intentTypes) {
    addEventListener(type, onIntent, { passive: true, capture: true });
  }
  addEventListener('pagehide', () => {
    for (const type of intentTypes) removeEventListener(type, onIntent, true);
    if (frame) cancelAnimationFrame(frame);
    if (fallback) clearTimeout(fallback);
    if (quietTimer) clearTimeout(quietTimer);
  }, { once: true });

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

  // Background tabs may never publish an FCP entry. Activating while hidden is
  // safe because no user-visible first paint can be displaced.
  fallback = setTimeout(() => {
    if (!activated && document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
  }, 8000);
}());
