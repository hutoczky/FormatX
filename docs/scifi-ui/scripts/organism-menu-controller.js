(function () {
  'use strict';

  const root = document.documentElement;

  function forceClosed() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('menu-toggle');

    if (nav?.classList.contains('open') || nav?.classList.contains('fx-organism-system-menu')) {
      nav.classList.remove('open', 'fx-organism-system-menu');
    }
    if (toggle?.classList.contains('open') || toggle?.classList.contains('fx-organism-system-toggle')) {
      toggle.classList.remove('open', 'fx-organism-system-toggle');
    }
    if (toggle?.getAttribute('aria-expanded') !== 'false') {
      toggle?.setAttribute('aria-expanded', 'false');
    }
    root.classList.remove('fx-organism-menu-open');
    root.dataset.fxOrganismMenu = 'disabled-stability-v2';
  }

  forceClosed();
  document.addEventListener('formatx:introcomplete', forceClosed);
  addEventListener('pageshow', forceClosed);
}());
