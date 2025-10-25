(function () {
  const CAPTIONS = {
    lcars: 'Üdvözöl az LCARS konzol',
    holo:  'Üdvözöl a Hologram HUD',
    cyber: 'Üdvözöl a CyberDeck'
  };
  const THEMES = ['lcars','holo','cyber'];
  let hidden = false;

  function currentTheme() {
    const html = document.documentElement;
    const body = document.body;
    for (const t of THEMES) {
      if (html.classList.contains('theme-' + t)) return t;
      if (body.classList.contains('theme-' + t)) return t;
    }
    return 'lcars';
  }

  function setCaption() {
    const el = document.querySelector('#splash .caption');
    if (el) el.textContent = CAPTIONS[currentTheme()] || CAPTIONS.lcars;
  }

  function hideSplash() {
    if (hidden) return;
    hidden = true;
    const sp = document.getElementById('splash');
    if (sp) sp.classList.add('hidden');
  }

  // start time to guarantee ~5s láthatóság
  const start = (window.performance && performance.now) ? performance.now() : Date.now();

  // beállítás azonnal
  setCaption();

  // Hard cap: 5000ms után mindenképp eltűnik
  const HARD_HIDE_MS = 5000;
  const hardTimer = setTimeout(hideSplash, HARD_HIDE_MS);

  // Teljes betöltés után is figyelünk, de minimum 5s kijelzés biztosított
  window.addEventListener('load', function () {
    try { clearTimeout(hardTimer); } catch (e) { }
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const elapsed = now - start;
    const remain = Math.max(0, HARD_HIDE_MS - elapsed);
    setTimeout(hideSplash, remain);
  });

  // Témaváltáskor frissítsük a feliratot, ha még látszik
  document.addEventListener('click', function (e) {
    const btn = e.target && e.target.closest && e.target.closest('[data-theme]');
    if (btn && !hidden) setTimeout(setCaption, 0);
  });

  // Tabok közötti szinkron
  window.addEventListener('storage', function (e) {
    if (e.key === 'scifi-ui:theme' && !hidden) setCaption();
  });
})();