(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'native-webgl-micro-life-r455';
  if (root.dataset.fxCoreLifeR455 === 'ready' || root.dataset.fxCoreLifeR455 === 'booting') return;
  root.dataset.fxCoreLifeR455 = 'booting';

  const mobile = matchMedia('(max-width:900px),(pointer:coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let api = null;
  let stage = null;
  let hero = null;
  let visible = false;
  let stopped = false;
  let timer = 0;
  let observer = null;
  let lastSurfacePulse = -Infinity;
  let lastInteraction = -Infinity;
  let tick = 0;

  function canAnimate() {
    return !stopped
      && !document.hidden
      && visible
      && !reduced.matches
      && root.dataset.fxReferenceMotionPaused !== 'true'
      && api
      && typeof api.requestRender === 'function';
  }

  function scheduleNext() {
    clearTimeout(timer);
    if (stopped) return;
    const delay = mobile.matches ? 140 : 110;
    timer = setTimeout(ambientTick, delay);
  }

  function ambientTick() {
    timer = 0;
    if (canAnimate()) {
      /* One native WebGL frame at a low ambient cadence keeps uTime-driven
         membrane, caustic and microscopic yaw motion alive without restoring
         a hot 60-fps idle loop. Interaction remains full-speed through r326. */
      api.requestRender(1);
      tick += 1;
      root.dataset.fxCoreAmbientFrameR455 = String(tick);
      root.dataset.fxCoreAmbientCadenceR455 = mobile.matches ? '7fps-visible-only' : '9fps-visible-only';
    }
    scheduleNext();
  }

  function fireSurfacePulse(source) {
    if (!api || typeof api.surfacePulse !== 'function' || reduced.matches || document.hidden || !visible) return false;
    const now = performance.now();
    if (now - lastSurfacePulse < 2400) return false;
    lastSurfacePulse = now;
    api.surfacePulse();
    root.dataset.fxCoreEnergyBoltR455 = `surface-sweep-${source}`;
    return true;
  }

  function onDirectInteraction() {
    lastInteraction = performance.now();
    fireSurfacePulse('direct-interaction');
  }

  function onCoreInteraction(event) {
    const phase = event.detail?.phase || '';
    if (phase === 'press' || phase === 'release') {
      lastInteraction = performance.now();
      fireSurfacePulse(`core-${phase}`);
    }
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
      if (visible) {
        api.requestRender?.(2);
        scheduleNext();
      }
    }, { threshold: [0, .04, .2, .55] });
    observer.observe(stage);

    stage.addEventListener('pointerdown', onDirectInteraction, { passive: true });
    stage.addEventListener('touchstart', onDirectInteraction, { passive: true });
    addEventListener('formatx:coreinteraction', onCoreInteraction, { passive: true });

    /* The renderer already owns its autonomous full-surface electric sweep.
       r455 adds an early first-impression sweep only after the page has become
       interactive, so it does not race first paint or create a layout shift. */
    const firstImpression = () => {
      if (stopped || reduced.matches || !visible || performance.now() - lastInteraction < 1800) return;
      if (root.dataset.fxCoreSurfacePulseR454 === 'idle') fireSurfacePulse('first-impression');
    };
    if ('requestIdleCallback' in window) requestIdleCallback(firstImpression, { timeout: mobile.matches ? 2600 : 2200 });
    else setTimeout(firstImpression, mobile.matches ? 2400 : 2000);

    root.dataset.fxCoreLifeR455 = 'ready';
    root.dataset.fxCoreLivingBehavior = 'native-webgl-visible-micro-life-plus-surface-energy-r455';
    root.dataset.fxCoreEnergyBoltR455 = 'armed-full-surface';
    scheduleNext();
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
    stopped = true;
    clearTimeout(timer);
    timer = 0;
    observer?.disconnect();
    root.dataset.fxCoreLifeR455 = 'stopped';
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) {
      api?.requestRender?.(2);
      scheduleNext();
    }
  }, { passive: true });
  reduced.addEventListener?.('change', () => {
    if (!reduced.matches) {
      api?.requestRender?.(2);
      scheduleNext();
    }
  });
  addEventListener('formatx:real3dready', () => {
    if (root.dataset.fxCoreLifeR455 !== 'ready') boot();
  }, { passive: true });
  addEventListener('pagehide', stop, { once: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(), { once: true });
  else boot();
}());
