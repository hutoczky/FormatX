(function () {
  'use strict';

  const ROOT = document.documentElement;

  function syncToggle() {
    const button = document.querySelector('[data-language-toggle]');
    if (!(button instanceof HTMLButtonElement)) return;

    const current = ROOT.lang === 'en' ? 'en' : 'hu';
    const next = current === 'hu' ? 'en' : 'hu';
    const label = button.querySelector('[data-language-label]');

    button.dataset.language = next;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute(
      'aria-label',
      current === 'hu' ? 'Switch to English' : 'Váltás magyar nyelvre'
    );
    button.setAttribute(
      'title',
      current === 'hu' ? 'Switch to English' : 'Váltás magyar nyelvre'
    );

    if (label) label.textContent = current.toUpperCase();
  }

  addEventListener('formatx:languagechange', syncToggle);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncToggle, { once: true });
  } else {
    syncToggle();
  }
}());
