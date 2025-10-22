(() => {
  const root = document.documentElement;
  const btns = Array.from(document.querySelectorAll('.switcher .theme'));
  const link = document.getElementById('theme-css');
  const brand = document.getElementById('brand');
  const VERSION = 'v=f8637445';

  function setPressed(name){
    btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.theme === name ? 'true' : 'false'));
  }

  function setTheme(name){
    // Switch data-theme on <html>
    root.setAttribute('data-theme', name);
    localStorage.setItem('scifi-ui-theme', name);

    // Swap theme css with cache-buster
    const base = `styles/${name}.css`;
    const href = `${base}?${VERSION}`;
    if (link) link.href = href;

    // Cyberpunk: allow glitch on title, others off
    if (brand) {
      if (name === 'cyberpunk') brand.setAttribute('data-glitch', 'on');
      else brand.removeAttribute('data-glitch');
    }

    setPressed(name);
    document.dispatchEvent(new CustomEvent('scifi-ui:theme-changed', { detail: { theme: name } }));
  }

  // Initial theme (persisted)
  const saved = localStorage.getItem('scifi-ui-theme');
  if (saved) setTheme(saved);
  else setPressed(root.getAttribute('data-theme') || 'lcars');

  // Bind clicks
  btns.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));
})();