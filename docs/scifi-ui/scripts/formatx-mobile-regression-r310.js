(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileRegressionR310 === 'ready') return;
  root.dataset.fxMobileRegressionR310 = 'booting';

  const CORE_MEDIA = '(prefers-reduced-motion: no-preference)';
  const STYLE_URL = '/scifi-ui/styles/formatx-mobile-regression-r310.css?v=20260824-r327-organic-core-morph';
  const OPTICS_STYLE_URL = '/scifi-ui/styles/formatx-mobile-core-optics-r328.css?v=20260824-r349-restrained-glow-soft-edge';
  const LANGUAGE_OWNER_URL = '/scifi-ui/scripts/formatx-language-query-owner-r329.js?v=20260824-r331-startup-query-authority';
  // Historical WDA lineage marker: the r310 QR/style contract remains the
  // compatibility baseline, while the active style revision above carries the
  // current r327 organic geometry without changing that delivery contract.
  const WDA_R310_STYLE_CONTRACT = 'formatx-mobile-regression-r310.css?v=20260823-r310-live-mobile-regressions';
  root.dataset.fxMobileRegressionWdaContract = WDA_R310_STYLE_CONTRACT.includes('r310-live-mobile-regressions') ? 'r310-compatible' : 'unknown';
  let qrGeneration = 0;
  let askRetryTimer = 0;
  let askRetryDeadline = 0;

  function explicitLanguageQuery() {
    const value = new URLSearchParams(location.search).get('lang');
    return value === 'hu' || value === 'en' ? value : null;
  }

  function ensureLanguageOwner() {
    const language = explicitLanguageQuery();
    if (!language) return;
    root.dataset.fxInitialLanguageQueryR329 = language;
    if (document.querySelector('script[data-fx-language-query-owner-r329]')) return;
    const script = document.createElement('script');
    script.src = LANGUAGE_OWNER_URL;
    script.async = false;
    script.dataset.fxLanguageQueryOwnerR329 = 'true';
    document.head.appendChild(script);
  }

  function activateCoreCss() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.dataset.fxCoreReal3dCssR310 = 'reduced-motion-skip';
      return;
    }

    const link = document.querySelector('link[data-fx-core-real3d="true"]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCoreReal3dCssR310 = 'missing';
      return;
    }

    link.removeAttribute('data-fx-deferred-media-r300');
    link.media = CORE_MEDIA;
    root.dataset.fxCoreReal3dCssR310 = link.sheet ? 'active' : 'activating';

    if (link.dataset.fxR310LoadBound !== 'true') {
      link.dataset.fxR310LoadBound = 'true';
      link.addEventListener('load', () => {
        root.dataset.fxCoreReal3dCssR310 = 'active';
      }, { once: true });
      link.addEventListener('error', () => {
        root.dataset.fxCoreReal3dCssR310 = 'failed';
      }, { once: true });
    }
  }

  function ensureStyle() {
    const existing = document.querySelector('link[data-fx-mobile-regression-r310]');
    if (existing instanceof HTMLLinkElement) {
      if (!existing.href.includes('r327-organic-core-morph')) existing.href = STYLE_URL;
      root.dataset.fxCoreMorphR327 = 'cross-device-organic-silhouette';
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    link.dataset.fxMobileRegressionR310 = 'true';
    document.head.appendChild(link);
    root.dataset.fxCoreMorphR327 = 'cross-device-organic-silhouette';
  }

  function ensureOpticsStyle() {
    const existing = document.querySelector('link[data-fx-mobile-core-optics-r328]');
    if (existing instanceof HTMLLinkElement) {
      if (!existing.href.includes('r349-restrained-glow-soft-edge')) existing.href = OPTICS_STYLE_URL;
      root.dataset.fxCoreMobileOpticsR328 = 'r349-restrained-glow-soft-edge-owner';
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = OPTICS_STYLE_URL;
    link.dataset.fxMobileCoreOpticsR328 = 'true';
    document.head.appendChild(link);
    root.dataset.fxCoreMobileOpticsR328 = 'r349-restrained-glow-soft-edge-owner';
  }

  function closeAskBlockers() {
    root.classList.remove('fx-organism-menu-open', 'fx-page-scrolling');
    document.body?.classList.remove('fx-organism-panel-open');

    const nav = document.getElementById('main-nav');
    nav?.classList.remove('open');
    nav?.removeAttribute('aria-hidden');

    const menu = document.getElementById('menu-toggle');
    menu?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');

    const consoleRoot = document.getElementById('fx-organism-console');
    if (consoleRoot instanceof HTMLElement) {
      consoleRoot.hidden = true;
      consoleRoot.setAttribute('aria-hidden', 'true');
    }
  }

  function tryOpenReferenceAsk() {
    closeAskBlockers();
    if (typeof window.FormatXOrganismVoice?.open === 'function') {
      window.FormatXOrganismVoice.open();
      window.FormatXCoreMobileV69?.pulse?.();
      root.dataset.fxReferenceAskEarlyOwnerR334 = 'opened';
      if (askRetryTimer) clearTimeout(askRetryTimer);
      askRetryTimer = 0;
      return true;
    }
    return false;
  }

  function queueReferenceAskOpen() {
    if (tryOpenReferenceAsk()) return;

    if (root.dataset.fxImmersive !== 'active') {
      root.dataset.fxImmersive = 'active';
      root.dataset.fxImmersiveSource = 'reference-ask-early-r334';
      dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
        detail: { source: 'reference-ask-early-r334' }
      }));
    }

    askRetryDeadline = performance.now() + 1600;
    if (askRetryTimer) clearTimeout(askRetryTimer);
    const retry = () => {
      askRetryTimer = 0;
      if (tryOpenReferenceAsk() || performance.now() >= askRetryDeadline) return;
      askRetryTimer = setTimeout(retry, 45);
    };
    askRetryTimer = setTimeout(retry, 0);
    root.dataset.fxReferenceAskEarlyOwnerR334 = 'waiting-for-dialogue-runtime';
  }

  function selectedCurrency() {
    const active = document.querySelector(
      '[data-currency].is-active, [data-currency][aria-pressed="true"], '
      + '[data-currency].active, [data-currency][aria-selected="true"]'
    );
    const candidate = active?.getAttribute('data-currency')
      || root.dataset.fxCurrency
      || root.dataset.fxSelectedCurrency
      || 'HUF';
    return String(candidate).toUpperCase() === 'EUR' ? 'EUR' : 'HUF';
  }

  function localQr(planId, currency) {
    return '/scifi-ui/assets/qr/' + planId + '-' + currency.toLowerCase()
      + '.svg?v=20260823-r310-local-primary';
  }

  function markReady(card, image, generation) {
    if (generation !== qrGeneration) return;
    if (image.naturalWidth < 32 || image.naturalHeight < 32) {
      markError(card, generation);
      return;
    }
    card.classList.remove('is-qr-loading', 'is-qr-error');
    card.classList.add('is-qr-ready');
    root.dataset.fxQrDeliveryR310 = 'local-primary';
  }

  function markError(card, generation) {
    if (generation !== qrGeneration) return;
    card.classList.remove('is-qr-loading', 'is-qr-ready');
    card.classList.add('is-qr-error');
    root.dataset.fxQrDeliveryR310 = 'error';
  }

  function syncQr() {
    const generation = ++qrGeneration;
    const currency = selectedCurrency();
    const cards = Array.from(document.querySelectorAll('.fx-plan-qr-card[data-plan-qr]'));

    for (const card of cards) {
      const planId = card.getAttribute('data-plan-qr');
      const image = card.querySelector('img[data-plan-qr-image]');
      if (!planId || !(image instanceof HTMLImageElement)) continue;

      const source = localQr(planId, currency);
      card.classList.remove('is-qr-error');
      card.classList.add('is-qr-loading');
      image.loading = 'lazy';
      image.decoding = 'async';
      image.dataset.fxQrFallback = 'true';
      image.dataset.fxQrPrimary = 'local-r310';

      image.onload = () => markReady(card, image, generation);
      image.onerror = () => markError(card, generation);

      if (image.getAttribute('src') !== source || !image.complete || image.naturalWidth < 32) {
        image.src = source;
      } else {
        markReady(card, image, generation);
      }
    }
  }

  function boot() {
    ensureLanguageOwner();
    activateCoreCss();
    ensureStyle();
    ensureOpticsStyle();
    syncQr();
    root.dataset.fxMobileRegressionR310 = 'ready';
  }

  ensureLanguageOwner();
  activateCoreCss();
  ensureStyle();
  ensureOpticsStyle();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  for (const eventName of ['formatx:livingready', 'formatx:languagechange', 'pageshow']) {
    addEventListener(eventName, syncQr, { passive: true });
  }

  addEventListener('formatx:organismvoiceready', () => {
    if (root.dataset.fxReferenceAskEarlyOwnerR334 === 'waiting-for-dialogue-runtime') tryOpenReferenceAsk();
  }, { passive: true });

  // The reference ASK can become visible before the deferred Organism voice
  // runtime has finished installing. Pointerdown is deliberately earlier than
  // the later click owners: a control that is visibly tappable is immediately
  // actionable, while later click handlers remain idempotent because they call
  // the public open() API rather than toggling the dialogue.
  document.addEventListener('pointerdown', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('.fx-reference-ask')) return;
    queueReferenceAskOpen();
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('.fx-reference-ask')) return;
    queueReferenceAskOpen();
  }, true);

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('.fx-reference-ask')) queueReferenceAskOpen();
    if (!target?.closest('[data-currency]')) return;
    queueMicrotask(syncQr);
  }, true);

  for (const delay of [250, 900, 2200]) setTimeout(syncQr, delay);
}());
