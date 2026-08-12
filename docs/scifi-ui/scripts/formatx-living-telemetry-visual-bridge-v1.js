(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'living-telemetry-visual-bridge-v1';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

  if (root.dataset.fxLivingTelemetryBridge === VERSION) return;
  root.dataset.fxLivingTelemetryBridge = VERSION;

  function apply(input) {
    const state = input && typeof input === 'object' ? input : {};
    const energy = clamp(state.energy ?? .28, .08, 1);
    const pressure = clamp(state.renderPressure ?? 0, 0, 1);
    const pointerX = clamp(state.pointerX ?? 0, -1, 1);
    const pointerY = clamp(state.pointerY ?? 0, -1, 1);
    const phase = String(state.phase || root.dataset.fxLivingPhase || 'discover');

    root.style.setProperty('--fx-system-pointer-x-shift', (pointerX * (mobile ? 5 : 9)).toFixed(2) + '%');
    root.style.setProperty('--fx-system-pointer-y-shift', (pointerY * (mobile ? 4 : 7)).toFixed(2) + '%');
    root.style.setProperty('--fx-system-cyan-alpha', (.035 + energy * .055).toFixed(3));
    root.style.setProperty('--fx-system-violet-alpha', (.018 + energy * .032).toFixed(3));
    root.style.setProperty('--fx-system-mobile-cyan-alpha', (.028 + energy * .045).toFixed(3));
    root.style.setProperty('--fx-system-mobile-violet-alpha', (.014 + energy * .022).toFixed(3));
    root.style.setProperty('--fx-system-blur', (12 + pressure * 8).toFixed(1) + 'px');
    root.style.setProperty('--fx-system-scale', (1 + energy * .012).toFixed(4));
    root.style.setProperty('--fx-system-layer-opacity', (.22 + energy * .22).toFixed(3));
    root.style.setProperty('--fx-system-mobile-layer-opacity', (.12 + energy * .12).toFixed(3));
    const ringGain = phase === 'execute' ? 18 : phase === 'plan' ? 14 : phase === 'verify' ? 10 : 12;
    root.style.setProperty('--fx-system-ring-glow', (8 + energy * ringGain).toFixed(1) + 'px');
    root.dataset.fxLivingTelemetryVisual = 'active';
  }

  function sync() {
    try {
      const state = window.FormatXLivingSystem?.snapshot?.();
      if (state) apply(state);
    } catch (_) {}
  }

  addEventListener('formatx:systemstate', event => apply(event.detail?.state), { passive: true });
  addEventListener('formatx:coreinteraction', sync, { passive: true });
  addEventListener('formatx:organismstatechange', () => queueMicrotask(sync), { passive: true });
  addEventListener('pageshow', sync, { passive: true });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    sync();
    if (window.FormatXLivingSystem?.snapshot || attempts >= 40) clearInterval(timer);
  }, 125);
}());
