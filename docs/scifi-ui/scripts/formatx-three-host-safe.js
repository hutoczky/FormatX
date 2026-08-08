(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  if (!body || root.dataset.fxThreeHost === 'safe-ready-v1' || root.dataset.fxThreeHost === 'native-apex') return;

  if (root.dataset.fxNativeApex === 'ready') {
    root.dataset.fxThreeHost = 'native-apex';
    root.dataset.fxThree = 'ready-native-apex';
    root.dataset.fxRenderer = root.dataset.fxNativeApexRenderer || 'native-apex';
    root.dataset.fxPerformance = 'adaptive-native';
    root.dataset.fxThreeFallback = 'not-required';
    return;
  }

  root.dataset.fxThreeFallback = root.dataset.fxNativeApex === 'reduced-motion-fallback'
    ? 'reduced-motion-safe-stage'
    : 'native-apex-unavailable-safe-stage';

  const immersiveActive = () => root.dataset.fxImmersive === 'active';

  const INDEX = Object.freeze({
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
  shared[INDEX.SCALE] = 1;
  shared[INDEX.WIDTH] = innerWidth;
  shared[INDEX.HEIGHT] = innerHeight;
  shared[INDEX.DPR] = devicePixelRatio || 1;
  shared[INDEX.REDUCED] = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0;
  shared[INDEX.VISIBLE] = !document.hidden && immersiveActive() ? 1 : 0;
  shared[INDEX.QUALITY_HINT] = matchMedia('(max-width: 900px), (pointer: coarse)').matches ? 1 : 2;

  try {
    Object.defineProperty(window, '__FORMATX_3D_STATE__', {
      configurable: true,
      enumerable: false,
      writable: false,
      value: shared
    });
  } catch (_) {
    window.__FORMATX_3D_STATE__ = shared;
  }

  const shell = document.createElement('div');
  shell.className = 'fx-three-stage-shell';
  shell.setAttribute('aria-hidden', 'true');

  const frame = document.createElement('iframe');
  frame.id = 'fx-three-frame';
  frame.title = 'FormatX safe real-time three-dimensional system engine';
  frame.src = 'about:blank';
  frame.tabIndex = -1;
  frame.loading = 'eager';
  frame.referrerPolicy = 'no-referrer';
  shell.appendChild(frame);
  body.prepend(shell);

  const telemetry = document.createElement('aside');
  telemetry.className = 'fx-three-telemetry';
  telemetry.setAttribute('aria-live', 'polite');
  telemetry.innerHTML = '<span>FORMATX / SAFE REAL 3D</span><strong data-fx-three-chapter>MAG</strong><small data-fx-three-telemetry>CORE / CLICK TO ACTIVATE</small>';
  body.appendChild(telemetry);

  const guide = document.createElement('div');
  guide.className = 'fx-three-guide';
  guide.setAttribute('aria-hidden', 'true');
  guide.innerHTML = '<i></i><span>MOVE CORE</span><b>SCROLL TO TRAVEL</b>';
  body.appendChild(guide);

  root.dataset.fxThreeHost = 'safe-ready-v1';
  root.dataset.fxThree = immersiveActive() ? 'intro-wait' : 'standby';
  root.dataset.fxPerformance = immersiveActive() ? 'safe' : 'static-standby';
  root.dataset.fxInfinite = 'disabled-safe-mode';

  const sections = Array.from(document.querySelectorAll('main > .scene'));
  const chapterNames = {
    hu: ['MAG', 'IDEGRENDSZER', 'TERVEZÉS ÉS VÉGREHAJTÁS', 'KERESKEDELMI SZÍV', 'AI ASSZISZTENS', 'JELADÓ'],
    en: ['CORE', 'NERVOUS SYSTEM', 'PLAN & EXECUTE', 'COMMERCE HEART', 'AI ASSISTANT', 'RELEASE BEACON']
  };

  let activeScene = -1;
  let previousScrollY = scrollY;
  let previousPointerX = innerWidth * 0.5;
  let previousPointerY = innerHeight * 0.5;
  let velocity = 0;
  let orbitX = 0;
  let orbitY = 0;
  let targetOrbitX = 0;
  let targetOrbitY = 0;
  let mouseDrag = false;
  let dragX = 0;
  let dragY = 0;
  let tap = null;
  let raf = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const language = () => root.lang === 'en' ? 'en' : 'hu';
  const interactive = target => Boolean(target?.closest?.('a,button,input,select,textarea,[contenteditable="true"],[role="button"]'));

  function updateScene() {
    const center = scrollY + innerHeight * 0.5;
    let nearest = 0;
    let distance = Infinity;

    sections.forEach((section, index) => {
      const sectionCenter = section.offsetTop + section.offsetHeight * 0.5;
      const nextDistance = Math.abs(sectionCenter - center);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });

    const section = sections[nearest];
    const local = section
      ? clamp((scrollY - (section.offsetTop - innerHeight * 0.5)) / Math.max(1, section.offsetHeight), 0, 0.999)
      : 0;
    shared[INDEX.SCENE] = clamp(nearest + local, 0, 5.999);

    const chapter = Math.min(5, Math.max(0, Math.floor(shared[INDEX.SCENE] + 0.12)));
    if (chapter === activeScene) return;
    activeScene = chapter;
    root.dataset.fxThreeScene = String(chapter);
    const title = telemetry.querySelector('[data-fx-three-chapter]');
    if (title) title.textContent = chapterNames[language()][chapter];
  }

  function updateScroll() {
    const current = scrollY;
    const delta = current - previousScrollY;
    previousScrollY = current;
    velocity = mix(velocity, clamp(delta / Math.max(1, innerHeight) * 18, -2, 2), 0.34);
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    shared[INDEX.SCROLL] = clamp(current / range, 0, 1);
    updateScene();
  }

  function updateViewport() {
    shared[INDEX.WIDTH] = innerWidth;
    shared[INDEX.HEIGHT] = innerHeight;
    shared[INDEX.DPR] = devicePixelRatio || 1;
    updateScroll();
  }

  function onPointerDown(event) {
    if (!immersiveActive()) return;
    if (interactive(event.target)) return;
    if (event.pointerType === 'mouse' && event.button === 0) {
      mouseDrag = true;
      dragX = event.clientX;
      dragY = event.clientY;
      root.classList.add('fx-three-dragging');
      return;
    }
    if (event.pointerType === 'touch') {
      tap = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
        moved: false
      };
    }
  }

  function onPointerMove(event) {
    if (!immersiveActive()) return;
    const x = event.clientX;
    const y = event.clientY;
    shared[INDEX.POINTER_VX] = clamp((x - previousPointerX) / 40, -1.5, 1.5);
    shared[INDEX.POINTER_VY] = clamp((y - previousPointerY) / 40, -1.5, 1.5);
    previousPointerX = x;
    previousPointerY = y;
    shared[INDEX.POINTER_X] = x / Math.max(1, innerWidth) * 2 - 1;
    shared[INDEX.POINTER_Y] = -(y / Math.max(1, innerHeight) * 2 - 1);

    if (tap?.id === event.pointerId && Math.hypot(x - tap.x, y - tap.y) > 10) tap.moved = true;

    if (!mouseDrag || event.pointerType !== 'mouse') return;
    const dx = x - dragX;
    const dy = y - dragY;
    dragX = x;
    dragY = y;
    targetOrbitX += dx * 0.0038;
    targetOrbitY = clamp(targetOrbitY + dy * 0.0026, -0.48, 0.48);
  }

  function onPointerUp(event) {
    if (!immersiveActive()) return;
    if (event.pointerType === 'mouse') {
      mouseDrag = false;
      root.classList.remove('fx-three-dragging');
      return;
    }

    if (!tap || tap.id !== event.pointerId) return;
    const travel = Math.hypot(event.clientX - tap.x, event.clientY - tap.y);
    const validTap = !tap.moved && travel <= 12 && performance.now() - tap.startedAt <= 450;
    tap = null;
    if (validTap) dispatchEvent(new CustomEvent('formatx:coreclick'));
  }

  function animate() {
    raf = 0;
    if (!immersiveActive() || document.hidden) return;
    velocity *= 0.9;
    orbitX = mix(orbitX, targetOrbitX, 0.08);
    orbitY = mix(orbitY, targetOrbitY, 0.08);
    shared[INDEX.VELOCITY] = velocity;
    shared[INDEX.ORBIT_X] = orbitX;
    shared[INDEX.ORBIT_Y] = orbitY;
    shared[INDEX.POINTER_VX] *= 0.82;
    shared[INDEX.POINTER_VY] *= 0.82;
    raf = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (raf || !immersiveActive() || document.hidden) return;
    raf = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateViewport, { passive: true });
  addEventListener('pointerdown', onPointerDown, { passive: true });
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerup', onPointerUp, { passive: true });
  addEventListener('pointercancel', onPointerUp, { passive: true });
  document.addEventListener('visibilitychange', () => {
    shared[INDEX.VISIBLE] = !document.hidden && immersiveActive() ? 1 : 0;
    if (shared[INDEX.VISIBLE]) startAnimation();
    else stopAnimation();
  });
  addEventListener('formatx:immersiveactivate', () => {
    shared[INDEX.VISIBLE] = document.hidden ? 0 : 1;
    root.dataset.fxPerformance = 'safe';
    if (root.dataset.fxThree === 'standby') root.dataset.fxThree = 'intro-wait';
    updateViewport();
    updateScene();
    startAnimation();
  });
  document.addEventListener('formatx:languagechange', updateScene);
  frame.addEventListener('load', () => {
    if ((frame.getAttribute('src') || '') !== 'about:blank') root.classList.add('fx-three-frame-loaded');
  });

  updateViewport();
  updateScene();
  startAnimation();

  addEventListener('pagehide', event => {
    if (event.persisted) return;
    cancelAnimationFrame(raf);
    try { delete window.__FORMATX_3D_STATE__; } catch (_) {}
  }, { once: true });
}());