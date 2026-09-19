/* FormatX R860 — cinematic scene director.
   Scene-state only. Native scrolling, anchors, controls and layout ownership stay untouched. */
(() => {
  'use strict';

  const root = document.documentElement;
  const script = document.currentScript;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = Array.from(document.querySelectorAll('main#main-content > .scene[data-organ]'));
  if (!scenes.length) return;
  const bridgeSelector = '.fx-static-live-os,.fx-category-deck--standalone,[data-fx-cinematic-bridge]';
  const bridges = Array.from(document.querySelectorAll(bridgeSelector));
  const stages = [...scenes, ...bridges].filter((node, index, list) => node instanceof HTMLElement && list.indexOf(node) === index);

  let field = document.querySelector('.fx-cinematic-field-r860');
  if (!(field instanceof HTMLElement)) {
    field = document.createElement('div');
    field.className = 'fx-cinematic-field-r860';
    field.setAttribute('aria-hidden', 'true');
    document.body.prepend(field);
  }

  const styleHref = new URL('../styles/formatx-cinematic-system-r860.css?v=20260919-r860-scene-director', script?.src || document.baseURI).href;
  if (!document.querySelector('link[data-fx-cinematic-system-r860]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styleHref;
    link.dataset.fxCinematicSystemR860 = 'true';
    document.head.appendChild(link);
  }

  const ratios = new Map();
  let active = null;

  const sceneName = scene => {
    if (!(scene instanceof HTMLElement)) return 'core';
    if (scene.dataset.fxCinematicBridge) return scene.dataset.fxCinematicBridge;
    if (scene.classList.contains('fx-static-live-os')) return 'system-awakening';
    if (scene.classList.contains('fx-category-deck--standalone')) return 'system-definition';
    return scene.dataset.organ || 'core';
  };
  const setBridgeState = () => {
    document.querySelectorAll('.fx-static-live-os,.fx-category-deck--standalone').forEach((node, index) => {
      node.dataset.fxCinematicBridgeR860 = index === 0 ? 'evidence-scan' : 'system-definition';
    });
  };

  function activate(scene, source) {
    if (!(scene instanceof HTMLElement) || scene === active) return;
    active = scene;
    for (const item of stages) item.dataset.fxCinematicActive = item === scene ? 'true' : 'false';
    const name = sceneName(scene);
    root.dataset.fxCinematicScene = name;
    root.dataset.fxCinematicIndex = String(Math.max(0, stages.indexOf(scene)) + 1).padStart(2, '0');
    root.dataset.fxCinematicRuntimeR860 = 'active';
    root.classList.add('fx-cinematic-ready');
    document.dispatchEvent(new CustomEvent('formatx:cinematicscenechange', {
      detail: { id: scene.id || '', organ: name, source }
    }));
  }

  function bestVisible() {
    let winner = null;
    let score = -1;
    for (const scene of stages) {
      const ratio = ratios.get(scene) || 0;
      if (ratio > score) {
        score = ratio;
        winner = scene;
      }
    }
    if (winner && score > 0) return winner;

    const mid = innerHeight * .46;
    return stages
      .map(scene => ({ scene, d: Math.abs((scene.getBoundingClientRect().top + scene.getBoundingClientRect().height * .34) - mid) }))
      .sort((a, b) => a.d - b.d)[0]?.scene || stages[0];
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
    activate(bestVisible(), 'intersection');
  }, {
    root: null,
    rootMargin: '-14% 0px -42% 0px',
    threshold: [0, .08, .18, .32, .48, .66, .82]
  });

  stages.forEach((scene, index) => {
    scene.dataset.fxCinematicSceneR860 = sceneName(scene);
    scene.dataset.fxCinematicOrderR860 = String(index + 1).padStart(2, '0');
    scene.dataset.fxCinematicActive = 'false';
    observer.observe(scene);

    scene.addEventListener('focusin', () => activate(scene, 'focus'), { passive: true });
    scene.addEventListener('pointerdown', () => activate(scene, 'pointer'), { passive: true });
  });

  function activateHash() {
    if (!location.hash) return false;
    const target = document.getElementById(location.hash.slice(1));
    const scene = target?.closest?.('.scene[data-organ],.fx-static-live-os,.fx-category-deck--standalone,[data-fx-cinematic-bridge]');
    if (scene) {
      activate(scene, 'hash');
      return true;
    }
    return false;
  }

  addEventListener('hashchange', activateHash, { passive: true });
  addEventListener('pageshow', () => activateHash() || activate(bestVisible(), 'pageshow'), { once: true, passive: true });

  setBridgeState();
  if (!activateHash()) activate(bestVisible(), 'boot');

  root.dataset.fxCinematicMotionR860 = reduced.matches ? 'reduced' : 'full';
  const onMotionChange = event => {
    root.dataset.fxCinematicMotionR860 = event.matches ? 'reduced' : 'full';
  };
  reduced.addEventListener?.('change', onMotionChange);

  addEventListener('pagehide', () => {
    observer.disconnect();
    reduced.removeEventListener?.('change', onMotionChange);
  }, { once: true });
})();
