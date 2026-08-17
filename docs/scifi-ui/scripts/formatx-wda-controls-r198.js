(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxWdaHardening === 'r198') return;
  root.dataset.fxWdaHardening = 'r198';
  root.dataset.fxWdaSound = 'muted-default';

  const SELECTOR = '.fx-three-sound';
  const AUDIO_SRC = '/scifi-ui/scripts/formatx-audio-repair.js?v=20260817-r198-wda-sound';
  let loadingAudio = false;
  let syncing = false;

  const language = () => root.lang === 'en' ? 'en' : 'hu';

  function pickButton() {
    const buttons = Array.from(document.querySelectorAll(SELECTOR)).filter(node => node instanceof HTMLButtonElement);
    if (!buttons.length) return null;
    return buttons.find(button => button.dataset.fxAudioOwner === 'professional-v6') || buttons[0];
  }

  function ensureLabel(button) {
    let label = button.querySelector('[data-fx-wda-sound-label]');
    if (!(label instanceof HTMLElement)) {
      label = button.querySelector('span');
      if (!(label instanceof HTMLElement)) {
        label = document.createElement('span');
        button.appendChild(label);
      }
      label.dataset.fxWdaSoundLabel = 'true';
    }
    return label;
  }

  function sync(button) {
    if (!(button instanceof HTMLButtonElement) || syncing) return;
    syncing = true;
    try {
      button.classList.add('fx-wda-sound-toggle');
      button.type = 'button';
      button.hidden = false;
      const state = button.dataset.fxAudioState || root.dataset.fxAudioState || 'off';
      const on = state === 'on';
      const pending = state === 'pending';
      const blocked = state === 'blocked';
      const text = pending ? 'STARTING…' : blocked ? 'RETRY' : on ? 'MUTE' : 'UNMUTE';
      const label = ensureLabel(button);
      if (label.textContent !== text) label.textContent = text;
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', on
        ? (language() === 'en' ? 'Mute FormatX cinematic audio' : 'FormatX filmes hang némítása')
        : (language() === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása'));
      button.setAttribute('title', on ? 'MUTE' : 'UNMUTE');
      root.dataset.fxWdaSound = pending ? 'starting' : blocked ? 'retry' : on ? 'unmuted' : 'muted';
    } finally {
      syncing = false;
    }
  }

  function ensureButton() {
    let button = pickButton();
    if (!button) {
      button = document.createElement('button');
      button.className = 'fx-three-sound fx-wda-sound-toggle';
      button.type = 'button';
      button.dataset.fxAudioState = 'off';
      button.setAttribute('aria-pressed', 'false');
      const label = document.createElement('span');
      label.dataset.fxWdaSoundLabel = 'true';
      label.textContent = 'UNMUTE';
      button.appendChild(label);
      document.body.appendChild(button);
    }

    for (const duplicate of Array.from(document.querySelectorAll(SELECTOR))) {
      if (duplicate !== button) duplicate.remove();
    }
    sync(button);
    return button;
  }

  function requestProfessionalAudio() {
    if (root.dataset.fxAudioOwner === 'professional-v6' || loadingAudio) return;
    if (document.querySelector('script[src*="formatx-audio-repair.js"]')) return;
    loadingAudio = true;
    root.dataset.fxWdaSound = 'loading-engine';
    const script = document.createElement('script');
    script.src = AUDIO_SRC;
    script.async = true;
    script.dataset.fxWdaAudioR198 = 'true';
    script.addEventListener('load', () => {
      loadingAudio = false;
      setTimeout(() => sync(ensureButton()), 0);
    }, { once: true });
    script.addEventListener('error', () => {
      loadingAudio = false;
      root.dataset.fxWdaSound = 'engine-load-failed';
      const button = ensureButton();
      button.dataset.fxAudioState = 'blocked';
      sync(button);
    }, { once: true });
    document.head.appendChild(script);
  }

  document.addEventListener('pointerdown', event => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
    if (!target || root.dataset.fxAudioOwner === 'professional-v6') return;
    requestProfessionalAudio();
  }, { capture: true, passive: true });

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
    if (!target || root.dataset.fxAudioOwner === 'professional-v6') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    requestProfessionalAudio();
    const button = ensureButton();
    button.dataset.fxAudioState = 'blocked';
    sync(button);
  }, true);

  const bodyObserver = new MutationObserver(() => ensureButton());
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  const rootObserver = new MutationObserver(() => {
    const button = pickButton();
    if (button) sync(button);
  });
  rootObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-owner', 'data-fx-audio-state', 'data-fx-audio-level']
  });

  addEventListener('formatx:languagechange', () => sync(ensureButton()));
  addEventListener('pageshow', () => sync(ensureButton()));
  ensureButton();
}());
