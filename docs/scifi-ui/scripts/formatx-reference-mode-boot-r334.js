(function () {
  'use strict';

  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const mode = mobile ? 'ready' : 'desktop';

  /* R677 — reserve the desktop scrollbar gutter before deferred geometry/content
     materialises. R674 Lighthouse showed a 1350px viewport settling to 1335px,
     with #hero and .topbar owning almost the entire CLS. Keeping the gutter stable
     prevents that whole-page width shift without changing content or audit paths. */
  root.style.scrollbarGutter = 'stable';

  root.dataset.fxReferenceProductionR244 = mode;
  root.dataset.fxReferenceComposition = mobile
    ? 'reference-frame-r244'
    : 'desktop-reference-r244';
  root.dataset.fxReferenceModeBootR334 = 'prepaint-' + mode;
  root.dataset.fxScrollbarGutterR677 = 'stable-navigation-owned';
}());
