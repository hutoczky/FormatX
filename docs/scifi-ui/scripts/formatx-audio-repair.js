(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioRepair === 'v4') return;
  root.dataset.fxAudioRepair = 'v4';

  const Context = window.AudioContext || window.webkitAudioContext;
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const fallbackUrl = './assets/audio/formatx-audio-test.wav?v=20260728-cinematic-v4';

  async function selfTest() {
    if (!OfflineContext) {
      root.dataset.fxAudioSelfTest = 'unsupported';
      return;
    }
    try {
      const offline = new OfflineContext(1, 4096, 44100);
      const osc = offline.createOscillator();
      const gain = offline.createGain();
      osc.frequency.value = 440;
      gain.gain.value = 0.3;
      osc.connect(gain).connect(offline.destination);
      osc.start(0);
      osc.stop(0.075);
      const rendered = await offline.startRendering();
      const data = rendered.getChannelData(0);
      let peak = 0;
      for (const sample of data) peak = Math.max(peak, Math.abs(sample));
      root.dataset.fxAudioSelfTest = peak > 0.1 ? 'passed' : 'failed';
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
    button.dataset.fxAudioOwner = 'cinematic-v4';
    root.dataset.fxAudioOwner = 'cinematic-v4';
    root.dataset.fxAudioEngine = 'cinematic-spatial-web-audio-v4';
    root.dataset.fxAudioCharacter = 'modern-cinematic';

    let ctx;
    let master;
    let analyser;
    let dry;
    let wet;
    let reverb;
    let ambient;
    let ambientFilter;
    let padA;
    let padB;
    let airFilter;
    let fallback;
    let enabled = false;
    let operation = 0;
    let lastScene = -1;
    let lastUi = 0;
    let signalTimer = 0;

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
            ? (language() === 'en' ? 'SOUND ON' : 'HANG BE')
            : (language() === 'en' ? 'SOUND OFF' : 'HANG KI');
      button.setAttribute('aria-label', on
        ? (language() === 'en' ? 'Disable cinematic sound design' : 'Filmes hangdizájn kikapcsolása')
        : (language() === 'en' ? 'Enable cinematic sound design' : 'Filmes hangdizájn bekapcsolása'));
      root.dataset.fxAudioLevel = pending ? 'starting' : on ? 'audible' : blocked ? 'blocked' : 'off';
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
        compressor.threshold.value = -20;
        compressor.knee.value = 18;
        compressor.ratio.value = 3;
        compressor.attack.value = 0.008;
        compressor.release.value = 0.32;
        compressor.connect(ctx.destination);

        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0;
        analyser.connect(compressor);

        master = ctx.createGain();
        master.gain.value = 0.78;
        master.connect(analyser);

        dry = ctx.createGain();
        dry.gain.value = 0.88;
        dry.connect(master);

        reverb = ctx.createConvolver();
        reverb.buffer = impulse(1.65, 2.8);
        wet = ctx.createGain();
        wet.gain.value = 0.34;
        wet.connect(reverb).connect(master);

        ambient = ctx.createGain();
        ambient.gain.value = 0.0001;
        ambientFilter = ctx.createBiquadFilter();
        ambientFilter.type = 'lowpass';
        ambientFilter.frequency.value = 820;
        ambientFilter.Q.value = 0.42;
        ambient.connect(ambientFilter);
        const ambientDry = ctx.createGain();
        const ambientWet = ctx.createGain();
        ambientDry.gain.value = 0.72;
        ambientWet.gain.value = 0.28;
        ambientFilter.connect(ambientDry).connect(master);
        ambientFilter.connect(ambientWet).connect(reverb);

        padA = ctx.createOscillator();
        padA.type = 'sine';
        padA.frequency.value = 110;
        const gainA = ctx.createGain();
        gainA.gain.value = 0.11;
        padA.connect(gainA).connect(ambient);
        padA.start();

        padB = ctx.createOscillator();
        padB.type = 'sine';
        padB.frequency.value = 164.81;
        padB.detune.value = 4;
        const gainB = ctx.createGain();
        gainB.gain.value = 0.055;
        padB.connect(gainB).connect(ambient);
        padB.start();

        const air = ctx.createBufferSource();
        const airBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const samples = airBuffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < samples.length; index += 1) {
          previous = previous * 0.992 + (Math.random() * 2 - 1) * 0.008;
          samples[index] = previous * 0.42;
        }
        air.buffer = airBuffer;
        air.loop = true;
        airFilter = ctx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.value = 1450;
        airFilter.Q.value = 0.32;
        const airGain = ctx.createGain();
        airGain.gain.value = 0.065;
        air.connect(airFilter).connect(airGain).connect(ambient);
        air.start();

        const lfo = ctx.createOscillator();
        const lfoDepth = ctx.createGain();
        lfo.frequency.value = 0.055;
        lfoDepth.gain.value = 160;
        lfo.connect(lfoDepth).connect(ambientFilter.frequency);
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

    function route(node, pan = 0, wetness = 0.5) {
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
      dryGain.connect(dry);
      wetGain.connect(wet);
      return [panner, dryGain, wetGain];
    }

    function voice({ frequency, end = frequency, duration = 0.35, attack = 0.02, volume = 0.06, delay = 0, pan = 0, wetness = 0.5 }) {
      if (!enabled || ctx?.state !== 'running') return false;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + delay;
      const finish = start + duration;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, end), finish);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      osc.connect(gain);
      const nodes = route(gain, pan, wetness);
      osc.start(start);
      osc.stop(finish + 0.04);
      osc.addEventListener('ended', () => {
        osc.disconnect();
        gain.disconnect();
        nodes.forEach(node => node?.disconnect());
      }, { once: true });
      return true;
    }

    function noise({ duration = 0.18, attack = 0.006, volume = 0.04, frequency = 1400, end = 600, q = 0.7, pan = 0, wetness = 0.5 }) {
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
      gain.gain.exponentialRampToValueAtTime(volume, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, finish);
      source.connect(filter).connect(gain);
      const nodes = route(gain, pan, wetness);
      source.start(start);
      source.stop(finish + 0.02);
      source.addEventListener('ended', () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
        nodes.forEach(node => node?.disconnect());
      }, { once: true });
      return true;
    }

    function verifySignal() {
      clearTimeout(signalTimer);
      signalTimer = setTimeout(() => {
        if (!enabled || !analyser) return;
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let deviation = 0;
        for (const value of data) deviation = Math.max(deviation, Math.abs(value - 128));
        root.dataset.fxAudioOutput = deviation >= 3 ? 'signal-verified' : 'no-signal';
        root.style.setProperty('--fx-audio-signal', String(deviation));
        if (deviation < 3) void playFallback();
      }, 110);
    }

    async function playFallback() {
      try {
        fallback ||= new Audio(fallbackUrl);
        fallback.preload = 'auto';
        fallback.volume = 0.82;
        fallback.currentTime = 0;
        await fallback.play();
        root.dataset.fxAudioFallback = 'playing';
        root.dataset.fxAudioOutput = 'wav-fallback';
        return true;
      } catch (error) {
        root.dataset.fxAudioFallback = 'blocked';
        root.dataset.fxAudioError = String(error?.message || error).slice(0, 160);
        return false;
      }
    }

    function activation() {
      const active = [
        voice({ frequency: 196, end: 220, duration: 0.85, attack: 0.06, volume: 0.085, pan: -0.32, wetness: 0.62 }),
        voice({ frequency: 293.66, end: 329.63, duration: 0.95, attack: 0.08, volume: 0.065, delay: 0.035, pan: 0.28, wetness: 0.68 }),
        voice({ frequency: 440, end: 493.88, duration: 0.72, attack: 0.04, volume: 0.035, delay: 0.11, pan: 0.08, wetness: 0.76 }),
        noise({ duration: 0.58, attack: 0.055, volume: 0.055, frequency: 1750, end: 480, q: 0.45, wetness: 0.72 })
      ].some(Boolean);
      if (active) verifySignal();
      else void playFallback();
    }

    function interfaceCue(primary) {
      if (performance.now() - lastUi < 80) return;
      lastUi = performance.now();
      noise({ duration: primary ? 0.16 : 0.11, volume: primary ? 0.045 : 0.026, frequency: primary ? 1650 : 1180, end: primary ? 720 : 560, q: primary ? 1.15 : 0.82, pan: 0.1, wetness: 0.42 });
      voice({ frequency: primary ? 392 : 293.66, end: primary ? 349.23 : 261.63, duration: primary ? 0.22 : 0.15, attack: 0.006, volume: primary ? 0.035 : 0.018, pan: -0.08, wetness: 0.5 });
    }

    function sceneTransition(scene) {
      const base = [98, 110, 123.47, 87.31, 103.83, 130.81][scene] || 110;
      voice({ frequency: base, end: base * 0.72, duration: 0.72, attack: 0.025, volume: 0.07, pan: -0.18, wetness: 0.58 });
      voice({ frequency: base * 2.5, end: base * 2.15, duration: 0.5, attack: 0.045, volume: 0.025, delay: 0.06, pan: 0.24, wetness: 0.78 });
      noise({ duration: 0.42, attack: 0.025, volume: 0.035, frequency: 920 + scene * 85, end: 360, q: 0.5, pan: 0.1, wetness: 0.66 });
    }

    async function setEnabled(next) {
      const token = ++operation;
      if (!next) {
        enabled = false;
        sync('off');
        clearTimeout(signalTimer);
        fallback?.pause();
        if (ctx && ambient) {
          const now = ctx.currentTime;
          ambient.gain.cancelScheduledValues(now);
          ambient.gain.setValueAtTime(Math.max(0.0001, ambient.gain.value), now);
          ambient.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
        }
        return;
      }
      sync('pending');
      const running = await ensureRunning();
      if (token !== operation) return;
      if (!running || !ambient) {
        const worked = await playFallback();
        enabled = worked;
        sync(worked ? 'on' : 'blocked');
        return;
      }
      enabled = true;
      const now = ctx.currentTime;
      ambient.gain.cancelScheduledValues(now);
      ambient.gain.setValueAtTime(Math.max(0.0001, ambient.gain.value), now);
      ambient.gain.exponentialRampToValueAtTime(0.105, now + 1.15);
      sync('on');
      activation();
    }

    function sceneCue() {
      if (!enabled || ctx?.state !== 'running') return;
      const scene = Math.max(0, Math.min(5, Math.round(Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0))));
      if (scene === lastScene) return;
      lastScene = scene;
      const now = ctx.currentTime;
      const base = [110, 116.54, 123.47, 98, 103.83, 130.81][scene];
      padA.frequency.setTargetAtTime(base, now, 0.5);
      padB.frequency.setTargetAtTime(base * 1.5, now, 0.55);
      ambientFilter.frequency.setTargetAtTime(690 + scene * 65, now, 0.45);
      airFilter.frequency.setTargetAtTime(1280 + scene * 110, now, 0.5);
      sceneTransition(scene);
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

    const observer = new MutationObserver(sceneCue);
    observer.observe(root, { attributes: true, attributeFilter: ['data-fx-three-scene', 'data-fx-scene'] });
    addEventListener('formatx:languagechange', () => sync(enabled ? 'on' : 'off'));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && enabled && ctx?.state !== 'running') void ensureRunning();
    });
    addEventListener('pagehide', () => {
      observer.disconnect();
      clearTimeout(signalTimer);
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
