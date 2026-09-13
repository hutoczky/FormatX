(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR637) return;
  root.dataset.fxDeferredCssR637 = 'structural-core-live-paint-quiesced-r799';
  root.dataset.fxDeferredCssPolicyR637 = 'layout-live-compositor-quiet-until-settled-release-r799';
  root.dataset.fxDeferredCssFloorR651 = 'preloader-release';

  // R799: structural CSS must never be toggled out of the cascade. R798 proved
  // that doing so meets the intro deadline, but its post-release reattachment
  // creates a material desktop layout shift. Keep geometry live continuously and
  // quiet only non-layout paint/compositor work hidden behind the intro cover.
  function quiesceDesktopCriticalCore() {
    const link = document.querySelector('link[data-fx-critical-core-r227]');
    if (!(link instanceof HTMLLinkElement)) return null;
    link.removeAttribute('fetchpriority');
    root.dataset.fxCriticalCorePaintR793 = 'structural-core-live-paint-quiesced-r799';
    return link;
  }

  const desktopCriticalCore = quiesceDesktopCriticalCore();

  function restoreDesktopCriticalCore(reason) {
    // R799: retained as the single durable bookkeeping owner. There is no media
    // mutation to restore; the full structural cascade has remained live.
    if (!(desktopCriticalCore instanceof HTMLLinkElement)) return;
    root.dataset.fxCriticalCorePaintR793 = 'structural-core-remained-live-r799';
    root.dataset.fxCriticalCoreRestoreReasonR793 = reason;
  }

  // Covered decoration is not allowed to compete with the absolute intro deadline.
  // Geometry, visibility, semantic content and hit targets remain fully live.
  // R801: covered paint rules belong to the blocking external stylesheet.
  root.classList.add('fx-startup-paint-quiet-r791');
  root.dataset.fxStartupPaintQuietR791 = 'armed-layout-live-compositor-quiet-r799';

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
    // The render-blocking first-frame bundles plus continuously live structural
    // core own settled hero/MAG geometry. The complete signature sheet remains
    // deferred so optional decoration stays outside the release window.
    const link = document.querySelector('link[data-fx-critical-signature-r227][data-fx-r637-href]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCriticalGeometryR717 = 'unavailable';
      return false;
    }
    root.dataset.fxCriticalGeometryR717 = 'structural-core-and-first-frame-live-r799';
    root.dataset.fxCriticalGeometryHrefR717 = 'signature-remains-post-intro';
    return true;
  }

  function releasePaintQuietAfterCoreCommit() {
    if (paintReleaseFrame) return;
    paintReleaseFrame = requestAnimationFrame(() => {
      paintReleaseFrame = 0;
      root.classList.remove('fx-startup-paint-quiet-r791');
      root.dataset.fxStartupPaintQuietR791 = 'released-after-layout-stable-frame-r799';
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

    restoreDesktopCriticalCore('layout-remained-live-through-release-r799');

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

    root.dataset.fxDeferredCssR487 = 'ready-post-intro-r799';
    root.dataset.fxDeferredCssR637 = 'ready-post-intro-network-restored-r799';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssNetworkRestoredR637 = String(restored);
    root.dataset.fxDeferredCssReasonR526 = reason;
    root.dataset.fxDeferredCssActivatedAtR651 = String(Math.round(performance.now()));
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, restored, scheduler: 'layout-live-compositor-quiet-settled-hero-plus-180ms-r799', reason }
    }));

    releasePaintQuietAfterCoreCommit();
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame || commitTimer) return;
    // A single rAF callback still runs before that frame is painted. Nesting a
    // second rAF guarantees one post-release frame can commit before optional
    // presentation materialises. This never changes the intro timing contract.
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
