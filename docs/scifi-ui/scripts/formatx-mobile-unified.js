(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileUnified === 'ready-v1') return;
  root.dataset.fxMobileUnified = 'loading-v1';

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
  syncViewportHeight();

  root.dataset.fxMobileScrollPolicy = 'native-document-v1';

  addEventListener('formatx:pagestartscroll', closeDialogueForScroll);
  addEventListener('formatx:loop', closeDialogueForScroll);
  addEventListener('resize', syncViewportHeight, { passive: true });
  window.visualViewport?.addEventListener('resize', syncViewportHeight, { passive: true });
  addEventListener('pageshow', syncViewportHeight, { passive: true });

  root.dataset.fxMobileUnified = 'ready-v1';
}());