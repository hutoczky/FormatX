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

  function ensure() {
    const deck = createDeck();
    if (deck) {
      root.dataset.fxCategoryDeckState = 'ready';
      clearInterval(retryTimer);
      retryTimer = 0;
      dispatchEvent(new CustomEvent('formatx:languagechange', {
        detail: { language: root.lang === 'en' ? 'en' : 'hu', source: 'category-deck-stabilizer' }
      }));
      return;
    }

    if (!retryTimer) {
      retryTimer = window.setInterval(() => {
        attempts += 1;
        const result = createDeck();
        if (result || attempts >= 80) {
          clearInterval(retryTimer);
          retryTimer = 0;
          if (result) {
            root.dataset.fxCategoryDeckState = 'ready';
            dispatchEvent(new CustomEvent('formatx:languagechange', {
              detail: { language: root.lang === 'en' ? 'en' : 'hu', source: 'category-deck-stabilizer' }
            }));
          } else {
            root.dataset.fxCategoryDeckState = 'missing-target';
          }
        }
      }, 250);
    }
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, ensure);
  });

  addEventListener('pagehide', () => clearInterval(retryTimer), { once: true });
}());
