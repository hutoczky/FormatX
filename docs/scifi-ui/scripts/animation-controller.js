(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('reduce-motion', reduce);

  // Activate visual layers after preloader completes
  document.addEventListener('preloader:done', () => {
    const layers = document.getElementById('theme-layers');
    if (layers) layers.classList.add('is-active');
  }, { once: true });
})();