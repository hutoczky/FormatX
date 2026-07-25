(function () {
  'use strict';

  if (document.documentElement.dataset.fx5kEffects === 'ready') return;
  document.documentElement.dataset.fx5kEffects = 'ready';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  let frame = 0;

  function svgElement(name, attributes) {
    const element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    return element;
  }

  function buildAtmosphere(system) {
    if (system.querySelector('.fx5k-cinematic-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'fx5k-cinematic-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = [
      '<div class="fx5k-depth-plane fx5k-depth-plane-a"></div>',
      '<div class="fx5k-depth-plane fx5k-depth-plane-b"></div>',
      '<div class="fx5k-depth-plane fx5k-depth-plane-c"></div>',
      '<div class="fx5k-holo-refraction"></div>',
      '<div class="fx5k-spectrum-edge"></div>'
    ].join('');
    system.prepend(layer);

    const map = system.querySelector('.fx5k-map');
    if (map) {
      const scan = document.createElement('div');
      scan.className = 'fx5k-scan-plane';
      scan.setAttribute('aria-hidden', 'true');
      map.append(scan);
    }
  }

  function buildCoreAperture(system) {
    const core = system.querySelector('.fx5k-core');
    if (!core || core.querySelector('.fx5k-core-orbit')) return;

    ['outer', 'middle', 'inner'].forEach(function (name, index) {
      const orbit = document.createElement('i');
      orbit.className = 'fx5k-core-orbit fx5k-core-orbit-' + name;
      orbit.style.setProperty('--fx5k-orbit-delay', (-index * 1.8) + 's');
      core.append(orbit);
    });

    const aperture = document.createElement('i');
    aperture.className = 'fx5k-core-aperture';
    core.append(aperture);
  }

  function buildSignalTraffic(system) {
    const svg = system.querySelector('.fx5k-map-links');
    if (!svg || svg.querySelector('.fx5k-signal-traffic')) return;

    const definitions = svgElement('defs');
    const filter = svgElement('filter', { id: 'fx5k-signal-glow', x: '-200%', y: '-200%', width: '400%', height: '400%' });
    filter.append(svgElement('feGaussianBlur', { stdDeviation: '3', result: 'blur' }));
    const merge = svgElement('feMerge');
    merge.append(svgElement('feMergeNode', { in: 'blur' }));
    merge.append(svgElement('feMergeNode', { in: 'SourceGraphic' }));
    filter.append(merge);
    definitions.append(filter);
    svg.prepend(definitions);

    const traffic = svgElement('g', { class: 'fx5k-signal-traffic', 'aria-hidden': 'true' });
    const routes = [
      'M300 210 L300 52',
      'M300 210 L92 134',
      'M300 210 L508 134',
      'M300 210 L120 322',
      'M300 210 L480 322',
      'M300 210 L300 370'
    ];

    routes.forEach(function (route, index) {
      const signal = svgElement('circle', {
        r: index % 2 === 0 ? '3.2' : '2.4',
        class: 'fx5k-travelling-signal',
        filter: 'url(#fx5k-signal-glow)'
      });
      const motion = svgElement('animateMotion', {
        path: route,
        dur: (3.8 + index * 0.42) + 's',
        begin: (-index * 0.68) + 's',
        repeatCount: 'indefinite',
        keyTimes: '0;0.18;0.82;1',
        keyPoints: '0;0.08;0.92;1',
        calcMode: 'spline',
        keySplines: '0.4 0 0.2 1;0.2 0 0.2 1;0.4 0 0.2 1'
      });
      signal.append(motion);
      traffic.append(signal);
    });
    svg.append(traffic);
  }

  function refractDetail(system, button) {
    const detail = system.querySelector('.fx5k-detail-panel');
    const map = system.querySelector('.fx5k-map');
    if (!detail || !map) return;

    const mapRect = map.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const x = ((buttonRect.left + buttonRect.width / 2 - mapRect.left) / mapRect.width) * 100;
    const y = ((buttonRect.top + buttonRect.height / 2 - mapRect.top) / mapRect.height) * 100;
    system.style.setProperty('--fx5k-source-x', Math.max(0, Math.min(100, x)).toFixed(1) + '%');
    system.style.setProperty('--fx5k-source-y', Math.max(0, Math.min(100, y)).toFixed(1) + '%');

    detail.classList.remove('is-refracting');
    void detail.offsetWidth;
    detail.classList.add('is-refracting');
    window.setTimeout(function () { detail.classList.remove('is-refracting'); }, 720);
  }

  function bindModuleEffects(system) {
    system.querySelectorAll('[data-fx5k-module]').forEach(function (button) {
      button.addEventListener('click', function () {
        system.dataset.fx5kActiveModule = button.dataset.fx5kModule || '';
        refractDetail(system, button);
      });
    });
  }

  function bindPerspective(system) {
    if (reduceMotion.matches || !finePointer.matches) return;

    system.addEventListener('pointermove', function (event) {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        const rect = system.getBoundingClientRect();
        const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        system.style.setProperty('--fx5k-tilt-x', ((0.5 - py) * 1.65).toFixed(2) + 'deg');
        system.style.setProperty('--fx5k-tilt-y', ((px - 0.5) * 2.2).toFixed(2) + 'deg');
        system.style.setProperty('--fx5k-local-x', (px * 100).toFixed(1) + '%');
        system.style.setProperty('--fx5k-local-y', (py * 100).toFixed(1) + '%');
        system.style.setProperty('--fx5k-parallax-x', ((px - 0.5) * 18).toFixed(2) + 'px');
        system.style.setProperty('--fx5k-parallax-y', ((py - 0.5) * 12).toFixed(2) + 'px');
      });
    }, { passive: true });

    system.addEventListener('pointerleave', function () {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      system.style.setProperty('--fx5k-tilt-x', '0deg');
      system.style.setProperty('--fx5k-tilt-y', '0deg');
      system.style.setProperty('--fx5k-parallax-x', '0px');
      system.style.setProperty('--fx5k-parallax-y', '0px');
      system.style.setProperty('--fx5k-local-x', '50%');
      system.style.setProperty('--fx5k-local-y', '30%');
    });
  }

  function observeEntrance(system) {
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      system.classList.add('is-cinematic-visible');
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          system.classList.add('is-cinematic-visible');
          observer.disconnect();
        }
      });
    }, { threshold: 0.16 });
    observer.observe(system);
  }

  function initialise() {
    const system = document.getElementById('formatx-future-5000');
    if (!system) {
      window.setTimeout(initialise, 80);
      return;
    }
    if (system.dataset.fx5kCinematic === 'ready') return;
    system.dataset.fx5kCinematic = 'ready';
    system.classList.add('fx5k-cinematic');
    system.dataset.fx5kActiveModule = 'integrity';
    buildAtmosphere(system);
    buildCoreAperture(system);
    if (!reduceMotion.matches) buildSignalTraffic(system);
    bindModuleEffects(system);
    bindPerspective(system);
    observeEntrance(system);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
