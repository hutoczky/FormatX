(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxNextgenControls === 'ready') return;
  root.dataset.fxNextgenControls = 'ready';

  const shared = window.__FORMATX_3D_STATE__;
  const SCENE = 0;
  const VELOCITY = 2;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './styles/formatx-nextgen-controls.css?v=20260727-webgpu-1';
  document.head.appendChild(style);

  class GenerativeSoundtrack {
    constructor(button) {
      this.button = button;
      this.context = null;
      this.master = null;
      this.filter = null;
      this.sub = null;
      this.carrier = null;
      this.pulse = null;
      this.lfo = null;
      this.lfoGain = null;
      this.voices = [];
      this.voiceIndex = 0;
      this.enabled = false;
      this.scene = -1;
      this.nextBeat = 0;
      this.lastHover = 0;
      this.timer = 0;
    }

    build() {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return false;
      this.context = new Context({ latencyHint: 'interactive' });
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);

      this.filter = this.context.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 420;
      this.filter.Q.value = 0.9;
      this.filter.connect(this.master);

      const bedGain = this.context.createGain();
      bedGain.gain.value = 0.055;
      bedGain.connect(this.filter);

      this.sub = this.context.createOscillator();
      this.sub.type = 'sine';
      this.sub.frequency.value = 43.65;
      this.sub.connect(bedGain);
      this.sub.start();

      this.carrier = this.context.createOscillator();
      this.carrier.type = 'triangle';
      this.carrier.frequency.value = 87.31;
      const carrierGain = this.context.createGain();
      carrierGain.gain.value = 0.022;
      this.carrier.connect(carrierGain).connect(this.filter);
      this.carrier.start();

      this.pulse = this.context.createOscillator();
      this.pulse.type = 'sawtooth';
      this.pulse.frequency.value = 65.41;
      const pulseGain = this.context.createGain();
      pulseGain.gain.value = 0.007;
      this.pulse.connect(pulseGain).connect(this.filter);
      this.pulse.start();

      this.lfo = this.context.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.value = 0.18;
      this.lfoGain = this.context.createGain();
      this.lfoGain.gain.value = 140;
      this.lfo.connect(this.lfoGain).connect(this.filter.frequency);
      this.lfo.start();

      const noiseSource = this.context.createBufferSource();
      const noiseFilter = this.context.createBiquadFilter();
      const noiseGain = this.context.createGain();
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
      const samples = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < samples.length; index += 1) {
        previous = previous * 0.982 + (Math.random() * 2 - 1) * 0.018;
        samples[index] = previous * 0.52;
      }
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 640;
      noiseFilter.Q.value = 0.48;
      noiseGain.gain.value = 0.018;
      noiseSource.connect(noiseFilter).connect(noiseGain).connect(this.filter);
      noiseSource.start();

      for (let index = 0; index < 8; index += 1) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = index % 3 === 0 ? 'sine' : index % 3 === 1 ? 'triangle' : 'square';
        gain.gain.value = 0.0001;
        oscillator.connect(gain).connect(this.filter);
        oscillator.start();
        this.voices.push({ oscillator, gain });
      }

      this.timer = window.setInterval(() => this.update(), 40);
      return true;
    }

    setEnabled(next) {
      if (!this.context && !this.build()) return;
      void this.context.resume();
      this.enabled = Boolean(next);
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(this.enabled ? 0.17 : 0, now + (this.enabled ? 0.48 : 0.2));
      this.button.setAttribute('aria-pressed', String(this.enabled));
      const label = this.button.querySelector('span');
      if (label) label.textContent = this.enabled ? 'SOUND ON' : 'SOUND OFF';
      if (this.enabled) this.tone(880, 0.18, 0.035);
    }

    tone(frequency, duration, volume) {
      if (!this.enabled || !this.context || this.voices.length === 0) return;
      const voice = this.voices[this.voiceIndex];
      this.voiceIndex = (this.voiceIndex + 1) % this.voices.length;
      const now = this.context.currentTime;
      voice.oscillator.frequency.cancelScheduledValues(now);
      voice.oscillator.frequency.setValueAtTime(Math.max(28, frequency), now);
      voice.oscillator.frequency.exponentialRampToValueAtTime(Math.max(28, frequency * 0.68), now + duration);
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(0.0001, now);
      voice.gain.gain.exponentialRampToValueAtTime(volume, now + 0.006);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    sceneCue(scene) {
      const notes = [98, 146.83, 196, 73.42, 55, 246.94];
      this.tone(notes[scene] || 110, scene === 3 ? 0.34 : 0.22, scene === 3 ? 0.055 : 0.034);
    }

    dragCue() {
      this.tone(480 + Math.max(0, this.scene) * 48, 0.13, 0.022);
    }

    hover(target) {
      if (!this.enabled || !this.context) return;
      const now = performance.now();
      if (now - this.lastHover < 70) return;
      this.lastHover = now;
      const high = target.closest('.fx-plan-qr-link,.button,.header-buy,.fx-nextgen-xr') ? 1080 : 760;
      this.tone(high + Math.max(0, this.scene) * 20, 0.072, 0.012);
    }

    scheduleBeat(now, bpm, scene, speed) {
      if (this.nextBeat < now) this.nextBeat = now;
      if (now + 0.09 < this.nextBeat) return;
      const frequency = scene === 3 ? 72 + speed * 18 : scene === 4 ? 49 : 62 + scene * 3;
      const volume = scene === 3 ? 0.032 : 0.015;
      const voice = this.voices[this.voiceIndex];
      this.voiceIndex = (this.voiceIndex + 1) % this.voices.length;
      voice.oscillator.frequency.setValueAtTime(frequency, this.nextBeat);
      voice.oscillator.frequency.exponentialRampToValueAtTime(Math.max(28, frequency * 0.72), this.nextBeat + 0.12);
      voice.gain.gain.setValueAtTime(0.0001, this.nextBeat);
      voice.gain.gain.exponentialRampToValueAtTime(volume, this.nextBeat + 0.008);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, this.nextBeat + 0.15);
      this.nextBeat += 60 / bpm;
    }

    update() {
      if (!this.enabled || !this.context || !shared) return;
      const scene = Math.max(0, Math.min(5, Math.floor(Number(shared[SCENE] || 0) + 0.15)));
      const speed = Math.min(2, Math.abs(Number(shared[VELOCITY] || 0)));
      if (scene !== this.scene) {
        this.scene = scene;
        this.sceneCue(scene);
      }

      const now = this.context.currentTime;
      const bpm = 46 + speed * 42 + (scene === 3 ? 34 : scene === 1 ? 18 : 0);
      const subTarget = scene === 4 ? 36.71 : 42 + scene * 2.4 + speed * 4;
      const carrierTarget = scene === 3 ? 109 + speed * 14 : scene === 4 ? 55 : 82 + scene * 7;
      const cutoff = scene === 4 ? 260 + speed * 70 : 320 + scene * 105 + speed * 360;
      this.sub.frequency.setTargetAtTime(subTarget, now, 0.12);
      this.carrier.frequency.setTargetAtTime(carrierTarget, now, 0.1);
      this.pulse.frequency.setTargetAtTime(bpm / 60, now, 0.08);
      this.filter.frequency.setTargetAtTime(cutoff, now, 0.1);
      this.filter.Q.setTargetAtTime(scene === 3 ? 1.8 : 0.72 + speed * 0.22, now, 0.14);
      this.lfo.frequency.setTargetAtTime(0.1 + bpm / 480, now, 0.18);
      this.lfoGain.gain.setTargetAtTime(90 + scene * 24 + speed * 80, now, 0.18);
      this.scheduleBeat(now, bpm, scene, speed);
    }

    destroy() {
      if (this.timer) clearInterval(this.timer);
      this.timer = 0;
      this.voices.length = 0;
      if (this.context) void this.context.close();
    }
  }

  const soundButton = document.querySelector('.fx-three-sound');
  let soundtrack = null;
  if (soundButton instanceof HTMLButtonElement) {
    soundtrack = new GenerativeSoundtrack(soundButton);
    soundButton.addEventListener('click', event => {
      event.stopImmediatePropagation();
      soundtrack.setEnabled(!soundtrack.enabled);
    }, true);
    document.addEventListener('pointerover', event => {
      const target = event.target;
      if (target && target.closest && target.closest('a,button,.card,.price-card,.fx-plan-qr-card')) soundtrack.hover(target);
    }, true);
    document.addEventListener('pointerdown', event => {
      if (event.target && !event.target.closest('a,button,input,select,textarea')) soundtrack.dragCue();
    }, true);
  }

  const xrControls = document.createElement('div');
  xrControls.className = 'fx-nextgen-xr';
  xrControls.hidden = true;
  xrControls.innerHTML = '<button type="button" data-fx-xr="immersive-vr" hidden>ENTER VR</button><button type="button" data-fx-xr="immersive-ar" hidden>PLACE IN AR</button>';
  document.body.appendChild(xrControls);

  const frame = document.getElementById('fx-three-frame');
  const vrButton = xrControls.querySelector('[data-fx-xr="immersive-vr"]');
  const arButton = xrControls.querySelector('[data-fx-xr="immersive-ar"]');

  async function detectXr() {
    if (!navigator.xr || !isSecureContext) return;
    const vr = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false);
    const ar = await navigator.xr.isSessionSupported('immersive-ar').catch(() => false);
    if (vr && vrButton) vrButton.hidden = false;
    if (ar && arButton) arButton.hidden = false;
    xrControls.hidden = !(vr || ar);
    root.dataset.fxXrSupport = vr && ar ? 'vr-ar' : vr ? 'vr' : ar ? 'ar' : 'none';
  }

  xrControls.addEventListener('click', event => {
    const button = event.target.closest('[data-fx-xr]');
    if (!button || !(frame instanceof HTMLIFrameElement) || !frame.contentWindow) return;
    const mode = button.dataset.fxXr;
    frame.contentWindow.postMessage({ type: 'formatx:xr', mode }, location.origin);
  });

  addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    const data = event.data;
    if (!data || data.type !== 'formatx:xrstate') return;
    root.dataset.fxXr = data.state;
    const button = data.mode === 'immersive-ar' ? arButton : vrButton;
    if (button) {
      button.setAttribute('aria-pressed', String(data.state === 'presenting'));
      button.textContent = data.state === 'presenting'
        ? (data.mode === 'immersive-ar' ? 'AR ACTIVE' : 'VR ACTIVE')
        : (data.mode === 'immersive-ar' ? 'PLACE IN AR' : 'ENTER VR');
    }
  });

  void detectXr();

  addEventListener('pagehide', () => {
    if (soundtrack) soundtrack.destroy();
    xrControls.remove();
  }, { once: true });
}());
