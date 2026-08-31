(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'native-webgl-interaction-life-r466';
  if (root.dataset.fxCoreLifeR455 === 'ready' || root.dataset.fxCoreLifeR455 === 'booting') return;
  root.dataset.fxCoreLifeR455 = 'booting';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let api = null;
  let stage = null;
  let hero = null;
  let visible = false;
  let observer = null;
  let lastSurfacePulse = -Infinity;

  function fireSurfacePulse(source) {
    if (!api || typeof api.surfacePulse !== 'function' || reduced.matches || document.hidden || !visible) return false;
    if (root.dataset.fxReferenceMotionPaused === 'true') return false;
    const now = performance.now();
    if (now - lastSurfacePulse < 2200) return false;
    lastSurfacePulse = now;
    api.surfacePulse();
    root.dataset.fxCoreEnergyBoltR455 = `surface-sweep-${source}`;
    return true;
  }

  function onCoreInteraction(event) {
    const phase = event.detail?.phase || '';
    if (phase === 'press' || phase === 'release') fireSurfacePulse(`core-${phase}`);
  }

  function onPointerDown() {
    /* R465's capture-phase render governor unpauses the native renderer first;
       this bubble-phase hook then launches the real shader sweep on the same
       trusted interaction. No timer or idle WebGL loop is introduced. */
    queueMicrotask(() => fireSurfacePulse('direct-interaction'));
  }

  function onKeyDown(event) {
    if (!event.isTrusted || !['Enter', ' '].includes(event.key)) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('#hero .hero-space,.fx-reference-mag-button')) return;
    queueMicrotask(() => fireSurfacePulse('keyboard-interaction'));
  }

  function bind() {
    api = window.FormatXLivingCore || window.FormatXCoreMobileV69 || null;
    stage = document.querySelector('#hero .fx-crystal-organism-r326-stage, #hero .fx-core-mobile-v55-stage');
    hero = document.getElementById('hero');
    if (!api || !(stage instanceof HTMLElement) || !(hero instanceof HTMLElement)) return false;

    observer?.disconnect();
    observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .04);
      root.dataset.fxCoreLifeVisibilityR455 = visible ? 'visible' : 'offscreen';
    }, { threshold: [0, .04, .2, .55] });
    observer.observe(stage);

    stage.addEventListener('pointerdown', onPointerDown, { passive: true });
    addEventListener('formatx:coreinteraction', onCoreInteraction, { passive: true });
    document.addEventListener('keydown', onKeyDown, { passive: true });

    root.dataset.fxCoreLifeR455 = 'ready';
    root.dataset.fxCoreLifeVersionR455 = VERSION;
    root.dataset.fxCoreLivingBehavior = 'native-webgl-interaction-energy-plus-compositor-breath-r466';
    root.dataset.fxCoreEnergyBoltR455 = 'armed-full-surface-explicit-interaction';
    root.dataset.fxCoreIdlePolicyR455 = 'explicit-mag-interaction-only-zero-idle';
    return true;
  }

  function boot(attempt = 0) {
    if (bind()) return;
    if (attempt >= 120) {
      root.dataset.fxCoreLifeR455 = 'renderer-unavailable';
      return;
    }
    setTimeout(() => boot(attempt + 1), Math.min(180, 30 + attempt * 2));
  }

  function stop() {
    observer?.disconnect();
    root.dataset.fxCoreLifeR455 = 'stopped';
  }

  addEventListener('formatx:real3dready', () => {
    if (root.dataset.fxCoreLifeR455 !== 'ready') boot();
  }, { passive: true });
  addEventListener('pagehide', stop, { once: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(), { once: true });
  else boot();
}());
