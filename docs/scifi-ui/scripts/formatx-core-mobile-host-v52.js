(function () {
  'use strict';

  const root = document.documentElement;
  const query = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)');
  let observer = null;

  function syncHost() {
    const stage = document.querySelector('.fx-core-v51-stage');
    const host = document.querySelector('#hero .hero-space');
    if (!stage || !host) return;

    if (query.matches) {
      if (stage.parentNode !== host) host.prepend(stage);
      stage.dataset.fxMobileHost = 'hero-space';
      root.dataset.fxCoreMobileHost = 'ready-v52';
    } else {
      if (stage.parentNode !== document.body) document.body.append(stage);
      delete stage.dataset.fxMobileHost;
      root.dataset.fxCoreMobileHost = 'desktop-body';
    }

    requestAnimationFrame(() => dispatchEvent(new Event('resize')));
  }

  function start() {
    syncHost();
    observer = new MutationObserver(syncHost);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  addEventListener('formatx:core3dready', syncHost);
  addEventListener('formatx:core3dfallback', syncHost);
  query.addEventListener?.('change', syncHost);
  visualViewport?.addEventListener('resize', syncHost, { passive: true });

  addEventListener('pagehide', () => observer?.disconnect(), { once: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());
