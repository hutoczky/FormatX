(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileUnified === 'ready-v3') return;
  root.dataset.fxMobileUnified = 'loading-v3';

  const SEAMLESS_BOOTSTRAP = './scripts/formatx-infinite-scroll.js?v=20260820-reference-loop-r247';

  function appendStyle(marker, href, readyKey) {
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
    }, { once: true });
    document.head.appendChild(link);
  }

  function ensureStyle() {
    appendStyle(
      'data-fx-mobile-unified-style',
      './styles/formatx-mobile-unified.css?v=20260811-production-stability-r4',
      'fxMobileUnifiedStyle'
    );
    appendStyle(
      'data-fx-mobile-production-r5',
      './styles/formatx-mobile-production-r5.css?v=20260811-production-r5',
      'fxMobileProductionR5'
    );
  }

  function ensureReturnStateRecovery() {
    if (document.querySelector('script[data-fx-return-state-recovery]')) return;
    const script = document.createElement('script');
    script.src = './scripts/formatx-return-state-recovery.js?v=20260820-reference-loop-r246';
    script.async = false;
    script.dataset.fxReturnStateRecovery = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxReturnStateRecoveryLoad = 'ready-v3';
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxReturnStateRecoveryLoad = 'failed';
    }, { once: true });
    document.head.appendChild(script);
  }

  function syncScrollPolicyMarker() {
    const seamless = root.dataset.fxInfiniteController === 'seamless-v7'
      || root.dataset.fxMobileScrollMode === 'native-momentum-loop'
      || root.classList.contains('fx-mobile-seamless-loop');

    if (seamless) {
      root.dataset.fxMobileScrollPolicy = 'native-momentum-loop-v1';
      root.dataset.fxMobileScrollMode = 'native-momentum-loop';
      return;
    }

    if (!root.dataset.fxScrollBootstrap) {
      root.dataset.fxMobileScrollPolicy = 'native-document-v1';
    }
  }

  function ensureSeamlessScrollBootstrap() {
    if (root.dataset.fxScrollBootstrap === 'platform-scroll-v2') {
      syncScrollPolicyMarker();
      return;
    }

    const existing = document.querySelector(
      'script[data-fx-seamless-scroll-runtime], script[data-fx-mobile-seamless-bootstrap], script[src*="formatx-infinite-scroll.js"]'
    );
    if (existing) {
      existing.addEventListener('load', syncScrollPolicyMarker, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SEAMLESS_BOOTSTRAP;
    script.async = false;
    script.dataset.fxMobileSeamlessBootstrap = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxMobileSeamlessBootstrap = 'ready-v1';
      requestAnimationFrame(syncScrollPolicyMarker);
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxMobileSeamlessBootstrap = 'failed-v1';
      root.dataset.fxMobileScrollPolicy = 'native-document-v1';
    }, { once: true });
    document.head.appendChild(script);
  }

  function closeDialogueForScroll() {
    const dialogue = document.querySelector('.fx-organism-dialogue.is-open');
    if (!dialogue) return;
    const close = dialogue.querySelector('.fx-organism-thought-close');
    if (close instanceof HTMLButtonElement) close.click();
    if (dialogue.classList.contains('is-speaking') && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function syncViewportHeight() {
    const height = window.visualViewport?.height || window.innerHeight;
    root.style.setProperty('--fx-visual-viewport-height', Math.round(height) + 'px');
  }

  ensureStyle();
  ensureReturnStateRecovery();
  syncViewportHeight();
  syncScrollPolicyMarker();
  ensureSeamlessScrollBootstrap();

  addEventListener('formatx:pagestartscroll', closeDialogueForScroll);
  addEventListener('formatx:loop', closeDialogueForScroll);
  addEventListener('resize', syncViewportHeight, { passive: true });
  window.visualViewport?.addEventListener('resize', syncViewportHeight, { passive: true });
  addEventListener('pageshow', () => {
    syncViewportHeight();
    ensureReturnStateRecovery();
    ensureSeamlessScrollBootstrap();
    requestAnimationFrame(syncScrollPolicyMarker);
  }, { passive: true });
  document.addEventListener('formatx:returnrestore', syncScrollPolicyMarker);
  addEventListener('formatx:loop', syncScrollPolicyMarker, { passive: true });

  root.dataset.fxMobileUnified = 'ready-v3';
}());
