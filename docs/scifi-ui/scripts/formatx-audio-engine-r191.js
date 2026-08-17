(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioEngineR191 === 'ready') return;
  root.dataset.fxAudioEngineR191 = 'booting';

  const Context = window.AudioContext || window.webkitAudioContext;
  const BPM = 72;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const CHORDS = [
    { bass: 73.42, notes: [146.83, 174.61, 220, 261.63, 329.63] },
    { bass: 58.27, notes: [116.54, 146.83, 174.61, 220, 261.63] },
    { bass: 87.31, notes: [130.81, 174.61, 220, 261.63, 329.63] },
    { bass: 65.41, notes: [130.81, 164.81, 196, 293.66, 329.63] }
  ];

  function ensureActuator() {
    let button = document.querySelector('.fx-three-sound');
    if (!(button instanceof HTMLButtonElement)) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'fx-three-sound';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Enable the cinematic score');
      button.innerHTML = '<span>MUSIC OFF</span>';
      document.body.appendChild(button);
    }
    button.dataset.fxAudioOwner = 'professional-v6';
    return button;
  }

  const actuator = ensureActuator();
  root.dataset.fxAudioOwner = 'professional-v6';
  root.dataset.fxAudioEngine = 'professional-cinematic-score-r191';
  root.dataset.fxAudioState = 'off';
  root.dataset.fxAudioLevel = 'off';
  root.dataset.fxAudioOutput = 'idle';
  root.dataset.fxAudioMusic = 'ready';
  root.dataset.fxAudioAutoplay = 'disabled';
  root.dataset.fxAudioGestureGate = 'required';

  let ctx = null;
  let master = null;
  let scoreBus = null;
  let analyser = null;
  let reverb = null;
  let delay = null;
  let enabled = false;
  let chordIndex = 0;
  let nextChordTime = 0;
  let scheduler = 0;
  let verifyTimer = 0;
  let operation = 0;
  const active = new Set();

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function sync(state) {
    const on = state === 'on';
    actuator.dataset.fxAudioState = state;
    actuator.setAttribute('aria-pressed', String(on));
    actuator.setAttribute('aria-label', on
      ? (language() === 'en' ? 'Disable the cinematic score' : 'Filmes zene kikapcsolása')
      : (language() === 'en' ? 'Enable the cinematic score' : 'Filmes zene bekapcsolása'));
    const span = actuator.querySelector('span');
    if (span) span.textContent = on ? 'MUSIC ON' : state === 'pending' ? 'STARTING' : 'MUSIC OFF';
    root.dataset.fxAudioState = state;
    root.dataset.fxAudioLevel = state === 'on' ? 'audible' : state === 'pending' ? 'starting' : state === 'blocked' ? 'blocked' : 'off';
  }

  function track(source, cleanup) {
    active.add(source);
    source.addEventListener('ended', () => {
      active.delete(source);
      try { source.disconnect(); } catch (_) {}
      cleanup?.();
    }, { once: true });
  }

  function impulse(seconds, decay) {
    const length = Math.max(1, Math.round(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  function build() {
    if (ctx) return true;
    if (!Context) {
      root.dataset.fxAudioContext = 'unsupported';
      return false;
    }
    try {
      ctx = new Context({ latencyHint: 'interactive' });
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -21;
      compressor.knee.value = 22;
      compressor.ratio.value = 2.4;
      compressor.attack.value = 0.018;
      compressor.release.value = 0.38;
      compressor.connect(ctx.destination);

      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.16;
      analyser.connect(compressor);

      master = ctx.createGain();
      master.gain.value = 0.78;
      master.connect(analyser);

      scoreBus = ctx.createGain();
      scoreBus.gain.value = 0.0001;
      scoreBus.connect(master);

      reverb = ctx.createConvolver();
      reverb.buffer = impulse(2.4, 2.6);
      const wet = ctx.createGain();
      wet.gain.value = 0.24;
      scoreBus.connect(wet).connect(reverb).connect(master);

      delay = ctx.createDelay(1.5);
      delay.delayTime.value = BEAT * 0.75;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.17;
      const delayReturn = ctx.createGain();
      delayReturn.gain.value = 0.10;
      scoreBus.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(delayReturn).connect(master);

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
    try {
      if (ctx.state !== 'running') await ctx.resume();
    } catch (error) {
      root.dataset.fxAudioError = String(error?.message || error).slice(0, 160);
    }
    root.dataset.fxAudioContext = ctx.state;
    return ctx.state === 'running';
  }

  function pad(frequency, start, duration, gainValue, detune) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(3200, frequency * 8);
    filter.Q.value = 0.35;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 1.1);
    gain.gain.setValueAtTime(gainValue, start + Math.max(1.2, duration - 1.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter).connect(gain).connect(scoreBus);
    osc.start(start);
    osc.stop(start + duration + 0.03);
    track(osc, () => {
      try { filter.disconnect(); } catch (_) {}
      try { gain.disconnect(); } catch (_) {}
    });
  }

  function bass(frequency, start) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.06, start + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + BAR * 0.78);
    osc.connect(gain).connect(scoreBus);
    osc.start(start);
    osc.stop(start + BAR * 0.8);
    track(osc, () => { try { gain.disconnect(); } catch (_) {} });
  }

  function pulse(start, amount) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(88, start);
    osc.frequency.exponentialRampToValueAtTime(46, start + 0.55);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035 * amount, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
    osc.connect(gain).connect(scoreBus);
    osc.start(start);
    osc.stop(start + 0.58);
    track(osc, () => { try { gain.disconnect(); } catch (_) {} });
  }

  function scheduleChord(start) {
    const chord = CHORDS[chordIndex % CHORDS.length];
    chord.notes.forEach((frequency, index) => {
      pad(frequency, start, BAR * 2 + 1.1, index < 2 ? 0.018 : 0.013, index % 2 ? 4 : -5);
    });
    bass(chord.bass, start + 0.02);
    pulse(start + 0.02, 1);
    pulse(start + BEAT * 2, 0.42);
    pulse(start + BAR, 0.58);
    chordIndex = (chordIndex + 1) % CHORDS.length;
    root.dataset.fxAudioSection = String(chordIndex + 1).padStart(2, '0') + ' / ' + String(CHORDS.length).padStart(2, '0');
  }

  function scheduleAhead() {
    if (!enabled || ctx?.state !== 'running') return;
    const horizon = ctx.currentTime + BAR * 2.4;
    while (nextChordTime < horizon) {
      scheduleChord(nextChordTime);
      nextChordTime += BAR * 2;
    }
  }

  function stopScore() {
    clearInterval(scheduler);
    scheduler = 0;
    clearTimeout(verifyTimer);
    verifyTimer = 0;
    for (const source of active) {
      try { source.stop(); } catch (_) {}
    }
    active.clear();
    nextChordTime = 0;
    root.dataset.fxAudioSection = '';
  }

  function verifySignal() {
    clearTimeout(verifyTimer);
    verifyTimer = window.setTimeout(() => {
      if (!enabled || !analyser) return;
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      let deviation = 0;
      for (const value of data) deviation = Math.max(deviation, Math.abs(value - 128));
      root.dataset.fxAudioSignal = String(deviation);
      root.dataset.fxAudioOutput = deviation >= 1 ? 'signal-verified' : 'graph-running';
    }, 650);
  }

  async function setEnabled(next) {
    const token = ++operation;
    if (!next) {
      enabled = false;
      sync('off');
      stopScore();
      if (ctx && scoreBus) {
        const now = ctx.currentTime;
        scoreBus.gain.cancelScheduledValues(now);
        scoreBus.gain.setValueAtTime(Math.max(0.0001, scoreBus.gain.value), now);
        scoreBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      }
      root.dataset.fxAudioMusic = 'stopped';
      root.dataset.fxAudioOutput = 'idle';
      return;
    }

    sync('pending');
    const running = await ensureRunning();
    if (token !== operation) return;
    if (!running || !scoreBus) {
      enabled = false;
      sync('blocked');
      root.dataset.fxAudioMusic = 'blocked';
      root.dataset.fxAudioOutput = 'blocked';
      return;
    }

    enabled = true;
    chordIndex = 0;
    nextChordTime = ctx.currentTime + 0.04;
    scheduleAhead();
    scheduler = window.setInterval(scheduleAhead, 900);
    const now = ctx.currentTime;
    scoreBus.gain.cancelScheduledValues(now);
    scoreBus.gain.setValueAtTime(0.0001, now);
    scoreBus.gain.exponentialRampToValueAtTime(0.32, now + 0.8);
    root.dataset.fxAudioMusic = 'playing';
    root.dataset.fxAudioOutput = 'graph-running';
    sync('on');
    verifySignal();
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('.fx-three-sound') : null;
    if (target !== actuator) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void setEnabled(!enabled);
  }, true);

  addEventListener('formatx:languagechange', () => sync(enabled ? 'on' : 'off'));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && enabled && ctx?.state !== 'running') void ensureRunning();
  });
  addEventListener('pagehide', () => {
    stopScore();
    if (ctx) void ctx.close();
  }, { once: true });

  root.dataset.fxAudioEngineR191 = 'ready';
  sync('off');
}());
