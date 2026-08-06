(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxLiveOsBundle === 'v1') return;
  root.dataset.fxLiveOsBundle = 'v1';

  const current = document.currentScript;
  const version = current && current.src.includes('?') ? current.src.slice(current.src.indexOf('?')) : '?v=20260806-live-os-1';

  function load(src, marker) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[data-fx-live-os-part="' + marker + '"]')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src + version;
      script.async = false;
      script.dataset.fxLiveOsPart = marker;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  load('./scripts/formatx-live-os-core.js', 'core')
    .catch(error => console.warn('[FormatX Live OS] core load failed', error))
    .finally(() => load('./scripts/formatx-live-os-fallback.js', 'fallback')
      .catch(error => console.warn('[FormatX Live OS] fallback load failed', error)));
}());
