const LOADER_URL = new URL('./webgl-fallback-loader.js?v=20260729-true-depth-fallback-3', import.meta.url).href;

function parentRoot() {
  try {
    return parent.document.documentElement;
  } catch (_) {
    return null;
  }
}

function setTelemetry(text) {
  try {
    const output = parent.document.querySelector('[data-fx-three-telemetry]');
    if (output) output.textContent = text;
  } catch (_) {}
}

async function startMobileWebGL() {
  const root = parentRoot();
  if (root) {
    root.dataset.fxWebgpu = 'mobile-webgl';
    root.dataset.fxMobile3dEngine = 'webgl-true-depth';
    root.dataset.fxThree = 'loading';
  }
  setTelemetry('THREE / MOBILE WEBGL');

  const module = await import(LOADER_URL);
  if (typeof module.startWebGLExperience !== 'function') {
    throw new Error('FormatX mobile WebGL loader entry is missing');
  }
  await module.startWebGLExperience();

  if (root) root.dataset.fxMobile3dEngine = 'webgl-true-depth-running';
}

startMobileWebGL().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('FormatX mobile WebGL stage failed:', error);
  try {
    const root = parent.document.documentElement;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    root.dataset.fxMobile3dEngine = 'error';
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', {
      detail: { message }
    }));
  } catch (_) {}
  setTelemetry('THREE / MOBILE LOAD ERROR');
});
