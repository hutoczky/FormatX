(function () {
  'use strict';

  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const AUDIT_MODE = params.get('lighthouse') === '1';
  const WEBGPU_PREVIEW = params.get('webgpu') === '1';

  if (AUDIT_MODE) {
    root.dataset.fxReferenceCore = 'audit-skip-v29';
    root.dataset.fxWebgpuCore = 'audit-skip';
    root.dataset.fxOrbitalCore = 'audit-skip';
    return;
  }

  // Production authority stays with the reference-calibrated v24 indexed WebGL2
  // renderer already bootstrapped by index.html. The v29 WebGPU scene is real 3D,
  // but it currently uses a sphere + ribbon geometry and therefore does not yet
  // match the four-tip crystalline production reference closely enough.
  if (!WEBGPU_PREVIEW) {
    root.dataset.fxReferenceCore = 'production-v24-authority';
    root.dataset.fxReal3dBootstrap = 'production-v24';
    root.dataset.fxGpuPreference = 'webgl2-v24-reference-production';
    return;
  }

  if (root.dataset.fxReal3dBootstrap === 'ready-v29') return;
  root.dataset.fxReal3dBootstrap = 'loading-v29';
  root.dataset.fxReferenceCore = 'preview-v29';
  root.dataset.fxCoreGeometry = 'webgpu-real3d-preview-with-webgl2-v28-fallback';

  if (!document.querySelector('link[data-fx-orbital-core-v28]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/scifi-ui/styles/formatx-orbital-core-v28.css?v=20260809-webgpu-v29-frame-1';
    style.dataset.fxOrbitalCoreV28 = 'true';
    style.addEventListener('load', () => { root.dataset.fxOrbitalStyle = 'ready-v29-frame'; }, { once: true });
    style.addEventListener('error', () => { root.dataset.fxOrbitalStyle = 'failed-v29-frame'; }, { once: true });
    document.head.appendChild(style);
  }

  if (!document.querySelector('link[data-fx-real3d-mobile-v29]')) {
    const composition = document.createElement('link');
    composition.rel = 'stylesheet';
    composition.href = '/scifi-ui/styles/formatx-real3d-mobile-v29.css?v=20260809-webgpu-mobile-v29-2';
    composition.dataset.fxReal3dMobileV29 = 'true';
    composition.addEventListener('load', () => { root.dataset.fxReal3dComposition = 'ready-v29'; }, { once: true });
    composition.addEventListener('error', () => { root.dataset.fxReal3dComposition = 'failed-v29'; }, { once: true });
    document.head.appendChild(composition);
  }

  const script = document.createElement('script');
  if (navigator.gpu) {
    script.src = '/scifi-ui/scripts/formatx-webgpu-core-v29.js?v=20260809-webgpu-real3d-v29-1';
    script.dataset.fxWebgpuCoreV29 = 'true';
    root.dataset.fxGpuPreference = 'webgpu-v29-preview';
  } else {
    script.src = '/scifi-ui/scripts/formatx-orbital-core-v28.js?v=20260809-reference-orb-v28-3';
    script.dataset.fxOrbitalCoreV28 = 'true';
    root.dataset.fxGpuPreference = 'webgl2-v28-preview-fallback';
  }
  script.defer = true;
  script.addEventListener('load', () => { root.dataset.fxReal3dBootstrap = 'ready-v29'; }, { once: true });
  script.addEventListener('error', () => {
    root.dataset.fxReal3dBootstrap = 'failed-v29';
    console.warn('FormatX WebGPU preview core failed to load. Production v24 renderer remains available.');
  }, { once: true });
  document.head.appendChild(script);
}());
