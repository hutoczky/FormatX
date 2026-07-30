(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismNaturalVoiceGuard === 'ready-v1') return;
  ROOT.dataset.fxOrganismNaturalVoiceGuard = 'loading-v1';

  const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const NATURAL_TOKENS = /natural|neural|online|premium|enhanced|studio|expressive|wavenet/i;
  const TRUSTED_ENGINE_TOKENS = /google|samsung|apple|siri/i;
  const LEGACY_TOKENS = /desktop|legacy|sapi|onecore|mobile|compact|espeak|festival|pico|mbrola|robot/i;
  const failedVoices = new Set();

  let active = false;
  let selectedVoice = null;
  let currentText = '';
  let searchRun = 0;
  let speechRun = 0;
  let pauseTimer = 0;
  let voiceButton = null;
  let repeatButton = null;
  let privacyNote = null;

  const COPY = {
    hu: {
      on: '🔊 Természetes hang be',
      off: '🔇 Hang ki',
      enable: 'Természetes Organizmus-hang bekapcsolása',
      disable: 'Organizmus hangjának kikapcsolása',
      searching: 'Természetes magyar hang keresése…',
      unavailable: 'Ebben a böngészőben nem találtam természetes magyar hangot. A régi Windows rendszerhangot szándékosan nem használom. Próbáld Edge-ben vagy Chrome-ban, illetve telepíts Natural vagy Online magyar beszédhangot.',
      privacy: 'Csak Natural, Neural vagy Online hang használható'
    },
    en: {
      on: '🔊 Natural voice on',
      off: '🔇 Voice off',
      enable: 'Enable the natural Organism voice',
      disable: 'Disable the Organism voice',
      searching: 'Searching for a natural English voice…',
      unavailable: 'No natural English voice is available in this browser. The legacy Windows system voice is intentionally blocked. Try Edge or Chrome, or install a Natural or Online speech voice.',
      privacy: 'Only a Natural, Neural or Online voice may be used'
    }
  };

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function locale() {
    return language() === 'en' ? 'en-GB' : 'hu-HU';
  }

  function copy() {
    return COPY[language()];
  }

  function voiceId(voice) {
    return String(voice?.voiceURI || voice?.name || '');
  }

  function descriptor(voice) {
    return `${voice?.name || ''} ${voice?.voiceURI || ''}`.toLowerCase();
  }

  function quality(voice) {
    const value = descriptor(voice);
    if (LEGACY_TOKENS.test(value)) return 'legacy';
    if (NATURAL_TOKENS.test(value)) return 'natural';
    if (TRUSTED_ENGINE_TOKENS.test(value)) return 'enhanced';
    return 'standard';
  }

  function score(voice) {
    const expected = locale().toLowerCase();
    const lang = String(voice.lang || '').toLowerCase();
    const value = descriptor(voice);
    if (!lang.startsWith(expected.slice(0, 2))) return -100000;
    if (failedVoices.has(voiceId(voice))) return -100000;

    const level = quality(voice);
    if (level === 'legacy' || level === 'standard') return -10000;

    let result = lang === expected ? 700 : 420;
    if (level === 'natural') result += 2200;
    if (level === 'enhanced') result += 1100;
    if (voice.localService === false) result += 650;
    if (/online/.test(value)) result += 600;
    if (/natural|neural/.test(value)) result += 500;
    if (/premium|enhanced|studio|expressive|wavenet/.test(value)) result += 320;
    if (/google/.test(value)) result += 260;
    if (/samsung|apple|siri/.test(value)) result += 220;
    if (/microsoft/.test(value) && !/natural|neural|online/.test(value)) result -= 2000;
    if (voice.default) result += 10;

    if (language() === 'hu' && /noemi|noémi|tamás|tamas|anna|tünde|google magyar/.test(value)) result += 170;
    if (language() === 'en' && /aria|jenny|sonia|ryan|ava|samantha|daniel|serena|google uk english/.test(value)) result += 150;
    return result;
  }

  function candidates() {
    if (!speechSupported) return [];
    return speechSynthesis.getVoices()
      .map(voice => ({ voice, score: score(voice) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function selectVoice() {
    const list = candidates();
    selectedVoice = list[0]?.voice || null;
    ROOT.dataset.fxOrganismNaturalVoiceCount = String(list.length);
    ROOT.dataset.fxOrganismNaturalVoiceName = selectedVoice?.name || 'unavailable';
    ROOT.dataset.fxOrganismNaturalVoiceQuality = selectedVoice ? quality(selectedVoice) : 'unavailable';
    ROOT.dataset.fxOrganismNaturalVoiceService = selectedVoice?.localService === false
      ? 'browser-online'
      : selectedVoice
        ? 'device-enhanced'
        : 'legacy-blocked';
    return selectedVoice;
  }

  async function waitForVoice(timeoutMs) {
    const immediate = selectVoice();
    if (immediate) return immediate;

    const run = ++searchRun;
    const timeout = Math.max(400, Number(timeoutMs) || 1900);
    return new Promise(resolve => {
      let finished = false;
      const timers = [];
      const finish = voice => {
        if (finished || run !== searchRun) return;
        finished = true;
        timers.forEach(clearTimeout);
        speechSynthesis.removeEventListener?.('voiceschanged', check);
        resolve(voice || null);
      };
      const check = () => {
        const voice = selectVoice();
        if (voice) finish(voice);
      };

      speechSynthesis.addEventListener?.('voiceschanged', check);
      [80, 220, 480, 850, 1250].forEach(delay => {
        timers.push(window.setTimeout(check, Math.min(delay, timeout - 20)));
      });
      timers.push(window.setTimeout(() => finish(selectVoice()), timeout));
    });
  }

  function findControls() {
    voiceButton = document.querySelector('.fx-organism-voice-toggle');
    repeatButton = document.querySelector('.fx-organism-repeat');
    privacyNote = document.querySelector('.fx-organism-privacy');
    const output = document.querySelector('.fx-organism-thought-output');
    if (output?.textContent?.trim()) currentText = output.textContent.trim();
    return voiceButton instanceof HTMLButtonElement;
  }

  function syncControls() {
    if (!findControls()) return;
    const words = copy();
    voiceButton.textContent = active ? words.on : words.off;
    voiceButton.setAttribute('aria-pressed', String(active));
    voiceButton.setAttribute('aria-label', active ? words.disable : words.enable);
    voiceButton.title = active ? words.disable : words.enable;
    voiceButton.disabled = !speechSupported;
    voiceButton.dataset.fxNaturalVoiceOwner = 'true';
    if (repeatButton instanceof HTMLButtonElement) {
      repeatButton.disabled = !speechSupported || !active;
      repeatButton.dataset.fxNaturalVoiceOwner = 'true';
    }
    if (privacyNote) {
      privacyNote.textContent = selectedVoice
        ? `${words.privacy} · ${selectedVoice.name}`
        : words.privacy;
    }
    ROOT.dataset.fxOrganismNaturalVoiceEnabled = String(active);
  }

  function showMessage(text) {
    const api = window.FormatXOrganismVoice;
    if (api?.say) {
      api.say(text);
      return;
    }
    const output = document.querySelector('.fx-organism-thought-output');
    const bubble = document.querySelector('.fx-organism-thought');
    const shell = document.querySelector('.fx-organism-dialogue');
    if (output) output.textContent = text;
    if (bubble instanceof HTMLElement) {
      bubble.hidden = false;
      bubble.setAttribute('aria-hidden', 'false');
    }
    shell?.classList.add('is-open');
  }

  function stop() {
    speechRun += 1;
    clearTimeout(pauseTimer);
    pauseTimer = 0;
    try { speechSynthesis.cancel(); } catch (_) {}
    document.querySelector('.fx-organism-dialogue')?.classList.remove('is-speaking');
    ROOT.dataset.fxOrganismSpeech = 'idle';
  }

  function speechText(text) {
    let value = String(text || '').replace(/\s+/g, ' ').trim().replace(/FormatX/g, 'Format X');
    if (language() === 'hu') {
      return value
        .replace(/SHA-256/gi, 'SHA kettő öt hat')
        .replace(/Ed25519/gi, 'Ed kettő öt öt egy kilenc')
        .replace(/\bHUF\b/g, 'forint')
        .replace(/\bEUR\b/g, 'euró')
        .replace(/\bQR\b/g, 'kú er')
        .replace(/\bAPK\b/g, 'á pé ká')
        .replace(/\bAI\b/g, 'mesterséges intelligencia');
    }
    return value
      .replace(/SHA-256/gi, 'S H A two fifty six')
      .replace(/Ed25519/gi, 'Ed two five five one nine')
      .replace(/\bHUF\b/g, 'H U F')
      .replace(/\bEUR\b/g, 'euros')
      .replace(/\bQR\b/g, 'Q R')
      .replace(/\bAPK\b/g, 'A P K')
      .replace(/\bAI\b/g, 'A I');
  }

  function chunks(text) {
    const prepared = speechText(text);
    return (prepared.match(/[^.!?;:]+[.!?;:]?|[^.!?;:]+$/g) || [prepared])
      .map(value => value.trim())
      .filter(Boolean);
  }

  function pauseAfter(text) {
    if (/[:;]$/.test(text)) return 160;
    if (/[,–—]$/.test(text)) return 95;
    if (/[.!?]$/.test(text)) return 210;
    return 120;
  }

  function speak(text) {
    if (!active || !speechSupported || !text) return;
    stop();
    const voice = selectVoice();
    if (!voice) {
      disable(false);
      showMessage(copy().unavailable);
      ROOT.dataset.fxOrganismSpeech = 'natural-voice-unavailable';
      return;
    }

    const run = ++speechRun;
    const parts = chunks(text);
    let announced = false;

    const next = (index, retry) => {
      if (run !== speechRun || index >= parts.length) {
        document.querySelector('.fx-organism-dialogue')?.classList.remove('is-speaking');
        ROOT.dataset.fxOrganismSpeech = 'idle';
        return;
      }

      const activeVoice = selectedVoice || selectVoice();
      if (!activeVoice) {
        disable(false);
        showMessage(copy().unavailable);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(parts[index]);
      utterance.lang = locale();
      utterance.voice = activeVoice;
      utterance.rate = language() === 'en' ? 0.94 : 0.90;
      utterance.pitch = language() === 'en' ? 0.99 : 0.97;
      utterance.volume = 0.94;

      utterance.addEventListener('start', () => {
        if (run !== speechRun) return;
        if (!announced) {
          announced = true;
          ROOT.dataset.fxOrganismSpeech = 'speaking';
          ROOT.dataset.fxOrganismSpeechMode = 'natural-only-guard-v1';
          document.querySelector('.fx-organism-dialogue')?.classList.add('is-speaking');
        }
      }, { once: true });

      utterance.addEventListener('end', () => {
        if (run !== speechRun) return;
        pauseTimer = window.setTimeout(() => next(index + 1, 0), pauseAfter(parts[index]));
      }, { once: true });

      utterance.addEventListener('error', event => {
        if (run !== speechRun) return;
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        failedVoices.add(voiceId(activeVoice));
        selectedVoice = null;
        if (selectVoice() && retry < 1) {
          pauseTimer = window.setTimeout(() => next(index, retry + 1), 80);
          return;
        }
        disable(false);
        showMessage(copy().unavailable);
      }, { once: true });

      speechSynthesis.speak(utterance);
    };

    next(0, 0);
  }

  function disable(updateMessage) {
    active = false;
    stop();
    syncControls();
    if (updateMessage) showMessage(copy().unavailable);
  }

  async function enable() {
    if (!speechSupported) {
      showMessage(copy().unavailable);
      return;
    }

    if (!findControls()) return;
    voiceButton.disabled = true;
    if (privacyNote) privacyNote.textContent = copy().searching;
    ROOT.dataset.fxOrganismSpeech = 'searching-natural-voice';
    const voice = await waitForVoice(1900);
    voiceButton.disabled = false;

    if (!voice) {
      disable(false);
      showMessage(copy().unavailable);
      ROOT.dataset.fxOrganismSpeech = 'natural-voice-unavailable';
      return;
    }

    active = true;
    syncControls();
    speak(currentText || document.querySelector('.fx-organism-thought-output')?.textContent || '');
  }

  function interceptClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('.fx-organism-voice-toggle')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (active) disable(false);
      else void enable();
      return;
    }

    if (target.closest('.fx-organism-repeat')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (active) speak(currentText);
      return;
    }

    if (target.closest('.fx-organism-master-toggle')) {
      window.setTimeout(() => {
        const master = document.querySelector('.fx-organism-master-toggle');
        if (master?.getAttribute('aria-pressed') === 'false') disable(false);
        else syncControls();
      }, 0);
    }
  }

  function initialise() {
    if (!speechSupported) {
      ROOT.dataset.fxOrganismNaturalVoiceGuard = 'unsupported';
      return;
    }

    document.addEventListener('click', interceptClick, true);
    addEventListener('formatx:organismresponse', event => {
      currentText = String(event.detail?.text || '').trim();
      if (active && currentText) speak(currentText);
    });
    addEventListener('formatx:languagechange', () => {
      disable(false);
      failedVoices.clear();
      selectedVoice = null;
      window.setTimeout(syncControls, 0);
    });
    addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
    });

    speechSynthesis.addEventListener?.('voiceschanged', () => {
      selectedVoice = null;
      selectVoice();
      syncControls();
    });

    if (!findControls()) {
      const observer = new MutationObserver(() => {
        if (findControls()) {
          observer.disconnect();
          selectVoice();
          syncControls();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.setTimeout(() => {
        observer.disconnect();
        findControls();
        selectVoice();
        syncControls();
      }, 8000);
    } else {
      selectVoice();
      syncControls();
    }

    window.FormatXNaturalVoice = Object.freeze({
      enable,
      disable() { disable(false); },
      speak,
      voiceInfo() {
        return Object.freeze({
          active,
          name: selectedVoice?.name || 'natural-voice-unavailable',
          language: selectedVoice?.lang || locale(),
          quality: selectedVoice ? quality(selectedVoice) : 'unavailable',
          service: selectedVoice?.localService === false ? 'browser-online' : selectedVoice ? 'device-enhanced' : 'legacy-blocked',
          candidates: candidates().map(item => item.voice.name)
        });
      }
    });

    ROOT.dataset.fxOrganismNaturalVoiceGuard = 'ready-v1';
    ROOT.dataset.fxOrganismNaturalVoiceEnabled = 'false';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
