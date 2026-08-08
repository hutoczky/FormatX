(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxApexSceneStability === 'ready-v1') return;

  const Context = window.WebGL2RenderingContext;
  if (!Context || !Context.prototype) {
    root.dataset.fxApexSceneStability = 'webgl2-unavailable';
    return;
  }

  const originalGetUniformLocation = Context.prototype.getUniformLocation;
  const originalUniform1f = Context.prototype.uniform1f;
  const sceneLocations = new WeakSet();
  let sections = [];
  let smoothedScene = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  function refreshSections() {
    sections = Array.from(document.querySelectorAll('main > .scene'));
  }

  function mappedScene() {
    if (sections.length < 2) refreshSections();
    if (!sections.length) return 0;

    const probe = scrollY + innerHeight * 0.18;
    if (probe <= sections[0].offsetTop) return 0;

    for (let index = 0; index < sections.length - 1; index += 1) {
      const start = sections[index].offsetTop;
      const end = sections[index + 1].offsetTop;
      if (probe >= end) continue;

      const span = Math.max(1, end - start);
      const raw = clamp((probe - start) / span, 0, 1);
      // Keep each chapter visually stable first, then morph deliberately near its exit.
      const morph = smoothstep((raw - 0.38) / 0.50);
      return index + morph;
    }

    return Math.max(0, sections.length - 1);
  }

  Context.prototype.getUniformLocation = function patchedGetUniformLocation(program, name) {
    const location = originalGetUniformLocation.call(this, program, name);
    if (
      location
      && name === 'uScene'
      && this.canvas instanceof HTMLCanvasElement
      && this.canvas.dataset.fxNativeApexCanvas === 'true'
    ) {
      sceneLocations.add(location);
    }
    return location;
  };

  Context.prototype.uniform1f = function patchedUniform1f(location, value) {
    if (location && sceneLocations.has(location)) {
      const target = mappedScene();
      if (smoothedScene === null || Math.abs(target - smoothedScene) > 2.25) {
        smoothedScene = target;
      } else {
        smoothedScene += (target - smoothedScene) * 0.115;
      }
      root.dataset.fxApexMappedScene = smoothedScene.toFixed(3);
      return originalUniform1f.call(this, location, smoothedScene);
    }
    return originalUniform1f.call(this, location, value);
  };

  addEventListener('resize', refreshSections, { passive: true });
  addEventListener('orientationchange', refreshSections, { passive: true });
  addEventListener('formatx:loop', () => { smoothedScene = null; });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshSections, { once: true });
  } else {
    refreshSections();
  }

  root.dataset.fxApexSceneStability = 'ready-v1';
  root.dataset.fxCoreHold = 'stable-before-morph';
}());
