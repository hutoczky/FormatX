(function () {
  'use strict';

  const ROOT = document.documentElement;
  const THEME_KEY = 'formatx-site-theme';
  const RELEASE_URL = '/scifi-ui/data/current-release.json';
  const LEGAL_I18N_PATHS = new Set([
    '/scifi-ui/terms.html',
    '/scifi-ui/privacy.html',
    '/scifi-ui/support.html'
  ]);

  function language() { return ROOT.lang === 'en' ? 'en' : 'hu'; }
  function copy(hu, en) { return language() === 'en' ? en : hu; }

  function themePreference() {
    const query = new URLSearchParams(location.search).get('theme');
    if (query === 'dark' || query === 'light') return query;
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) {}
    return 'dark';
  }

  function applyTheme(value, persist) {
    const theme = value === 'light' ? 'light' : 'dark';
    ROOT.dataset.theme = theme;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#e8f2f8' : '#02070d';
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    }
  }

  function initialiseTheme() {
    applyTheme(themePreference(), false);
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.addEventListener('click', () => applyTheme(button.dataset.themeChoice, true));
    });
  }

  function initialiseMenu() {
    const button = document.getElementById('menu-toggle');
    const nav = document.getElementById('primary-nav');
    if (!button || !nav) return;
    const close = () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    };
    button.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    addEventListener('resize', () => { if (innerWidth > 980) close(); });
  }

  function initialiseReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(item => item.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach(item => observer.observe(item));
  }

  function initialiseLegalPageI18n() {
    if (!LEGAL_I18N_PATHS.has(location.pathname)) return;
    if (document.querySelector('script[data-fx-legal-page-i18n]')) return;
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/legal-page-i18n.js?v=20260810-legal-i18n-1';
    script.defer = true;
    script.dataset.fxLegalPageI18n = 'true';
    document.head.appendChild(script);
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return copy('Nincs közzétett adat', 'No published data');
    const unit = bytes >= 1024 ** 3 ? 'GiB' : 'MiB';
    const divisor = unit === 'GiB' ? 1024 ** 3 : 1024 ** 2;
    return new Intl.NumberFormat(language() === 'en' ? 'en-GB' : 'hu-HU', { maximumFractionDigits: 2 }).format(bytes / divisor) + ' ' + unit;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return copy('Nincs közzétett adat', 'No published data');
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'hu-HU', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  function trustedAssetUrl(value) {
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin && [
        '/download/multiplatform',
        '/download/android',
        '/download/android-native-beta',
      ].includes(url.pathname);
    } catch (_) { return false; }
  }

  function trustedPageUrl(value) {
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin && url.pathname.startsWith('/scifi-ui/');
    } catch (_) { return false; }
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setLink(id, href) {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLAnchorElement)) return;
    if (href && trustedAssetUrl(href)) {
      element.href = href;
      element.removeAttribute('aria-disabled');
    } else {
      element.removeAttribute('href');
      element.setAttribute('aria-disabled', 'true');
    }
  }

  function renderRelease(data) {
    const asset = data?.channels?.multiplatform;
    const available = data?.ok === true && asset?.available === true && trustedAssetUrl(asset.download_url);
    const state = copy('Teljes multiplatform verzió', 'Full multiplatform version');
    const unavailable = copy('A hivatalos csomag metaadata nem érhető el.', 'Official package metadata is unavailable.');

    setText('hero-version', state);
    setText('release-state', state);
    setText('release-name', available ? 'FormatX Suite Pro' : unavailable);
    setText('release-published', data?.published_at ? formatDate(data.published_at) : unavailable);
    setText('download-file-name', available ? copy('FormatX Suite Pro multiplatform csomag', 'FormatX Suite Pro multiplatform package') : unavailable);
    setText('download-version', state);
    setText('download-size', available ? formatBytes(asset.size) : unavailable);
    setText('release-sha256', asset?.digest || copy('Nincs közzétett digest', 'No published digest'));
    setText('release-api-note', available
      ? copy('A kiadási adatok a FormatX hivatalos kiadási szolgáltatásából származnak.', 'Release data comes from the official FormatX release service.')
      : unavailable);

    for (const id of ['hero-download', 'download-primary']) setLink(id, available ? asset.download_url : null);
    const pageUrl = typeof data?.release_url === 'string' && trustedPageUrl(data.release_url) ? data.release_url : null;
    for (const id of ['release-page-link', 'download-release-page']) {
      const element = document.getElementById(id);
      if (!(element instanceof HTMLAnchorElement)) continue;
      if (pageUrl) {
        element.href = pageUrl;
        element.removeAttribute('aria-disabled');
        element.removeAttribute('target');
        element.removeAttribute('rel');
      } else {
        element.removeAttribute('href');
        element.setAttribute('aria-disabled', 'true');
      }
    }
    ROOT.dataset.releaseState = available ? 'full-release-available' : 'metadata-unavailable';
  }

  async function loadRelease() {
    try {
      const response = await fetch(RELEASE_URL, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(String(response.status));
      renderRelease(await response.json());
    } catch (_) {
      renderRelease({ ok: false, channels: { multiplatform: { available: false } } });
    }
  }

  function initialiseCopy() {
    const button = document.getElementById('copy-checksum');
    const value = document.getElementById('release-sha256');
    if (!button || !value) return;
    button.addEventListener('click', async () => {
      const checksum = value.textContent.trim();
      if (!/^sha256:[a-f0-9]{64}$/i.test(checksum)) return;
      try {
        await navigator.clipboard.writeText(checksum);
        button.textContent = copy('Másolva', 'Copied');
      } catch (_) {
        button.textContent = copy('Másolás sikertelen', 'Copy failed');
      }
    });
  }

  initialiseTheme();
  initialiseMenu();
  initialiseReveal();
  initialiseLegalPageI18n();
  initialiseCopy();
  loadRelease();
  addEventListener('formatx:languagechange', loadRelease);
}());
