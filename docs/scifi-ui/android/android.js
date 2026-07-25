(function () {
  'use strict';

  const languageButton = document.getElementById('languageButton');
  const versionNode = document.getElementById('androidVersion');
  const navigationLinks = Array.from(document.querySelectorAll('.bottom-nav a'));
  const updateManifestUrl = '../downloads/android-mobile-update.json';

  function initialLanguage() {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = window.localStorage.getItem('formatx-mobile-language');
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    return String(window.navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function applyLanguage(language, persist) {
    const selected = language === 'en' ? 'en' : 'hu';
    document.documentElement.lang = selected;
    document.querySelectorAll('[data-mobile-hu][data-mobile-en]').forEach(function (element) {
      element.textContent = selected === 'en' ? element.dataset.mobileEn : element.dataset.mobileHu;
    });
    if (languageButton) languageButton.textContent = selected === 'en' ? 'EN' : 'HU';
    if (persist) {
      try { window.localStorage.setItem('formatx-mobile-language', selected); } catch (_) {}
      const current = new URL(window.location.href);
      current.searchParams.set('lang', selected);
      window.history.replaceState({}, '', current.pathname + current.search + current.hash);
    }
  }

  function setActiveNavigation() {
    const currentHash = window.location.hash || '#home';
    navigationLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === currentHash);
    });
  }

  async function loadVersion() {
    if (!versionNode) return;
    try {
      const response = await fetch(updateManifestUrl, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const payload = await response.json();
      const version = String(payload.versionName || '').trim();
      if (/^\d+\.\d+\.\d+$/.test(version)) versionNode.textContent = version;
    } catch (_) {}
  }

  const language = initialLanguage();
  applyLanguage(language, false);
  setActiveNavigation();
  loadVersion();

  if (languageButton) {
    languageButton.addEventListener('click', function () {
      applyLanguage(document.documentElement.lang === 'en' ? 'hu' : 'en', true);
    });
  }

  window.addEventListener('hashchange', setActiveNavigation);
  navigationLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      window.setTimeout(setActiveNavigation, 0);
    });
  });
}());
