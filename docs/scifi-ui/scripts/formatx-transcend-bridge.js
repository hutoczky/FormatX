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

  const qrDataUrls = new Map();
  const qrInFlight = new WeakMap();

  function blobToDataUrl(source) {
    if (qrDataUrls.has(source)) return Promise.resolve(qrDataUrls.get(source));
    return fetch(source, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('QR blob read failed');
        return response.blob();
      })
      .then(function (blob) {
        return new Promise(function (resolve, reject) {
          const reader = new FileReader();
          reader.addEventListener('load', function () {
            const result = String(reader.result || '');
            if (!result.startsWith('data:image/')) {
              reject(new Error('Invalid QR data URL'));
              return;
            }
            qrDataUrls.set(source, result);
            resolve(result);
          }, { once: true });
          reader.addEventListener('error', reject, { once: true });
          reader.readAsDataURL(blob);
        });
      });
  }

  function revealQr(image) {
    if (!(image instanceof HTMLImageElement)) return;
    const card = image.closest('[data-plan-qr]');
    const source = image.getAttribute('src') || image.src || '';
    if (!card || !source.startsWith('blob:')) return;
    if (qrInFlight.get(image) === source) return;
    qrInFlight.set(image, source);

    blobToDataUrl(source).then(function (dataUrl) {
      if (qrInFlight.get(image) !== source) return;
      image.src = dataUrl;
      card.classList.remove('is-qr-loading', 'is-qr-error');
      card.classList.add('is-qr-ready');
      qrInFlight.delete(image);
    }).catch(function () {
      if (qrInFlight.get(image) !== source) return;
      card.classList.remove('is-qr-loading', 'is-qr-ready');
      card.classList.add('is-qr-error');
      qrInFlight.delete(image);
    });
  }

  function scanQr(scope) {
    if (scope instanceof HTMLImageElement) revealQr(scope);
    if (scope instanceof Element) {
      scope.querySelectorAll('[data-plan-qr-image]').forEach(revealQr);
    }
  }

  scanQr(document.documentElement);
  const qrObserver = new MutationObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.type === 'attributes') revealQr(entry.target);
      entry.addedNodes.forEach(scanQr);
    });
  });
  qrObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src']
  });

  new MutationObserver(function (entries) {
    if (entries.some(function (entry) { return entry.attributeName === 'lang'; })) {
      document.dispatchEvent(new CustomEvent('formatx:languagechange'));
    }
  }).observe(root, { attributes: true, attributeFilter: ['lang'] });

  addEventListener('pagehide', function () {
    qrObserver.disconnect();
    qrDataUrls.clear();
  }, { once: true });

  root.dataset.fxQrVisibility = 'data-url';
  root.dataset.fxLegacyRenderer = 'retired';
}());