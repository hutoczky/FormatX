(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'living-system-rendering-r283-event-driven';
  const STYLE_URL = '/scifi-ui/styles/formatx-living-system-rendering-v1.css?v=20260812-award-r1';
  const AWAKEN_KEY = 'formatx-core-awakening-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  if (root.dataset.fxLivingSystemRendering === VERSION) return;
  root.dataset.fxLivingSystemRendering = VERSION;
  root.dataset.fxLivingTelemetry = 'browser-runtime-real-data';
  root.dataset.fxLivingSystemSchedulerR283 = 'event-driven-no-idle-loop';

  const state = {
    phase: 'discover', scene: 0, fps: 60, frameMs: 16.7, renderPressure: 0,
    latency: null, downlink: null, effectiveType: '',
    hardwareConcurrency: Number(navigator.hardwareConcurrency || 0),
    deviceMemory: Number(navigator.deviceMemory || 0), complexity: .65,
    energy: .28, stability: 1, pointerX: 0, pointerY: 0,
    visible: true, lastInteractionAt: 0, errors: 0, awakened: false, gyro: false
  };

  let layer = null;
  let neuralLayer = null;
  let transition = null;
  let commitRaf = 0;
  let transitionTimer = 0;
  let stabilityTimer = 0;
  let gyroLast = 0;
  let activeSceneObserver = null;
  const lastRoot = new Map();
  const lastVars = new Map();

  function setData(name, value) {
    const text = String(value);
    if (lastRoot.get(name) === text) return;
    lastRoot.set(name, text);
    root.dataset[name] = text;
  }

  function setVar(name, value) {
    const text = String(value);
    if (lastVars.get(name) === text) return;
    lastVars.set(name, text);
    root.style.setProperty(name, text);
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-living-system-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    link.dataset.fxLivingSystemStyle = VERSION;
    link.addEventListener('load', () => setData('fxLivingSystemStyle', 'ready'), { once: true });
    link.addEventListener('error', () => setData('fxLivingSystemStyle', 'failed'), { once: true });
    document.head.appendChild(link);
  }

  function ensureLayer() {
    if (!document.body) return false;
    layer = document.querySelector('.fx-living-system-layer');
    if (!(layer instanceof HTMLElement)) {
      layer = document.createElement('div');
      layer.className = 'fx-living-system-layer';
      layer.dataset.fxLivingSystemLayer = VERSION;
      layer.setAttribute('aria-hidden', 'true');
      transition = document.createElement('div');
      transition.className = 'fx-living-transition';
      neuralLayer = document.createElement('div');
      neuralLayer.className = 'fx-living-neural-layer';
      layer.append(transition, neuralLayer);
      document.body.appendChild(layer);
    } else {
      transition = layer.querySelector('.fx-living-transition');
      neuralLayer = layer.querySelector('.fx-living-neural-layer');
    }
    return transition instanceof HTMLElement && neuralLayer instanceof HTMLElement;
  }

  function complexityFromDevice() {
    const cores = state.hardwareConcurrency || 4;
    const memory = state.deviceMemory || (mobile ? 4 : 8);
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined';
    const base = clamp((cores / 12) * .46 + (memory / 12) * .34 + (webgl2 ? .20 : 0), .25, 1);
    state.complexity = mobile ? Math.min(.72, base) : base;
    setData('fxLivingComplexityTier', state.complexity >= .78 ? 'high' : state.complexity >= .48 ? 'standard' : 'reduced');
    setVar('--fx-system-complexity', state.complexity.toFixed(3));
  }

  function readConnection() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) {
      state.latency = null; state.downlink = null; state.effectiveType = '';
      setData('fxLivingNetwork', 'unavailable');
      return;
    }
    state.latency = Number.isFinite(Number(connection.rtt)) ? Number(connection.rtt) : null;
    state.downlink = Number.isFinite(Number(connection.downlink)) ? Number(connection.downlink) : null;
    state.effectiveType = String(connection.effectiveType || '');
    setData('fxLivingNetwork', state.effectiveType || 'available');
    const normalizedLatency = state.latency == null ? .2 : clamp(state.latency / 650, 0, 1);
    setVar('--fx-system-latency', normalizedLatency.toFixed(3));
  }

  function applyState() {
    setData('fxLivingPhase', state.phase);
    setData('fxLivingScene', state.scene);
    setData('fxSystemStability', state.stability < .62 ? 'unstable' : 'stable');
    setData('fxLivingFps', Math.round(state.fps));
    setData('fxLivingFrameMs', state.frameMs.toFixed(1));
    setData('fxLivingRenderPressure', state.renderPressure.toFixed(3));
    setVar('--fx-system-energy', clamp(state.energy, .08, 1).toFixed(3));
    setVar('--fx-system-stability', clamp(state.stability, 0, 1).toFixed(3));
    setVar('--fx-system-pressure', clamp(state.renderPressure, 0, 1).toFixed(3));
    setVar('--fx-system-pointer-x', clamp(state.pointerX, -1, 1).toFixed(3));
    setVar('--fx-system-pointer-y', clamp(state.pointerY, -1, 1).toFixed(3));
  }

  function scheduleState() {
    if (commitRaf) return;
    commitRaf = requestAnimationFrame(() => {
      commitRaf = 0;
      applyState();
    });
  }

  function snapshot() {
    return Object.freeze({
      version: VERSION, phase: state.phase, scene: state.scene,
      fps: Math.round(state.fps * 10) / 10, frameMs: Math.round(state.frameMs * 10) / 10,
      renderPressure: Math.round(state.renderPressure * 1000) / 1000,
      latency: state.latency, downlink: state.downlink, effectiveType: state.effectiveType,
      hardwareConcurrency: state.hardwareConcurrency || null, deviceMemory: state.deviceMemory || null,
      complexity: Math.round(state.complexity * 1000) / 1000,
      energy: Math.round(state.energy * 1000) / 1000,
      stability: Math.round(state.stability * 1000) / 1000,
      gyro: state.gyro, source: 'browser-runtime'
    });
  }

  function notify(reason) {
    dispatchEvent(new CustomEvent('formatx:systemstate', { detail: { reason, state: snapshot() } }));
  }

  function corePulse(kind, intensity = .7, repetitions = 1, spacing = 70) {
    const safeIntensity = clamp(Number(intensity) || .7, .1, 1);
    const repeats = clamp(Math.round(repetitions), 1, 6);
    state.energy = Math.max(state.energy, safeIntensity);
    scheduleState();
    for (let index = 0; index < repeats; index += 1) {
      window.setTimeout(() => {
        dispatchEvent(new CustomEvent('formatx:organismcoreactivate', {
          detail: { source: VERSION, phase: kind, intensity: safeIntensity, operationalPhase: state.phase, telemetry: snapshot() }
        }));
        dispatchEvent(new CustomEvent('formatx:corecommand', {
          detail: { source: VERSION, command: kind, intensity: safeIntensity, operationalPhase: state.phase }
        }));
      }, index * spacing);
    }
  }

  function phaseProfile(phase) {
    if (phase === 'plan') return { energy: .52, pulses: 2, spacing: 105, command: 'structure-rearrange' };
    if (phase === 'execute') return { energy: .88, pulses: 4, spacing: 58, command: 'energy-impulse' };
    if (phase === 'verify') return { energy: .44, pulses: 2, spacing: 150, command: 'stabilize' };
    return { energy: .40, pulses: 2, spacing: 125, command: 'discover-open' };
  }

  function normalizePhase(value) {
    const phase = String(value || '').toLowerCase();
    if (phase === 'controlled-execution' || phase === 'execution' || phase === 'execute') return 'execute';
    if (phase === 'verify' || phase === 'verification') return 'verify';
    if (phase === 'plan' || phase === 'planning') return 'plan';
    return 'discover';
  }

  function beginTransition() {
    clearTimeout(transitionTimer);
    setData('fxLivingTransition', 'active');
    transitionTimer = window.setTimeout(() => setData('fxLivingTransition', 'idle'), mobile ? 360 : 510);
  }

  function setPhase(value, source = 'system', scene = state.scene) {
    const phase = normalizePhase(value);
    const nextScene = clamp(Number(scene) || 0, 0, 5);
    const changed = phase !== state.phase || nextScene !== state.scene;
    state.phase = phase;
    state.scene = nextScene;
    const profile = phaseProfile(phase);
    state.energy = Math.max(profile.energy, state.energy * .78);
    scheduleState();
    if (changed) {
      beginTransition();
      corePulse(profile.command, profile.energy, profile.pulses, profile.spacing);
      notify('phase:' + source);
    }
    return snapshot();
  }

  function sceneToPhase(scene) {
    const bounded = clamp(Number(scene) || 0, 0, 5);
    if (bounded === 0) return 'discover';
    if (bounded <= 2) return 'plan';
    if (bounded <= 4) return 'execute';
    return 'verify';
  }

  function addNeuralPulse(x, y, intensity = .7) {
    if (!(neuralLayer instanceof HTMLElement) || reduced.matches) return;
    const node = document.createElement('i');
    node.className = 'fx-living-neural-pulse';
    node.style.setProperty('--fx-neural-x', clamp(x, 0, innerWidth) + 'px');
    node.style.setProperty('--fx-neural-y', clamp(y, 0, innerHeight) + 'px');
    node.style.setProperty('--fx-neural-angle', ((x / Math.max(1, innerWidth) - .5) * 85).toFixed(1) + 'deg');
    node.style.opacity = String(clamp(intensity, .25, 1));
    neuralLayer.appendChild(node);
    node.addEventListener('animationend', () => node.remove(), { once: true });
    window.setTimeout(() => node.remove(), 1100);
  }

  function markInteraction(event, kind = 'interaction') {
    if (!event?.isTrusted) return;
    state.lastInteractionAt = performance.now();
    state.energy = Math.max(state.energy, kind === 'press' ? .82 : .58);
    const x = Number(event.clientX), y = Number(event.clientY);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      state.pointerX = clamp(x / Math.max(1, innerWidth) * 2 - 1, -1, 1);
      state.pointerY = clamp(-(y / Math.max(1, innerHeight) * 2 - 1), -1, 1);
      addNeuralPulse(x, y, kind === 'press' ? .9 : .62);
    }
    scheduleState();
  }

  function runAwakening() {
    if (state.awakened || reduced.matches) return;
    state.awakened = true;
    setData('fxCoreAwakening', 'running');
    setData('fxCoreAwakeningStep', 'seed');
    try { sessionStorage.setItem(AWAKEN_KEY, '1'); } catch (_) {}
    corePulse('awakening-seed', .64, 1);
    const stages = [
      [260, 'ignite', 'awakening-ignite', .92, 2, 55],
      [610, 'filaments', 'awakening-filaments', .84, 3, 65],
      [980, 'rings', 'awakening-rings', .72, 2, 90],
      [1280, 'stable', 'awakening-stabilize', .48, 1, 70]
    ];
    for (const [delay, step, command, intensity, pulses, spacing] of stages) {
      window.setTimeout(() => { setData('fxCoreAwakeningStep', step); corePulse(command, intensity, pulses, spacing); }, delay);
    }
    window.setTimeout(() => {
      setData('fxCoreAwakening', 'complete');
      setData('fxCoreAwakeningStep', 'complete');
      notify('core-awakening-complete');
    }, 1540);
  }

  function reportInstability(reason) {
    state.errors += 1;
    state.stability = Math.max(.28, state.stability - .34);
    scheduleState();
    clearTimeout(stabilityTimer);
    corePulse('instability', .82, 3, 62);
    notify('instability:' + reason);
    stabilityTimer = window.setTimeout(() => {
      state.stability = 1;
      scheduleState();
      if (state.phase === 'verify') corePulse('stabilize', .42, 1);
    }, 1500);
  }

  function installSceneObserver() {
    if (!('IntersectionObserver' in window)) return;
    const sections = ['hero', 'experience', 'capabilities', 'pricing', 'system', 'resources']
      .map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;
    activeSceneObserver?.disconnect();
    activeSceneObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const scene = sections.indexOf(visible.target);
      if (scene >= 0) setPhase(sceneToPhase(scene), 'viewport', scene);
    }, { threshold: [.24, .42, .62], rootMargin: '-12% 0px -22% 0px' });
    sections.forEach(section => activeSceneObserver.observe(section));
  }

  function onOrientation(event) {
    if (reduced.matches || document.hidden) return;
    const now = performance.now();
    if (now - gyroLast < 72) return;
    gyroLast = now;
    const gamma = Number(event.gamma), beta = Number(event.beta);
    if (!Number.isFinite(gamma) || !Number.isFinite(beta)) return;
    state.gyro = true;
    setData('fxLivingGyro', 'active');
    state.pointerX += (clamp(gamma / 28, -1, 1) - state.pointerX) * .24;
    state.pointerY += (clamp((beta - 45) / 38, -1, 1) - state.pointerY) * .20;
    scheduleState();
    const host = document.querySelector('#hero .hero-space');
    const rect = host?.getBoundingClientRect();
    if (!rect || rect.bottom < 0 || rect.top > innerHeight) return;
    const clientX = rect.left + rect.width * (.5 + state.pointerX * .28);
    const clientY = rect.top + rect.height * (.5 - state.pointerY * .24);
    try {
      dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, pointerId: 91, pointerType: 'touch', isPrimary: true }));
    } catch (_) {}
  }

  function repairVisibleCopy() {
    if (!document.body || root.dataset.fxLivingCopyGuard === 'ready') return;
    const fixes = new Map([
      ['A mag érzékel.A gerinc döntési utat épít.', 'A mag érzékel. A gerinc döntési utat épít.'],
      ['Hat specializált szerv.Egyetlen élő rendszer.', 'Hat specializált szerv. Egyetlen élő rendszer.']
    ]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,textarea,pre,code')) continue;
      let next = node.nodeValue || '';
      for (const [broken, replacement] of fixes) next = next.replaceAll(broken, replacement);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    setData('fxLivingCopyGuard', 'ready');
  }

  function init() {
    ensureStyle();
    if (!ensureLayer()) return;
    try { state.awakened = sessionStorage.getItem(AWAKEN_KEY) === '1'; } catch (_) {}
    setData('fxCoreAwakening', state.awakened ? 'complete' : 'armed');
    complexityFromDevice();
    readConnection();
    repairVisibleCopy();
    installSceneObserver();
    applyState();
    notify('init');

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connection?.addEventListener?.('change', () => { readConnection(); notify('network-change'); });
    addEventListener('formatx:organismsemanticstate', event => setPhase(event.detail?.method, 'semantic', event.detail?.scene ?? root.dataset.fxScene ?? 0), { passive: true });
    addEventListener('formatx:organismstatechange', event => {
      const scene = Number(event.detail?.scene ?? 0); setPhase(sceneToPhase(scene), 'organism', scene);
    }, { passive: true });
    addEventListener('formatx:coreinteraction', event => {
      state.energy = Math.max(state.energy, event.detail?.phase === 'burst' ? 1 : .76);
      scheduleState();
      if (!state.awakened) runAwakening();
    }, { passive: true });
    addEventListener('formatx:loop', () => { setPhase('discover', 'loop', 0); corePulse('loop-return', .56, 2, 95); }, { passive: true });
    addEventListener('formatx:core3dready', () => corePulse('core-ready', .46, 1), { passive: true });
    addEventListener('formatx:languagechange', () => notify('language-change'), { passive: true });
    addEventListener('error', () => reportInstability('runtime-error'));
    addEventListener('unhandledrejection', () => reportInstability('promise-rejection'));

    const sensorPolicy = document.permissionsPolicy || document.featurePolicy;
    if (!sensorPolicy?.allowsFeature || sensorPolicy.allowsFeature('accelerometer')) {
      addEventListener('deviceorientation', onOrientation, { passive: true });
    } else setData('fxOrientationInput', 'policy-disabled');

    let pointerQueued = false;
    addEventListener('pointermove', event => {
      if (!event.isTrusted) return;
      state.pointerX = clamp(event.clientX / Math.max(1, innerWidth) * 2 - 1, -1, 1);
      state.pointerY = clamp(-(event.clientY / Math.max(1, innerHeight) * 2 - 1), -1, 1);
      if (!pointerQueued) {
        pointerQueued = true;
        requestAnimationFrame(() => { pointerQueued = false; scheduleState(); });
      }
    }, { passive: true });
    addEventListener('pointerdown', event => markInteraction(event, 'press'), { passive: true });
    addEventListener('click', event => markInteraction(event, 'click'), { passive: true });
    document.addEventListener('visibilitychange', () => {
      state.visible = !document.hidden;
      notify(document.hidden ? 'hidden' : 'visible');
    }, { passive: true });
    addEventListener('pageshow', () => {
      ensureLayer(); readConnection(); installSceneObserver(); scheduleState(); notify('pageshow');
    }, { passive: true });

    setData('fxLivingSystemRenderingState', 'ready');
  }

  window.FormatXLivingSystem = {
    version: VERSION, snapshot, setPhase, pulse: corePulse,
    verify() { return setPhase('verify', 'api', state.scene); },
    execute() { return setPhase('execute', 'api', state.scene); },
    plan() { return setPhase('plan', 'api', state.scene); },
    discover() { return setPhase('discover', 'api', state.scene); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
