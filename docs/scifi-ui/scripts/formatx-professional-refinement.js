(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxProfessionalRefinement) return;

  // The former refinement layer rewrote the iframe source back to the heavy
  // WebGPU stage and allocated a second audio graph. The safe 3D gate now owns
  // the stage and the primary Three host owns audio, so this legacy layer must
  // remain inert in production.
  root.dataset.fxProfessionalRefinement = root.dataset.fxSafeThreeGate === 'ready-v1'
    ? 'safe-gate-bypass'
    : 'legacy-disabled';
}());
