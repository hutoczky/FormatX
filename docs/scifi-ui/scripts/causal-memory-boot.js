(function () {
  'use strict';

  const ROOT_ID = 'formatx-future-5000';
  const MODULE_ORDER = ['observe', 'integrity', 'workflow', 'recovery', 'audit', 'release'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let attempts = 0;

  function createSvgElement(name, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    return node;
  }

  function moduleCenter(root, id) {
    const module = root.querySelector('[data-fx5k-module="' + id + '"]');
    if (!module) return null;
    const rootRect = root.getBoundingClientRect();
    const rect = module.getBoundingClientRect();
    return {
      x: rect.left - rootRect.left + rect.width / 2,
      y: rect.top - rootRect.top + rect.height / 2
    };
  }

  function buildBootLayer(root) {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const layer = createSvgElement('svg', {
      class: 'fx-causal-boot-layer',
      viewBox: '0 0 ' + width + ' ' + height,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true'
    });

    layer.innerHTML = [
      '<defs>',
      '<linearGradient id="fx-causal-boot-line" x1="0" y1="0" x2="1" y2="0">',
      '<stop offset="0" stop-color="#55efff" stop-opacity="0"/>',
      '<stop offset="0.45" stop-color="#89f7ff" stop-opacity="0.95"/>',
      '<stop offset="1" stop-color="#ffca7a" stop-opacity="0"/>',
      '</linearGradient>',
      '<radialGradient id="fx-causal-boot-core">',
      '<stop offset="0" stop-color="#ffffff" stop-opacity="1"/>',
      '<stop offset="0.22" stop-color="#73f2ff" stop-opacity="0.95"/>',
      '<stop offset="0.58" stop-color="#7c78ff" stop-opacity="0.36"/>',
      '<stop offset="1" stop-color="#07101f" stop-opacity="0"/>',
      '</radialGradient>',
      '<filter id="fx-causal-boot-glow" x="-100%" y="-100%" width="300%" height="300%">',
      '<feGaussianBlur stdDeviation="5" result="blur"/>',
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
      '</filter>',
      '</defs>'
    ].join('');

    const perimeter = createSvgElement('rect', {
      x: '1.5%',
      y: '1.2%',
      width: '97%',
      height: '97.6%',
      rx: '22',
      class: 'fx-causal-boot-perimeter',
      pathLength: '1'
    });
    layer.append(perimeter);

    const center = {
      x: width * 0.5,
      y: height * 0.54
    };
    const core = createSvgElement('circle', {
      cx: center.x,
      cy: center.y,
      r: Math.min(width, height) * 0.11,
      class: 'fx-causal-boot-core',
      fill: 'url(#fx-causal-boot-core)',
      filter: 'url(#fx-causal-boot-glow)'
    });
    layer.append(core);

    MODULE_ORDER.forEach(function (id, index) {
      const point = moduleCenter(root, id);
      if (!point) return;
      const path = createSvgElement('path', {
        d: 'M ' + center.x.toFixed(2) + ' ' + center.y.toFixed(2)
          + ' Q ' + ((center.x + point.x) / 2).toFixed(2) + ' ' + (center.y - 70 + index * 18).toFixed(2)
          + ' ' + point.x.toFixed(2) + ' ' + point.y.toFixed(2),
        class: 'fx-causal-boot-branch',
        pathLength: '1',
        style: '--fx-causal-boot-delay:' + (420 + index * 120) + 'ms'
      });
      layer.append(path);

      const node = createSvgElement('circle', {
        cx: point.x,
        cy: point.y,
        r: '13',
        class: 'fx-causal-boot-node',
        style: '--fx-causal-boot-delay:' + (700 + index * 120) + 'ms'
      });
      layer.append(node);
    });

    return layer;
  }

  function activateModules(root) {
    MODULE_ORDER.forEach(function (id, index) {
      const module = root.querySelector('[data-fx5k-module="' + id + '"]');
      if (!module) return;
      module.style.setProperty('--fx-causal-boot-delay', (620 + index * 120) + 'ms');
      module.classList.add('fx-causal-boot-module');
    });
  }

  function startBoot(root) {
    if (root.dataset.fxCausalBoot === 'ready') return;
    root.dataset.fxCausalBoot = 'ready';

    if (reduceMotion.matches) {
      root.classList.add('fx-causal-boot-complete');
      return;
    }

    root.classList.add('fx-causal-booting');
    const layer = buildBootLayer(root);
    root.prepend(layer);
    activateModules(root);

    window.setTimeout(function () {
      root.classList.add('fx-causal-boot-reveal');
    }, 1050);

    window.setTimeout(function () {
      root.classList.remove('fx-causal-booting');
      root.classList.add('fx-causal-boot-complete');
      root.querySelectorAll('.fx-causal-boot-module').forEach(function (module) {
        module.classList.remove('fx-causal-boot-module');
        module.style.removeProperty('--fx-causal-boot-delay');
      });
      layer.classList.add('fx-causal-boot-layer-out');
      window.setTimeout(function () { layer.remove(); }, 650);
    }, 2200);
  }

  function initialise() {
    const root = document.getElementById(ROOT_ID);
    if (!root) {
      attempts += 1;
      if (attempts < 80) window.setTimeout(initialise, 100);
      return;
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { startBoot(root); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
