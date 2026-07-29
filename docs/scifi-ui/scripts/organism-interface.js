(function () {
  'use strict';

  const root = document.documentElement;

  function removeFullscreenOrganismUi() {
    document.getElementById('fx-organism-console')?.remove();
    document.querySelectorAll('.fx-organism-actionbar').forEach(node => node.remove());

    document.body?.classList.remove('fx-organism-panel-open', 'fx-organism-shell');
    root.classList.remove(
      'fx-organism-interface-ready',
      'fx-organism-menu-open',
      'fx-organism-scene-0',
      'fx-organism-scene-1',
      'fx-organism-scene-2',
      'fx-organism-scene-3',
      'fx-organism-scene-4',
      'fx-organism-scene-5'
    );

    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('menu-toggle');
    nav?.classList.remove('open', 'fx-organism-system-menu');
    toggle?.classList.remove('open', 'fx-organism-system-toggle');
    toggle?.setAttribute('aria-expanded', 'false');

    root.dataset.fxOrganismInterface = 'disabled-stability-v1';
    root.dataset.fxOrganismPanel = 'disabled-stability-v1';
  }

  removeFullscreenOrganismUi();
  document.addEventListener('formatx:introcomplete', removeFullscreenOrganismUi);
  addEventListener('pageshow', removeFullscreenOrganismUi);

  const observer = new MutationObserver(() => {
    if (
      document.getElementById('fx-organism-console') ||
      document.body?.classList.contains('fx-organism-panel-open') ||
      root.classList.contains('fx-organism-menu-open')
    ) {
      removeFullscreenOrganismUi();
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'aria-expanded']
  });

  dispatchEvent(new CustomEvent('formatx:organisminterfacedisabled', {
    detail: { reason: 'production-stability' }
  }));
}());
