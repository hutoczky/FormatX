(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileRegressionR310 === 'ready') return;
  root.dataset.fxMobileRegressionR310 = 'booting';

  const CORE_MEDIA = '(prefers-reduced-motion: no-preference)';
  const STYLE_URL = '/scifi-ui/styles/formatx-mobile-regression-r310.css?v=20260824-r327-organic-core-morph';
  const REFERENCE_LAYOUT_STYLE_URL = '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260818-r207-preloaded';
  const REFERENCE_LAYOUT_SCRIPT_URL = '/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260830-r458-static-first-paint-owner';
  const LANGUAGE_OWNER_URL = '/scifi-ui/scripts/formatx-language-query-owner-r329.js?v=20260824-r331-startup-query-authority';
  const WDA_R310_STYLE_CONTRACT = 'formatx-mobile-regression-r310.css?v=20260823-r310-live-mobile-regressions';
  const DESKTOP_LOOP_QUERY = matchMedia('(min-width: 901px) and (pointer: fine)');
  const MOBILE_REFERENCE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const PRODUCTION_FIRST_PAINT_SELECTOR = 'link[data-fx-production-first-paint-r370],link[data-fx-mobile-first-paint-r358]';
  root.dataset.fxMobileRegressionWdaContract = WDA_R310_STYLE_CONTRACT.includes('r310-live-mobile-regressions') ? 'r310-compatible' : 'unknown';
  let qrGeneration = 0;
  let askRetryTimer = 0;
  let askRetryDeadline = 0;
  let desktopLoopTimer = 0;
  let desktopLoopRefreshTimer = 0;

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

  function ensureReferenceLayoutBootstrap() {
    if (!MOBILE_REFERENCE_QUERY.matches) {
      root.dataset.fxStaticProductionBootstrapR358 = 'desktop-skip';
      return;
    }

    const productionFirstPaint = Boolean(document.querySelector(PRODUCTION_FIRST_PAINT_SELECTOR));
    if (productionFirstPaint) {
      root.dataset.fxMobileReferenceStylePolicyR458 = 'static-first-paint-owner-no-late-css';
    } else {
      let style = document.querySelector(
        'link[data-fx-mobile-reference-layout-style="true"], link[href*="formatx-mobile-reference-layout-v1.css"]'
      );
      if (!(style instanceof HTMLLinkElement)) {
        style = document.createElement('link');
        style.rel = 'stylesheet';
        style.media = '(max-width: 900px)';
        style.href = REFERENCE_LAYOUT_STYLE_URL;
        style.dataset.fxMobileReferenceLayoutStyle = 'true';
        document.head.appendChild(style);
      }
      root.dataset.fxMobileReferenceStylePolicyR458 = 'legacy-reference-css-fallback';
    }

    const existingScript = document.querySelector(
      'script[data-fx-mobile-reference-layout="true"], script[src*="formatx-mobile-reference-layout-v1.js"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = REFERENCE_LAYOUT_SCRIPT_URL;
      script.async = false;
      script.dataset.fxMobileReferenceLayout = 'true';
      script.addEventListener('load', () => {
        root.dataset.fxStaticProductionBootstrapR358 = productionFirstPaint
          ? 'reference-semantics-ready-static-first-paint'
          : 'reference-layout-ready';
      }, { once: true });
      script.addEventListener('error', () => {
        root.dataset.fxStaticProductionBootstrapR358 = 'reference-layout-failed';
      }, { once: true });
      document.head.appendChild(script);
      root.dataset.fxStaticProductionBootstrapR358 = productionFirstPaint
        ? 'reference-semantics-requested-static-first-paint'
        : 'reference-layout-requested';
    } else {
      root.dataset.fxStaticProductionBootstrapR358 = productionFirstPaint
        ? 'reference-semantics-present-static-first-paint'
        : 'reference-layout-present';
    }
  }

  function activateCoreCss() {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const link = document.querySelector('link[data-fx-core-real3d="true"]');
    if (!(link instanceof HTMLLinkElement)) {
      root.dataset.fxCoreReal3dCssR310 = 'missing';
      return;
    }

    link.removeAttribute('data-fx-deferred-media-r300');
    link.media = reducedMotion ? 'all' : CORE_MEDIA;
    root.dataset.fxCoreReal3dCssR310 = reducedMotion
      ? 'active-static-r413'
      : link.sheet ? 'active' : 'activating';

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

  function enforceSingleOpticsOwner() {
    document.querySelector('link[data-fx-mobile-core-optics-r328]')?.remove();
    root.dataset.fxCoreMobileOpticsR328 = 'retired-r454-no-fallback-stylesheet';
    root.dataset.fxCoreMobileOpticsOwnerR424 = 'r454-formatx-core-shapeshifter-r337-css';
  }

  function desktopLoopBlocked() {
    return document.body?.classList.contains('fx-organism-panel-open')
      || root.classList.contains('fx-organism-menu-open')
      || root.classList.contains('fx-intro-running');
  }

  function desktopLoopLiveState() {
    if (!DESKTOP_LOOP_QUERY.matches || desktopLoopBlocked()) return null;
    if (root.dataset.fxInfiniteController !== 'seamless-v7') return null;

    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const hero = document.querySelector('#main-content > #hero');
    if (!(bridge instanceof HTMLElement) || !(hero instanceof HTMLElement)) return null;

    const viewportHeight = innerHeight;
    const bridgeTop = bridge.offsetTop;
    const sourceTop = hero.offsetTop;
    const sourceHeight = hero.offsetHeight;
    const maximum = Math.max(0, root.scrollHeight - viewportHeight);
    const threshold = bridgeTop + Math.max(36, Math.min(viewportHeight * .18, 180));
    if (scrollY < threshold || scrollY > maximum + 2) return null;

    return {
      bridgeTop,
      sourceTop,
      sourceHeight,
      maximum,
      relative: Math.max(0, Math.min(scrollY - bridgeTop, Math.max(0, sourceHeight - 2)))
    };
  }

  function forceDesktopLoopGeometryRecheck(source, expectedLoopCount) {
    if (!desktopLoopLiveState()) return;
    if (Number(root.dataset.fxLoopCount || 0) > expectedLoopCount) return;

    root.dataset.fxDesktopLoopIdleGeometryR350 = 'refresh-requested';
    root.dataset.fxDesktopLoopIdleSourceR350 = source;

    dispatchEvent(new Event('resize'));
    clearTimeout(desktopLoopRefreshTimer);
    desktopLoopRefreshTimer = setTimeout(() => {
      if (Number(root.dataset.fxLoopCount || 0) > expectedLoopCount) {
        root.dataset.fxDesktopLoopIdleGeometryR350 = 'native-transfer-won';
        return;
      }
      if (!desktopLoopLiveState()) {
        root.dataset.fxDesktopLoopIdleGeometryR350 = 'no-longer-at-boundary';
        return;
      }
      root.dataset.fxDesktopLoopIdleGeometryR350 = 'live-recheck-dispatched';
      dispatchEvent(new Event('scroll'));
    }, 110);
  }

  function scheduleDesktopLoopCheck(event, delay = 280) {
    if (!DESKTOP_LOOP_QUERY.matches) return;
    if (event && event.isTrusted === false) return;
    clearTimeout(desktopLoopTimer);
    const expectedLoopCount = Number(root.dataset.fxLoopCount || 0);
    desktopLoopTimer = setTimeout(() => {
      desktopLoopTimer = 0;
      if (Number(root.dataset.fxLoopCount || 0) > expectedLoopCount) return;
      if (!desktopLoopLiveState()) return;
      forceDesktopLoopGeometryRecheck('desktop-physical-end-idle', expectedLoopCount);
    }, delay);
  }

  function installDesktopLoopGuard() {
    if (!DESKTOP_LOOP_QUERY.matches) {
      root.dataset.fxDesktopLoopIdleGeometryR350 = 'desktop-fine-pointer-skip';
      return;
    }
    if (root.dataset.fxDesktopLoopIdleGeometryR350 === 'armed') return;

    root.dataset.fxDesktopLoopIdleGeometryR350 = 'armed';
    addEventListener('scroll', event => scheduleDesktopLoopCheck(event, 280), { passive: true });
    addEventListener('scrollend', event => scheduleDesktopLoopCheck(event, 220), { passive: true });
    addEventListener('pageshow', () => scheduleDesktopLoopCheck(null, 380), { passive: true });
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

  function dialogueIsOpen() {
    const bubble = document.querySelector('.fx-organism-thought');
    return root.dataset.fxOrganismThought === 'open'
      && bubble instanceof HTMLElement
      && bubble.hidden === false
      && bubble.getAttribute('aria-hidden') !== 'true';
  }

  function tryOpenReferenceAsk() {
    closeAskBlockers();
    const api = window.FormatXOrganismVoice;
    if (typeof api?.open !== 'function') return false;

    if (root.dataset.fxOrganismDialogueEnabled === 'false' && typeof api.setEnabled === 'function') {
      api.setEnabled(true);
      root.dataset.fxReferenceAskEarlyOwnerR334 = 'reenabled';
    }

    api.open();
    window.FormatXCoreMobileV69?.pulse?.();
    if (!dialogueIsOpen()) return false;

    root.dataset.fxReferenceAskEarlyOwnerR334 = 'opened-stable';
    return true;
  }

  function queueReferenceAskOpen() {
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
      if (tryOpenReferenceAsk()) return;
      if (performance.now() >= askRetryDeadline) {
        root.dataset.fxReferenceAskEarlyOwnerR334 = 'open-timeout';
        return;
      }
      askRetryTimer = setTimeout(retry, 45);
    };

    retry();
    if (!dialogueIsOpen()) root.dataset.fxReferenceAskEarlyOwnerR334 = 'waiting-for-dialogue-runtime';
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
    ensureReferenceLayoutBootstrap();
    activateCoreCss();
    ensureStyle();
    enforceSingleOpticsOwner();
    installDesktopLoopGuard();
    syncQr();
    root.dataset.fxMobileRegressionR310 = 'ready';
  }

  ensureLanguageOwner();
  ensureReferenceLayoutBootstrap();
  activateCoreCss();
  ensureStyle();
  enforceSingleOpticsOwner();
  installDesktopLoopGuard();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  for (const eventName of ['formatx:livingready', 'formatx:languagechange', 'pageshow']) {
    addEventListener(eventName, syncQr, { passive: true });
  }

  addEventListener('formatx:organismvoiceready', () => {
    if (root.dataset.fxReferenceAskEarlyOwnerR334 === 'waiting-for-dialogue-runtime') queueReferenceAskOpen();
  }, { passive: true });

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
    if (target?.closest('.fx-reference-ask')) {
      queueReferenceAskOpen();
      setTimeout(queueReferenceAskOpen, 0);
    }
    if (!target?.closest('[data-currency]')) return;
    queueMicrotask(syncQr);
  }, true);

  for (const delay of [250, 900, 2200]) setTimeout(syncQr, delay);

  addEventListener('pagehide', () => {
    clearTimeout(askRetryTimer);
    clearTimeout(desktopLoopTimer);
    clearTimeout(desktopLoopRefreshTimer);
  }, { once: true });
}());