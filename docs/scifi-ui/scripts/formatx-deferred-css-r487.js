(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR487) return;
  root.dataset.fxDeferredCssR487 = 'queued';

  let activated = false;
  let frame = 0;
  let fallback = 0;

  function activate() {
    if (activated) return;
    activated = true;
    cancelAnimationFrame(frame);
    clearTimeout(fallback);

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
    }

    root.dataset.fxDeferredCssR487 = 'ready';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-first-paint-r487' }
    }));
  }

  function afterFirstPaint() {
    // First RAF runs before paint. The second callback is queued from the first,
    // letting Chromium commit one stable critical frame before non-critical
    // styles participate in cascade/layout.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        setTimeout(activate, 0);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterFirstPaint, { once: true });
  } else {
    afterFirstPaint();
  }

  // Fail-open for unusual background tabs / throttled RAF scheduling.
  fallback = setTimeout(activate, 1800);
}());
