(function () {
  'use strict';

  const ROOT_ID = 'formatx-site-ambient';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const isFirefox = /Firefox\//i.test(navigator.userAgent);
  const lowConcurrency = Number(navigator.hardwareConcurrency || 8) <= 4;
  const lowMemory = Number(navigator.deviceMemory || 8) <= 4;
  const balancedMode = reduceMotion.matches || coarsePointer.matches || isFirefox || lowConcurrency || lowMemory;
  const particleCount = reduceMotion.matches ? 0 : (balancedMode ? 6 : 12);
  const scenes = [
    { selector: '#product', name: 'core' },
    { selector: '#pricing', name: 'licence' },
    { selector: '#features', name: 'modules' },
    { selector: '#project-details', name: 'architecture' },
    { selector: '#solutions', name: 'integrity' },
    { selector: '#resources', name: 'release' }
  ];

  let root;
  let pointerFrame = 0;
  let scrollFrame = 0;

  function particle(index) {
    const x = (index * 37 + 11) % 100;
    const y = (index * 53 + 19) % 100;
    const size = 1 + ((index * 7) % 4) * 0.42;
    const opacity = 0.18 + ((index * 13) % 7) * 0.055;
    const duration = 18 + ((index * 11) % 17);
    const delay = -((index * 1.37) % duration);
    const drift = -42 + ((index * 29) % 84);
    return '<i style="--fx-particle-x:' + x + '%;--fx-particle-y:' + y + '%;--fx-particle-size:' + size.toFixed(2) + 'px;--fx-particle-opacity:' + opacity.toFixed(2) + ';--fx-particle-duration:' + duration + 's;--fx-particle-delay:' + delay.toFixed(2) + 's;--fx-particle-drift:' + drift + 'px"></i>';
  }

  function build() {
    if (document.getElementById(ROOT_ID)) return;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.className = 'fx-site-ambient';
    root.dataset.scene = 'core';
    root.dataset.visualSystem = 'formatx-quantum-aurora';
    root.dataset.performance = balancedMode ? 'balanced' : 'full';
    root.dataset.browser = isFirefox ? 'firefox' : 'standard';
    root.dataset.paused = document.hidden ? 'true' : 'false';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = [
      '<div class="fx-site-ambient-grid"></div>',
      '<div class="fx-site-ambient-aura fx-site-ambient-aura--one"></div>',
      '<div class="fx-site-ambient-aura fx-site-ambient-aura--two"></div>',
      '<div class="fx-site-ambient-aura fx-site-ambient-aura--three"></div>',
      '<div class="fx-site-ambient-streams"></div>',
      '<div class="fx-site-ambient-beam"></div>',
      '<div class="fx-site-ambient-signature"><span></span><span></span><span></span><span></span></div>',
      '<div class="fx-site-ambient-particles">' + Array.from({ length: particleCount }, function (_, index) { return particle(index); }).join('') + '</div>',
      '<div class="fx-site-ambient-vignette"></div>'
    ].join('');
    document.body.prepend(root);
    document.documentElement.classList.add('fx-site-ambient-ready');
    document.documentElement.dataset.fxVisualSystem = 'quantum-aurora';
    document.documentElement.dataset.fxPerformanceMode = root.dataset.performance;
  }

  function bindPointer() {
    if (!root || root.dataset.performance !== 'full' || !finePointer.matches || reduceMotion.matches) return;
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
    if (!root || root.dataset.performance !== 'full' || reduceMotion.matches) return;
    window.addEventListener('scroll', function () {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(function () {
        scrollFrame = 0;
        const offset = Math.max(-24, Math.min(24, window.scrollY * 0.014));
        document.documentElement.style.setProperty('--fx-bg-scroll', offset.toFixed(2) + 'px');
      });
    }, { passive: true });
  }

  function bindScenes() {
    if (!root || !('IntersectionObserver' in window)) return;
    const targets = scenes.map(function (scene) {
      return { element: document.querySelector(scene.selector), name: scene.name };
    }).filter(function (item) { return item.element; });
    if (!targets.length) return;

    const visibility = new Map();
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      let selected = targets[0];
      let score = -1;
      targets.forEach(function (item) {
        const ratio = visibility.get(item.element) || 0;
        const rect = item.element.getBoundingClientRect();
        const centerDistance = Math.abs((rect.top + rect.height / 2) - window.innerHeight / 2);
        const centerScore = Math.max(0, 1 - centerDistance / Math.max(window.innerHeight, 1));
        const nextScore = ratio * 1.35 + centerScore * 0.65;
        if (nextScore > score) {
          selected = item;
          score = nextScore;
        }
      });
      if (root.dataset.scene !== selected.name) {
        root.dataset.scene = selected.name;
        document.documentElement.dataset.fxScene = selected.name;
      }
    }, {
      rootMargin: '-22% 0px -22% 0px',
      threshold: [0, 0.08, 0.2, 0.4, 0.65, 0.9]
    });

    targets.forEach(function (item) {
      visibility.set(item.element, 0);
      observer.observe(item.element);
    });
  }

  function bindVisibility() {
    document.addEventListener('visibilitychange', function () {
      if (!root) return;
      root.dataset.paused = document.hidden ? 'true' : 'false';
    });
  }

  function initialise() {
    if (!document.body || document.documentElement.dataset.fxSiteAmbient === 'ready') return;
    document.documentElement.dataset.fxSiteAmbient = 'ready';
    build();
    bindPointer();
    bindScroll();
    bindScenes();
    bindVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
