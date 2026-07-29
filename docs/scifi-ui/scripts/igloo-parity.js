(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'safe-ready-v9') return;
  root.dataset.fxTranscendLoader = 'safe-loading-v9';

  let genomeWebglRequested = false;

  function ensureStabilityStyle() {
    if (document.querySelector('link[data-fx-site-stability]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/formatx-site-stability.css?v=20260729-stability-3';
    link.dataset.fxSiteStability = 'true';
    link.addEventListener('load', () => {
      root.dataset.fxSiteStability = 'ready';
    }, { once: true });
    link.addEventListener('error', () => {
      root.dataset.fxSiteStability = 'failed';
      console.warn('FormatX stability stylesheet failed to load.');
    }, { once: true });
    document.head.appendChild(link);
  }

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

  function requestGenomeWebgl() {
    if (genomeWebglRequested || document.querySelector('script[data-fx-genome-webgl-adapter]')) return;
    genomeWebglRequested = true;
    root.dataset.fxGenomeWebglAdapter = 'lazy-requested';

    const script = document.createElement('script');
    script.src = './scripts/interaction-genome-webgl-adapter.js?v=20260729-genome-webgl-lazy-1';
    script.defer = true;
    script.dataset.fxGenomeWebglAdapter = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxGenomeWebglAdapterLoad = 'ready';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxGenomeWebglAdapterLoad = 'fallback-canvas2d';
      console.warn('FormatX Interaction Genome WebGL was unavailable; Canvas2D remains active.');
    }, { once: true });
    document.head.appendChild(script);
  }

  ensureStabilityStyle();
  root.dataset.fxLocalQr = 'ready';
  root.dataset.fxLegacyRenderer = 'retired';
  root.dataset.fxRenderer = 'three-host-safe';
  refreshQrImages();

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-currency]')) setTimeout(refreshQrImages, 0);
    if (target?.closest('.fx-genome-launcher')) setTimeout(requestGenomeWebgl, 0);
  });
  addEventListener('pageshow', refreshQrImages);

  // Ordered, failure-tolerant production modules. None may replace the iframe source.
  const queue = [
    './scripts/single-language-toggle.js?v=20260729-single-language-1',
    './scripts/organism-console-state.js?v=20260729-console-state-1',
    './scripts/organism-core-controller.js?v=20260729-core-ui-1',
    './scripts/formatx-three-host-safe.js?v=20260729-safe-host-1',
    './scripts/formatx-render-visibility.js?v=20260729-render-visibility-1',
    './scripts/formatx-audio-repair.js?v=20260728-ambient-score-v5',
    './scripts/formatx-living-core-launcher.js?v=20260727-living-core-1',
    './scripts/interaction-genome.js?v=20260728-genome-3d-1'
  ];

  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendLoader = 'safe-ready-v9';
      return;
    }

    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);
    script.addEventListener('load', () => load(index + 1), { once: true });
    script.addEventListener('error', () => {
      console.warn('FormatX optional module failed to load:', queue[index]);
      root.dataset.fxTranscendLoader = 'safe-degraded-v9';
      load(index + 1);
    }, { once: true });
    document.head.appendChild(script);
  }

  load(0);
}());
