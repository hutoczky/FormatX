(function () {
  'use strict';

  const ROOT_ID = 'formatx-future-5000';
  const MODULE_ORDER = ['observe', 'integrity', 'workflow', 'recovery', 'audit', 'release'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Set();
  let sequence = 0;
  let pageShowSeen = false;
  let rootObserver = null;
  let lastStart = 0;

  function createSvgElement(name, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    return node;
  }

  function navigationType() {
    try {
      const entries = performance.getEntriesByType('navigation');
      return entries.length ? entries[0].type : 'navigate';
    } catch (_) {
      return 'navigate';
    }
  }

  function later(callback, delay) {
    const timer = window.setTimeout(function () {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach(function (timer) { window.clearTimeout(timer); });
    timers.clear();
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

  function buildBootLayer(root, minimal) {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const layer = createSvgElement('svg', {
      class: 'fx-causal-boot-layer' + (minimal ? ' fx-causal-boot-layer-minimal' : ''),
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

    layer.append(createSvgElement('rect', {
      x: '1.5%',
      y: '1.2%',
      width: '97%',
      height: '97.6%',
      rx: '22',
      class: 'fx-causal-boot-perimeter',
      pathLength: '1'
    }));

    const center = { x: width * 0.5, y: height * 0.54 };
    layer.append(createSvgElement('circle', {
      cx: center.x,
      cy: center.y,
      r: Math.min(width, height) * 0.11,
      class: 'fx-causal-boot-core',
      fill: 'url(#fx-causal-boot-core)',
      filter: 'url(#fx-causal-boot-glow)'
    }));

    if (!minimal) {
      MODULE_ORDER.forEach(function (id, index) {
        const point = moduleCenter(root, id);
        if (!point) return;
        layer.append(createSvgElement('path', {
          d: 'M ' + center.x.toFixed(2) + ' ' + center.y.toFixed(2)
            + ' Q ' + ((center.x + point.x) / 2).toFixed(2) + ' ' + (center.y - 70 + index * 18).toFixed(2)
            + ' ' + point.x.toFixed(2) + ' ' + point.y.toFixed(2),
          class: 'fx-causal-boot-branch',
          pathLength: '1',
          style: '--fx-causal-boot-delay:' + (420 + index * 120) + 'ms'
        }));
        layer.append(createSvgElement('circle', {
          cx: point.x,
          cy: point.y,
          r: '13',
          class: 'fx-causal-boot-node',
          style: '--fx-causal-boot-delay:' + (700 + index * 120) + 'ms'
        }));
      });
    }

    return layer;
  }

  function cancelBootAnimations(root) {
    root.querySelectorAll('.fx-causal-boot-layer, .fx-causal-boot-module').forEach(function (node) {
      if (!node.getAnimations) return;
      node.getAnimations().forEach(function (animation) { animation.cancel(); });
    });
  }

  function resetBoot(root) {
    sequence += 1;
    clearTimers();
    cancelBootAnimations(root);
    root.querySelectorAll('.fx-causal-boot-layer').forEach(function (layer) { layer.remove(); });
    root.classList.remove(
      'fx-causal-boot-prep',
      'fx-causal-booting',
      'fx-causal-boot-started',
      'fx-causal-boot-reveal',
      'fx-causal-boot-complete',
      'fx-causal-boot-minimal'
    );
    root.querySelectorAll('.fx-causal-boot-module').forEach(function (module) {
      module.classList.remove('fx-causal-boot-module');
      module.style.removeProperty('--fx-causal-boot-delay');
    });
    delete root.dataset.fxCausalBoot;
    void root.offsetWidth;
    return sequence;
  }

  function activateModules(root, minimal) {
    MODULE_ORDER.forEach(function (id, index) {
      const module = root.querySelector('[data-fx5k-module="' + id + '"]');
      if (!module) return;
      module.style.setProperty('--fx-causal-boot-delay', (minimal ? 70 + index * 45 : 620 + index * 120) + 'ms');
      module.classList.add('fx-causal-boot-module');
    });
  }

  function startBoot(root, reason, force) {
    const now = performance.now();
    if (!force && root.dataset.fxCausalBoot === 'ready') return;
    if (now - lastStart < 300) return;
    lastStart = now;

    const token = resetBoot(root);
    const minimal = reduceMotion.matches;
    root.dataset.fxCausalBoot = 'ready';
    root.dataset.fxCausalBootReason = reason;
    root.classList.add('fx-causal-boot-prep');
    if (minimal) root.classList.add('fx-causal-boot-minimal');
    void root.offsetWidth;

    root.classList.add('fx-causal-booting');
    const layer = buildBootLayer(root, minimal);
    root.prepend(layer);
    activateModules(root, minimal);

    window.requestAnimationFrame(function () {
      if (token !== sequence) return;
      root.classList.add('fx-causal-boot-started');
    });

    const revealDelay = minimal ? 110 : 920;
    const completeDelay = minimal ? 720 : 2200;

    later(function () {
      if (token !== sequence) return;
      root.classList.add('fx-causal-boot-reveal');
    }, revealDelay);

    later(function () {
      if (token !== sequence) return;
      root.classList.remove('fx-causal-boot-prep', 'fx-causal-booting', 'fx-causal-boot-started');
      root.classList.add('fx-causal-boot-complete');
      root.querySelectorAll('.fx-causal-boot-module').forEach(function (module) {
        module.classList.remove('fx-causal-boot-module');
        module.style.removeProperty('--fx-causal-boot-delay');
      });
      layer.classList.add('fx-causal-boot-layer-out');
      later(function () {
        if (token === sequence) layer.remove();
      }, minimal ? 260 : 650);
    }, completeDelay);
  }

  function withRoot(callback) {
    const existing = document.getElementById(ROOT_ID);
    if (existing) {
      callback(existing);
      return;
    }

    if (rootObserver) return;
    rootObserver = new MutationObserver(function () {
      const root = document.getElementById(ROOT_ID);
      if (!root) return;
      rootObserver.disconnect();
      rootObserver = null;
      callback(root);
    });
    rootObserver.observe(document.documentElement, { childList: true, subtree: true });

    later(function () {
      if (!rootObserver) return;
      rootObserver.disconnect();
      rootObserver = null;
      const root = document.getElementById(ROOT_ID);
      if (root) callback(root);
    }, 10000);
  }

  function run(reason, force) {
    withRoot(function (root) {
      window.requestAnimationFrame(function () {
        startBoot(root, reason, force);
      });
    });
  }

  window.addEventListener('pageshow', function (event) {
    pageShowSeen = true;
    const type = navigationType();
    run(event.persisted ? 'bfcache' : type, true);
  });

  function fallbackStart() {
    later(function () {
      if (!pageShowSeen) run('dom-fallback', true);
    }, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fallbackStart, { once: true });
  } else if (document.readyState === 'complete') {
    run('late-script-' + navigationType(), true);
  } else {
    fallbackStart();
  }
}());