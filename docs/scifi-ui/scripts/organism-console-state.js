(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxOrganismConsoleState === 'ready') return;
  root.dataset.fxOrganismConsoleState = 'loading';

  const PANEL_IDS = new Set(['experience', 'capabilities', 'pricing', 'system', 'resources']);
  let authorised = false;
  let activeId = '';
  let consoleObserver = null;
  let documentObserver = null;
  let reconciling = false;
  let scheduled = 0;
  let closeLockUntil = 0;

  function consoleRoot() {
    return document.getElementById('fx-organism-console');
  }

  function panelFor(id) {
    return document.querySelector('[data-organism-panel="' + CSS.escape(id) + '"]');
  }

  function visiblePanelId() {
    for (const id of PANEL_IDS) {
      const panel = panelFor(id);
      if (panel && !panel.hidden && panel.getAttribute('aria-hidden') === 'false') return id;
    }
    return '';
  }

  function replaceWithHeroHash() {
    if (location.hash === '#hero') return;
    history.replaceState({}, '', location.pathname + location.search + '#hero');
  }

  function forceClosed(options) {
    const settings = Object.assign({ replaceHash: true }, options);
    if (reconciling) return;
    reconciling = true;

    authorised = false;
    activeId = '';

    const shell = consoleRoot();
    if (shell) {
      shell.classList.remove('is-authorised-open');
      shell.hidden = true;
      shell.setAttribute('aria-hidden', 'true');
      shell.style.setProperty('display', 'none');
    }

    document.querySelectorAll('[data-organism-panel]').forEach(panel => {
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-organism-tab]').forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
    });

    document.body?.classList.remove('fx-organism-panel-open');
    if (settings.replaceHash) replaceWithHeroHash();
    root.dataset.fxOrganismConsole = 'closed';
    reconciling = false;
  }

  function authoriseOpen(id) {
    if (performance.now() < closeLockUntil) {
      forceClosed({ replaceHash: true });
      return;
    }
    if (!PANEL_IDS.has(id)) {
      forceClosed({ replaceHash: true });
      return;
    }

    const shell = consoleRoot();
    const panel = panelFor(id);
    if (!shell || !panel) {
      forceClosed({ replaceHash: true });
      return;
    }

    authorised = true;
    activeId = id;
    shell.style.removeProperty('display');
    shell.classList.add('is-authorised-open');
    shell.hidden = false;
    shell.setAttribute('aria-hidden', 'false');
    document.body?.classList.add('fx-organism-panel-open');
    root.dataset.fxOrganismConsole = 'open-' + id;
  }

  function reconcile() {
    scheduled = 0;
    if (reconciling) return;

    if (performance.now() < closeLockUntil) {
      forceClosed({ replaceHash: true });
      return;
    }

    const shell = consoleRoot();
    if (!shell) return;

    if (!authorised) {
      const leakedOpenState = !shell.hidden
        || shell.getAttribute('aria-hidden') === 'false'
        || shell.classList.contains('is-authorised-open')
        || document.body?.classList.contains('fx-organism-panel-open')
        || shell.style.display !== 'none';
      if (leakedOpenState) forceClosed({ replaceHash: true });
      return;
    }

    const visibleId = visiblePanelId();
    if (!visibleId || visibleId !== activeId) {
      forceClosed({ replaceHash: true });
      return;
    }

    shell.style.removeProperty('display');
    shell.classList.add('is-authorised-open');
    shell.hidden = false;
    shell.setAttribute('aria-hidden', 'false');
  }

  function scheduleReconcile() {
    if (scheduled) return;
    scheduled = requestAnimationFrame(reconcile);
  }

  function bindConsoleObserver() {
    const shell = consoleRoot();
    if (!shell || shell.dataset.fxConsoleStateObserved === 'true') return;
    shell.dataset.fxConsoleStateObserved = 'true';

    consoleObserver?.disconnect();
    consoleObserver = new MutationObserver(scheduleReconcile);
    consoleObserver.observe(shell, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'aria-hidden', 'aria-selected', 'style']
    });
    scheduleReconcile();
  }

  function holdClosedUntil(deadline) {
    forceClosed({ replaceHash: true });
    if (performance.now() < deadline) requestAnimationFrame(() => holdClosedUntil(deadline));
  }

  function handleEscape(event) {
    if (event.key !== 'Escape') return;
    const shell = consoleRoot();
    if (!shell || shell.hidden) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    closeLockUntil = performance.now() + 450;
    const close = shell.querySelector('[data-organism-close]');
    if (close instanceof HTMLElement) close.click();
    holdClosedUntil(closeLockUntil);
  }

  addEventListener('formatx:organisminterfaceready', () => {
    bindConsoleObserver();
    requestAnimationFrame(() => {
      if (!visiblePanelId()) forceClosed({ replaceHash: true });
      else scheduleReconcile();
    });
  });

  addEventListener('formatx:organismpanelopen', event => {
    bindConsoleObserver();
    authoriseOpen(String(event.detail?.id || ''));
  });

  addEventListener('formatx:organismpanelclose', () => {
    forceClosed({ replaceHash: true });
  });

  addEventListener('keydown', handleEscape, true);

  document.addEventListener('formatx:introcomplete', () => {
    if (!authorised) forceClosed({ replaceHash: true });
  });

  addEventListener('pageshow', () => {
    forceClosed({ replaceHash: true });
  });

  addEventListener('hashchange', () => {
    if (location.hash === '#hero' && !authorised) forceClosed({ replaceHash: false });
  });

  documentObserver = new MutationObserver(() => {
    bindConsoleObserver();
    scheduleReconcile();
  });
  documentObserver.observe(document.documentElement, { subtree: true, childList: true });

  bindConsoleObserver();
  forceClosed({ replaceHash: true });
  root.dataset.fxOrganismConsoleState = 'ready';
}());
