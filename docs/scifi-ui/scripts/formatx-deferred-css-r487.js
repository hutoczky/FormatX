(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR487) return;
  root.dataset.fxDeferredCssR487 = 'queued';

  let activated = false;
  let frame = 0;
  let paintObserver = null;

  function activate() {
    if (activated) return;
    activated = true;
    cancelAnimationFrame(frame);
    paintObserver?.disconnect();
    paintObserver = null;

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
    }

    root.dataset.fxDeferredCssR487 = 'ready';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssGateR517 = 'first-contentful-paint';
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-fcp-r517' }
    }));
  }

  function hasFirstContentfulPaint() {
    try {
      return performance.getEntriesByType('paint')
        .some(entry => entry.name === 'first-contentful-paint');
    } catch (_) {
      return false;
    }
  }

  function legacyFrameGate() {
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(activate);
    });
  }

  function armPaintGate() {
    if (activated) return;
    if (hasFirstContentfulPaint()) {
      queueMicrotask(activate);
      return;
    }

    try {
      const supported = Array.isArray(PerformanceObserver.supportedEntryTypes)
        && PerformanceObserver.supportedEntryTypes.includes('paint');
      if (!supported) {
        legacyFrameGate();
        return;
      }
      paintObserver = new PerformanceObserver(list => {
        if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) activate();
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (_) {
      legacyFrameGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armPaintGate, { once: true });
  } else {
    armPaintGate();
  }

  // R517: do not use a clock-based fail-open here. R487's 1800 ms timeout could
  // activate deferred styles before Chromium's delayed first frame, turning a
  // post-first-paint enhancement into first-frame style/layout work. Visibility
  // changes only re-check real buffered paint evidence; they do not guess time.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasFirstContentfulPaint()) activate();
  }, { passive: true });
}());
