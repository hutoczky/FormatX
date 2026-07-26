(function () {
  'use strict';

  const ROOT = document.documentElement;
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)');
  const MOBILE = window.matchMedia('(max-width: 820px)');
  const SECTIONS = [
    ['product', '01', 'Core'],
    ['pricing', '02', 'Licence'],
    ['features', '03', 'Modules'],
    ['project-details', '04', 'System'],
    ['solutions', '05', 'Trust'],
    ['resources', '06', 'Release']
  ];

  let scrollFrame = 0;
  let pointerFrame = 0;
  let pointerX = 0.5;
  let pointerY = 0.42;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateLanguageCopy() {
    const english = ROOT.lang === 'en';
    document.querySelectorAll('[data-fx-hu][data-fx-en]').forEach(function (element) {
      element.textContent = english ? element.dataset.fxEn : element.dataset.fxHu;
    });
  }

  function installLanguageObserver() {
    updateLanguageCopy();
    const observer = new MutationObserver(function (records) {
      if (records.some(function (record) { return record.attributeName === 'lang'; })) {
        updateLanguageCopy();
      }
    });
    observer.observe(ROOT, { attributes: true, attributeFilter: ['lang'] });
  }

  function updateScrollState() {
    scrollFrame = 0;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = clamp(window.scrollY / scrollable, 0, 1);
    ROOT.style.setProperty('--fx-page-progress', progress.toFixed(5));
    ROOT.style.setProperty('--fx-page-progress-width', (progress * 100).toFixed(3) + '%');
    ROOT.classList.toggle('fx-page-scrolled', window.scrollY > 24);
  }

  function bindScrollState() {
    window.addEventListener('scroll', function () {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollState);
    }, { passive: true });
    updateScrollState();
  }

  function bindPointer() {
    if (!FINE_POINTER.matches || REDUCE.matches) return;
    window.addEventListener('pointermove', function (event) {
      pointerX = clamp(event.clientX / Math.max(window.innerWidth, 1), 0, 1);
      pointerY = clamp(event.clientY / Math.max(window.innerHeight, 1), 0, 1);
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(function () {
        pointerFrame = 0;
        ROOT.style.setProperty('--fx-pointer-x', (pointerX * 100).toFixed(2) + '%');
        ROOT.style.setProperty('--fx-pointer-y', (pointerY * 100).toFixed(2) + '%');
        ROOT.style.setProperty('--fx-pointer-x-num', pointerX.toFixed(4));
        ROOT.style.setProperty('--fx-pointer-y-num', pointerY.toFixed(4));
        ROOT.style.setProperty('--fx-engine-tilt-y', ((pointerX - 0.5) * -5).toFixed(3) + 'deg');
        ROOT.style.setProperty('--fx-engine-tilt-x', ((pointerY - 0.5) * 4).toFixed(3) + 'deg');
      });
    }, { passive: true });
  }

  function createChapterRail() {
    if (document.querySelector('.fx-chapter-rail')) return;
    const nav = document.createElement('nav');
    nav.className = 'fx-chapter-rail';
    nav.setAttribute('aria-label', ROOT.lang === 'en' ? 'Page chapters' : 'Oldalfejezetek');
    nav.innerHTML = SECTIONS.map(function (entry) {
      return '<a href="#' + entry[0] + '" data-fx-rail="' + entry[0] + '"><b>' + entry[1] + '</b><span>' + entry[2] + '</span></a>';
    }).join('');
    document.body.appendChild(nav);

    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(function (entries) {
      let winner = null;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!winner || entry.intersectionRatio > winner.intersectionRatio) winner = entry;
      });
      if (!winner) return;
      nav.querySelectorAll('a').forEach(function (link) {
        link.classList.toggle('is-active', link.dataset.fxRail === winner.target.id);
      });
    }, { rootMargin: '-32% 0px -46% 0px', threshold: [0.04, 0.18, 0.42, 0.72] });

    SECTIONS.forEach(function (entry) {
      const section = document.getElementById(entry[0]);
      if (section) observer.observe(section);
    });
  }

  function bindReveals() {
    const targets = document.querySelectorAll(
      '.price-card, .checkout-preview, .feature-cards article, .project-intro, .project-module-grid article, .project-workflow article, .project-foundation-grid article, .trust-promises article, .release-band'
    );
    targets.forEach(function (target) { target.classList.add('fx-reveal'); });

    if (REDUCE.matches || !('IntersectionObserver' in window)) {
      targets.forEach(function (target) { target.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (target) { observer.observe(target); });
  }

  function bindStory() {
    const story = document.querySelector('.fx-story');
    if (!story) return;
    const chapters = Array.from(story.querySelectorAll('[data-fx-story]'));
    if (!chapters.length) return;

    function activate(index) {
      const bounded = clamp(index, 0, chapters.length - 1);
      story.dataset.active = String(bounded);
      chapters.forEach(function (chapter, chapterIndex) {
        chapter.classList.toggle('is-active', chapterIndex === bounded);
      });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        const visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
        if (visible[0]) activate(Number(visible[0].target.dataset.fxStory));
      }, { rootMargin: '-28% 0px -38% 0px', threshold: [0.05, 0.2, 0.45, 0.7] });
      chapters.forEach(function (chapter) { observer.observe(chapter); });
    }

    function updateStoryProgress() {
      const rect = story.getBoundingClientRect();
      const distance = Math.max(story.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / distance, 0, 1);
      ROOT.style.setProperty('--fx-story-progress', progress.toFixed(4));
      ROOT.style.setProperty('--fx-story-angle', (-13 + progress * 72).toFixed(3) + 'deg');
      ROOT.style.setProperty('--fx-story-orbit-angle', (progress * 26).toFixed(3) + 'deg');
      ROOT.style.setProperty('--fx-story-scale', (.9 + progress * .08).toFixed(4));
    }

    window.addEventListener('scroll', updateStoryProgress, { passive: true });
    window.addEventListener('resize', updateStoryProgress, { passive: true });
    activate(0);
    updateStoryProgress();
  }

  function bindMagneticControls() {
    if (!FINE_POINTER.matches || REDUCE.matches) return;
    const controls = document.querySelectorAll('.gradient-button, .outline-button, .ghost-button, .checkout-open, .price-card > a');
    controls.forEach(function (control) {
      control.addEventListener('pointermove', function (event) {
        const rect = control.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        control.style.transform = 'translate(' + (x * 5).toFixed(2) + 'px,' + (y * 4).toFixed(2) + 'px)';
      });
      control.addEventListener('pointerleave', function () {
        control.style.removeProperty('transform');
      });
    });
  }

  function createHeroCanvas() {
    const canvas = document.getElementById('fx-hero-canvas');
    const hero = document.querySelector('.fx-igloo-hero');
    if (!canvas || !hero || !canvas.getContext) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const state = {
      width: 0,
      height: 0,
      ratio: 1,
      frame: 0,
      time: 0,
      visible: true,
      particles: []
    };

    function particleCount() {
      if (REDUCE.matches) return 8;
      return MOBILE.matches ? 24 : 52;
    }

    function rebuildParticles() {
      state.particles = Array.from({ length: particleCount() }, function (_, index) {
        const seed = ((index * 97) % 101) / 101;
        return {
          x: (seed * 0.73 + ((index * 37) % 43) / 43 * 0.27) % 1,
          y: (((index * 53) % 97) / 97),
          size: 0.45 + ((index * 17) % 13) / 13 * 1.3,
          speed: 0.08 + ((index * 11) % 17) / 17 * 0.18,
          phase: index * 0.71
        };
      });
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      state.ratio = Math.min(window.devicePixelRatio || 1, MOBILE.matches ? 1.2 : 1.6);
      state.width = Math.max(1, Math.round(rect.width));
      state.height = Math.max(1, Math.round(hero.offsetHeight));
      canvas.width = Math.round(state.width * state.ratio);
      canvas.height = Math.round(state.height * state.ratio);
      canvas.style.width = state.width + 'px';
      canvas.style.height = state.height + 'px';
      context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
      rebuildParticles();
      draw(performance.now());
    }

    function polygon(points, fill, stroke, lineWidth) {
      context.beginPath();
      points.forEach(function (point, index) {
        if (index === 0) context.moveTo(point[0], point[1]);
        else context.lineTo(point[0], point[1]);
      });
      context.closePath();
      if (fill) { context.fillStyle = fill; context.fill(); }
      if (stroke) { context.strokeStyle = stroke; context.lineWidth = lineWidth || 1; context.stroke(); }
    }

    function drawCrystal(cx, cy, scale, rotation) {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);
      context.scale(scale, scale);

      const gradientA = context.createLinearGradient(-210, -260, 220, 300);
      gradientA.addColorStop(0, 'rgba(240,249,255,.30)');
      gradientA.addColorStop(.35, 'rgba(153,211,248,.08)');
      gradientA.addColorStop(1, 'rgba(185,177,255,.13)');

      polygon([[-32,-330],[208,-155],[250,145],[65,340],[-212,170],[-235,-125]], gradientA, 'rgba(226,243,255,.20)', 1);
      polygon([[-32,-330],[36,-58],[-235,-125]], 'rgba(233,247,255,.08)', 'rgba(226,243,255,.09)', .8);
      polygon([[-32,-330],[208,-155],[36,-58]], 'rgba(215,235,255,.15)', 'rgba(226,243,255,.09)', .8);
      polygon([[36,-58],[208,-155],[250,145]], 'rgba(172,201,243,.055)', 'rgba(226,243,255,.08)', .8);
      polygon([[36,-58],[250,145],[65,340]], 'rgba(189,179,255,.09)', 'rgba(226,243,255,.08)', .8);
      polygon([[-212,170],[36,-58],[65,340]], 'rgba(217,240,255,.055)', 'rgba(226,243,255,.08)', .8);
      polygon([[-235,-125],[36,-58],[-212,170]], 'rgba(138,187,225,.05)', 'rgba(226,243,255,.08)', .8);

      const glow = context.createRadialGradient(26, -30, 0, 26, -30, 190);
      glow.addColorStop(0, 'rgba(228,247,255,.22)');
      glow.addColorStop(1, 'rgba(150,210,255,0)');
      context.fillStyle = glow;
      context.fillRect(-260, -350, 520, 700);
      context.restore();
    }

    function draw(now) {
      context.clearRect(0, 0, state.width, state.height);
      state.time = now * 0.001;

      const background = context.createRadialGradient(
        state.width * (0.67 + (pointerX - .5) * .035),
        state.height * (0.43 + (pointerY - .5) * .025),
        10,
        state.width * .67,
        state.height * .43,
        Math.max(state.width, state.height) * .72
      );
      background.addColorStop(0, 'rgba(106,144,176,.19)');
      background.addColorStop(.35, 'rgba(49,59,78,.10)');
      background.addColorStop(1, 'rgba(5,6,8,0)');
      context.fillStyle = background;
      context.fillRect(0, 0, state.width, state.height);

      state.particles.forEach(function (particle) {
        const drift = REDUCE.matches ? 0 : Math.sin(state.time * particle.speed + particle.phase) * 9;
        const x = particle.x * state.width + drift + (pointerX - .5) * 18;
        const y = particle.y * state.height + Math.cos(state.time * particle.speed + particle.phase) * 7;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = 'rgba(224,241,252,' + (0.12 + particle.size * 0.08).toFixed(3) + ')';
        context.fill();
      });

      const scroll = clamp(window.scrollY / Math.max(hero.offsetHeight, 1), 0, 1);
      const scale = Math.min(state.width, state.height) / 880 * (MOBILE.matches ? .92 : 1.05);
      const rotation = -0.20 + scroll * 0.38 + (pointerX - .5) * 0.045;
      drawCrystal(
        state.width * (MOBILE.matches ? .69 : .73) + (pointerX - .5) * 24,
        state.height * .49 + (pointerY - .5) * 20 - scroll * 34,
        scale,
        rotation
      );
    }

    function loop(now) {
      state.frame = 0;
      if (!state.visible || document.hidden) return;
      draw(now);
      if (!REDUCE.matches) state.frame = window.requestAnimationFrame(loop);
    }

    function start() {
      if (state.frame || REDUCE.matches || !state.visible || document.hidden) return;
      state.frame = window.requestAnimationFrame(loop);
    }

    function stop() {
      if (state.frame) window.cancelAnimationFrame(state.frame);
      state.frame = 0;
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(hero);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.visible = Boolean(entries[0] && entries[0].isIntersecting);
        if (state.visible) start(); else stop();
      }, { rootMargin: '180px 0px' }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    REDUCE.addEventListener && REDUCE.addEventListener('change', function () {
      rebuildParticles();
      if (REDUCE.matches) { stop(); draw(performance.now()); }
      else start();
    });

    resize();
    start();
  }

  function initialise() {
    if (ROOT.dataset.fxIgloo === 'ready') return;
    ROOT.dataset.fxIgloo = 'ready';
    ROOT.classList.add('fx-igloo-ready');
    installLanguageObserver();
    bindScrollState();
    bindPointer();
    bindStory();
    bindReveals();
    bindMagneticControls();
    createChapterRail();
    createHeroCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
