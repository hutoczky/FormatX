(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileRegressionR310 === 'ready') return;
  root.dataset.fxMobileRegressionR310 = 'booting';

  const CORE_MEDIA = '(prefers-reduced-motion: no-preference)';
  const STYLE_URL = '/scifi-ui/styles/formatx-mobile-regression-r310.css?v=20260824-r327-organic-core-morph';
  const OPTICS_STYLE_URL = '/scifi-ui/styles/formatx-mobile-core-optics-r328.css?v=20260824-r328-soft-mobile-mag';
  const LANGUAGE_OWNER_URL = '/scifi-ui/scripts/formatx-language-query-owner-r329.js?v=20260824-r329-query-authority';
  let qrGeneration = 0;

  function explicitLanguageQuery() {
    const value = new URLSearchParams(location.search).get('lang');
    return value === 'hu' || value === 'en' ? value : null;
  }

  function ensureLanguageOwner() {
    if (!explicitLanguageQuery()) return;
    if (document.querySelector('script[data-fx-language-query-owner-r329]')) return;
    const script = document.createElement('script');
    script.src = LANGUAGE_OWNER_URL;
    script.async = true;
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
      if (!existing.href.includes('r328-soft-mobile-mag')) existing.href = OPTICS_STYLE_URL;
      root.dataset.fxCoreMobileOpticsR328 = 'soft-short-bloom';
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = OPTICS_STYLE_URL;
    link.dataset.fxMobileCoreOpticsR328 = 'true';
    document.head.appendChild(link);
    root.dataset.fxCoreMobileOpticsR328 = 'soft-short-bloom';
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

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('[data-currency]')) return;
    queueMicrotask(syncQr);
  }, true);

  for (const delay of [250, 900, 2200]) setTimeout(syncQr, delay);
}());