(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR487) return;
  root.dataset.fxDeferredCssR487 = 'queued-fcp';

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

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    let activatedCount = 0;
    let dormantIntroCount = 0;
    let dormantCoreCount = 0;
    // R2030: If no birth film is present, activating its 3D, overlay and
    // identification styles after first paint triggers needless style work.
    // This is based on real scene ownership, never browser/benchmark identity.
    const introActive = root.dataset.fxIntroPrepaintR1611 === 'show'
      || root.dataset.fxMagBirthLiveR533 === 'active';
    const introOnly = new Set([
      'fxMagBirthCriticalR1572',
      'fxIntroCriticalR1588',
      'fxMagBirthLiveR533',
      'fxAiCoreIdentR1951'
    ]);
    const activateLink = link => {
      if (!(link instanceof HTMLLinkElement)) return;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
      link.removeAttribute('data-fx-dormant-intro-r2030');
    };
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      if (!introActive && [...introOnly].some(name => link.dataset[name] === 'true')) {
        link.dataset.fxDormantIntroR2030 = 'true';
        dormantIntroCount++;
        continue;
      }
      // R2032: the full legacy core stylesheet is for the enhanced 3D
      // renderer, not the static first frame. Keep it dormant until the
      // actual MAG is requested, or a short unconditional safety fallback.
      // P0 and r283 remain the canonical immediate hero typography/geometry.
      if (!introActive && link.dataset.fxCriticalCoreR227 === 'true'
          && !window.FormatXLivingCore?.sharedWebGL2) {
        link.dataset.fxDormantCoreR2032 = 'true';
        dormantCoreCount++;
        continue;
      }
      activateLink(link);
      activatedCount++;
    }
    // A later explicit replay must still have the exact cinematic styling.
    // The file is retained; nothing is removed from the product experience.
    if (dormantIntroCount) {
      const awaken = () => {
        document.querySelectorAll('link[data-fx-dormant-intro-r2030]').forEach(activateLink);
        root.dataset.fxDeferredIntroR2030 = 'awakened';
      };
      document.addEventListener('formatx:magbirthcorewarmup', awaken, { once: true });
      document.addEventListener('formatx:magbirthcomplete', awaken, { once: true });
      new MutationObserver((records, observer) => {
        if (root.dataset.fxIntroPrepaintR1611 !== 'show') return;
        awaken();
        observer.disconnect();
      }).observe(root, { attributes: true, attributeFilter: ['data-fx-intro-prepaint-r1611'] });
    }

    if (dormantCoreCount) {
      let coreTimer = 0;
      let coreReady = false;
      const wakeCore = event => {
        if (coreReady) return;
        coreReady = true;
        if (coreTimer) clearTimeout(coreTimer);
        document.querySelectorAll('link[data-fx-dormant-core-r2032]').forEach(link => {
          activateLink(link);
          link.removeAttribute('data-fx-dormant-core-r2032');
        });
        root.dataset.fxDeferredCoreR2032 = typeof event === 'string' ? event : 'real-user-intent';
        for (const type of ['pointerdown','wheel','touchstart','keydown','scroll'])
          removeEventListener(type, wakeCore);
        for (const type of ['formatx:immersiveactivate','formatx:real3dready',
          'formatx:magbirthcorewarmup','formatx:coreinteraction'])
          removeEventListener(type, wakeCore);
      };
      for (const type of ['pointerdown','wheel','touchstart','keydown','scroll'])
        addEventListener(type, wakeCore, { passive: true, once: true });
      for (const type of ['formatx:immersiveactivate','formatx:real3dready',
        'formatx:magbirthcorewarmup','formatx:coreinteraction'])
        addEventListener(type, wakeCore, { once: true });
      coreTimer = setTimeout(() => wakeCore('post-paint-auto-fallback'), 2600);
    }

    root.dataset.fxDeferredCssR487 = 'ready-fcp';
    root.dataset.fxDeferredCssCountR487 = String(activatedCount);
    root.dataset.fxDeferredIntroCountR2030 = String(dormantIntroCount);
    root.dataset.fxDeferredCoreCountR2032 = String(dormantCoreCount);
    root.dataset.fxDeferredCssReasonR526 = reason;
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-first-contentful-paint-r526', reason }
    }));
  }

  /* R2022: always activate optional styles immediately after FCP. The
     timed quiet window worsened desktop variance and mobile Speed Index.
     Keep the same CSS for Lighthouse and real visitors; do not skip the
     canonical core in automated browsers. */
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

  // Background tabs may never publish an FCP entry. Activating while hidden is
  // safe because no user-visible first paint can be displaced.
  fallback = setTimeout(() => {
    if (!activated && document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
  }, 8000);
}());
