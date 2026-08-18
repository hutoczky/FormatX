(function () {
  'use strict';

  const root = document.documentElement;
  const mobile = () => matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  let queued = false;

  function unique(selector, scope) {
    const nodes = Array.from((scope || document).querySelectorAll(selector));
    const first = nodes.shift() || null;
    nodes.forEach((node) => node.remove());
    return first;
  }

  function reconcile() {
    if (!mobile()) return;

    const hero = document.getElementById('hero');
    const grid = hero?.querySelector(':scope > .hero-grid');
    const space = grid?.querySelector(':scope > .hero-space');
    if (!(hero instanceof HTMLElement) || !(grid instanceof HTMLElement) || !(space instanceof HTMLElement)) return;

    let zone = unique('.fx-reference-controls-r204', hero);
    if (!(zone instanceof HTMLElement)) {
      zone = document.createElement('div');
      zone.className = 'fx-reference-controls-r204';
      zone.setAttribute('aria-label', root.lang === 'en' ? 'Hero controls' : 'Hero vezérlők');
    }

    const rail = unique('.fx-reference-rail', hero);
    const sound = document.querySelector('.fx-three-sound');

    if (sound instanceof HTMLElement && sound.parentElement !== zone) zone.appendChild(sound);
    if (rail instanceof HTMLElement && rail.parentElement !== zone) zone.appendChild(rail);

    /* r208: hero-grid is the single physical owner. CSS order owns visual order.
       Never move the stylesheet link or repeatedly reorder stable children. */
    if (zone.parentElement !== grid) grid.appendChild(zone);

    const heading = unique('.fx-reference-heading', hero);
    if (heading instanceof HTMLElement && heading.parentElement !== grid) grid.appendChild(heading);

    const proof = unique('.fx-reference-proof', hero);
    if (proof instanceof HTMLElement) {
      if (proof.parentElement !== grid) grid.appendChild(proof);
      const live = proof.querySelector('.fx-reference-liveos');
      if (live instanceof HTMLElement && live.hasAttribute('style')) live.removeAttribute('style');
    }

    if (zone.hasAttribute('style')) zone.removeAttribute('style');
    if (rail instanceof HTMLElement && rail.hasAttribute('style')) rail.removeAttribute('style');

    root.dataset.fxMobileLayoutOwner = 'r207-normal-flow';
    root.dataset.fxMobileLayoutConflict = 'none-r207';
    root.dataset.fxMobileLayoutStability = 'r208-static-cascade';
  }

  function markAuthoritativeStyle() {
    const link = document.querySelector('link[data-fx-mobile-layout-r207]');
    root.dataset.fxMobileLayoutStyle = link instanceof HTMLLinkElement
      ? 'static-r208'
      : 'missing-r208';
    /* Deliberately do not append/move an existing <link>. Moving a live stylesheet
       changes cascade order and caused the r204/r207 visual flash. */
  }

  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      reconcile();
    });
  }

  function start() {
    markAuthoritativeStyle();
    reconcile();

    const observer = new MutationObserver((records) => {
      if (!mobile()) return;
      if (!records.some((record) => record.type === 'childList' && (record.addedNodes.length || record.removedNodes.length))) return;
      schedule();
    });
    observer.observe(document.documentElement, { subtree: true, childList: true });

    addEventListener('resize', schedule, { passive: true });
    addEventListener('orientationchange', schedule, { passive: true });
    addEventListener('formatx:real3dready', schedule);
    addEventListener('formatx:languagechange', schedule);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());
