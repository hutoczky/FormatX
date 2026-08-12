(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'direct-core-interaction-v2';
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
    if (host && coreReady()) {
      hostRect = host.getBoundingClientRect();
      root.dataset.fxCoreInteraction = desktop
        ? 'direct-desktop-pointer-energy-r4'
        : 'direct-pointer-touch-drag-r3';
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

    // Keep the interaction field around the visible MAG instead of consuming
    // the entire hero. Desktop gets a slightly wider field so the core starts
    // reacting before the cursor reaches the glass surface.
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

    // The WebGL renderer consumes viewport-normalized pointer coordinates.
    // Feed it a magnified coordinate derived from the MAG-local position so
    // the existing native 3D model matrix rotates farther without adding a
    // CSS/fake-3D transform or changing the crystal geometry/material.
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

  // No preventDefault and no pointer capture: phone pan-y/pinch/momentum remain
  // native. The desktop amplifier only emits synthetic pointermove coordinates
  // into the existing WebGL renderer; the crystal remains real WebGL geometry.
  addEventListener('pointerdown', onPointerDown, { passive: true });
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerup', event => finishPointer(event, 'release'), { passive: true });
  addEventListener('pointercancel', event => finishPointer(event, 'cancel'), { passive: true });
  addEventListener('dblclick', onDoubleClick, { passive: true });
  addEventListener('resize', scheduleRectRefresh, { passive: true });
  addEventListener('scroll', scheduleRectRefresh, { passive: true });
  visualViewport?.addEventListener('resize', scheduleRectRefresh, { passive: true });

  addEventListener('formatx:core3dready', () => findHost(), { passive: true });
  addEventListener('pageshow', () => {
    activePointer = null;
    lastMovePulse = 0;
    findHost();
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', findHost, { once: true });
  } else {
    findHost();
  }
}());
