(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioRepair === 'v5') return;
  root.dataset.fxAudioRepair = 'v5';

  const Context = window.AudioContext || window.webkitAudioContext;
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const fallbackUrl = './assets/audio/formatx-audio-test.wav?v=20260728-ambient-score-v5';
  const CHORD_SECONDS = 8;
  const CHORDS = [
    { name: 'D MINOR ADD 9', root: 73.42, notes: [146.83, 174.61, 220, 329.63] },
    { name: 'B FLAT MAJOR 7', root: 58.27, notes: [116.54, 146.83, 220, 293.66] },
    { name: 'F MAJOR 7', root: 87.31, notes: [130.81, 174.61, 220, 329.63] },
    { name: 'C SUSPENDED 2', root: 65.41, notes: [130.81, 146.83, 196, 293.66] }
  ];

  async function selfTest() {
    if (!OfflineContext) {
      root.dataset.fxAudioSelfTest = 'unsupported';
      return;
    }
    try {
      const offline = new OfflineContext(1, 8192, 44100);
      const frequencies = [146.83, 174.61, 220];
      frequencies.forEach((frequency, index) => {
        const oscillator = offline.createOscillator();
        const gain = offline.createGain();
        oscillator.type = index === 1 ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.11 / frequencies.length;
        oscillator.connect(gain).connect(offline.destination);
        oscillator.start(0);
        oscillator.stop(0.16);
      });
      const rendered = await offline.startRendering();
      const data = rendered.getChannelData(0);
      let peak = 0;
      for (const sample of data) peak = Math.max(peak, Math.abs(sample));
      root.dataset.fxAudioSelfTest = peak > 0.05 ? 'passed' : 'failed';
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
    button.dataset.fxAudioOwner = 'cinematic-v5';
    root.dataset.fxAudioOwner = 'cinematic-v5';
    root.dataset.fxAudioEngine = 'cinematic-ambient-score-v5';
    root.dataset.fxAudioCharacter = 'cinematic-ambient-music';
    root.dataset.fxAudioMusic = 'ready';

    let ctx;
    let master;
    let analyser;
    let dry;
    let wet;
    let reverb;
    let musicBus;
    let musicFilter;
    let fxBus;
    let airFilter;
    let fallback;
    let enabled = false;
    let operation = 0;
    let lastUi = 0;
    let signalTimer = 0;
    let schedulerTimer = 0;
    let nextChordTime = 0;
    let chordIndex = 0;
    const activeMusicSources = new Set();

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
        ? (language() === 'en' ? 'Disable cinematic ambient music' : 'Filmes ambient zene kikapcsolása')
        : (language() === 'en' ? 'Enable cinematic ambient music' : 'Filmes ambient zene bekapcsolása'));
      root.dataset.fxAudioLevel = pending ? 'starting' : on ? 'audible' : blocked ? 'blocked' : 'off';
      root.dataset.fxAudioMusic = on ? 'playing' : pending ? 'starting' : 'stopped';
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

    function connectSpatial(node, pan = 0, wetness = 0.5, destination = null) {
      const panner = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      dryGain.gain.value = 1 - wetness * 0.55;
      wetGain.gain.value = wetness;
      if (panner) {
        panner.pan.value = pan;
        node.connect(panner);
        panner.connect(dryGain);
        panner.connect(wetGain);
      } else {
        node.connect(dryGain);
        node.connect(wetGain);
      }
      dryGain.connect(destination || dry);
      wetGain.connect(wet);
      return [panner, dryGain, wetGain];
    }

    function build() {
      if (ctx) return true;
      if (!Context) return false;
      try {
        ctx = new Context({ latencyHint: 'interactive' });

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -22;
        compressor.knee.value = 20;
        compressor.ratio.value = 2.5;
        compressor.attack.value = 0.018;
        compressor.release.value = 0.42;
        compressor.connect(ctx.destination);

        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.12;
        analyser.connect(compressor);

        master = ctx.createGain();
        master.gain.value = 0.82;
        master.connect(analyser);

        dry = ctx.createGain();
        dry.gain.value = 0.76;
        dry.connect(master);

        reverb = ctx.createConvolver();
        reverb.buffer = impulse(3.2, 3.4);
        wet = ctx.createGain();
        wet.gain.value = 0.42;
        wet.connect(reverb).connect(master);

        musicBus = ctx.createGain();
        musicBus.gain.value = 0.0001;
        musicFilter = ctx.createBiquadFilter();
        musicFilter.type = 'lowpass';
        musicFilter.frequency.value = 1450;
        musicFilter.Q.value = 0.35;
        musicBus.connect(musicFilter);
        const musicDry = ctx.createGain();
        const musicWet = ctx.createGain();
        musicDry.gain.value = 0.82;
        musicWet.gain.value = 0.38;
        musicFilter.connect(musicDry).connect(dry);
        musicFilter.connect(musicWet).connect(wet);

        fxBus = ctx.createGain();
        fxBus.gain.value = 0.78;
        fxBus.connect(dry);

        const air = ctx.createBufferSource();
        const airBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const samples = airBuffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < samples.length; index += 1) {
          previous = previous * 0.994 + (Math.random() * 2 - 1) * 0.006;
          samples[index] = previous * 0.36;
        }
        air.buffer = airBuffer;
        air.loop = true;
        airFilter = ctx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.value = 1180;
        airFilter.Q.value = 0.24;
        const airGain = ctx.createGain();
        airGain.gain.value = 0.024;
        air.connect(airFilter).connect(airGain).connect(musicBus);
        air.start();

        const lfo = ctx.createOscillator();
        const lfoDepth = ctx.createGain();
        lfo.frequency.value = 0.035;
        lfoDepth.gain.value = 230;
        lfo.connect(lfoDepth).connect(musicFilter.frequency);
        lfo.start();

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

    function track(source, cleanup) {
      activeMusicSources.add(source);
      source.addEventListener('ended', () => {
        activeMusicSources.delete(source);
        try { source.disconnect(); } catch (_) {}
        cleanup?.();
      }, { once: true });
    }

    function schedulePadNote(frequency, start, duration, volume, pan, detune) {
      const oscillator = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const finish = start + duration;
      const releaseStart = Math.max(start + 2.2, finish - 2.4);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.detune.value = detune;
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(frequency * 2, start);
      shimmer.detune.value = -detune * 0.65;

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.16;
      filter.type = 'lowpass';
      filter.frequency.value = Math.min(3200, frequency * 7.5);
      filter.Q.value = 0.3;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 1.7);
      gain.gain.setValueAtTime(volume, releaseStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);

      oscillator.connect(filter);
      shimmer.connect(shimmerGain).connect(filter);
      filter.connect(gain).connect(musicBus);
      const panner = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      if (panner) {
        gain.disconnect();
        gain.connect(panner).connect(musicBus);
        panner.pan.value = pan;
      }

      oscillator.start(start);
      shimmer.start(start);
      oscillator.stop(finish + 0.05);
      shimmer.stop(finish + 0.05);
      track(oscillator, () => {
        try { shimmer.disconnect(); } catch (_) {}
        try { shimmerGain.disconnect(); } catch (_) {}
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
        try { panner?.disconnect(); } catch (_) {}
      });
      track(shimmer);
    }

    function scheduleBass(rootFrequency, start, accent = 1) {
      const oscillator = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const finish = start + 2.6;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(rootFrequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(rootFrequency * 0.94, finish);
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(rootFrequency * 2, start);
      const overtoneGain = ctx.createGain();
      overtoneGain.gain.value = 0.18;
      filter.type = 'lowpass';
      filter.frequency.value = 310;
      filter.Q.value = 0.55;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.075 * accent, start + 0.11);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);

      oscillator.connect(filter);
      overtone.connect(overtoneGain).connect(filter);
      filter.connect(gain).connect(musicBus);
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

    function scheduleShimmer(frequency, start, pan) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const finish = start + 4.8;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = pan * 8;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.016, start + 1.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      oscillator.connect(gain);
      const nodes = connectSpatial(gain, pan, 0.9, dry);
      oscillator.start(start);
      oscillator.stop(finish + 0.04);
      track(oscillator, () => {
        try { gain.disconnect(); } catch (_) {}
        nodes.forEach(node => { try { node?.disconnect(); } catch (_) {} });
      });
    }

    function scheduleChord(start, chord, index) {
      const duration = CHORD_SECONDS + 2.4;
      chord.notes.forEach((frequency, noteIndex) => {
        const spread = (noteIndex / Math.max(1, chord.notes.length - 1)) * 1.2 - 0.6;
        const volume = noteIndex < 2 ? 0.034 : 0.024;
        schedulePadNote(frequency, start, duration, volume, spread, noteIndex % 2 ? 5 : -6);
      });
      scheduleBass(chord.root, start + 0.05, 1);
      scheduleBass(chord.root * 1.5, start + 4.05, 0.58);
      scheduleShimmer(chord.notes.at(-1) * 2, start + 2.15, index % 2 ? 0.42 : -0.42);
      window.setTimeout(() => {
        if (enabled) root.dataset.fxAudioChord = chord.name;
      }, Math.max(0, (start - ctx.currentTime) * 1000));
    }

    function scheduleMusic() {
      if (!enabled || ctx?.state !== 'running') return;
      const horizon = ctx.currentTime + 16;
      while (nextChordTime < horizon) {
        const chord = CHORDS[chordIndex % CHORDS.length];
        scheduleChord(nextChordTime, chord, chordIndex);
        nextChordTime += CHORD_SECONDS;
        chordIndex = (chordIndex + 1) % CHORDS.length;
      }
    }

    function stopScore() {
      clearInterval(schedulerTimer);
      schedulerTimer = 0;
      for (const source of activeMusicSources) {
        try { source.stop(); } catch (_) {}
      }
      activeMusicSources.clear();
      nextChordTime = 0;
      root.dataset.fxAudioChord = '';
    }

    function startScore() {
      stopScore();
      chordIndex = 0;
      nextChordTime = ctx.currentTime + 0.08;
      scheduleMusic();
      schedulerTimer = window.setInterval(scheduleMusic, 1000);
    }

    function filteredNoise({ duration = 0.24, volume = 0.025, frequency = 950, end = 320, q = 0.5, pan = 0, wetness = 0.55 }) {
      if (!enabled || ctx?.state !== 'running') return false;
      const source = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = q;
      const gain = ctx.createGain();
      const start = ctx.currentTime;
      const finish = start + duration;
      filter.frequency.setValueAtTime(frequency, start);
      filter.frequency.exponentialRampToValueAtTime(end, finish);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.045, duration * 0.25));
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      source.connect(filter).connect(gain);
      const nodes = connectSpatial(gain, pan, wetness, fxBus);
      source.start(start);
      source.stop(finish + 0.02);
      source.addEventListener('ended', () => {
        try { source.disconnect(); } catch (_) {}
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
        nodes.forEach(node => { try { node?.disconnect(); } catch (_) {} });
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
        root.dataset.fxAudioOutput = deviation >= 3 ? 'signal-verified' : 'no-signal';
        root.style.setProperty('--fx-audio-signal', String(deviation));
        if (deviation < 3) void playFallback();
      }, 520);
    }

    async function playFallback() {
      try {
        fallback ||= new Audio(fallbackUrl);
        fallback.preload = 'auto';
        fallback.loop = true;
        fallback.volume = 0.72;
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
      filteredNoise({ duration: 1.15, volume: 0.035, frequency: 1700, end: 260, q: 0.3, wetness: 0.85 });
      verifySignal();
    }

    function interfaceCue(primary) {
      if (performance.now() - lastUi < 90) return;
      lastUi = performance.now();
      filteredNoise({
        duration: primary ? 0.13 : 0.085,
        volume: primary ? 0.022 : 0.012,
        frequency: primary ? 1050 : 760,
        end: primary ? 360 : 280,
        q: primary ? 0.9 : 0.65,
        pan: primary ? 0.12 : -0.08,
        wetness: 0.38
      });
    }

    function sceneCue() {
      if (!enabled || ctx?.state !== 'running') return;
      const scene = Math.max(0, Math.min(5, Math.round(Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0))));
      const now = ctx.currentTime;
      musicFilter.frequency.setTargetAtTime(1050 + scene * 115, now, 0.75);
      airFilter.frequency.setTargetAtTime(920 + scene * 105, now, 0.8);
      wet.gain.setTargetAtTime(0.34 + scene * 0.018, now, 0.9);
      filteredNoise({ duration: 0.52, volume: 0.013, frequency: 720 + scene * 80, end: 250, q: 0.32, pan: scene % 2 ? 0.28 : -0.28, wetness: 0.78 });
    }

    async function setEnabled(next) {
      const token = ++operation;
      if (!next) {
        enabled = false;
        sync('off');
        clearTimeout(signalTimer);
        fallback?.pause();
        if (ctx && musicBus) {
          const now = ctx.currentTime;
          musicBus.gain.cancelScheduledValues(now);
          musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), now);
          musicBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        }
        window.setTimeout(stopScore, 650);
        return;
      }

      sync('pending');
      const running = await ensureRunning();
      if (token !== operation) return;
      if (!running || !musicBus) {
        const worked = await playFallback();
        enabled = worked;
        sync(worked ? 'on' : 'blocked');
        return;
      }

      enabled = true;
      const now = ctx.currentTime;
      musicBus.gain.cancelScheduledValues(now);
      musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), now);
      musicBus.gain.exponentialRampToValueAtTime(0.86, now + 2.2);
      sync('on');
      startScore();
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
      const target = event.target instanceof Element ? event.target.closest('a,button,.card,.price-card,.fx-plan-qr-card') : null;
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
