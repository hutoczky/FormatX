(function () {
  'use strict';

  const ROOT = document.documentElement;
  const PARAMS = new URLSearchParams(window.location.search);
  const RENDERER_OVERRIDE = PARAMS.get('fx-renderer');
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MOBILE = window.matchMedia('(max-width: 820px), (pointer: coarse)');
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  function rendererName(gl) {
    try {
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      if (debug) return String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || '');
      return String(gl.getParameter(gl.RENDERER) || '');
    } catch (_) {
      return '';
    }
  }

  function shouldUseCanvasFallback() {
    if (RENDERER_OVERRIDE === 'webgl') return false;
    if (RENDERER_OVERRIDE === 'canvas') return true;

    let gl = null;
    try {
      const probe = document.createElement('canvas');
      gl = originalGetContext.call(probe, 'webgl2', {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance'
      });
      if (!gl) return true;

      const name = rendererName(gl);
      ROOT.dataset.fxGraphicsAdapter = name || 'webgl2-unknown';
      return /swiftshader|llvmpipe|software|mesa offscreen|microsoft basic|\bwarp\b/i.test(name);
    } catch (_) {
      return true;
    } finally {
      try {
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_) {}
    }
  }

  const forceCanvas = shouldUseCanvasFallback();
  if (forceCanvas) {
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (this.id === 'fx-apex-canvas' && type === 'webgl2') return null;
      return originalGetContext.apply(this, arguments);
    };
  }

  ROOT.dataset.fxRendererGuard = RENDERER_OVERRIDE === 'webgl'
    ? 'forced-webgl'
    : (forceCanvas ? 'canvas-fallback' : 'hardware-webgl');

  function accelerateIntro() {
    if (REDUCE.matches) return;
    const deadline = MOBILE.matches ? 920 : 1150;
    window.setTimeout(function () {
      if (!ROOT.classList.contains('fx-intro-running')) return;
      const skip = document.querySelector('.fx-intro-skip');
      if (skip) skip.click();
    }, deadline);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', accelerateIntro, { once: true });
  } else {
    accelerateIntro();
  }
}());
