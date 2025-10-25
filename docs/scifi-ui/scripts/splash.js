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

  // Start timestamp — target total dwell time ≈1.5s
  const start = (window.performance && performance.now) ? performance.now() : Date.now();

  // Set caption immediately
  setCaption();

  // Hard cap: hide after 1500 ms regardless of load timing
  const HARD_HIDE_MS = 1500;
  const hardTimer = setTimeout(hideSplash, HARD_HIDE_MS);

  // After window load, ensure the total dwell time is ~1.5s, then hide
  window.addEventListener('load', function () {
    try { clearTimeout(hardTimer); } catch (e) {}
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const elapsed = now - start;
    const remain = Math.max(0, HARD_HIDE_MS - elapsed);
    setTimeout(hideSplash, remain);
  });

  // Update caption on theme change while visible
  document.addEventListener('click', function (e) {
    const btn = e.target && e.target.closest && e.target.closest('[data-theme]');
    if (btn && !hidden) setTimeout(setCaption, 0);
  });

  // Cross-tab theme sync
  window.addEventListener('storage', function (e) {
    if (e.key === 'scifi-ui:theme' && !hidden) setCaption();
  });
})();