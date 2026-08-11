(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'platform-scroll-v2';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');

  if (root.dataset.fxScrollBootstrap === BOOTSTRAP) return;
  root.dataset.fxScrollBootstrap = BOOTSTRAP;

  function stabiliseMobileDocument(source) {
    document.querySelectorAll('.fx-loop-bridge,[data-fx-loop-clone="true"]').forEach(node => node.remove());

    const main = document.getElementById('main-content');
    const footer = document.querySelector('.site-footer');
    if (main && footer && footer.parentElement !== document.body) {
      main.insertAdjacentElement('afterend', footer);
    }
    if (footer) footer.dataset.fxFooterFlow = 'document';

    root.dataset.fxMobileDocumentStability = source;
  }

  function enableMobileNativeDocument() {
    root.dataset.fxInfiniteScroll = 'mobile-native-document-v1';
    root.dataset.fxInfiniteController = 'mobile-native-document-v1';
    root.dataset.fxInfiniteCloneMode = 'disabled-mobile';
    root.dataset.fxInfiniteInput = 'native';
    root.dataset.fxScrollActivity = 'idle';
    root.dataset.fxAutomaticLoop = 'disabled-mobile';
    root.dataset.fxScrollJumpGuard = 'native-document-v1';
    root.dataset.fxLoopBridge = 'disabled-mobile';
    root.dataset.fxScrollSnap = 'disabled';
    root.dataset.fxMobileScrollMode = 'native-document-v1';
    root.dataset.fxMobileScrollPolicy = 'native-document-v1';
    root.dataset.fxScrollBootstrapState = 'mobile-ready';

    root.classList.add('fx-mobile-native-scroll');
    root.classList.remove(
      'fx-continuous-scroll-mode',
      'fx-infinite-loop-jump',
      'fx-three-loop-transfer',
      'fx-precision-wheel',
      'fx-seamless-loop-transfer'
    );

    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: BOOTSTRAP,
      controller: 'mobile-native-document-v1',
      automaticLoop: false,
      visualBridge: false,
      clonedContent: false,
      clonedHeroOnly: false,
      sectionSnapDisabled: true,
      mobileNativeDocument: true,
      mobileNativeMomentumPreserved: true,
      automaticPagePositionChanges: false,
      inputCapture: false
    });

    const stabilise = event => stabiliseMobileDocument(event?.type || 'startup');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', stabilise, { once: true });
    } else {
      stabiliseMobileDocument('ready');
    }
    addEventListener('pageshow', stabilise, { passive: true });
    addEventListener('formatx:livingready', stabilise);
    addEventListener('formatx:organismready', stabilise);
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
