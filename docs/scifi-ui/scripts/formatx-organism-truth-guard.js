(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismTruthGuard === 'ready-v1') return;
  ROOT.dataset.fxOrganismTruthGuard = 'loading-v1';

  const ANSWERS = Object.freeze({
    hu: Object.freeze({
      platform: 'A Linux/Bazzite az elsődleges platform. A Windows és az Android támogatott Full release platform. A web Technical preview; a macOS és az iOS/iPadOS Planned.',
      safety: 'A FormatX biztonsági modellje célmeghajtó-védelmet, egyértelmű megerősítéseket, naplózott lépéseket és SHA-256 integritásellenőrzést használ. Külön Ed25519-aláírási bizonyíték csak akkor állítható, ha a kiadáshoz ténylegesen publikálták.',
      system: 'A biztonsági váz célmeghajtó-védelmet, megerősítéseket, naplózást és SHA-256 integritásellenőrzést kapcsol a kritikus műveletekhez. Külön aláírási bizonyíték csak tényleges publikálás esetén jelenik meg.'
    }),
    en: Object.freeze({
      platform: 'Linux/Bazzite is the primary platform. Windows and Android are supported Full release platforms. Web is a Technical preview; macOS and iOS/iPadOS are Planned.',
      safety: 'The FormatX safety model uses target-drive protection, explicit confirmations, logged steps and SHA-256 integrity verification. Separate Ed25519 signature proof may be claimed only when it has actually been published for the release.',
      system: 'The safety skeleton adds target-drive protection, confirmations, logging and SHA-256 integrity verification to critical operations. Separate signature proof is shown only when it has actually been published.'
    })
  });

  let currentScene = Number(ROOT.dataset.fxScene || 0);
  let wrappedApi = null;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function fold(value) {
    return String(value || '')
      .toLocaleLowerCase(language() === 'hu' ? 'hu-HU' : 'en-GB')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function classify(question) {
    const value = fold(question);
    if (!value) return '';
    if (/(platform|linux|bazzite|windows|macos|android|ios|ipad|web)/.test(value)) return 'platform';
    if (/(biztonsag|safety|secure|security|vedelem|sha|ed25519|signature|alairas)/.test(value)) return 'safety';
    return '';
  }

  function answer(kind) {
    return ANSWERS[language()][kind] || '';
  }

  function sayCanonical(kind) {
    const text = answer(kind);
    if (!text) return '';
    const api = window.FormatXOrganismVoice;
    if (api && typeof api.say === 'function') api.say(text);
    else {
      const output = document.querySelector('.fx-organism-thought-output');
      if (output) output.textContent = text;
    }
    ROOT.dataset.fxOrganismTruth = kind;
    return text;
  }

  function syncSystemOutput(openWhenRequested) {
    if (currentScene !== 4) return;
    const output = document.querySelector('.fx-organism-thought-output');
    if (output) output.textContent = answer('system');
    if (openWhenRequested) queueMicrotask(() => sayCanonical('system'));
  }

  function interceptForm(event) {
    const form = event.target instanceof Element ? event.target.closest('.fx-organism-question') : null;
    if (!form) return;
    const input = form.querySelector('#fx-organism-question-input');
    const question = input instanceof HTMLInputElement ? input.value : '';
    const kind = classify(question);
    if (!kind) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (input instanceof HTMLInputElement) {
      input.value = '';
      input.focus({ preventScroll: true });
    }
    queueMicrotask(() => sayCanonical(kind));
  }

  function interceptClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('.fx-organism-repeat') && currentScene === 4) {
      event.preventDefault();
      event.stopImmediatePropagation();
      queueMicrotask(() => sayCanonical('system'));
      return;
    }
    if (target.closest('.fx-organism-thought-trigger') && currentScene === 4) {
      queueMicrotask(() => syncSystemOutput(true));
    }
  }

  function wrapPublicApi() {
    const api = window.FormatXOrganismVoice;
    if (!api || api === wrappedApi || typeof api.ask !== 'function') return false;
    const guarded = Object.freeze({
      ask(question) {
        const kind = classify(question);
        if (kind) return sayCanonical(kind);
        return api.ask(question);
      },
      say: api.say.bind(api),
      open: api.open.bind(api),
      close: api.close.bind(api),
      setEnabled: api.setEnabled.bind(api),
      setVoiceEnabled: api.setVoiceEnabled.bind(api),
      voiceInfo: api.voiceInfo.bind(api)
    });
    try {
      window.FormatXOrganismVoice = guarded;
      wrappedApi = guarded;
      return true;
    } catch (_) {
      return false;
    }
  }

  function ready() {
    wrapPublicApi();
    syncSystemOutput(false);
    ROOT.dataset.fxOrganismTruthGuard = 'ready-v1';
  }

  document.addEventListener('submit', interceptForm, true);
  document.addEventListener('click', interceptClick, true);
  addEventListener('formatx:organismstatechange', event => {
    currentScene = Math.max(0, Math.min(5, Number(event.detail?.scene) || 0));
    queueMicrotask(() => syncSystemOutput(false));
  });
  addEventListener('formatx:organismvoiceready', ready);
  addEventListener('formatx:languagechange', () => queueMicrotask(() => syncSystemOutput(false)));
  addEventListener('pageshow', ready);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
}());
