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

  function clearLegacyInline(node) {
    if (node instanceof HTMLElement && node.hasAttribute('style')) node.removeAttribute('style');
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

    const copy = grid.querySelector(':scope > .hero-copy');
    const heading = unique('.fx-reference-heading', hero);
    if (heading instanceof HTMLElement && heading.parentElement !== grid) grid.appendChild(heading);

    const proof = unique('.fx-reference-proof', hero);
    const live = proof?.querySelector('.fx-reference-liveos');
    if (proof instanceof HTMLElement && proof.parentElement !== grid) grid.appendChild(proof);

    /* Cached r75/r180 builds used inline !important geometry. MutationObserver
       runs before rendering, so remove those stale geometry writes in the same
       turn and let the authoritative r207/r208 styles own layout exclusively. */
    [hero, grid, space, zone, rail, copy, heading, proof, live].forEach(clearLegacyInline);

    root.dataset.fxMobileLayoutOwner = 'r207-normal-flow';
    root.dataset.fxMobileLayoutConflict = 'none-r207';
    root.dataset.fxMobileLayoutStability = 'r208-inline-shield';
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

  function relevantStyleMutation(record) {
    if (record.type !== 'attributes' || record.attributeName !== 'style') return false;
    const target = record.target;
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest(
      '#hero, #hero .hero-grid, #hero .hero-space, #hero .hero-copy, ' +
      '#hero .fx-reference-controls-r204, #hero .fx-reference-rail, ' +
      '#hero .fx-reference-heading, #hero .fx-reference-proof, #hero .fx-reference-liveos'
    ));
  }

  function start() {
    markAuthoritativeStyle();
    reconcile();

    const observer = new MutationObserver((records) => {
      if (!mobile()) return;
      const structural = records.some((record) =>
        record.type === 'childList' && (record.addedNodes.length || record.removedNodes.length)
      );
      const staleInline = records.some(relevantStyleMutation);
      if (structural || staleInline) schedule();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style']
    });

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
