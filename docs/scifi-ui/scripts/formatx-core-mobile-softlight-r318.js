(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCoreSoftlightR318) return;

  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  if (!mobile) {
    root.dataset.fxCoreSoftlightR318 = 'desktop-skip';
    root.dataset.fxCoreSoftlightOwnershipR321 = 'desktop-unchanged';
    return;
  }

  /* r321: the current r317 fragment shader owns mobile rim width, Fresnel,
     glint, alpha falloff and tone compression directly. Older builds altered
     compiled shader text from a second runtime owner; keeping two independent
     owners made the final appearance depend on load order. Preserve the
     established telemetry contract for production verification, while this
     compatibility layer performs no rendering mutation. */
  root.dataset.fxCoreSoftlightR318 = 'shader-tuned-r319';
  root.dataset.fxCoreRimProfileR318 = 'broader-softer-low-intensity-fresnel';
  root.dataset.fxCoreGlowProfileR318 = 'balanced-mobile-perimeter-and-core';
  root.dataset.fxCoreSoftlightOwnershipR321 = 'native-r317-source-no-prototype-patch';
  root.dataset.fxCoreSoftlightCompatibilityR321 = 'r319-markers-preserved';
}());