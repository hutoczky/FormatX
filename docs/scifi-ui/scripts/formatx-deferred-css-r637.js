(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR637) return;
  root.dataset.fxDeferredCssR637 = 'desktop-core-first-paint-settled-release-r837';
  root.dataset.fxDeferredCssPolicyR637 = 'critical-core-first-paint-secondary-css-post-release-r837';
  root.dataset.fxDeferredCssFloorR651 = 'preloader-release';

  // R837: R515 proved that toggling the structural critical core after first
  // paint directly owns desktop hero CLS. The current production Worker already
  // fetches this stylesheet as render-blocking first-paint geometry, so changing
  // its media here cannot save network critical-path time; it only removes and
  // later re-applies settled layout. Keep the lifecycle hook for compatibility,
  // but preserve the active sheet and its transport priority throughout intro.
  function quiesceDesktopCriticalCore() {
    if (!matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 901px)').matches) return null;
    const link = document.querySelector('link[data-fx-critical-core-r227]');
    if (!(link instanceof HTMLLinkElement)) return null;
    root.dataset.fxCriticalCorePaintR793 = 'preserved-first-paint-geometry-r837';
    root.dataset.fxCriticalCoreFirstPaintR837 = link.media || 'all';
    return link;
  }

  const desktopCriticalCore = quiesceDesktopCriticalCore();

  function restoreDesktopCriticalCore(reason) {
    if (!(desktopCriticalCore instanceof HTMLLinkElement)) return;
    // Compatibility lifecycle only: R837 intentionally performs no media/href
    // mutation because the structural sheet never left the active cascade.
    root.dataset.fxCriticalCorePaintR793 = 'continuous-first-paint-through-release-r837';
    root.dataset.fxCriticalCoreRestoreReasonR793 = reason;
  }

  // Covered decoration is not allowed to compete with the absolute intro deadline.
  // Geometry, visibility, semantic content and hit targets remain owned by the
  // navigation-critical first-frame bundles. CSP-safe covered paint rules remain
  // in the blocking external stylesheet.
  root.classList.add('fx-startup-paint-quiet-r791');
  root.dataset.fxStartupPaintQuietR791 = 'armed-before-settled-release-frame-r837';

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
    const link = document.querySelector('link[data-fx-critical-signature-r227][data-fx-r637-href]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCriticalGeometryR717 = 'unavailable';
      return false;
    }
    root.dataset.fxCriticalGeometryR717 = 'owned-by-render-blocking-core-plus-first-frame-r837';
    root.dataset.fxCriticalGeometryHrefR717 = 'signature-remains-post-intro';
    return true;
  }

  function releasePaintQuietAfterCoreCommit() {
    if (paintReleaseFrame) return;
    paintReleaseFrame = requestAnimationFrame(() => {
      paintReleaseFrame = 0;
      root.classList.remove('fx-startup-paint-quiet-r791');
      root.dataset.fxStartupPaintQuietR791 = 'released-after-core-settled-frame-r837';
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

    restoreDesktopCriticalCore('continuous-first-paint-release-r837');

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

    root.dataset.fxDeferredCssR487 = 'ready-post-intro-r837';
    root.dataset.fxDeferredCssR637 = 'ready-post-intro-network-restored-r837';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssNetworkRestoredR637 = String(restored);
    root.dataset.fxDeferredCssReasonR526 = reason;
    root.dataset.fxDeferredCssActivatedAtR651 = String(Math.round(performance.now()));
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, restored, scheduler: 'critical-core-continuous-secondary-css-single-frame-r843', reason }
    }));

    releasePaintQuietAfterCoreCommit();
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame || commitTimer) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      activate(reason);
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

  if (preloaderComplete()) releaseDeferredStyles('preloader-complete-buffered');

  document.addEventListener('DOMContentLoaded', () => {
    if (preloaderComplete()) {
      releaseDeferredStyles('domready-preloader-complete');
      return;
    }
    if (!document.getElementById('formatx-event-horizon')) {
      activateAfterCommittedFrame('domready-no-intro-owner');
    }
  }, { once: true });

  addEventListener('visibilitychange', () => {
    if (activated || document.visibilityState !== 'visible') return;
    releaseDeferredStyles('visibility-preloader-complete');
  }, { passive: true });

  fallback = setTimeout(() => {
    if (!activated && document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
  }, 8000);
}());
