(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismInterface === 'ready') return;

  const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)');
  const ACCENTS = ['183,163,255', '126,241,190', '255,196,126', '126,190,255', '205,235,249'];
  const SPECS = [
    {
      id: 'experience',
      scene: 1,
      index: '02 / NERVOUS SYSTEM',
      hu: 'Műveleti idegrendszer',
      en: 'Operational nervous system',
      summaryHu: 'Felderítés, tervezés, kontrollált végrehajtás és visszaellenőrzés egyetlen döntési útvonalon.',
      summaryEn: 'Discovery, planning, controlled execution and verification on one decision path.'
    },
    {
      id: 'capabilities',
      scene: 2,
      index: '03 / SYSTEM ORGANS',
      hu: 'Rendszerszervek',
      en: 'System organs',
      summaryHu: 'Hat specializált modul jelenik meg csak akkor, amikor valóban szükséged van rájuk.',
      summaryEn: 'Six specialised modules appear only when you actually need them.'
    },
    {
      id: 'pricing',
      scene: 3,
      index: '04 / COMMERCE HEART',
      hu: 'Árak és licencek',
      en: 'Pricing and licences',
      summaryHu: 'Csomagok, devizaváltás, fizetési folyamat és mindhárom QR-kód egy külön kereskedelmi konzolban.',
      summaryEn: 'Plans, currencies, payment flow and all three QR codes in a dedicated commerce console.'
    },
    {
      id: 'system',
      scene: 4,
      index: '05 / SYSTEM SKELETON',
      hu: 'Biztonság és platform',
      en: 'Safety and platform',
      summaryHu: 'A rendszer ellenőrizhető váza: platformok, célmeghajtó-védelem, naplózás, SHA-256 és Ed25519.',
      summaryEn: 'The verifiable skeleton: platforms, target protection, logs, SHA-256 and Ed25519.'
    },
    {
      id: 'resources',
      scene: 5,
      index: '06 / RELEASE BEACON',
      hu: 'Letöltés és támogatás',
      en: 'Downloads and support',
      summaryHu: 'Stabil kiadások, Android alkalmazás, GitHub, támogatás és jogi információk egyetlen jeladóban.',
      summaryEn: 'Stable releases, Android, GitHub, support and legal information in one beacon.'
    }
  ];

  const sectionById = new Map();
  const panelById = new Map();
  const triggerById = new Map();
  let consoleRoot = null;
  let consoleTitle = null;
  let consoleKicker = null;
  let consoleClose = null;
  let consoleNav = null;
  let activeId = '';
  let returnFocus = null;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function text(spec, key) {
    return spec[key + (language() === 'en' ? 'En' : 'Hu')];
  }

  function create(tag, className, attributes) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (attributes) {
      Object.entries(attributes).forEach(([name, value]) => {
        if (value !== null && value !== undefined) node.setAttribute(name, String(value));
      });
    }
    return node;
  }

  function buildTrigger(spec) {
    const button = create('button', 'fx-organism-chapter-trigger', {
      type: 'button',
      'data-organism-open': spec.id,
      'aria-haspopup': 'dialog',
      'aria-controls': 'fx-organism-console',
      style: '--chapter-accent:' + ACCENTS[spec.scene - 1]
    });
    const index = create('span', 'fx-organism-chapter-index');
    index.textContent = spec.index;
    const copy = create('span', 'fx-organism-chapter-copy');
    const title = create('strong', 'fx-organism-chapter-title');
    title.dataset.hu = spec.hu;
    title.dataset.en = spec.en;
    title.textContent = language() === 'en' ? spec.en : spec.hu;
    const summary = create('span', 'fx-organism-chapter-summary');
    summary.dataset.hu = spec.summaryHu;
    summary.dataset.en = spec.summaryEn;
    summary.textContent = language() === 'en' ? spec.summaryEn : spec.summaryHu;
    const action = create('span', 'fx-organism-chapter-action');
    action.dataset.hu = 'Rendszerpanel megnyitása';
    action.dataset.en = 'Open system panel';
    action.textContent = language() === 'en' ? 'Open system panel' : 'Rendszerpanel megnyitása';
    action.appendChild(create('i'));
    copy.append(title, summary, action);
    button.append(index, copy);
    return button;
  }

  function buildConsole() {
    const root = create('div', 'fx-organism-console', {
      id: 'fx-organism-console',
      hidden: '',
      'aria-hidden': 'true'
    });
    const backdrop = create('button', 'fx-organism-console-backdrop', {
      type: 'button',
      'data-organism-close': '',
      'aria-label': language() === 'en' ? 'Close panel' : 'Panel bezárása'
    });
    const shell = create('section', 'fx-organism-console-shell', {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'fx-organism-console-title'
    });
    const head = create('header', 'fx-organism-console-head');
    const headingCopy = create('div');
    consoleKicker = create('span', 'fx-organism-console-kicker');
    consoleTitle = create('h2', 'fx-organism-console-title', { id: 'fx-organism-console-title' });
    headingCopy.append(consoleKicker, consoleTitle);
    consoleClose = create('button', 'fx-organism-console-close', {
      type: 'button',
      'data-organism-close': '',
      'aria-label': language() === 'en' ? 'Close panel' : 'Panel bezárása'
    });
    consoleClose.textContent = '×';
    head.append(headingCopy, consoleClose);
    consoleNav = create('nav', 'fx-organism-console-nav', { 'aria-label': language() === 'en' ? 'System panels' : 'Rendszerpanelek' });
    const viewport = create('div', 'fx-organism-console-viewport');

    SPECS.forEach(spec => {
      const tab = create('button', '', {
        type: 'button',
        role: 'tab',
        'data-organism-tab': spec.id,
        'aria-selected': 'false'
      });
      tab.dataset.hu = spec.hu;
      tab.dataset.en = spec.en;
      tab.textContent = language() === 'en' ? spec.en : spec.hu;
      consoleNav.appendChild(tab);

      const panel = create('article', 'fx-organism-panel', {
        hidden: '',
        'data-organism-panel': spec.id,
        'aria-label': language() === 'en' ? spec.en : spec.hu
      });
      panelById.set(spec.id, panel);
      viewport.appendChild(panel);
    });

    shell.append(head, consoleNav, viewport);
    root.append(backdrop, shell);
    document.body.appendChild(root);
    return root;
  }

  function moveSectionContent(spec) {
    const section = document.getElementById(spec.id);
    const panel = panelById.get(spec.id);
    if (!section || !panel) return;
    sectionById.set(spec.id, section);

    const fragment = document.createDocumentFragment();
    while (section.firstChild) fragment.appendChild(section.firstChild);
    panel.appendChild(fragment);

    if (spec.id === 'resources') {
      const footer = document.querySelector('.site-footer');
      if (footer) panel.appendChild(footer);
    }

    const trigger = buildTrigger(spec);
    triggerById.set(spec.id, trigger);
    section.appendChild(trigger);
    section.classList.add('fx-organism-chapter');
    section.setAttribute('aria-label', language() === 'en' ? spec.en : spec.hu);
  }

  function actionLink(href, hu, en, className) {
    const anchor = create('a', className || '', { href });
    anchor.dataset.hu = hu;
    anchor.dataset.en = en;
    anchor.textContent = language() === 'en' ? en : hu;
    return anchor;
  }

  function buildActionbar() {
    const bar = create('nav', 'fx-organism-actionbar', { 'aria-label': language() === 'en' ? 'Quick actions' : 'Gyorsműveletek' });
    const downloadSource = document.getElementById('hero-download');
    const releaseSource = document.getElementById('release-page-link');
    const download = actionLink(downloadSource?.href || 'https://github.com/hutoczky/FormatX-Updates/releases/tag/v92', 'Teljes verzió', 'Full version');
    const android = actionLink('/download/android', 'Android APK', 'Android APK');
    const github = actionLink(releaseSource?.href || 'https://github.com/hutoczky/FormatX-Updates/releases', 'GitHub Releases', 'GitHub Releases');
    github.target = '_blank';
    github.rel = 'noopener noreferrer';
    bar.append(download, android, github);
    document.body.appendChild(bar);

    if (downloadSource) {
      new MutationObserver(() => { download.href = downloadSource.href; }).observe(downloadSource, { attributes: true, attributeFilter: ['href'] });
    }
    if (releaseSource) {
      new MutationObserver(() => { github.href = releaseSource.href; }).observe(releaseSource, { attributes: true, attributeFilter: ['href'] });
    }
  }

  function activateScene(spec) {
    ROOT.dataset.fxScene = String(spec.scene);
    ROOT.style.setProperty('--accent', ACCENTS[spec.scene - 1]);
    ROOT.style.setProperty('--fx-panel-accent', ACCENTS[spec.scene - 1]);
    triggerById.forEach((trigger, id) => trigger.classList.toggle('is-active', id === spec.id));
    dispatchEvent(new CustomEvent('formatx:organismfocus', { detail: { id: spec.id, scene: spec.scene } }));
  }

  function syncConsoleLanguage() {
    const lang = language();
    document.querySelectorAll('.fx-organism-interface-ready [data-hu][data-en]').forEach(element => {
      element.textContent = element.dataset[lang];
    });
    if (consoleClose) consoleClose.setAttribute('aria-label', lang === 'en' ? 'Close panel' : 'Panel bezárása');
    const backdrop = consoleRoot?.querySelector('.fx-organism-console-backdrop');
    if (backdrop) backdrop.setAttribute('aria-label', lang === 'en' ? 'Close panel' : 'Panel bezárása');
    if (activeId) {
      const spec = SPECS.find(item => item.id === activeId);
      if (spec) {
        consoleTitle.textContent = lang === 'en' ? spec.en : spec.hu;
        panelById.get(activeId)?.setAttribute('aria-label', lang === 'en' ? spec.en : spec.hu);
      }
    }
  }

  function focusableElements() {
    if (!consoleRoot || consoleRoot.hidden) return [];
    return Array.from(consoleRoot.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter(element => !element.closest('[hidden]') && element.getClientRects().length > 0);
  }

  function openPanel(id, source) {
    const spec = SPECS.find(item => item.id === id);
    const panel = panelById.get(id);
    if (!spec || !panel || !consoleRoot) return;

    returnFocus = source instanceof HTMLElement ? source : document.activeElement;
    activeId = id;
    activateScene(spec);
    consoleKicker.textContent = spec.index;
    consoleTitle.textContent = language() === 'en' ? spec.en : spec.hu;

    panelById.forEach((item, panelId) => {
      const active = panelId === id;
      item.hidden = !active;
      item.setAttribute('aria-hidden', String(!active));
      if (active) item.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('visible'));
    });
    consoleNav.querySelectorAll('[data-organism-tab]').forEach(button => {
      button.setAttribute('aria-selected', String(button.dataset.organismTab === id));
    });

    consoleRoot.hidden = false;
    consoleRoot.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fx-organism-panel-open');
    history.replaceState({}, '', location.pathname + location.search + '#' + id);
    requestAnimationFrame(() => consoleClose?.focus({ preventScroll: true }));
    dispatchEvent(new CustomEvent('formatx:organismpanelopen', { detail: { id, scene: spec.scene } }));
  }

  function closePanel(restore) {
    if (!consoleRoot || consoleRoot.hidden) return;
    const closedId = activeId;
    consoleRoot.hidden = true;
    consoleRoot.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('fx-organism-panel-open');
    activeId = '';
    history.replaceState({}, '', location.pathname + location.search + '#hero');
    if (restore !== false && returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
    dispatchEvent(new CustomEvent('formatx:organismpanelclose', { detail: { id: closedId } }));
  }

  function onClick(event) {
    const close = event.target.closest('[data-organism-close]');
    if (close) {
      event.preventDefault();
      closePanel(true);
      return;
    }

    const tab = event.target.closest('[data-organism-tab]');
    if (tab) {
      event.preventDefault();
      openPanel(tab.dataset.organismTab, tab);
      return;
    }

    const trigger = event.target.closest('[data-organism-open]');
    if (trigger) {
      event.preventDefault();
      openPanel(trigger.dataset.organismOpen, trigger);
      return;
    }

    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || anchor.closest('.fx-organism-panel') || anchor.matches('.scroll-cue') || anchor.closest('.fx-rail')) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!SPECS.some(spec => spec.id === id)) return;
    event.preventDefault();
    openPanel(id, anchor);
  }

  function onKeydown(event) {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
    if (event.key === 'Escape' && activeId) {
      event.preventDefault();
      closePanel(true);
      return;
    }
    if (activeId && event.key === 'Tab') {
      const focusables = focusableElements();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (typing || activeId || !/^[1-5]$/.test(event.key)) return;
    const spec = SPECS[Number(event.key) - 1];
    if (!spec) return;
    event.preventDefault();
    openPanel(spec.id, triggerById.get(spec.id));
  }

  function observeChapters() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      let best = null;
      entries.forEach(entry => {
        if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
      });
      if (!best || activeId) return;
      const spec = SPECS.find(item => item.id === best.target.id);
      if (spec) activateScene(spec);
    }, { threshold: [.25, .45, .65] });
    sectionById.forEach(section => observer.observe(section));
  }

  function openHashPanel() {
    const id = location.hash.slice(1);
    if (!SPECS.some(spec => spec.id === id)) return;
    setTimeout(() => openPanel(id, triggerById.get(id)), REDUCE_MOTION.matches ? 0 : 260);
  }

  function initialise() {
    consoleRoot = buildConsole();
    SPECS.forEach(moveSectionContent);
    buildActionbar();
    ROOT.classList.add('fx-organism-interface-ready');
    ROOT.dataset.fxOrganismInterface = 'ready';
    document.body.classList.add('fx-organism-shell');

    document.addEventListener('click', onClick, true);
    addEventListener('keydown', onKeydown);
    addEventListener('formatx:languagechange', syncConsoleLanguage);
    addEventListener('hashchange', openHashPanel);
    observeChapters();
    syncConsoleLanguage();
    openHashPanel();
    dispatchEvent(new CustomEvent('formatx:organisminterfaceready', { detail: { panels: SPECS.length } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
