(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxWdaHardening === 'r260') return;
  root.dataset.fxWdaHardening = 'r260';
  root.dataset.fxWdaSound = 'muted-default';

  // Strict-CSP diagnostics stay in data attributes, never presentation styles.
  try {
    const rootStyle = root.style;
    const nativeSetProperty = rootStyle.setProperty.bind(rootStyle);
    rootStyle.setProperty = function (name, value, priority) {
      if (name === '--fx-audio-self-test-peak') {
        root.dataset.fxAudioSelfTestPeak = String(value);
        return;
      }
      if (name === '--fx-audio-signal') {
        root.dataset.fxAudioSignal = String(value);
        return;
      }
      return nativeSetProperty(name, value, priority);
    };
    root.dataset.fxWdaAudioTelemetry = 'csp-safe-r260';
  } catch (_) {
    root.dataset.fxWdaAudioTelemetry = 'native-fallback';
  }

  const SELECTOR = '.fx-three-sound';
  const AUDIO_SRC = '/scifi-ui/scripts/formatx-audio-repair.js?v=20260817-r198-wda-sound';
  const ICONS = Object.freeze({
    muted: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M15 9.2c1.2 1.5 1.2 4.1 0 5.6"/><path d="M18 6.8c2.8 2.9 2.8 7.5 0 10.4"/></svg>',
    pending: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 3a9 9 0 1 1-8.3 5.5"/><path d="M4 3v5h5"/></svg>',
    retry: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 8.5A8 8 0 1 1 4 15"/><path d="M4 4v5h5"/></svg>'
  });
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
    label.classList.add('fx-wda-sound-icon');
    label.setAttribute('aria-hidden', 'true');
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
      const iconState = pending ? 'pending' : blocked ? 'retry' : on ? 'sound' : 'muted';
      const label = ensureLabel(button);
      if (label.dataset.fxWdaSoundIcon !== iconState) {
        label.innerHTML = ICONS[iconState];
        label.dataset.fxWdaSoundIcon = iconState;
      }
      button.setAttribute('aria-pressed', String(on));
      const aria = pending
        ? (language() === 'en' ? 'Starting FormatX cinematic audio' : 'FormatX filmes hang indítása')
        : blocked
          ? (language() === 'en' ? 'Retry FormatX cinematic audio' : 'FormatX filmes hang újrapróbálása')
          : on
            ? (language() === 'en' ? 'Mute FormatX cinematic audio' : 'FormatX filmes hang némítása')
            : (language() === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása');
      button.setAttribute('aria-label', aria);
      button.setAttribute('title', aria);
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
      label.className = 'fx-wda-sound-icon';
      label.setAttribute('aria-hidden', 'true');
      label.innerHTML = ICONS.muted;
      label.dataset.fxWdaSoundIcon = 'muted';
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
      queueMicrotask(() => sync(ensureButton()));
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

  // Audio state is the only steady-state mutation source that needs observation.
  // The former document-wide body observer called ensureButton() for every DOM
  // mutation and kept the mobile page from reaching a CPU-idle period.
  const rootObserver = new MutationObserver(() => {
    const button = pickButton();
    if (button) sync(button);
  });
  rootObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-owner', 'data-fx-audio-state', 'data-fx-audio-level']
  });

  for (const eventName of [
    'formatx:languagechange',
    'formatx:real3dready',
    'formatx:organisminterfaceready',
    'pageshow'
  ]) addEventListener(eventName, () => sync(ensureButton()));

  ensureButton();
}());
