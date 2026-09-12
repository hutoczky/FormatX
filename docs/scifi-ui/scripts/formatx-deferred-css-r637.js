(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxDeferredCssR637) return;
  root.dataset.fxDeferredCssR637 = 'critical-geometry-pre-fcp-decorative-post-intro';
  root.dataset.fxDeferredCssPolicyR637 = 'critical-geometry-pre-fcp-deferred-post-intro-committed-frame-r768';
  root.dataset.fxDeferredCssFloorR651 = 'preloader-release';
  root.dataset.fxIntroCompletionGuardR768 = 'canonical-preloader-release-only';

  let activated = false;
  let frame = 0;
  let commitTimer = 0;
  let fallback = 0;
  let canonicalIntroReleased = root.dataset.fxPreloaderR531 === 'done';
  let completionQueued = false;

  function suppressPrematureIntroComplete() {
    if (canonicalIntroReleased) return;
    root.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    root.classList.add('fx-intro-pending');
    if (root.dataset.fxIntro !== 'bounded-release-pending-r768') {
      root.dataset.fxIntro = 'bounded-release-pending-r768';
    }
  }

  // R768 diagnostic owner: index.html historically starts in fx-intro-complete and
  // event-horizon publishes the same class/event before its bounded visual release.
  // Keep that premature state from reaching later defer scripts. Rendering cannot
  // occur between this script task and the MutationObserver microtask, so downstream
  // consumers see one durable completion edge: formatx:preloadercomplete.
  suppressPrematureIntroComplete();
  const completionObserver = new MutationObserver(() => {
    if (!canonicalIntroReleased && root.classList.contains('fx-intro-complete')) {
      suppressPrematureIntroComplete();
    }
  });
  completionObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

  function blockPrematureIntroEvent(event) {
    if (canonicalIntroReleased) return;
    event.stopImmediatePropagation();
    suppressPrematureIntroComplete();
    root.dataset.fxIntroCompletionGuardR768 = 'premature-introcomplete-quarantined';
  }
  document.addEventListener('formatx:introcomplete', blockPrematureIntroEvent, true);

  function publishCanonicalIntroCompletion(source) {
    if (!canonicalIntroReleased || completionQueued) return;
    completionQueued = true;
    queueMicrotask(() => {
      root.dataset.fxIntroCompletionGuardR768 = 'canonical-release-published';
      document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
        detail: { source: source || 'preloadercomplete-r768', revision: 'r768' }
      }));
    });
  }

  function commitCanonicalIntroCompletion(event) {
    if (canonicalIntroReleased) return;
    canonicalIntroReleased = true;
    completionObserver.disconnect();
    document.removeEventListener('formatx:introcomplete', blockPrematureIntroEvent, true);
    root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro = 'canonical-preloader-release-r768';
    publishCanonicalIntroCompletion(event?.detail?.source || 'preloadercomplete-r768');
  }

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
    if (commitTimer) clearTimeout(commitTimer);
    if (fallback) clearTimeout(fallback);
    frame = 0;
    commitTimer = 0;
    fallback = 0;

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

    root.dataset.fxDeferredCssR487 = 'ready-post-intro-r768';
    root.dataset.fxDeferredCssR637 = 'ready-post-intro-network-restored';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    root.dataset.fxDeferredCssNetworkRestoredR637 = String(restored);
    root.dataset.fxDeferredCssReasonR526 = reason;
    root.dataset.fxDeferredCssActivatedAtR651 = String(Math.round(performance.now()));
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, restored, scheduler: 'critical-geometry-pre-fcp-plus-post-intro-committed-frame-r768', reason }
    }));
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame || commitTimer) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      commitTimer = setTimeout(() => {
        commitTimer = 0;
        activate(reason);
      }, 0);
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

  activateCriticalGeometry();

  document.addEventListener('formatx:preloadercomplete', event => {
    commitCanonicalIntroCompletion(event);
    releaseDeferredStyles('preloader-complete');
  }, { once: true, capture: true });

  // Durable-state catch-up for late execution or a very fast reduced-motion path.
  if (preloaderComplete()) {
    canonicalIntroReleased = true;
    completionObserver.disconnect();
    document.removeEventListener('formatx:introcomplete', blockPrematureIntroEvent, true);
    root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    root.classList.add('fx-intro-complete');
    releaseDeferredStyles('preloader-complete-buffered');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (preloaderComplete()) {
      releaseDeferredStyles('domready-preloader-complete');
      return;
    }
    // A document without the intro owner must not strand the deferred sheets.
    if (!document.getElementById('formatx-event-horizon')) {
      canonicalIntroReleased = true;
      completionObserver.disconnect();
      document.removeEventListener('formatx:introcomplete', blockPrematureIntroEvent, true);
      root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
      root.classList.add('fx-intro-complete');
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
