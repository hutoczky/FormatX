(function () {
  'use strict';

  try {
    const url = new URL(window.location.href);
    if (url.protocol !== 'https:' || url.hostname !== 'formatxsuite.com') return;

    const RECOVERY_PARAM = '_fx_redirect_recovery';

    if (url.pathname === '/') {
      // The public homepage must visibly remain exactly https://formatxsuite.com/
      // after a cache-recovery request. Do not navigate: a navigation could hit
      // a stale historic permanent redirect again.
      if (url.search || url.hash) {
        history.replaceState(history.state, document.title, '/');
      }
      return;
    }

    if (!url.searchParams.has(RECOVERY_PARAM)) return;
    url.searchParams.delete(RECOVERY_PARAM);
    const clean = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(history.state, document.title, clean || '/');
  } catch (_) {
    // Recovery cleanup must never block or replace an already-rendered page.
  }
}());
