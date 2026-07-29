(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxRenderVisibility === 'ready') return;
  root.dataset.fxRenderVisibility = 'ready';

  const VISIBLE_INDEX = 14;
  let frame = 0;

  function sharedState() {
    const state = window.__FORMATX_3D_STATE__;
    return state && ArrayBuffer.isView(state) && state.length > VISIBLE_INDEX ? state : null;
  }

  function shouldRender() {
    return !document.hidden
      && root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-organism-menu-open')
      && !document.body?.classList.contains('fx-organism-panel-open');
  }

  function sync() {
    frame = 0;
    const state = sharedState();
    if (state) state[VISIBLE_INDEX] = shouldRender() ? 1 : 0;
    root.dataset.fxRenderActive = shouldRender() ? 'true' : 'false';
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(sync);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('formatx:introcomplete', schedule);
  addEventListener('formatx:organismpanelopen', schedule);
  addEventListener('formatx:organismpanelclose', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', schedule);

  sync();
}());
