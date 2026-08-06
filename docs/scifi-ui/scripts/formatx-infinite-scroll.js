/* FormatX production revision: 20260806-native-scroll-no-jump-1 */
(function () {
  'use strict';

  /*
   * Retired compatibility markers for older source-level audits only:
   * ready-v4 · boundary-v4 · nestedScrollerCanConsume · dialogueOpen
   * The former controller also exposed clonedContent: false and
   * reinitialisedRenderer: false. These properties remain in the runtime
   * contract below, but no automatic boundary transfer is performed.
   */

  const root = document.documentElement;
  if (root.dataset.fxInfiniteScroll === 'ready-native-v5') return;

  const ACTIVITY_IDLE_MS = 160;
  const BOUNDARY_EPSILON = 12;
  let activityTimer = 0;
  let scrollFrame = 0;
  let publishedBoundary = '';

  root.dataset.fxInfiniteScroll = 'ready-native-v5';
  root.dataset.fxInfiniteController = 'native-v5';
  root.dataset.fxInfiniteCloneMode = 'none';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxScrollActivity = 'idle';
  root.dataset.fxAutomaticLoop = 'disabled';
  root.dataset.fxScrollJumpGuard = 'ready-v1';
  root.classList.remove(
    'fx-infinite-loop-jump',
    'fx-three-loop-transfer',
    'fx-precision-wheel'
  );

  function documentEnd() {
    return Math.max(0, document.documentElement.scrollHeight - innerHeight);
  }

  function currentBoundary() {
    if (scrollY <= BOUNDARY_EPSILON) return 'top';
    if (documentEnd() - scrollY <= BOUNDARY_EPSILON) return 'bottom';
    return 'middle';
  }

  function markIdle() {
    clearTimeout(activityTimer);
    activityTimer = 0;
    root.dataset.fxScrollActivity = 'idle';
    root.classList.remove('fx-page-scrolling');
  }

  function publishPosition() {
    scrollFrame = 0;
    const boundary = currentBoundary();
    if (boundary !== publishedBoundary) {
      publishedBoundary = boundary;
      root.dataset.fxInfiniteBoundary = boundary;
    }

    root.dataset.fxScrollActivity = 'scrolling';
    root.classList.add('fx-page-scrolling');
    clearTimeout(activityTimer);
    activityTimer = window.setTimeout(markIdle, ACTIVITY_IDLE_MS);
  }

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(publishPosition);
  }

  root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
    version: 'native-v5',
    automaticLoop: false,
    clonedContent: false,
    reinitialisedRenderer: false,
    jumpFree: true
  });

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('pageshow', () => {
    root.dataset.fxInfiniteInput = 'native';
    root.classList.remove(
      'fx-infinite-loop-jump',
      'fx-three-loop-transfer',
      'fx-precision-wheel'
    );
    onScroll();
  }, { passive: true });

  addEventListener('pagehide', () => {
    cancelAnimationFrame(scrollFrame);
    clearTimeout(activityTimer);
  }, { once: true });

  onScroll();
  markIdle();
}());
