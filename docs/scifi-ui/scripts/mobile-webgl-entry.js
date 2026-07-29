const ENGINE_URL = new URL('./mobile-core-engine-v2.js?v=20260729-living-core-v2', import.meta.url).href;

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
    root.dataset.fxWebgpu = 'webgl-living-core-v2';
    root.dataset.fxMobile3dEngine = 'living-core-v2-loading';
    root.dataset.fxThree = 'loading';
  }
  setTelemetry('THREE / LIVING CORE V2');

  const module = await import(ENGINE_URL);
  if (typeof module.startMobileCore !== 'function') {
    throw new Error('FormatX living organism entry is missing');
  }
  await module.startMobileCore();
}

startLivingCore().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('FormatX living organism stage failed:', error);
  try {
    const root = parent.document.documentElement;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    root.dataset.fxMobile3dEngine = 'error';
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', { detail: { message } }));
  } catch (_) {}
  setTelemetry('THREE / LIVING CORE ERROR');
});
