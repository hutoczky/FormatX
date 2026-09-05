(function () {
  'use strict';
  const root = document.documentElement;
  const VERSION = 'native-webgl-navigation-life-r530';
  if (root.dataset.fxCoreLifeR455 === 'ready' || root.dataset.fxCoreLifeR455 === 'booting') return;
  root.dataset.fxCoreLifeR455 = 'booting';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px) and (pointer: fine)').matches;
  let api = null, stage = null, hero = null, visible = false, observer = null, lastSurfacePulse = -Infinity;
  let desktopSettleTimer = 0;

  function clearDesktopSettle() {
    if (desktopSettleTimer) clearTimeout(desktopSettleTimer);
    desktopSettleTimer = 0;
  }
  function desktopIdle(source = 'desktop-idle-r530') {
    if (!desktop || !api || typeof api.setLifecycleSuspended !== 'function') return false;
    clearDesktopSettle();
    api.setLifecycleSuspended(true, source);
    root.dataset.fxCoreDesktopLifecycleR530 = 'compositor-life-webgl-idle';
    root.dataset.fxCoreDesktopLifecycleSourceR530 = source;
    return true;
  }
  function desktopWake(source = 'desktop-interaction-r530', settleMs = 1320) {
    if (!desktop || !api || typeof api.setLifecycleSuspended !== 'function') return false;
    clearDesktopSettle();
    api.setLifecycleSuspended(false, source);
    api.requestRender?.(1);
    root.dataset.fxCoreDesktopLifecycleR530 = 'webgl-interaction-burst';
    root.dataset.fxCoreDesktopLifecycleSourceR530 = source;
    desktopSettleTimer = setTimeout(() => desktopIdle('desktop-interaction-settled-r530'), settleMs);
    return true;
  }
  function fireSurfacePulse(source) {
    if (!api || typeof api.surfacePulse !== 'function' || reduced.matches || document.hidden || !visible) return false;
    const now = performance.now();
    if (now - lastSurfacePulse < 2200) return false;
    if (desktop) desktopWake(`desktop-${source}`, Math.min(1600, Number(api.surfacePulseDurationMs) || 1160) + 120);
    if (!api.surfacePulse(source)) {
      if (desktop) desktopIdle('desktop-pulse-aborted-r530');
      return false;
    }
    lastSurfacePulse = now;
    return true;
  }
  function onCoreInteraction(event) { const phase = event.detail?.phase || ''; if (phase === 'press' || phase === 'release') fireSurfacePulse(`core-${phase}`); }
  function onPointerDown() { queueMicrotask(() => fireSurfacePulse('direct-interaction')); }
  function onKeyDown(event) { if (!event.isTrusted || !['Enter', ' '].includes(event.key)) return; const target = event.target instanceof Element ? event.target : null; if (!target?.closest('#hero .hero-space,.fx-reference-mag-button')) return; queueMicrotask(() => fireSurfacePulse('keyboard-interaction')); }
  function bind() {
    api = window.FormatXLivingCore || window.FormatXCoreMobileV69 || null;
    stage = document.querySelector('#hero .fx-crystal-organism-r326-stage, #hero .fx-core-mobile-v55-stage');
    hero = document.getElementById('hero');
    if (!api || !(stage instanceof HTMLElement) || !(hero instanceof HTMLElement)) return false;
    observer?.disconnect();
    observer = new IntersectionObserver(entries => { const entry = entries[0]; visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .04); root.dataset.fxCoreLifeVisibilityR455 = visible ? 'visible' : 'offscreen'; }, { threshold: [0, .04, .2, .55] });
    observer.observe(stage);
    stage.addEventListener('pointerdown', onPointerDown, { passive: true });
    addEventListener('formatx:coreinteraction', onCoreInteraction, { passive: true });
    document.addEventListener('keydown', onKeyDown, { passive: true });
    root.dataset.fxCoreLifeR455 = 'ready'; root.dataset.fxCoreLifeVersionR455 = VERSION;
    root.dataset.fxCoreLivingBehavior = desktop ? 'navigation-compositor-life-plus-interaction-webgl-r530' : 'navigation-compositor-life-plus-bounded-webgl-r530';
    root.dataset.fxCoreEnergyBoltR455 = 'interaction-surface-energy-ready';
    root.dataset.fxCoreIdlePolicyR455 = desktop ? 'navigation-compositor-heartbeat-webgl-zero-idle-r530' : 'mobile-governed-webgl-zero-idle-r530';
    if (desktop) {
      root.dataset.fxCoreDesktopIdlePolicyR530 = 'first-frame-then-zero-idle-interaction-bursts';
      requestAnimationFrame(() => requestAnimationFrame(() => desktopIdle('desktop-navigation-first-frame-settled-r530')));
    }
    return true;
  }
  function boot(attempt = 0) { if (bind()) return; if (attempt >= 120) { root.dataset.fxCoreLifeR455 = 'renderer-unavailable'; return; } setTimeout(() => boot(attempt + 1), Math.min(180, 30 + attempt * 2)); }
  function stop() { clearDesktopSettle(); observer?.disconnect(); root.dataset.fxCoreLifeR455 = 'stopped'; }
  addEventListener('formatx:real3dready', () => { if (root.dataset.fxCoreLifeR455 !== 'ready') boot(); }, { passive: true });
  addEventListener('pagehide', stop, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(), { once: true }); else boot();
}());