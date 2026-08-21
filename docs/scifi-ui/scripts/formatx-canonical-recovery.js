(function () {
  'use strict';

  try {
    const url = new URL(window.location.href);
    if (url.protocol !== 'https:' || url.hostname !== 'formatxsuite.com') return;

    const RECOVERY_PARAM = '_fx_redirect_recovery';
    const SUPPORTED_LANGUAGES = new Set(['hu', 'en']);
    const recovery = url.searchParams.has(RECOVERY_PARAM);

    // Recovery URLs are internal cache-escape transports, never independent
    // documents. Mark them noindex before history.replaceState removes the
    // transport parameter so render-capable crawlers cannot retain a duplicate.
    if (recovery) {
      let robots = document.querySelector('meta[name="robots"]');
      if (!(robots instanceof HTMLMetaElement)) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, nofollow, noarchive';
      document.documentElement.dataset.fxRecoveryNoindex = 'active';
    }

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

    if (!recovery) return;
    url.searchParams.delete(RECOVERY_PARAM);
    const clean = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(history.state, document.title, clean || '/');
  } catch (_) {
    // Recovery cleanup must never block or replace an already-rendered page.
  }
}());
