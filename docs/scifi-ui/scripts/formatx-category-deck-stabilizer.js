(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCategoryDeckStabilizer === 'v1') return;
  root.dataset.fxCategoryDeckStabilizer = 'v1';

  const NAVIGATION = {
    hu: ['Működés', 'Modulok', 'Licencek', 'Bizonyíték', 'Letöltés'],
    en: ['How it works', 'Modules', 'Licences', 'Proof', 'Download']
  };

  let retryTimer = 0;
  let attempts = 0;
  let accessibilityScheduled = false;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function setAttributeIfChanged(element, name, value) {
    if (!(element instanceof Element)) return;
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }

  function ensureReadabilityFloor() {
    if (document.querySelector('link[data-fx-early-readability-floor]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/formatx-readability-floor.css?v=20260808-a11y-floor-2';
    link.dataset.fxEarlyReadabilityFloor = 'true';
    document.head.appendChild(link);
  }

  function syncAccessibility() {
    accessibilityScheduled = false;
    ensureReadabilityFloor();

    const brand = document.querySelector('.topbar > a.brand');
    if (brand?.hasAttribute('aria-label')) brand.removeAttribute('aria-label');

    const immersive = document.querySelector('.fx-immersive-launch');
    if (immersive instanceof HTMLButtonElement) {
      setAttributeIfChanged(immersive, 'aria-label', language() === 'en'
        ? 'LIVING CORE LAUNCH — launch the living visual core'
        : 'ÉLŐ MAG INDÍTÁS — az élő vizuális mag indítása');
    }

    const coreNode = document.querySelector('[data-organ-node="0"]');
    if (coreNode instanceof HTMLAnchorElement && coreNode.hasAttribute('aria-label')) {
      coreNode.removeAttribute('aria-label');
    }

    document.querySelectorAll('.fx-plan-qr-link').forEach(link => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const card = link.closest('[data-plan-qr]');
      const planName = card?.querySelector('.fx-plan-qr-copy strong')?.textContent?.trim() || 'FormatX';
      setAttributeIfChanged(link, 'aria-label', language() === 'en'
        ? 'QR — open ' + planName + ' payment page'
        : 'QR — ' + planName + ' fizetési oldal megnyitása');
    });

    const launcher = document.querySelector('[data-fx-live-os-launcher]');
    if (launcher instanceof HTMLButtonElement) {
      const label = language() === 'en'
        ? 'Live OS — FormatX command'
        : 'Live OS — FormatX parancs';
      setAttributeIfChanged(launcher, 'aria-label', label);
      if (launcher.title !== label + ' · Ctrl/⌘ K') launcher.title = label + ' · Ctrl/⌘ K';
    }

    root.dataset.fxEarlyAccessibility = 'ready-v3';
  }

  function scheduleAccessibility() {
    if (accessibilityScheduled) return;
    accessibilityScheduled = true;
    queueMicrotask(syncAccessibility);
  }

  function syncNavigation() {
    document.querySelectorAll('.main-nav a').forEach((anchor, index) => {
      if (!NAVIGATION.hu[index] || !NAVIGATION.en[index]) return;
      anchor.dataset.hu = NAVIGATION.hu[index];
      anchor.dataset.en = NAVIGATION.en[index];
      anchor.textContent = NAVIGATION[language()][index];
    });
  }

  function createDeck() {
    document.querySelectorAll('#hero .fx-category-deck').forEach(deck => deck.remove());
    const standalone = Array.from(document.querySelectorAll('.fx-category-deck'))
      .find(deck => !deck.closest('#hero'));
    if (standalone) return standalone;

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
    root.dataset.fxCategoryLayer = 'ready';
    syncNavigation();
    scheduleAccessibility();
    dispatchEvent(new CustomEvent('formatx:languagechange', {
      detail: { language: language(), source: 'category-deck-stabilizer' }
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

  const structureObserver = new MutationObserver(entries => {
    const standalone = Array.from(document.querySelectorAll('.fx-category-deck'))
      .find(deck => !deck.closest('#hero'));
    const heroDeck = document.querySelector('#hero .fx-category-deck');
    if (!standalone || heroDeck) queueMicrotask(ensure);
    if (entries.some(entry => entry.type === 'childList' || entry.attributeName === 'aria-label')) {
      scheduleAccessibility();
    }
  });
  structureObserver.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-label']
  });

  ensureReadabilityFloor();
  syncAccessibility();
  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, () => {
      ensure();
      scheduleAccessibility();
    });
  });
  addEventListener('formatx:languagechange', () => queueMicrotask(() => {
    syncNavigation();
    syncAccessibility();
  }));

  addEventListener('pagehide', () => {
    clearInterval(retryTimer);
    structureObserver.disconnect();
  }, { once: true });
}());
