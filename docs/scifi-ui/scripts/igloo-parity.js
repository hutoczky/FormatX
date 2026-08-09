(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxTranscendLoader === 'safe-ready-v28') return;
  root.dataset.fxTranscendLoader = 'safe-loading-v28';

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
      './styles/formatx-site-stability.css?v=20260807-audio-slot-2',
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
      './styles/formatx-mobile-readability.css?v=20260807-audio-slot-2',
      'fxMobileReadability',
      'FormatX mobile readability stylesheet failed to load.'
    );
  }

  function ensureReadabilityFloorStyle() {
    ensureStyle(
      'data-fx-readability-floor',
      './styles/formatx-readability-floor.css?v=20260808-a11y-floor-1',
      'fxReadabilityFloor',
      'FormatX readability floor stylesheet failed to load.'
    );
  }

  function ensureMobileHeroFlowStyle() {
    ensureStyle(
      'data-fx-mobile-hero-flow',
      './styles/formatx-mobile-hero-flow.css?v=20260807-audio-slot-2',
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

      if (link instanceof HTMLAnchorElement) {
        link.href = checkoutSource;
        const planName = card.querySelector('.fx-plan-qr-copy strong')?.textContent?.trim() || plan;
        link.setAttribute('aria-label', language === 'en'
          ? 'QR — open ' + planName + ' payment page'
          : 'QR — ' + planName + ' fizetési oldal megnyitása');
      }

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
  ensureReadabilityFloorStyle();
  ensureMobileHeroFlowStyle();
  ensureDesktopLayoutStyle();
  ensurePremiumFinishStyle();
  root.dataset.fxLocalQr = 'ready-v2';
  root.dataset.fxLegacyRenderer = 'retired';
  root.dataset.fxRenderer = 'native-apex-preferred';
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
    './scripts/release-metadata.js?v=20260807-full-release-1',
    './scripts/interaction-genome-export-stability.js?v=20260807-audio-slot-2',
    './scripts/platform-status.js?v=20260807-full-release-1',
    './scripts/formatx-license-links.js?v=20260729-local-licence-2',
    './scripts/organism-console-state.js?v=20260729-console-state-1',
    './scripts/organism-core-controller.js?v=20260729-core-ui-2',
    './scripts/organism-voice.js?v=20260730-organism-voice-4',
    './scripts/organism-voice-stability.js?v=20260808-mobile-visual-viewport-1',
    './scripts/organism-master-sync.js?v=20260802-master-sync-1',
    './scripts/formatx-audio-repair.js?v=20260728-ambient-score-v5',
    './scripts/organism-core-interaction.js?v=20260730-core-interaction-1',
    './scripts/synaptic-thought-genome.js?v=20260731-thought-genome-1',
    './scripts/synaptic-thought-disclosure.js?v=20260731-thought-disclosure-1',
    './scripts/formatx-mobile-unified.js?v=20260731-mobile-unified-2',
    './scripts/formatx-infinite-scroll.js?v=20260808-seamless-v7',
    './scripts/formatx-apex-scene-stability.js?v=20260808-core-scene-1',
    './scripts/formatx-apex-native.js?v=20260808-native-apex-1',
    './scripts/formatx-three-host-safe.js?v=20260808-native-apex-fallback-1',
    './scripts/formatx-render-visibility.js?v=20260805-immersive-visibility-3',
    './scripts/formatx-living-core-launcher.js?v=20260727-living-core-1',
    './scripts/interaction-genome.js?v=20260728-genome-3d-1',
    './scripts/formatx-language-copy-stability.js?v=20260807-full-release-1',
    './scripts/formatx-premium-finish.js?v=20260805-motion-gate-3',
    './scripts/formatx-accessibility-finalizer.js?v=20260808-a11y-1'
  ];

  function load(index) {
    if (index >= queue.length) {
      root.dataset.fxTranscendProgress = '100';
      root.dataset.fxTranscendLoader = 'safe-ready-v28';
      return;
    }

    const source = queue[index];
    if (root.dataset.fxCoreReal3d === 'ready-v20'
      && (source.includes('formatx-apex-native.js') || source.includes('formatx-three-host-safe.js'))) {
      root.dataset.fxNativeApex = 'retired-for-single-real3d-v20';
      root.dataset.fxThreeHost = 'single-real3d-v20';
      root.dataset.fxTranscendProgress = String(Math.round((index + 1) / queue.length * 100));
      load(index + 1);
      return;
    }

    if (source.includes('formatx-apex-native.js') && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.dataset.fxNativeApex = 'reduced-motion-fallback';
      root.dataset.fxTranscendProgress = String(Math.round((index + 1) / queue.length * 100));
      load(index + 1);
      return;
    }

    root.dataset.fxTranscendProgress = String(Math.round(index / queue.length * 100));
    const script = document.createElement('script');
    script.src = source;
    script.async = false;
    script.dataset.fxTranscendModule = String(index);

    let settled = false;
    let timeout = 0;
    const finish = (ok, reason) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (!ok) {
        console.warn('FormatX optional module did not complete:', source, reason);
        root.dataset.fxTranscendLoader = 'safe-degraded-v28';
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
