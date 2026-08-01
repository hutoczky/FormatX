(function () {
  'use strict';

  const ROOT = document.documentElement;
  const STORAGE_KEY = 'formatx-language';
  const SUPPORTED = new Set(['hu', 'en']);
  if (ROOT.dataset.fxSingleLanguageToggle === 'ready' && ROOT.dataset.fxSingleLanguageToggleVersion === '2') return;
  ROOT.dataset.fxSingleLanguageToggle = 'loading';
  ROOT.dataset.fxSingleLanguageToggleVersion = '2';

  function ownScript() {
    return document.currentScript
      || Array.from(document.scripts).find(script => /\/single-language-toggle\.js(?:\?|$)/.test(script.src));
  }

  function assetUrl(relativePath) {
    const script = ownScript();
    return script?.src ? new URL(relativePath, script.src).href : relativePath;
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-single-language-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = assetUrl('../styles/single-language-toggle.css?v=20260729-single-language-3');
    link.dataset.fxSingleLanguageStyle = 'true';
    document.head.appendChild(link);
  }

  function storedLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.has(query)) return query;
    const apiLanguage = window.FormatXI18n?.getLanguage?.();
    if (SUPPORTED.has(apiLanguage)) return apiLanguage;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.has(stored)) return stored;
    } catch (_) {}
    if (SUPPORTED.has(ROOT.lang)) return ROOT.lang;
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function applyBilingualCopy(language) {
    ROOT.lang = language;
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-hu-label][data-en-label]').forEach(element => {
      element.setAttribute('aria-label', element.dataset[language + 'Label']);
    });
  }

  function persistLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  function createContainer() {
    const container = document.createElement('div');
    container.className = 'language-switch language-control fx-single-language-switch';
    container.dataset.i18nControl = 'true';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Language / Nyelv');

    const headerActions = document.querySelector('.header-actions');
    const legalHeader = document.querySelector('.legal-header-inner');
    if (headerActions) headerActions.prepend(container);
    else if (legalHeader) legalHeader.insertBefore(container, legalHeader.querySelector('.theme-control'));
    else document.body?.prepend(container);
    return container;
  }

  function findContainer() {
    return document.querySelector('.language-switch, .language-control') || createContainer();
  }

  function legacyButtons(container) {
    return Array.from(container.querySelectorAll('[data-language], [data-language-choice]'));
  }

  function hideLegacyControls(primaryContainer) {
    document.querySelectorAll('.language-switch, .language-control').forEach(container => {
      if (container !== primaryContainer) {
        container.querySelectorAll('.fx-language-toggle').forEach(button => button.remove());
        container.hidden = true;
        container.setAttribute('aria-hidden', 'true');
      }
    });

    legacyButtons(primaryContainer).forEach(button => {
      button.hidden = true;
      button.tabIndex = -1;
      button.setAttribute('aria-hidden', 'true');
    });
  }

  function updateToggle(toggle, language) {
    const next = language === 'hu' ? 'en' : 'hu';
    toggle.textContent = language.toUpperCase();
    toggle.dataset.nextLanguage = next;
    toggle.lang = language;
    toggle.setAttribute('aria-label', language === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian');
    toggle.title = language === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian';
  }

  function setLanguage(language, persist, container, toggle) {
    if (!SUPPORTED.has(language)) return;
    const preservedHash = location.hash;
    if (persist) persistLanguage(language);
    applyBilingualCopy(language);

    const legacy = legacyButtons(container).find(button => (
      button.dataset.language === language || button.dataset.languageChoice === language
    ));

    if (window.FormatXI18n?.setLanguage) {
      window.FormatXI18n.setLanguage(language, persist);
    } else if (legacy) {
      legacy.click();
    } else {
      dispatchEvent(new CustomEvent('formatx:languagechange', { detail: { language } }));
    }

    requestAnimationFrame(() => {
      if (preservedHash && location.hash !== preservedHash) {
        const url = new URL(location.href);
        url.hash = preservedHash;
        history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
      updateToggle(toggle, language);
    });
  }

  function install() {
    const container = findContainer();
    if (!(container instanceof HTMLElement)) return false;

    container.hidden = false;
    container.removeAttribute('aria-hidden');
    container.classList.add('language-switch', 'language-control', 'fx-single-language-switch');
    container.dataset.fxSingleLanguageToggle = 'ready-v2';
    container.dataset.i18nControl = 'true';
    hideLegacyControls(container);

    container.querySelectorAll('.fx-language-toggle').forEach(button => button.remove());
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'fx-language-toggle';
    toggle.dataset.languageToggle = 'true';

    const initial = storedLanguage();
    applyBilingualCopy(initial);
    updateToggle(toggle, initial);

    toggle.addEventListener('click', () => {
      const current = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      setLanguage(current === 'hu' ? 'en' : 'hu', true, container, toggle);
    });

    container.appendChild(toggle);
    addEventListener('formatx:languagechange', event => {
      const language = event.detail?.language;
      if (SUPPORTED.has(language)) {
        applyBilingualCopy(language);
        updateToggle(toggle, language);
      }
    });

    const languageObserver = new MutationObserver(() => {
      const language = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      updateToggle(toggle, language);
      hideLegacyControls(container);
    });
    languageObserver.observe(ROOT, { attributes: true, attributeFilter: ['lang'] });

    const duplicateObserver = new MutationObserver(() => hideLegacyControls(container));
    duplicateObserver.observe(document.documentElement, { subtree: true, childList: true });

    ROOT.dataset.fxSingleLanguageToggle = 'ready';
    ROOT.dataset.fxSingleLanguageToggleVersion = '2';
    return true;
  }

  ensureStyle();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
}());
