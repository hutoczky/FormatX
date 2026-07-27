(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioRepair === 'v3') return;
  root.dataset.fxAudioRepair = 'v3';

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const FALLBACK_AUDIO_URL = './assets/audio/formatx-audio-test.wav?v=20260727-audio-v3';

  async function runOfflineSelfTest() {
    if (!OfflineAudioContextClass) {
      root.dataset.fxAudioSelfTest = 'unsupported';
      return;
    }

    try {
      const offline = new OfflineAudioContextClass(1, 4096, 44100);
      const oscillator = offline.createOscillator();
      const gain = offline.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.35;
      oscillator.connect(gain).connect(offline.destination);
      oscillator.start(0);
      oscillator.stop(0.075);
      const rendered = await offline.startRendering();
      const samples = rendered.getChannelData(0);
      let peak = 0;
      for (let index = 0; index < samples.length; index += 1) {
        peak = Math.max(peak, Math.abs(samples[index]));
      }
      root.dataset.fxAudioSelfTest = peak > 0.1 ? 'passed' : 'failed';
      root.style.setProperty('--fx-audio-self-test-peak', peak.toFixed(3));
    } catch (error) {
      root.dataset.fxAudioSelfTest = 'error';
      root.dataset.fxAudioError = String(error && error.message ? error.message : error).slice(0, 160);
    }
  }

  function install(sourceButton) {
    if (!(sourceButton instanceof HTMLButtonElement)) return;

    // Replace the original node so every legacy click listener attached by the
    // old audio implementations is removed before the new owner is installed.
    const button = sourceButton.cloneNode(true);
    sourceButton.replaceWith(button);
    button.dataset.fxAudioOwner = 'verified-v3';
    root.dataset.fxAudioOwner = 'verified-v3';
    root.dataset.fxAudioEngine = 'web-audio-with-wav-fallback';

    let context = null;
    let output = null;
    let ambientGain = null;
    let effectsGain = null;
    let analyser = null;
    let hum = null;
    let harmonic = null;
    let filter = null;
    let enabled = false;
    let operation = 0;
    let lastScene = -1;
    let fallbackAudio = null;
    let signalCheckTimer = 0;

    const language = () => root.lang === 'en' ? 'en' : 'hu';

    function sync(state) {
      const on = state === 'on';
      const pending = state === 'pending';
      const blocked = state === 'blocked';
      button.setAttribute('aria-pressed', String(on));
      button.dataset.fxAudioState = state;
      root.dataset.fxAudioState = state;
      const label = button.querySelector('span');
      if (label) {
        if (pending) label.textContent = language() === 'en' ? 'STARTING…' : 'INDÍTÁS…';
        else if (blocked) label.textContent = language() === 'en' ? 'TAP AGAIN' : 'KOPPINTS ÚJRA';
        else if (on) label.textContent = language() === 'en' ? 'SOUND ON' : 'HANG BE';
        else label.textContent = language() === 'en' ? 'SOUND OFF' : 'HANG KI';
      }
      button.setAttribute('aria-label', pending
        ? (language() === 'en' ? 'Starting sound design' : 'Hangdizájn indítása')
        : on
          ? (language() === 'en' ? 'Disable sound design' : 'Hangdizájn kikapcsolása')
          : (language() === 'en' ? 'Enable sound design' : 'Hangdizájn bekapcsolása'));
      root.dataset.fxAudioLevel = pending ? 'starting' : on ? 'audible' : blocked ? 'blocked' : 'off';
    }

    function build() {
      if (context) return true;
      if (!AudioContextClass) {
        root.dataset.fxAudioContext = 'unsupported';
        return false;
      }

      try {
        // Context creation happens only from a real user gesture through
        // ensureRunning(), which is required by Chromium and mobile browsers.
        context = new AudioContextClass({ latencyHint: 'interactive' });

        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 14;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.18;
        compressor.connect(context.destination);

        analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0;
        analyser.connect(compressor);

        output = context.createGain();
        output.gain.value = 0.82;
        output.connect(analyser);

        ambientGain = context.createGain();
        ambientGain.gain.value = 0.0001;
        ambientGain.connect(output);

        effectsGain = context.createGain();
        effectsGain.gain.value = 0.95;
        effectsGain.connect(output);

        // Mid-range frequencies remain audible on phone and laptop speakers.
        hum = context.createOscillator();
        hum.type = 'sine';
        hum.frequency.value = 174.61;
        const humGain = context.createGain();
        humGain.gain.value = 0.22;
        hum.connect(humGain).connect(ambientGain);
        hum.start();

        harmonic = context.createOscillator();
        harmonic.type = 'triangle';
        harmonic.frequency.value = 261.63;
        const harmonicGain = context.createGain();
        harmonicGain.gain.value = 0.085;
        harmonic.connect(harmonicGain).connect(ambientGain);
        harmonic.start();

        const noise = context.createBufferSource();
        const noiseGain = context.createGain();
        const noiseBuffer = context.createBuffer(1, Math.round(context.sampleRate), context.sampleRate);
        const samples = noiseBuffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < samples.length; index += 1) {
          previous = previous * 0.965 + (Math.random() * 2 - 1) * 0.035;
          samples[index] = previous * 0.35;
        }
        noise.buffer = noiseBuffer;
        noise.loop = true;
        filter = context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 620;
        filter.Q.value = 0.72;
        noiseGain.gain.value = 0.045;
        noise.connect(filter).connect(noiseGain).connect(ambientGain);
        noise.start();

        context.addEventListener('statechange', () => {
          root.dataset.fxAudioContext = context ? context.state : 'closed';
        });
        root.dataset.fxAudioContext = context.state;
        return true;
      } catch (error) {
        root.dataset.fxAudioContext = 'error';
        root.dataset.fxAudioError = String(error && error.message ? error.message : error).slice(0, 160);
        return false;
      }
    }

    async function ensureRunning() {
      if (!build() || !context) return false;
      for (let attempt = 0; attempt < 3 && context.state !== 'running'; attempt += 1) {
        try { await context.resume(); } catch (error) {
          root.dataset.fxAudioError = String(error && error.message ? error.message : error).slice(0, 160);
        }
        if (context.state !== 'running') {
          await new Promise(resolve => setTimeout(resolve, 35));
        }
      }
      root.dataset.fxAudioContext = context.state;
      return context.state === 'running';
    }

    function verifyLiveSignal() {
      clearTimeout(signalCheckTimer);
      signalCheckTimer = window.setTimeout(() => {
        if (!analyser || !enabled) return;
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let deviation = 0;
        for (let index = 0; index < data.length; index += 1) {
          deviation = Math.max(deviation, Math.abs(data[index] - 128));
        }
        root.dataset.fxAudioOutput = deviation >= 4 ? 'signal-verified' : 'no-signal';
        root.style.setProperty('--fx-audio-signal', String(deviation));
        if (deviation < 4) void playFallback();
      }, 55);
    }

    function tone(frequency, duration, volume, delay) {
      if (!enabled || !context || context.state !== 'running' || !effectsGain) return false;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + Math.max(0, delay || 0);
      oscillator.type = frequency > 900 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.82), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
      gain.gain.setValueAtTime(volume, Math.max(start + 0.012, start + duration - 0.055));
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(effectsGain);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        gain.disconnect();
      }, { once: true });
      return true;
    }

    async function playFallback() {
      try {
        if (!fallbackAudio) {
          fallbackAudio = new Audio(FALLBACK_AUDIO_URL);
          fallbackAudio.preload = 'auto';
          fallbackAudio.volume = 1;
          fallbackAudio.addEventListener('ended', () => {
            root.dataset.fxAudioFallback = 'ended';
          });
        }
        fallbackAudio.currentTime = 0;
        await fallbackAudio.play();
        root.dataset.fxAudioFallback = 'playing';
        root.dataset.fxAudioOutput = 'wav-fallback';
        return true;
      } catch (error) {
        root.dataset.fxAudioFallback = 'blocked';
        root.dataset.fxAudioError = String(error && error.message ? error.message : error).slice(0, 160);
        return false;
      }
    }

    function playConfirmation() {
      const first = tone(740, 0.22, 0.28, 0);
      const second = tone(1110, 0.24, 0.22, 0.13);
      if (first || second) verifyLiveSignal();
      else void playFallback();
    }

    async function setEnabled(next) {
      const token = ++operation;
      if (!next) {
        enabled = false;
        sync('off');
        clearTimeout(signalCheckTimer);
        if (fallbackAudio) fallbackAudio.pause();
        if (!context || !ambientGain) return;
        const now = context.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.setValueAtTime(Math.max(0.0001, ambientGain.gain.value), now);
        ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        return;
      }

      sync('pending');
      const running = await ensureRunning();
      if (token !== operation) return;

      if (!running || !context || !ambientGain) {
        const fallbackWorked = await playFallback();
        enabled = fallbackWorked;
        sync(fallbackWorked ? 'on' : 'blocked');
        return;
      }

      enabled = true;
      const now = context.currentTime;
      ambientGain.gain.cancelScheduledValues(now);
      ambientGain.gain.setValueAtTime(Math.max(0.0001, ambientGain.gain.value), now);
      ambientGain.gain.exponentialRampToValueAtTime(0.16, now + 0.22);
      sync('on');
      playConfirmation();
    }

    function sceneCue() {
      if (!enabled || !context || context.state !== 'running') return;
      const scene = Math.max(0, Math.min(5, Math.round(Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0))));
      if (scene === lastScene) return;
      lastScene = scene;
      const now = context.currentTime;
      hum.frequency.setTargetAtTime(174.61 + scene * 9, now, 0.16);
      harmonic.frequency.setTargetAtTime(261.63 + scene * 15, now, 0.18);
      filter.frequency.setTargetAtTime(520 + scene * 105, now, 0.14);
      tone([440, 523.25, 659.25, 392, 587.33, 783.99][scene], 0.17, 0.12, 0);
    }

    sync('off');

    // Unlock as early as possible during the trusted pointer gesture.
    button.addEventListener('pointerdown', () => { void ensureRunning(); }, { passive: true });

    // Capture on document before later legacy handlers can receive the click.
    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target.closest('.fx-three-sound') : null;
      if (target !== button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void setEnabled(!enabled);
    }, true);

    document.addEventListener('pointerdown', event => {
      if (!enabled) return;
      if (context && context.state !== 'running') void ensureRunning();
      const target = event.target instanceof Element ? event.target.closest('a,button,.card,.price-card,.fx-plan-qr-card') : null;
      if (!target || target === button || target.closest('.fx-three-sound')) return;
      tone(target.closest('.button,.header-buy,.fx-plan-qr-link') ? 980 : 660, 0.1, 0.075, 0);
    }, true);

    const sceneObserver = new MutationObserver(sceneCue);
    sceneObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three-scene', 'data-fx-scene'] });
    addEventListener('formatx:languagechange', () => sync(enabled ? 'on' : 'off'));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && enabled && context && context.state !== 'running') void ensureRunning();
    });
    addEventListener('pagehide', () => {
      sceneObserver.disconnect();
      clearTimeout(signalCheckTimer);
      if (fallbackAudio) fallbackAudio.pause();
      if (context) void context.close();
    }, { once: true });
  }

  void runOfflineSelfTest();

  const existing = document.querySelector('.fx-three-sound');
  if (existing) install(existing);
  else {
    const observer = new MutationObserver(() => {
      const button = document.querySelector('.fx-three-sound');
      if (!button) return;
      observer.disconnect();
      install(button);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}());
