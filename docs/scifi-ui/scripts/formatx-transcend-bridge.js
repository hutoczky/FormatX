(function () {
  'use strict';

  const root = document.documentElement;

  const legacyCanvas = document.getElementById('fx-apex-canvas');
  if (legacyCanvas) {
    try {
      const gl = legacyCanvas.getContext('webgl2');
      const loseContext = gl && gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();
    } catch (_) {}
    legacyCanvas.width = 1;
    legacyCanvas.height = 1;
    legacyCanvas.hidden = true;
  }

  const legacyParticle = document.getElementById('fx-particle-canvas');
  if (legacyParticle) {
    legacyParticle.width = 1;
    legacyParticle.height = 1;
    legacyParticle.hidden = true;
  }

  const loopToggle = document.querySelector('.loop-toggle');
  if (loopToggle && loopToggle.getAttribute('aria-pressed') === 'true') {
    loopToggle.click();
  }
  if (loopToggle) loopToggle.hidden = true;
  document.querySelectorAll('.scene-loop-clone').forEach(function (clone) {
    clone.hidden = true;
  });

  new MutationObserver(function (entries) {
    if (entries.some(function (entry) { return entry.attributeName === 'lang'; })) {
      document.dispatchEvent(new CustomEvent('formatx:languagechange'));
    }
  }).observe(root, { attributes: true, attributeFilter: ['lang'] });

  root.dataset.fxLegacyRenderer = 'retired';
}());