(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'direct-core-interaction-v3';
  const LIVING_SCRIPT = '/scifi-ui/scripts/formatx-living-system-rendering-v1.js?v=20260812-award-r1';
  const TELEMETRY_BRIDGE = '/scifi-ui/scripts/formatx-living-telemetry-visual-bridge-v1.js?v=20260812-award-r2';
  const desktop = matchMedia('(min-width:901px) and (pointer:fine)').matches;
  const MOVE_THROTTLE_MS = desktop ? 28 : 72;
  const DESKTOP_X_GAIN = 1.85;
  const DESKTOP_Y_GAIN = 1.60;

  if (root.dataset.fxCoreDirectInteraction === VERSION) return;
  root.dataset.fxCoreDirectInteraction = VERSION;
  root.dataset.fxCoreInteractionState = 'waiting';

  let host = null;
  let hostRect = null;
  let activePointer = null;
  let lastMovePulse = 0;
  let idleTimer = 0;
  let rectRaf = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function bootTelemetryBridge() {
    if (root.dataset.fxLivingTelemetryBridge === 'living-telemetry-visual-bridge-v1') return;
    if (document.querySelector('script[data-fx-living-telemetry-bridge],script[src*="formatx-living-telemetry-visual-bridge-v1.js"]')) return;
    const script = document.createElement('script');
    script.src = TELEMETRY_BRIDGE;
    script.async = false;
    script.dataset.fxLivingTelemetryBridge = 'v1';
    script.addEventListener('load', () => { root.dataset.fxLivingTelemetryController = 'ready-v1'; }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxLivingTelemetryController = 'failed-v1'; }, { once: true });
    document.head.appendChild(script);
  }

  function bootLivingSystem() {
    bootTelemetryBridge();
    if (root.dataset.fxLivingSystemRendering === 'living-system-rendering-v1') return;
    if (document.querySelector('script[data-fx-living-system-rendering],script[src*="formatx-living-system-rendering-v1.js"]')) return;
    const script = document.createElement('script');
    script.src = LIVING_SCRIPT;
    script.async = false;
    script.dataset.fxLivingSystemRendering = 'v1';
    script.addEventListener('load', () => {
      root.dataset.fxLivingSystemController = 'ready-v1';
      bootTelemetryBridge();
    }, { once: true });
    script.addEventListener('error', () => { root.dataset.fxLivingSystemController = 'failed-v1'; }, { once: true });
    root.dataset.fxLivingSystemController = 'loading-v1';
    document.head.appendChild(script);
  }

  function coreReady() {
    return root.dataset.fxCoreReferenceV53 === 'ready-v53'
      || root.dataset.fxCoreMobileV55 === 'ready-v55'
      || root.dataset.fxCoreReferenceLock === 'ready-v53'
      || root.dataset.fxCoreReferenceLock === 'ready-v55';
  }

  function refreshHostRect() {
    rectRaf = 0;
    if (host?.isConnected) hostRect = host.getBoundingClientRect();
  }

  function scheduleRectRefresh() {
    if (!rectRaf) rectRaf = requestAnimationFrame(refreshHostRect);
  }

  function findHost() {
    host = document.querySelector('#hero .hero-space');
    bootLivingSystem();
    if (host && coreReady()) {
      hostRect = host.getBoundingClientRect();
      root.dataset.fxCoreInteraction = desktop
        ? 'direct-desktop-pointer-energy-r5-living-system'
        : 'direct-pointer-touch-drag-r4-living-system';
      root.dataset.fxCoreInteractionState = 'ready';
      return true;
    }
    return false;
  }

  function pointInCore(event) {
    if ((!host?.isConnected || !hostRect) && !findHost()) return null;
    const rect = hostRect;
    if (!rect || rect.width < 2 || rect.height < 2) return null;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const radiusX = desktop ? 0.52 : 0.47;
    const radiusY = desktop ? 0.51 : 0.46;
    const dx = (x - 0.5) / radiusX;
    const dy = (y - 0.49) / radiusY;
    if (dx * dx + dy * dy > 1) return null;

    return {
      x: clamp(x * 2 - 1, -1, 1),
      y: clamp(-(y * 2 - 1), -1, 1)
    };
  }

  function amplifyDesktopPointer(event, point) {
    if (!desktop || !event.isTrusted || !point || event.pointerType === 'touch') return;
    const gain = activePointer === event.pointerId ? 1.12 : 1;
    const nx = clamp(point.x * DESKTOP_X_GAIN * gain, -1, 1);
    const ny = clamp(point.y * DESKTOP_Y_GAIN * gain, -1, 1);
    const clientX = (nx + 1) * 0.5 * innerWidth;
    const clientY = (1 - ny) * 0.5 * (visualViewport?.height || innerHeight);

    try {
      dispatchEvent(new PointerEvent('pointermove', {
        clientX,
        clientY,
        pointerId: event.pointerId,
        pointerType: event.pointerType || 'mouse',
        buttons: event.buttons,
        pressure: event.pressure,
        isPrimary: event.isPrimary
      }));
    } catch (_) {
      dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
    }
  }

  function scheduleIdle() {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (activePointer == null) root.dataset.fxCoreInteractionState = 'ready';
    }, desktop ? 520 : 360);
  }

  function pulse(event, phase, point = null) {
    point = point || pointInCore(event);
    if (!point) return false;

    const detail = {
      source: VERSION,
      phase,
      x: point.x,
      y: point.y,
      pointerType: event.pointerType || 'mouse',
      desktopGain: desktop ? { x: DESKTOP_X_GAIN, y: DESKTOP_Y_GAIN } : null
    };

    root.dataset.fxCoreInteractionState = phase;
    dispatchEvent(new CustomEvent('formatx:organismcoreactivate', { detail }));
    dispatchEvent(new CustomEvent('formatx:coreinteraction', { detail }));
    scheduleIdle();
    return true;
  }

  function onPointerDown(event) {
    if (!event.isTrusted) return;
    const point = pointInCore(event);
    if (!point) return;
    activePointer = event.pointerId;
    amplifyDesktopPointer(event, point);
    pulse(event, 'press', point);
    if (desktop) {
      window.setTimeout(() => dispatchEvent(new CustomEvent('formatx:organismcoreactivate', {
        detail: { source: VERSION, phase: 'press-sustain' }
      })), 70);
      window.setTimeout(() => dispatchEvent(new CustomEvent('formatx:organismcoreactivate', {
        detail: { source: VERSION, phase: 'press-sustain' }
      })), 145);
    }
  }

  function onPointerMove(event) {
    if (!event.isTrusted) return;
    const point = pointInCore(event);
    if (!point) return;
    amplifyDesktopPointer(event, point);

    const now = performance.now();
    if (event.pointerType === 'mouse' && activePointer == null) {
      if (now - lastMovePulse < MOVE_THROTTLE_MS) return;
      if (pulse(event, 'hover', point)) lastMovePulse = now;
      return;
    }

    if (activePointer !== event.pointerId) return;
    if (now - lastMovePulse < MOVE_THROTTLE_MS) return;
    if (pulse(event, 'drag', point)) lastMovePulse = now;
  }

  function finishPointer(event, phase) {
    if (!event.isTrusted || activePointer !== event.pointerId) return;
    const point = pointInCore(event);
    if (point) {
      amplifyDesktopPointer(event, point);
      pulse(event, phase, point);
    }
    activePointer = null;
    scheduleIdle();
  }

  function onDoubleClick(event) {
    if (!event.isTrusted) return;
    const point = pointInCore(event);
    if (!point) return;
    amplifyDesktopPointer(event, point);
    pulse(event, 'burst', point);
    const delays = desktop ? [55, 110, 175, 250, 340] : [90, 180];
    delays.forEach(delay => window.setTimeout(() => pulse(event, 'burst', point), delay));
  }

  // No preventDefault and no pointer capture: phone pan-y/pinch/momentum remain native.
  addEventListener('pointerdown', onPointerDown, { passive: true });
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerup', event => finishPointer(event, 'release'), { passive: true });
  addEventListener('pointercancel', event => finishPointer(event, 'cancel'), { passive: true });
  addEventListener('dblclick', onDoubleClick, { passive: true });
  addEventListener('resize', scheduleRectRefresh, { passive: true });
  addEventListener('scroll', scheduleRectRefresh, { passive: true });
  visualViewport?.addEventListener('resize', scheduleRectRefresh, { passive: true });

  addEventListener('formatx:core3dready', () => {
    findHost();
    bootLivingSystem();
  }, { passive: true });
  addEventListener('pageshow', () => {
    activePointer = null;
    lastMovePulse = 0;
    findHost();
    bootLivingSystem();
  }, { passive: true });

  bootLivingSystem();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', findHost, { once: true });
  } else {
    findHost();
  }
}());
