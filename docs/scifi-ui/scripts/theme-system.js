(function () {
  'use strict';

  const STORAGE_KEY = 'formatx-theme';
  const DARK = 'dark';
  const LIGHT = 'light';
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function storedTheme() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === DARK || value === LIGHT ? value : null;
    } catch (_) {
      return null;
    }
  }

  function preferredTheme() {
    return storedTheme() || (systemTheme.matches ? LIGHT : DARK);
  }

  function languageIsHungarian() {
    return String(root.lang || navigator.language || '').toLowerCase().startsWith('hu');
  }

  function updateThemeMeta(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === LIGHT ? '#edf5ff' : '#030817');
  }

  function updateButton(button, theme) {
    if (!button) return;
    const isLight = theme === LIGHT;
    const nextLabel = languageIsHungarian()
      ? (isLight ? 'Sötét téma bekapcsolása' : 'Világos téma bekapcsolása')
      : (isLight ? 'Switch to dark theme' : 'Switch to light theme');
    const currentLabel = languageIsHungarian()
      ? (isLight ? 'Világos téma aktív' : 'Sötét téma aktív')
      : (isLight ? 'Light theme active' : 'Dark theme active');
    const icon = button.querySelector('.theme-switch-icon');
    const label = button.querySelector('.theme-switch-label');
    if (icon) icon.textContent = isLight ? '☀' : '☾';
    if (label) label.textContent = currentLabel;
    button.setAttribute('aria-label', nextLabel);
    button.setAttribute('title', nextLabel);
    button.setAttribute('aria-pressed', String(isLight));
    button.dataset.theme = theme;
  }

  function notifyTheme(theme) {
    document.dispatchEvent(new CustomEvent('formatx:themechange', {
      detail: { theme: theme },
    }));
  }

  function applyTheme(theme, persist) {
    const next = theme === LIGHT ? LIGHT : DARK;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    updateThemeMeta(next);
    updateButton(document.getElementById('theme-switch'), next);
    if (persist) {
      try { window.localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    }
    notifyTheme(next);
  }

  function toggleTheme() {
    const next = root.dataset.theme === LIGHT ? DARK : LIGHT;
    const perform = function () { applyTheme(next, true); };
    if (!reduceMotion.matches && typeof document.startViewTransition === 'function') {
      document.startViewTransition(perform);
    } else {
      perform();
    }
  }

  function makeButton() {
    if (document.getElementById('theme-switch')) return;
    const button = document.createElement('button');
    button.id = 'theme-switch';
    button.className = 'theme-switch';
    button.type = 'button';
    button.innerHTML = '<span class="theme-switch-icon" aria-hidden="true"></span><span class="theme-switch-label"></span>';
    button.addEventListener('click', toggleTheme);

    const actions = document.querySelector('.header-actions');
    if (actions) {
      actions.insertBefore(button, actions.firstChild);
    } else {
      button.classList.add('theme-switch-floating');
      document.body.appendChild(button);
    }
    updateButton(button, root.dataset.theme || preferredTheme());
  }

  applyTheme(preferredTheme(), false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makeButton, { once: true });
  } else {
    makeButton();
  }

  systemTheme.addEventListener('change', function () {
    if (!storedTheme()) applyTheme(systemTheme.matches ? LIGHT : DARK, false);
  });

  const languageObserver = new MutationObserver(function () {
    updateButton(document.getElementById('theme-switch'), root.dataset.theme || preferredTheme());
  });
  languageObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });
}());
