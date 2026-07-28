const WEBGPU_URL = new URL('./ExperienceWebGPU.js?v=20260729-organic-core-3', import.meta.url).href;
const WEBXR_URL = new URL('./WebXRDirector.js?v=20260727-webgpu-1', import.meta.url).href;
const WEBGL_LOADER_URL = new URL('./webgl-fallback-loader.js?v=20260727-particles-stable-3', import.meta.url).href;
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
    throw new Error('FormatX runtime marker missing: ' + label);
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
    'const geometry = new THREE.IcosahedronGeometry(1.72, mobile ? 5 : 6);',
    'const geometry = new THREE.SphereGeometry(1.56, mobile ? 36 : 56, mobile ? 24 : 40);',
    'organic shell geometry'
  );
  source = replaceRequired(
    source,
    'material.side = THREE.DoubleSide;',
    'material.side = THREE.FrontSide;',
    'single smooth membrane surface'
  );
  source = replaceRequired(
    source,
    'material.blending = THREE.AdditiveBlending;',
    'material.blending = THREE.NormalBlending;',
    'non-overexposed membrane blending'
  );
  source = replaceRequired(
    source,
    'const coreShape = p.add(n.mul(wave.mul(0.075).add(this.pulse.mul(0.045))));',
    `const breathing = this.time.mul(1.15).sin().mul(0.035).add(this.pulse.mul(0.055));
      const organicWave = phase.add(this.time.mul(0.72)).sin().mul(0.055)
        .add(p.y.mul(4.5).sub(this.time.mul(0.31)).sin().mul(0.03));
      const coreShape = vec3(
        p.x.mul(float(0.96).add(breathing)),
        p.y.mul(float(1.12).add(breathing.mul(0.65))),
        p.z.mul(float(0.92).add(breathing.mul(0.8)))
      ).add(n.mul(organicWave));`,
    'living breathing core shape'
  );
  source = replaceRequired(
    source,
    `const planBase = p.abs().pow(vec3(0.72)).mul(p.sign());
      const segment = p.y.add(1.4).mul(3.5).floor();
      const segmentGate = step(0.5, segment.mul(0.37).add(seed).fract());
      const planScale = float(1.08).add(segmentGate.mul(0.18));
      const organsShape = vec3(
        planBase.x.mul(planScale),
        planBase.y.add(segment.mul(2.1).add(this.time.mul(0.42)).sin().mul(0.055)),
        planBase.z.mul(planScale)
      );`,
    `const organRipple = p.y.mul(6.2).add(this.time.mul(0.52)).sin();
      const organScale = float(1.02).add(organRipple.mul(0.055)).add(this.pulse.mul(0.035));
      const organsShape = vec3(
        p.x.mul(organScale),
        p.y.mul(1.08).add(organRipple.mul(0.045)),
        p.z.mul(organScale)
      ).add(n.mul(phase.mul(0.9).sub(this.time.mul(0.38)).sin().mul(0.045)));`,
    'smooth organ-state deformation'
  );
  source = replaceRequired(
    source,
    `const facetSteps = mix(float(3), float(7), this.quality);
      const facets = wave.mul(0.5).add(0.5).mul(facetSteps).floor().div(facetSteps);
      const skeletonShape = p.add(n.mul(facets.mul(0.24).sub(0.08)))
        .add(tangent.mul(seed.mul(31).add(this.time).sin().mul(0.075)))
        .mul(vec3(1.08, 1, 1.08));`,
    `const skeletonFlow = phase.mul(1.4).add(this.time.mul(0.65)).sin();
      const skeletonShape = p
        .add(n.mul(skeletonFlow.mul(0.08)))
        .add(tangent.mul(seed.mul(31).add(this.time).sin().mul(0.045)))
        .mul(vec3(1.04, 1.08, 1.04));`,
    'smooth living skeleton state'
  );
  source = replaceRequired(
    source,
    `const transitionArc = this.scene.max(0).fract().mul(PI).sin();
      const fragmentDirection = hash(seed.mul(91)).mul(2).sub(1);
      const breakup = transitionArc.mul(this.explode).mul(float(0.18).add(this.quality.mul(0.34)));
      transformed.addAssign(n.mul(fragmentDirection.mul(breakup).mul(float(0.32).add(seed.mul(0.46)))));
      transformed.addAssign(tangent.mul(transitionArc.mul(fragmentDirection).mul(0.12)));
      transformed.addAssign(bitangent.mul(transitionArc.mul(seed.mul(19).sin()).mul(0.07)));`,
    `const transitionArc = this.scene.max(0).fract().mul(PI).sin();
      const transitionFlow = transitionArc.mul(float(0.035).add(this.quality.mul(0.025)));
      const transitionWave = phase.mul(0.72).add(this.time.mul(0.86)).sin();
      transformed.addAssign(n.mul(transitionWave.mul(transitionFlow)));
      transformed.addAssign(tangent.mul(this.pointer.x.mul(transitionFlow).mul(0.22)));
      transformed.addAssign(bitangent.mul(this.pointer.y.mul(transitionFlow).mul(0.18)));`,
    'fluid state transition without fragmentation'
  );
  source = replaceRequired(
    source,
    `const pointerWarp = smoothstep(1.55, 0, pointerDistance).mul(0.09);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(2).add(phase).sin())));`,
    `const pointerWarp = smoothstep(1.82, 0, pointerDistance).mul(0.17);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(2).add(phase).sin())));
      transformed.addAssign(tangent.mul(this.pointer.x.mul(pointerWarp).mul(0.16)));
      transformed.addAssign(bitangent.mul(this.pointer.y.mul(pointerWarp).mul(0.12)));`,
    'mouse-responsive membrane'
  );
  source = replaceRequired(
    source,
    `return baseColor.mul(float(0.18).add(circuit.mul(0.58)).add(scanline.mul(0.085)))
        .add(color(0xb8ffff).mul(fresnel.mul(float(1.2).add(this.quality.mul(0.65)))))
        .add(baseColor.mul(this.pulse.mul(float(0.08).add(stateWeight(this.scene, 3).mul(0.2)))));`,
    `return baseColor.mul(float(0.28).add(circuit.mul(0.22)).add(scanline.mul(0.04)))
        .add(color(0xb8ffff).mul(fresnel.mul(float(0.42).add(this.quality.mul(0.18)))))
        .add(baseColor.mul(this.pulse.mul(float(0.14).add(stateWeight(this.scene, 3).mul(0.18)))));`,
    'living membrane colour'
  );
  source = replaceRequired(
    source,
    'return float(0.42).add(fresnel.mul(0.48)).clamp(0, 0.94);',
    'return float(0.16).add(fresnel.mul(0.42)).add(this.pulse.mul(0.06)).clamp(0.08, 0.68);',
    'translucent membrane opacity'
  );
  source = replaceRequired(
    source,
    'this.energy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.28, mobile ? 3 : 4), energyMaterial);',
    'this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.18, mobile ? 26 : 40, mobile ? 18 : 28), energyMaterial);',
    'organic inner energy geometry'
  );
  source = replaceRequired(
    source,
    'this.core.group.scale.setScalar(this.scale);',
    `this.core.group.scale.setScalar(this.scale);
      const organismFollow = Math.min(1, delta * 5.5);
      const organismTurn = Math.min(1, delta * 4.2);
      this.core.group.position.x += (this.pointerX * 0.28 - this.core.group.position.x) * organismFollow;
      this.core.group.position.y += (this.pointerY * 0.18 - this.core.group.position.y) * organismFollow;
      this.core.group.rotation.z += (-this.pointerX * 0.12 - this.core.group.rotation.z) * organismTurn;
      this.core.group.rotation.x += (this.pointerY * 0.1 - this.core.group.rotation.x) * organismTurn;`,
    'whole-organism mouse follow'
  );
  source = replaceRequired(
    source,
    'this.maxCount = reduced ? 60000 : mobile ? 260000 : 500000;',
    'this.maxCount = reduced ? 18000 : mobile ? 60000 : 100000;',
    'maximum particle count'
  );
  source = replaceRequired(
    source,
    'this.counts = reduced ? [18000, 30000, 45000, 60000] : mobile ? [45000, 90000, 160000, 260000] : [80000, 170000, 320000, 500000];',
    'this.counts = reduced ? [3000, 6000, 11000, 18000] : mobile ? [9000, 19000, 36000, 60000] : [15000, 32000, 60000, 100000];',
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
  source = replaceRequired(
    source,
    '} else if (fps > 108 && this.tier < 3) {',
    '} else if (false && fps > 108 && this.tier < 3) {',
    'upward quality scaling lock'
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
          parent.document.documentElement.dataset.fxParticleProfile = 'focus-half-stable';
          parent.document.documentElement.dataset.fxParticleTierLock = 'upward-disabled';
          parent.document.documentElement.dataset.fxCoreForm = 'organic-fluid-interactive';
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