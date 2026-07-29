(function () {
  'use strict';

  const ROOT = document.documentElement;
  const THEME_KEY = 'formatx-site-theme';

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function readTheme() {
    const query = new URLSearchParams(location.search).get('theme');
    if (query === 'light' || query === 'dark') return query;
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (_) {}
    return 'dark';
  }

  function applyTheme(theme, persist) {
    const selected = theme === 'light' ? 'light' : 'dark';
    ROOT.dataset.theme = selected;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selected));
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', selected === 'light' ? '#e8f2f8' : '#050a10'
    );
    if (persist) {
      try { localStorage.setItem(THEME_KEY, selected); } catch (_) {}
    }
  }

  function updateMeta() {
    const english = language() === 'en';
    document.title = english
      ? 'Detailed licence | FormatX Suite Pro'
      : 'Részletes licenc | FormatX Suite Pro';
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = english
        ? 'Detailed FormatX Suite Pro licence terms, permitted use, restrictions, activation and permission requests.'
        : 'A FormatX Suite Pro részletes licencfeltételei, engedélyezett használata, korlátozásai, aktiválása és engedélykérése.';
    }
  }

  function updateInternalLinks() {
    const lang = language();
    document.querySelectorAll('a[data-internal-link]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      url.searchParams.set('lang', lang);
      link.href = url.pathname + url.search + url.hash;
    });
  }

  function initialise() {
    applyTheme(readTheme(), false);
    updateMeta();
    updateInternalLinks();

    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => applyTheme(button.dataset.themeChoice, true));
    });

    addEventListener('formatx:languagechange', () => {
      updateMeta();
      updateInternalLinks();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
