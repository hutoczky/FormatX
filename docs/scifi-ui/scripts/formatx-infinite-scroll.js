(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'platform-scroll-v2';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const RUNTIME_SRC = '/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js?v=20260812-mobile-seamless-v1';
  const MOBILE_LOOP_STYLE = '/scifi-ui/styles/formatx-mobile-seamless-loop.css?v=20260812-r1';

  if (root.dataset.fxScrollBootstrap === BOOTSTRAP) return;
  root.dataset.fxScrollBootstrap = BOOTSTRAP;

  function ensureMobileLoopBridgeOverride() {
    if (document.querySelector('link[data-fx-mobile-loop-bridge-override]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MOBILE_LOOP_STYLE;
    link.dataset.fxMobileLoopBridgeOverride = 'true';
    document.head.appendChild(link);
  }

  function installSeamlessRuntime(platform) {
    const mobile = platform === 'mobile';

    root.dataset.fxScrollBootstrapState = mobile ? 'mobile-loop-loading' : 'desktop-loading';
    root.dataset.fxInfiniteController = mobile ? 'mobile-seamless-loading-v1' : 'desktop-runtime-loading-v7';
    root.dataset.fxAutomaticLoop = mobile ? 'pending-mobile' : 'desktop-only';
    root.dataset.fxInfiniteInput = 'native';
    root.dataset.fxScrollSnap = 'disabled';
    root.dataset.fxLoopBridge = 'initialising';

    if (mobile) {
      root.dataset.fxMobileScrollMode = 'native-momentum-loop';
      root.dataset.fxMobileScrollPolicy = 'native-momentum-loop-v1';
      root.dataset.fxMobileMomentumGuard = 'scrollend-or-idle-v1';
      root.classList.add('fx-mobile-seamless-loop');
      root.classList.remove('fx-mobile-native-scroll', 'fx-mobile-native-scroll-v2');
      ensureMobileLoopBridgeOverride();
    }

    const existing = document.querySelector('script[data-fx-seamless-runtime]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = RUNTIME_SRC;
    script.async = false;
    script.dataset.fxSeamlessRuntime = platform;
    script.dataset.fxDesktopSeamlessRuntime = 'true';

    script.addEventListener('load', () => {
      root.dataset.fxScrollBootstrapState = mobile ? 'mobile-loop-ready' : 'desktop-ready';
      if (mobile) {
        root.dataset.fxMobileScrollMode = 'native-momentum-loop';
        root.dataset.fxMobileScrollPolicy = 'native-momentum-loop-v1';
      }
    }, { once: true });

    script.addEventListener('error', () => {
      root.dataset.fxScrollBootstrapState = mobile ? 'mobile-loop-failed' : 'desktop-failed';
      root.dataset.fxInfiniteController = 'native-fallback';
      root.dataset.fxAutomaticLoop = 'disabled-runtime-error';
      root.dataset.fxInfiniteInput = 'native';
      root.dataset.fxLoopBridge = 'disabled-runtime-error';
      root.classList.remove('fx-seamless-loop-transfer', 'fx-mobile-seamless-loop');
      root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
        version: BOOTSTRAP,
        controller: 'native-fallback',
        automaticLoop: false,
        visualBridge: false,
        mobileNativeMomentumPreserved: true,
        inputCapture: false
      });
    }, { once: true });

    document.head.appendChild(script);
  }

  if (MOBILE_QUERY.matches) installSeamlessRuntime('mobile');
  else installSeamlessRuntime('desktop');
}());
