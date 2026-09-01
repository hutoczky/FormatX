(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioRepair === 'v6') return;
  root.dataset.fxAudioRepair = 'v6';

  const Context = window.AudioContext || window.webkitAudioContext;
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const fallbackUrl = './assets/audio/formatx-audio-test.wav?v=20260728-professional-score-v6';
  const BPM = 72;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const CHORD_SECONDS = BAR * 2;
  const CHORDS = [
    { name: 'D MINOR 9', notes: [146.83, 174.61, 220, 329.63] },
    { name: 'B FLAT MAJOR 9', notes: [116.54, 146.83, 174.61, 261.63] },
    { name: 'F MAJOR 9', notes: [130.81, 174.61, 220, 329.63] },
    { name: 'C ADD 9', notes: [130.81, 164.81, 196, 293.66] },
    { name: 'G MINOR 9', notes: [146.83, 174.61, 233.08, 293.66] },
    { name: 'B FLAT MAJOR 7', notes: [116.54, 146.83, 174.61, 293.66] },
    { name: 'F MAJOR 9 OVER A', notes: [130.81, 174.61, 220, 261.63] },
    { name: 'A SUSPENDED ADD 9', notes: [146.83, 164.81, 220, 329.63] }
  ];

  async function selfTest() {
    if (!OfflineContext) {
      root.dataset.fxAudioSelfTest = 'unsupported';
      return;
    }
    try {
      const offline = new OfflineContext(1, 12288, 44100);
      const wave = offline.createPeriodicWave(
        new Float32Array([0, 0, 0, 0, 0, 0]),
        new Float32Array([0, 1, 0.38, 0.17, 0.08, 0.035]),
        { disableNormalization: false }
      );
      [146.83, 174.61, 220, 329.63].forEach((frequency, index) => {
        const oscillator = offline.createOscillator();
        const gain = offline.createGain();
        oscillator.setPeriodicWave(wave);
        oscillator.frequency.value = frequency;
        oscillator.detune.value = index % 2 ? 4 : -5;
        gain.gain.value = 0.025;
        oscillator.connect(gain).connect(offline.destination);
        oscillator.start(0);
        oscillator.stop(0.22);
      });
      const rendered = await offline.startRendering();
      let peak = 0;
      for (const sample of rendered.getChannelData(0)) peak = Math.max(peak, Math.abs(sample));
      root.dataset.fxAudioSelfTest = peak > 0.04 ? 'passed' : 'failed';
      root.style.setProperty('--fx-audio-self-test-peak', peak.toFixed(3));
    } catch (error) {
      root.dataset.fxAudioSelfTest = 'error';
      root.dataset.fxAudioError = String(error?.message || error).slice(0, 160);
    }
  }

  function install(original) {
    if (!(original instanceof HTMLButtonElement)) return;

    const button = original.cloneNode(true);
    original.replaceWith(button);
    button.dataset.fxAudioOwner = 'professional-v6';
    root.dataset.fxAudioOwner = 'professional-v6';
    root.dataset.fxAudioEngine = 'professional-cinematic-score-v6';
    root.dataset.fxAudioCharacter = 'premium-cinematic-music';
    root.dataset.fxAudioArrangement = 'sixteen-bar-evolving-score';
    root.dataset.fxAudioTempo = String(BPM);
    root.dataset.fxAudioMusic = 'ready';

    let ctx = null;
    let master = null;
    let analyser = null;
    let scoreBus = null;
    let scoreFilter = null;
    let reverb = null;
    let delay = null;
    let delayFeedback = null;
    let warmWave = null;
    let schedulerTimer = 0;
    let signalTimer = 0;
    let chordIndex = 0;
    let nextChordTime = 0;
    let enabled = false;
    let operation = 0;
    let fallback = null;
    const activeSources = new Set();

    const language = () => root.lang === 'en' ? 'en' : 'hu';

    function sync(state) {
      const on = state === 'on';
      const pending = state === 'pending';
      const blocked = state === 'blocked';
      button.setAttribute('aria-pressed', String(on));
      button.dataset.fxAudioState = state;
      root.dataset.fxAudioState = state;
      const label = button.querySelector('span');
      if (label) label.textContent = pending
        ? (language() === 'en' ? 'STARTING…' : 'INDÍTÁS…')
        : blocked
          ? (language() === 'en' ? 'TAP AGAIN' : 'KOPPINTS ÚJRA')
          : on
            ? (language() === 'en' ? 'MUSIC ON' : 'ZENE BE')
            : (language() === 'en' ? 'MUSIC OFF' : 'ZENE KI');
      button.setAttribute('aria-label', on
        ? (language() === 'en' ? 'Disable the cinematic score' : 'Filmes zene kikapcsolása')
        : (language() === 'en' ? 'Enable the cinematic score' : 'Filmes zene bekapcsolása'));
      root.dataset.fxAudioLevel = pending ? 'starting' : on ? 'audible' : blocked ? 'blocked' : 'off';
    }

    function impulse(seconds, decay) {
      const length = Math.round(ctx.sampleRate * seconds);
      const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = buffer.getChannelData(channel);
        for (let index = 0; index < length; index += 1) {
          const envelope = Math.pow(1 - index / length, decay);
          data[index] = (Math.random() * 2 - 1) * envelope;
        }
      }
      return buffer;
    }

    function saturationCurve(amount) {
      const curve = new Float32Array(4096);
      for (let index = 0; index < curve.length; index += 1) {
        const x = index * 2 / (curve.length - 1) - 1;
        curve[index] = Math.tanh(x * amount) / Math.tanh(amount);
      }
      return curve;
    }

    function build() {
      if (ctx && master && scoreBus) return true;
      if (!Context) return false;
      try {
        const handoff = window.FormatXProfessionalAudioHandoffR508;
        const shared = handoff?.context && handoff.context.state !== 'closed' ? handoff.context : null;
        ctx = shared || new Context({ latencyHint: 'interactive' });
        root.dataset.fxAudioContextHandoff = shared ? 'reused-r508-first-gesture' : 'native-v6-fallback';

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -22;
        compressor.knee.value = 24;
        compressor.ratio.value = 2.6;
        compressor.attack.value = 0.018;
        compressor.release.value = 0.42;
        compressor.connect(ctx.destination);

        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.12;
        analyser.connect(compressor);

        master = ctx.createGain();
        master.gain.value = 0.86;
        master.connect(analyser);

        const saturator = ctx.createWaveShaper();
        saturator.curve = saturationCurve(1.45);
        saturator.oversample = '2x';
        saturator.connect(master);

        scoreBus = ctx.createGain();
        scoreBus.gain.value = 0.0001;
        scoreFilter = ctx.createBiquadFilter();
        scoreFilter.type = 'lowpass';
        scoreFilter.frequency.value = 3150;
        scoreFilter.Q.value = 0.32;
        scoreBus.connect(scoreFilter);

        const dry = ctx.createGain();
        dry.gain.value = 0.76;
        scoreFilter.connect(dry).connect(saturator);

        reverb = ctx.createConvolver();
        reverb.buffer = impulse(2.8, 2.25);
        const wet = ctx.createGain();
        wet.gain.value = 0.28;
        scoreFilter.connect(wet).connect(reverb).connect(saturator);

        delay = ctx.createDelay(2);
        delay.delayTime.value = BEAT * 0.75;
        delayFeedback = ctx.createGain();
        delayFeedback.gain.value = 0.18;
        const delayReturn = ctx.createGain();
        delayReturn.gain.value = 0.11;
        scoreFilter.connect(delay);
        delay.connect(delayFeedback).connect(delay);
        delay.connect(delayReturn).connect(saturator);

        warmWave = ctx.createPeriodicWave(
          new Float32Array([0, 0, 0, 0, 0, 0, 0]),
          new Float32Array([0, 1, 0.40, 0.18, 0.08, 0.038, 0.016]),
          { disableNormalization: false }
        );

        root.dataset.fxAudioContext = ctx.state;
        ctx.addEventListener('statechange', () => {
          root.dataset.fxAudioContext = ctx?.state || 'closed';
        });
        return true;
      } catch (error) {
        root.dataset.fxAudioContext = 'error';
        root.dataset.fxAudioError = String(error?.message || error).slice(0, 160);
        return false;
      }
    }

    async function ensureRunning() {
      if (!build() || !ctx) return false;
      for (let attempt = 0; attempt < 3 && ctx.state !== 'running'; attempt += 1) {
        try { await ctx.resume(); } catch (_) {}
        if (ctx.state !== 'running') await new Promise(resolve => setTimeout(resolve, 35));
      }
      root.dataset.fxAudioContext = ctx.state;
      return ctx.state === 'running';
    }

    function panned(node, pan) {
      if (typeof ctx.createStereoPanner !== 'function') return node;
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(panner);
      return panner;
    }

    function track(source, cleanup) {
      activeSources.add(source);
      source.addEventListener('ended', () => {
        activeSources.delete(source);
        try { source.disconnect(); } catch (_) {}
        cleanup?.();
      }, { once: true });
    }

    function scheduleNote(frequency, start, duration, volume, pan, detune) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const finish = start + duration;
      oscillator.setPeriodicWave(warmWave);
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      filter.type = 'lowpass';
      filter.frequency.value = Math.min(3600, frequency * 9);
      filter.Q.value = 0.35;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.45);
      gain.gain.setValueAtTime(volume, Math.max(start + 0.5, finish - 1.2));
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      oscillator.connect(filter).connect(gain);
      const output = panned(gain, pan);
      output.connect(scoreBus);
      oscillator.start(start);
      oscillator.stop(finish + 0.03);
      track(oscillator, () => {
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
        if (output !== gain) try { output.disconnect(); } catch (_) {}
      });
    }

    function scheduleChord(start, chord, index) {
      const duration = CHORD_SECONDS + 1.6;
      chord.notes.forEach((frequency, noteIndex) => {
        const pan = chord.notes.length > 1 ? noteIndex / (chord.notes.length - 1) * 1.2 - 0.6 : 0;
        scheduleNote(frequency, start, duration, noteIndex < 2 ? 0.034 : 0.024, pan, noteIndex % 2 ? 4 : -5);
      });
      const bass = chord.notes[0] * 0.5;
      scheduleNote(bass, start + 0.02, Math.min(3.1, duration), 0.042, 0, -3);
      root.dataset.fxAudioChord = chord.name;
      root.dataset.fxAudioSection = String(index + 1).padStart(2, '0') + ' / ' + String(CHORDS.length).padStart(2, '0');
    }

    function scheduleMusic() {
      if (!enabled || ctx?.state !== 'running') return;
      const horizon = ctx.currentTime + CHORD_SECONDS * 2.2;
      while (nextChordTime < horizon) {
        const chord = CHORDS[chordIndex];
        scheduleChord(nextChordTime, chord, chordIndex);
        nextChordTime += CHORD_SECONDS;
        chordIndex = (chordIndex + 1) % CHORDS.length;
      }
    }

    function stopScore() {
      clearInterval(schedulerTimer);
      schedulerTimer = 0;
      for (const source of activeSources) {
        try { source.stop(); } catch (_) {}
      }
      activeSources.clear();
      root.dataset.fxAudioChord = '';
      root.dataset.fxAudioSection = '';
      nextChordTime = 0;
    }

    function startScore() {
      stopScore();
      chordIndex = 0;
      nextChordTime = ctx.currentTime + 0.04;
      scheduleMusic();
      schedulerTimer = window.setInterval(scheduleMusic, 900);
      root.dataset.fxAudioMusic = 'playing';
    }

    function verifySignal() {
      clearTimeout(signalTimer);
      signalTimer = window.setTimeout(() => {
        if (!enabled || !analyser) return;
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let deviation = 0;
        for (const value of data) deviation = Math.max(deviation, Math.abs(value - 128));
        root.style.setProperty('--fx-audio-signal', String(deviation));
        if (deviation >= 1) {
          root.dataset.fxAudioOutput = 'signal-verified';
          return;
        }
        void playFallback();
      }, 850);
    }

    async function playFallback() {
      try {
        fallback ||= new Audio(fallbackUrl);
        fallback.preload = 'auto';
        fallback.loop = true;
        fallback.volume = 0.58;
        fallback.currentTime = 0;
        await fallback.play();
        root.dataset.fxAudioFallback = 'playing';
        root.dataset.fxAudioOutput = 'wav-fallback';
        root.dataset.fxAudioMusic = 'fallback-playing';
        return true;
      } catch (_) {
        root.dataset.fxAudioFallback = 'blocked';
        root.dataset.fxAudioOutput = 'no-signal';
        return false;
      }
    }

    async function setEnabled(next) {
      const token = ++operation;
      if (!next) {
        enabled = false;
        sync('off');
        clearTimeout(signalTimer);
        stopScore();
        fallback?.pause();
        if (ctx && scoreBus) {
          const now = ctx.currentTime;
          scoreBus.gain.cancelScheduledValues(now);
          scoreBus.gain.setValueAtTime(Math.max(0.0001, scoreBus.gain.value), now);
          scoreBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        }
        root.dataset.fxAudioMusic = 'stopped';
        return;
      }

      sync('pending');
      const running = await ensureRunning();
      if (token !== operation) return;
      if (!running || !scoreBus) {
        const worked = await playFallback();
        enabled = worked;
        sync(worked ? 'on' : 'blocked');
        return;
      }

      enabled = true;
      startScore();
      const now = ctx.currentTime;
      scoreBus.gain.cancelScheduledValues(now);
      scoreBus.gain.setValueAtTime(0.0001, now);
      scoreBus.gain.exponentialRampToValueAtTime(0.34, now + 0.55);
      sync('on');
      verifySignal();
    }

    sync('off');
    button.addEventListener('pointerdown', () => { void ensureRunning(); }, { passive: true });
    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target.closest('.fx-three-sound') : null;
      if (target !== button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void setEnabled(!enabled);
    }, true);

    addEventListener('formatx:languagechange', () => sync(enabled ? 'on' : 'off'));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && enabled && ctx?.state !== 'running') void ensureRunning();
    });
    addEventListener('pagehide', () => {
      clearTimeout(signalTimer);
      stopScore();
      fallback?.pause();
      if (ctx && ctx.state !== 'closed') void ctx.close();
    }, { once: true });

    const handoff = window.FormatXProfessionalAudioHandoffR508;
    if (handoff?.enableOnInstall) {
      handoff.enableOnInstall = false;
      root.dataset.fxAudioHandoffR508 = 'professional-context-adopted';
      queueMicrotask(() => { void setEnabled(true); });
    }
  }

  void selfTest();
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
