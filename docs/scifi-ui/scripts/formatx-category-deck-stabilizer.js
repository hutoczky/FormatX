(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCategoryDeckStabilizer === 'v1') return;
  root.dataset.fxCategoryDeckStabilizer = 'v1';

  let retryTimer = 0;
  let attempts = 0;

  function createDeck() {
    const existing = document.querySelector('.fx-category-deck');
    if (existing) return existing;
    const hero = document.getElementById('hero');
    const grid = hero?.querySelector('.hero-grid');
    if (!hero || !grid) return null;

    const deck = document.createElement('section');
    deck.className = 'fx-category-deck';
    deck.setAttribute('aria-labelledby', 'fx-category-title');
    deck.innerHTML = '<header><p class="section-index" data-fx-category-eyebrow></p><h2 id="fx-category-title" data-fx-category-title></h2><p data-fx-category-lead></p></header><div class="fx-category-grid"></div>';
    grid.insertAdjacentElement('afterend', deck);
    return deck;
  }

  function announceReady() {
    root.dataset.fxCategoryDeckState = 'ready';
    dispatchEvent(new CustomEvent('formatx:languagechange', {
      detail: { language: root.lang === 'en' ? 'en' : 'hu', source: 'category-deck-stabilizer' }
    }));
  }

  function ensure() {
    const deck = createDeck();
    if (deck) {
      announceReady();
      clearInterval(retryTimer);
      retryTimer = 0;
      attempts = 0;
      return;
    }

    if (!retryTimer) {
      attempts = 0;
      retryTimer = window.setInterval(() => {
        attempts += 1;
        const result = createDeck();
        if (result || attempts >= 80) {
          clearInterval(retryTimer);
          retryTimer = 0;
          if (result) announceReady();
          else root.dataset.fxCategoryDeckState = 'missing-target';
        }
      }, 250);
    }
  }

  const structureObserver = new MutationObserver(() => {
    if (!document.querySelector('.fx-category-deck')) queueMicrotask(ensure);
  });
  structureObserver.observe(root, { childList: true, subtree: true });

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, ensure);
  });

  addEventListener('pagehide', () => {
    clearInterval(retryTimer);
    structureObserver.disconnect();
  }, { once: true });
}());
