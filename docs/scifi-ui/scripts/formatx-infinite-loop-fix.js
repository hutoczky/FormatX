(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteFix === 'retired-seamless-v7') return;
  root.dataset.fxInfiniteFix = 'retired-seamless-v7';
  root.dataset.fxLegacyScrollController = 'disabled';
  root.dataset.fxAudioLabelFix = 'v2';

  function syncAudioActionLabel() {
    const button = document.querySelector('.fx-three-sound');
    const label = button?.querySelector('span');
    if (!button || !label) return;
    const state = button.dataset.fxAudioState || root.dataset.fxAudioState || 'off';
    const english = root.lang === 'en';
    let nextLabel;
    let nextAria;
    if (state === 'pending') {
      nextLabel = english ? 'STARTING…' : 'INDÍTÁS…';
      nextAria = english ? 'Starting the cinematic score' : 'Filmes zene indítása';
    } else if (state === 'blocked') {
      nextLabel = english ? 'TAP AGAIN' : 'KOPPINTS ÚJRA';
      nextAria = english ? 'Tap again to enable the cinematic score' : 'Koppints újra a filmes zene bekapcsolásához';
    } else if (state === 'on') {
      nextLabel = english ? 'MUSIC OFF' : 'ZENE KI';
      nextAria = english ? 'Disable the cinematic score' : 'Filmes zene kikapcsolása';
    } else {
      nextLabel = english ? 'MUSIC ON' : 'ZENE BE';
      nextAria = english ? 'Enable the cinematic score' : 'Filmes zene bekapcsolása';
    }
    if (label.textContent !== nextLabel) label.textContent = nextLabel;
    if (button.getAttribute('aria-label') !== nextAria) button.setAttribute('aria-label', nextAria);
  }

  function loadScript(marker, src, readyKey) {
    if (document.querySelector('script[' + marker + ']')) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.setAttribute(marker, 'true');
    script.addEventListener('load', () => { if (readyKey) root.dataset[readyKey] = 'ready'; }, { once: true });
    script.addEventListener('error', () => { if (readyKey) root.dataset[readyKey] = 'error'; }, { once: true });
    document.head.appendChild(script);
  }

  function loadDependentLayers() {
    loadScript('data-fx-category-deck-stabilizer', './scripts/formatx-category-deck-stabilizer.js?v=20260728-category-deck-v1', 'fxCategoryDeckStabilizerLayer');
    loadScript('data-fx-origin-proof-script', './scripts/formatx-origin-proof.js?v=20260728-origin-proof-v1', 'fxOriginProofLayer');
    loadScript('data-fx-simulator-entry-script', './scripts/project-simulator-entry.js?v=20260728-operational-twin-1', 'fxSimulatorEntryLayer');
  }

  function loadCategoryLayer() {
    if (!document.querySelector('link[data-fx-category-style]')) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = './styles/formatx-category-positioning.css?v=20260728-category-v1';
      style.dataset.fxCategoryStyle = 'true';
      document.head.appendChild(style);
    }
    const existing = document.querySelector('script[data-fx-category-script]');
    if (existing) {
      loadDependentLayers();
      return;
    }
    const script = document.createElement('script');
    script.src = './scripts/formatx-category-positioning.js?v=20260728-category-v1';
    script.async = false;
    script.dataset.fxCategoryScript = 'true';
    script.addEventListener('load', loadDependentLayers, { once: true });
    script.addEventListener('error', loadDependentLayers, { once: true });
    document.head.appendChild(script);
  }

  const audioLabelObserver = new MutationObserver(syncAudioActionLabel);
  audioLabelObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-state', 'data-fx-audio-level', 'lang'],
    childList: true,
    subtree: true
  });

  addEventListener('pageshow', () => {
    syncAudioActionLabel();
    loadCategoryLayer();
  }, { passive: true });
  addEventListener('formatx:languagechange', syncAudioActionLabel);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('.fx-three-sound')) queueMicrotask(syncAudioActionLabel);
  }, true);

  syncAudioActionLabel();
  loadCategoryLayer();

  addEventListener('pagehide', () => audioLabelObserver.disconnect(), { once: true });
}());
