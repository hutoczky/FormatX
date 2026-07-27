const WEBGPU_URL = new URL('./ExperienceWebGPU.js?v=20260727-particles-pro-1', import.meta.url).href;
const WEBXR_URL = new URL('./WebXRDirector.js?v=20260727-webgpu-1', import.meta.url).href;
const WEBGL_LOADER_URL = new URL('./webgl-fallback-loader.js?v=20260727-particles-pro-1', import.meta.url).href;
const WEBGPU_STARTUP_BUDGET = 8000;
const WEBGPU_STABLE_FRAMES = 90;
const FORCE_WEBGL = new URLSearchParams(location.search).get('force-webgl') === '1';
// A real navigator.gpu value is required; merely using "'gpu' in navigator" is insufficient.

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

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error('FormatX particle profile marker missing: ' + label);
  }
  return source.replace(search, replacement);
}

async function loadWebGpuModule() {
  const response = await fetch(WEBGPU_URL, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('FormatX WebGPU Experience source could not be loaded: ' + response.status + ' ' + WEBGPU_URL);
  }

  let source = await response.text();
  source = replaceRequired(
    source,
    "from './WebXRDirector.js?v=20260727-webgpu-1';",
    "from '" + WEBXR_URL + "';",
    'WebXR import'
  );
  source = replaceRequired(
    source,
    'this.maxCount = reduced ? 60000 : mobile ? 260000 : 500000;',
    'this.maxCount = reduced ? 36000 : mobile ? 120000 : 200000;',
    'maximum particle count'
  );
  source = replaceRequired(
    source,
    'this.counts = reduced ? [18000, 30000, 45000, 60000] : mobile ? [45000, 90000, 160000, 260000] : [80000, 170000, 320000, 500000];',
    'this.counts = reduced ? [6000, 12000, 22000, 36000] : mobile ? [18000, 38000, 72000, 120000] : [30000, 65000, 120000, 200000];',
    'particle quality tiers'
  );
  source = replaceRequired(
    source,
    'this.pointScale = uniform(mobile ? 0.034 : 0.028);',
    'this.pointScale = uniform(mobile ? 0.026 : 0.021);',
    'base particle size'
  );
  source = replaceRequired(
    source,
    'const pointerInfluence = smoothstep(4.2, 0, pointerDistance).mul(float(1).add(this.pointerVelocity.length().mul(1.8)));',
    'const pointerInfluence = smoothstep(3.2, 0, pointerDistance).mul(float(1).add(this.pointerVelocity.length().mul(1.1)));',
    'pointer influence radius'
  );
  source = replaceRequired(
    source,
    'velocity.addAssign(toParticle.div(pointerDistance).mul(pointerInfluence.mul(7.5).mul(dt)));',
    'velocity.addAssign(toParticle.div(pointerDistance).mul(pointerInfluence.mul(4.2).mul(dt)));',
    'pointer influence strength'
  );
  source = replaceRequired(
    source,
    'material.scaleNode = this.pointScale.mul(float(0.55).add(seedNode.w.mul(1.35)));',
    'material.scaleNode = this.pointScale.mul(float(0.48).add(seedNode.w.mul(0.92)));',
    'particle size variance'
  );
  source = replaceRequired(
    source,
    'material.opacityNode = shapeCircle().mul(float(0.14).add(seedNode.z.mul(0.5)));',
    'material.opacityNode = shapeCircle().mul(float(0.07).add(seedNode.z.mul(0.26)));',
    'particle opacity'
  );
  source = replaceRequired(
    source,
    'this.fieldStrength.value = [0.65, 0.82, 1, 1.18][this.tier];',
    'this.fieldStrength.value = [0.42, 0.56, 0.7, 0.84][this.tier];',
    'particle field strength'
  );
  source = replaceRequired(
    source,
    'this.pointScale.value = [0.022, 0.027, 0.032, 0.036][this.tier];',
    'this.pointScale.value = [0.015, 0.018, 0.021, 0.024][this.tier];',
    'particle tier size'
  );

  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    return await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
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

function reloadIntoWebGlFallback(message) {
  updateParentState('fallback', message);
  const recoveryUrl = new URL(location.href);
  if (recoveryUrl.searchParams.get('force-webgl') === '1') {
    void startWebGLExperience().catch(reportFatal);
    return;
  }
  recoveryUrl.searchParams.set('force-webgl', '1');
  recoveryUrl.searchParams.set('recovery', 'webgpu');
  location.replace(recoveryUrl.href);
}

function requestWebGLFallback(reason) {
  if (webGpuFallbackStarted) return;
  webGpuFallbackStarted = true;
  webGpuAttemptActive = false;
  clearStartupTimer();
  stopActiveWebGpu();
  const message = reason?.message ? String(reason.message) : String(reason || 'webgpu-runtime-failure');
  reloadIntoWebGlFallback(message);
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
          parent.document.documentElement.dataset.fxParticleProfile = 'professional';
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
  if (FORCE_WEBGL) {
    let previousError = 'webgpu-recovery';
    try {
      previousError = parent.document.documentElement.dataset.fxWebgpuError || previousError;
    } catch (_) {}
    updateParentState('fallback', previousError);
    await startWebGLExperience();
    return;
  }

  if (!isSecureContext || !navigator.gpu) {
    updateParentState('unsupported');
    await startWebGLExperience();
    return;
  }

  updateParentState('initialising');
  webGpuAttemptActive = true;

  try {
    const webGpuModule = await loadWebGpuModule();
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
    requestWebGLFallback(error);
  }
}

startExperience().catch(reportFatal);
