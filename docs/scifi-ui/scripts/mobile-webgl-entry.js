const ENGINE_URL = new URL('./mobile-core-engine-v3.js?v=20260731-morphing-organism-v3', import.meta.url).href;

function parentRoot() {
  try { return parent.document.documentElement; } catch (_) { return null; }
}

function setTelemetry(text) {
  try {
    const output = parent.document.querySelector('[data-fx-three-telemetry]');
    if (output) output.textContent = text;
  } catch (_) {}
}

function lockMorphingState(engine) {
  if (!engine || engine.fxEntryMorphLock === 'ready-v1') return engine;
  engine.fxEntryMorphLock = 'ready-v1';

  const applyTelemetry = () => {
    const root = parentRoot();
    if (!root) return;
    root.dataset.fxThreeRenderer = 'three-webgl-morphing-organism-v3';
    root.dataset.fxMobile3dEngine = 'morphing-organism-v3-running';
    root.dataset.fxCoreForm = 'synaptic-thought-genome-v1';
    root.dataset.fxCoreMorph = String(engine.fxFormB || 0);
  };

  if (typeof engine.signalReady === 'function') {
    const originalSignalReady = engine.signalReady.bind(engine);
    engine.signalReady = function signalMorphingReady() {
      originalSignalReady();
      applyTelemetry();
    };
  }

  if (engine.renderer && typeof engine.renderer.render === 'function') {
    const originalRender = engine.renderer.render.bind(engine.renderer);
    engine.renderer.render = function renderMorphingState(scene, camera) {
      const now = performance.now() * 0.001;
      const pulse = 0.5 + 0.5 * Math.sin(now * 2.8) * Math.sin(now * 1.33 + 0.72);
      const currentForm = engine.fxMorph < 0.5 ? engine.fxFormA : engine.fxFormB;
      const nucleusShapeY = [1.18, 1.06, 0.94, 1.12, 1.34, 1.48][currentForm] || 1.18;
      if (engine.nucleus) {
        engine.nucleus.scale.y = nucleusShapeY + pulse * 0.052 + (engine.clickPulse || 0) * 0.07;
        engine.nucleus.material.emissiveIntensity = 2.05 + pulse * 1.25
          + (engine.clickPulse || 0) * 2.0 + (engine.fxThoughtPulse || 0) * 2.1;
      }
      if (engine.glow) {
        engine.glow.material.opacity = 0.14 + pulse * 0.13
          + (engine.clickPulse || 0) * 0.12 + (engine.fxThoughtPulse || 0) * 0.10;
      }
      const result = originalRender(scene, camera);
      applyTelemetry();
      return result;
    };
  }

  applyTelemetry();
  return engine;
}

async function startLivingCore() {
  const root = parentRoot();
  if (root) {
    root.dataset.fxWebgpu = 'webgl-morphing-organism-v3';
    root.dataset.fxMobile3dEngine = 'morphing-organism-v3-loading';
    root.dataset.fxThree = 'loading';
  }
  setTelemetry('THREE / MORPHING ORGANISM V3');

  const module = await import(ENGINE_URL);
  if (typeof module.startMobileCore !== 'function') {
    throw new Error('FormatX morphing organism entry is missing');
  }
  const engine = await module.startMobileCore();
  lockMorphingState(engine);
}

startLivingCore().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('FormatX morphing organism stage failed:', error);
  try {
    const root = parent.document.documentElement;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    root.dataset.fxMobile3dEngine = 'error';
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', { detail: { message } }));
  } catch (_) {}
  setTelemetry('THREE / MORPHING ORGANISM ERROR');
});
