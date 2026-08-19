(function () {
  'use strict';

  try {
    const url = new URL(window.location.href);
    if (url.protocol !== 'https:' || url.hostname !== 'formatxsuite.com') return;

    const RECOVERY_PARAM = '_fx_redirect_recovery';
    const SUPPORTED_LANGUAGES = new Set(['hu', 'en']);

    if (url.pathname === '/') {
      /*
        Keep real public language URLs intact. The recovery parameter is an
        internal cache-escape transport, but ?lang=hu and ?lang=en are declared
        hreflang entry points and must survive address-bar cleanup.
      */
      const language = url.searchParams.get('lang');
      const params = new URLSearchParams();
      if (SUPPORTED_LANGUAGES.has(language)) params.set('lang', language);
      const search = params.toString() ? `?${params.toString()}` : '';
      const clean = `/${search}${url.hash}`;
      const current = `${url.pathname}${url.search}${url.hash}`;
      if (current !== clean) history.replaceState(history.state, document.title, clean);
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
