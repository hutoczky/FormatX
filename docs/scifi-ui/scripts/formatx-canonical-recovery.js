(function () {
  'use strict';

  try {
    const url = new URL(window.location.href);
    if (url.protocol !== 'https:' || url.hostname !== 'formatxsuite.com' || url.pathname !== '/') return;

    // The recovery query exists only to bypass a historic cached 308 redirect.
    // Once the real apex homepage has loaded, remove every query/hash component
    // without another navigation so the visible address is exactly the root URL.
    if (url.search || url.hash) {
      history.replaceState(history.state, document.title, '/');
    }
  } catch (_) {
    // A failure here must never block or replace the already rendered homepage.
  }
}());
