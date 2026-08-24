(function () {
  'use strict';

  // r262 ownership pass: r207 remains the single physical mobile DOM owner,
  // while r244 owns final reference geometry whenever that runtime is present.
  // Reconciliation stays event-driven and never erases an active owner's inline
  // control geometry, eliminating the r207 <-> r244 cascade ping-pong.
  const root = document.documentElement;
  const mobile = () => matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  let queued = false;
  let bootObserver = null;
  let bootTimer = 0;

  function unique(selector, scope) {
    const nodes = Array.from((scope || document).querySelectorAll(selector));
    const first = nodes.shift() || null;
    nodes.forEach((node) => node.remove());
    return first;
  }

  function clearLegacyInline(node) {
    if (node instanceof HTMLElement && node.hasAttribute('style')) node.removeAttribute('style');
  }

  function referenceOwnsGeometry() {
    return root.dataset.fxReferenceProductionR244 === 'ready'
      || document.querySelector('script[data-fx-reference-production-r244]') instanceof HTMLScriptElement;
  }

  function reconcile() {
    if (!mobile()) return true;

    const hero = document.getElementById('hero');
    const grid = hero?.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    if (!(hero instanceof HTMLElement) || !(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    let zone = unique('.fx-reference-controls-r204', hero);
    if (!(zone instanceof HTMLElement)) {
      zone = document.createElement('div');
      zone.className = 'fx-reference-controls-r204';
      zone.setAttribute('aria-label', root.lang === 'en' ? 'Hero controls' : 'Hero vezérlők');
    }

    const rail = unique('.fx-reference-rail', hero);
    const sound = document.querySelector('.fx-three-sound');

    if (sound instanceof HTMLElement && sound.parentElement !== zone) zone.prepend(sound);
    if (rail instanceof HTMLElement && rail.parentElement !== zone) zone.appendChild(rail);

    // r250: controls belong to the 3D stage. This keeps the reference rail
    // interactive without increasing the document's mobile flow height.
    if (zone.parentElement !== space) space.appendChild(zone);

    const copy = grid.querySelector(':scope > .hero-copy');
    const heading = unique('.fx-reference-heading', hero);
    if (heading instanceof HTMLElement && heading.parentElement !== grid) grid.appendChild(heading);

    const proof = unique('.fx-reference-proof', hero);
    const live = proof?.querySelector('.fx-reference-liveos');
    if (proof instanceof HTMLElement && proof.parentElement !== grid) grid.appendChild(proof);

    const delegated = referenceOwnsGeometry();
    if (!delegated) {
      // Cached legacy builds may carry inline !important geometry. Remove it only
      // when no newer reference runtime owns geometry. Never stay in a mutation
      // hot path and never erase r244's final SOUND | ASK | PAUSE layout.
      [hero, grid, space, zone, rail, copy, heading, proof, live].forEach(clearLegacyInline);
    }

    root.dataset.fxMobileLayoutOwner = 'r250-reference-stage';
    root.dataset.fxMobileLayoutConflict = 'none-r207';
    root.dataset.fxMobileLayoutStability = delegated
      ? 'r255-event-driven-inline-shield-r262-delegated-r244'
      : 'r255-event-driven-inline-shield-r262-standalone';

    dispatchEvent(new CustomEvent('formatx:mobilelayoutready', {
      detail: { owner: 'r250-reference-stage', geometry: delegated ? 'r244' : 'r250' }
    }));
    return true;
  }

  function markAuthoritativeStyle() {
    const link = document.querySelector('link[data-fx-mobile-layout-r207]');
    root.dataset.fxMobileLayoutStyle = link instanceof HTMLLinkElement
      ? 'static-r208'
      : 'missing-r208';
  }

  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      reconcile();
    });
  }

  function stopBootObserver() {
    if (bootObserver) bootObserver.disconnect();
    bootObserver = null;
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = 0;
  }

  function start() {
    markAuthoritativeStyle();
    if (reconcile()) return;

    // The only MutationObserver is a bounded bootstrap fallback. It disconnects
    // as soon as the hero exists and cannot stay in the animation hot path.
    const target = document.body || document.documentElement;
    bootObserver = new MutationObserver(() => {
      if (reconcile()) stopBootObserver();
    });
    bootObserver.observe(target, { subtree: true, childList: true });
    bootTimer = setTimeout(() => {
      stopBootObserver();
      reconcile();
    }, 5000);
  }

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });
  for (const eventName of [
    'formatx:real3dready',
    'formatx:coredetailready',
    'formatx:organisminterfaceready',
    'formatx:languagechange'
  ]) addEventListener(eventName, schedule);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());
