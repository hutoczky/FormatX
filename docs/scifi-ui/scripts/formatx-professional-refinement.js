(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxProfessionalRefinement === 'ready') return;
  root.dataset.fxProfessionalRefinement = 'ready';

  function enforceFullscreenConsoleState(consoleRoot) {
    if (!(consoleRoot instanceof HTMLElement)) return;
    const sync = () => {
      if (consoleRoot.hidden) consoleRoot.style.setProperty('display', 'none', 'important');
      else consoleRoot.style.removeProperty('display');
    };
    sync();
    new MutationObserver(sync).observe(consoleRoot, { attributes: true, attributeFilter: ['hidden'] });
  }

  function watchConsole() {
    const existing = document.getElementById('fx-organism-console');
    if (existing) {
      enforceFullscreenConsoleState(existing);
      return;
    }
    const observer = new MutationObserver(() => {
      const consoleRoot = document.getElementById('fx-organism-console');
      if (!consoleRoot) return;
      observer.disconnect();
      enforceFullscreenConsoleState(consoleRoot);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  class ProfessionalAudioLayer {
    constructor() {
      this.context = null;
      this.master = null;
      this.hum = null;
      this.harmonic = null;
      this.noiseFilter = null;
      this.enabled = false;
      this.lastScene = -1;
      this.lastToneAt = 0;
    }

    build() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;

      this.context = new AudioContext({ latencyHint: 'interactive' });
      this.master = this.context.createGain();
      this.master.gain.value = 0;

      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.008;
      compressor.release.value = 0.22;
      this.master.connect(compressor).connect(this.context.destination);

      this.hum = this.context.createOscillator();
      const humGain = this.context.createGain();
      this.hum.type = 'sine';
      this.hum.frequency.value = 46.25;
      humGain.gain.value = 0.16;
      this.hum.connect(humGain).connect(this.master);
      this.hum.start();

      this.harmonic = this.context.createOscillator();
      const harmonicGain = this.context.createGain();
      this.harmonic.type = 'triangle';
      this.harmonic.frequency.value = 92.5;
      harmonicGain.gain.value = 0.034;
      this.harmonic.connect(harmonicGain).connect(this.master);
      this.harmonic.start();

      const noise = this.context.createBufferSource();
      const noiseGain = this.context.createGain();
      const length = this.context.sampleRate * 2;
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const samples = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < samples.length; index += 1) {
        previous = previous * 0.972 + (Math.random() * 2 - 1) * 0.028;
        samples[index] = previous * 0.48;
      }
      noise.buffer = buffer;
      noise.loop = true;
      this.noiseFilter = this.context.createBiquadFilter();
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.value = 540;
      this.noiseFilter.Q.value = 0.72;
      noiseGain.gain.value = 0.052;
      noise.connect(this.noiseFilter).connect(noiseGain).connect(this.master);
      noise.start();

      return true;
    }

    async setEnabled(next) {
      if (!this.context && !this.build()) return;
      try { await this.context.resume(); } catch (_) {}
      this.enabled = Boolean(next);
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(this.enabled ? 0.34 : 0.0001, now + (this.enabled ? 0.48 : 0.2));
      if (this.enabled) this.tone(680, 0.24, 0.18);
    }

    tone(frequency, duration, volume) {
      if (!this.enabled || !this.context || !this.master) return;
      const nowMs = performance.now();
      if (nowMs - this.lastToneAt < 55) return;
      this.lastToneAt = nowMs;

      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(42, frequency * 0.68), this.context.currentTime + duration);
      gain.gain.setValueAtTime(0.0001, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, this.context.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
      oscillator.connect(gain).connect(this.master);
      oscillator.start();
      oscillator.stop(this.context.currentTime + duration + 0.04);
    }

    updateScene(scene) {
      if (!this.enabled || !this.context || scene === this.lastScene) return;
      this.lastScene = scene;
      const notes = [164.81, 196, 246.94, 130.81, 220, 293.66];
      const now = this.context.currentTime;
      this.hum.frequency.setTargetAtTime(44 + scene * 3.2, now, 0.18);
      this.harmonic.frequency.setTargetAtTime(88 + scene * 6.4, now, 0.2);
      this.noiseFilter.frequency.setTargetAtTime(440 + scene * 95, now, 0.16);
      this.tone(notes[scene] || 174.61, scene === 3 ? 0.34 : 0.25, scene === 3 ? 0.17 : 0.12);
    }

    destroy() {
      if (this.context) this.context.close();
      this.context = null;
    }
  }

  function installAudioLayer() {
    const audio = new ProfessionalAudioLayer();

    document.addEventListener('click', event => {
      const button = event.target.closest('.fx-three-sound');
      if (!button) return;
      const enabled = button.getAttribute('aria-pressed') === 'true';
      void audio.setEnabled(enabled);
      root.dataset.fxAudioLevel = enabled ? 'audible' : 'off';
    });

    document.addEventListener('pointerdown', event => {
      if (!audio.enabled) return;
      const target = event.target.closest('a,button,.fx-organism-chapter-trigger,.card,.price-card');
      if (!target || target.closest('.fx-three-sound')) return;
      const strong = Boolean(target.closest('.button,.fx-organism-chapter-trigger,.fx-organism-console-nav'));
      audio.tone(strong ? 840 : 620, strong ? 0.12 : 0.09, strong ? 0.075 : 0.045);
    }, true);

    const sceneObserver = new MutationObserver(() => {
      const scene = Number(root.dataset.fxThreeScene || root.dataset.fxScene || 0);
      audio.updateScene(Number.isFinite(scene) ? Math.max(0, Math.min(5, Math.round(scene))) : 0);
    });
    sceneObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three-scene', 'data-fx-scene'] });

    document.addEventListener('visibilitychange', () => {
      if (!audio.context) return;
      if (document.hidden) audio.context.suspend();
      else if (audio.enabled) audio.context.resume();
    });

    addEventListener('pagehide', () => {
      sceneObserver.disconnect();
      audio.destroy();
    }, { once: true });
  }

  watchConsole();
  installAudioLayer();
}());
