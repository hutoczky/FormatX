(function () {
  'use strict';

  const ROOT = document.documentElement;
  let initialised = false;

  function setOpen(toggle, nav, open) {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    ROOT.classList.toggle('fx-organism-menu-open', open);
  }

  function initialise() {
    if (initialised) return;
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!(toggle instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) return;
    initialised = true;

    toggle.classList.add('fx-organism-system-toggle');
    nav.classList.add('fx-organism-system-menu');
    document.body.append(toggle, nav);
    setOpen(toggle, nav, false);

    toggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(toggle, nav, !nav.classList.contains('open'));
    }, true);

    nav.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('a[href]')) setOpen(toggle, nav, false);
    }, true);

    document.addEventListener('pointerdown', event => {
      if (!nav.classList.contains('open')) return;
      const target = event.target;
      if (target === toggle || (target instanceof Node && (toggle.contains(target) || nav.contains(target)))) return;
      setOpen(toggle, nav, false);
    }, true);

    addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) setOpen(toggle, nav, false);
    });

    addEventListener('pageshow', () => setOpen(toggle, nav, false));
    document.addEventListener('formatx:introcomplete', () => setOpen(toggle, nav, false));

    ROOT.dataset.fxOrganismMenu = 'ready';
  }

  addEventListener('formatx:organisminterfaceready', initialise, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
