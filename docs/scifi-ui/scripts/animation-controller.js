(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('reduce-motion', reduce);

  const pre = document.getElementById('preloader');
  if (pre) {
    const bar = pre.querySelector('.preloader__bar');
    const label = pre.querySelector('.preloader__label');
    let v = 0;
    const tick = () => {
      v = Math.min(100, v + (reduce ? 40 : 6 + Math.random() * 10));
      pre.setAttribute('aria-valuenow', String(v));
      if (label) label.textContent = `Rendszer inicializálás… ${v}%`;
      if (bar) {
        bar.style.setProperty('--w', `${v}%`);
        bar.style.width = `${v}%`;
        bar.style.animation = 'none';
      }
      if (v < 100) requestAnimationFrame(tick);
      else setTimeout(() => pre.remove(), reduce ? 80 : 240);
    };
    requestAnimationFrame(tick);
  }

  const layers = document.getElementById('theme-layers');
  if (layers) layers.classList.add('is-active');
})();