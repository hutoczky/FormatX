(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'safe-ready-v13') return;
  root.dataset.fxTranscendLoader = 'safe-loading-v13';

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
    const selectedCurrency = document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR'
      ? 'EUR'
      : 'HUF';
    const assetCurrency = selectedCurrency.toLowerCase();
    const language = root.lang === 'en' ? 'en' : 'hu';

    document.querySelectorAll('[data-plan-qr]').forEach(card => {
      const image = card.querySelector('[data-plan-qr-image]');
      const link = card.querySelector('.fx-plan-qr-link');
      const plan = card.dataset.planQr;
      if (!(image instanceof HTMLImageElement) || !plan) return;

      const apiSource = '/api/checkout-qr?plan=' + encodeURIComponent(plan)
        + '&cycle=monthly&currency=' + encodeURIComponent(selectedCurrency)
        + '&v=20260730-qr1';
      const localSource = './assets/qr/' + plan + '-' + assetCurrency + '.svg?v=20260730-qr1';
      const checkoutSource = './checkout.html?plan=' + encodeURIComponent(plan)
        + '&cycle=monthly&currency=' + encodeURIComponent(selectedCurrency)
        + '&lang=' + encodeURIComponent(language)
        + '&source=pricing-qr';

      if (link instanceof HTMLAnchorElement) link.href = checkoutSource;

      card.classList.remove('is-qr-ready', 'is-qr-error');
      card.classList.add('is-qr-loading');
      image.decoding = 'async';
      image.dataset.fxQrFallback = 'false';

      image.onload = () => {
        if (image.naturalWidth < 32 || image.naturalHeight < 32) {
          image.onerror?.();
          return;
        }
        card.classList.remove('is-qr-loading', 'is-qr-error');
        card.classList.add('is-qr-ready');
        image.dataset.fxQrSource = image.currentSrc || image.src;
        root.dataset.fxQrDelivery = image.dataset.fxQrFallback === 'true' ? 'local-fallback' : 'api';
      };

      image.onerror = () => {
        if (image.dataset.fxQrFallback !== 'true') {
          image.dataset.fxQrFallback = 'true';
          image.src = localSource;
          return;
        }
        card.classList.remove('is-qr-loading', 'is-qr-ready');
        card.classList.add('is-qr-error');
        root.dataset.fxQrDelivery = 'failed';
      };

      if (image.getAttribute('src') !== apiSource || !image.complete || image.naturalWidth < 32) {
        image.src = apiSource;
      } else {
        image.onload();
      }
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
  root.dataset.fxLocalQr = 'ready-v2';
  root.dataset.fxLegacyRenderer = 'retired';
  root.dataset.fxRenderer = 'three-host-safe';
  refreshQrImages();

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-currency], .fx-language-toggle, [data-language], [data-language-choice]')) {
      setTimeout(refreshQrImages, 0);
    }
    if (target?.closest('.fx-genome-launcher')) setTimeout(requestGenomeWebgl, 0);
  });
  addEventListener('pageshow', refreshQrImages);
  addEventListener('formatx:languagechange', refreshQrImages);

  // Ordered, failure-tolerant production modules. None may replace the iframe source.
  const queue = [
    './scripts/single-language-toggle.js?v=20260729-single-language-2',
    './scripts/formatx-copy-polish.js?v=20260729-copy-polish-1',
    './scripts/formatx-license-links.js?v=20260729-local-licence-2',
    './scripts/organism-console-state.js?v=20260729-console-state-1',
    './scripts/organism-core-controller.js?v=20260729-core-ui-2',
    './scripts/organism-voice.js?v=20260730-organism-voice-2',
    './scripts/formatx-infinite-scroll.js?v=20260729-infinite-boundary-v3',
    './scripts/formatx-three-host-safe.js?v=20260729-safe-host-1',
    './scripts/formatx-render-visibility.js?v=20260729-render-visibility-1',
    './scripts/formatx-audio-repair.js?v=20260728-ambient-score-v5',
    './scripts/formatx-living-core-launcher.js?v=20260727-living-core-1',
    './scripts/interaction-genome.js?v=20260728-genome-3d-1'
  ];

  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendLoader = 'safe-ready-v13';
      return;
    }

    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);
    script.addEventListener('load', () => load(index + 1), { once: true });
    script.addEventListener('error', () => {
      console.warn('FormatX optional module failed to load:', queue[index]);
      root.dataset.fxTranscendLoader = 'safe-degraded-v13';
      load(index + 1);
    }, { once: true });
    document.head.appendChild(script);
  }

  load(0);
}());