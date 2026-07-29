(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxOrganismStartupGuard === 'ready-v1') return;
  root.dataset.fxOrganismStartupGuard = 'ready-v1';

  const panelHashes = new Set(['#experience', '#capabilities', '#pricing', '#system', '#resources']);

  function clearPanelHash() {
    if (!panelHashes.has(location.hash)) return false;
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  }

  function closeStalePanel(resetScroll) {
    const consoleRoot = document.getElementById('fx-organism-console');
    if (consoleRoot) {
      consoleRoot.hidden = true;
      consoleRoot.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('[data-organism-panel]').forEach(panel => {
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-organism-tab]').forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
    });

    document.body?.classList.remove('fx-organism-panel-open');
    root.classList.remove('fx-organism-menu-open');
    document.getElementById('main-nav')?.classList.remove('open');
    const toggle = document.getElementById('menu-toggle');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    root.dataset.fxOrganismPanel = 'closed-safe-startup';

    if (clearPanelHash() || resetScroll) {
      requestAnimationFrame(() => scrollTo(0, 0));
    }
  }

  closeStalePanel(false);
  document.addEventListener('formatx:introcomplete', () => closeStalePanel(true), { once: true });
  addEventListener('formatx:organisminterfaceready', () => closeStalePanel(false), { once: true });
  addEventListener('pageshow', event => {
    if (event.persisted) closeStalePanel(true);
  });
}());
