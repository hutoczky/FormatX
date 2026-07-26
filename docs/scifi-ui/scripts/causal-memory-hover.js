(function () {
  'use strict';

  const ROOT_ID = 'formatx-future-5000';
  const RELATIONS = {
    observe: ['integrity', 'workflow'],
    integrity: ['workflow', 'release', 'recovery'],
    workflow: ['recovery', 'audit', 'release'],
    recovery: ['audit', 'observe'],
    audit: ['release', 'integrity'],
    release: ['observe', 'workflow']
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let root;
  let layer;
  let activeId = '';
  let clearTimer = 0;
  let resizeObserver;
  let attempt = 0;

  function svgElement(name, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    return node;
  }

  function buildLayer() {
    layer = svgElement('svg', {
      class: 'fx-causal-hover-layer',
      'aria-hidden': 'true',
      preserveAspectRatio: 'none'
    });
    layer.innerHTML = [
      '<defs>',
      '<linearGradient id="fx-causal-hover-gradient" x1="0" y1="0" x2="1" y2="0">',
      '<stop offset="0" stop-color="#62efff" stop-opacity="0.12"/>',
      '<stop offset="0.48" stop-color="#8d8dff" stop-opacity="0.96"/>',
      '<stop offset="1" stop-color="#ffc46f" stop-opacity="0.62"/>',
      '</linearGradient>',
      '<radialGradient id="fx-causal-hover-orb-gradient">',
      '<stop offset="0" stop-color="#ffffff" stop-opacity="1"/>',
      '<stop offset="0.3" stop-color="#7cf5ff" stop-opacity="0.98"/>',
      '<stop offset="1" stop-color="#7cf5ff" stop-opacity="0"/>',
      '</radialGradient>',
      '<filter id="fx-causal-hover-glow" x="-100%" y="-100%" width="300%" height="300%">',
      '<feGaussianBlur stdDeviation="4" result="blur"/>',
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
      '</filter>',
      '</defs>'
    ].join('');
    root.prepend(layer);
    resizeLayer();
  }

  function resizeLayer() {
    if (!layer || !root) return;
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    layer.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    layer.setAttribute('width', width);
    layer.setAttribute('height', height);
    if (activeId) render(activeId);
  }

  function centerFor(node) {
    const rootRect = root.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left - rootRect.left + rect.width / 2,
      y: rect.top - rootRect.top + rect.height / 2,
      radius: Math.max(18, Math.min(rect.width, rect.height) * 0.26)
    };
  }

  function curve(source, target, index) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const bend = Math.min(116, Math.max(42, distance * 0.18)) * (index % 2 === 0 ? 1 : -1);
    const middleX = (source.x + target.x) / 2;
    const middleY = (source.y + target.y) / 2;
    const controlX = middleX - (dy / distance) * bend;
    const controlY = middleY + (dx / distance) * bend;
    return 'M ' + source.x.toFixed(2) + ' ' + source.y.toFixed(2)
      + ' Q ' + controlX.toFixed(2) + ' ' + controlY.toFixed(2)
      + ' ' + target.x.toFixed(2) + ' ' + target.y.toFixed(2);
  }

  function clearClasses() {
    root.classList.remove('fx-causal-previewing');
    root.querySelectorAll('[data-fx5k-module]').forEach(function (node) {
      node.classList.remove('fx-causal-preview-source', 'fx-causal-preview-target');
      node.style.removeProperty('--fx-causal-preview-delay');
    });
  }

  function clearGraphics() {
    if (!layer) return;
    Array.from(layer.children).forEach(function (child) {
      if (child.tagName.toLowerCase() !== 'defs') child.remove();
    });
  }

  function clearPreview() {
    window.clearTimeout(clearTimer);
    clearTimer = 0;
    activeId = '';
    clearClasses();
    clearGraphics();
  }

  function addWave(point, delay, source) {
    const group = svgElement('g', {
      class: source ? 'fx-causal-hover-source-wave' : 'fx-causal-hover-target-wave',
      style: '--fx-causal-delay:' + delay + 'ms'
    });
    for (let index = 0; index < 3; index += 1) {
      group.append(svgElement('circle', {
        cx: point.x,
        cy: point.y,
        r: point.radius + index * 8,
        class: 'fx-causal-hover-wave-ring',
        style: '--fx-causal-ring:' + index
      }));
    }
    layer.append(group);
  }

  function addPath(pathData, delay, index) {
    const path = svgElement('path', {
      d: pathData,
      class: 'fx-causal-hover-path',
      pathLength: '1',
      style: '--fx-causal-delay:' + delay + 'ms;--fx-causal-index:' + index
    });
    layer.append(path);

    const trace = svgElement('path', {
      d: pathData,
      class: 'fx-causal-hover-trace',
      pathLength: '1',
      style: '--fx-causal-delay:' + delay + 'ms'
    });
    layer.append(trace);

    if (!reduceMotion.matches) {
      const orb = svgElement('circle', {
        r: index === 0 ? '13' : '11',
        class: 'fx-causal-hover-orb',
        fill: 'url(#fx-causal-hover-orb-gradient)',
        filter: 'url(#fx-causal-hover-glow)'
      });
      const motion = svgElement('animateMotion', {
        dur: (1.08 + index * 0.11) + 's',
        begin: (delay / 1000) + 's',
        repeatCount: 'indefinite',
        path: pathData,
        keyTimes: '0;0.72;1',
        keySplines: '.2 .75 .2 1;.4 0 1 1',
        calcMode: 'spline'
      });
      orb.append(motion);
      layer.append(orb);
    }
  }

  function render(id) {
    const sourceNode = root.querySelector('[data-fx5k-module="' + id + '"]');
    if (!sourceNode) return;
    const targets = RELATIONS[id] || [];
    activeId = id;
    clearClasses();
    clearGraphics();
    root.classList.add('fx-causal-previewing');
    sourceNode.classList.add('fx-causal-preview-source');

    const source = centerFor(sourceNode);
    addWave(source, 0, true);

    targets.forEach(function (targetId, index) {
      const targetNode = root.querySelector('[data-fx5k-module="' + targetId + '"]');
      if (!targetNode) return;
      const delay = 135 + index * 175;
      const target = centerFor(targetNode);
      targetNode.classList.add('fx-causal-preview-target');
      targetNode.style.setProperty('--fx-causal-preview-delay', delay + 'ms');
      addPath(curve(source, target, index), delay, index);
      addWave(target, delay + 390, false);
    });
  }

  function enter(id) {
    window.clearTimeout(clearTimer);
    clearTimer = 0;
    if (activeId === id) return;
    window.requestAnimationFrame(function () { render(id); });
  }

  function leave(id) {
    if (activeId !== id) return;
    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(clearPreview, 170);
  }

  function bind() {
    root.querySelectorAll('[data-fx5k-module]').forEach(function (node) {
      const id = node.dataset.fx5kModule;
      node.addEventListener('pointerenter', function () { enter(id); });
      node.addEventListener('pointerleave', function () { leave(id); });
      node.addEventListener('focus', function () { enter(id); });
      node.addEventListener('blur', function () { leave(id); });
      node.addEventListener('click', function () {
        render(id);
        window.setTimeout(function () {
          if (activeId === id) render(id);
        }, 720);
      });
    });
  }

  function initialise() {
    root = document.getElementById(ROOT_ID);
    if (!root) {
      attempt += 1;
      if (attempt < 80) window.setTimeout(initialise, 100);
      return;
    }
    if (root.dataset.fxCausalHover === 'ready') return;
    root.dataset.fxCausalHover = 'ready';
    buildLayer();
    bind();
    resizeObserver = new ResizeObserver(function () {
      window.requestAnimationFrame(resizeLayer);
    });
    resizeObserver.observe(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
