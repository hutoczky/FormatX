const ENGINE_URL = new URL('./mobile-core-engine.js?v=20260729-direct-mobile-core-1', import.meta.url).href;

function parentRoot() {
  try { return parent.document.documentElement; } catch (_) { return null; }
}

function setTelemetry(text) {
  try {
    const output = parent.document.querySelector('[data-fx-three-telemetry]');
    if (output) output.textContent = text;
  } catch (_) {}
}

async function startMobileCore() {
  const root = parentRoot();
  if (root) {
    root.dataset.fxWebgpu = 'mobile-webgl';
    root.dataset.fxMobile3dEngine = 'direct-webgl-loading';
    root.dataset.fxThree = 'loading';
  }
  setTelemetry('THREE / DIRECT MOBILE 3D');

  const module = await import(ENGINE_URL);
  if (typeof module.startMobileCore !== 'function') {
    throw new Error('FormatX direct mobile 3D entry is missing');
  }
  await module.startMobileCore();
}

startMobileCore().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('FormatX direct mobile 3D stage failed:', error);
  try {
    const root = parent.document.documentElement;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    root.dataset.fxMobile3dEngine = 'error';
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', { detail: { message } }));
  } catch (_) {}
  setTelemetry('THREE / MOBILE LOAD ERROR');
});
