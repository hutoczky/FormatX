(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR637) return;
  root.dataset.fxDeferredCssR637 = 'critical-core-persistent-paint-quiet-r796';
  root.dataset.fxDeferredCssPolicyR637 = 'structural-core-persistent-decorative-post-release-r796';
  root.dataset.fxDeferredCssFloorR651 = 'preloader-release';
  root.dataset.fxCriticalCorePaintR793 = 'retired-r796-structural-core-persistent';

  // R796: never media-toggle the generated critical core. R793 proved that doing
  // so shifts the desktop hero/header when the structural cascade returns and does
  // not improve bounded release timing. R794's navigation-critical paint quieting
  // remains the compositor control; geometry stays stable from first paint onward.
  root.classList.add('fx-startup-paint-quiet-r791');
  root.dataset.fxStartupPaintQuietR791 = 'armed-before-settled-release-frame';

  let activated = false;
  let frame = 0;
  let commitTimer = 0;
  let fallback = 0;
  let paintReleaseFrame = 0;

  // R789: covered decoration is defined in the render-blocking intro stylesheet.
  // Runtime style elements violate the public style-src policy.

  // Until the authored HTML boot state is migrated, normalize its historical
  // fx-intro-complete marker before event-horizon executes. This is boot-state
  // normalization only; event-horizon R769 is the sole completion publisher.
  if (root.dataset.fxPreloaderR531 !== 'done' && root.classList.contains('fx-intro-complete')) {
    root.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    root.classList.add('fx-intro-pending');
    root.dataset.fxIntro = 'bounded-release-pending-r769';
    root.dataset.fxIntroBootStateR769 = 'normalized-before-event-horizon';
  }

  function preserveCriticalGeometryOwner() {
    // R785: the render-blocking first-frame bundles already own settled hero/MAG
    // geometry (including the r286 native WebGL geometry contract). Activating the
    // complete signature bundle here duplicated those rules and also pulled
    // gradients, backdrop filters, transitions and below-fold decoration into the
    // release window. Keep the full signature sheet deferred with the rest of the
    // non-critical presentation layer.
    const link = document.querySelector('link[data-fx-critical-signature-r227][data-fx-r637-href]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCriticalGeometryR717 = 'unavailable';
      return false;
    }
    root.dataset.fxCriticalGeometryR717 = 'owned-by-render-blocking-first-frame-r785';
    root.dataset.fxCriticalGeometryHrefR717 = 'signature-remains-post-intro';
    return true;
  }

  function releasePaintQuietAfterDeferredCommit() {
    if (paintReleaseFrame) return;
    paintReleaseFrame = requestAnimationFrame(() => {
      paintReleaseFrame = 0;
      root.classList.remove('fx-startup-paint-quiet-r791');
      root.dataset.fxStartupPaintQuietR791 = 'released-after-deferred-settled-frame-r796';
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

    // Structural critical CSS stays live. Only explicitly deferred presentation
    // sheets are materialised after the hero has committed stable post-intro frames.
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

    root.dataset.fxDeferredCssR487 = 'ready-post-intro-r796';
    root.dataset.fxDeferredCssR637 = 'ready-post-intro-network-restored-r796';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssNetworkRestoredR637 = String(restored);
    root.dataset.fxDeferredCssReasonR526 = reason;
    root.dataset.fxDeferredCssActivatedAtR651 = String(Math.round(performance.now()));
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, restored, scheduler: 'persistent-core-settled-hero-plus-180ms-r796', reason }
    }));

    releasePaintQuietAfterDeferredCommit();
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame || commitTimer) return;
    // A single rAF callback still runs before that frame is painted. Nesting a
    // second rAF guarantees one post-release frame can actually commit. The short
    // grace is for optional presentation only; it never changes the preloader clock,
    // deadline, completion event, MAG readiness, scroll ownership or semantics.
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
    if (activated) return;
    if (!preloaderComplete()) return;
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
