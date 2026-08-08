(function () {
  'use strict';

  const ROOT = document.documentElement;
  const STORAGE_KEY = 'formatx-language';
  const SUPPORTED = new Set(['hu', 'en']);
  const VERSION = '4';
  const currentState = ROOT.dataset.fxSingleLanguageToggle;
  if (ROOT.dataset.fxSingleLanguageToggleVersion === VERSION && (currentState === 'loading' || currentState === 'ready')) return;
  ROOT.dataset.fxSingleLanguageToggle = 'loading';
  ROOT.dataset.fxSingleLanguageToggleVersion = VERSION;

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
    link.href = assetUrl('../styles/single-language-toggle.css?v=20260808-single-language-5');
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
      if (element.matches('input,textarea')) return;
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-hu-label][data-en-label]').forEach(element => {
      element.setAttribute('aria-label', element.dataset[language + 'Label']);
    });
  }

  function persistLanguage(language) {
    try { localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  function mobileMode() {
    return matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  }

  function forceHidden(element) {
    if (!(element instanceof HTMLElement)) return;
    element.hidden = true;
    element.tabIndex = -1;
    element.setAttribute('aria-hidden', 'true');
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('opacity', '0', 'important');
    element.style.setProperty('pointer-events', 'none', 'important');
  }

  function clearForcedHidden(element) {
    if (!(element instanceof HTMLElement)) return;
    element.hidden = false;
    element.removeAttribute('aria-hidden');
    for (const property of ['display', 'visibility', 'opacity', 'pointer-events']) element.style.removeProperty(property);
  }

  function placeContainer(container) {
    if (!(container instanceof HTMLElement)) return;
    if (mobileMode() && document.body && container.parentElement !== document.body) document.body.appendChild(container);
    if (mobileMode()) {
      container.hidden = false;
      container.removeAttribute('aria-hidden');
      container.style.setProperty('display', 'block', 'important');
      container.style.setProperty('position', 'fixed', 'important');
      container.style.setProperty('top', '14px', 'important');
      container.style.setProperty('right', '70px', 'important');
      container.style.setProperty('z-index', '10040', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
      container.style.setProperty('opacity', '1', 'important');
    }
  }

  function createContainer() {
    const container = document.createElement('div');
    container.className = 'language-switch language-control fx-single-language-switch';
    container.dataset.i18nControl = 'true';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Language / Nyelv');
    const headerActions = document.querySelector('.header-actions');
    const legalHeader = document.querySelector('.legal-header-inner');
    if (mobileMode() && document.body) document.body.appendChild(container);
    else if (headerActions) headerActions.prepend(container);
    else if (legalHeader) legalHeader.insertBefore(container, legalHeader.querySelector('.theme-control'));
    else document.body?.prepend(container);
    placeContainer(container);
    return container;
  }

  function findContainer() {
    return document.querySelector('.language-switch, .language-control') || createContainer();
  }

  function legacyButtons(container) {
    return Array.from(container.querySelectorAll('[data-language], [data-language-choice]'));
  }

  function hideLegacyControls(primaryContainer, activeToggle) {
    document.querySelectorAll('[data-language], [data-language-choice]').forEach(forceHidden);
    document.querySelectorAll('.fx-language-toggle').forEach(button => {
      if (button !== activeToggle) button.remove();
    });
    document.querySelectorAll('.language-switch, .language-control').forEach(container => {
      if (container !== primaryContainer) {
        container.querySelectorAll('.fx-language-toggle').forEach(button => button.remove());
        forceHidden(container);
      }
    });
    if (activeToggle) clearForcedHidden(activeToggle);
  }

  function updateToggle(toggle, language) {
    const next = language === 'hu' ? 'en' : 'hu';
    clearForcedHidden(toggle);
    toggle.textContent = language.toUpperCase();
    toggle.dataset.nextLanguage = next;
    toggle.lang = language;
    toggle.setAttribute('aria-label', language === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian');
    toggle.title = language === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian';
    if (mobileMode()) {
      toggle.style.setProperty('display', 'inline-flex', 'important');
      toggle.style.setProperty('visibility', 'visible', 'important');
      toggle.style.setProperty('opacity', '1', 'important');
      toggle.style.setProperty('pointer-events', 'auto', 'important');
    }
  }

  function publishLanguageChange(language) {
    dispatchEvent(new CustomEvent('formatx:languagechange', { detail: { language, source: 'single-language-toggle-v4' } }));
  }

  function setLanguage(language, persist, container, toggle) {
    if (!SUPPORTED.has(language)) return;
    const preservedHash = location.hash;
    if (persist) persistLanguage(language);
    applyBilingualCopy(language);
    const legacy = legacyButtons(container).find(button => button.dataset.language === language || button.dataset.languageChoice === language);
    if (window.FormatXI18n?.setLanguage) window.FormatXI18n.setLanguage(language, persist);
    else if (legacy) legacy.click();
    publishLanguageChange(language);
    requestAnimationFrame(() => {
      if (preservedHash && location.hash !== preservedHash) {
        const url = new URL(location.href);
        url.hash = preservedHash;
        history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
      updateToggle(toggle, language);
      hideLegacyControls(container, toggle);
    });
  }

  function install() {
    if (ROOT.dataset.fxSingleLanguageToggle === 'ready' && ROOT.dataset.fxSingleLanguageToggleVersion === VERSION) return true;
    const container = findContainer();
    if (!(container instanceof HTMLElement)) return false;
    placeContainer(container);
    container.hidden = false;
    container.removeAttribute('aria-hidden');
    container.classList.add('language-switch', 'language-control', 'fx-single-language-switch');
    container.dataset.fxSingleLanguageToggle = 'ready-v4';
    container.dataset.i18nControl = 'true';

    document.querySelectorAll('.fx-language-toggle').forEach(button => button.remove());
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'fx-language-toggle';
    toggle.dataset.languageToggle = 'true';
    const initial = storedLanguage();
    applyBilingualCopy(initial);
    updateToggle(toggle, initial);
    container.appendChild(toggle);
    hideLegacyControls(container, toggle);

    toggle.addEventListener('click', () => {
      const current = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      setLanguage(current === 'hu' ? 'en' : 'hu', true, container, toggle);
    });
    container.addEventListener('click', event => {
      if (event.target === container) toggle.click();
    });

    addEventListener('formatx:languagechange', event => {
      const language = event.detail?.language;
      if (SUPPORTED.has(language)) {
        applyBilingualCopy(language);
        updateToggle(toggle, language);
        hideLegacyControls(container, toggle);
      }
    });

    const observer = new MutationObserver(() => {
      const language = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      placeContainer(container);
      updateToggle(toggle, language);
      hideLegacyControls(container, toggle);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'], subtree: false, childList: false });

    const duplicates = new MutationObserver(() => hideLegacyControls(container, toggle));
    duplicates.observe(document.documentElement, { subtree: true, childList: true });
    addEventListener('resize', () => placeContainer(container), { passive: true });
    addEventListener('pagehide', () => { observer.disconnect(); duplicates.disconnect(); }, { once: true });

    ROOT.dataset.fxSingleLanguageToggle = 'ready';
    ROOT.dataset.fxSingleLanguageToggleVersion = VERSION;
    return true;
  }

  ensureStyle();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
}());
