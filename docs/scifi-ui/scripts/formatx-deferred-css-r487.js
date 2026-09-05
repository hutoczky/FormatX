(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR487) return;
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;
  root.dataset.fxDeferredCssR487 = mobile ? 'queued-mobile-intent-r534' : 'queued-fcp';

  let activated = false;
  let frame = 0;
  let fallback = 0;
  let observer = null;

  function activate(reason) {
    if (activated) return;
    activated = true;
    if (frame) cancelAnimationFrame(frame);
    if (fallback) clearTimeout(fallback);
    observer?.disconnect?.();
    cleanupIntent?.();

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
    }

    root.dataset.fxDeferredCssR487 = mobile ? 'ready-mobile-intent-r534' : 'ready-fcp';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssReasonR526 = reason;
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: mobile ? 'mobile-user-intent-r534' : 'post-first-contentful-paint-r526', reason }
    }));
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      setTimeout(() => activate(reason), 0);
    });
  }

  function hasFcp() { return performance.getEntriesByName('first-contentful-paint', 'paint').length > 0; }
  function observeFcp() {
    if (hasFcp()) { activateAfterCommittedFrame('buffered-fcp'); return true; }
    if (!('PerformanceObserver' in window)) return false;
    const supported = PerformanceObserver.supportedEntryTypes;
    if (Array.isArray(supported) && !supported.includes('paint')) return false;
    try {
      observer = new PerformanceObserver(list => {
        if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) activateAfterCommittedFrame('observed-fcp');
      });
      observer.observe({ type: 'paint', buffered: true });
      return true;
    } catch (_) { observer = null; return false; }
  }

  let cleanupIntent = null;
  function armMobileIntent() {
    const listeners = [];
    const add = (target, type, handler, options) => { target.addEventListener(type, handler, options); listeners.push([target,type,handler,options]); };
    cleanupIntent = () => { for (const [target,type,handler,options] of listeners) target.removeEventListener(type, handler, options); listeners.length = 0; };
    const activateEvent = event => activate('mobile-' + (event.type || 'intent'));
    const pointer = event => { if (event.pointerType === 'touch') activate('mobile-pointer-touch'); };
    const key = event => { if (['ArrowDown','ArrowUp','PageDown','PageUp','End','Home',' '].includes(event.key)) activate('mobile-keyboard-scroll'); };
    add(window, 'scroll', activateEvent, { capture: true, passive: true });
    add(window, 'wheel', activateEvent, { capture: true, passive: true });
    add(document, 'touchstart', activateEvent, { capture: true, passive: true });
    add(document, 'pointerdown', pointer, { capture: true, passive: true });
    add(document, 'keydown', key, { capture: true, passive: true });
    if (Math.abs(scrollY) > 1 || !['', '#top', '#hero'].includes(location.hash)) queueMicrotask(() => activate('mobile-existing-scroll-or-deep-link'));
  }

  if (mobile) {
    armMobileIntent();
  } else if (!observeFcp()) {
    const afterLoad = () => activateAfterCommittedFrame('load-fallback');
    if (document.readyState === 'complete') afterLoad();
    else addEventListener('load', afterLoad, { once: true });
  }

  addEventListener('visibilitychange', () => {
    if (activated || document.visibilityState !== 'visible' || mobile) return;
    if (hasFcp()) activateAfterCommittedFrame('visibility-buffered-fcp');
  }, { passive: true });

  fallback = setTimeout(() => {
    if (!activated && document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
  }, 8000);
}());