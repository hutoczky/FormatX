(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCategoryDeckStabilizer === 'v1') return;
  root.dataset.fxCategoryDeckStabilizer = 'v1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const NAVIGATION = {
    hu: ['Működés', 'Modulok', 'Licencek', 'Bizonyíték', 'Letöltés'],
    en: ['How it works', 'Modules', 'Licences', 'Proof', 'Download']
  };

  let accessibilityScheduled = false;
  let ensureScheduled = false;
  let bootObserver = null;
  let bootTimer = 0;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function setAttributeIfChanged(element, name, value) {
    if (!(element instanceof Element)) return;
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }

  function ensureReadabilityFloor() {
    if (reducedMotion.matches) {
      root.dataset.fxEarlyReadabilityFloor = 'critical-r236';
      return;
    }
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
      const text = NAVIGATION[language()][index];
      if (anchor.textContent !== text) anchor.textContent = text;
    });
  }

  function createDeck() {
    const heroDecks = Array.from(document.querySelectorAll('#hero .fx-category-deck'));
    heroDecks.forEach(deck => deck.remove());
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

  function stopBootObserver() {
    bootObserver?.disconnect();
    bootObserver = null;
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = 0;
  }

  function announceReady() {
    root.dataset.fxCategoryDeckState = 'ready';
    root.dataset.fxCategoryLayer = 'ready';
    syncNavigation();
    scheduleAccessibility();
    stopBootObserver();
  }

  function ensure() {
    ensureScheduled = false;
    const deck = createDeck();
    if (deck) {
      announceReady();
      return true;
    }
    return false;
  }

  function scheduleEnsure() {
    if (ensureScheduled) return;
    ensureScheduled = true;
    queueMicrotask(ensure);
  }

  function boot() {
    ensureReadabilityFloor();
    syncAccessibility();
    if (ensure()) return;

    const target = document.getElementById('main-content') || document.body || document.documentElement;
    bootObserver = new MutationObserver(scheduleEnsure);
    bootObserver.observe(target, { childList: true, subtree: true });
    bootTimer = setTimeout(() => {
      stopBootObserver();
      if (!ensure()) root.dataset.fxCategoryDeckState = 'missing-target';
    }, 4500);
  }

  for (const name of ['pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop']) {
    addEventListener(name, () => {
      scheduleEnsure();
      scheduleAccessibility();
    }, { passive: true });
  }
  addEventListener('formatx:languagechange', () => queueMicrotask(() => {
    syncNavigation();
    syncAccessibility();
  }));
  addEventListener('pagehide', stopBootObserver, { once: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
