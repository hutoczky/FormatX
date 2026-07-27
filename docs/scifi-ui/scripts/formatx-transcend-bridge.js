(function () {
  'use strict';

  const root = document.documentElement;
  const legacyCanvas = document.getElementById('fx-apex-canvas');
  if (legacyCanvas) {
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

  document.querySelectorAll('.loop-toggle,.scene-loop-clone,.fx-transcend-loop-bridge').forEach(node => {
    node.remove();
  });

  const languageObserver = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) {
      document.dispatchEvent(new CustomEvent('formatx:languagechange'));
    }
  });
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });

  addEventListener('pagehide', () => languageObserver.disconnect(), { once: true });

  root.dataset.fxQrVisibility = 'direct-data-url';
  root.dataset.fxLegacyRenderer = 'retired';
  root.dataset.fxRenderer = 'three-host';
}());
