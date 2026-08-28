(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxWdaHardening === 'r263') return;
  root.dataset.fxWdaHardening = 'r263';
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
  let layoutQueued = false;
  let bootObserver = null;
  let bootTimer = 0;

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const mobileViewport = () => matchMedia('(max-width: 900px), (pointer: coarse)').matches;

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

  function clearLegacyControlGeometry(node) {
    if (!(node instanceof HTMLElement)) return;
    if (node.hasAttribute('style')) node.removeAttribute('style');
  }

  function canonicalizeReferenceControls(button) {
    const hero = document.getElementById('hero');
    const grid = hero?.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    const controls = hero?.querySelector('.fx-reference-controls-r204');
    const rail = controls?.querySelector(':scope > .fx-reference-rail') || hero?.querySelector('.fx-reference-rail');
    const ask = rail?.querySelector('.fx-reference-ask');
    const pause = rail?.querySelector('.fx-reference-pause');
    const topbar = document.querySelector('.topbar');
    const mag = document.querySelector('.fx-reference-mag-button');
    const lang = document.querySelector('.fx-language-toggle');
    const menu = document.querySelector('.fx-reference-menu-button');

    if (!(hero instanceof HTMLElement)
      || !(grid instanceof HTMLElement)
      || !(space instanceof HTMLElement)
      || !(controls instanceof HTMLElement)
      || !(rail instanceof HTMLElement)
      || !(button instanceof HTMLButtonElement)) return false;

    if (button.parentElement !== controls) controls.prepend(button);
    if (rail.parentElement !== controls) controls.appendChild(rail);

    const mobile = mobileViewport();
    const owner = space;
    if (controls.parentElement !== owner) owner.appendChild(controls);

    // r244 and older mobile generations may have left inline !important flex,
    // top/right or translate geometry. The late r263 stylesheet is the single
    // final geometry owner, so remove only layout inline state from this small
    // canonical control group. Audio state and event listeners remain intact.
    for (const node of [controls, rail, button, ask, pause]) clearLegacyControlGeometry(node);

    controls.classList.add('fx-reference-controls-r263');
    button.classList.add('fx-wda-sound-toggle');

    if (mag instanceof HTMLButtonElement) {
      mag.classList.add('fx-reference-mag-text-r263');
      mag.textContent = language() === 'en' ? 'CORE' : 'MAG';
    }

    if (topbar instanceof HTMLElement && lang instanceof HTMLElement && lang.parentElement !== topbar) topbar.appendChild(lang);
    if (topbar instanceof HTMLElement && mag instanceof HTMLElement && mag.parentElement !== topbar) topbar.appendChild(mag);
    if (topbar instanceof HTMLElement && menu instanceof HTMLElement && menu.parentElement !== topbar) topbar.appendChild(menu);

    root.dataset.fxReferenceControlLayout = mobile ? 'r250-mobile-reference-rail' : 'r263-desktop-three-cell';
    root.dataset.fxReferenceHeaderLayout = mag instanceof HTMLElement ? 'r263-fixed-no-overlap' : 'r263-header-pending';
    return true;
  }

  function stopBootObserver() {
    if (bootObserver) bootObserver.disconnect();
    bootObserver = null;
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = 0;
  }

  function normalizeLayout() {
    layoutQueued = false;
    const button = pickButton();
    if (!(button instanceof HTMLButtonElement)) return false;
    sync(button);
    const ready = canonicalizeReferenceControls(button);
    if (ready) stopBootObserver();
    return ready;
  }

  function scheduleLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(normalizeLayout);
  }

  function startLayoutBoot() {
    if (normalizeLayout() || bootObserver) return;
    const target = document.body || document.documentElement;
    bootObserver = new MutationObserver(() => {
      if (normalizeLayout()) stopBootObserver();
    });
    bootObserver.observe(target, { subtree: true, childList: true });
    bootTimer = setTimeout(() => {
      stopBootObserver();
      normalizeLayout();
    }, 5000);
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
    canonicalizeReferenceControls(button);
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
      queueMicrotask(() => {
        const button = ensureButton();
        sync(button);
        scheduleLayout();
      });
    }, { once: true });
    script.addEventListener('error', () => {
      loadingAudio = false;
      root.dataset.fxWdaSound = 'engine-load-failed';
      const button = ensureButton();
      button.dataset.fxAudioState = 'blocked';
      sync(button);
      scheduleLayout();
    }, { once: true });
    document.head.appendChild(script);
  }

  // r418: do not replace/load the SOUND runtime between pointerdown and the
  // browser's synthesized click. That DOM handoff used to cancel the physical
  // tap on Android/Playwright. Arm the gesture here; load after click delivery.
  document.addEventListener('pointerdown', event => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
    if (!target || root.dataset.fxAudioOwner === 'professional-v6') return;
    root.dataset.fxWdaSoundTouchR418 = 'gesture-armed';
  }, { capture: true, passive: true });

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest(SELECTOR) : null;
    if (!target || root.dataset.fxAudioOwner === 'professional-v6') return;
    event.preventDefault();
    root.dataset.fxWdaSoundTouchR418 = 'click-received';
    requestProfessionalAudio();
    const button = ensureButton();
    button.dataset.fxAudioState = 'blocked';
    sync(button);
    scheduleLayout();
  }, true);

  // Audio/reference state are the only steady-state mutation sources observed.
  // No document-wide steady-state DOM observer is installed.
  const rootObserver = new MutationObserver(records => {
    const button = pickButton();
    if (button) sync(button);
    if (records.some(record => record.attributeName === 'data-fx-reference-production-r244')) scheduleLayout();
  });
  rootObserver.observe(root, {
    attributes: true,
    attributeFilter: [
      'data-fx-audio-owner',
      'data-fx-audio-state',
      'data-fx-audio-level',
      'data-fx-reference-production-r244'
    ]
  });

  for (const eventName of [
    'formatx:languagechange',
    'formatx:real3dready',
    'formatx:coredetailready',
    'formatx:organisminterfaceready',
    'formatx:mobilelayoutready',
    'pageshow'
  ]) addEventListener(eventName, () => {
    sync(ensureButton());
    scheduleLayout();
  });

  addEventListener('resize', scheduleLayout, { passive: true });
  addEventListener('orientationchange', scheduleLayout, { passive: true });

  ensureButton();
  startLayoutBoot();
}());
