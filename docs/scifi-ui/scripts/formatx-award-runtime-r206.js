(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAwardRuntime === 'r296') return;
  root.dataset.fxAwardRuntime = 'r296';

  const auditMode = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (auditMode) {
    root.dataset.fxAwardRuntimeMode = 'audit-passive';
    return;
  }

  const STYLE_URL = '/scifi-ui/styles/formatx-wda-hardening-r198.css?v=20260821-r263-canonical-controls';
  const OWNER_STYLE_URL = '/scifi-ui/styles/formatx-control-owner-r264.css?v=20260822-r296-canonical-header';
  const GUARD_URL = '/scifi-ui/scripts/formatx-geometry-guard-r286.js?v=20260822-r286-first-paint-geometry';
  const CONTROLS_URL = '/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260821-r263-canonical-controls';
  const CONTROL_OWNER_URL = '/scifi-ui/scripts/formatx-control-owner-r268.js?v=20260822-r291-canonical-menu';
  const NAV_OWNER_URL = '/scifi-ui/scripts/formatx-nav-state-owner-r265.js?v=20260822-r291-nav-state';
  const DIALOGUE_STYLE_URL = '/scifi-ui/styles/formatx-dialogue-open-r287.css?v=20260822-r287-open-state';
  const DIALOGUE_OWNER_URL = '/scifi-ui/scripts/formatx-dialogue-render-owner-r273.js?v=20260822-r287-open-state';
  const GPU_URL = '/scifi-ui/scripts/formatx-wda-gpu-r198.js?v=20260818-r206-post-painted-frame';
  let gpuRequested = false;

  function openReferenceDialogue() {
    const trigger = document.querySelector('.fx-organism-thought-trigger');

    if (root.dataset.fxOrganismDialogueEnabled === 'false' && trigger instanceof HTMLButtonElement) {
      trigger.click();
      window.FormatXCoreMobileV69?.pulse?.();
      root.dataset.fxReferenceAskActionR293 = 'reenabled-through-organism-owner';
      return true;
    }

    if (typeof window.FormatXOrganismVoice?.open === 'function') {
      window.FormatXOrganismVoice.open();
      window.FormatXCoreMobileV69?.pulse?.();
      root.dataset.fxReferenceAskActionR293 = 'opened-through-public-api';
      return true;
    }

    if (trigger instanceof HTMLButtonElement) {
      trigger.click();
      window.FormatXCoreMobileV69?.pulse?.();
      root.dataset.fxReferenceAskActionR293 = 'opened-through-organism-owner';
      return true;
    }
    return false;
  }

  function ensureReferenceAskOwner() {
    if (root.dataset.fxReferenceAskOwnerR284 === 'ready') return;
    root.dataset.fxReferenceAskOwnerR284 = 'ready';

    document.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target.closest('.fx-reference-ask') : null;
      if (!(target instanceof HTMLButtonElement)) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (openReferenceDialogue()) return;

      if (root.dataset.fxImmersive !== 'active') {
        root.dataset.fxImmersive = 'active';
        root.dataset.fxImmersiveSource = 'reference-ask-r284';
        dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
          detail: { source: 'reference-ask-r284' }
        }));
      }

      queueMicrotask(openReferenceDialogue);
      setTimeout(openReferenceDialogue, 140);
    }, true);
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-award-runtime-style-r206]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    link.dataset.fxAwardRuntimeStyleR206 = 'true';
    document.head.appendChild(link);
  }

  function ensureOwnerStyle() {
    if (document.querySelector('link[data-fx-control-owner-style-r264]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = OWNER_STYLE_URL;
    link.dataset.fxControlOwnerStyleR264 = 'true';
    document.head.appendChild(link);
  }

  function ensureDialogueSurface() {
    if (!document.querySelector('link[data-fx-dialogue-open-r287]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = DIALOGUE_STYLE_URL;
      link.dataset.fxDialogueOpenR287 = 'true';
      document.head.appendChild(link);
    }

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureDialogueSurface, { once: true });
      return;
    }
    if (document.querySelector('script[data-fx-dialogue-render-owner-r287]')) return;
    const script = document.createElement('script');
    script.src = DIALOGUE_OWNER_URL;
    script.async = true;
    script.dataset.fxDialogueRenderOwnerR287 = 'true';
    document.head.appendChild(script);
  }

  function ensureGeometryGuard() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureGeometryGuard, { once: true });
      return;
    }
    if (document.querySelector('script[data-fx-geometry-guard-r286]')) return;
    const script = document.createElement('script');
    script.src = GUARD_URL;
    script.async = true;
    script.dataset.fxGeometryGuardR286 = 'true';
    document.head.appendChild(script);
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

  function ensureControlOwner() {
    ensureOwnerStyle();
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureControlOwner, { once: true });
      return;
    }
    if (document.querySelector('script[data-fx-control-owner-r268]')) {
      ensureNavOwner();
      return;
    }
    const script = document.createElement('script');
    script.src = CONTROL_OWNER_URL;
    script.async = true;
    script.dataset.fxControlOwnerR268 = 'true';
    script.addEventListener('load', ensureNavOwner, { once: true });
    script.addEventListener('error', ensureNavOwner, { once: true });
    document.head.appendChild(script);
  }

  function ensureControls() {
    ensureOwnerStyle();
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', ensureControls, { once: true });
      return;
    }
    if (document.querySelector('script[data-fx-award-runtime-controls-r206]')) {
      ensureControlOwner();
      return;
    }
    const script = document.createElement('script');
    script.src = CONTROLS_URL;
    script.async = true;
    script.dataset.fxAwardRuntimeControlsR206 = 'true';
    script.addEventListener('load', ensureControlOwner, { once: true });
    script.addEventListener('error', ensureControlOwner, { once: true });
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

  ensureReferenceAskOwner();
  ensureStyle();
  ensureOwnerStyle();
  ensureDialogueSurface();
  ensureGeometryGuard();
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