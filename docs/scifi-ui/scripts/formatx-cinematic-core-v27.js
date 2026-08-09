(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v27';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  if (root.dataset.fxCinematicCore === VERSION) return;

  let stage = null;
  let hero = null;
  let overlay = null;
  let frame = 0;
  let last = performance.now();
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let energy = .28;
  let targetEnergy = .28;
  let impulse = 0;
  let active = true;
  let observer = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;

  function createOverlay() {
    if (!stage || overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'fx-cinematic-core-v27';
    overlay.dataset.fxCinematicCore = VERSION;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<span class="fx-cinematic-core-v27__halo"></span>',
      '<span class="fx-cinematic-core-v27__orbit fx-cinematic-core-v27__orbit--a"></span>',
      '<span class="fx-cinematic-core-v27__orbit fx-cinematic-core-v27__orbit--b"></span>',
      '<span class="fx-cinematic-core-v27__orbit fx-cinematic-core-v27__orbit--c"></span>',
      '<span class="fx-cinematic-core-v27__flare"></span>',
      '<span class="fx-cinematic-core-v27__scan"></span>',
      '<span class="fx-cinematic-core-v27__pulse"></span>'
    ].join('');
    stage.appendChild(overlay);
  }

  function resolveStage() {
    stage = document.querySelector('.fx-reference-core-v26-stage');
    hero = document.getElementById('hero');
    if (!stage || !hero) return false;
    createOverlay();
    stage.dataset.fxCinematicInteraction = VERSION;
    root.dataset.fxCinematicCore = VERSION;
    return true;
  }

  function pointerPosition(event) {
    if (!stage || !hero) return;
    const rect = hero.getBoundingClientRect();
    const px = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const py = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    targetX = (px - .5) * 2;
    targetY = (py - .44) * 2;
    const distance = Math.hypot(targetX * .78, targetY * .72);
    targetEnergy = clamp(.34 + (1 - Math.min(1, distance)) * .58, .34, .92);
  }

  function onPointerMove(event) {
    if (!active) return;
    pointerPosition(event);
  }

  function onPointerDown(event) {
    if (!hero?.contains(event.target)) return;
    pointerPosition(event);
    impulse = 1;
    targetEnergy = 1;
    stage?.setAttribute('data-fx-cinematic-pulse', 'true');
    clearTimeout(onPointerDown.timer);
    onPointerDown.timer = setTimeout(() => stage?.removeAttribute('data-fx-cinematic-pulse'), 620);
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
    targetEnergy = .28;
  }

  function updateActiveState() {
    if (!hero || !stage) return;
    const rect = hero.getBoundingClientRect();
    const vh = Math.max(1, innerHeight);
    active = !document.hidden && rect.bottom > -vh * .12 && rect.top < vh * .98;
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (!stage || !overlay || !active) {
      last = now;
      return;
    }

    const dt = Math.min(40, now - last || 16.7);
    last = now;
    const response = 1 - Math.pow(.0009, dt / 1000);
    const motionScale = reduced.matches ? .18 : 1;
    const mobileScale = coarse.matches ? .72 : 1;

    x = lerp(x, targetX, response * .95);
    y = lerp(y, targetY, response * .95);
    energy = lerp(energy, targetEnergy + impulse * .42, response * .72);
    impulse *= Math.pow(.018, dt / 1000);
    energy = clamp(energy, .22, 1.18);

    const parallaxX = x * 13 * mobileScale * motionScale;
    const parallaxY = y * 8 * mobileScale * motionScale;
    const tiltX = -y * 2.4 * mobileScale * motionScale;
    const tiltY = x * 3.4 * mobileScale * motionScale;
    const pointerXPct = 50 + x * 9 * mobileScale;
    const pointerYPct = 44 + y * 5 * mobileScale;

    stage.style.setProperty('--fx-core-parallax-x', parallaxX.toFixed(3));
    stage.style.setProperty('--fx-core-parallax-y', parallaxY.toFixed(3));
    stage.style.setProperty('--fx-core-tilt-x', `${tiltX.toFixed(3)}deg`);
    stage.style.setProperty('--fx-core-tilt-y', `${tiltY.toFixed(3)}deg`);
    stage.style.setProperty('--fx-core-pointer-x', `${pointerXPct.toFixed(2)}%`);
    stage.style.setProperty('--fx-core-pointer-y', `${pointerYPct.toFixed(2)}%`);
    stage.style.setProperty('--fx-core-energy', energy.toFixed(3));
  }

  function init() {
    if (!resolveStage()) {
      observer = new MutationObserver(() => {
        if (!resolveStage()) return;
        observer?.disconnect();
        observer = null;
        updateActiveState();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    addEventListener('pointermove', onPointerMove, { passive: true });
    addEventListener('pointerdown', onPointerDown, { passive: true });
    addEventListener('pointercancel', onPointerLeave, { passive: true });
    addEventListener('blur', onPointerLeave, { passive: true });
    addEventListener('scroll', updateActiveState, { passive: true });
    addEventListener('resize', updateActiveState, { passive: true });
    document.addEventListener('visibilitychange', updateActiveState);
    updateActiveState();
    frame = requestAnimationFrame(tick);
  }

  addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
  }, { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());