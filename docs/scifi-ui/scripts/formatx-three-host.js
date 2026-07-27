(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  if (!body || root.dataset.fxThreeHost === 'ready') return;

  const I = Object.freeze({
    SCENE: 0,
    SCROLL: 1,
    VELOCITY: 2,
    POINTER_X: 3,
    POINTER_Y: 4,
    POINTER_VX: 5,
    POINTER_VY: 6,
    ORBIT_X: 7,
    ORBIT_Y: 8,
    SCALE: 9,
    WIDTH: 10,
    HEIGHT: 11,
    DPR: 12,
    REDUCED: 13,
    VISIBLE: 14,
    QUALITY_HINT: 15
  });

  const shared = new Float32Array(16);
  shared[I.SCALE] = 1;
  shared[I.WIDTH] = innerWidth;
  shared[I.HEIGHT] = innerHeight;
  shared[I.DPR] = devicePixelRatio || 1;
  shared[I.REDUCED] = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0;
  shared[I.VISIBLE] = document.hidden ? 0 : 1;
  shared[I.QUALITY_HINT] = matchMedia('(max-width: 820px), (pointer: coarse)').matches ? 1 : 2;

  Object.defineProperty(window, '__FORMATX_3D_STATE__', {
    configurable: true,
    enumerable: false,
    writable: false,
    value: shared
  });

  const sections = Array.from(document.querySelectorAll('main > .scene'));
  const chapterNames = {
    hu: ['MAG', 'IDEGRENDSZER', 'TERVEZÉS ÉS VÉGREHAJTÁS', 'KERESKEDELMI SZÍV', 'AI ASSZISZTENS', 'JELADÓ'],
    en: ['CORE', 'NERVOUS SYSTEM', 'PLAN & EXECUTE', 'COMMERCE HEART', 'AI ASSISTANT', 'RELEASE BEACON']
  };

  const shell = document.createElement('div');
  shell.className = 'fx-three-stage-shell';
  shell.setAttribute('aria-hidden', 'true');
  const frame = document.createElement('iframe');
  frame.id = 'fx-three-frame';
  frame.title = 'FormatX real-time three-dimensional system engine';
  frame.src = './three-stage.html?v=20260727-three-6';
  frame.tabIndex = -1;
  frame.loading = 'eager';
  frame.referrerPolicy = 'no-referrer';
  shell.appendChild(frame);
  body.prepend(shell);

  const telemetry = document.createElement('aside');
  telemetry.className = 'fx-three-telemetry';
  telemetry.setAttribute('aria-live', 'polite');
  telemetry.innerHTML = '<span>FORMATX / REAL 3D</span><strong data-fx-three-chapter>MAG</strong><small data-fx-three-telemetry>THREE / INITIALISING</small>';
  body.appendChild(telemetry);

  const guide = document.createElement('div');
  guide.className = 'fx-three-guide';
  guide.setAttribute('aria-hidden', 'true');
  guide.innerHTML = '<i></i><span>DRAG CORE</span><b>SCROLL TO TRAVEL</b>';
  body.appendChild(guide);

  const soundButton = document.createElement('button');
  soundButton.type = 'button';
  soundButton.className = 'fx-three-sound';
  soundButton.setAttribute('aria-pressed', 'false');
  soundButton.setAttribute('aria-label', root.lang === 'en' ? 'Enable sound design' : 'Hangdizájn bekapcsolása');
  soundButton.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>SOUND OFF</span>';
  body.appendChild(soundButton);

  root.dataset.fxThreeHost = 'ready';
  root.dataset.fxThree = 'loading';
  root.dataset.fxTranscend = 'ready';
  root.dataset.fxPerformance = 'balanced';
  root.dataset.fxInfinite = 'ready';

  let activeScene = -1;
  let previousScrollY = scrollY;
  let velocity = 0;
  let pointerX = innerWidth * 0.5;
  let pointerY = innerHeight * 0.5;
  let previousPointerX = pointerX;
  let previousPointerY = pointerY;
  let orbitX = 0;
  let orbitY = 0;
  let targetOrbitX = 0;
  let targetOrbitY = 0;
  let scale = 1;
  let targetScale = 1;
  let dragPointer = -1;
  let dragX = 0;
  let dragY = 0;
  let dragMode = false;
  let horizontalTouch = false;
  let loopTransfer = false;
  let loopCount = 0;
  let loop = null;
  let raf = 0;
  const touchIds = [-1, -1];
  const touchX = [0, 0];
  const touchY = [0, 0];
  let pinchDistance = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const isInteractive = target => Boolean(target && target.closest && target.closest('a,button,input,select,textarea,[contenteditable="true"],[role="button"]'));
  const language = () => root.lang === 'en' ? 'en' : 'hu';

  function installInfiniteLoop() {
    const hero = document.getElementById('hero');
    if (!hero) return null;
    document.querySelectorAll('.fx-three-loop-bridge,.fx-transcend-loop-bridge').forEach(node => node.remove());
    const clone = hero.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('aria-labelledby');
    clone.classList.add('fx-three-loop-bridge');
    clone.dataset.fxLoopBridge = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.querySelectorAll('[data-reveal]').forEach(node => {
      node.removeAttribute('data-reveal');
      node.classList.add('visible');
    });
    clone.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1'));
    const continuum = document.createElement('div');
    continuum.className = 'fx-three-continuum';
    continuum.innerHTML = '<span>∞</span><b>CONTINUUM</b><small>BEACON → CORE</small>';
    clone.appendChild(continuum);
    body.appendChild(clone);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    return { hero, clone };
  }

  loop = installInfiniteLoop();

  function localProgress(section) {
    if (!section) return 0;
    const start = section.offsetTop - innerHeight * 0.5;
    return clamp((scrollY - start) / Math.max(1, section.offsetHeight), 0, 0.999);
  }

  function updateSceneState() {
    const viewportCenter = scrollY + innerHeight * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;
    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      const center = section.offsetTop + section.offsetHeight * 0.5;
      const distance = Math.abs(center - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    }

    let scene = nearest + localProgress(sections[nearest]);
    if (loop && viewportCenter >= loop.clone.offsetTop) scene = 5 + localProgress(loop.clone);
    scene = clamp(scene, 0, 5.999);
    shared[I.SCENE] = scene > 5 ? 5 - Math.min(0.999, scene - 5) * 5 : scene;

    const chapter = Math.min(5, Math.max(0, Math.floor(scene + 0.12)));
    if (chapter !== activeScene) {
      activeScene = chapter;
      root.dataset.fxThreeScene = String(chapter);
      root.dataset.fxTranscendScene = String(chapter);
      const title = telemetry.querySelector('[data-fx-three-chapter]');
      if (title) title.textContent = chapterNames[language()][chapter];
      audio.sceneCue(chapter);
      root.classList.remove('fx-three-shock');
      void root.offsetWidth;
      root.classList.add('fx-three-shock');
      setTimeout(() => root.classList.remove('fx-three-shock'), 520);
    }
  }

  function updateScroll() {
    const current = scrollY;
    const delta = current - previousScrollY;
    previousScrollY = current;
    velocity = mix(velocity, clamp(delta / Math.max(1, innerHeight) * 18, -2, 2), 0.34);
    const cycleEnd = loop ? loop.clone.offsetTop : Math.max(1, document.documentElement.scrollHeight - innerHeight);
    shared[I.SCROLL] = current < cycleEnd ? clamp(current / Math.max(1, cycleEnd), 0, 1) : localProgress(loop && loop.clone);
    updateSceneState();
    transferLoopIfNeeded();
  }

  function transferLoopIfNeeded() {
    if (!loop || loopTransfer) return;
    const progress = localProgress(loop.clone);
    if (progress < 0.79) return;
    loopTransfer = true;
    const relative = scrollY - loop.clone.offsetTop;
    root.classList.add('fx-three-loop-transfer');
    requestAnimationFrame(() => {
      scrollTo(0, loop.hero.offsetTop + relative);
      previousScrollY = scrollY;
      loopCount += 1;
      root.dataset.fxLoopCount = String(loopCount);
      updateSceneState();
      requestAnimationFrame(() => {
        root.classList.remove('fx-three-loop-transfer');
        loopTransfer = false;
        dispatchEvent(new CustomEvent('formatx:loop', { detail: { count: loopCount } }));
      });
    });
  }

  function pointerSlot(id) {
    if (touchIds[0] === id) return 0;
    if (touchIds[1] === id) return 1;
    return -1;
  }

  function addTouch(event) {
    if (event.pointerType !== 'touch') return;
    if (touchIds[0] < 0) {
      touchIds[0] = event.pointerId;
      touchX[0] = event.clientX;
      touchY[0] = event.clientY;
    } else if (touchIds[1] < 0 && touchIds[0] !== event.pointerId) {
      touchIds[1] = event.pointerId;
      touchX[1] = event.clientX;
      touchY[1] = event.clientY;
      pinchDistance = Math.hypot(touchX[0] - touchX[1], touchY[0] - touchY[1]);
    }
  }

  function removeTouch(id) {
    const slot = pointerSlot(id);
    if (slot < 0) return;
    touchIds[slot] = -1;
    if (slot === 0 && touchIds[1] >= 0) {
      touchIds[0] = touchIds[1];
      touchX[0] = touchX[1];
      touchY[0] = touchY[1];
      touchIds[1] = -1;
    }
    pinchDistance = 0;
  }

  function onPointerDown(event) {
    addTouch(event);
    if (isInteractive(event.target)) return;
    const inCoreZone = event.clientX > innerWidth * 0.18 && event.clientX < innerWidth * 0.84 && event.clientY > innerHeight * 0.1 && event.clientY < innerHeight * 0.9;
    if (!inCoreZone) return;
    if (event.pointerType === 'mouse' && event.button === 0) {
      dragPointer = event.pointerId;
      dragX = event.clientX;
      dragY = event.clientY;
      dragMode = true;
      root.classList.add('fx-three-dragging');
      audio.dragCue();
    } else if (event.pointerType === 'touch' && touchIds[1] < 0) {
      dragPointer = event.pointerId;
      dragX = event.clientX;
      dragY = event.clientY;
      horizontalTouch = false;
    }
  }

  function onPointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    shared[I.POINTER_VX] = clamp((event.clientX - previousPointerX) / 40, -1.5, 1.5);
    shared[I.POINTER_VY] = clamp((event.clientY - previousPointerY) / 40, -1.5, 1.5);
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
    shared[I.POINTER_X] = event.clientX / Math.max(1, innerWidth) * 2 - 1;
    shared[I.POINTER_Y] = -(event.clientY / Math.max(1, innerHeight) * 2 - 1);

    const slot = pointerSlot(event.pointerId);
    if (slot >= 0) {
      touchX[slot] = event.clientX;
      touchY[slot] = event.clientY;
      if (touchIds[0] >= 0 && touchIds[1] >= 0) {
        const distance = Math.hypot(touchX[0] - touchX[1], touchY[0] - touchY[1]);
        if (pinchDistance > 0) targetScale = clamp(targetScale * (distance / pinchDistance), 0.78, 1.28);
        pinchDistance = distance;
      }
    }

    if (event.pointerId !== dragPointer) return;
    const dx = event.clientX - dragX;
    const dy = event.clientY - dragY;
    if (event.pointerType === 'touch' && !dragMode) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        dragMode = true;
        horizontalTouch = true;
        root.classList.add('fx-three-dragging');
      } else if (Math.abs(dy) > 9) {
        dragPointer = -1;
        return;
      }
    }
    if (!dragMode) return;
    dragX = event.clientX;
    dragY = event.clientY;
    targetOrbitX += dx * 0.0038;
    targetOrbitY = clamp(targetOrbitY + dy * 0.0026, -0.48, 0.48);
    if (horizontalTouch && event.cancelable) event.preventDefault();
  }

  function releasePointer(event) {
    removeTouch(event.pointerId);
    if (event.pointerId !== dragPointer) return;
    dragPointer = -1;
    dragMode = false;
    horizontalTouch = false;
    root.classList.remove('fx-three-dragging');
  }

  class AudioManager {
    constructor() {
      this.context = null;
      this.master = null;
      this.hum = null;
      this.pulse = null;
      this.filter = null;
      this.enabled = false;
      this.voices = [];
      this.voiceIndex = 0;
      this.lastHover = 0;
    }

    build() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext({ latencyHint: 'interactive' });
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      this.hum = this.context.createOscillator();
      const humGain = this.context.createGain();
      this.hum.type = 'sine';
      this.hum.frequency.value = 43.65;
      humGain.gain.value = 0.065;
      this.hum.connect(humGain).connect(this.master);
      this.hum.start();
      this.pulse = this.context.createOscillator();
      const pulseGain = this.context.createGain();
      this.pulse.type = 'triangle';
      this.pulse.frequency.value = 65.41;
      pulseGain.gain.value = 0.014;
      this.pulse.connect(pulseGain).connect(this.master);
      this.pulse.start();
      const noise = this.context.createBufferSource();
      const noiseGain = this.context.createGain();
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
      const samples = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < samples.length; index += 1) {
        previous = previous * 0.985 + (Math.random() * 2 - 1) * 0.015;
        samples[index] = previous * 0.55;
      }
      noise.buffer = buffer;
      noise.loop = true;
      this.filter = this.context.createBiquadFilter();
      this.filter.type = 'bandpass';
      this.filter.frequency.value = 280;
      this.filter.Q.value = 0.7;
      noiseGain.gain.value = 0.022;
      noise.connect(this.filter).connect(noiseGain).connect(this.master);
      noise.start();
      for (let index = 0; index < 6; index += 1) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = index % 2 ? 'triangle' : 'sine';
        gain.gain.value = 0;
        oscillator.connect(gain).connect(this.master);
        oscillator.start();
        this.voices.push({ oscillator, gain });
      }
      return true;
    }

    setEnabled(next) {
      if (!this.context && !this.build()) return;
      this.context.resume();
      this.enabled = next;
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.linearRampToValueAtTime(next ? 0.18 : 0, now + (next ? 0.62 : 0.24));
      soundButton.setAttribute('aria-pressed', String(next));
      soundButton.querySelector('span').textContent = next ? 'SOUND ON' : 'SOUND OFF';
      soundButton.setAttribute('aria-label', next ? (language() === 'en' ? 'Disable sound design' : 'Hangdizájn kikapcsolása') : (language() === 'en' ? 'Enable sound design' : 'Hangdizájn bekapcsolása'));
      if (next) this.tone(740, 0.22, 0.05);
    }

    tone(frequency, duration, volume) {
      if (!this.enabled || !this.context || !this.voices.length) return;
      const voice = this.voices[this.voiceIndex];
      this.voiceIndex = (this.voiceIndex + 1) % this.voices.length;
      const now = this.context.currentTime;
      voice.oscillator.frequency.cancelScheduledValues(now);
      voice.oscillator.frequency.setValueAtTime(frequency, now);
      voice.oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.72), now + duration);
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(0.0001, now);
      voice.gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    sceneCue(scene) {
      const notes = [98, 146.83, 196, 73.42, 123.47, 246.94];
      this.tone(notes[scene] || 110, scene === 3 ? 0.38 : 0.25, scene === 3 ? 0.065 : 0.042);
    }

    dragCue() {
      this.tone(520 + Math.max(0, activeScene) * 44, 0.16, 0.03);
    }

    hover(target) {
      if (!this.enabled || !this.context) return;
      const now = performance.now();
      if (now - this.lastHover < 75) return;
      this.lastHover = now;
      const high = target.closest('.fx-plan-qr-link,.button,.header-buy') ? 1020 : 760;
      this.tone(high + Math.max(0, activeScene) * 22, 0.085, 0.015);
    }

    update() {
      if (!this.enabled || !this.context) return;
      const now = this.context.currentTime;
      this.hum.frequency.setTargetAtTime(42 + Math.max(0, activeScene) * 2.5 + Math.abs(velocity) * 4, now, 0.12);
      this.pulse.frequency.setTargetAtTime(activeScene === 3 ? 72 + Math.sin(performance.now() * 0.004) * 3 : 61 + Math.max(0, activeScene) * 2.2, now, 0.16);
      this.filter.frequency.setTargetAtTime(240 + Math.max(0, activeScene) * 62 + Math.abs(velocity) * 280, now, 0.09);
    }

    destroy() {
      if (this.context) this.context.close();
      this.voices.length = 0;
    }
  }

  const audio = new AudioManager();
  soundButton.addEventListener('click', () => audio.setEnabled(!audio.enabled));
  document.addEventListener('pointerover', event => {
    const target = event.target;
    if (target && target.closest && target.closest('a,button,.card,.price-card,.fx-plan-qr-card')) audio.hover(target);
  }, true);

  function animate() {
    velocity *= 0.9;
    orbitX = mix(orbitX, targetOrbitX, dragMode ? 0.18 : 0.07);
    orbitY = mix(orbitY, targetOrbitY, dragMode ? 0.18 : 0.07);
    scale = mix(scale, targetScale, 0.09);
    shared[I.VELOCITY] = velocity;
    shared[I.ORBIT_X] = orbitX;
    shared[I.ORBIT_Y] = orbitY;
    shared[I.SCALE] = scale;
    shared[I.POINTER_VX] *= 0.82;
    shared[I.POINTER_VY] *= 0.82;
    audio.update();
    raf = requestAnimationFrame(animate);
  }

  function updateViewport() {
    shared[I.WIDTH] = innerWidth;
    shared[I.HEIGHT] = innerHeight;
    shared[I.DPR] = devicePixelRatio || 1;
    updateScroll();
  }

  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateViewport, { passive: true });
  addEventListener('pointerdown', onPointerDown, { passive: true });
  addEventListener('pointermove', onPointerMove, { passive: false });
  addEventListener('pointerup', releasePointer, { passive: true });
  addEventListener('pointercancel', releasePointer, { passive: true });
  addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') releasePointer(event);
    shared[I.POINTER_X] = 0;
    shared[I.POINTER_Y] = 0;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    shared[I.VISIBLE] = document.hidden ? 0 : 1;
  });
  document.addEventListener('formatx:languagechange', () => {
    const title = telemetry.querySelector('[data-fx-three-chapter]');
    if (title && activeScene >= 0) title.textContent = chapterNames[language()][activeScene];
  });
  frame.addEventListener('load', () => root.classList.add('fx-three-frame-loaded'), { once: true });
  addEventListener('formatx:threeready', () => root.classList.add('fx-three-engine-ready'), { once: true });

  updateViewport();
  updateSceneState();
  animate();

  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    audio.destroy();
    try { delete window.__FORMATX_3D_STATE__; } catch (_) {}
  }, { once: true });
}());
