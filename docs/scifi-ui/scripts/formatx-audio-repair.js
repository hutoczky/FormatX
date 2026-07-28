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
    { name: 'D MINOR 9', bass: 73.42, notes: [146.83, 174.61, 220, 261.63, 329.63], motif: [659.25, 523.25, 440] },
    { name: 'B FLAT MAJOR 9', bass: 58.27, notes: [116.54, 146.83, 174.61, 220, 261.63], motif: [587.33, 523.25, 440] },
    { name: 'F MAJOR 9', bass: 87.31, notes: [130.81, 174.61, 220, 261.63, 329.63], motif: [659.25, 523.25, 440] },
    { name: 'C ADD 9', bass: 65.41, notes: [130.81, 164.81, 196, 293.66, 329.63], motif: [587.33, 493.88, 392] },
    { name: 'G MINOR 9', bass: 98, notes: [146.83, 174.61, 233.08, 293.66, 440], motif: [698.46, 587.33, 523.25] },
    { name: 'B FLAT MAJOR 7', bass: 58.27, notes: [116.54, 146.83, 174.61, 220, 293.66], motif: [587.33, 440, 349.23] },
    { name: 'F MAJOR 9 OVER A', bass: 110, notes: [130.81, 174.61, 220, 261.63, 329.63], motif: [659.25, 587.33, 523.25] },
    { name: 'A SUSPENDED ADD 9', bass: 110, notes: [146.83, 164.81, 220, 246.94, 329.63], motif: [659.25, 493.88, 440] }
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

    let ctx;
    let master;
    let analyser;
    let scoreBus;
    let scoreFilter;
    let scoreWet;
    let fxBus;
    let reverb;
    let delay;
    let delayFeedback;
    let warmWave;
    let glassWave;
    let fallback;
    let enabled = false;
    let operation = 0;
    let schedulerTimer = 0;
    let signalTimer = 0;
    let nextChordTime = 0;
    let chordIndex = 0;
    let lastUi = 0;
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
          const earlyReflection = index < ctx.sampleRate * 0.09 ? 0.32 : 1;
          data[index] = (Math.random() * 2 - 1) * envelope * earlyReflection;
        }
      }
      return buffer;
    }

    function saturationCurve(amount) {
      const samples = 4096;
      const curve = new Float32Array(samples);
      for (let index = 0; index < samples; index += 1) {
        const x = index * 2 / (samples - 1) - 1;
        curve[index] = Math.tanh(x * amount) / Math.tanh(amount);
      }
      return curve;
    }

    function build() {
      if (ctx) return true;
      if (!Context) return false;
      try {
        ctx = new Context({ latencyHint: 'interactive' });

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

        const scoreDry = ctx.createGain();
        scoreDry.gain.value = 0.74;
        scoreFilter.connect(scoreDry).connect(saturator);

        reverb = ctx.createConvolver();
        reverb.buffer = impulse(3.2, 2.35);
        scoreWet = ctx.createGain();
        scoreWet.gain.value = 0.31;
        scoreFilter.connect(scoreWet).connect(reverb).connect(saturator);

        delay = ctx.createDelay(2);
        delay.delayTime.value = BEAT * 0.75;
        delayFeedback = ctx.createGain();
        delayFeedback.gain.value = 0.19;
        const delayReturn = ctx.createGain();
        delayReturn.gain.value = 0.12;
        scoreFilter.connect(delay);
        delay.connect(delayFeedback).connect(delay);
        delay.connect(delayReturn).connect(saturator);

        fxBus = ctx.createGain();
        fxBus.gain.value = 0.56;
        fxBus.connect(saturator);
        const fxWet = ctx.createGain();
        fxWet.gain.value = 0.34;
        fxBus.connect(fxWet).connect(reverb);

        warmWave = ctx.createPeriodicWave(
          new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
          new Float32Array([0, 1, 0.42, 0.19, 0.09, 0.048, 0.025, 0.012]),
          { disableNormalization: false }
        );
        glassWave = ctx.createPeriodicWave(
          new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
          new Float32Array([0, 1, 0.12, 0.27, 0.045, 0.11, 0.025, 0.055]),
          { disableNormalization: false }
        );

        const air = ctx.createBufferSource();
        const airBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const airData = airBuffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < airData.length; index += 1) {
          previous = previous * 0.996 + (Math.random() * 2 - 1) * 0.004;
          airData[index] = previous * 0.34;
        }
        air.buffer = airBuffer;
        air.loop = true;
        const airFilter = ctx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.value = 1320;
        airFilter.Q.value = 0.28;
        const airGain = ctx.createGain();
        airGain.gain.value = 0.032;
        air.connect(airFilter).connect(airGain).connect(scoreBus);
        air.start();

        const motion = ctx.createOscillator();
        const motionDepth = ctx.createGain();
        motion.frequency.value = 0.041;
        motionDepth.gain.value = 470;
        motion.connect(motionDepth).connect(scoreFilter.frequency);
        motion.start();

        ctx.addEventListener('statechange', () => {
          root.dataset.fxAudioContext = ctx?.state || 'closed';
        });
        root.dataset.fxAudioContext = ctx.state;
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
        try { await ctx.resume(); } catch (error) {
          root.dataset.fxAudioError = String(error?.message || error).slice(0, 160);
        }
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

    function schedulePadNote(frequency, start, duration, volume, pan, detune) {
      const oscillator = ctx.createOscillator();
      const companion = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const companionGain = ctx.createGain();
      const finish = start + duration;
      const release = finish - 2.5;

      oscillator.setPeriodicWave(warmWave);
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      companion.type = 'sine';
      companion.frequency.value = frequency * 0.5;
      companion.detune.value = -detune * 0.7;
      companionGain.gain.value = 0.2;

      filter.type = 'lowpass';
      filter.frequency.value = Math.min(3400, frequency * 8.2);
      filter.Q.value = 0.38;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 1.85);
      gain.gain.setValueAtTime(volume, release);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);

      oscillator.connect(filter);
      companion.connect(companionGain).connect(filter);
      filter.connect(gain);
      const output = panned(gain, pan);
      output.connect(scoreBus);

      oscillator.start(start);
      companion.start(start);
      oscillator.stop(finish + 0.05);
      companion.stop(finish + 0.05);
      track(oscillator, () => {
        try { companion.disconnect(); } catch (_) {}
        try { companionGain.disconnect(); } catch (_) {}
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
        if (output !== gain) try { output.disconnect(); } catch (_) {}
      });
      track(companion);
    }

    function scheduleBass(frequency, start, accent) {
      const oscillator = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const overtoneGain = ctx.createGain();
      const finish = start + BAR * 0.92;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.965, finish);
      overtone.type = 'triangle';
      overtone.frequency.value = frequency * 2;
      overtoneGain.gain.value = 0.13;
      filter.type = 'lowpass';
      filter.frequency.value = 270;
      filter.Q.value = 0.65;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.082 * accent, start + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);

      oscillator.connect(filter);
      overtone.connect(overtoneGain).connect(filter);
      filter.connect(gain).connect(scoreBus);
      oscillator.start(start);
      overtone.start(start);
      oscillator.stop(finish + 0.04);
      overtone.stop(finish + 0.04);
      track(oscillator, () => {
        try { overtone.disconnect(); } catch (_) {}
        try { overtoneGain.disconnect(); } catch (_) {}
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
      });
      track(overtone);
    }

    function schedulePulse(start, accent) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const finish = start + 0.72;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(92, start);
      oscillator.frequency.exponentialRampToValueAtTime(48, finish);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.048 * accent, start + 0.028);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      oscillator.connect(gain).connect(scoreBus);
      oscillator.start(start);
      oscillator.stop(finish + 0.03);
      track(oscillator, () => { try { gain.disconnect(); } catch (_) {} });
    }

    function scheduleMotif(frequency, start, pan, volume) {
      const oscillator = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const finish = start + 3.2;
      oscillator.setPeriodicWave(glassWave);
      oscillator.frequency.value = frequency;
      oscillator.detune.value = pan * 5;
      filter.type = 'lowpass';
      filter.frequency.value = 2200;
      filter.Q.value = 0.5;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      oscillator.connect(filter).connect(gain);
      const output = panned(gain, pan);
      const dry = ctx.createGain();
      const wet = ctx.createGain();
      dry.gain.value = 0.22;
      wet.gain.value = 0.88;
      output.connect(dry).connect(scoreBus);
      output.connect(wet).connect(reverb);
      oscillator.start(start);
      oscillator.stop(finish + 0.04);
      track(oscillator, () => {
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
        if (output !== gain) try { output.disconnect(); } catch (_) {}
        try { dry.disconnect(); } catch (_) {}
        try { wet.disconnect(); } catch (_) {}
      });
    }

    function scheduleChord(start, chord, index) {
      const duration = CHORD_SECONDS + 2.8;
      chord.notes.forEach((frequency, noteIndex) => {
        const pan = noteIndex / Math.max(1, chord.notes.length - 1) * 1.34 - 0.67;
        const volume = noteIndex < 2 ? 0.031 : 0.022;
        schedulePadNote(frequency, start, duration, volume, pan, noteIndex % 2 ? 5 : -6);
      });

      scheduleBass(chord.bass, start + 0.04, 1);
      scheduleBass(chord.bass * 1.5, start + BAR + 0.04, 0.55);
      schedulePulse(start + 0.02, 1);
      schedulePulse(start + BEAT * 2, 0.42);
      schedulePulse(start + BAR, 0.62);
      schedulePulse(start + BAR + BEAT * 2, 0.34);

      const motifStart = start + BAR + BEAT * 0.75;
      chord.motif.forEach((frequency, noteIndex) => {
        scheduleMotif(
          frequency,
          motifStart + noteIndex * BEAT * 0.72,
          noteIndex === 1 ? 0.28 : -0.3 + noteIndex * 0.16,
          noteIndex === 0 ? 0.013 : 0.009
        );
      });

      window.setTimeout(() => {
        if (enabled) root.dataset.fxAudioChord = chord.name;
      }, Math.max(0, (start - ctx.currentTime) * 1000));
      root.dataset.fxAudioSection = String(index + 1).padStart(2, '0') + ' / ' + String(CHORDS.length).padStart(2, '0');
    }

    function scheduleMusic() {
      if (!enabled || ctx?.state !== 'running') return;
      const horizon = ctx.currentTime + CHORD_SECONDS * 2.8;
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
      nextChordTime = 0;
      root.dataset.fxAudioChord = '';
      root.dataset.fxAudioSection = '';
    }

    function startScore() {
      stopScore();
      chordIndex = 0;
      nextChordTime = ctx.currentTime + 0.06;
      scheduleMusic();
      schedulerTimer = window.setInterval(scheduleMusic, 800);
      root.dataset.fxAudioMusic = 'playing';
    }

    function noiseSwell(duration, volume, frequency, end) {
      if (!enabled || ctx?.state !== 'running') return false;
      const source = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const start = ctx.currentTime;
      const finish = start + duration;
      filter.type = 'bandpass';
      filter.Q.value = 0.36;
      filter.frequency.setValueAtTime(frequency, start);
      filter.frequency.exponentialRampToValueAtTime(end, finish);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.12, duration * 0.2));
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      source.connect(filter).connect(gain).connect(fxBus);
      source.start(start);
      source.stop(finish + 0.03);
      source.addEventListener('ended', () => {
        try { source.disconnect(); } catch (_) {}
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
      }, { once: true });
      return true;
    }

    function verifySignal() {
      clearTimeout(signalTimer);
      signalTimer = window.setTimeout(() => {
        if (!enabled || !analyser) return;
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let deviation = 0;
        for (const value of data) deviation = Math.max(deviation, Math.abs(value - 128));
        root.dataset.fxAudioOutput = deviation >= 1 ? 'signal-verified' : 'no-signal';
        root.style.setProperty('--fx-audio-signal', String(deviation));
        if (deviation < 1) void playFallback();
      }, 950);
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
      } catch (error) {
        root.dataset.fxAudioFallback = 'blocked';
        root.dataset.fxAudioError = String(error?.message || error).slice(0, 160);
        return false;
      }
    }

    function activation() {
      noiseSwell(1.45, 0.032, 1900, 260);
      verifySignal();
    }

    function interfaceCue(primary) {
      if (performance.now() - lastUi < 110) return;
      lastUi = performance.now();
      if (primary) noiseSwell(0.11, 0.018, 1250, 520);
    }

    function sceneCue() {
      if (!enabled || ctx?.state !== 'running') return;
      const scene = Math.max(0, Math.min(5, Math.round(Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0))));
      const now = ctx.currentTime;
      scoreFilter.frequency.setTargetAtTime(2500 + scene * 170, now, 0.85);
      scoreWet.gain.setTargetAtTime(0.27 + scene * 0.015, now, 1.1);
      delayFeedback.gain.setTargetAtTime(0.16 + scene * 0.012, now, 1.2);
      root.dataset.fxAudioSceneMix = String(scene);
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
          scoreBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
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
      scoreBus.gain.exponentialRampToValueAtTime(0.34, now + 1.6);
      sync('on');
      activation();
      sceneCue();
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

    document.addEventListener('pointerdown', event => {
      if (!enabled) return;
      if (ctx?.state !== 'running') void ensureRunning();
      const target = event.target instanceof Element ? event.target.closest('a,button,.button,.header-buy,.fx-plan-qr-link') : null;
      if (!target || target === button || target.closest('.fx-three-sound')) return;
      interfaceCue(Boolean(target.closest('.button,.header-buy,.fx-plan-qr-link')));
    }, true);

    const sceneObserver = new MutationObserver(sceneCue);
    sceneObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three-scene', 'data-fx-scene'] });
    addEventListener('formatx:languagechange', () => sync(enabled ? 'on' : 'off'));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && enabled && ctx?.state !== 'running') void ensureRunning();
    });
    addEventListener('pagehide', () => {
      sceneObserver.disconnect();
      clearTimeout(signalTimer);
      stopScore();
      fallback?.pause();
      if (ctx) void ctx.close();
    }, { once: true });
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
