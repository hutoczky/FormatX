const WEBGPU_URL = new URL('./ExperienceWebGPU.js?v=20260727-webgpu-1', import.meta.url).href;
const WEBGL_SOURCE_URL = new URL('./Experience.js?v=20260727-three-4', import.meta.url).href;
const PRIMARY_THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
const FALLBACK_THREE_URL = 'https://unpkg.com/three@0.185.1/build/three.module.js?module';
let webGpuFatalFallbackStarted = false;

function updateParentWebGpuState(state, message = '') {
  try {
    const root = window.parent.document.documentElement;
    root.dataset.fxWebgpu = state;
    if (message) root.dataset.fxWebgpuError = message.slice(0, 180);
  } catch (_) {}
}

function reportFatal(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('FormatX Three engine bootstrap failed:', error);
  try {
    const parentDocument = window.parent.document;
    const root = parentDocument.documentElement;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    const telemetry = parentDocument.querySelector('[data-fx-three-telemetry]');
    if (telemetry) telemetry.textContent = 'THREE / LOAD ERROR';
    window.parent.dispatchEvent(new CustomEvent('formatx:threeerror', {
      detail: { message }
    }));
  } catch (_) {}
}

async function startWebGLExperience() {
  const response = await fetch(WEBGL_SOURCE_URL, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('FormatX WebGL2 Experience source could not be loaded: ' + response.status + ' ' + WEBGL_SOURCE_URL);
  }

  let source = await response.text();
  const importLine = "import * as THREE from '" + PRIMARY_THREE_URL + "';";
  const resilientImport = [
    'let THREE;',
    'try {',
    "  THREE = await import('" + PRIMARY_THREE_URL + "');",
    '} catch (primaryError) {',
    "  console.warn('Primary Three.js source failed; using fallback.', primaryError);",
    "  THREE = await import('" + FALLBACK_THREE_URL + "');",
    '}',
  ].join('\n');

  if (!source.includes(importLine)) {
    throw new Error('FormatX Experience Three.js import marker is missing');
  }
  source = source.replace(importLine, resilientImport);
  source = source.replace(
    'if (shared instanceof Float32Array && shared.length >= 16) return shared;',
    'if (shared && ArrayBuffer.isView(shared) && shared.BYTES_PER_ELEMENT === 4 && shared.length >= 16) return shared;'
  );
  source = source.replace(
    'p.z = mod(p.z + uScroll * 34.0 + uTime * (0.06 + aSeed.x * 0.16) + 12.0, 24.0) - 12.0;',
    'float streamSpeed = 0.06 + aSeed.x * 0.16 + nervous * (0.5 + aSeed.y * 1.4);\n    p.z = mod(p.z + uScroll * 34.0 + uTime * streamSpeed + 12.0, 24.0) - 12.0;'
  );
  source = source.replace('    p.z -= nervous * uTime * (0.5 + aSeed.y * 1.4);\n', '');

  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

function installWebGpuRuntimeGuard(webGpuModule) {
  const prototype = webGpuModule.FormatXWebGPUExperience?.prototype;
  if (!prototype || prototype.__formatxRuntimeGuard) return;

  const originalSignalReady = prototype.signalReady;
  const originalFrame = prototype.frame;
  prototype.__formatxRuntimeGuard = true;

  prototype.signalReady = function deferSignalReady() {
    this.__formatxReadyPending = true;
  };

  prototype.frame = function guardedWebGpuFrame(now) {
    if (this.__formatxGpuFatal) return;
    try {
      originalFrame.call(this, now);
      let visible = true;
      try {
        const shared = window.parent.__FORMATX_3D_STATE__;
        visible = !shared || Number(shared[14]) >= 0.5;
      } catch (_) {}
      if (!this.__formatxReadySignalled && !this.disposed && visible) {
        this.__formatxReadySignalled = true;
        originalSignalReady.call(this);
        try {
          const root = window.parent.document.documentElement;
          root.style.setProperty('--fx-experience-engine', 'webgpu-tsl');
        } catch (_) {}
      }
    } catch (error) {
      this.__formatxGpuFatal = true;
      const message = error instanceof Error ? error.message : String(error);
      try { this.dispose(); } catch (_) {}
      dispatchEvent(new CustomEvent('formatx:webgpufatal', {
        detail: { message }
      }));
    }
  };
}

addEventListener('formatx:webgpufatal', event => {
  if (webGpuFatalFallbackStarted) return;
  webGpuFatalFallbackStarted = true;
  const message = event.detail && event.detail.message
    ? event.detail.message
    : 'webgpu-runtime-failure';
  updateParentWebGpuState('fallback', message);
  void startWebGLExperience().catch(reportFatal);
});

async function startExperience() {
  if (isSecureContext && 'gpu' in navigator) {
    updateParentWebGpuState('initialising');
    try {
      const webGpuModule = await import(WEBGPU_URL);
      installWebGpuRuntimeGuard(webGpuModule);
      await webGpuModule.startWebGPUExperience();
      updateParentWebGpuState('initialised');
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('FormatX WebGPU/TSL engine failed; switching to the proven WebGL2 engine.', error);
      updateParentWebGpuState('fallback', message);
    }
  } else {
    updateParentWebGpuState('unsupported');
  }

  await startWebGLExperience();
}

startExperience().catch(reportFatal);
