(function () {
  'use strict';
  const root = document.documentElement;
  const VERSION = 'native-webgl-periodic-and-interaction-life-r528';
  if (root.dataset.fxCoreLifeR455 === 'ready' || root.dataset.fxCoreLifeR455 === 'booting') return;
  root.dataset.fxCoreLifeR455 = 'booting';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let api = null, stage = null, hero = null, visible = false, observer = null, ownerLifecycle = null, bootTimer = 0, stopped = false, lastSurfacePulse = -Infinity;
  function fireSurfacePulse(source) {
    if (!api || typeof api.surfacePulse !== 'function' || reduced.matches || document.hidden || !visible) return false;
    const now = performance.now();
    if (now - lastSurfacePulse < 2200) return false;
    if (!api.surfacePulse(source)) return false;
    lastSurfacePulse = now;
    return true;
  }
  function onCoreInteraction(event) { const phase = event.detail?.phase || ''; if (phase === 'press' || phase === 'release') fireSurfacePulse(`core-${phase}`); }
  function onPointerDown() { queueMicrotask(() => fireSurfacePulse('direct-interaction')); }
  function onKeyDown(event) { if (!event.isTrusted || !['Enter', ' '].includes(event.key)) return; const target = event.target instanceof Element ? event.target : null; if (!target?.closest('#hero .hero-space,.fx-reference-mag-button')) return; queueMicrotask(() => fireSurfacePulse('keyboard-interaction')); }
  function retireOwner() { ownerLifecycle?.abort(); observer?.disconnect(); visible = false; root.dataset.fxCoreLifeVisibilityR455 = 'retired'; }
  function bind() {
    const nextApi = window.FormatXLivingCore || window.FormatXCoreMobileV69 || null;
    const nextStage = nextApi?.stage || document.querySelector('#hero .fx-crystal-organism-r326-stage, #hero .fx-core-mobile-v55-stage');
    const nextHero = document.getElementById('hero');
    if (stopped || !nextApi || !(nextStage instanceof HTMLElement) || !(nextHero instanceof HTMLElement)) return false;
    // Durable readiness belongs to the product; the current API/stage identifies
    // its renderer. A fallback can be ready without changing that durable flag.
    if (api === nextApi && stage === nextStage && ownerLifecycle && !ownerLifecycle.signal.aborted) return true;
    retireOwner();
    api = nextApi; stage = nextStage; hero = nextHero; visible = false;
    root.dataset.fxCoreLifeVisibilityR455 = 'pending-observation';
    ownerLifecycle = new AbortController();
    const options = { passive: true, signal: ownerLifecycle.signal };
    observer = new IntersectionObserver(entries => { const entry = entries[0]; visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > .04); root.dataset.fxCoreLifeVisibilityR455 = visible ? 'visible' : 'offscreen'; }, { threshold: [0, .04, .2, .55] });
    observer.observe(stage);
    stage.addEventListener('pointerdown', onPointerDown, options);
    addEventListener('formatx:coreinteraction', onCoreInteraction, options);
    document.addEventListener('keydown', onKeyDown, options);
    root.dataset.fxCoreLifeR455 = 'ready'; root.dataset.fxCoreLifeVersionR455 = VERSION;
    root.dataset.fxCoreLivingBehavior = 'native-periodic-surface-energy-and-interaction-r528';
    if (!root.dataset.fxCoreEnergyBoltR455?.startsWith('surface-sweep-')) root.dataset.fxCoreEnergyBoltR455 = 'armed-periodic-and-interaction-surface-energy';
    root.dataset.fxCoreIdlePolicyR455 = 'periodic-surface-bursts-between-zero-idle';
    return true;
  }
  function boot(attempt = 0) { if (stopped || bind() || bootTimer) return; if (attempt >= 120) { root.dataset.fxCoreLifeR455 = 'renderer-unavailable'; return; } bootTimer = setTimeout(() => { bootTimer = 0; boot(attempt + 1); }, Math.min(180, 30 + attempt * 2)); }
  function stop() { stopped = true; clearTimeout(bootTimer); bootTimer = 0; retireOwner(); root.dataset.fxCoreLifeR455 = 'stopped'; }
  addEventListener('formatx:magownerretired', event => { if (event.detail?.api === api) retireOwner(); }, { passive: true });
  addEventListener('formatx:real3dready', () => { clearTimeout(bootTimer); bootTimer = 0; boot(); }, { passive: true });
  addEventListener('pagehide', stop, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(), { once: true }); else boot();
}());
