(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAudioRepair === 'ready') return;
  root.dataset.fxAudioRepair = 'ready';

  function init(button) {
    if (!(button instanceof HTMLButtonElement) || button.dataset.fxAudioRepair === 'ready') return;
    button.dataset.fxAudioRepair = 'ready';

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let context = null;
    let master = null;
    let hum = null;
    let harmonic = null;
    let filter = null;
    let enabled = false;
    let operation = 0;
    let voiceIndex = 0;
    let lastScene = -1;
    const voices = [];

    const language = () => root.lang === 'en' ? 'en' : 'hu';

    function sync(state) {
      const on = state === 'on';
      const pending = state === 'pending';
      button.setAttribute('aria-pressed', String(on));
      button.dataset.fxAudioState = state;
      const label = button.querySelector('span');
      if (label) {
        if (pending) label.textContent = language() === 'en' ? 'STARTING…' : 'INDÍTÁS…';
        else if (on) label.textContent = language() === 'en' ? 'SOUND ON' : 'HANG BE';
        else label.textContent = language() === 'en' ? 'SOUND OFF' : 'HANG KI';
      }
      button.setAttribute('aria-label', pending
        ? (language() === 'en' ? 'Starting sound design' : 'Hangdizájn indítása')
        : on
          ? (language() === 'en' ? 'Disable sound design' : 'Hangdizájn kikapcsolása')
          : (language() === 'en' ? 'Enable sound design' : 'Hangdizájn bekapcsolása'));
      root.dataset.fxAudioLevel = pending ? 'starting' : on ? 'audible' : 'off';
    }

    function build() {
      if (context) return true;
      if (!AudioContextClass) {
        root.dataset.fxAudioLevel = 'unsupported';
        return false;
      }
      try {
        context = new AudioContextClass({ latencyHint: 'interactive' });
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 16;
        compressor.ratio.value = 5;
        compressor.attack.value = 0.006;
        compressor.release.value = 0.2;

        master = context.createGain();
        master.gain.value = 0.0001;
        master.connect(compressor).connect(context.destination);

        hum = context.createOscillator();
        const humGain = context.createGain();
        hum.type = 'sine';
        hum.frequency.value = 46.25;
        humGain.gain.value = 0.09;
        hum.connect(humGain).connect(master);
        hum.start();

        harmonic = context.createOscillator();
        const harmonicGain = context.createGain();
        harmonic.type = 'triangle';
        harmonic.frequency.value = 92.5;
        harmonicGain.gain.value = 0.025;
        harmonic.connect(harmonicGain).connect(master);
        harmonic.start();

        const noise = context.createBufferSource();
        const noiseGain = context.createGain();
        const buffer = context.createBuffer(1, Math.round(context.sampleRate * 1.5), context.sampleRate);
        const samples = buffer.getChannelData(0);
        let previous = 0;
        for (let index = 0; index < samples.length; index += 1) {
          previous = previous * 0.974 + (Math.random() * 2 - 1) * 0.026;
          samples[index] = previous * 0.42;
        }
        noise.buffer = buffer;
        noise.loop = true;
        filter = context.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 470;
        filter.Q.value = 0.75;
        noiseGain.gain.value = 0.028;
        noise.connect(filter).connect(noiseGain).connect(master);
        noise.start();

        for (let index = 0; index < 8; index += 1) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = index % 3 === 0 ? 'sine' : 'triangle';
          gain.gain.value = 0.0001;
          oscillator.connect(gain).connect(master);
          oscillator.start();
          voices.push({ oscillator, gain });
        }

        context.addEventListener('statechange', () => {
          root.dataset.fxAudioContext = context ? context.state : 'closed';
          if (enabled && context && context.state !== 'running') root.dataset.fxAudioLevel = 'blocked';
        });
        root.dataset.fxAudioContext = context.state;
        return true;
      } catch (error) {
        console.warn('FormatX audio repair could not initialise.', error);
        root.dataset.fxAudioLevel = 'error';
        return false;
      }
    }

    async function ensureRunning() {
      if (!build() || !context) return false;
      if (context.state !== 'running') {
        try { await context.resume(); } catch (error) {
          console.warn('FormatX audio context could not resume.', error);
        }
      }
      root.dataset.fxAudioContext = context.state;
      return context.state === 'running';
    }

    function tone(frequency, duration, volume) {
      if (!enabled || !context || context.state !== 'running' || !voices.length) return;
      const voice = voices[voiceIndex];
      voiceIndex = (voiceIndex + 1) % voices.length;
      const now = context.currentTime;
      voice.oscillator.frequency.cancelScheduledValues(now);
      voice.oscillator.frequency.setValueAtTime(frequency, now);
      voice.oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.68), now + duration);
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(0.0001, now);
      voice.gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    async function setEnabled(next) {
      const token = ++operation;
      if (!next) {
        enabled = false;
        sync('off');
        if (!context || !master) return;
        const now = context.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        return;
      }

      sync('pending');
      const running = await ensureRunning();
      if (token !== operation) return;
      if (!running || !context || !master) {
        enabled = false;
        sync('off');
        root.dataset.fxAudioLevel = 'blocked';
        return;
      }

      enabled = true;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.exponentialRampToValueAtTime(0.42, now + 0.18);
      sync('on');
      tone(880, 0.16, 0.13);
      setTimeout(() => tone(1320, 0.2, 0.09), 95);
    }

    function sceneCue() {
      if (!enabled || !context) return;
      const scene = Math.max(0, Math.min(5, Math.round(Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0))));
      if (scene === lastScene) return;
      lastScene = scene;
      const now = context.currentTime;
      hum.frequency.setTargetAtTime(44 + scene * 3.2, now, 0.18);
      harmonic.frequency.setTargetAtTime(88 + scene * 6.4, now, 0.2);
      filter.frequency.setTargetAtTime(420 + scene * 90, now, 0.16);
      tone([164.81, 196, 246.94, 130.81, 220, 293.66][scene], 0.23, 0.075);
    }

    sync('off');
    root.dataset.fxAudioEngine = 'reliable-web-audio';

    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target.closest('.fx-three-sound') : null;
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void setEnabled(!enabled);
    }, true);

    document.addEventListener('pointerdown', event => {
      if (enabled && context && context.state !== 'running') void ensureRunning();
      const target = event.target instanceof Element ? event.target.closest('a,button,.card,.price-card,.fx-plan-qr-card') : null;
      if (!target || target.closest('.fx-three-sound')) return;
      tone(target.closest('.button,.header-buy,.fx-plan-qr-link') ? 980 : 680, 0.1, 0.05);
    }, true);

    const observer = new MutationObserver(sceneCue);
    observer.observe(root, { attributes: true, attributeFilter: ['data-fx-three-scene', 'data-fx-scene'] });
    addEventListener('formatx:languagechange', () => sync(enabled ? 'on' : 'off'));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && enabled && context && context.state !== 'running') void ensureRunning();
    });
    addEventListener('pagehide', () => {
      observer.disconnect();
      if (context) void context.close();
    }, { once: true });
  }

  const existing = document.querySelector('.fx-three-sound');
  if (existing) init(existing);
  else {
    const observer = new MutationObserver(() => {
      const button = document.querySelector('.fx-three-sound');
      if (!button) return;
      observer.disconnect();
      init(button);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}());