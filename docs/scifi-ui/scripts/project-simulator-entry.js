(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxSimulatorEntry === 'v1') return;
  root.dataset.fxSimulatorEntry = 'v1';

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

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function href() {
    return './project-simulator.html?lang=' + language();
  }

  function ensureHeroEntry() {
    const actions = document.querySelector('#hero .hero-actions');
    if (!actions) return false;
    let link = actions.querySelector('[data-fx-simulator-entry="hero"]');
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
    let link = actions.querySelector('[data-fx-simulator-entry="header"]');
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
    let link = footerNav.querySelector('[data-fx-simulator-entry="footer"]');
    if (!link) {
      link = document.createElement('a');
      link.dataset.fxSimulatorEntry = 'footer';
      footerNav.prepend(link);
    }
    return true;
  }

  function render() {
    const copy = COPY[language()];
    document.querySelectorAll('[data-fx-simulator-entry]').forEach(link => {
      link.href = href();
      link.setAttribute('aria-label', copy.aria);
      if (link.dataset.fxSimulatorEntry === 'hero') {
        const label = link.querySelector('span');
        if (label) label.textContent = copy.hero;
      } else if (link.dataset.fxSimulatorEntry === 'header') {
        link.textContent = copy.header;
      } else {
        link.textContent = copy.footer;
      }
    });
    root.dataset.fxSimulatorEntryState = 'ready';
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
          if (!ready) root.dataset.fxSimulatorEntryState = 'partial';
        }
      }, 250);
    }
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:threeready', 'formatx:loop'].forEach(name => {
    addEventListener(name, ensure);
  });
  addEventListener('formatx:languagechange', () => queueMicrotask(render));

  const observer = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(render);
  });
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });

  addEventListener('pagehide', () => {
    clearInterval(retryTimer);
    observer.disconnect();
  }, { once: true });
}());
