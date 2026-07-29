(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismCoreController === 'ready') return;

  const PANEL_SCENES = Object.freeze({
    experience: 1,
    capabilities: 2,
    pricing: 3,
    system: 4,
    resources: 5
  });
  const SCENE_LABELS = Object.freeze([
    { hu: 'MAG', en: 'CORE' },
    { hu: 'IDEGRENDSZER', en: 'NERVOUS SYSTEM' },
    { hu: 'RENDSZERSZERVEK', en: 'SYSTEM ORGANS' },
    { hu: 'KERESKEDELMI SZÍV', en: 'COMMERCE HEART' },
    { hu: 'RENDSZERVÁZ', en: 'SYSTEM SKELETON' },
    { hu: 'KIADÁSI JELADÓ', en: 'RELEASE BEACON' }
  ]);

  let pendingPanel = '';
  let interfaceReady = ROOT.dataset.fxOrganismInterface === 'ready';

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function panelIsOpen() {
    const consoleRoot = document.getElementById('fx-organism-console');
    return Boolean(
      document.body?.classList.contains('fx-organism-panel-open') ||
      (consoleRoot && !consoleRoot.hidden && consoleRoot.getAttribute('aria-hidden') === 'false')
    );
  }

  function closeResponsiveMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    nav?.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    ROOT.classList.remove('fx-organism-menu-open');
  }

  function updateNavigation(scene) {
    const bounded = Math.max(0, Math.min(5, Number(scene) || 0));
    const label = SCENE_LABELS[bounded];

    ROOT.dataset.fxScene = String(bounded);
    ROOT.classList.toggle('fx-organism-core-active', bounded === 0);
    ROOT.dataset.fxOrganismState = bounded === 0 ? 'core' : 'organ-' + bounded;

    document.querySelectorAll('[data-organ-node], [data-scene-link]').forEach(node => {
      const value = Number(node.dataset.organNode ?? node.dataset.sceneLink);
      const active = value === bounded;
      node.classList.toggle('active', active);
      if (active) node.setAttribute('aria-current', bounded === 0 ? 'page' : 'step');
      else node.removeAttribute('aria-current');
    });

    const status = document.querySelector('.fx-organism-status');
    const statusIndex = status?.querySelector('.fx-organism-status-index');
    const statusName = status?.querySelector('strong');
    if (statusIndex) statusIndex.textContent = String(bounded + 1).padStart(2, '0') + ' / 06';
    if (statusName) statusName.textContent = label[language()];

    document.getElementById('hero')?.classList.toggle('is-core-active', bounded === 0);
    dispatchEvent(new CustomEvent('formatx:organismstatechange', {
      detail: { scene: bounded, id: bounded === 0 ? 'hero' : Object.keys(PANEL_SCENES).find(id => PANEL_SCENES[id] === bounded) }
    }));
  }

  function replaceHash(hash) {
    const next = location.pathname + location.search + hash;
    if (location.pathname + location.search + location.hash !== next) {
      history.replaceState({}, '', next);
    }
  }

  function activateCore(options) {
    const settings = Object.assign({ scroll: false, replaceHistory: true, closePanel: true }, options);
    pendingPanel = '';
    closeResponsiveMenu();

    if (settings.closePanel && panelIsOpen()) {
      const close = document.querySelector('[data-organism-close]');
      if (close instanceof HTMLElement) close.click();
      else {
        const consoleRoot = document.getElementById('fx-organism-console');
        if (consoleRoot) {
          consoleRoot.hidden = true;
          consoleRoot.setAttribute('aria-hidden', 'true');
        }
        document.body?.classList.remove('fx-organism-panel-open');
      }
    }

    updateNavigation(0);
    if (settings.replaceHistory) replaceHash('#hero');

    if (settings.scroll) {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('hero')?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }

  function openPanel(id, source) {
    const scene = PANEL_SCENES[id];
    if (!scene) return;
    closeResponsiveMenu();
    updateNavigation(scene);

    if (panelIsOpen() && location.hash === '#' + id) {
      pendingPanel = '';
      return;
    }

    const trigger = document.querySelector('[data-organism-open="' + CSS.escape(id) + '"]');
    if (!(trigger instanceof HTMLElement)) {
      pendingPanel = id;
      return;
    }

    pendingPanel = '';
    trigger.dataset.organismSource = source || 'system-navigation';
    trigger.click();
  }

  function handleNavigation(event) {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest('a[href^="#"]');
    if (!anchor || anchor.closest('.fx-organism-panel')) return;

    const id = anchor.getAttribute('href')?.slice(1) || '';
    if (id !== 'hero' && !Object.hasOwn(PANEL_SCENES, id)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (id === 'hero') activateCore({ scroll: true, replaceHistory: true, closePanel: true });
    else openPanel(id, anchor.closest('.fx-organism-map') ? 'organism-map' : 'navigation');
  }

  function handleKeyboard(event) {
    const target = event.target;
    const typing = target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target?.isContentEditable;
    if (typing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!/^[1-6]$/.test(event.key)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const scene = Number(event.key) - 1;
    if (scene === 0) activateCore({ scroll: true, replaceHistory: true, closePanel: true });
    else {
      const id = Object.keys(PANEL_SCENES).find(key => PANEL_SCENES[key] === scene);
      if (id) openPanel(id, 'keyboard');
    }
  }

  function interfaceBecameReady() {
    interfaceReady = true;
    if (pendingPanel) openPanel(pendingPanel, 'deferred-navigation');
    else if (!panelIsOpen()) activateCore({ scroll: false, replaceHistory: true, closePanel: false });
  }

  document.addEventListener('click', handleNavigation, true);
  addEventListener('keydown', handleKeyboard, true);
  addEventListener('formatx:organisminterfaceready', interfaceBecameReady);
  addEventListener('formatx:organismpanelopen', event => {
    const id = event.detail?.id;
    if (Object.hasOwn(PANEL_SCENES, id)) updateNavigation(PANEL_SCENES[id]);
  });
  addEventListener('formatx:organismpanelclose', () => activateCore({ scroll: false, replaceHistory: true, closePanel: false }));
  addEventListener('formatx:loop', () => activateCore({ scroll: false, replaceHistory: true, closePanel: true }));
  document.addEventListener('formatx:introcomplete', () => {
    if (!panelIsOpen()) activateCore({ scroll: false, replaceHistory: true, closePanel: false });
  });
  addEventListener('formatx:languagechange', () => updateNavigation(Number(ROOT.dataset.fxScene || 0)));
  addEventListener('pageshow', event => {
    if (event.persisted || !panelIsOpen()) activateCore({ scroll: false, replaceHistory: true, closePanel: true });
  });

  ROOT.dataset.fxOrganismCoreController = 'ready';
  if (interfaceReady) interfaceBecameReady();
  else activateCore({ scroll: false, replaceHistory: true, closePanel: false });
}());
