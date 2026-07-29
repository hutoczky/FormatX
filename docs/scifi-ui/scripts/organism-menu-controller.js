(function () {
  'use strict';

  const ROOT = document.documentElement;
  let initialised = false;
  let trustedOpenRequested = false;
  let mutationGuard = false;

  function applyState(toggle, nav, open) {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    ROOT.classList.toggle('fx-organism-menu-open', open);
  }

  function forceClosed(toggle, nav) {
    trustedOpenRequested = false;
    applyState(toggle, nav, false);
  }

  function initialise() {
    if (initialised || ROOT.dataset.fxOrganismInterface !== 'ready') return;
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!(toggle instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) return;
    initialised = true;

    toggle.classList.add('fx-organism-system-toggle');
    nav.classList.add('fx-organism-system-menu');
    document.body.append(toggle, nav);
    forceClosed(toggle, nav);

    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const wantsOpen = !nav.classList.contains('open');
      if (wantsOpen && !event.isTrusted) {
        forceClosed(toggle, nav);
        return;
      }

      trustedOpenRequested = wantsOpen;
      applyState(toggle, nav, wantsOpen);
    }, true);

    nav.addEventListener('click', event => {
      if (!event.target.closest('a[href]')) return;
      forceClosed(toggle, nav);
    }, true);

    document.addEventListener('pointerdown', event => {
      if (!nav.classList.contains('open')) return;
      if (event.target === toggle || toggle.contains(event.target) || nav.contains(event.target)) return;
      forceClosed(toggle, nav);
    }, true);

    addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) forceClosed(toggle, nav);
    });

    document.addEventListener('formatx:introcomplete', () => forceClosed(toggle, nav));
    addEventListener('pageshow', () => forceClosed(toggle, nav));

    const observer = new MutationObserver(() => {
      if (mutationGuard) return;
      const appearsOpen = nav.classList.contains('open')
        || toggle.classList.contains('open')
        || toggle.getAttribute('aria-expanded') === 'true'
        || ROOT.classList.contains('fx-organism-menu-open');
      if (!appearsOpen || trustedOpenRequested) return;

      mutationGuard = true;
      forceClosed(toggle, nav);
      mutationGuard = false;
    });
    observer.observe(ROOT, { attributes: true, attributeFilter: ['class'] });
    observer.observe(nav, { attributes: true, attributeFilter: ['class'] });
    observer.observe(toggle, { attributes: true, attributeFilter: ['class', 'aria-expanded'] });

    ROOT.dataset.fxOrganismMenu = 'ready-v2';
  }

  addEventListener('formatx:organisminterfaceready', initialise);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();

  const readinessObserver = new MutationObserver(() => {
    if (ROOT.dataset.fxOrganismInterface === 'ready') {
      initialise();
      if (initialised) readinessObserver.disconnect();
    }
  });
  readinessObserver.observe(ROOT, { attributes: true, attributeFilter: ['data-fx-organism-interface'] });
}());
