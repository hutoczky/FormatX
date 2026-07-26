(function () {
  'use strict';

  const ROOT = document.documentElement;
  const BODY = document.body;
  const MOBILE = matchMedia('(max-width: 820px), (pointer: coarse)');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)');
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');

  if (!BODY || ROOT.dataset.fxWorldstageEnhancements === 'ready') return;

  const state = {
    visible: !document.hidden,
    scene: Number(ROOT.dataset.fxTranscendScene || 0),
    drag: false,
    dragX: 0,
    dragY: 0,
    orbitX: 0,
    orbitY: 0,
    targetOrbitX: 0,
    targetOrbitY: 0,
    inertiaX: 0,
    inertiaY: 0,
    pointerX: innerWidth * .5,
    pointerY: innerHeight * .5,
    pointerVX: 0,
    pointerVY: 0,
    lastPointerX: innerWidth * .5,
    lastPointerY: innerHeight * .5,
    scrollVelocity: 0,
    lastScrollY: scrollY,
    shock: 0,
    reduced: REDUCE.matches
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const interactive = target => Boolean(target && target.closest && target.closest('a,button,input,select,textarea,[contenteditable="true"]'));

  function installOverlay() {
    document.querySelectorAll('.fx-worldstage-flow,.fx-worldstage-shock,.fx-worldstage-guide').forEach(node => node.remove());
    const canvas = document.createElement('canvas');
    canvas.className = 'fx-worldstage-flow';
    canvas.setAttribute('aria-hidden', 'true');
    BODY.appendChild(canvas);

    const shock = document.createElement('div');
    shock.className = 'fx-worldstage-shock';
    shock.setAttribute('aria-hidden', 'true');
    BODY.appendChild(shock);

    const guide = document.createElement('div');
    guide.className = 'fx-worldstage-guide';
    guide.setAttribute('aria-hidden', 'true');
    guide.innerHTML = '<i></i><span>DRAG THE CORE</span><b>SCROLL TO TRAVEL</b>';
    BODY.appendChild(guide);
    return { canvas, shock, guide };
  }

  function createFlowField(canvas) {
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return null;
    const count = state.reduced ? 20 : (MOBILE.matches ? 64 : 150);
    const particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: 0,
      vy: 0,
      life: Math.random(),
      depth: .18 + Math.random() * .82,
      phase: index * 1.618 + Math.random()
    }));
    const trail = [];
    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let lastFrame = 0;

    function resize() {
      width = Math.max(1, innerWidth);
      height = Math.max(1, innerHeight);
      dpr = Math.min(devicePixelRatio || 1, MOBILE.matches ? 1 : 1.15);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function respawn(particle) {
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      particle.vx = 0;
      particle.vy = 0;
      particle.life = 1;
    }

    function addTrail() {
      const speed = Math.hypot(state.pointerVX, state.pointerVY);
      if (state.reduced || speed < 1.4) return;
      trail.push({ x: state.pointerX, y: state.pointerY, life: 1, size: 1.5 + Math.min(7, speed * .14) });
      if (trail.length > (MOBILE.matches ? 20 : 44)) trail.shift();
    }

    function draw(now) {
      frame = requestAnimationFrame(draw);
      if (!state.visible || now - lastFrame < 33) return;
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';
      addTrail();

      particles.forEach((particle, index) => {
        const dx = particle.x - state.pointerX;
        const dy = particle.y - state.pointerY;
        const distance = Math.hypot(dx, dy) + 1;
        const swirl = Math.sin(particle.phase + now * .00035 + state.scene) * .017;
        particle.vx += Math.cos(particle.phase + now * .00017) * .011 + state.scrollVelocity * .018;
        particle.vy += Math.sin(particle.phase + now * .00019) * .009 - state.scrollVelocity * .006;
        if (distance < 240) {
          const force = (1 - distance / 240) * (.17 + Math.hypot(state.pointerVX, state.pointerVY) * .0015);
          particle.vx += (-dy / distance) * force + (dx / distance) * swirl;
          particle.vy += (dx / distance) * force + (dy / distance) * swirl;
        }
        particle.vx *= .974;
        particle.vy *= .974;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= .0017 + particle.depth * .0008;
        if (particle.x < -50 || particle.x > width + 50 || particle.y < -50 || particle.y > height + 50 || particle.life <= 0) respawn(particle);
        const speed = Math.hypot(particle.vx, particle.vy);
        context.strokeStyle = 'hsla(' + (188 + particle.depth * 74 + state.scene * 8) + ',92%,72%,' + (.04 + particle.depth * .18) + ')';
        context.lineWidth = .4 + particle.depth * .85;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - particle.vx * (5 + speed * 1.8), particle.y - particle.vy * (5 + speed * 1.8));
        context.stroke();
      });

      trail.forEach(point => {
        point.life *= .87;
        context.fillStyle = 'rgba(108,231,255,' + (.17 * point.life) + ')';
        context.beginPath();
        context.arc(point.x, point.y, point.size * point.life, 0, Math.PI * 2);
        context.fill();
      });
      while (trail.length && trail[0].life < .04) trail.shift();
      context.globalCompositeOperation = 'source-over';
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    frame = requestAnimationFrame(draw);
    return { destroy() { cancelAnimationFrame(frame); } };
  }

  function createSoundDesign() {
    const oldButton = document.querySelector('.fx-transcend-sound');
    if (oldButton) oldButton.remove();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fx-transcend-sound fx-worldstage-sound';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', ROOT.lang === 'en' ? 'Enable sound design' : 'Hangdizájn bekapcsolása');
    button.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>SOUND OFF</span>';
    BODY.appendChild(button);

    let context = null;
    let master = null;
    let hum = null;
    let pulse = null;
    let filter = null;
    let noiseGain = null;
    let enabled = false;
    let lastHover = 0;

    function buildNoiseBuffer() {
      const length = context.sampleRate * 2;
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i += 1) {
        last = last * .985 + (Math.random() * 2 - 1) * .015;
        data[i] = last * .65;
      }
      return buffer;
    }

    function build() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      hum = context.createOscillator();
      const humGain = context.createGain();
      hum.type = 'sine';
      hum.frequency.value = 43.65;
      humGain.gain.value = .075;
      hum.connect(humGain).connect(master);
      hum.start();

      pulse = context.createOscillator();
      const pulseGain = context.createGain();
      pulse.type = 'triangle';
      pulse.frequency.value = 65.41;
      pulseGain.gain.value = .017;
      pulse.connect(pulseGain).connect(master);
      pulse.start();

      const noise = context.createBufferSource();
      noise.buffer = buildNoiseBuffer();
      noise.loop = true;
      filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 280;
      filter.Q.value = .7;
      noiseGain = context.createGain();
      noiseGain.gain.value = .03;
      noise.connect(filter).connect(noiseGain).connect(master);
      noise.start();
      return true;
    }

    function tone(frequency, duration, volume, type) {
      if (!enabled || !context) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * .72), context.currentTime + duration);
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
      oscillator.connect(gain).connect(master);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + .03);
    }

    function setEnabled(next) {
      if (!context && !build()) return;
      context.resume();
      enabled = next;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(enabled ? .24 : 0, context.currentTime + (enabled ? .65 : .25));
      button.setAttribute('aria-pressed', String(enabled));
      button.querySelector('span').textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
      button.setAttribute('aria-label', enabled ? (ROOT.lang === 'en' ? 'Disable sound design' : 'Hangdizájn kikapcsolása') : (ROOT.lang === 'en' ? 'Enable sound design' : 'Hangdizájn bekapcsolása'));
      if (enabled) tone(740, .24, .075, 'sine');
    }

    function sceneCue(index) {
      if (!enabled || !context) return;
      const notes = [98, 146.83, 196, 73.42, 123.47, 246.94];
      tone(notes[index] || 110, index === 3 ? .42 : .3, index === 3 ? .085 : .05, index === 3 ? 'triangle' : 'sine');
      if (index === 3) setTimeout(() => tone(73.42, .36, .065, 'sine'), 180);
    }

    function hoverCue(target) {
      if (!enabled || !context) return;
      const now = performance.now();
      if (now - lastHover < 72) return;
      lastHover = now;
      const high = target.closest('.fx-plan-qr-link,.button,.header-license') ? 980 : 730;
      tone(high + state.scene * 28, .105, .023, 'sine');
    }

    function update() {
      if (!enabled || !context) return;
      const now = context.currentTime;
      hum.frequency.setTargetAtTime(42 + state.scene * 2.4 + Math.abs(state.scrollVelocity) * 5, now, .12);
      pulse.frequency.setTargetAtTime(state.scene === 3 ? 72 + Math.sin(performance.now() * .004) * 3 : 61 + state.scene * 2.2, now, .16);
      filter.frequency.setTargetAtTime(240 + state.scene * 65 + Math.abs(state.scrollVelocity) * 320, now, .08);
      noiseGain.gain.setTargetAtTime(.02 + Math.abs(state.scrollVelocity) * .018, now, .1);
    }

    button.addEventListener('click', () => setEnabled(!enabled));
    document.addEventListener('pointerenter', event => {
      if (event.target.closest('a,button,.card,.price-card,.fx-plan-qr-card')) hoverCue(event.target);
    }, true);

    return {
      sceneCue,
      update,
      dragCue() { tone(520 + state.scene * 60, .18, .04, 'triangle'); },
      destroy() { if (context) context.close(); }
    };
  }

  function triggerShock(strength) {
    state.shock = Math.max(state.shock, strength || .7);
    ROOT.style.setProperty('--fx-worldstage-shock', state.shock.toFixed(3));
    ROOT.classList.remove('fx-worldstage-shocking');
    void ROOT.offsetWidth;
    ROOT.classList.add('fx-worldstage-shocking');
    setTimeout(() => ROOT.classList.remove('fx-worldstage-shocking'), 560);
  }

  function updateScene(next, sound) {
    const index = clamp(Number(next) || 0, 0, 5);
    if (index === state.scene) return;
    state.scene = index;
    ROOT.dataset.fxWorldstageScene = String(index);
    triggerShock(index === 3 ? .95 : .72);
    sound.sceneCue(index);
  }

  function bindInteractions(sound) {
    addEventListener('pointermove', event => {
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      state.pointerVX = event.clientX - state.lastPointerX;
      state.pointerVY = event.clientY - state.lastPointerY;
      state.lastPointerX = event.clientX;
      state.lastPointerY = event.clientY;
      if (state.drag) {
        const dx = event.clientX - state.dragX;
        const dy = event.clientY - state.dragY;
        state.dragX = event.clientX;
        state.dragY = event.clientY;
        state.targetOrbitX += dx * .13;
        state.targetOrbitY = clamp(state.targetOrbitY - dy * .11, -24, 24);
        state.inertiaX = dx * .012;
        state.inertiaY = -dy * .01;
      }
    }, { passive: true });

    addEventListener('pointerdown', event => {
      if (!FINE.matches || state.reduced || event.button !== 0 || interactive(event.target)) return;
      state.drag = true;
      state.dragX = event.clientX;
      state.dragY = event.clientY;
      ROOT.classList.add('fx-worldstage-dragging');
      sound.dragCue();
    });

    function release() {
      if (!state.drag) return;
      state.drag = false;
      ROOT.classList.remove('fx-worldstage-dragging');
      triggerShock(.46);
    }

    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);
    addEventListener('pointerleave', release);

    addEventListener('scroll', () => {
      const delta = scrollY - state.lastScrollY;
      state.lastScrollY = scrollY;
      state.scrollVelocity = mix(state.scrollVelocity, clamp(delta / Math.max(1, innerHeight) * 16, -1.8, 1.8), .34);
    }, { passive: true });

    document.addEventListener('click', event => {
      if (event.target.closest('.main-nav a,a[href^="#"]')) triggerShock(.82);
    });

    const sceneObserver = new MutationObserver(entries => {
      if (entries.some(entry => entry.attributeName === 'data-fx-transcend-scene')) updateScene(ROOT.dataset.fxTranscendScene, sound);
    });
    sceneObserver.observe(ROOT, { attributes: true, attributeFilter: ['data-fx-transcend-scene'] });
    document.addEventListener('visibilitychange', () => { state.visible = !document.hidden; });

    return { destroy() { sceneObserver.disconnect(); } };
  }

  function animate(sound) {
    state.inertiaX *= .92;
    state.inertiaY *= .9;
    if (!state.drag) {
      state.targetOrbitX += state.inertiaX;
      state.targetOrbitY = clamp(state.targetOrbitY + state.inertiaY, -24, 24);
    }
    state.orbitX = mix(state.orbitX, state.targetOrbitX, state.drag ? .18 : .075);
    state.orbitY = mix(state.orbitY, state.targetOrbitY, state.drag ? .18 : .075);
    state.scrollVelocity *= .9;
    state.pointerVX *= .82;
    state.pointerVY *= .82;
    state.shock *= .88;
    ROOT.style.setProperty('--fx-worldstage-orbit-x', state.orbitX.toFixed(3) + 'deg');
    ROOT.style.setProperty('--fx-worldstage-orbit-y', state.orbitY.toFixed(3) + 'deg');
    ROOT.style.setProperty('--fx-worldstage-shock', state.shock.toFixed(3));
    sound.update();
    requestAnimationFrame(() => animate(sound));
  }

  function start() {
    const overlay = installOverlay();
    const flow = createFlowField(overlay.canvas);
    const sound = createSoundDesign();
    const interactions = bindInteractions(sound);
    ROOT.dataset.fxWorldstageScene = String(state.scene);
    ROOT.dataset.fxWorldstageEnhancements = 'ready';
    ROOT.dataset.fxWorldstage = 'ready';
    animate(sound);
    dispatchEvent(new CustomEvent('formatx:worldstageenhanced', { detail: { drag3d: true, audio: true, flow: true, scrollytelling: true } }));

    addEventListener('pagehide', () => {
      flow?.destroy();
      sound.destroy();
      interactions.destroy();
    }, { once: true });
  }

  if (ROOT.dataset.fxTranscend === 'ready') start();
  else addEventListener('formatx:transcendready', start, { once: true });
}());
