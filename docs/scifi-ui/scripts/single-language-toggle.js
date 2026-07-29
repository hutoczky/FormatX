(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxSingleLanguageToggle === 'ready') return;
  ROOT.dataset.fxSingleLanguageToggle = 'loading';

  function ensureStyle() {
    if (document.querySelector('link[data-fx-single-language-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/single-language-toggle.css?v=20260729-single-language-2';
    link.dataset.fxSingleLanguageStyle = 'true';
    document.head.appendChild(link);
  }

  function currentLanguage() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function updateToggle(toggle) {
    const current = currentLanguage();
    const next = current === 'hu' ? 'en' : 'hu';
    toggle.textContent = current.toUpperCase();
    toggle.dataset.nextLanguage = next;
    toggle.lang = current;
    toggle.setAttribute('aria-label', current === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian');
    toggle.title = current === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian';
  }

  function install() {
    const container = document.querySelector('.header-actions .language-switch, .language-switch');
    if (!container) return false;
    if (container.dataset.fxSingleLanguageToggle === 'ready') return true;

    const originalButtons = Array.from(container.querySelectorAll('[data-language]'));
    if (!originalButtons.length) return false;

    container.classList.add('fx-single-language-switch');
    container.dataset.fxSingleLanguageToggle = 'ready';

    originalButtons.forEach(button => {
      button.hidden = true;
      button.tabIndex = -1;
      button.setAttribute('aria-hidden', 'true');
    });

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'fx-language-toggle';
    toggle.dataset.languageToggle = 'true';
    updateToggle(toggle);

    toggle.addEventListener('click', () => {
      const next = currentLanguage() === 'hu' ? 'en' : 'hu';
      const original = originalButtons.find(button => button.dataset.language === next);

      if (original) {
        original.click();
      } else if (window.FormatXI18n?.setLanguage) {
        window.FormatXI18n.setLanguage(next, true);
      }

      requestAnimationFrame(() => updateToggle(toggle));
    });

    container.appendChild(toggle);

    addEventListener('formatx:languagechange', () => updateToggle(toggle));
    const observer = new MutationObserver(() => updateToggle(toggle));
    observer.observe(ROOT, { attributes: true, attributeFilter: ['lang'] });

    ROOT.dataset.fxSingleLanguageToggle = 'ready';
    return true;
  }

  ensureStyle();

  if (!install()) {
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { subtree: true, childList: true });
  }
}());
