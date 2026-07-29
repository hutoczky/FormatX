(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'safe-ready-v3') return;
  root.dataset.fxTranscendLoader = 'safe-loading-v3';

  function refreshQrImages() {
    const currency = document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR'
      ? 'eur'
      : 'huf';

    document.querySelectorAll('[data-plan-qr]').forEach(card => {
      const image = card.querySelector('[data-plan-qr-image]');
      const plan = card.dataset.planQr;
      if (!(image instanceof HTMLImageElement) || !plan) return;
      const source = './assets/qr/' + plan + '-' + currency + '.svg';
      if (image.getAttribute('src') !== source) image.src = source;
      card.classList.remove('is-qr-error');
      card.classList.add('is-qr-loading');
      image.addEventListener('load', () => {
        card.classList.remove('is-qr-loading', 'is-qr-error');
        card.classList.add('is-qr-ready');
      }, { once: true });
      image.addEventListener('error', () => {
        card.classList.remove('is-qr-loading', 'is-qr-ready');
        card.classList.add('is-qr-error');
      }, { once: true });
    });
  }

  root.dataset.fxLocalQr = 'ready';
  root.dataset.fxLegacyRenderer = 'retired';
  root.dataset.fxRenderer = 'three-host-safe';
  refreshQrImages();
  document.addEventListener('click', event => {
    if (event.target.closest('[data-currency]')) setTimeout(refreshQrImages, 0);
  });
  addEventListener('pageshow', refreshQrImages);

  // Only modules that cannot replace the iframe source or global event APIs.
  const queue = [
    './scripts/formatx-three-host-safe.js?v=20260729-safe-host-1',
    './scripts/formatx-audio-repair.js?v=20260728-ambient-score-v5',
    './scripts/formatx-living-core-launcher.js?v=20260727-living-core-1',
    './scripts/interaction-genome.js?v=20260728-genome-3d-1'
  ];

  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendLoader = 'safe-ready-v3';
      return;
    }

    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);
    script.addEventListener('load', () => load(index + 1), { once: true });
    script.addEventListener('error', () => {
      console.warn('FormatX optional module failed to load:', queue[index]);
      root.dataset.fxTranscendLoader = 'safe-degraded-v3';
      load(index + 1);
    }, { once: true });
    document.head.appendChild(script);
  }

  load(0);
}());
