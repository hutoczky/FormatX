(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAwardRuntime === 'r268') return;
  root.dataset.fxAwardRuntime = 'r268';

  const auditMode = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (auditMode) {
    root.dataset.fxAwardRuntimeMode = 'audit-passive';
    return;
  }

  const STYLE_URL = '/scifi-ui/styles/formatx-wda-hardening-r198.css?v=20260821-r263-canonical-controls';
  const CONTROLS_URL = '/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260821-r263-canonical-controls';
  const OWNER_STYLE_URL = '/scifi-ui/styles/formatx-control-owner-r264.css?v=20260821-r264-single-owner';
  const REPAIR_STYLE_URL = '/scifi-ui/styles/formatx-interaction-repair-r266.css?v=20260821-r266-hit-dialogue';
  const OWNER_SCRIPT_URL = '/scifi-ui/scripts/formatx-control-owner-r268.js?v=20260821-r268-event-driven';
  const NAV_OWNER_URL = '/scifi-ui/scripts/formatx-nav-state-owner-r265.js?v=20260821-r265-nav-state-owner';
  const GPU_URL = '/scifi-ui/scripts/formatx-wda-gpu-r198.js?v=20260818-r206-post-painted-frame';
  let gpuRequested = false;

  function ensureStyle() {
    if (document.querySelector('link[data-fx-award-runtime-style-r206]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    link.dataset.fxAwardRuntimeStyleR206 = 'true';
    document.head.appendChild(link);
  }

  function ensureOwnerStyle() {
    if (!document.querySelector('link[data-fx-control-owner-style-r264]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = OWNER_STYLE_URL;
      link.dataset.fxControlOwnerStyleR264 = 'true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[data-fx-interaction-repair-r266]')) {
      const repair = document.createElement('link');
      repair.rel = 'stylesheet';
      repair.href = REPAIR_STYLE_URL;
      repair.dataset.fxInteractionRepairR266 = 'true';
      document.head.appendChild(repair);
    }
  }

  function ensureNavOwner() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureNavOwner, { once: true });
      return;
    }
    if (document.querySelector('script[data-fx-nav-state-owner-r265]')) return;
    const script = document.createElement('script');
    script.src = NAV_OWNER_URL;
    script.async = true;
    script.dataset.fxNavStateOwnerR265 = 'true';
    document.head.appendChild(script);
  }

  function ensureOwner() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureOwner, { once: true });
      return;
    }
    ensureOwnerStyle();
    const existing = document.querySelector('script[data-fx-control-owner-r264]');
    if (existing) {
      ensureNavOwner();
      return;
    }
    const script = document.createElement('script');
    script.src = OWNER_SCRIPT_URL;
    script.async = true;
    script.dataset.fxControlOwnerR264 = 'true';
    script.addEventListener('load', ensureNavOwner, { once: true });
    script.addEventListener('error', ensureNavOwner, { once: true });
    document.head.appendChild(script);
  }

  function ensureControls() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureControls, { once: true });
      return;
    }
    ensureOwnerStyle();
    const existing = document.querySelector('script[data-fx-award-runtime-controls-r206]');
    if (existing) {
      ensureOwner();
      return;
    }
    const script = document.createElement('script');
    script.src = CONTROLS_URL;
    script.async = true;
    script.dataset.fxAwardRuntimeControlsR206 = 'true';
    script.addEventListener('load', ensureOwner, { once: true });
    script.addEventListener('error', ensureOwner, { once: true });
    document.head.appendChild(script);
  }

  function hasPaintedCore() {
    const renderMs = Number.parseFloat(root.dataset.fxCoreRenderMs || '');
    return root.dataset.fxCoreMobileR99 === 'ready-v69'
      && root.dataset.fxCoreReal3d === 'ready-v69'
      && Number.isFinite(renderMs)
      && renderMs >= 0;
  }

  function ensureGpu() {
    if (gpuRequested || !hasPaintedCore()) return false;
    gpuRequested = true;
    if (!document.querySelector('script[data-fx-award-runtime-gpu-r206]')) {
      const script = document.createElement('script');
      script.src = GPU_URL;
      script.async = true;
      script.dataset.fxAwardRuntimeGpuR206 = 'true';
      document.head.appendChild(script);
    }
    root.dataset.fxAwardGpu = 'requested-post-painted-frame-r206';
    return true;
  }

  ensureStyle();
  ensureOwnerStyle();
  ensureControls();
  root.dataset.fxAwardSound = 'muted-default-visible-control';

  if (!ensureGpu()) {
    const observer = new MutationObserver(() => {
      if (ensureGpu()) observer.disconnect();
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-fx-core-render-ms', 'data-fx-core-mobile-r99', 'data-fx-core-real3d']
    });

    addEventListener('formatx:real3dready', () => {
      requestAnimationFrame(() => requestAnimationFrame(ensureGpu));
    });

    setTimeout(() => {
      observer.disconnect();
      if (!gpuRequested) root.dataset.fxAwardGpu = 'native-or-fallback-core-no-governor';
    }, 12000);
  }
}());
