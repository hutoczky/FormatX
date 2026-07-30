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
  await module.startMobileCore();
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
