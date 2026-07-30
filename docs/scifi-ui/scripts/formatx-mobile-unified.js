(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileUnified === 'ready-v1') return;
  root.dataset.fxMobileUnified = 'loading-v1';

  function ensureStyle() {
    if (document.querySelector('link[data-fx-mobile-unified-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/formatx-mobile-unified.css?v=20260730-mobile-unified-1';
    link.dataset.fxMobileUnifiedStyle = 'true';
    link.addEventListener('load', () => {
      root.dataset.fxMobileUnifiedStyle = 'ready';
    }, { once: true });
    link.addEventListener('error', () => {
      root.dataset.fxMobileUnifiedStyle = 'failed';
    }, { once: true });
    document.head.appendChild(link);
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

  addEventListener('formatx:pagestartscroll', closeDialogueForScroll);
  addEventListener('formatx:loop', closeDialogueForScroll);
  addEventListener('resize', syncViewportHeight, { passive: true });
  window.visualViewport?.addEventListener('resize', syncViewportHeight, { passive: true });
  addEventListener('pageshow', syncViewportHeight, { passive: true });

  root.dataset.fxMobileUnified = 'ready-v1';
}());