(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'living-system-rendering-v1';
  const STYLE_URL = '/scifi-ui/styles/formatx-living-system-rendering-v1.css?v=20260812-award-r1';
  const AWAKEN_KEY = 'formatx-core-awakening-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  if (root.dataset.fxLivingSystemRendering === VERSION) return;
  root.dataset.fxLivingSystemRendering = VERSION;
  root.dataset.fxLivingTelemetry = 'browser-runtime-real-data';

  const state = {
    phase: 'discover',
    scene: 0,
    fps: 60,
    frameMs: 16.7,
    renderPressure: 0,
    latency: null,
    downlink: null,
    effectiveType: '',
    hardwareConcurrency: Number(navigator.hardwareConcurrency || 0),
    deviceMemory: Number(navigator.deviceMemory || 0),
    complexity: .65,
    energy: .28,
    stability: 1,
    pointerX: 0,
    pointerY: 0,
    visible: true,
    lastInteractionAt: 0,
    errors: 0,
    awakened: false,
    gyro: false
  };

  let layer;
  let neuralLayer;
  let transition;
  let raf = 0;
  let previousFrame = performance.now();
  let frameAccumulator = 0;
  let frameCount = 0;
  let metricWindowStarted = previousFrame;
  let transitionTimer = 0;
  let stabilityTimer = 0;
  let ambientTimer = 0;
  let gyroLast = 0;
  let activeSceneObserver = null;

  function ensureStyle() {
    if (document.querySelector('link[data-fx-living-system-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    link.dataset.fxLivingSystemStyle = VERSION;
    link.addEventListener('load', () => { root.dataset.fxLivingSystemStyle = 'ready'; }, { once: true });
    link.addEventListener('error', () => { root.dataset.fxLivingSystemStyle = 'failed'; }, { once: true });
    document.head.appendChild(link);
  }

  function ensureLayer() {
    if (!document.body) return false;
    layer = document.querySelector('.fx-living-system-layer');
    if (!layer) {
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
    return Boolean(transition && neuralLayer);
  }

  function complexityFromDevice() {
    const cores = state.hardwareConcurrency || 4;
    const memory = state.deviceMemory || (mobile ? 4 : 8);
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined';
    const base = clamp((cores / 12) * .46 + (memory / 12) * .34 + (webgl2 ? .20 : 0), .25, 1);
    state.complexity = mobile ? Math.min(.72, base) : base;
    const tier = state.complexity >= .78 ? 'high' : state.complexity >= .48 ? 'standard' : 'reduced';
    root.dataset.fxLivingComplexityTier = tier;
    root.style.setProperty('--fx-system-complexity', state.complexity.toFixed(3));
  }

  function readConnection() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) {
      state.latency = null;
      state.downlink = null;
      state.effectiveType = '';
      root.dataset.fxLivingNetwork = 'unavailable';
      return;
    }
    state.latency = Number.isFinite(Number(connection.rtt)) ? Number(connection.rtt) : null;
    state.downlink = Number.isFinite(Number(connection.downlink)) ? Number(connection.downlink) : null;
    state.effectiveType = String(connection.effectiveType || '');
    root.dataset.fxLivingNetwork = state.effectiveType || 'available';
    const normalizedLatency = state.latency == null ? .2 : clamp(state.latency / 650, 0, 1);
    root.style.setProperty('--fx-system-latency', normalizedLatency.toFixed(3));
  }

  function applyState() {
    root.dataset.fxLivingPhase = state.phase;
    root.dataset.fxLivingScene = String(state.scene);
    root.dataset.fxSystemStability = state.stability < .62 ? 'unstable' : 'stable';
    root.dataset.fxLivingFps = String(Math.round(state.fps));
    root.dataset.fxLivingRenderPressure = state.renderPressure.toFixed(3);
    root.style.setProperty('--fx-system-energy', clamp(state.energy, .08, 1).toFixed(3));
    root.style.setProperty('--fx-system-stability', clamp(state.stability, 0, 1).toFixed(3));
    root.style.setProperty('--fx-system-pressure', clamp(state.renderPressure, 0, 1).toFixed(3));
    root.style.setProperty('--fx-system-pointer-x', clamp(state.pointerX, -1, 1).toFixed(3));
    root.style.setProperty('--fx-system-pointer-y', clamp(state.pointerY, -1, 1).toFixed(3));
  }

  function snapshot() {
    return Object.freeze({
      version: VERSION,
      phase: state.phase,
      scene: state.scene,
      fps: Math.round(state.fps * 10) / 10,
      frameMs: Math.round(state.frameMs * 10) / 10,
      renderPressure: Math.round(state.renderPressure * 1000) / 1000,
      latency: state.latency,
      downlink: state.downlink,
      effectiveType: state.effectiveType,
      hardwareConcurrency: state.hardwareConcurrency || null,
      deviceMemory: state.deviceMemory || null,
      complexity: Math.round(state.complexity * 1000) / 1000,
      energy: Math.round(state.energy * 1000) / 1000,
      stability: Math.round(state.stability * 1000) / 1000,
      gyro: state.gyro,
      source: 'browser-runtime'
    });
  }

  function notify(reason) {
    dispatchEvent(new CustomEvent('formatx:systemstate', {
      detail: { reason, state: snapshot() }
    }));
  }

  function corePulse(kind, intensity = .7, repetitions = 1, spacing = 70) {
    const safeIntensity = clamp(Number(intensity) || .7, .1, 1);
    const repeats = clamp(Math.round(repetitions), 1, 6);
    state.energy = Math.max(state.energy, safeIntensity);
    applyState();

    for (let index = 0; index < repeats; index += 1) {
      window.setTimeout(() => {
        dispatchEvent(new CustomEvent('formatx:organismcoreactivate', {
          detail: {
            source: VERSION,
            phase: kind,
            intensity: safeIntensity,
            operationalPhase: state.phase,
            telemetry: snapshot()
          }
        }));
        dispatchEvent(new CustomEvent('formatx:corecommand', {
          detail: {
            source: VERSION,
            command: kind,
            intensity: safeIntensity,
            operationalPhase: state.phase
          }
        }));
      }, index * spacing);
    }
  }

  function phaseProfile(phase) {
    switch (phase) {
      case 'plan': return { energy: .52, pulses: 2, spacing: 105, command: 'structure-rearrange' };
      case 'execute': return { energy: .88, pulses: 4, spacing: 58, command: 'energy-impulse' };
      case 'verify': return { energy: .44, pulses: 2, spacing: 150, command: 'stabilize' };
      default: return { energy: .40, pulses: 2, spacing: 125, command: 'discover-open' };
    }
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
    root.dataset.fxLivingTransition = 'active';
    transitionTimer = window.setTimeout(() => {
      root.dataset.fxLivingTransition = 'idle';
    }, mobile ? 360 : 510);
  }

  function setPhase(value, source = 'system', scene = state.scene) {
    const phase = normalizePhase(value);
    const changed = phase !== state.phase || Number(scene) !== state.scene;
    state.phase = phase;
    state.scene = clamp(Number(scene) || 0, 0, 5);
    const profile = phaseProfile(phase);
    state.energy = Math.max(profile.energy, state.energy * .78);
    applyState();

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
    if (!neuralLayer || reduced.matches) return;
    const node = document.createElement('i');
    node.className = 'fx-living-neural-pulse';
    node.style.setProperty('--fx-neural-x', clamp(x, 0, innerWidth) + 'px');
    node.style.setProperty('--fx-neural-y', clamp(y, 0, innerHeight) + 'px');
    node.style.setProperty('--fx-neural-angle', ((x / Math.max(1, innerWidth) - .5) * 85 + (Math.random() - .5) * 22).toFixed(1) + 'deg');
    node.style.opacity = String(clamp(intensity, .25, 1));
    neuralLayer.appendChild(node);
    node.addEventListener('animationend', () => node.remove(), { once: true });
    window.setTimeout(() => node.remove(), 1100);
  }

  function markInteraction(event, kind = 'interaction') {
    if (!event?.isTrusted) return;
    state.lastInteractionAt = performance.now();
    state.energy = Math.max(state.energy, kind === 'press' ? .82 : .58);
    const x = Number(event.clientX);
    const y = Number(event.clientY);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      state.pointerX = clamp(x / Math.max(1, innerWidth) * 2 - 1, -1, 1);
      state.pointerY = clamp(-(y / Math.max(1, innerHeight) * 2 - 1), -1, 1);
      addNeuralPulse(x, y, kind === 'press' ? .9 : .62);
    }
    applyState();
  }

  function runAwakening() {
    if (state.awakened || reduced.matches) return;
    state.awakened = true;
    root.dataset.fxCoreAwakening = 'running';
    root.dataset.fxCoreAwakeningStep = 'seed';
    try { sessionStorage.setItem(AWAKEN_KEY, '1'); } catch (_) {}

    corePulse('awakening-seed', .64, 1);
    window.setTimeout(() => {
      root.dataset.fxCoreAwakeningStep = 'ignite';
      corePulse('awakening-ignite', .92, 2, 55);
    }, 260);
    window.setTimeout(() => {
      root.dataset.fxCoreAwakeningStep = 'filaments';
      corePulse('awakening-filaments', .84, 3, 65);
    }, 610);
    window.setTimeout(() => {
      root.dataset.fxCoreAwakeningStep = 'rings';
      corePulse('awakening-rings', .72, 2, 90);
    }, 980);
    window.setTimeout(() => {
      root.dataset.fxCoreAwakeningStep = 'stable';
      corePulse('awakening-stabilize', .48, 1);
    }, 1280);
    window.setTimeout(() => {
      root.dataset.fxCoreAwakening = 'complete';
      root.dataset.fxCoreAwakeningStep = 'complete';
      notify('core-awakening-complete');
    }, 1540);
  }

  function onCoreInteraction(event) {
    const detail = event.detail || {};
    state.energy = Math.max(state.energy, detail.phase === 'burst' ? 1 : .76);
    applyState();
    if (!state.awakened) runAwakening();
  }

  function reportInstability(reason) {
    state.errors += 1;
    state.stability = Math.max(.28, state.stability - .34);
    root.dataset.fxSystemStability = 'unstable';
    clearTimeout(stabilityTimer);
    corePulse('instability', .82, 3, 62);
    notify('instability:' + reason);
    stabilityTimer = window.setTimeout(() => {
      state.stability = 1;
      applyState();
      if (state.phase === 'verify') corePulse('stabilize', .42, 1);
    }, 1500);
  }

  function sampleFrame(now) {
    const delta = clamp(now - previousFrame, 1, 120);
    previousFrame = now;
    frameAccumulator += delta;
    frameCount += 1;

    if (now - metricWindowStarted >= 1000) {
      const mean = frameAccumulator / Math.max(1, frameCount);
      state.frameMs = mean;
      state.fps = clamp(1000 / mean, 1, 240);
      state.renderPressure = clamp((state.frameMs - 16.7) / 25, 0, 1);
      root.dataset.fxLivingFps = String(Math.round(state.fps));
      root.dataset.fxLivingFrameMs = state.frameMs.toFixed(1);
      root.dataset.fxLivingRenderPressure = state.renderPressure.toFixed(3);
      root.style.setProperty('--fx-system-pressure', state.renderPressure.toFixed(3));
      frameAccumulator = 0;
      frameCount = 0;
      metricWindowStarted = now;
      notify('telemetry');
    }

    const idleFor = now - state.lastInteractionAt;
    const targetEnergy = state.phase === 'execute' ? .42 : state.phase === 'plan' ? .30 : state.phase === 'verify' ? .24 : .27;
    const decay = idleFor > 700 ? .008 : .003;
    state.energy += (targetEnergy - state.energy) * decay;
    if (frameCount % 8 === 0) applyState();
    raf = requestAnimationFrame(sampleFrame);
  }

  function installSceneObserver() {
    if (!('IntersectionObserver' in window)) return;
    const sections = ['hero', 'experience', 'capabilities', 'pricing', 'system', 'resources']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    activeSceneObserver?.disconnect();
    activeSceneObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const scene = sections.indexOf(visible.target);
      if (scene >= 0) setPhase(sceneToPhase(scene), 'viewport', scene);
    }, { threshold: [0.24, 0.42, 0.62], rootMargin: '-12% 0px -22% 0px' });
    sections.forEach(section => activeSceneObserver.observe(section));
  }

  function onOrientation(event) {
    if (reduced.matches || document.hidden) return;
    const now = performance.now();
    if (now - gyroLast < 72) return;
    gyroLast = now;
    const gamma = Number(event.gamma);
    const beta = Number(event.beta);
    if (!Number.isFinite(gamma) || !Number.isFinite(beta)) return;
    state.gyro = true;
    root.dataset.fxLivingGyro = 'active';
    const nx = clamp(gamma / 28, -1, 1);
    const ny = clamp((beta - 45) / 38, -1, 1);
    state.pointerX += (nx - state.pointerX) * .24;
    state.pointerY += (ny - state.pointerY) * .20;
    applyState();

    const host = document.querySelector('#hero .hero-space');
    const rect = host?.getBoundingClientRect();
    if (!rect || rect.bottom < 0 || rect.top > innerHeight) return;
    const clientX = rect.left + rect.width * (.5 + state.pointerX * .28);
    const clientY = rect.top + rect.height * (.5 - state.pointerY * .24);
    try {
      dispatchEvent(new PointerEvent('pointermove', {
        clientX,
        clientY,
        pointerId: 91,
        pointerType: 'touch',
        isPrimary: true
      }));
    } catch (_) {}
  }

  function repairVisibleCopy() {
    const fixes = new Map([
      ['A mag érzékel.A gerinc döntési utat épít.', 'A mag érzékel. A gerinc döntési utat épít.'],
      ['Hat specializált szerv.Egyetlen élő rendszer.', 'Hat specializált szerv. Egyetlen élő rendszer.'],
      ['hivatalos kiadási csatorna csatornáján', 'hivatalos kiadási csatornán']
    ]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,textarea,pre,code')) continue;
      const text = node.nodeValue || '';
      let next = text;
      fixes.forEach((replacement, broken) => { next = next.replaceAll(broken, replacement); });
      if (next !== text) node.nodeValue = next;
    }
    root.dataset.fxLivingCopyGuard = 'ready';
  }

  function startAmbientDriver() {
    clearInterval(ambientTimer);
    ambientTimer = window.setInterval(() => {
      if (document.hidden) return;
      const hero = document.getElementById('hero');
      const rect = hero?.getBoundingClientRect();
      const heroVisible = rect && rect.bottom > 0 && rect.top < innerHeight;
      if (!heroVisible) return;
      if (state.phase === 'execute') corePulse('execute-flow', .54, 1);
      else if (state.phase === 'plan' && state.renderPressure < .6) corePulse('plan-scan', .38, 1);
      else if (state.phase === 'verify' && state.stability > .8) corePulse('verify-lock', .30, 1);
    }, mobile ? 3100 : 2400);
  }

  function init() {
    ensureStyle();
    if (!ensureLayer()) return;
    try { state.awakened = sessionStorage.getItem(AWAKEN_KEY) === '1'; } catch (_) {}
    root.dataset.fxCoreAwakening = state.awakened ? 'complete' : 'armed';
    complexityFromDevice();
    readConnection();
    repairVisibleCopy();
    installSceneObserver();
    startAmbientDriver();
    applyState();
    notify('init');

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connection?.addEventListener?.('change', () => { readConnection(); notify('network-change'); });

    addEventListener('formatx:organismsemanticstate', event => {
      const detail = event.detail || {};
      setPhase(detail.method, 'semantic', detail.scene ?? root.dataset.fxScene ?? 0);
    }, { passive: true });
    addEventListener('formatx:organismstatechange', event => {
      const scene = Number(event.detail?.scene ?? 0);
      setPhase(sceneToPhase(scene), 'organism', scene);
    }, { passive: true });
    addEventListener('formatx:coreinteraction', onCoreInteraction, { passive: true });
    addEventListener('formatx:loop', () => {
      setPhase('discover', 'loop', 0);
      corePulse('loop-return', .56, 2, 95);
    }, { passive: true });
    addEventListener('formatx:core3dready', () => corePulse('core-ready', .46, 1), { passive: true });
    addEventListener('formatx:languagechange', () => notify('language-change'), { passive: true });
    addEventListener('error', () => reportInstability('runtime-error'));
    addEventListener('unhandledrejection', () => reportInstability('promise-rejection'));
    addEventListener('deviceorientation', onOrientation, { passive: true });

    addEventListener('pointermove', event => {
      if (!event.isTrusted) return;
      state.pointerX = clamp(event.clientX / Math.max(1, innerWidth) * 2 - 1, -1, 1);
      state.pointerY = clamp(-(event.clientY / Math.max(1, innerHeight) * 2 - 1), -1, 1);
    }, { passive: true });
    addEventListener('pointerdown', event => markInteraction(event, 'press'), { passive: true });
    addEventListener('click', event => markInteraction(event, 'click'), { passive: true });
    addEventListener('visibilitychange', () => {
      state.visible = !document.hidden;
      notify(document.hidden ? 'hidden' : 'visible');
    }, { passive: true });
    addEventListener('pageshow', () => {
      ensureLayer();
      readConnection();
      repairVisibleCopy();
      installSceneObserver();
      applyState();
      notify('pageshow');
    }, { passive: true });

    raf = requestAnimationFrame(sampleFrame);
    root.dataset.fxLivingSystemRenderingState = 'ready';
  }

  window.FormatXLivingSystem = {
    version: VERSION,
    snapshot,
    setPhase,
    pulse: corePulse,
    verify() { return setPhase('verify', 'api', state.scene); },
    execute() { return setPhase('execute', 'api', state.scene); },
    plan() { return setPhase('plan', 'api', state.scene); },
    discover() { return setPhase('discover', 'api', state.scene); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
