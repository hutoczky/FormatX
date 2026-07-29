(function () {
  'use strict';

  const root = document.documentElement;

  function forceClosed() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('menu-toggle');

    nav?.classList.remove('open', 'fx-organism-system-menu');
    toggle?.classList.remove('open', 'fx-organism-system-toggle');
    toggle?.setAttribute('aria-expanded', 'false');
    root.classList.remove('fx-organism-menu-open');
    root.dataset.fxOrganismMenu = 'disabled-stability-v1';
  }

  forceClosed();
  document.addEventListener('formatx:introcomplete', forceClosed);
  addEventListener('pageshow', forceClosed);

  const observer = new MutationObserver(forceClosed);
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-expanded']
  });
}());
