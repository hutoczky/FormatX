(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'direct-core-interaction-v1';
  const MOVE_THROTTLE_MS = 72;

  if (root.dataset.fxCoreDirectInteraction === VERSION) return;
  root.dataset.fxCoreDirectInteraction = VERSION;
  root.dataset.fxCoreInteractionState = 'waiting';

  let host = null;
  let activePointer = null;
  let lastMovePulse = 0;
  let idleTimer = 0;

  function coreReady() {
    return root.dataset.fxCoreReferenceV53 === 'ready-v53'
      || root.dataset.fxCoreMobileV55 === 'ready-v55'
      || root.dataset.fxCoreReferenceLock === 'ready-v53'
      || root.dataset.fxCoreReferenceLock === 'ready-v55';
  }

  function findHost() {
    host = document.querySelector('#hero .hero-space');
    if (host && coreReady()) {
      root.dataset.fxCoreInteraction = 'direct-pointer-touch-drag-r3';
      root.dataset.fxCoreInteractionState = 'ready';
      return true;
    }
    return false;
  }

  function pointInCore(event) {
    if (!host?.isConnected && !findHost()) return null;
    const rect = host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // The visible MAG occupies the central field of hero-space on both the
    // desktop v53 and physical-mobile v55 renderers. Use an ellipse rather
    // than the whole hero so normal page interactions are never treated as
    // MAG input.
    const dx = (x - 0.5) / 0.47;
    const dy = (y - 0.49) / 0.46;
    if (dx * dx + dy * dy > 1) return null;

    return {
      x: Math.max(-1, Math.min(1, x * 2 - 1)),
      y: Math.max(-1, Math.min(1, -(y * 2 - 1)))
    };
  }

  function scheduleIdle() {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (activePointer == null) root.dataset.fxCoreInteractionState = 'ready';
    }, 360);
  }

  function pulse(event, phase) {
    const point = pointInCore(event);
    if (!point) return false;

    const detail = {
      source: VERSION,
      phase,
      x: point.x,
      y: point.y,
      pointerType: event.pointerType || 'mouse'
    };

    root.dataset.fxCoreInteractionState = phase;
    dispatchEvent(new CustomEvent('formatx:organismcoreactivate', { detail }));
    dispatchEvent(new CustomEvent('formatx:coreinteraction', { detail }));
    scheduleIdle();
    return true;
  }

  function onPointerDown(event) {
    if (!pulse(event, 'press')) return;
    activePointer = event.pointerId;
  }

  function onPointerMove(event) {
    const now = performance.now();
    if (event.pointerType === 'mouse' && activePointer == null) {
      if (now - lastMovePulse < MOVE_THROTTLE_MS) return;
      if (pulse(event, 'hover')) lastMovePulse = now;
      return;
    }

    if (activePointer !== event.pointerId) return;
    if (now - lastMovePulse < MOVE_THROTTLE_MS) return;
    if (pulse(event, 'drag')) lastMovePulse = now;
  }

  function finishPointer(event, phase) {
    if (activePointer !== event.pointerId) return;
    pulse(event, phase);
    activePointer = null;
    scheduleIdle();
  }

  function onDoubleClick(event) {
    if (!pulse(event, 'burst')) return;
    window.setTimeout(() => pulse(event, 'burst'), 90);
    window.setTimeout(() => pulse(event, 'burst'), 180);
  }

  // These listeners never call preventDefault and never capture a pointer.
  // Mobile therefore keeps native pan-y/pinch zoom and momentum scrolling.
  addEventListener('pointerdown', onPointerDown, { passive: true });
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerup', event => finishPointer(event, 'release'), { passive: true });
  addEventListener('pointercancel', event => finishPointer(event, 'cancel'), { passive: true });
  addEventListener('dblclick', onDoubleClick, { passive: true });

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
