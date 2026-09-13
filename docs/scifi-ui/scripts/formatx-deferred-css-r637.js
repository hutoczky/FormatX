(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR637) return;
  root.dataset.fxDeferredCssR637 = 'desktop-core-quiesced-settled-release-r798';
  root.dataset.fxDeferredCssPolicyR637 = 'first-frame-geometry-live-full-core-post-release-r798';
  root.dataset.fxDeferredCssFloorR651 = 'preloader-release';

  // R798: keep render-blocking first-frame geometry live, but take the generated
  // full desktop core out of the opaque intro cascade. Exact R794 evidence showed
  // this removes the release-window compositor starvation while preserving the
  // authored geometry owners. The full core returns only after stable hero frames.
  function quiesceDesktopCriticalCore() {
    if (!matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 901px)').matches) return null;
    const link = document.querySelector('link[data-fx-critical-core-r227]');
    if (!(link instanceof HTMLLinkElement)) return null;
    if (!link.dataset.fxR798Media) link.dataset.fxR798Media = link.media || 'all';
    link.media = 'not all';
    link.removeAttribute('fetchpriority');
    root.dataset.fxCriticalCorePaintR793 = 'quiesced-behind-intro-first-frame-geometry-live-r798';
    return link;
  }

  const desktopCriticalCore = quiesceDesktopCriticalCore();

  function restoreDesktopCriticalCore(reason) {
    if (!(desktopCriticalCore instanceof HTMLLinkElement)) return;
    const media = desktopCriticalCore.dataset.fxR798Media;
    if (!media) return;
    desktopCriticalCore.media = media;
    delete desktopCriticalCore.dataset.fxR798Media;
    root.dataset.fxCriticalCorePaintR793 = 'restored-post-release-settled-frame-r798';
    root.dataset.fxCriticalCoreRestoreReasonR793 = reason;
  }

  // Covered decoration is not allowed to compete with the absolute intro deadline.
  // This class only quiets paint/compositor effects; semantic/layout owners remain live.
  root.classList.add('fx-startup-paint-quiet-r791');
  root.dataset.fxStartupPaintQuietR791 = 'armed-before-settled-release-frame';

  let activated = false;
  let frame = 0;
  let commitTimer = 0;
  let fallback = 0;
  let paintReleaseFrame = 0;

  // Until the authored HTML boot state is migrated, normalize its historical
  // fx-intro-complete marker before event-horizon executes. This is boot-state
  // normalization only; event-horizon is the sole completion publisher.
  if (root.dataset.fxPreloaderR531 !== 'done' && root.classList.contains('fx-intro-complete')) {
    root.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    root.classList.add('fx-intro-pending');
    root.dataset.fxIntro = 'bounded-release-pending-r769';
    root.dataset.fxIntroBootStateR769 = 'normalized-before-event-horizon';
  }

  function preserveCriticalGeometryOwner() {
    // The render-blocking first-frame bundles own settled hero/MAG geometry.
    // Keep the complete signature sheet deferred so gradients, filters,
    // transitions and below-fold decoration stay outside the release window.
    const link = document.querySelector('link[data-fx-critical-signature-r227][data-fx-r637-href]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCriticalGeometryR717 = 'unavailable';
      return false;
    }
    root.dataset.fxCriticalGeometryR717 = 'owned-by-render-blocking-first-frame-r798';
    root.dataset.fxCriticalGeometryHrefR717 = 'signature-remains-post-intro';
    return true;
  }

  function releasePaintQuietAfterCoreCommit() {
    if (paintReleaseFrame) return;
    paintReleaseFrame = requestAnimationFrame(() => {
      paintReleaseFrame = 0;
      root.classList.remove('fx-startup-paint-quiet-r791');
      root.dataset.fxStartupPaintQuietR791 = 'released-after-core-settled-frame-r798';
    });
  }

  function activate(reason) {
    if (activated) return;
    activated = true;
    if (frame) cancelAnimationFrame(frame);
    if (commitTimer) clearTimeout(commitTimer);
    if (fallback) clearTimeout(fallback);
    frame = 0;
    commitTimer = 0;
    fallback = 0;

    // Restore the full desktop cascade only after canonical release has already
    // committed stable hero frames. Paint remains quiet for one further frame so
    // structural cascade and compositor-heavy decoration do not materialise together.
    restoreDesktopCriticalCore('post-release-settled-frame-r798');

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

    root.dataset.fxDeferredCssR487 = 'ready-post-intro-r798';
    root.dataset.fxDeferredCssR637 = 'ready-post-intro-network-restored-r798';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssNetworkRestoredR637 = String(restored);
    root.dataset.fxDeferredCssReasonR526 = reason;
    root.dataset.fxDeferredCssActivatedAtR651 = String(Math.round(performance.now()));
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, restored, scheduler: 'quiesced-core-settled-hero-plus-180ms-r798', reason }
    }));

    releasePaintQuietAfterCoreCommit();
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame || commitTimer) return;
    // A single rAF callback still runs before that frame is painted. Nesting a
    // second rAF guarantees one post-release frame can actually commit. The short
    // grace applies only to optional presentation and never changes intro timing.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0;
        commitTimer = setTimeout(() => {
          commitTimer = 0;
          activate(reason);
        }, 180);
      });
    });
  }

  function preloaderComplete() {
    return root.dataset.fxPreloaderR531 === 'done';
  }

  function releaseDeferredStyles(reason) {
    if (activated || !preloaderComplete()) return;
    activateAfterCommittedFrame(reason);
  }

  preserveCriticalGeometryOwner();

  document.addEventListener('formatx:preloadercomplete', () => {
    releaseDeferredStyles('preloader-complete');
  }, { once: true, capture: true });

  // Durable-state catch-up for late execution or a very fast reduced-motion path.
  if (preloaderComplete()) releaseDeferredStyles('preloader-complete-buffered');

  document.addEventListener('DOMContentLoaded', () => {
    if (preloaderComplete()) {
      releaseDeferredStyles('domready-preloader-complete');
      return;
    }
    // A document without the intro owner must not strand the deferred sheets.
    if (!document.getElementById('formatx-event-horizon')) {
      activateAfterCommittedFrame('domready-no-intro-owner');
    }
  }, { once: true });

  addEventListener('visibilitychange', () => {
    if (activated || document.visibilityState !== 'visible') return;
    releaseDeferredStyles('visibility-preloader-complete');
  }, { passive: true });

  // Hidden/background documents may never produce a useful animation frame.
  // Fail open without introducing a visible-page fixed activation timestamp.
  fallback = setTimeout(() => {
    if (!activated && document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
  }, 8000);
}());
