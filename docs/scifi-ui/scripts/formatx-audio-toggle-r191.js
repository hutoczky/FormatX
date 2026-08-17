(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioToggleR191 === 'ready') return;
  root.dataset.fxAudioToggleR191 = 'booting';

  const styleHref = '/scifi-ui/styles/formatx-audio-toggle-r191.css?v=20260817-r191';
  if (!document.querySelector('link[data-fx-audio-toggle-r191-style]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styleHref;
    link.dataset.fxAudioToggleR191Style = 'true';
    document.head.appendChild(link);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fx-audio-toggle-r191';
  button.dataset.state = 'off';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-live', 'polite');
  button.disabled = true;
  button.innerHTML = '<span data-fx-audio-toggle-label>UNMUTE</span>';
  document.body.appendChild(button);

  const label = button.querySelector('[data-fx-audio-toggle-label]');
  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const sourceButton = () => document.querySelector('.fx-three-sound');

  function sync() {
    const source = sourceButton();
    const available = source instanceof HTMLButtonElement
      && (source.dataset.fxAudioOwner === 'professional-v6' || root.dataset.fxAudioOwner === 'professional-v6');
    const on = root.dataset.fxAudioState === 'on';
    const pending = root.dataset.fxAudioState === 'pending';
    const blocked = root.dataset.fxAudioState === 'blocked';

    button.disabled = !available || pending;
    button.dataset.state = on ? 'on' : pending ? 'pending' : blocked ? 'blocked' : 'off';
    button.setAttribute('aria-pressed', String(on));

    if (label) label.textContent = on ? 'MUTE' : pending ? 'STARTING' : 'UNMUTE';
    button.setAttribute('aria-label', on
      ? (language() === 'en' ? 'Mute FormatX cinematic audio' : 'FormatX filmes hang némítása')
      : (language() === 'en' ? 'Unmute FormatX cinematic audio' : 'FormatX filmes hang bekapcsolása'));

    root.dataset.fxAudioPublicControl = 'mute-unmute-r191';
    root.dataset.fxAudioPublicControlState = button.dataset.state;
    root.dataset.fxAudioPublicControlAvailable = available ? 'true' : 'false';
  }

  button.addEventListener('click', event => {
    event.preventDefault();
    const source = sourceButton();
    if (!(source instanceof HTMLButtonElement)) return;
    source.click();
  });

  const rootObserver = new MutationObserver(sync);
  rootObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-state', 'data-fx-audio-owner', 'lang']
  });

  const bodyObserver = new MutationObserver(sync);
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  addEventListener('formatx:languagechange', sync);
  addEventListener('pageshow', sync);
  addEventListener('pagehide', () => {
    rootObserver.disconnect();
    bodyObserver.disconnect();
  }, { once: true });

  root.dataset.fxAudioToggleR191 = 'ready';
  sync();
}());
