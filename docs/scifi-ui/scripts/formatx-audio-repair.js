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
      [146.83, 174.61, 220].forEach((frequency, index) => {
        const oscillator = offline.createOscillator();
        const gain = offline.createGain();
        oscillator.type = index === 1 ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.04;
        oscillator.connect(gain).connect(offline.destination);
        oscillator.start(0);
        oscillator.stop(0.16);
      });
      const rendered = await offline.startRendering();
      let peak = 0;
      for (const sample of rendered.getChannelData(0)) peak = Math.max(peak, Math.abs(sample));
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
      root.dataset.fxAudioLevel = pending ? 'starting' : on ? 'audible' : blocked ? 'blocked' : 'off';
      root.dataset.fxAudioMusic = on ? 'playing' : pending ? 'starting' : 'stopped';
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
    }

    function impulse(seconds, decay) {
      const length = Math.round(ctx.sampleRate * seconds);
      const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = buffer.getChannelData(channel);
        for (let index = 0; index < length; index += 1) {
          data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, decay);
        }
      }
      return buffer;
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
        analyser.smoothingTimeConstant = 0;
        analyser.connect(compressor);

        master = ctx.createGain();
        master.gain.value = 0.88;
        master.connect(analyser);

        dry = ctx.createGain();
        dry.gain.value = 0.82;
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
        fxBus.gain.value = 1;
        fxBus.connect(dry);
        const fxWet = ctx.createGain();
        fxWet.gain.value = 0.35;
        fxBus.connect(fxWet).connect(wet);

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
      activeSources.add(source);
      source.addEventListener('ended', () => {
        activeSources.delete(source);
        try { source.disconnect(); } catch (_) {}
        cleanup?.();
      }, { once: true });
    }

    function panned(node, pan) {
      if (typeof ctx.createStereoPanner !== 'function') return node;
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      node.connect(panner);
      return panner;
    }

    function schedulePadNote(frequency, start, duration, volume, pan, detune) {
      const oscillator = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const finish = start + duration;
      const release = finish - 2.4;

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      overtone.type = 'triangle';
      overtone.frequency.value = frequency * 2;
      overtone.detune.value = -detune * 0.65;
      overtoneGain.gain.value = 0.15;
      filter.type = 'lowpass';
      filter.frequency.value = Math.min(3200, frequency * 7.5);
      filter.Q.value = 0.3;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 1.6);
      gain.gain.setValueAtTime(volume, release);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);

      oscillator.connect(filter);
      overtone.connect(overtoneGain).connect(filter);
      filter.connect(gain);
      const output = panned(gain, pan);
      output.connect(musicBus);
      oscillator.start(start);
      overtone.start(start);
      oscillator.stop(finish + 0.05);
      overtone.stop(finish + 0.05);
      track(oscillator, () => {
        try { overtone.disconnect(); } catch (_) {}
        try { overtoneGain.disconnect(); } catch (_) {}
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
        if (output !== gain) try { output.disconnect(); } catch (_) {}
      });
      track(overtone);
    }

    function scheduleBass(frequency, start, accent) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const finish = start + 2.8;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.94, finish);
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.5;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.09 * accent, start + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      oscillator.connect(filter).connect(gain).connect(musicBus);
      oscillator.start(start);
      oscillator.stop(finish + 0.04);
      track(oscillator, () => {
        try { filter.disconnect(); } catch (_) {}
        try { gain.disconnect(); } catch (_) {}
      });
    }

    function scheduleShimmer(frequency, start, pan) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const finish = start + 4.8;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.014, start + 1.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      oscillator.connect(gain);
      const output = panned(gain, pan);
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      dryGain.gain.value = 0.35;
      wetGain.gain.value = 0.82;
      output.connect(dryGain).connect(dry);
      output.connect(wetGain).connect(wet);
      oscillator.start(start);
      oscillator.stop(finish + 0.04);
      track(oscillator, () => {
        try { gain.disconnect(); } catch (_) {}
        if (output !== gain) try { output.disconnect(); } catch (_) {}
        try { dryGain.disconnect(); } catch (_) {}
        try { wetGain.disconnect(); } catch (_) {}
      });
    }

    function scheduleChord(start, chord, index) {
      const duration = CHORD_SECONDS + 2.4;
      chord.notes.forEach((frequency, noteIndex) => {
        const pan = noteIndex / Math.max(1, chord.notes.length - 1) * 1.2 - 0.6;
        schedulePadNote(frequency, start, duration, noteIndex < 2 ? 0.038 : 0.027, pan, noteIndex % 2 ? 5 : -6);
      });
      scheduleBass(chord.root, start + 0.05, 1);
      scheduleBass(chord.root * 1.5, start + 4.05, 0.6);
      scheduleShimmer(chord.notes.at(-1) * 2, start + 2.15, index % 2 ? 0.42 : -0.42);
      window.setTimeout(() => {
        if (enabled) root.dataset.fxAudioChord = chord.name;
      }, Math.max(0, (start - ctx.currentTime) * 1000));
    }

    function scheduleMusic() {
      if (!enabled || ctx?.state !== 'running') return;
      const horizon = ctx.currentTime + 16;
      while (nextChordTime < horizon) {
        scheduleChord(nextChordTime, CHORDS[chordIndex], chordIndex);
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
    }

    function startScore() {
      stopScore();
      chordIndex = 0;
      nextChordTime = ctx.currentTime + 0.06;
      scheduleMusic();
      schedulerTimer = window.setInterval(scheduleMusic, 1000);
    }

    function noiseSwell({ duration = 0.3, volume = 0.03, frequency = 1100, end = 300, q = 0.45 }) {
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
      filter.Q.value = q;
      filter.frequency.setValueAtTime(frequency, start);
      filter.frequency.exponentialRampToValueAtTime(end, finish);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.06, duration * 0.24));
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      source.connect(filter).connect(gain).connect(fxBus);
      source.start(start);
      source.stop(finish + 0.02);
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
      }, 850);
    }

    async function playFallback() {
      try {
        fallback ||= new Audio(fallbackUrl);
        fallback.preload = 'auto';
        fallback.loop = false;
        fallback.volume = 0.62;
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
      noiseSwell({ duration: 1.25, volume: 0.12, frequency: 1850, end: 240, q: 0.28 });
      verifySignal();
    }

    function interfaceCue(primary) {
      if (performance.now() - lastUi < 90) return;
      lastUi = performance.now();
      noiseSwell({
        duration: primary ? 0.13 : 0.085,
        volume: primary ? 0.022 : 0.012,
        frequency: primary ? 1050 : 760,
        end: primary ? 360 : 280,
        q: primary ? 0.9 : 0.65
      });
    }

    function sceneCue() {
      if (!enabled || ctx?.state !== 'running') return;
      const scene = Math.max(0, Math.min(5, Math.round(Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0))));
      const now = ctx.currentTime;
      musicFilter.frequency.setTargetAtTime(1050 + scene * 115, now, 0.75);
      airFilter.frequency.setTargetAtTime(920 + scene * 105, now, 0.8);
      wet.gain.setTargetAtTime(0.34 + scene * 0.018, now, 0.9);
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
          musicBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        }
        window.setTimeout(stopScore, 540);
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
      musicBus.gain.exponentialRampToValueAtTime(0.9, now + 1.25);
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
