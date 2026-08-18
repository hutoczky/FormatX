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

    /* r204 keeps MAG -> heading -> proof as the physical accessibility order.
       r207 only gives the controls one physical owner: hero-grid. CSS order puts
       the zone visually between MAG and copy without fighting the r204 observer. */
    if (zone.parentElement !== grid) grid.appendChild(zone);

    const heading = unique('.fx-reference-heading', hero);
    if (heading instanceof HTMLElement && heading.parentElement !== grid) grid.appendChild(heading);

    const proof = unique('.fx-reference-proof', hero);
    if (proof instanceof HTMLElement) {
      if (proof.parentElement !== grid) grid.appendChild(proof);
      const live = proof.querySelector('.fx-reference-liveos');
      if (live instanceof HTMLElement) live.removeAttribute('style');
    }

    zone.removeAttribute('style');
    rail?.removeAttribute('style');
    root.dataset.fxMobileLayoutOwner = 'r207-normal-flow';
    root.dataset.fxMobileLayoutConflict = 'none-r207';
  }

  function ensureAuthoritativeStyle() {
    const link = document.querySelector('link[data-fx-mobile-layout-r207]');
    if (link instanceof HTMLLinkElement && link.parentElement === document.head) {
      document.head.appendChild(link);
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      reconcile();
    });
  }

  function start() {
    reconcile();
    ensureAuthoritativeStyle();

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { subtree: true, childList: true });

    addEventListener('resize', schedule, { passive: true });
    addEventListener('orientationchange', schedule, { passive: true });
    addEventListener('formatx:real3dready', () => {
      ensureAuthoritativeStyle();
      schedule();
    });
    addEventListener('formatx:languagechange', schedule);

    setTimeout(() => {
      ensureAuthoritativeStyle();
      reconcile();
    }, 450);
    setTimeout(() => {
      ensureAuthoritativeStyle();
      reconcile();
    }, 1400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());
