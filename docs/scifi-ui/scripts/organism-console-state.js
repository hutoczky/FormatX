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

  function setAttributeIfChanged(node, name, value) {
    if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  }

  function setHiddenIfChanged(node, hidden) {
    if (node.hidden !== hidden) node.hidden = hidden;
  }

  function setRootConsoleState(value) {
    if (root.dataset.fxOrganismConsole !== value) root.dataset.fxOrganismConsole = value;
  }

  function ensureOpenShell(shell, id) {
    if (shell.style.getPropertyValue('display')) shell.style.removeProperty('display');
    if (!shell.classList.contains('is-authorised-open')) shell.classList.add('is-authorised-open');
    setHiddenIfChanged(shell, false);
    setAttributeIfChanged(shell, 'aria-hidden', 'false');
    if (!document.body?.classList.contains('fx-organism-panel-open')) {
      document.body?.classList.add('fx-organism-panel-open');
    }
    setRootConsoleState('open-' + id);
  }

  function forceClosed(options) {
    const settings = Object.assign({ replaceHash: true }, options);
    if (reconciling) return;
    reconciling = true;

    authorised = false;
    activeId = '';

    const shell = consoleRoot();
    if (shell) {
      if (shell.classList.contains('is-authorised-open')) shell.classList.remove('is-authorised-open');
      setHiddenIfChanged(shell, true);
      setAttributeIfChanged(shell, 'aria-hidden', 'true');
      if (shell.style.getPropertyValue('display') !== 'none') shell.style.setProperty('display', 'none');
    }

    document.querySelectorAll('[data-organism-panel]').forEach(panel => {
      setHiddenIfChanged(panel, true);
      setAttributeIfChanged(panel, 'aria-hidden', 'true');
    });
    document.querySelectorAll('[data-organism-tab]').forEach(tab => {
      setAttributeIfChanged(tab, 'aria-selected', 'false');
    });

    if (document.body?.classList.contains('fx-organism-panel-open')) {
      document.body.classList.remove('fx-organism-panel-open');
    }
    if (settings.replaceHash) replaceWithHeroHash();
    setRootConsoleState('closed');
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
    ensureOpenShell(shell, id);
  }

  function adoptVisibleOpen(shell, id) {
    authorised = true;
    activeId = id;
    ensureOpenShell(shell, id);
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
      const visibleId = visiblePanelId();
      const legitimateOpen = Boolean(
        visibleId
        && !shell.hidden
        && shell.getAttribute('aria-hidden') === 'false'
        && document.body?.classList.contains('fx-organism-panel-open')
      );

      if (legitimateOpen) {
        adoptVisibleOpen(shell, visibleId);
        return;
      }

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

    // R804: MutationObserver is a repair trigger, not a heartbeat. Re-applying
    // unchanged class/style/ARIA state scheduled another observer callback every
    // frame and kept descendant controls geometrically unstable in Playwright.
    // Only repair a real divergence; an already-canonical open console is a no-op.
    ensureOpenShell(shell, activeId);
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
    closeLockUntil = 0;
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

  // R800/R804: this module can legitimately load after the interface has already
  // opened a panel. Events are notification; durable DOM state is authoritative.
  // Reconcile first, then remain idempotent so adoption never becomes a mutation loop.
  bindConsoleObserver();
  reconcile();
  root.dataset.fxOrganismConsoleState = 'ready';
}());
