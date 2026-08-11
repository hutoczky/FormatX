(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'platform-scroll-v2';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const MOBILE_CONTROLLER = 'mobile-native-document-v1';
  const MOBILE_ACTIVE_CLASS = 'fx-mobile-scroll-active';

  if (root.dataset.fxScrollBootstrap === BOOTSTRAP) return;
  root.dataset.fxScrollBootstrap = BOOTSTRAP;

  function removeLegacyMobileLoopNodes() {
    document.querySelectorAll([
      '.fx-loop-bridge',
      '.fx-loop-hero-clone',
      '.fx-transcend-loop-bridge',
      '[data-fx-loop-clone="true"]'
    ].join(',')).forEach(node => node.remove());
  }

  function stabiliseMobileDocument(source) {
    removeLegacyMobileLoopNodes();

    const main = document.getElementById('main-content');
    const footer = document.querySelector('.site-footer');
    if (main && footer && footer.parentElement !== document.body) {
      main.insertAdjacentElement('afterend', footer);
    }
    if (footer) footer.dataset.fxFooterFlow = 'document';

    root.dataset.fxMobileDocumentStability = source;
  }

  function installMobileMomentumState() {
    let idleTimer = 0;
    let active = false;

    const finish = () => {
      clearTimeout(idleTimer);
      idleTimer = 0;
      if (!active) return;
      active = false;
      root.classList.remove(MOBILE_ACTIVE_CLASS, 'fx-page-scrolling');
      root.dataset.fxScrollActivity = 'idle';
      dispatchEvent(new CustomEvent('formatx:pageendscroll', {
        detail: { controller: MOBILE_CONTROLLER, nativeMomentum: true }
      }));
    };

    const mark = event => {
      if (!MOBILE_QUERY.matches) return;
      if (!active) {
        active = true;
        root.classList.add(MOBILE_ACTIVE_CLASS, 'fx-page-scrolling');
        root.dataset.fxScrollActivity = 'scrolling';
        dispatchEvent(new CustomEvent('formatx:pagestartscroll', {
          detail: {
            controller: MOBILE_CONTROLLER,
            nativeMomentum: true,
            source: event?.type || 'scroll'
          }
        }));
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 150);
    };

    addEventListener('scroll', mark, { passive: true });
    document.addEventListener('touchmove', mark, { passive: true, capture: true });
    if ('onscrollend' in window) addEventListener('scrollend', finish, { passive: true });
    addEventListener('pagehide', finish, { once: true });

    root.dataset.fxMobileMomentumGuard = 'native-v2';
  }

  function scheduleMobileCleanup() {
    const clean = () => stabiliseMobileDocument('late-cleanup');
    setTimeout(clean, 0);
    setTimeout(clean, 350);
    setTimeout(clean, 1400);
    setTimeout(clean, 4000);
  }

  function enableMobileNativeDocument() {
    root.dataset.fxInfiniteScroll = MOBILE_CONTROLLER;
    root.dataset.fxInfiniteController = MOBILE_CONTROLLER;
    root.dataset.fxInfiniteCloneMode = 'disabled-mobile';
    root.dataset.fxInfiniteInput = 'native';
    root.dataset.fxScrollActivity = 'idle';
    root.dataset.fxAutomaticLoop = 'disabled-mobile';
    root.dataset.fxScrollJumpGuard = 'native-document-v2';
    root.dataset.fxLoopBridge = 'disabled-mobile';
    root.dataset.fxScrollSnap = 'disabled';
    root.dataset.fxMobileScrollMode = 'native-document-v1';
    root.dataset.fxMobileScrollPolicy = 'native-momentum-v2';
    root.dataset.fxScrollBootstrapState = 'mobile-ready';

    root.classList.add('fx-mobile-native-scroll', 'fx-mobile-native-scroll-v2');
    root.classList.remove(
      'fx-continuous-scroll-mode',
      'fx-infinite-loop-jump',
      'fx-three-loop-transfer',
      'fx-precision-wheel',
      'fx-seamless-loop-transfer'
    );

    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: BOOTSTRAP,
      controller: MOBILE_CONTROLLER,
      automaticLoop: false,
      visualBridge: false,
      clonedContent: false,
      clonedHeroOnly: false,
      sectionSnapDisabled: true,
      mobileNativeDocument: true,
      mobileNativeMomentumPreserved: true,
      automaticPagePositionChanges: false,
      inputCapture: false,
      scrollAnchoringGuard: true,
      lateLoopCleanup: true
    });

    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    } catch (_) {}

    const stabilise = event => stabiliseMobileDocument(event?.type || 'startup');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', stabilise, { once: true });
    } else {
      stabiliseMobileDocument('ready');
    }

    addEventListener('pageshow', stabilise, { passive: true });
    addEventListener('formatx:livingready', stabilise);
    addEventListener('formatx:organismready', stabilise);
    addEventListener('formatx:interface-ready', stabilise);

    installMobileMomentumState();
    scheduleMobileCleanup();
  }

  function enableDesktopSeamlessRuntime() {
    root.dataset.fxScrollBootstrapState = 'desktop-loading';
    root.dataset.fxInfiniteController = 'desktop-runtime-loading-v7';
    root.dataset.fxAutomaticLoop = 'desktop-only';

    const existing = document.querySelector('script[data-fx-desktop-seamless-runtime]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js?v=20260811-desktop-only-v1';
    script.async = false;
    script.dataset.fxDesktopSeamlessRuntime = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxScrollBootstrapState = 'desktop-ready';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxScrollBootstrapState = 'desktop-failed';
      root.dataset.fxInfiniteController = 'native-fallback';
      root.dataset.fxAutomaticLoop = 'disabled-runtime-error';
      root.dataset.fxInfiniteInput = 'native';
      root.classList.remove('fx-seamless-loop-transfer');
      root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
        version: BOOTSTRAP,
        controller: 'native-fallback',
        automaticLoop: false,
        visualBridge: false,
        inputCapture: false
      });
    }, { once: true });
    document.head.appendChild(script);
  }

  if (MOBILE_QUERY.matches) enableMobileNativeDocument();
  else enableDesktopSeamlessRuntime();
}());
