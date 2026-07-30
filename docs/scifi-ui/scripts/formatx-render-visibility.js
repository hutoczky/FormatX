(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxRenderVisibility === 'ready-v2') return;
  root.dataset.fxRenderVisibility = 'ready-v2';

  const VISIBLE_INDEX = 14;
  const SCALE_INDEX = 9;
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const hero = document.getElementById('hero');
  let frame = 0;
  let heroVisible = true;

  function sharedState() {
    const state = window.__FORMATX_3D_STATE__;
    return state && ArrayBuffer.isView(state) && state.length > VISIBLE_INDEX ? state : null;
  }

  function updateHeroVisibility() {
    if (!MOBILE_QUERY.matches || !hero) {
      heroVisible = true;
      root.dataset.fxMobileCoreVisible = 'true';
      return;
    }

    const rect = hero.getBoundingClientRect();
    heroVisible = rect.bottom > innerHeight * 0.38 && rect.top < innerHeight * 0.72;
    root.dataset.fxMobileCoreVisible = String(heroVisible);
  }

  function shouldRender() {
    return !document.hidden
      && root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-organism-menu-open')
      && !document.body?.classList.contains('fx-organism-panel-open')
      && (!MOBILE_QUERY.matches || heroVisible);
  }

  function sync() {
    frame = 0;
    updateHeroVisibility();
    const active = shouldRender();
    const state = sharedState();
    if (state) {
      state[VISIBLE_INDEX] = active ? 1 : 0;
      state[SCALE_INDEX] = MOBILE_QUERY.matches ? 0.84 : 1;
    }
    root.dataset.fxRenderActive = active ? 'true' : 'false';
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if ('IntersectionObserver' in window && hero) {
    const heroObserver = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry) heroVisible = entry.isIntersecting && entry.intersectionRatio > 0.12;
      schedule();
    }, { threshold: [0, 0.12, 0.3, 0.6] });
    heroObserver.observe(hero);
    addEventListener('pagehide', () => heroObserver.disconnect(), { once: true });
  }

  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('formatx:introcomplete', schedule);
  addEventListener('formatx:organismpanelopen', schedule);
  addEventListener('formatx:organismpanelclose', schedule);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', schedule);
  MOBILE_QUERY.addEventListener?.('change', schedule);

  sync();
}());
