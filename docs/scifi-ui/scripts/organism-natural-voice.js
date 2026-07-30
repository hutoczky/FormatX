(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismNaturalVoiceGuard === 'ready-v2') return;
  ROOT.dataset.fxOrganismNaturalVoiceGuard = 'loading-v2';

  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const synth = supported ? window.speechSynthesis : null;
  const COPY = {
    hu: {
      on: '🔊 Hang be',
      off: '🔇 Hang ki',
      enable: 'Organizmus hangjának bekapcsolása',
      disable: 'Organizmus hangjának kikapcsolása',
      ready: 'A FormatX hangja bekapcsolva.',
      starting: 'Hang indítása…',
      working: 'Hang működik',
      unavailable: 'A hang nem indult el. Ellenőrizd a médiahangot és az Android szövegfelolvasó szolgáltatását, majd nyomd meg újra a Hang be gombot.',
      unsupported: 'Ez a böngésző nem támogatja a gépi beszédet.'
    },
    en: {
      on: '🔊 Voice on',
      off: '🔇 Voice off',
      enable: 'Enable the Organism voice',
      disable: 'Disable the Organism voice',
      ready: 'The FormatX voice is enabled.',
      starting: 'Starting voice…',
      working: 'Voice is working',
      unavailable: 'Speech did not start. Check media volume and the Android text-to-speech service, then press Voice on again.',
      unsupported: 'Speech synthesis is not supported by this browser.'
    }
  };

  let active = false;
  let currentText = '';
  let selectedVoice = null;
  let runId = 0;
  let watchdog = 0;
  let pauseTimer = 0;
  let voiceButton = null;
  let repeatButton = null;
  let privacyNote = null;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function locale() {
    return language() === 'en' ? 'en-GB' : 'hu-HU';
  }

  function copy() {
    return COPY[language()];
  }

  function findControls() {
    voiceButton = document.querySelector('.fx-organism-voice-toggle');
    repeatButton = document.querySelector('.fx-organism-repeat');
    privacyNote = document.querySelector('.fx-organism-privacy');
    const output = document.querySelector('.fx-organism-thought-output');
    if (output?.textContent?.trim()) currentText = output.textContent.trim();
    return voiceButton instanceof HTMLButtonElement;
  }

  function voiceScore(voice) {
    const expected = locale().toLowerCase();
    const lang = String(voice?.lang || '').toLowerCase();
    const descriptor = `${voice?.name || ''} ${voice?.voiceURI || ''}`.toLowerCase();
    let score = 0;
    if (lang === expected) score += 1000;
    else if (lang.startsWith(expected.slice(0, 2))) score += 700;
    else if (voice?.default) score += 80;
    else score -= 500;
    if (/natural|neural|premium|enhanced|studio|expressive|wavenet/.test(descriptor)) score += 500;
    if (/google|samsung|microsoft|apple|siri/.test(descriptor)) score += 220;
    if (/online/.test(descriptor)) score += 80;
    if (voice?.localService) score += 60;
    if (voice?.default) score += 40;
    return score;
  }

  function chooseVoice() {
    if (!supported) return null;
    const voices = synth.getVoices();
    selectedVoice = voices
      .map(voice => ({ voice, score: voiceScore(voice) }))
      .sort((a, b) => b.score - a.score)[0]?.voice || null;
    ROOT.dataset.fxOrganismVoiceName = selectedVoice?.name || 'browser-default';
    ROOT.dataset.fxOrganismVoiceLanguage = selectedVoice?.lang || locale();
    ROOT.dataset.fxOrganismVoiceService = selectedVoice?.localService === false ? 'browser-online' : 'device-or-browser';
    return selectedVoice;
  }

  function setStatus(text, state) {
    ROOT.dataset.fxOrganismSpeech = state || 'idle';
    if (privacyNote) privacyNote.textContent = text;
  }

  function syncControls() {
    if (!findControls()) return;
    const words = copy();
    voiceButton.disabled = !supported;
    voiceButton.textContent = active ? words.on : words.off;
    voiceButton.setAttribute('aria-pressed', String(active));
    voiceButton.setAttribute('aria-label', active ? words.disable : words.enable);
    voiceButton.title = active ? words.disable : words.enable;
    voiceButton.dataset.fxAdaptiveVoiceOwner = 'true';
    if (repeatButton instanceof HTMLButtonElement) {
      repeatButton.disabled = !supported || !active;
      repeatButton.dataset.fxAdaptiveVoiceOwner = 'true';
    }
    ROOT.dataset.fxOrganismNaturalVoiceEnabled = String(active);
    ROOT.dataset.fxOrganismVoiceEnabled = String(active);
    if (!supported) setStatus(words.unsupported, 'unsupported');
  }

  function cleanSpeechText(value) {
    let text = String(value || '').replace(/\s+/g, ' ').trim().replace(/FormatX/g, 'Format X');
    if (language() === 'hu') {
      return text
        .replace(/SHA-256/gi, 'SHA kettő öt hat')
        .replace(/Ed25519/gi, 'Ed kettő öt öt egy kilenc')
        .replace(/\bHUF\b/g, 'forint')
        .replace(/\bEUR\b/g, 'euró')
        .replace(/\bQR\b/g, 'kú er')
        .replace(/\bAPK\b/g, 'á pé ká')
        .replace(/\bAI\b/g, 'mesterséges intelligencia');
    }
    return text
      .replace(/SHA-256/gi, 'S H A two fifty six')
      .replace(/Ed25519/gi, 'Ed two five five one nine')
      .replace(/\bHUF\b/g, 'H U F')
      .replace(/\bEUR\b/g, 'euros')
      .replace(/\bQR\b/g, 'Q R')
      .replace(/\bAPK\b/g, 'A P K')
      .replace(/\bAI\b/g, 'A I');
  }

  function splitText(value) {
    const text = cleanSpeechText(value);
    const sentences = text.match(/[^.!?;:]+[.!?;:]?|[^.!?;:]+$/g) || [text];
    return sentences.map(item => item.trim()).filter(Boolean);
  }

  function clearTimers() {
    clearTimeout(watchdog);
    clearTimeout(pauseTimer);
    watchdog = 0;
    pauseTimer = 0;
  }

  function stop() {
    runId += 1;
    clearTimers();
    try { synth?.cancel(); } catch (_) {}
    document.querySelector('.fx-organism-dialogue')?.classList.remove('is-speaking');
    if (active) setStatus(copy().working, 'idle');
    else ROOT.dataset.fxOrganismSpeech = 'idle';
  }

  function makeUtterance(text, useSelectedVoice) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale();
    utterance.rate = language() === 'en' ? 0.96 : 0.92;
    utterance.pitch = language() === 'en' ? 1.0 : 0.98;
    utterance.volume = 1;
    if (useSelectedVoice && selectedVoice) utterance.voice = selectedVoice;
    return utterance;
  }

  function speak(value, options) {
    if (!active || !supported) return;
    const text = String(value || '').trim();
    if (!text) return;
    currentText = text;
    clearTimers();
    const run = ++runId;
    const parts = splitText(text);
    chooseVoice();
    let startedAny = false;

    const begin = (index, fallback) => {
      if (run !== runId || !active) return;
      if (index >= parts.length) {
        document.querySelector('.fx-organism-dialogue')?.classList.remove('is-speaking');
        setStatus(`${copy().working}${selectedVoice ? ' · ' + selectedVoice.name : ''}`, 'idle');
        return;
      }

      const utterance = makeUtterance(parts[index], !fallback);
      let started = false;
      watchdog = window.setTimeout(() => {
        if (run !== runId || started) return;
        if (!fallback) {
          try { synth.cancel(); } catch (_) {}
          selectedVoice = null;
          window.setTimeout(() => begin(index, true), 90);
        } else {
          document.querySelector('.fx-organism-dialogue')?.classList.remove('is-speaking');
          setStatus(copy().unavailable, 'error');
        }
      }, 1800);

      utterance.addEventListener('start', () => {
        if (run !== runId) return;
        started = true;
        startedAny = true;
        clearTimeout(watchdog);
        document.querySelector('.fx-organism-dialogue')?.classList.add('is-speaking');
        setStatus(`${copy().working}${utterance.voice?.name ? ' · ' + utterance.voice.name : ''}`, 'speaking');
      }, { once: true });

      utterance.addEventListener('end', () => {
        if (run !== runId) return;
        clearTimeout(watchdog);
        pauseTimer = window.setTimeout(() => begin(index + 1, false), 90);
      }, { once: true });

      utterance.addEventListener('error', event => {
        if (run !== runId) return;
        clearTimeout(watchdog);
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        if (!fallback) {
          selectedVoice = null;
          window.setTimeout(() => begin(index, true), 90);
        } else {
          document.querySelector('.fx-organism-dialogue')?.classList.remove('is-speaking');
          setStatus(copy().unavailable, 'error');
        }
      }, { once: true });

      try {
        synth.resume();
        synth.speak(utterance);
      } catch (_) {
        if (!fallback) window.setTimeout(() => begin(index, true), 90);
        else setStatus(copy().unavailable, 'error');
      }
    };

    const startNow = () => begin(0, false);
    if (synth.speaking || synth.pending) {
      try { synth.cancel(); } catch (_) {}
      window.setTimeout(startNow, 80);
    } else {
      startNow();
    }

    if (options?.test && !startedAny) setStatus(copy().starting, 'starting');
  }

  function enable() {
    if (!supported) {
      setStatus(copy().unsupported, 'unsupported');
      syncControls();
      return;
    }
    active = true;
    chooseVoice();
    syncControls();
    setStatus(copy().starting, 'starting');
    speak(copy().ready, { test: true });
  }

  function disable() {
    active = false;
    stop();
    syncControls();
    setStatus(language() === 'en' ? 'Voice is off' : 'A hang ki van kapcsolva', 'idle');
  }

  function interceptClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('.fx-organism-voice-toggle')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (active) disable();
      else enable();
      return;
    }
    if (target.closest('.fx-organism-repeat')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (active) speak(currentText || document.querySelector('.fx-organism-thought-output')?.textContent || '');
      return;
    }
    if (target.closest('.fx-organism-master-toggle')) {
      window.setTimeout(() => {
        const master = document.querySelector('.fx-organism-master-toggle');
        if (master?.getAttribute('aria-pressed') === 'false') disable();
        else syncControls();
      }, 0);
    }
  }

  function initialise() {
    document.addEventListener('click', interceptClick, true);
    addEventListener('formatx:organismresponse', event => {
      currentText = String(event.detail?.text || '').trim();
      if (active && currentText) speak(currentText);
    });
    addEventListener('formatx:languagechange', () => {
      if (active) stop();
      selectedVoice = null;
      window.setTimeout(syncControls, 0);
    });
    addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
    });
    document.addEventListener('pointerdown', () => {
      try { synth?.resume(); } catch (_) {}
    }, { capture: true, passive: true });

    synth?.addEventListener?.('voiceschanged', () => {
      selectedVoice = null;
      chooseVoice();
      syncControls();
    });

    if (!findControls()) {
      const observer = new MutationObserver(() => {
        if (!findControls()) return;
        observer.disconnect();
        chooseVoice();
        syncControls();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.setTimeout(() => {
        observer.disconnect();
        findControls();
        chooseVoice();
        syncControls();
      }, 8000);
    } else {
      chooseVoice();
      syncControls();
    }

    window.FormatXNaturalVoice = Object.freeze({
      enable,
      disable,
      speak,
      voiceInfo() {
        return Object.freeze({
          active,
          supported,
          name: selectedVoice?.name || 'browser-default',
          language: selectedVoice?.lang || locale(),
          service: selectedVoice?.localService === false ? 'browser-online' : 'device-or-browser'
        });
      }
    });

    ROOT.dataset.fxOrganismNaturalVoiceGuard = 'ready-v2';
    ROOT.dataset.fxOrganismNaturalVoiceEnabled = 'false';
    ROOT.dataset.fxOrganismSpeechCompatibility = 'adaptive-v2';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());