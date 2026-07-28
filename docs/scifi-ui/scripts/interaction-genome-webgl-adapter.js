(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxGenomeWebglAdapter === 'ready') return;
  root.dataset.fxGenomeWebglAdapter = 'loading';

  let renderer = null;
  let canvas = null;
  let stage = null;
  let overlay = null;
  let frame = 0;
  let lastRenderedAt = 0;
  let observer = null;
  let resizeObserver = null;
  let targetFrameInterval = 1000 / 30;
  let destroyed = false;

  function loadStyle(source, marker) {
    if (document.querySelector('link[' + marker + ']')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = source;
    link.setAttribute(marker, 'true');
    document.head.appendChild(link);
  }

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
        const genomeOverlay = document.getElementById('fx-interaction-genome');
        const original = document.getElementById('fx-genome-canvas');
        if (api && genomeOverlay && original) {
          resolve({ api, genomeOverlay, original });
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

  function status() {
    return renderer?.getStatus?.() || null;
  }

  function publishTelemetry() {
    if (!canvas || !renderer) return;
    const current = status();
    if (!current) return;
    canvas.dataset.fxQuality = current.quality;
    canvas.dataset.fxTargetFps = String(current.targetFps);
    canvas.dataset.fxEffectiveDpr = String(current.effectiveDpr);
    canvas.dataset.fxResolutionScale = String(current.resolutionScale);
    canvas.dataset.fxMaxPixels = String(current.maxPixels);
    canvas.dataset.fxBackingPixels = String(current.backingPixels);
    canvas.dataset.fxParticleCount = String(current.particles);
    canvas.dataset.fxIs4k = String(current.fourK);
    canvas.dataset.fxResizeCount = String(current.resizeCount);
    root.dataset.fxGenomeQuality = current.quality;
    root.dataset.fxGenome4k = current.fourK ? 'adaptive' : 'standard';
    root.dataset.fxGenomeFpsCap = String(current.targetFps);
  }

  function addHud() {
    if (!stage || stage.querySelector('.fx-genome-renderer-badge')) return;
    const current = status();
    const badge = document.createElement('span');
    badge.className = 'fx-genome-renderer-badge';
    badge.innerHTML = '<b>NATIVE WEBGL2</b><small></small>';
    badge.querySelector('small').textContent = current?.fourK
      ? '4K ADAPTIVE · ' + current.targetFps + ' FPS CAP'
      : 'ADAPTIVE QUALITY · ' + current?.targetFps + ' FPS CAP';

    const depth = document.createElement('i');
    depth.className = 'fx-genome-depth-scale';
    depth.setAttribute('aria-hidden', 'true');
    stage.append(badge, depth);
  }

  function renderOnce(now) {
    if (!renderer || !canvas || destroyed) return false;
    const api = window.FormatXInteractionGenome;
    const genomeState = api?.getState?.();
    if (!genomeState) return false;
    renderer.setData(genomeState.items, genomeState.selected);
    const rendered = renderer.render(now);
    if (!rendered) return false;
    canvas.dataset.fxRenderedFrame = String(Number(canvas.dataset.fxRenderedFrame || 0) + 1);
    canvas.dataset.fxRenderedNodes = String(genomeState.items.length);
    canvas.dataset.fxRenderedAt = String(Math.round(now));
    publishTelemetry();
    return true;
  }

  function renderLoop(now) {
    frame = 0;
    if (destroyed || document.hidden || overlay?.dataset.open !== 'true') return;

    if (!lastRenderedAt || now - lastRenderedAt >= targetFrameInterval - 1) {
      if (renderOnce(now)) lastRenderedAt = now;
    } else {
      canvas.dataset.fxSkippedFrames = String(Number(canvas.dataset.fxSkippedFrames || 0) + 1);
    }
    frame = requestAnimationFrame(renderLoop);
  }

  function start() {
    if (frame || destroyed || document.hidden || overlay?.dataset.open !== 'true') return;
    frame = requestAnimationFrame(renderLoop);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastRenderedAt = 0;
  }

  function resize() {
    if (!renderer || destroyed) return;
    renderer.resize();
    publishTelemetry();
    if (overlay?.dataset.open === 'true' && !document.hidden) renderOnce(performance.now());
  }

  function pointerPosition(event) {
    const rectangle = canvas.getBoundingClientRect();
    return { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top };
  }

  async function initialise() {
    try {
      loadStyle('./styles/formatx-4k-polish.css?v=20260728-4k-polish-1', 'data-fx-4k-polish-style');
      await loadScript('./scripts/interaction-genome-webgl.js?v=20260728-genome-webgl-4k-v2', 'data-fx-genome-renderer-script');
      const { api, genomeOverlay, original } = await waitForGenome();
      overlay = genomeOverlay;
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
      canvas.dataset.fxRenderedFrame = '0';
      canvas.dataset.fxRenderedNodes = '0';
      canvas.dataset.fxSkippedFrames = '0';
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

      const current = status();
      targetFrameInterval = 1000 / Math.max(1, current.targetFps);
      stage.dataset.renderer = 'webgl2-pbr';
      stage.dataset.quality = current.quality;
      root.dataset.fxInteractionGenomeRenderer = 'webgl2-pbr';
      root.dataset.fxGenomeWebglAdapter = 'ready';
      root.dataset.fxGenomeResourcePolicy = 'adaptive-4k-v2';
      publishTelemetry();
      addHud();

      canvas.addEventListener('pointermove', event => {
        const point = pointerPosition(event);
        renderer.pointerMove(point.x, point.y, event);
      }, { passive: true });
      canvas.addEventListener('pointerleave', () => renderer.pointerLeave(), { passive: true });
      canvas.addEventListener('click', () => renderer.click());

      observer = new MutationObserver(() => {
        if (overlay.dataset.open === 'true') {
          resize();
          start();
        } else stop();
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['data-open'] });

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => resize());
        resizeObserver.observe(stage);
      } else {
        addEventListener('resize', resize, { passive: true });
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (overlay.dataset.open === 'true') {
          resize();
          start();
        }
      });

      resize();
      if (overlay.dataset.open === 'true') start();

      addEventListener('pagehide', () => {
        destroyed = true;
        stop();
        observer?.disconnect();
        resizeObserver?.disconnect();
        renderer?.destroy();
      }, { once: true });

      window.FormatXGenome3DAdapter = Object.freeze({
        version: 'adaptive-4k-v2',
        getStatus: () => status(),
        renderOnce: () => renderOnce(performance.now())
      });

      document.dispatchEvent(new CustomEvent('formatx:interaction-genome-3d-ready', {
        detail: status()
      }));
    } catch (error) {
      console.warn('FormatX Interaction Genome 3D adapter fallback:', error);
      root.dataset.fxGenomeWebglAdapter = 'error';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());