(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'safe-ready-v27') return;
  root.dataset.fxTranscendLoader = 'safe-loading-v27';

  let genomeWebglRequested = false;

  function ensureStyle(marker, href, readyKey, warning) {
    if (document.querySelector('link[' + marker + ']')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, 'true');
    link.addEventListener('load', () => {
      if (readyKey) root.dataset[readyKey] = 'ready';
    }, { once: true });
    link.addEventListener('error', () => {
      if (readyKey) root.dataset[readyKey] = 'failed';
      console.warn(warning);
    }, { once: true });
    document.head.appendChild(link);
  }

  function ensureStabilityStyle() {
    ensureStyle(
      'data-fx-site-stability',
      './styles/formatx-site-stability.css?v=20260729-stability-3',
      'fxSiteStability',
      'FormatX stability stylesheet failed to load.'
    );
  }

  function ensureOrganismDockStyle() {
    ensureStyle(
      'data-fx-organism-voice-dock',
      './styles/organism-voice-dock.css?v=20260731-organism-dock-3',
      'fxOrganismDock',
      'FormatX Organism dock stylesheet failed to load.'
    );
  }

  function ensureOrganismSpeakingStyle() {
    ensureStyle(
      'data-fx-organism-speaking-visual',
      './styles/organism-speaking-visual.css?v=20260730-speaking-visual-1',
      'fxOrganismSpeakingVisual',
      'FormatX Organism speaking visual failed to load.'
    );
  }

  function ensureMobileReadabilityStyle() {
    ensureStyle(
      'data-fx-mobile-readability',
      './styles/formatx-mobile-readability.css?v=20260730-mobile-readability-1',
      'fxMobileReadability',
      'FormatX mobile readability stylesheet failed to load.'
    );
  }

  function ensureMobileHeroFlowStyle() {
    ensureStyle(
      'data-fx-mobile-hero-flow',
      './styles/formatx-mobile-hero-flow.css',
      'fxMobileHeroFlow',
      'FormatX mobile hero flow stylesheet failed to load.'
    );
  }

  function ensureDesktopLayoutStyle() {
    ensureStyle(
      'data-fx-desktop-unified',
      './styles/formatx-desktop-unified.css',
      'fxDesktopUnified',
      'FormatX desktop composition stylesheet failed to load.'
    );
  }

  function ensurePremiumFinishStyle() {
    const existing = document.querySelector('link[data-fx-premium-finish]');
    if (existing) {
      document.head.appendChild(existing);
      root.dataset.fxPremiumFinishStyle = 'ready';
      return;
    }
    ensureStyle(
      'data-fx-premium-finish',
      './styles/formatx-premium-finish.css?v=20260805-motion-gate-3',
      'fxPremiumFinishStyle',
      'FormatX premium finish stylesheet failed to load.'
    );
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
    if (root.dataset.fxGpuCapability === 'canvas2d') {
      genomeWebglRequested = true;
      root.dataset.fxGenomeWebglAdapter = 'canvas2d-retained';
      root.dataset.fxGenomeWebglAdapterLoad = 'fallback-canvas2d';
      return;
    }
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
  ensureOrganismDockStyle();
  ensureOrganismSpeakingStyle();
  ensureMobileReadabilityStyle();
  ensureMobileHeroFlowStyle();
  ensureDesktopLayoutStyle();
  ensurePremiumFinishStyle();
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

  const queue = [
    './scripts/single-language-toggle.js?v=20260729-single-language-2',
    './scripts/formatx-copy-polish.js?v=20260729-copy-polish-1',
    './scripts/release-metadata.js',
    './scripts/interaction-genome-export-stability.js',
    './scripts/platform-status.js?v=20260730-platform-status-1',
    './scripts/formatx-license-links.js?v=20260729-local-licence-2',
    './scripts/organism-console-state.js?v=20260729-console-state-1',
    './scripts/organism-core-controller.js?v=20260729-core-ui-2',
    './scripts/organism-voice.js?v=20260730-organism-voice-4',
    './scripts/organism-voice-stability.js?v=20260731-organism-stability-1',
    './scripts/organism-master-sync.js?v=20260802-master-sync-1',
    './scripts/formatx-audio-repair.js?v=20260728-ambient-score-v5',
    './scripts/organism-core-interaction.js?v=20260730-core-interaction-1',
    './scripts/synaptic-thought-genome.js?v=20260731-thought-genome-1',
    './scripts/synaptic-thought-disclosure.js?v=20260731-thought-disclosure-1',
    './scripts/formatx-mobile-unified.js?v=20260731-mobile-unified-2',
    './scripts/formatx-infinite-scroll.js?v=20260805-infinite-smooth-v5',
    './scripts/formatx-three-host-safe.js?v=20260805-immersive-host-2',
    './scripts/formatx-render-visibility.js?v=20260805-immersive-visibility-3',
    './scripts/formatx-living-core-launcher.js?v=20260727-living-core-1',
    './scripts/interaction-genome.js?v=20260728-genome-3d-1',
    './scripts/formatx-language-copy-stability.js',
    './scripts/formatx-premium-finish.js?v=20260805-motion-gate-3'
  ];

  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendProgress = '100';
      root.dataset.fxTranscendLoader = 'safe-ready-v27';
      return;
    }

    root.dataset.fxTranscendProgress = String(Math.round(index / queue.length * 100));
    const script = document.createElement('script');
    script.src = queue[index];
    script.async = false;
    script.dataset.fxTranscendModule = String(index);

    let settled = false;
    let timeout = 0;
    const finish = (ok, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (!ok) {
        console.warn('FormatX optional module did not complete:', queue[index], reason);
        root.dataset.fxTranscendLoader = 'safe-degraded-v27';
      }
      root.dataset.fxTranscendProgress = String(Math.round((index + 1) / queue.length * 100));
      load(index + 1);
    };

    timeout = setTimeout(() => finish(false, 'timeout'), 9000);
    script.addEventListener('load', () => finish(true, 'load'), { once: true });
    script.addEventListener('error', () => finish(false, 'error'), { once: true });
    document.head.appendChild(script);
  }

  load(0);
}());
