(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxWdaGpuGovernor === 'r198') return;
  root.dataset.fxWdaGpuGovernor = 'r198';
  root.dataset.fxWdaTargetFps = '60';
  root.dataset.fxWdaFrameBudgetMs = '16.67';

  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  if (!mobile) {
    root.dataset.fxWdaGpuMode = 'desktop-native';
    root.dataset.fxWdaRenderScale = '1.00';
    return;
  }

  const widthDescriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width');
  const heightDescriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'height');
  if (!widthDescriptor?.get || !widthDescriptor?.set || !heightDescriptor?.get || !heightDescriptor?.set) {
    root.dataset.fxWdaGpuMode = 'native-descriptor-unavailable';
    return;
  }

  let scale = 0.86;
  let slowSamples = 0;
  let fastSamples = 0;
  let active = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function publish(mode) {
    root.dataset.fxWdaRenderScale = scale.toFixed(2);
    root.dataset.fxWdaGpuMode = mode;
    root.dataset.fxWdaTargetFps = '60';
    root.dataset.fxWdaFrameBudgetMs = '16.67';
  }

  function applyBackingScale(state) {
    if (!state || !state.canvas.isConnected) return;
    const actualWidth = Math.max(2, Math.round(state.intendedWidth * scale));
    const actualHeight = Math.max(2, Math.round(state.intendedHeight * scale));
    widthDescriptor.set.call(state.canvas, actualWidth);
    heightDescriptor.set.call(state.canvas, actualHeight);
    state.nativeViewport(0, 0, actualWidth, actualHeight);
    publish(scale < 0.72 ? 'resolution-low' : scale < 0.9 ? 'resolution-balanced' : 'resolution-full');
  }

  function patchCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement) || canvas.dataset.fxWdaGpuR198 === 'true') return;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    const state = {
      canvas,
      gl,
      intendedWidth: Math.max(2, widthDescriptor.get.call(canvas)),
      intendedHeight: Math.max(2, heightDescriptor.get.call(canvas)),
      nativeViewport: gl.viewport.bind(gl)
    };

    try {
      Object.defineProperty(canvas, 'width', {
        configurable: true,
        get() { return state.intendedWidth; },
        set(value) {
          state.intendedWidth = Math.max(2, Number(value) || 2);
          widthDescriptor.set.call(canvas, Math.max(2, Math.round(state.intendedWidth * scale)));
        }
      });
      Object.defineProperty(canvas, 'height', {
        configurable: true,
        get() { return state.intendedHeight; },
        set(value) {
          state.intendedHeight = Math.max(2, Number(value) || 2);
          heightDescriptor.set.call(canvas, Math.max(2, Math.round(state.intendedHeight * scale)));
        }
      });
      gl.viewport = function (x, y, width, height) {
        if (x === 0 && y === 0 && width >= state.intendedWidth - 2 && height >= state.intendedHeight - 2) {
          return state.nativeViewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
        return state.nativeViewport(x, y, width, height);
      };
      canvas.dataset.fxWdaGpuR198 = 'true';
      active = state;
      applyBackingScale(state);
    } catch (_) {
      root.dataset.fxWdaGpuMode = 'native-fallback';
    }
  }

  function findCanvas() {
    const canvas = document.querySelector('#hero canvas.fx-core-mobile-v55-canvas');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    if (canvas.dataset.fxWdaGpuR198 !== 'true') patchCanvas(canvas);
  }

  function sampleFrameBudget() {
    const frameMs = Number.parseFloat(root.dataset.fxCoreFrameMs || '');
    if (!Number.isFinite(frameMs) || !active) return;

    if (frameMs > 19.5) {
      slowSamples += 1;
      fastSamples = 0;
      if (slowSamples >= 3 && scale > 0.58) {
        scale = clamp(scale * 0.88, 0.58, 1);
        slowSamples = 0;
        applyBackingScale(active);
      }
      return;
    }

    if (frameMs < 16.2) {
      fastSamples += 1;
      slowSamples = 0;
      if (fastSamples >= 8 && scale < 1) {
        scale = clamp(scale + 0.04, 0.58, 1);
        fastSamples = 0;
        applyBackingScale(active);
      }
      return;
    }

    slowSamples = Math.max(0, slowSamples - 1);
    fastSamples = 0;
    publish('60fps-balanced');
  }

  const domObserver = new MutationObserver(findCanvas);
  domObserver.observe(document.documentElement, { childList: true, subtree: true });

  const frameObserver = new MutationObserver(sampleFrameBudget);
  frameObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-core-frame-ms'] });

  addEventListener('formatx:real3dready', () => setTimeout(findCanvas, 0));
  addEventListener('pageshow', () => setTimeout(findCanvas, 0));
  findCanvas();
  publish('60fps-target-initial');
}());
