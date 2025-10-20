(function () {
  const STORAGE_KEY = 'formatx-theme';
  const THEMES = [
    { value: 'lcars', label: 'Star Trek LCARS (alap)' },
    { value: 'cyberpunk', label: 'Cyberpunk 2077' },
    { value: 'starwars', label: 'Star Wars' },
    { value: 'stargate', label: 'Stargate' },
  ];

  function getSavedTheme() {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      if (t) return t;
    } catch (_) {}
    return 'lcars';
  }

  function saveTheme(t) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch (_) {}
  }

  function clearThemeClasses(el) {
    el.classList.forEach(c => { if (c.startsWith('theme-')) el.classList.remove(c); });
  }

  function applyTheme(t) {
    const html = document.documentElement;
    const body = document.body;
    clearThemeClasses(html);
    clearThemeClasses(body);
    html.classList.add(`theme-${t}`);
    body.classList.add(`theme-${t}`);

    // Star Wars esetén „starfield” réteg
    if (t === 'starwars') {
      if (!document.querySelector('.space')) {
        const space = document.createElement('div');
        space.className = 'space';
        document.body.appendChild(space);
      }
    } else {
      const space = document.querySelector('.space');
      if (space) space.remove();
    }
  }

  // Intro overlay letiltva (policy/jogi okokból) – no-op
  function intro(theme) { return; }

  function buildSwitcher(current) {
    const wrap = document.createElement('div');
    wrap.id = 'theme-switcher';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Témaválasztó');

    const label = document.createElement('label');
    label.setAttribute('for', 'theme-select');
    label.textContent = 'Téma:';

    const select = document.createElement('select');
    select.id = 'theme-select';
    select.ariaLabel = 'Téma kiválasztása';

    THEMES.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.value;
      opt.textContent = t.label;
      if (t.value === current) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const val = e.target.value;
      applyTheme(val);
      saveTheme(val);
      // intro(val);  // szándékosan kikapcsolva
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    document.body.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // themes.css betöltése, ha még nincs linkelve
    if (!document.querySelector('link[data-formatx-themes]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'themes.css';
      link.setAttribute('data-formatx-themes', '1');
      document.head.appendChild(link);
    }

    const theme = getSavedTheme();
    applyTheme(theme);
    buildSwitcher(theme);

    // intro(theme); // szándékosan kikapcsolva
  });
})();