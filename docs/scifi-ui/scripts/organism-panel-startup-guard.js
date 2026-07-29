(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxOrganismStartupGuard === 'ready-v2') return;
  root.dataset.fxOrganismStartupGuard = 'ready-v2';

  const panelHashes = new Set(['#experience', '#capabilities', '#pricing', '#system', '#resources']);
  let panelUserIntent = false;
  let menuUserIntent = false;
  let observerFrame = 0;
  let enforcing = false;

  function clearPanelHash() {
    if (!panelHashes.has(location.hash)) return false;
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  }

  function closeMenu() {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('menu-toggle');
    nav?.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    root.classList.remove('fx-organism-menu-open');
    menuUserIntent = false;
  }

  function closePanel() {
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
    panelUserIntent = false;
    clearPanelHash();
  }

  function resetStartupState(resetScroll) {
    closeMenu();
    closePanel();
    root.dataset.fxOrganismPanel = 'closed-safe-startup-v2';
    if (resetScroll) requestAnimationFrame(() => scrollTo(0, 0));
  }

  function panelIsOpen() {
    const consoleRoot = document.getElementById('fx-organism-console');
    return Boolean(
      document.body?.classList.contains('fx-organism-panel-open') ||
      (consoleRoot && (!consoleRoot.hidden || consoleRoot.getAttribute('aria-hidden') === 'false'))
    );
  }

  function menuIsOpen() {
    return Boolean(
      root.classList.contains('fx-organism-menu-open') ||
      document.getElementById('main-nav')?.classList.contains('open') ||
      document.getElementById('menu-toggle')?.classList.contains('open') ||
      document.getElementById('menu-toggle')?.getAttribute('aria-expanded') === 'true'
    );
  }

  function enforceUserIntent() {
    observerFrame = 0;
    if (enforcing) return;
    enforcing = true;
    try {
      if (menuIsOpen() && !menuUserIntent) closeMenu();
      if (panelIsOpen() && !panelUserIntent) closePanel();
      if (!menuIsOpen()) menuUserIntent = false;
      if (!panelIsOpen()) panelUserIntent = false;
    } finally {
      enforcing = false;
    }
  }

  function scheduleEnforcement() {
    if (observerFrame) return;
    observerFrame = requestAnimationFrame(enforceUserIntent);
  }

  document.addEventListener('click', event => {
    if (!event.isTrusted) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('#menu-toggle')) {
      menuUserIntent = true;
      return;
    }

    if (target.closest('[data-organism-close]')) {
      panelUserIntent = false;
      return;
    }

    const panelTrigger = target.closest(
      '[data-organism-open], [data-organism-tab], #main-nav a[href^="#"], .fx-rail a[href^="#"], .fx-organism-map a[href^="#"], .scroll-cue[href^="#"]'
    );
    if (panelTrigger) panelUserIntent = true;
  }, true);

  const observer = new MutationObserver(scheduleEnforcement);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'aria-hidden', 'aria-expanded']
  });

  resetStartupState(false);
  document.addEventListener('formatx:introcomplete', () => resetStartupState(true), { once: true });
  addEventListener('formatx:organisminterfaceready', scheduleEnforcement);
  addEventListener('hashchange', scheduleEnforcement);
  addEventListener('pageshow', event => {
    if (event.persisted) resetStartupState(true);
    else scheduleEnforcement();
  });
}());
