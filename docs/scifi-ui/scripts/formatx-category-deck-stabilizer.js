(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCategoryDeckStabilizer === 'v1') return;
  root.dataset.fxCategoryDeckStabilizer = 'v1';

  let retryTimer = 0;
  let attempts = 0;

  function createDeck() {
    const existing = document.querySelector('.fx-category-deck');
    if (existing && !existing.closest('#hero')) return existing;
    if (existing) existing.remove();

    const main = document.getElementById('main-content');
    const experience = document.getElementById('experience');
    if (!main || !experience || experience.parentElement !== main) return null;

    const deck = document.createElement('section');
    deck.className = 'fx-category-deck fx-category-deck--standalone';
    deck.setAttribute('aria-labelledby', 'fx-category-title');
    deck.innerHTML = '<header><p class="section-index" data-fx-category-eyebrow></p><h2 id="fx-category-title" data-fx-category-title></h2><p data-fx-category-lead></p></header><div class="fx-category-grid"></div>';
    experience.insertAdjacentElement('beforebegin', deck);
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
    const deck = document.querySelector('.fx-category-deck');
    if (!deck || deck.closest('#hero')) queueMicrotask(ensure);
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
