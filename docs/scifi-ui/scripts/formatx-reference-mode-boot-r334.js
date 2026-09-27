(function () {
  'use strict';

  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse) and (max-width: 1100px), (max-aspect-ratio: 27/25)').matches;
  const mode = mobile ? 'ready' : 'desktop';

  root.dataset.fxReferenceProductionR244 = mode;
  root.dataset.fxReferenceComposition = mobile
    ? 'reference-frame-r244'
    : 'desktop-reference-r244';
  root.dataset.fxReferenceModeBootR334 = 'prepaint-' + mode;
}());
