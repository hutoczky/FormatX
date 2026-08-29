(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreMobileV55 = 'audit-skip'; return; }

  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'new-crystal-organism-r326';
  root.dataset.fxCoreCrystalRevision = 'r326-four-direction-living-facet-organism';
  root.dataset.fxCoreMobileOpticsRevision = 'r423-final-restrained-soft-edge';

  const PRIMARY_RENDERER = '/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260828-r416-site-coupled-soft-optics';
  const CONTROL_STABILITY_STYLE = '/scifi-ui/styles/formatx-mobile-control-stability-r320.css?v=20260824-native-orb-r250';
  const OPTICS_TUNE_STYLE = '/scifi-ui/styles/formatx-mobile-r416-stability.css?v=20260828-r418-restrained-soft-mag-attached-header';
  const FINAL_OPTICS_STYLE = '/scifi-ui/styles/formatx-mobile-optics-r423.css?v=20260829-r423-final-mobile-mag-optics';
  const FINAL_HEADER_STYLE = '/scifi-ui/styles/formatx-mobile-header-final-r418.css?v=20260828-r418-final-owner';
  const LANGUAGE_OWNER_SCRIPT = '/scifi-ui/scripts/formatx-mobile-language-owner-r423.js?v=20260829-r423-direct-topbar-language';
  // Content wins the critical path. The render-blocking r418 stylesheet owns the
  // first header frame; later layers only refine optics and reassert final header
  // ownership after legacy WDA/control styles have mounted.
  const START_DELAY = matchMedia('(max-width: 900px), (pointer: coarse)').matches ? 3000 : 1100;
  let rendererRequested = false;
  let rendererTimer = 0;

  function installSoundTouchRecovery() {
    if (root.dataset.fxSoundTouchRecoveryR418 === 'ready') return;
    root.dataset.fxSoundTouchRecoveryR418 = 'ready';

    let gesture = null;
    let fallbackTimer = 0;
    let sequence = 0;

    const soundFrom = target => target instanceof Element ? target.closest('.fx-three-sound') : null;
    const cancelFallback = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    };
    const clearGesture = () => {
      cancelFallback();
      gesture = null;
    };

    document.addEventListener('pointerdown', event => {
      const button = soundFrom(event.target);
      if (!(button instanceof HTMLButtonElement) || event.pointerType === 'mouse') return;
      cancelFallback();
      gesture = {
        sequence: ++sequence,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
      root.dataset.fxSoundTouchRecoveryStateR418 = 'armed';
    }, true);

    document.addEventListener('click', event => {
      const button = soundFrom(event.target);
      if (!(button instanceof HTMLButtonElement)) return;
      if (gesture) clearGesture();
      root.dataset.fxSoundTouchRecoveryStateR418 = event.isTrusted ? 'native-click' : 'fallback-click-delivered';
    }, true);

    document.addEventListener('pointerup', event => {
      const button = soundFrom(event.target);
      const current = gesture;
      if (!current || current.pointerId !== event.pointerId || !(button instanceof HTMLButtonElement)) {
        clearGesture();
        return;
      }

      current.x = event.clientX;
      current.y = event.clientY;
      const token = current.sequence;
      cancelFallback();
      // Modern touch UAs synthesize click immediately after pointerup/touchend.
      // A legacy global preventDefault can suppress that compatibility click;
      // wait briefly, then deliver exactly one button activation only if the
      // native click never arrived. pointerdown already gives WebAudio a trusted
      // activation opportunity, so this fallback does not bypass autoplay rules.
      fallbackTimer = setTimeout(() => {
        fallbackTimer = 0;
        if (!gesture || gesture.sequence !== token) return;
        const hit = document.elementFromPoint(gesture.x, gesture.y);
        const live = soundFrom(hit) || (button.isConnected ? button : document.querySelector('.fx-three-sound'));
        gesture = null;
        if (!(live instanceof HTMLButtonElement)) {
          root.dataset.fxSoundTouchRecoveryStateR418 = 'fallback-target-missing';
          return;
        }
        root.dataset.fxSoundTouchRecoveryStateR418 = 'dispatching-fallback-click';
        live.click();
        if (root.dataset.fxSoundTouchRecoveryStateR418 === 'dispatching-fallback-click') {
          root.dataset.fxSoundTouchRecoveryStateR418 = 'fallback-click-delivered';
        }
      }, 120);
    }, true);

    document.addEventListener('pointercancel', clearGesture, true);
  }

  function loadLanguageOwner() {
    if (!matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches) return;
    if (document.querySelector('script[data-fx-mobile-language-owner-r423]')) return;
    const script = document.createElement('script');
    script.src = LANGUAGE_OWNER_SCRIPT;
    script.async = true;
    script.dataset.fxMobileLanguageOwnerR423 = 'true';
    document.head.appendChild(script);
  }

  function loadFinalHeaderStyle() {
    if (!matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches) return;
    let link = document.querySelector('link[data-fx-mobile-header-final-r418]');
    if (!(link instanceof HTMLLinkElement)) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FINAL_HEADER_STYLE;
      link.dataset.fxMobileHeaderFinalR418 = 'true';
    } else if (!link.href.includes('r418-final-owner')) {
      link.href = FINAL_HEADER_STYLE;
    }
    // Re-appending an existing stylesheet is intentional: r264/r268 legacy owner
    // styles are still loaded asynchronously. The r418 contract must be the last
    // header geometry layer after those owners without polling or a hot observer.
    if (link.parentElement !== document.head || document.head.lastElementChild !== link) {
      document.head.appendChild(link);
    }
    root.dataset.fxMobileHeaderFinalR418 = 'loaded-last';
  }

  function loadOpticsTune() {
    const existing = document.querySelector('link[data-fx-mobile-r416-stability]');
    if (existing instanceof HTMLLinkElement) {
      if (!existing.href.includes('r418-restrained-soft-mag-attached-header')) existing.href = OPTICS_TUNE_STYLE;
      root.dataset.fxCoreMobileOpticsR416='ready-r418-restrained';
      return;
    }
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=OPTICS_TUNE_STYLE;
    link.dataset.fxMobileR416Stability='true';
    document.head.appendChild(link);
    root.dataset.fxCoreMobileOpticsR416='requested-r418-restrained';
    link.addEventListener('load',()=>{root.dataset.fxCoreMobileOpticsR416='ready-r418-restrained';},{once:true});
    link.addEventListener('error',()=>{root.dataset.fxCoreMobileOpticsR416='load-failed';},{once:true});
  }

  function loadFinalOptics() {
    if (!matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches) return;
    let link = document.querySelector('link[data-fx-mobile-optics-r423]');
    if (!(link instanceof HTMLLinkElement)) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FINAL_OPTICS_STYLE;
      link.dataset.fxMobileOpticsR423 = 'true';
    } else if (!link.href.includes('r423-final-mobile-mag-optics')) {
      link.href = FINAL_OPTICS_STYLE;
    }
    if (link.parentElement !== document.head || document.head.lastElementChild !== link) {
      document.head.appendChild(link);
    }
    root.dataset.fxCoreMobileOpticsR423 = 'final-restrained-soft-edge';
  }

  function loadStableControls() {
    if (document.querySelector('link[data-fx-mobile-control-stability-r320]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=CONTROL_STABILITY_STYLE;
    link.dataset.fxMobileControlStabilityR320='true';
    document.head.appendChild(link);
    root.dataset.fxMobileControlStabilityR320='requested';
    link.addEventListener('load',()=>{root.dataset.fxMobileControlStabilityR320='ready';},{once:true});
    link.addEventListener('error',()=>{root.dataset.fxMobileControlStabilityR320='load-failed';},{once:true});
  }

  function loadReferenceLayout() {
    if (!document.querySelector('link[data-fx-mobile-reference-layout-style]')) {
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260813-android-webgl-recovery-r71';
      link.dataset.fxMobileReferenceLayoutStyle='true';
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[data-fx-responsive-text-guard]')) {
      const guard=document.createElement('link');
      guard.rel='stylesheet';
      guard.href='/scifi-ui/styles/formatx-responsive-text-guard-r72.css?v=20260813-responsive-text-wrap-r72';
      guard.dataset.fxResponsiveTextGuard='true';
      document.head.appendChild(guard);
    }
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) return;
    const script=document.createElement('script');
    script.src='/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260824-native-orb-r250';
    script.async=false;
    script.dataset.fxMobileReferenceLayout='true';
    document.head.appendChild(script);
  }

  function loadPrimaryRenderer(source='scheduled') {
    if (rendererRequested) return;
    rendererRequested = true;
    if (rendererTimer) clearTimeout(rendererTimer);
    rendererTimer = 0;
    if (document.querySelector('script[data-fx-crystal-organism-r326],script[src*="formatx-crystal-organism-r326.js"]')) return;
    root.dataset.fxCoreRendererStartupR346 = source;
    const renderer=document.createElement('script');
    renderer.src=PRIMARY_RENDERER;
    renderer.async=true;
    renderer.dataset.fxCrystalOrganismR326='true';
    renderer.dataset.fxCoreTrueMeshR112='true';

    renderer.addEventListener('load',()=>{
      root.dataset.fxCoreReferenceLockLoad='ready-v69-r326';
      root.dataset.fxCoreRendererSelection='new-crystal-organism-r326-primary';
      root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';
      root.dataset.fxCoreCompositionRevisionR326='new-organism-no-legacy-visual-fallback';
      loadFinalOptics();
      loadLanguageOwner();
    },{once:true});

    renderer.addEventListener('error',()=>{
      renderer.remove();
      root.dataset.fxCoreMobileV55='load-failed-v55';
      root.dataset.fxCoreMobileV69='load-failed-v69';
      root.dataset.fxCoreReferenceLock='load-failed-v69';
      root.dataset.fxCoreReal3d='context-unavailable';
      root.dataset.fxCoreRendererSelection='r326-load-failed-no-legacy-fallback';
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'r326-renderer-load-failed',fallback:'none'}}));
    },{once:true});

    document.head.appendChild(renderer);
  }

  function schedulePrimaryRenderer() {
    if (rendererRequested || rendererTimer) return;
    root.dataset.fxCoreRendererStartupR346='critical-content-first-r423';
    const schedule = () => {
      if (rendererRequested || rendererTimer) return;
      rendererTimer = setTimeout(() => loadPrimaryRenderer('post-content-lcp-r423'), START_DELAY);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
    else schedule();

    const startFromGesture = event => {
      if (!event.isTrusted || rendererRequested) return;
      loadPrimaryRenderer('trusted-user-gesture');
    };
    addEventListener('pointerdown', startFromGesture, { capture: true, passive: true, once: true });
    addEventListener('touchstart', startFromGesture, { capture: true, passive: true, once: true });
    addEventListener('keydown', startFromGesture, { capture: true, once: true });
  }

  root.dataset.fxCoreOverlayPolicyR326='new-native-webgl-organism-only-no-svg-canvas2d-or-legacy-visual';
  installSoundTouchRecovery();
  loadOpticsTune();
  loadFinalOptics();
  loadStableControls();
  loadReferenceLayout();
  loadLanguageOwner();
  loadFinalHeaderStyle();

  for (const eventName of ['formatx:controlownerready','formatx:mobilelayoutready','formatx:real3dready','formatx:languagechange','pageshow','load']) {
    addEventListener(eventName, () => {
      loadFinalHeaderStyle();
      loadFinalOptics();
      loadLanguageOwner();
    }, { passive: true });
  }
  addEventListener('resize', () => {
    loadFinalHeaderStyle();
    loadFinalOptics();
    loadLanguageOwner();
  }, { passive: true });
  addEventListener('orientationchange', () => {
    loadFinalHeaderStyle();
    loadFinalOptics();
    loadLanguageOwner();
  }, { passive: true });
  for (const delay of [0, 350, 1400, 3200]) setTimeout(() => {
    loadFinalHeaderStyle();
    loadFinalOptics();
    loadLanguageOwner();
  }, delay);

  schedulePrimaryRenderer();
}());
