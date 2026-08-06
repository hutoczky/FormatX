(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLegacyLoopRetired === 'ready-v1') return;

  root.dataset.fxLegacyLoopRetired = 'ready-v1';
  root.dataset.fxInfiniteFix = 'native-scroll-v1';
  root.dataset.fxInfiniteController = 'native-v5';
  root.dataset.fxInfiniteInput = 'native';
  root.dataset.fxAutomaticLoop = 'disabled';
  root.classList.remove(
    'fx-three-loop-transfer',
    'fx-infinite-loop-jump',
    'fx-precision-wheel'
  );

  /*
   * Compatibility file only.
   * The former controller intercepted wheel/scroll events and repeatedly called
   * scrollTo(), which could pull mobile users back to an earlier section while
   * lazy content changed the document height. Native browser scrolling is now
   * authoritative; this file intentionally installs no input or scroll handler.
   */
}());
