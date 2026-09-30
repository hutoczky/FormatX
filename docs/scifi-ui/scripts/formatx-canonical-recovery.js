(function () {
  'use strict';

  try {
    const url = new URL(window.location.href);
    if (url.protocol !== 'https:' || url.hostname !== 'formatxsuite.com') return;

    const RECOVERY_PARAM = '_fx_redirect_recovery';

    /*
      R1814 — recovery cleanup must be transparent to real application state.
      The old apex-root branch rebuilt the query from only ?lang= and therefore
      erased ?intro=1, visual proof parameters, WebGPU previews and any future
      functional query state before deferred runtimes could read it.

      The recovery parameter is the only private transport value owned by this
      script. Remove exactly that parameter and preserve everything else.
    */
    if (!url.searchParams.has(RECOVERY_PARAM)) return;
    url.searchParams.delete(RECOVERY_PARAM);
    const clean = `${url.pathname}${url.search}${url.hash}`;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (current !== clean) history.replaceState(history.state, document.title, clean || '/');
  } catch (_) {
    // Recovery cleanup must never block or replace an already-rendered page.
  }
}());
