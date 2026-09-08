(function () {
  'use strict';

  const root = document.documentElement;
  const BOOTSTRAP = 'platform-scroll-v2';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const RUNTIME_SRC = '/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js?v=20260908-r700-resize-before-boundary';
  const MOBILE_LOOP_STYLE = '/scifi-ui/styles/formatx-mobile-seamless-loop.css?v=20260812-r1';
  const DESKTOP_RUNTIME_GUARD_STYLE = '/scifi-ui/styles/formatx-desktop-runtime-guard-r597.css?v=20260907-r613-final-layout-before-loop';
  const HEART_CORE_RUNTIME = '/scifi-ui/scripts/formatx-heart-core-r252.js?v=20260908-r696-r603-release-window';
  const HERO_START_HASHES = new Set(['', '#top', '#hero']);
  const DESKTOP_GEOMETRY_SELECTOR = [
    '#main-content > section.scene:not(#hero)',
    '#main-content > .fx-category-deck',
    '#main-content .fx-origin-proof',
    '.fx-live-os',
    '#live-os-overview',
    '.fx-static-live-os',
    '.fx-award-proof',
    '.fx-product-showcase',
    '#user-feedback',
    '.fx-feedback-public',
    '.site-footer',
    '#main-content > section.scene:not(#hero) > .flow',
    '#main-content > section.scene:not(#hero) > .cards',
    '#main-content > section.scene:not(#hero) > .pricing',
    '#main-content > section.scene:not(#hero) > .payment',
    '#main-content > section.scene:not(#hero) > .payment-console',
    '#main-content > section.scene:not(#hero) > #formatx-plan-qr-dock',
    '#main-content > section.scene:not(#hero) > .system-grid',
    '#main-content > section.scene:not(#hero) > .release-layout'
  ].join(',');
  const DESKTOP_GEOMETRY_ROOT_SELECTOR = '#main-content,.site-footer';
  let mobileGeometryTimer = 0;
  let desktopGeometryTimer = 0;
  let intentArmed = false;
  let intentResolved = false;

  if (root.dataset.fxScrollBootstrap === BOOTSTRAP) return;
  root.dataset.fxScrollBootstrap = BOOTSTRAP;
  root.dataset.fxScrollBootstrapRevision = 'r700-resize-before-boundary-recheck';
  root.dataset.fxScrollIntentPolicyR649 = 'physical-wheel-touch-keyboard-only';
  root.dataset.fxDesktopRuntimeGuardR597 = 'scroll-intent-loaded-reachable-loop-compact-mini';
  root.dataset.fxDesktopLoopLayoutR613 = 'idle-until-desktop-scroll-intent';
  root.dataset.fxDesktopLoopLifecycleR621 = 'organism-settle-recheck-through-canonical-scroll-owner';
  root.dataset.fxDesktopLoopSettledCommitR659 = 'scrollend-rechecks-canonical-v7-owner';
  root.dataset.fxDesktopLoopResyncR700 = 'resize-settle-before-boundary-recheck';

  function ensureMobileLoopBridgeOverride() {
    if (document.querySelector('link[data-fx-mobile-loop-bridge-override]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MOBILE_LOOP_STYLE;
    link.dataset.fxMobileLoopBridgeOverride = 'true';
    document.head.appendChild(link);
  }

  function ensureDesktopRuntimeGuardStyle() {
    return new Promise(resolve => {
      let link = document.querySelector('link[data-fx-desktop-runtime-guard-r597]');
      if (link instanceof HTMLLinkElement && link.sheet) {
        root.dataset.fxDesktopLoopLayoutR613 = 'ready-existing-before-runtime';
        resolve(link);
        return;
      }
      if (!(link instanceof HTMLLinkElement)) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = DESKTOP_RUNTIME_GUARD_STYLE;
        link.dataset.fxDesktopRuntimeGuardR597 = 'true';
        document.head.appendChild(link);
      }

      let settled = false;
      const finish = source => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        link.removeEventListener('load', onLoad);
        link.removeEventListener('error', onError);
        root.dataset.fxDesktopLoopLayoutR613 = source;
        requestAnimationFrame(() => resolve(link));
      };
      const onLoad = () => finish('ready-load-before-runtime');
      const onError = () => finish('failed-load-runtime-continues');
      link.addEventListener('load', onLoad, { once: true });
      link.addEventListener('error', onError, { once: true });
      const timer = window.setTimeout(() => {
        finish(link.sheet ? 'ready-sheet-timeout-check-before-runtime' : 'failed-style-timeout-runtime-continues');
      }, 2000);
    });
  }

  function collectDesktopGeometryOwners() {
    const owners = new Set(document.querySelectorAll(DESKTOP_GEOMETRY_SELECTOR));
    let inspected = 0;
    let discovered = 0;
    for (const scope of document.querySelectorAll(DESKTOP_GEOMETRY_ROOT_SELECTOR)) {
      if (!(scope instanceof HTMLElement)) continue;
      const candidates = [scope, ...scope.querySelectorAll('*')];
      for (const node of candidates) {
        if (!(node instanceof HTMLElement)) continue;
        inspected += 1;
        let visibility = '';
        try {
          const style = getComputedStyle(node);
          visibility = String(style.contentVisibility || style.getPropertyValue('content-visibility') || '').trim();
        } catch (_) {}
        if (visibility !== 'auto') continue;
        if (!owners.has(node)) discovered += 1;
        owners.add(node);
      }
    }
    root.dataset.fxDesktopLazyGeometryInspectedR634 = String(inspected);
    root.dataset.fxDesktopLazyGeometryDiscoveredR634 = String(discovered);
    return owners;
  }

  function realiseDesktopDocumentGeometry(source) {
    if (MOBILE_QUERY.matches) return 0;
    let count = 0;
    for (const node of collectDesktopGeometryOwners()) {
      if (!(node instanceof HTMLElement)) continue;
      node.style.setProperty('content-visibility', 'visible', 'important');
      node.style.setProperty('contain-intrinsic-size', 'none', 'important');
      count += 1;
    }
    const height = document.documentElement.scrollHeight;
    root.dataset.fxDesktopDocumentGeometryR631 = `realised-${count}`;
    root.dataset.fxDesktopDocumentGeometryR634 = `${String(source || 'runtime')}:${count}:${height}`;
    return count;
  }

  function realiseDesktopOrganismTriggerGeometry() {
    if (MOBILE_QUERY.matches) return 0;
    const scenes = new Set();
    for (const trigger of document.querySelectorAll('[data-organism-open]')) {
      const scene = trigger.closest('#main-content > section.scene:not(#hero)');
      if (scene instanceof HTMLElement) scenes.add(scene);
    }
    for (const scene of scenes) {
      scene.style.setProperty('content-visibility', 'visible', 'important');
      scene.style.setProperty('contain-intrinsic-size', 'none', 'important');
    }
    if (scenes.size) {
      const height = document.documentElement.scrollHeight;
      root.dataset.fxDesktopOrganismTriggerGeometryR634 = `realised-${scenes.size}:${height}`;
    }
    return scenes.size;
  }

  function ensureHeartCoreRuntime() {
    if (document.querySelector('script[data-fx-heart-core-r252]')) return;
    const script = document.createElement('script');
    script.src = HEART_CORE_RUNTIME;
    script.async = false;
    script.dataset.fxHeartCoreR252 = 'true';
    document.head.appendChild(script);
  }

  function requestLoopGeometryRefresh(source) {
    dispatchEvent(new CustomEvent('formatx:loopgeometryrefresh', { detail: { source: source || 'scroll-bootstrap' } }));
  }

  function requestMobileGeometryRefresh(recheckBoundary) {
    if (!MOBILE_QUERY.matches) return;
    clearTimeout(mobileGeometryTimer);
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
    for (const eventName of ['formatx:mobilelayoutready','formatx:controlownerready','formatx:languagechange','pageshow']) {
      addEventListener(eventName, () => requestMobileGeometryRefresh(false), { passive: true });
    }
  }

  function requestDesktopGeometryRefresh(recheckBoundary, source) {
    if (MOBILE_QUERY.matches) return;
    clearTimeout(desktopGeometryTimer);
    desktopGeometryTimer = window.setTimeout(() => {
      desktopGeometryTimer = 0;
      if (root.dataset.fxInfiniteController !== 'seamless-v7') return;

      /* R700: v7 listens to resize, not the bootstrap-only custom refresh event.
         First let its canonical repair/ResizeObserver path settle the live bridge
         geometry; only then re-evaluate a desktop crossing. This preserves native
         input while preventing a stale pre-Organism snapshot from swallowing the
         user's footer-to-hero loop. */
      root.dataset.fxDesktopLoopGeometry = 'layout-refresh-dispatched-r700';
      dispatchEvent(new Event('resize'));
      desktopGeometryTimer = window.setTimeout(() => {
        desktopGeometryTimer = 0;
        if (root.dataset.fxInfiniteController !== 'seamless-v7') return;
        requestLoopGeometryRefresh(source || 'desktop-idle-r700');
        root.dataset.fxDesktopLoopGeometry = recheckBoundary
          ? 'settled-boundary-recheck-requested-r700'
          : 'settled-refresh-complete-r700';
        if (recheckBoundary) {
          dispatchEvent(new Event('scroll'));
          root.dataset.fxDesktopLoopGeometry = source === 'desktop-scrollend-settled-r659'
            ? 'scrollend-boundary-rechecked-r700'
            : 'lifecycle-boundary-rechecked-r700';
        }
      }, 96);
    }, 90);
  }

  function installDesktopGeometryResync() {
    if (MOBILE_QUERY.matches || root.dataset.fxDesktopLoopGeometryResync === 'isolated-r659') return;
    root.dataset.fxDesktopLoopGeometryResync = 'isolated-r659';
    addEventListener('scroll', event => {
      if (!event.isTrusted) return;
      requestDesktopGeometryRefresh(false, 'desktop-scroll-idle-r621');
    }, { passive: true });
    addEventListener('scrollend', () => {
      requestDesktopGeometryRefresh(true, 'desktop-scrollend-settled-r659');
    }, { passive: true });
    for (const eventName of ['formatx:controlownerready','formatx:languagechange','pageshow','formatx:organisminterfaceready','formatx:organismpanelopen','formatx:organismpanelclose']) {
      addEventListener(eventName, () => requestDesktopGeometryRefresh(true, `${eventName}-settled-r621`), { passive: true });
    }
  }

  function realiseDesktopDeferredStylesForLoop() {
    if (MOBILE_QUERY.matches) return Promise.resolve(0);
    const pending = Array.from(document.querySelectorAll('link[data-fx-r637-href]:not([href])'));
    if (!pending.length) {
      root.dataset.fxDesktopDeferredGeometryR675 = 'ready-no-pending-links';
      return Promise.resolve(0);
    }
    root.dataset.fxDesktopDeferredGeometryR675 = `restoring-${pending.length}`;
    return Promise.all(pending.map(link => new Promise(resolve => {
      if (!(link instanceof HTMLLinkElement)) { resolve(); return; }
      let settled = false;
      let timer = 0;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        link.removeEventListener('load', finish);
        link.removeEventListener('error', finish);
        resolve();
      };
      link.addEventListener('load', finish, { once: true });
      link.addEventListener('error', finish, { once: true });
      const media = link.dataset.fxR487Media || link.dataset.fxDeferredMediaR300 || 'all';
      const href = link.dataset.fxR637Href || '';
      if (media) link.media = media;
      if (href) link.href = href;
      timer = setTimeout(finish, 2500);
    }))).then(() => {
      root.dataset.fxDesktopDeferredGeometryR675 = `ready-${pending.length}`;
      return pending.length;
    });
  }

  function waitForDesktopDocumentStable(maxFrames = 10) {
    if (MOBILE_QUERY.matches) return Promise.resolve(document.documentElement.scrollHeight);
    return new Promise(resolve => {
      let previousHeight = -1;
      let stableFrames = 0;
      let frames = 0;
      const settle = () => {
        realiseDesktopDocumentGeometry('settle-r638');
        const height = document.documentElement.scrollHeight;
        stableFrames = previousHeight >= 0 && Math.abs(height - previousHeight) <= 1 ? stableFrames + 1 : 0;
        previousHeight = height;
        frames += 1;
        root.dataset.fxDesktopGeometrySettleR638 = `${frames}:${height}:${stableFrames}`;
        if (stableFrames >= 2 || frames >= maxFrames) {
          root.dataset.fxDesktopLoopLayoutR613 = `stable-document-before-runtime-r638-${height}`;
          resolve(height);
          return;
        }
        requestAnimationFrame(settle);
      };
      const begin = () => requestAnimationFrame(settle);
      if (document.readyState === 'complete') begin();
      else addEventListener('load', begin, { once: true });
    });
  }

  function mountSeamlessRuntime(platform) {
    const mobile = platform === 'mobile';
    if (document.querySelector('script[data-fx-seamless-runtime]')) return;

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
        root.dataset.fxDesktopLoopLayoutR613 = 'runtime-mounted-after-final-layout-style';
        requestDesktopGeometryRefresh(true, 'desktop-runtime-mounted-r621');
      }
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxScrollBootstrapState = mobile ? 'mobile-loop-failed' : 'desktop-failed';
      root.dataset.fxInfiniteController = 'native-fallback';
      root.dataset.fxAutomaticLoop = 'disabled-runtime-error';
      root.dataset.fxInfiniteInput = 'native';
      root.dataset.fxScrollSnap = 'disabled';
      root.dataset.fxLoopBridge = 'disabled-runtime-error';
      root.classList.remove('fx-seamless-loop-transfer', 'fx-mobile-seamless-loop');
      root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({ version: BOOTSTRAP, controller: 'native-fallback', automaticLoop: false, visualBridge: false, mobileNativeMomentumPreserved: true, inputCapture: false });
    }, { once: true });
    document.head.appendChild(script);
  }

  function installSeamlessRuntime(platform) {
    const mobile = platform === 'mobile';
    if (document.querySelector('script[data-fx-seamless-runtime]')) return;

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
      mountSeamlessRuntime(platform);
      return;
    }

    root.dataset.fxDesktopLoopLayoutR613 = 'realising-discovered-document-before-final-layout-style-r675';
    realiseDesktopDocumentGeometry('pre-guard-r675');
    ensureDesktopRuntimeGuardStyle().then(() => {
      realiseDesktopDocumentGeometry('post-guard-r675');
      return realiseDesktopDeferredStylesForLoop();
    }).then(() => waitForDesktopDocumentStable(18)).then(() => {
      realiseDesktopDocumentGeometry('pre-runtime-r675');
      root.dataset.fxDesktopLoopLayoutR613 = `final-document-stable-after-deferred-css-r675-${document.documentElement.scrollHeight}`;
      installDesktopGeometryResync();
      mountSeamlessRuntime(platform);
    });
  }

  function armSeamlessRuntime(platform) {
    if (intentArmed || intentResolved) return;
    intentArmed = true;
    root.dataset.fxScrollBootstrapState = 'deferred-until-scroll-intent-r534';
    root.dataset.fxInfiniteController = 'seamless-v7-intent-pending';
    root.dataset.fxAutomaticLoop = 'pending-user-scroll-intent';
    root.dataset.fxInfiniteInput = 'native';
    root.dataset.fxScrollSnap = 'disabled';
    root.dataset.fxLoopBridge = 'deferred-until-scroll-intent';
    if (platform === 'mobile') {
      root.dataset.fxMobileScrollMode = 'native-momentum-loop';
      root.dataset.fxMobileScrollPolicy = 'native-momentum-loop-v1';
      root.dataset.fxMobileMomentumGuard = 'scrollend-or-idle-v1';
    }

    const cleanup = () => {
      removeEventListener('wheel', resolve, true);
      document.removeEventListener('touchstart', resolve, true);
      document.removeEventListener('pointerdown', pointerResolve, true);
      document.removeEventListener('keydown', keyResolve, true);
    };
    const activate = source => {
      if (intentResolved) return;
      intentResolved = true;
      cleanup();
      root.dataset.fxScrollIntentR534 = source;
      installSeamlessRuntime(platform);
    };
    const resolve = event => activate(event.type || 'physical-scroll-intent');
    const pointerResolve = event => { if (event.pointerType === 'touch') activate('pointer-touch'); };
    const keyResolve = event => {
      if (['ArrowDown','ArrowUp','PageDown','PageUp','End','Home',' '].includes(event.key)) activate('keyboard-scroll');
    };

    addEventListener('wheel', resolve, { capture: true, passive: true });
    document.addEventListener('touchstart', resolve, { capture: true, passive: true });
    document.addEventListener('pointerdown', pointerResolve, { capture: true, passive: true });
    document.addEventListener('keydown', keyResolve, { capture: true, passive: true });

    if (Math.abs(scrollY) > 1 || !HERO_START_HASHES.has(location.hash)) queueMicrotask(() => activate('existing-scroll-or-deep-link'));
  }

  ensureHeartCoreRuntime();
  addEventListener('formatx:organisminterfaceready', realiseDesktopOrganismTriggerGeometry, { passive: true });
  if (root.classList.contains('fx-organism-interface-ready') || root.dataset.fxOrganismInterface === 'ready') queueMicrotask(realiseDesktopOrganismTriggerGeometry);
  armSeamlessRuntime(MOBILE_QUERY.matches ? 'mobile' : 'desktop');
}());