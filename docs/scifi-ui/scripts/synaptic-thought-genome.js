(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxThoughtGenome === 'ready-v1') return;
  ROOT.dataset.fxThoughtGenome = 'loading-v1';

  const HISTORY_KEY = 'formatx-thought-genome-history-v1';
  const ENABLED_KEY = 'formatx-thought-genome-enabled';
  const FORM_KEY = 'formatx-thought-genome-form';
  const MAX_HISTORY = 12;
  const FORMS = ['auto', 0, 1, 2, 3, 4, 5];
  const FORM_LABELS = {
    hu: ['AUTOMATIKUS', 'MAG', 'IDEGHÁLÓ', 'SZERVSZIRMOK', 'KERESKEDELMI SZÍV', 'KRISTÁLYVÁZ', 'JELADÓ'],
    en: ['AUTO', 'CORE', 'NEURAL MESH', 'ORGAN PETALS', 'COMMERCE HEART', 'CRYSTAL SKELETON', 'BEACON']
  };
  const INTENTS = [
    { scene: 3, id: 'commerce', keys: ['ár', 'ára', 'mennyibe', 'csomag', 'licenc', 'licence', 'license', 'próba', 'trial', 'qr', 'fizetés', 'payment', 'bank', 'átutal'] },
    { scene: 4, id: 'safety', keys: ['biztonság', 'védelem', 'sha', 'ed25519', 'secure', 'safety', 'protection', 'törlés', 'erase'] },
    { scene: 5, id: 'beacon', keys: ['letölt', 'download', 'apk', 'release', 'kiadás', 'support', 'támogatás', 'android'] },
    { scene: 2, id: 'organs', keys: ['modul', 'szerv', 'organ', 'iso', 'formáz', 'format', 'partíció', 'partition', 'smart'] },
    { scene: 1, id: 'nervous-system', keys: ['működés', 'folyamat', 'workflow', 'felderít', 'tervez', 'ellenőriz', 'discover', 'plan', 'verify'] },
    { scene: 0, id: 'core', keys: ['formatx', 'mag', 'core', 'ki vagy', 'who are you', 'szia', 'hello'] }
  ];

  let enabled = readBoolean(ENABLED_KEY, true);
  let selectedForm = readForm();
  let history = readHistory();
  let currentScene = Math.max(0, Math.min(5, Number(ROOT.dataset.fxScene || 0)));
  let pendingThought = null;
  let layer = null;
  let path = null;
  let nodes = null;
  let controlRow = null;
  let toggleButton = null;
  let formButton = null;
  let replayButton = null;
  let clearButton = null;
  let counter = null;
  let replayTimers = [];

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return language() === 'en'
      ? {
          region: 'Synaptic thought genome',
          toggleOn: 'Genome on',
          toggleOff: 'Genome off',
          enable: 'Enable the thought genome',
          disable: 'Disable the thought genome',
          form: 'Shape',
          replay: 'Replay thought constellation',
          clear: 'Clear local thought constellation',
          count: 'local thought fingerprints'
        }
      : {
          region: 'Szinaptikus gondolatgenom',
          toggleOn: 'Genom be',
          toggleOff: 'Genom ki',
          enable: 'Gondolatgenom bekapcsolása',
          disable: 'Gondolatgenom kikapcsolása',
          form: 'Forma',
          replay: 'Gondolatcsillagkép visszajátszása',
          clear: 'Helyi gondolatcsillagkép törlése',
          count: 'helyi gondolatlenyomat'
        };
  }

  function readBoolean(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value === 'true';
    } catch (_) {
      return fallback;
    }
  }

  function readForm() {
    try {
      const value = localStorage.getItem(FORM_KEY);
      if (value === 'auto' || value === null) return 'auto';
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? parsed : 'auto';
    } catch (_) {
      return 'auto';
    }
  }

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(item => item && Number.isFinite(Number(item.fingerprint)) && Number.isFinite(Number(item.scene)))
        .slice(-MAX_HISTORY)
        .map(item => ({
          fingerprint: Number(item.fingerprint) >>> 0,
          scene: Math.max(0, Math.min(5, Math.round(Number(item.scene)))),
          intent: String(item.intent || 'core').slice(0, 32),
          at: Math.max(0, Number(item.at) || 0)
        }));
    } catch (_) {
      return [];
    }
  }

  function storeState() {
    try {
      localStorage.setItem(ENABLED_KEY, String(enabled));
      localStorage.setItem(FORM_KEY, String(selectedForm));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    } catch (_) {}
  }

  function fold(value) {
    return String(value || '')
      .toLocaleLowerCase(language() === 'en' ? 'en-GB' : 'hu-HU')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function fingerprint(value) {
    const input = new TextEncoder().encode(String(value || '').slice(0, 180));
    let hash = 2166136261;
    for (const byte of input) {
      hash ^= byte;
      hash = Math.imul(hash, 16777619);
    }
    hash ^= input.length * 2654435761;
    return hash >>> 0;
  }

  function classify(question) {
    const value = fold(question);
    for (const intent of INTENTS) {
      if (intent.keys.some(key => value.includes(fold(key)))) {
        return { scene: intent.scene, intent: intent.id };
      }
    }
    return { scene: currentScene, intent: currentScene === 0 ? 'core' : `scene-${currentScene}` };
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-thought-genome-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/synaptic-thought-genome.css?v=20260731-thought-genome-1';
    link.dataset.fxThoughtGenomeStyle = 'true';
    document.head.appendChild(link);
  }

  function ensureLayer() {
    if (layer?.isConnected) return true;
    const stage = document.querySelector('.fx-three-stage-shell');
    if (!(stage instanceof HTMLElement)) return false;

    layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    layer.classList.add('fx-thought-genome-layer');
    layer.setAttribute('viewBox', '0 0 1000 1000');
    layer.setAttribute('preserveAspectRatio', 'none');
    layer.setAttribute('aria-hidden', 'true');
    layer.dataset.fxThoughtGenomeLayer = 'ready-v1';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'fx-thought-genome-glow');
    filter.setAttribute('x', '-80%');
    filter.setAttribute('y', '-80%');
    filter.setAttribute('width', '260%');
    filter.setAttribute('height', '260%');
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '7');
    blur.setAttribute('result', 'blur');
    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const mergeBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeBlur.setAttribute('in', 'blur');
    const mergeSource = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeSource.setAttribute('in', 'SourceGraphic');
    merge.append(mergeBlur, mergeSource);
    filter.append(blur, merge);
    defs.appendChild(filter);

    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('fx-thought-genome-path');
    nodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodes.classList.add('fx-thought-genome-nodes');
    layer.append(defs, path, nodes);
    stage.appendChild(layer);
    renderLayer();
    return true;
  }

  function pointFor(entry, index) {
    const baseAngles = [-2.35, -1.55, -0.72, 0.10, 0.91, 1.78];
    const base = baseAngles[entry.scene] ?? -2.35;
    const f = entry.fingerprint >>> 0;
    const jitter = ((f % 997) / 997 - 0.5) * 0.72;
    const radius = 155 + ((f >>> 8) % 1000) / 1000 * 205;
    const angle = base + jitter;
    const centreX = matchMedia('(max-width: 900px), (pointer: coarse)').matches ? 500 : 565;
    const centreY = matchMedia('(max-width: 900px), (pointer: coarse)').matches ? 430 : 470;
    return {
      x: centreX + Math.cos(angle) * radius,
      y: centreY + Math.sin(angle) * radius * 0.72 + (((f >>> 18) % 1000) / 1000 - 0.5) * 58,
      r: 3.8 + ((f >>> 24) % 5) + Math.min(index, 4) * 0.25,
      hue: (168 + f % 188) % 360
    };
  }

  function renderLayer(activeFingerprint) {
    if (!ensureLayer()) return;
    layer.classList.toggle('is-disabled', !enabled);
    nodes.replaceChildren();

    const points = history.map(pointFor);
    const centre = matchMedia('(max-width: 900px), (pointer: coarse)').matches
      ? { x: 500, y: 430 }
      : { x: 565, y: 470 };
    const pathPoints = [{ x: centre.x, y: centre.y }, ...points];
    path.setAttribute('d', pathPoints.length > 1
      ? pathPoints.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
      : '');
    path.style.setProperty('--fx-genome-path-length', String(Math.max(1, pathPoints.length * 150)));

    points.forEach((point, index) => {
      const entry = history[index];
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('fx-thought-genome-node');
      if (entry.fingerprint === activeFingerprint) group.classList.add('is-new');
      group.style.setProperty('--fx-genome-hue', String(point.hue));
      group.dataset.scene = String(entry.scene);
      group.dataset.fingerprint = String(entry.fingerprint);

      const orbit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      orbit.setAttribute('cx', point.x);
      orbit.setAttribute('cy', point.y);
      orbit.setAttribute('r', String(point.r * 2.6));
      orbit.classList.add('fx-thought-genome-orbit');

      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', point.x);
      star.setAttribute('cy', point.y);
      star.setAttribute('r', String(point.r));
      star.classList.add('fx-thought-genome-star');

      group.append(orbit, star);
      nodes.appendChild(group);
    });

    if (activeFingerprint !== undefined) {
      layer.classList.remove('is-pulsing');
      void layer.getBoundingClientRect();
      layer.classList.add('is-pulsing');
    }
  }

  function resolvedForm(scene) {
    return selectedForm === 'auto' ? Math.max(0, Math.min(5, Number(scene) || 0)) : Number(selectedForm);
  }

  function publicHistory() {
    return history.map(item => ({
      fingerprint: item.fingerprint,
      scene: item.scene,
      intent: item.intent,
      at: item.at
    }));
  }

  function dispatchGenome(entry, source) {
    const detail = {
      fingerprint: entry?.fingerprint ?? 0,
      scene: entry?.scene ?? currentScene,
      form: resolvedForm(entry?.scene ?? currentScene),
      intent: entry?.intent || 'core',
      history: publicHistory(),
      enabled,
      source: source || 'system',
      questionStored: false
    };
    dispatchEvent(new CustomEvent('formatx:thoughtgenome', { detail }));
    ROOT.dataset.fxThoughtGenomeLastScene = String(detail.scene);
    ROOT.dataset.fxThoughtGenomeLastForm = String(detail.form);
    ROOT.dataset.fxThoughtGenomePrivacy = 'fingerprint-only';
  }

  function dispatchShape(source) {
    dispatchEvent(new CustomEvent('formatx:organismshape', {
      detail: {
        form: resolvedForm(currentScene),
        scene: currentScene,
        genomeEnabled: enabled,
        source: source || 'control'
      }
    }));
  }

  function recordThought(meta) {
    if (!enabled || !meta) return;
    const entry = {
      fingerprint: meta.fingerprint >>> 0,
      scene: Math.max(0, Math.min(5, Number(meta.scene) || 0)),
      intent: String(meta.intent || 'core').slice(0, 32),
      at: Date.now()
    };
    history = [...history.filter(item => item.fingerprint !== entry.fingerprint), entry].slice(-MAX_HISTORY);
    storeState();
    renderLayer(entry.fingerprint);
    updateControls();
    dispatchGenome(entry, 'question');
  }

  function captureQuestion(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('.fx-organism-question')) return;
    const input = form.querySelector('#fx-organism-question-input');
    const question = input instanceof HTMLInputElement ? input.value.slice(0, 180).trim() : '';
    if (!question) {
      pendingThought = null;
      return;
    }
    const classification = classify(question);
    pendingThought = {
      fingerprint: fingerprint(question),
      scene: classification.scene,
      intent: classification.intent
    };
  }

  function onResponse(event) {
    if (!pendingThought || event.detail?.localOnly !== true) return;
    const thought = pendingThought;
    pendingThought = null;
    recordThought(thought);
  }

  function createButton(className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    return button;
  }

  function ensureControls() {
    if (controlRow?.isConnected) return true;
    const existing = document.querySelector('.fx-organism-thought-controls');
    if (!(existing instanceof HTMLElement)) return false;

    controlRow = document.createElement('div');
    controlRow.className = 'fx-thought-genome-controls';
    controlRow.setAttribute('role', 'group');

    toggleButton = createButton('fx-thought-genome-toggle');
    formButton = createButton('fx-thought-genome-form');
    replayButton = createButton('fx-thought-genome-replay');
    clearButton = createButton('fx-thought-genome-clear');
    replayButton.textContent = '↻';
    clearButton.textContent = '⌫';
    counter = document.createElement('small');
    counter.className = 'fx-thought-genome-counter';

    toggleButton.addEventListener('click', () => {
      enabled = !enabled;
      clearReplay();
      storeState();
      renderLayer();
      updateControls();
      dispatchShape(enabled ? 'genome-enabled' : 'genome-disabled');
      ROOT.dataset.fxThoughtGenomeEnabled = String(enabled);
    });

    formButton.addEventListener('click', () => {
      const index = Math.max(0, FORMS.findIndex(value => value === selectedForm));
      selectedForm = FORMS[(index + 1) % FORMS.length];
      storeState();
      updateControls();
      dispatchShape('manual-form-cycle');
    });

    replayButton.addEventListener('click', replay);
    clearButton.addEventListener('click', clearHistory);
    controlRow.append(toggleButton, formButton, replayButton, clearButton, counter);
    existing.insertAdjacentElement('afterend', controlRow);
    updateControls();
    return true;
  }

  function updateControls() {
    if (!ensureControls()) return;
    const words = copy();
    const labels = FORM_LABELS[language()];
    const formIndex = selectedForm === 'auto' ? 0 : Number(selectedForm) + 1;

    controlRow.setAttribute('aria-label', words.region);
    toggleButton.textContent = enabled ? `✦ ${words.toggleOn}` : `○ ${words.toggleOff}`;
    toggleButton.setAttribute('aria-pressed', String(enabled));
    toggleButton.setAttribute('aria-label', enabled ? words.disable : words.enable);
    formButton.textContent = `${words.form}: ${labels[formIndex]}`;
    formButton.setAttribute('aria-label', `${words.form}: ${labels[formIndex]}`);
    replayButton.setAttribute('aria-label', words.replay);
    replayButton.title = words.replay;
    clearButton.setAttribute('aria-label', words.clear);
    clearButton.title = words.clear;
    replayButton.disabled = !enabled || history.length === 0;
    clearButton.disabled = history.length === 0;
    formButton.disabled = !enabled;
    counter.textContent = `${history.length}/${MAX_HISTORY} ${words.count}`;
    controlRow.classList.toggle('is-disabled', !enabled);
  }

  function clearReplay() {
    replayTimers.forEach(clearTimeout);
    replayTimers = [];
    layer?.classList.remove('is-replaying');
  }

  function replay() {
    if (!enabled || history.length === 0) return;
    clearReplay();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sequence = reduced ? [history[history.length - 1]] : history;
    layer?.classList.add('is-replaying');

    sequence.forEach((entry, index) => {
      const timer = setTimeout(() => {
        renderLayer(entry.fingerprint);
        dispatchGenome(entry, 'replay');
        if (index === sequence.length - 1) {
          const endTimer = setTimeout(() => layer?.classList.remove('is-replaying'), reduced ? 100 : 700);
          replayTimers.push(endTimer);
        }
      }, reduced ? 0 : index * 420);
      replayTimers.push(timer);
    });
  }

  function clearHistory() {
    clearReplay();
    history = [];
    storeState();
    renderLayer();
    updateControls();
    dispatchShape('history-cleared');
  }

  function onSceneChange(event) {
    currentScene = Math.max(0, Math.min(5, Number(event.detail?.scene) || 0));
    if (enabled && selectedForm === 'auto') dispatchShape('scene-auto-form');
  }

  function initialise() {
    ensureStyle();
    ensureLayer();
    ensureControls();
    renderLayer();
    updateControls();

    document.addEventListener('submit', captureQuestion, true);
    addEventListener('formatx:organismresponse', onResponse);
    addEventListener('formatx:organismstatechange', onSceneChange);
    addEventListener('formatx:languagechange', updateControls);
    addEventListener('formatx:threeready', () => {
      ensureLayer();
      if (history.length) dispatchGenome(history[history.length - 1], 'restore');
      else dispatchShape('initial-form');
    });
    addEventListener('resize', () => renderLayer(), { passive: true });
    addEventListener('pagehide', clearReplay);

    const observer = new MutationObserver(() => {
      const layerReady = ensureLayer();
      const controlsReady = ensureControls();
      if (layerReady && controlsReady) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 12000);

    ROOT.dataset.fxThoughtGenome = 'ready-v1';
    ROOT.dataset.fxThoughtGenomeEnabled = String(enabled);
    ROOT.dataset.fxThoughtGenomePrivacy = 'fingerprint-only';
    ROOT.dataset.fxThoughtGenomeForms = '6';
    dispatchEvent(new CustomEvent('formatx:thoughtgenomeready', {
      detail: {
        enabled,
        forms: 6,
        history: history.length,
        questionStored: false,
        localOnly: true
      }
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
