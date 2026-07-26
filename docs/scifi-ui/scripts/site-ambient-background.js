(function () {
  'use strict';

  const ROOT_ID = 'formatx-site-ambient';
  const PARTICLE_COUNT = 22;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  let root;
  let pointerFrame = 0;
  let scrollFrame = 0;

  function particle(index) {
    const x = (index * 37 + 11) % 100;
    const y = (index * 53 + 19) % 100;
    const size = 1 + ((index * 7) % 4) * 0.42;
    const opacity = 0.18 + ((index * 13) % 7) * 0.055;
    const duration = 15 + ((index * 11) % 17);
    const delay = -((index * 1.37) % duration);
    const drift = -42 + ((index * 29) % 84);
    return '<i style="--fx-particle-x:' + x + '%;--fx-particle-y:' + y + '%;--fx-particle-size:' + size.toFixed(2) + 'px;--fx-particle-opacity:' + opacity.toFixed(2) + ';--fx-particle-duration:' + duration + 's;--fx-particle-delay:' + delay.toFixed(2) + 's;--fx-particle-drift:' + drift + 'px"></i>';
  }

  function build() {
    if (document.getElementById(ROOT_ID)) return;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'fx-site-ambient';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = [
      '<div class="fx-site-ambient-grid"></div>',
      '<div class="fx-site-ambient-aura fx-site-ambient-aura--one"></div>',
      '<div class="fx-site-ambient-aura fx-site-ambient-aura--two"></div>',
      '<div class="fx-site-ambient-aura fx-site-ambient-aura--three"></div>',
      '<div class="fx-site-ambient-streams"></div>',
      '<div class="fx-site-ambient-beam"></div>',
      '<div class="fx-site-ambient-particles">' + Array.from({ length: PARTICLE_COUNT }, function (_, index) { return particle(index); }).join('') + '</div>',
      '<div class="fx-site-ambient-vignette"></div>'
    ].join('');
    document.body.prepend(root);
    document.documentElement.classList.add('fx-site-ambient-ready');
  }

  function bindPointer() {
    if (!finePointer.matches || reduceMotion.matches) return;
    window.addEventListener('pointermove', function (event) {
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(function () {
        pointerFrame = 0;
        const x = Math.max(0, Math.min(100, event.clientX / Math.max(1, window.innerWidth) * 100));
        const y = Math.max(0, Math.min(100, event.clientY / Math.max(1, window.innerHeight) * 100));
        document.documentElement.style.setProperty('--fx-bg-x', x.toFixed(2) + '%');
        document.documentElement.style.setProperty('--fx-bg-y', y.toFixed(2) + '%');
      });
    }, { passive: true });
  }

  function bindScroll() {
    if (reduceMotion.matches) return;
    window.addEventListener('scroll', function () {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(function () {
        scrollFrame = 0;
        const offset = Math.max(-30, Math.min(30, window.scrollY * 0.018));
        document.documentElement.style.setProperty('--fx-bg-scroll', offset.toFixed(2) + 'px');
      });
    }, { passive: true });
  }

  function initialise() {
    if (!document.body || document.documentElement.dataset.fxSiteAmbient === 'ready') return;
    document.documentElement.dataset.fxSiteAmbient = 'ready';
    build();
    bindPointer();
    bindScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
