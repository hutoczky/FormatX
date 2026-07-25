(function () {
  'use strict';

  const ROOT_ID = 'formatx-future-5000';
  const STORAGE_KEY = 'formatx-causal-memory-v1';
  const MAX_HISTORY = 28;
  const MODULES = ['observe', 'integrity', 'workflow', 'recovery', 'audit', 'release'];
  const RELATIONS = {
    observe: ['integrity', 'workflow'],
    integrity: ['workflow', 'release', 'recovery'],
    workflow: ['recovery', 'audit', 'release'],
    recovery: ['audit', 'observe'],
    audit: ['release', 'integrity'],
    release: ['observe', 'workflow']
  };
  const LABELS = {
    hu: {
      eyebrow: 'FORMATX · KAUZÁLIS EMLÉKEZŐMEZŐ',
      title: 'A felület nemcsak reagál. Emlékszik az útvonaladra.',
      copy: 'Minden kiválasztott rendszerréteg helyi időlenyomatot hagy. A mező ezekből felépíti a saját munkafolyamatod vizuális DNS-ét, majd előrevetíti a következő lehetséges rendszerágakat.',
      local: 'CSAK EBBEN A BÖNGÉSZŐ-MUNKAMENETBEN',
      signature: 'INTERAKCIÓS DNS',
      steps: 'IDŐLENYOMATOK',
      active: 'AKTÍV ÁG',
      future: 'LEHETSÉGES KÖVETKEZŐ ÁGAK',
      empty: 'Még nincs rögzített útvonal',
      reset: 'EMLÉKEZŐMEZŐ TÖRLÉSE',
      resetDone: 'A helyi emlékezőmező törölve.',
      module: {
        observe: 'Felderítés',
        integrity: 'Integritás',
        workflow: 'Munkafolyamat',
        recovery: 'Visszaállítás',
        audit: 'Naplózás',
        release: 'Kiadás'
      }
    },
    en: {
      eyebrow: 'FORMATX · CAUSAL MEMORY FIELD',
      title: 'The interface does not merely react. It remembers your route.',
      copy: 'Every selected system layer leaves a local time imprint. The field turns those imprints into the visual DNA of your workflow, then projects the next possible system branches.',
      local: 'LOCAL TO THIS BROWSER SESSION',
      signature: 'INTERACTION DNA',
      steps: 'TIME IMPRINTS',
      active: 'ACTIVE BRANCH',
      future: 'POSSIBLE NEXT BRANCHES',
      empty: 'No route recorded yet',
      reset: 'CLEAR MEMORY FIELD',
      resetDone: 'The local memory field was cleared.',
      module: {
        observe: 'Discovery',
        integrity: 'Integrity',
        workflow: 'Workflow',
        recovery: 'Recovery',
        audit: 'Audit',
        release: 'Release'
      }
    }
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  let root;
  let canvas;
  let context;
  let panel;
  let signatureNode;
  let stepsNode;
  let activeNode;
  let routeNode;
  let futureNode;
  let liveNode;
  let history = loadHistory();
  let centers = new Map();
  let hoveredModule = '';
  let activeModule = history.length ? history[history.length - 1].id : 'integrity';
  let pulses = [];
  let waves = [];
  let visible = true;
  let frame = 0;
  let lastFrame = 0;
  let pointer = { x: 0.5, y: 0.35 };
  let resizeObserver;
  let intersectionObserver;

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return LABELS[language()];
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(function (entry) { return entry && MODULES.includes(entry.id); })
        .slice(-MAX_HISTORY)
        .map(function (entry) { return { id: entry.id, at: Number(entry.at) || Date.now() }; });
    } catch (_) {
      return [];
    }
  }

  function saveHistory() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    } catch (_) {
      // Session storage can be unavailable in hardened privacy modes.
    }
  }

  function fnv1a(value) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  function signature() {
    const route = history.map(function (entry) { return entry.id; }).join('>') || 'origin';
    const transitions = route + '|' + history.length + '|fx5k';
    const primary = fnv1a(transitions).toString(16).toUpperCase().padStart(8, '0');
    const secondary = fnv1a(primary.split('').reverse().join('')).toString(16).toUpperCase().padStart(8, '0');
    return 'FX-' + primary.slice(0, 4) + '-' + primary.slice(4) + '-' + secondary.slice(0, 4);
  }

  function buildPanel() {
    panel = document.createElement('section');
    panel.className = 'fx-causal-memory-panel';
    panel.setAttribute('aria-labelledby', 'fx-causal-memory-title');
    panel.innerHTML = [
      '<div class="fx-causal-copy">',
      '<p class="fx-causal-eyebrow" data-fx-causal-copy="eyebrow"></p>',
      '<h3 id="fx-causal-memory-title" data-fx-causal-copy="title"></h3>',
      '<p data-fx-causal-copy="copy"></p>',
      '<span class="fx-causal-local"><i></i><b data-fx-causal-copy="local"></b></span>',
      '</div>',
      '<div class="fx-causal-readout">',
      '<div class="fx-causal-stat"><small data-fx-causal-copy="signature"></small><strong id="fx-causal-signature"></strong><div class="fx-causal-dna" aria-hidden="true"></div></div>',
      '<div class="fx-causal-stat"><small data-fx-causal-copy="steps"></small><strong id="fx-causal-steps">0</strong></div>',
      '<div class="fx-causal-stat"><small data-fx-causal-copy="active"></small><strong id="fx-causal-active"></strong></div>',
      '<div class="fx-causal-route" id="fx-causal-route"></div>',
      '<div class="fx-causal-future"><small data-fx-causal-copy="future"></small><div id="fx-causal-future"></div></div>',
      '<button class="fx-causal-reset" type="button" data-fx-causal-copy="reset"></button>',
      '<span class="fx-causal-live" id="fx-causal-live" aria-live="polite"></span>',
      '</div>'
    ].join('');

    const header = root.querySelector('.fx5k-system-head');
    if (header) header.insertAdjacentElement('afterend', panel);
    else root.prepend(panel);

    signatureNode = panel.querySelector('#fx-causal-signature');
    stepsNode = panel.querySelector('#fx-causal-steps');
    activeNode = panel.querySelector('#fx-causal-active');
    routeNode = panel.querySelector('#fx-causal-route');
    futureNode = panel.querySelector('#fx-causal-future');
    liveNode = panel.querySelector('#fx-causal-live');

    panel.querySelector('.fx-causal-reset').addEventListener('click', function () {
      history = [];
      pulses = [];
      waves = [];
      activeModule = 'integrity';
      saveHistory();
      updateReadout(copy().resetDone);
      draw(performance.now());
    });
  }

  function buildCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'fx-causal-field';
    canvas.setAttribute('aria-hidden', 'true');
    root.prepend(canvas);
    context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    resizeCanvas();
  }

  function applyLanguage() {
    const strings = copy();
    panel.querySelectorAll('[data-fx-causal-copy]').forEach(function (node) {
      const key = node.dataset.fxCausalCopy;
      if (strings[key]) node.textContent = strings[key];
    });
    updateReadout();
  }

  function moduleLabel(id) {
    return copy().module[id] || id;
  }

  function routeSummary() {
    if (!history.length) return copy().empty;
    return history.slice(-6).map(function (entry) { return moduleLabel(entry.id); }).join(' → ');
  }

  function updateDnaBars(value) {
    const dna = panel.querySelector('.fx-causal-dna');
    const source = value.replace(/[^0-9A-F]/g, '');
    if (!dna.childElementCount) {
      for (let index = 0; index < 12; index += 1) dna.append(document.createElement('i'));
    }
    Array.from(dna.children).forEach(function (bar, index) {
      const digit = parseInt(source[index % source.length] || '8', 16);
      bar.style.setProperty('--fx-causal-height', (24 + digit * 4.2) + '%');
      bar.style.setProperty('--fx-causal-delay', (-index * 0.17) + 's');
    });
  }

  function updateReadout(liveMessage) {
    const currentSignature = signature();
    signatureNode.textContent = currentSignature;
    stepsNode.textContent = String(history.length).padStart(2, '0');
    activeNode.textContent = moduleLabel(activeModule);
    routeNode.textContent = routeSummary();
    futureNode.innerHTML = '';
    (RELATIONS[hoveredModule || activeModule] || []).forEach(function (id) {
      const chip = document.createElement('span');
      chip.textContent = moduleLabel(id);
      futureNode.append(chip);
    });
    updateDnaBars(currentSignature);
    if (liveMessage) liveNode.textContent = liveMessage;
  }

  function recordModule(id) {
    if (!MODULES.includes(id)) return;
    const previous = history.length ? history[history.length - 1].id : activeModule;
    activeModule = id;
    history.push({ id: id, at: Date.now() });
    history = history.slice(-MAX_HISTORY);
    saveHistory();
    const now = performance.now();
    if (previous && previous !== id) pulses.push({ from: previous, to: id, started: now, duration: 1050 });
    waves.push({ id: id, started: now, duration: 1250 });
    updateReadout();
    animatePanel();
    requestFrame();
  }

  function animatePanel() {
    const readout = panel.querySelector('.fx-causal-readout');
    if (!readout || reduceMotion.matches) return;
    readout.animate([
      { boxShadow: 'inset 0 0 0 rgba(106, 247, 255, 0)', filter: 'brightness(1)' },
      { boxShadow: 'inset 0 0 38px rgba(106, 247, 255, 0.10)', filter: 'brightness(1.08)' },
      { boxShadow: 'inset 0 0 0 rgba(106, 247, 255, 0)', filter: 'brightness(1)' }
    ], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  function bindModules() {
    root.querySelectorAll('[data-fx5k-module]').forEach(function (button) {
      const id = button.dataset.fx5kModule;
      button.addEventListener('click', function () { recordModule(id); });
      button.addEventListener('pointerenter', function () {
        hoveredModule = id;
        updateReadout();
        requestFrame();
      });
      button.addEventListener('pointerleave', function () {
        hoveredModule = '';
        updateReadout();
        requestFrame();
      });
      button.addEventListener('focus', function () {
        hoveredModule = id;
        updateReadout();
        requestFrame();
      });
      button.addEventListener('blur', function () {
        hoveredModule = '';
        updateReadout();
        requestFrame();
      });
    });
  }

  function resizeCanvas() {
    if (!canvas || !context || !root) return;
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    calculateCenters();
    requestFrame();
  }

  function calculateCenters() {
    centers = new Map();
    const rootRect = root.getBoundingClientRect();
    root.querySelectorAll('[data-fx5k-module]').forEach(function (button) {
      const rect = button.getBoundingClientRect();
      centers.set(button.dataset.fx5kModule, {
        x: rect.left - rootRect.left + rect.width / 2,
        y: rect.top - rootRect.top + rect.height / 2,
        radius: Math.max(14, Math.min(rect.width, rect.height) * 0.23)
      });
    });
  }

  function controlPoint(a, b, bend) {
    const middleX = (a.x + b.x) / 2;
    const middleY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    return {
      x: middleX - (dy / length) * bend,
      y: middleY + (dx / length) * bend
    };
  }

  function pointOnCurve(a, control, b, t) {
    const inverse = 1 - t;
    return {
      x: inverse * inverse * a.x + 2 * inverse * t * control.x + t * t * b.x,
      y: inverse * inverse * a.y + 2 * inverse * t * control.y + t * t * b.y
    };
  }

  function drawCurve(a, b, options) {
    if (!a || !b) return;
    const bend = options.bend || Math.min(74, Math.max(24, Math.abs(b.x - a.x) * 0.16));
    const control = controlPoint(a, b, options.flip ? -bend : bend);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.quadraticCurveTo(control.x, control.y, b.x, b.y);
    context.strokeStyle = options.color;
    context.lineWidth = options.width;
    context.globalAlpha = options.alpha;
    context.setLineDash(options.dash || []);
    context.stroke();
    context.setLineDash([]);
    context.globalAlpha = 1;
    return control;
  }

  function transitionWeights() {
    const weights = new Map();
    for (let index = 1; index < history.length; index += 1) {
      const from = history[index - 1].id;
      const to = history[index].id;
      if (from === to) continue;
      const key = from + '>' + to;
      weights.set(key, (weights.get(key) || 0) + 1);
    }
    return weights;
  }

  function visitCounts() {
    const counts = new Map();
    history.forEach(function (entry) { counts.set(entry.id, (counts.get(entry.id) || 0) + 1); });
    return counts;
  }

  function drawBackground(time, width, height) {
    const phase = time * 0.00013;
    const gradient = context.createRadialGradient(
      width * pointer.x,
      height * pointer.y,
      0,
      width * pointer.x,
      height * pointer.y,
      Math.max(width, height) * 0.62
    );
    gradient.addColorStop(0, 'rgba(94, 241, 255, 0.075)');
    gradient.addColorStop(0.34, 'rgba(111, 113, 255, 0.036)');
    gradient.addColorStop(1, 'rgba(2, 7, 18, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.16;
    context.strokeStyle = 'rgba(102, 232, 255, 0.13)';
    context.lineWidth = 0.7;
    const spacing = width < 760 ? 56 : 72;
    const drift = Math.sin(phase) * 12;
    for (let x = -spacing; x < width + spacing; x += spacing) {
      context.beginPath();
      context.moveTo(x + drift, 0);
      context.lineTo(x - drift * 0.4, height);
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  function drawMemoryPaths() {
    const weights = transitionWeights();
    let index = 0;
    weights.forEach(function (weight, key) {
      const parts = key.split('>');
      const from = centers.get(parts[0]);
      const to = centers.get(parts[1]);
      if (!from || !to) return;
      drawCurve(from, to, {
        color: weight > 1 ? 'rgba(106,247,255,0.88)' : 'rgba(135,146,255,0.72)',
        width: 0.8 + Math.min(weight, 5) * 0.62,
        alpha: 0.28 + Math.min(weight, 5) * 0.10,
        flip: index % 2 === 1,
        bend: 28 + (index % 3) * 18
      });
      index += 1;
    });
  }

  function drawPredictions(time) {
    const sourceId = hoveredModule || activeModule;
    const source = centers.get(sourceId);
    if (!source) return;
    (RELATIONS[sourceId] || []).forEach(function (targetId, index) {
      const target = centers.get(targetId);
      if (!target) return;
      const alpha = 0.24 + (Math.sin(time * 0.0022 + index) + 1) * 0.08;
      drawCurve(source, target, {
        color: 'rgba(255, 194, 111, 0.95)',
        width: 1,
        alpha: alpha,
        dash: [4, 9],
        flip: index % 2 === 0,
        bend: 42 + index * 13
      });
    });
  }

  function drawNodes(time) {
    const counts = visitCounts();
    MODULES.forEach(function (id, index) {
      const center = centers.get(id);
      if (!center) return;
      const count = counts.get(id) || 0;
      const selected = id === activeModule;
      const hovered = id === hoveredModule;
      const pulse = 0.5 + Math.sin(time * 0.002 + index) * 0.5;
      const radius = center.radius + Math.min(count, 5) * 1.8 + (selected ? pulse * 2.4 : 0);
      const halo = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 2.4);
      halo.addColorStop(0, selected ? 'rgba(106,247,255,0.22)' : 'rgba(116,135,255,0.11)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = halo;
      context.beginPath();
      context.arc(center.x, center.y, radius * 2.4, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.arc(center.x, center.y, radius, 0, Math.PI * 2);
      context.strokeStyle = hovered ? 'rgba(255,194,111,0.95)' : selected ? 'rgba(106,247,255,0.92)' : 'rgba(129,148,255,0.42)';
      context.lineWidth = selected || hovered ? 1.7 : 0.9;
      context.globalAlpha = count ? 0.82 : 0.32;
      context.stroke();
      context.globalAlpha = 1;
    });
  }

  function drawPulses(time) {
    pulses = pulses.filter(function (pulse) { return time - pulse.started < pulse.duration; });
    pulses.forEach(function (pulse, index) {
      const from = centers.get(pulse.from);
      const to = centers.get(pulse.to);
      if (!from || !to) return;
      const progress = Math.max(0, Math.min(1, (time - pulse.started) / pulse.duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      const control = controlPoint(from, to, index % 2 ? -52 : 52);
      const point = pointOnCurve(from, control, to, eased);
      const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 16);
      glow.addColorStop(0, 'rgba(255,255,255,0.98)');
      glow.addColorStop(0.24, 'rgba(106,247,255,0.92)');
      glow.addColorStop(1, 'rgba(106,247,255,0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(point.x, point.y, 16, 0, Math.PI * 2);
      context.fill();
    });
  }

  function drawWaves(time) {
    waves = waves.filter(function (wave) { return time - wave.started < wave.duration; });
    waves.forEach(function (wave) {
      const center = centers.get(wave.id);
      if (!center) return;
      const progress = Math.max(0, Math.min(1, (time - wave.started) / wave.duration));
      context.beginPath();
      context.arc(center.x, center.y, 18 + progress * 86, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(106,247,255,' + ((1 - progress) * 0.48).toFixed(3) + ')';
      context.lineWidth = 1.4 - progress * 0.8;
      context.stroke();
    });
  }

  function draw(time) {
    if (!context || !canvas || !root) return;
    const width = root.clientWidth;
    const height = root.clientHeight;
    context.clearRect(0, 0, width, height);
    drawBackground(time, width, height);
    drawMemoryPaths();
    drawPredictions(time);
    drawNodes(time);
    drawPulses(time);
    drawWaves(time);
  }

  function tick(time) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (time - lastFrame > 16) {
      draw(time);
      lastFrame = time;
    }
    if (!reduceMotion.matches && (pulses.length || waves.length || hoveredModule || history.length)) requestFrame();
  }

  function requestFrame() {
    if (!frame) frame = window.requestAnimationFrame(tick);
  }

  function bindPointer() {
    if (!finePointer.matches || reduceMotion.matches) return;
    root.addEventListener('pointermove', function (event) {
      const rect = root.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      requestFrame();
    }, { passive: true });
    root.addEventListener('pointerleave', function () {
      pointer = { x: 0.5, y: 0.35 };
      requestFrame();
    });
  }

  function observeVisibility() {
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(function (entries) {
        visible = Boolean(entries[0] && entries[0].isIntersecting);
        if (visible) requestFrame();
      }, { threshold: 0.02 });
      intersectionObserver.observe(root);
    }
    document.addEventListener('visibilitychange', requestFrame);
  }

  function initialise() {
    root = document.getElementById(ROOT_ID);
    if (!root) {
      window.setTimeout(initialise, 90);
      return;
    }
    if (root.dataset.fxCausalMemory === 'ready') return;
    root.dataset.fxCausalMemory = 'ready';
    root.classList.add('fx-causal-memory-ready');

    buildCanvas();
    buildPanel();
    applyLanguage();
    bindModules();
    bindPointer();
    observeVisibility();

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(root);
    new MutationObserver(applyLanguage).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    calculateCenters();
    draw(performance.now());
    requestFrame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
