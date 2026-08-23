(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'platform-scroll-v2';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const RUNTIME_SRC = '/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js?v=20260823-r316-dcl-safe-geometry';
  const MOBILE_LOOP_STYLE = '/scifi-ui/styles/formatx-mobile-seamless-loop.css?v=20260812-r1';
  let mobileGeometryTimer = 0;
  let desktopGeometryTimer = 0;

  if (root.dataset.fxScrollBootstrap === BOOTSTRAP) return;
  root.dataset.fxScrollBootstrap = BOOTSTRAP;
  root.dataset.fxScrollBootstrapRevision = 'r316-dcl-safe';

  function ensureMobileLoopBridgeOverride() {
    if (document.querySelector('link[data-fx-mobile-loop-bridge-override]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MOBILE_LOOP_STYLE;
    link.dataset.fxMobileLoopBridgeOverride = 'true';
    document.head.appendChild(link);
  }

  function requestLoopGeometryRefresh(source) {
    dispatchEvent(new CustomEvent('formatx:loopgeometryrefresh', {
      detail: { source: source || 'scroll-bootstrap' }
    }));
  }

  function requestMobileGeometryRefresh(recheckBoundary) {
    if (!MOBILE_QUERY.matches) return;
    clearTimeout(mobileGeometryTimer);

    // r316: never synthesize a global resize from mobile-layout events.
    // r207 listens to resize and emits formatx:mobilelayoutready; feeding that
    // event back into resize created an unbounded microtask/event cycle that
    // starved DOMContentLoaded on real mobile navigation. The loop runtime now
    // owns a dedicated geometry-refresh event with no layout-owner feedback.
    requestLoopGeometryRefresh('mobile-layout-settled-r316');
    root.dataset.fxMobileLoopGeometry = 'refresh-requested-r316-dcl-safe';

    if (!recheckBoundary) return;
    mobileGeometryTimer = window.setTimeout(() => {
      mobileGeometryTimer = 0;
      if (root.dataset.fxInfiniteController !== 'seamless-v7') return;
      dispatchEvent(new Event('scroll'));
      root.dataset.fxMobileLoopGeometry = 'idle-boundary-rechecked-r316';
    }, 96);
  }

  function installMobileGeometryResync() {
    if (!MOBILE_QUERY.matches || root.dataset.fxMobileLoopGeometryResync === 'isolated-r316') return;
    root.dataset.fxMobileLoopGeometryResync = 'isolated-r316';

    addEventListener('scrollend', () => requestMobileGeometryRefresh(true), { passive: true });

    for (const eventName of [
      'formatx:mobilelayoutready',
      'formatx:controlownerready',
      'formatx:languagechange',
      'pageshow'
    ]) addEventListener(eventName, () => requestMobileGeometryRefresh(false), { passive: true });
  }

  function requestDesktopGeometryRefresh() {
    if (MOBILE_QUERY.matches) return;
    clearTimeout(desktopGeometryTimer);
    desktopGeometryTimer = window.setTimeout(() => {
      desktopGeometryTimer = 0;
      if (root.dataset.fxInfiniteController !== 'seamless-v7') return;
      requestLoopGeometryRefresh('desktop-idle-r316');
      root.dataset.fxDesktopLoopGeometry = 'idle-refresh-requested-r316';
    }, 90);
  }

  function installDesktopGeometryResync() {
    if (MOBILE_QUERY.matches || root.dataset.fxDesktopLoopGeometryResync === 'isolated-r316') return;
    root.dataset.fxDesktopLoopGeometryResync = 'isolated-r316';
    addEventListener('scroll', requestDesktopGeometryRefresh, { passive: true });

    for (const eventName of [
      'formatx:controlownerready',
      'formatx:languagechange',
      'pageshow'
    ]) addEventListener(eventName, requestDesktopGeometryRefresh, { passive: true });
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
      installMobileGeometryResync();
    } else {
      installDesktopGeometryResync();
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
        requestMobileGeometryRefresh(false);
      } else {
        requestDesktopGeometryRefresh();
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