(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'return-state-v2';
  const LOOP_RUNTIME = '/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js?v=20260812-mobile-seamless-v1';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');

  if (root.dataset.fxReturnStateRecovery === VERSION) return;
  root.dataset.fxReturnStateRecovery = VERSION;

  function navigationType() {
    try {
      return performance.getEntriesByType('navigation')[0]?.type || 'navigate';
    } catch (_) {
      return 'navigate';
    }
  }

  function closeTransientNavigation() {
    root.classList.remove('fx-organism-menu-open');
    document.body?.classList.remove('fx-organism-panel-open');

    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    toggle?.classList.remove('open');
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');

    const consoleRoot = document.getElementById('fx-organism-console');
    if (consoleRoot) {
      consoleRoot.hidden = true;
      consoleRoot.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('[data-organism-panel]').forEach(panel => {
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-organism-tab]').forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
    });
  }

  function releaseStaleIntro(reason) {
    const overlay = document.getElementById('formatx-event-horizon');
    if (overlay) {
      try {
        overlay.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
      } catch (_) {}
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
      overlay.style.removeProperty('display');
      overlay.style.removeProperty('opacity');
    }

    root.classList.remove(
      'fx-intro-pending',
      'fx-intro-running',
      'fx-intro-reveal',
      'fx-intro-managed'
    );
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro = reason;
  }

  function clearTransientScrollState() {
    root.classList.remove(
      'fx-page-scrolling',
      'fx-infinite-loop-jump',
      'fx-three-loop-transfer',
      'fx-seamless-loop-transfer',
      'fx-precision-wheel'
    );
    root.dataset.fxScrollActivity = 'idle';

    root.style.removeProperty('overflow');
    root.style.removeProperty('overscroll-behavior');
    document.body?.style.removeProperty('overflow');
    document.body?.style.removeProperty('overscroll-behavior');

    const height = window.visualViewport?.height || window.innerHeight;
    root.style.setProperty('--fx-visual-viewport-height', Math.round(height) + 'px');
  }

  function runtimeHealthy() {
    return root.dataset.fxInfiniteController === 'seamless-v7'
      && root.dataset.fxAutomaticLoop === 'enabled';
  }

  function ensureSeamlessRuntime() {
    if (runtimeHealthy()) return;
    if (root.dataset.fxScrollBootstrap !== 'platform-scroll-v2') return;

    let script = document.querySelector('script[data-fx-seamless-runtime]');
    const failed = root.dataset.fxInfiniteController === 'native-fallback'
      || root.dataset.fxAutomaticLoop === 'disabled-runtime-error'
      || root.dataset.fxScrollBootstrapState?.endsWith('-failed');

    if (script && !failed) return;
    if (script && failed) script.remove();

    script = document.createElement('script');
    script.src = LOOP_RUNTIME;
    script.async = false;
    script.dataset.fxSeamlessRuntime = MOBILE_QUERY.matches ? 'mobile-recovery' : 'desktop-recovery';
    script.dataset.fxDesktopSeamlessRuntime = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxReturnLoopRecovery = 'runtime-reloaded';
      wakeScrollRuntime();
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxReturnLoopRecovery = 'runtime-reload-failed';
    }, { once: true });
    document.head.appendChild(script);
  }

  function restoreMobileLoopMarkers() {
    if (!MOBILE_QUERY.matches || !runtimeHealthy()) return;
    root.classList.add('fx-mobile-seamless-loop', 'fx-continuous-scroll-mode');
    root.classList.remove('fx-mobile-native-scroll', 'fx-mobile-native-scroll-v2');
    root.dataset.fxMobileScrollMode = 'native-momentum-loop';
    root.dataset.fxMobileScrollPolicy = 'native-momentum-loop-v1';
    root.dataset.fxMobileMomentumGuard = 'scrollend-or-idle-v1';
  }

  function wakeScrollRuntime() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreMobileLoopMarkers();
        dispatchEvent(new Event('resize'));
        dispatchEvent(new Event('scrollend'));
        document.dispatchEvent(new CustomEvent('formatx:returnrestore', {
          detail: {
            version: VERSION,
            mobile: MOBILE_QUERY.matches,
            controller: root.dataset.fxInfiniteController || 'unknown'
          }
        }));
      });
    });
  }

  function recoverRestoredDocument(reason) {
    closeTransientNavigation();
    releaseStaleIntro(reason);
    clearTransientScrollState();
    ensureSeamlessRuntime();
    wakeScrollRuntime();

    root.dataset.fxReturnState = 'recovered';
    document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
      detail: { source: reason }
    }));
  }

  addEventListener('pageshow', event => {
    const restored = event.persisted || navigationType() === 'back_forward';
    if (restored) recoverRestoredDocument(event.persisted ? 'bfcache-return-recovered' : 'history-return-recovered');
    else {
      ensureSeamlessRuntime();
      wakeScrollRuntime();
    }
  }, { passive: true });

  addEventListener('load', () => {
    ensureSeamlessRuntime();
    wakeScrollRuntime();
  }, { once: true, passive: true });
}());