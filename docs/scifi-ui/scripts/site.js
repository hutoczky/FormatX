(function () {
  const STORAGE_KEY = 'scifi-ui:theme';
  const THEMES = ['lcars', 'holo', 'cyber'];
  const root = document.body;

  const nav = document.querySelector('.theme-switch');
  const buttons = nav ? nav.querySelectorAll('[data-theme]') : [];

  function parseThemeFromUrl() {
    try {
      const u = new URL(window.location.href);
      const q = (u.searchParams.get('theme') || '').toLowerCase();
      if (THEMES.includes(q)) return q;
      const hashMatch = (window.location.hash.match(/theme=([a-z]+)/i) || [])[1];
      const h = (hashMatch || '').toLowerCase();
      if (THEMES.includes(h)) return h;
    } catch (_) {}
    return null;
  }

  function getCurrentTheme() {
    const c = Array.from(root.classList)
      .map(cn => cn.replace(/^theme-/, ''))
      .find(t => THEMES.includes(t));
    return c || null;
  }

  function setUrlParam(key, value) {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set(key, value);
      history.replaceState(null, '', u.toString());
    } catch (_) {}
  }

  function syncGlitch() {
    const title = document.querySelector('.title');
    if (!title) return;
    if (root.classList.contains('theme-cyber')) {
      // mindig a tényleges feliratot tükrözzük
      title.setAttribute('data-glitch', title.textContent.trim());
    } else {
      title.removeAttribute('data-glitch');
    }
  }

  function setAriaPressed(theme) {
    buttons.forEach(btn => {
      const isActive = btn.getAttribute('data-theme') === theme;
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) return false;
    const before = getCurrentTheme();
    if (before === theme) {
      // már aktív, csak állapotokat frissítünk
      setAriaPressed(theme);
      syncGlitch();
      return false;
    }
    THEMES.forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${theme}`);
    setAriaPressed(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
    syncGlitch();
    return true;
  }

  // Initial theme: URL > localStorage > existing class > default
  const initial =
    parseThemeFromUrl() ||
    (function () { try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; } })() ||
    getCurrentTheme() ||
    'lcars';

  applyTheme(initial);

  if (nav) {
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme]');
      if (!btn) return;
      const t = btn.getAttribute('data-theme');
      if (applyTheme(t)) setUrlParam('theme', t);
    });

    nav.addEventListener('keydown', (e) => {
      const btn = e.target.closest && e.target.closest('[data-theme]');
      if (!btn) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const t = btn.getAttribute('data-theme');
        if (applyTheme(t)) setUrlParam('theme', t);
      }
    });
  }

  // URL vagy hash változás esetén frissítünk
  window.addEventListener('popstate', () => {
    const t = parseThemeFromUrl();
    if (t) applyTheme(t);
  });
  window.addEventListener('hashchange', () => {
    const t = parseThemeFromUrl();
    if (t) applyTheme(t);
  });

  // Tabok közötti szinkron
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && typeof e.newValue === 'string') {
      const t = e.newValue;
      if (THEMES.includes(t)) applyTheme(t);
    }
  });
})();