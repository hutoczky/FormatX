(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxSimulatorEntryController === 'v2') return;
  root.dataset.fxSimulatorEntryController = 'v2';
  root.dataset.fxSimulatorEntryVersion = 'v2';

  const COPY = {
    hu: {
      hero: 'Projekt szimulátor',
      header: 'Szimulátor',
      footer: 'Projekt szimulátor',
      aria: 'FormatX Operational Twin projekt szimulátor megnyitása'
    },
    en: {
      hero: 'Project simulator',
      header: 'Simulator',
      footer: 'Project simulator',
      aria: 'Open the FormatX Operational Twin project simulator'
    }
  };

  let retryTimer = 0;
  let attempts = 0;
  let renderQueued = false;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function href() {
    return '/scifi-ui/project-simulator.html?lang=' + encodeURIComponent(language());
  }

  function ensureHeroEntry() {
    const actions = document.querySelector('#hero .hero-actions');
    if (!actions) return false;
    let link = actions.querySelector('a[data-fx-simulator-entry="hero"]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'button button-line magnetic';
      link.dataset.fxSimulatorEntry = 'hero';
      link.innerHTML = '<span></span><i aria-hidden="true">◎</i>';
      actions.appendChild(link);
    }
    return true;
  }

  function ensureHeaderEntry() {
    const actions = document.querySelector('.header-actions');
    if (!actions) return false;
    let link = actions.querySelector('a[data-fx-simulator-entry="header"]');
    if (!link) {
      link = document.createElement('a');
      link.className = 'header-support';
      link.dataset.fxSimulatorEntry = 'header';
      const licence = actions.querySelector('.header-buy');
      actions.insertBefore(link, licence || null);
    }
    return true;
  }

  function ensureFooterEntry() {
    const footerNav = document.querySelector('.site-footer nav');
    if (!footerNav) return false;
    let link = footerNav.querySelector('a[data-fx-simulator-entry="footer"]');
    if (!link) {
      link = document.createElement('a');
      link.dataset.fxSimulatorEntry = 'footer';
      footerNav.prepend(link);
    }
    return true;
  }

  function removeCloneEntries() {
    document.querySelectorAll('[data-fx-loop-bridge="true"] a[data-fx-simulator-entry]').forEach(link => link.remove());
  }

  function render() {
    removeCloneEntries();
    const copy = COPY[language()];
    const targetHref = href();
    document.querySelectorAll('a[data-fx-simulator-entry]').forEach(link => {
      if (link.getAttribute('href') !== targetHref) link.setAttribute('href', targetHref);
      if (link.getAttribute('aria-label') !== copy.aria) link.setAttribute('aria-label', copy.aria);
      if (link.dataset.fxSimulatorEntry === 'hero') {
        const label = link.querySelector('span');
        if (label && label.textContent !== copy.hero) label.textContent = copy.hero;
      } else if (link.dataset.fxSimulatorEntry === 'header') {
        if (link.textContent !== copy.header) link.textContent = copy.header;
      } else if (link.dataset.fxSimulatorEntry === 'footer') {
        if (link.textContent !== copy.footer) link.textContent = copy.footer;
      }
    });
    if (root.dataset.fxSimulatorEntryState !== 'ready') root.dataset.fxSimulatorEntryState = 'ready';
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    queueMicrotask(() => { renderQueued = false; render(); });
  }

  function ensure() {
    const complete = ensureHeroEntry() && ensureHeaderEntry() && ensureFooterEntry();
    render();
    if (complete) {
      clearInterval(retryTimer);
      retryTimer = 0;
      return;
    }
    if (!retryTimer) {
      retryTimer = window.setInterval(() => {
        attempts += 1;
        const ready = ensureHeroEntry() && ensureHeaderEntry() && ensureFooterEntry();
        render();
        if (ready || attempts >= 80) {
          clearInterval(retryTimer);
          retryTimer = 0;
          if (!ready) root.dataset.fxSimulatorEntryState = 'partial-v2';
        }
      }, 250);
    }
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, ensure);
  });
  addEventListener('formatx:languagechange', queueRender);

  const observer = new MutationObserver(entries => {
    const languageChanged = entries.some(entry => entry.type === 'attributes' && entry.attributeName === 'lang');
    const cloneAdded = entries.some(entry => entry.type === 'childList' && Array.from(entry.addedNodes).some(node => {
      return node instanceof Element && (node.matches('[data-fx-loop-bridge="true"]')
        || Boolean(node.querySelector('[data-fx-loop-bridge="true"]')));
    }));
    if (languageChanged || cloneAdded) queueRender();
  });
  observer.observe(root, { attributes: true, attributeFilter: ['lang'], childList: true, subtree: true });

  addEventListener('pagehide', event => {
    // A cached page returns with its original controller and observers.
    if (event.persisted) return;
    clearInterval(retryTimer);
    observer.disconnect();
  });
}());