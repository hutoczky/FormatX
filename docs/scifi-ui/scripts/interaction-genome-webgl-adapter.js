(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxGenomeWebglAdapter === 'ready') return;
  root.dataset.fxGenomeWebglAdapter = 'loading';

  let renderer = null;
  let canvas = null;
  let stage = null;
  let frame = 0;
  let observer = null;

  function loadScript(source, marker) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[' + marker + ']');
      if (existing) {
        if (window.FormatXGenomeRenderer3D) resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = source;
      script.defer = true;
      script.setAttribute(marker, 'true');
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function waitForGenome(timeout = 30000) {
    return new Promise((resolve, reject) => {
      const started = performance.now();
      function check() {
        const api = window.FormatXInteractionGenome;
        const overlay = document.getElementById('fx-interaction-genome');
        const original = document.getElementById('fx-genome-canvas');
        if (api && overlay && original) {
          resolve({ api, overlay, original });
          return;
        }
        if (performance.now() - started > timeout) {
          reject(new Error('Interaction Genome did not initialise'));
          return;
        }
        requestAnimationFrame(check);
      }
      check();
    });
  }

  function addHud() {
    if (!stage || stage.querySelector('.fx-genome-renderer-badge')) return;
    const badge = document.createElement('span');
    badge.className = 'fx-genome-renderer-badge';
    badge.textContent = 'NATIVE WEBGL2 / DEPTH / PBR NODES';
    const depth = document.createElement('i');
    depth.className = 'fx-genome-depth-scale';
    depth.setAttribute('aria-hidden', 'true');
    stage.append(badge, depth);
  }

  function renderLoop(now) {
    frame = 0;
    if (!renderer || !canvas) return;
    const api = window.FormatXInteractionGenome;
    const state = api?.getState?.();
    if (state) {
      renderer.setData(state.items, state.selected);
      renderer.resize();
      renderer.render(now);
    }
    const overlay = document.getElementById('fx-interaction-genome');
    if (overlay?.dataset.open === 'true') frame = requestAnimationFrame(renderLoop);
  }

  function start() {
    if (frame) return;
    frame = requestAnimationFrame(renderLoop);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  async function initialise() {
    try {
      await loadScript('./scripts/interaction-genome-webgl.js?v=20260728-genome-webgl-1', 'data-fx-genome-renderer-script');
      const { api, overlay, original } = await waitForGenome();
      stage = original.closest('.fx-genome-stage');
      if (!stage || !window.FormatXGenomeRenderer3D) throw new Error('WebGL Genome stage unavailable');

      canvas = document.createElement('canvas');
      canvas.className = 'fx-genome-webgl-canvas';
      canvas.tabIndex = 0;
      canvas.setAttribute('aria-label', original.getAttribute('aria-label') || 'FormatX Interaction Genome 3D');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '1';
      canvas.style.touchAction = 'none';
      stage.insertBefore(canvas, original);
      original.style.opacity = '0';
      original.style.pointerEvents = 'none';

      renderer = window.FormatXGenomeRenderer3D.create(canvas, {
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        onSelect(index) {
          api.close();
          Promise.resolve(api.restore(index)).catch(() => {});
        }
      });

      if (!renderer) {
        canvas.remove();
        original.style.opacity = '';
        original.style.pointerEvents = '';
        stage.dataset.renderer = 'canvas2d-fallback';
        root.dataset.fxInteractionGenomeRenderer = 'canvas2d-fallback';
        root.dataset.fxGenomeWebglAdapter = 'fallback';
        return;
      }

      stage.dataset.renderer = 'webgl2-pbr';
      root.dataset.fxInteractionGenomeRenderer = 'webgl2-pbr';
      root.dataset.fxGenomeWebglAdapter = 'ready';
      addHud();

      canvas.addEventListener('pointermove', event => {
        const point = pointerPosition(event);
        renderer.pointerMove(point.x, point.y, event);
      });
      canvas.addEventListener('pointerleave', () => renderer.pointerLeave());
      canvas.addEventListener('click', () => renderer.click());

      observer = new MutationObserver(() => {
        if (overlay.dataset.open === 'true') start();
        else stop();
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['data-open'] });
      if (overlay.dataset.open === 'true') start();

      addEventListener('resize', () => renderer?.resize(), { passive: true });
      addEventListener('pagehide', () => {
        stop();
        observer?.disconnect();
        renderer?.destroy();
      }, { once: true });

      document.dispatchEvent(new CustomEvent('formatx:interaction-genome-3d-ready', {
        detail: renderer.getStatus()
      }));
    } catch (error) {
      console.warn('FormatX Interaction Genome 3D adapter fallback:', error);
      root.dataset.fxGenomeWebglAdapter = 'error';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
