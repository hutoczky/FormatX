const WEBGPU_URL = new URL('./ExperienceWebGPU.js?v=20260727-webgpu-1', import.meta.url).href;
const WEBGL_LOADER_URL = new URL('./webgl-fallback-loader.js?v=20260727-webgpu-1', import.meta.url).href;
const WEBGPU_STARTUP_BUDGET = 8000;
const WEBGPU_STABLE_FRAMES = 90;

let webGpuAttemptActive = false;
let webGpuFallbackStarted = false;
let activeWebGpuExperience = null;
let startupTimer = 0;

function clearStartupTimer() {
  if (!startupTimer) return;
  clearTimeout(startupTimer);
  startupTimer = 0;
}

function updateParentState(state, message = '') {
  try {
    const root = parent.document.documentElement;
    root.dataset.fxWebgpu = state;
    if (message) root.dataset.fxWebgpuError = message.slice(0, 180);
  } catch (_) {}
}

function reportFatal(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('FormatX Three engine bootstrap failed:', error);
  try {
    const root = parent.document.documentElement;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    const telemetry = parent.document.querySelector('[data-fx-three-telemetry]');
    if (telemetry) telemetry.textContent = 'THREE / LOAD ERROR';
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', { detail: { message } }));
  } catch (_) {}
}

async function startWebGLExperience() {
  const module = await import(WEBGL_LOADER_URL);
  return module.startWebGLExperience();
}

function isGpuFailure(reason) {
  const name = reason?.name ? String(reason.name) : '';
  const message = reason?.message ? String(reason.message) : String(reason || '');
  return /GPU|WebGPU|WGSL|shader|pipeline|device|adapter|popErrorScope|Instance dropped|createView|swizzle/i.test(`${name} ${message}`);
}

function stopActiveWebGpu() {
  const failed = activeWebGpuExperience;
  activeWebGpuExperience = null;
  if (!failed) return;
  failed.__formatxGpuFatal = true;
  try { failed.dispose(); } catch (_) {}
}

function requestWebGLFallback(reason) {
  if (webGpuFallbackStarted) return;
  webGpuFallbackStarted = true;
  webGpuAttemptActive = false;
  clearStartupTimer();
  stopActiveWebGpu();
  const message = reason?.message ? String(reason.message) : String(reason || 'webgpu-runtime-failure');
  updateParentState('fallback', message);
  void startWebGLExperience().catch(reportFatal);
}

function installRuntimeGuard(webGpuModule) {
  const prototype = webGpuModule.FormatXWebGPUExperience?.prototype;
  if (!prototype || prototype.__formatxRuntimeGuard) return;

  const originalReady = prototype.signalReady;
  const originalFrame = prototype.frame;
  prototype.__formatxRuntimeGuard = true;

  prototype.signalReady = function deferReady() {
    this.__formatxReadyPending = true;
  };

  prototype.frame = function guardedFrame(now) {
    if (this.__formatxGpuFatal || this.disposed) return;
    try {
      originalFrame.call(this, now);
      let visible = true;
      try {
        const shared = parent.__FORMATX_3D_STATE__;
        visible = !shared || Number(shared[14]) >= 0.5;
      } catch (_) {}

      if (visible && !this.disposed) {
        this.__formatxStableFrames = (this.__formatxStableFrames || 0) + 1;
      }

      if (!this.__formatxReadySignalled && this.__formatxStableFrames >= WEBGPU_STABLE_FRAMES) {
        this.__formatxReadySignalled = true;
        webGpuAttemptActive = false;
        clearStartupTimer();
        originalReady.call(this);
        try {
          parent.document.documentElement.style.setProperty('--fx-experience-engine', 'webgpu-tsl');
        } catch (_) {}
      }
    } catch (error) {
      this.__formatxGpuFatal = true;
      requestWebGLFallback(error);
    }
  };
}

addEventListener('unhandledrejection', event => {
  if (!webGpuAttemptActive || !isGpuFailure(event.reason)) return;
  event.preventDefault();
  requestWebGLFallback(event.reason);
}, true);

addEventListener('error', event => {
  const reason = event.error || event.message;
  if (!webGpuAttemptActive || !isGpuFailure(reason)) return;
  event.preventDefault();
  requestWebGLFallback(reason);
}, true);

addEventListener('formatx:webgpufatal', event => {
  requestWebGLFallback(new Error(event.detail?.message || 'webgpu-runtime-failure'));
});

async function startExperience() {
  if (!isSecureContext || !navigator.gpu) {
    updateParentState('unsupported');
    await startWebGLExperience();
    return;
  }

  updateParentState('initialising');
  webGpuAttemptActive = true;

  try {
    const webGpuModule = await import(WEBGPU_URL);
    installRuntimeGuard(webGpuModule);
    activeWebGpuExperience = await webGpuModule.startWebGPUExperience();

    if (webGpuFallbackStarted) {
      stopActiveWebGpu();
      return;
    }

    startupTimer = setTimeout(() => {
      requestWebGLFallback(new Error('webgpu-startup-timeout'));
    }, WEBGPU_STARTUP_BUDGET);
    updateParentState('initialised');
  } catch (error) {
    webGpuAttemptActive = false;
    clearStartupTimer();
    stopActiveWebGpu();
    updateParentState('fallback', error instanceof Error ? error.message : String(error));
    await startWebGLExperience();
  }
}

startExperience().catch(reportFatal);
