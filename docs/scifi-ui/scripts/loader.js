(function () {
  const KEY = 'sci-fi-ui-theme';
  const IMG = {
    lcars: 'assets/loading/loader-lcars.svg',
    starwars: 'assets/loading/loader-starwars.svg',
    cyberpunk: 'assets/loading/loader-cyberpunk.svg'
  };

  function currentTheme() {
    try {
      const s = localStorage.getItem(KEY);
      if (s && IMG[s]) return s;
    } catch (_) {}
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr && IMG[attr]) return attr;
    return 'lcars';
  }

  function setLoaderImage(theme) {
    const img = document.getElementById('loader-image');
    if (img) img.src = IMG[theme] || IMG.lcars;
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('show');
      setTimeout(() => loader.classList.remove('show'), 1200);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLoaderImage(currentTheme());
    document.querySelectorAll('nav [data-theme]').forEach(btn => {
      btn.addEventListener('click', () => setLoaderImage(btn.getAttribute('data-theme') || 'lcars'));
    });
  });

  window.setLoaderImage = setLoaderImage;
})();
