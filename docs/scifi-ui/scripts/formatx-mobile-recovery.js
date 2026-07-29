(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxSafeThreeGate === 'ready-v2') return;

  root.dataset.fxSafeThreeGate = 'ready-v2';
  root.dataset.fxMobileRecovery = 'living-core-all-devices-v2';
  root.dataset.fxThree = 'intro-wait';
  root.classList.add('fx-mobile-stable-3d');

  const stageUrl = new URL('./three-stage-mobile.html', location.href);
  stageUrl.searchParams.set('v', '20260729-living-stage-v2');

  let frame = null;
  let frameObserver = null;
  let bodyObserver = null;
  let stateObserver = null;
  let watchdog = 0;
  let introComplete = root.classList.contains('fx-intro-complete');
  let started = false;
  let failed = false;

  function telemetry(text) {
    const output = document.querySelector('[data-fx-three-telemetry]');
    if (output) output.textContent = text;
  }

  function clearWatchdog() {
    if (!watchdog) return;
    clearTimeout(watchdog);
    watchdog = 0;
  }

  function desiredUrl() {
    return introComplete && started && !failed ? stageUrl.href : 'about:blank';
  }

  function sameUrl(current, desired) {
    if (desired === 'about:blank') return current === 'about:blank';
    try {
      return new URL(current, location.href).href === desired;
    } catch (_) {
      return false;
    }
  }

  function markError(message) {
    clearWatchdog();
    failed = true;
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = String(message || 'living-core-startup-failed').slice(0, 180);
    root.dataset.fxMobile3d = 'living-core-stage-error';
    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    telemetry('THREE / LIVING CORE UNAVAILABLE');
  }

  function markReady() {
    if (failed) return;
    clearWatchdog();
    root.dataset.fxThree = 'ready';
    root.dataset.fxMobile3d = 'living-core-stage-ready';
    root.dataset.fxThreeRenderer = 'three-webgl-living-core-v2';
    root.classList.add('fx-three-frame-loaded', 'fx-three-engine-ready');
    telemetry('THREE / LIVING CORE READY');
  }

  function enforceFrameSource() {
    if (!(frame instanceof HTMLIFrameElement)) return;
    const desired = desiredUrl();
    const current = frame.getAttribute('src') || frame.src || 'about:blank';
    if (sameUrl(current, desired)) return;

    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    root.dataset.fxThree = desired === 'about:blank' ? 'intro-wait' : 'loading';
    root.dataset.fxMobile3d = desired === 'about:blank' ? 'intro-wait' : 'living-core-stage-starting';
    telemetry(desired === 'about:blank' ? 'THREE / WAITING FOR INTRO' : 'THREE / LIVING CORE STARTING');
    frame.src = desired;
  }

  function lockFrame(nextFrame) {
    if (!(nextFrame instanceof HTMLIFrameElement)) return;
    if (frame !== nextFrame) {
      frameObserver?.disconnect();
      frame = nextFrame;
      frameObserver = new MutationObserver(enforceFrameSource);
      frameObserver.observe(frame, { attributes: true, attributeFilter: ['src'] });
      frame.addEventListener('error', () => markError('living-core-frame-network-error'), { once: true });
    }
    enforceFrameSource();
  }

  function findFrame() {
    const candidate = document.getElementById('fx-three-frame');
    if (candidate instanceof HTMLIFrameElement) lockFrame(candidate);
  }

  function armWatchdog() {
    clearWatchdog();
    watchdog = setTimeout(() => {
      if (root.dataset.fxThree !== 'ready') markError('living-core-ready-timeout');
    }, 15000);
  }

  function startAfterIntro() {
    if (started || failed) return;
    introComplete = true;
    started = true;
    root.dataset.fxThree = 'loading';
    root.dataset.fxMobile3d = 'living-core-stage-starting';
    findFrame();
    enforceFrameSource();
    armWatchdog();
  }

  function resetForRestoredPage() {
    clearWatchdog();
    introComplete = false;
    started = false;
    failed = false;
    root.dataset.fxThree = 'intro-wait';
    root.dataset.fxMobile3d = 'intro-wait';
    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    findFrame();
    enforceFrameSource();
  }

  bodyObserver = new MutationObserver(findFrame);
  bodyObserver.observe(document.documentElement, { childList: true, subtree: true });

  stateObserver = new MutationObserver(() => {
    if (root.dataset.fxThree === 'ready') markReady();
  });
  stateObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three'] });

  document.addEventListener('formatx:introcomplete', startAfterIntro);
  addEventListener('formatx:threeready', markReady);
  document.addEventListener('formatx:threeready', markReady);
  addEventListener('formatx:threeerror', event => {
    markError(event.detail?.message || 'living-core-engine-error');
  });

  addEventListener('pageshow', event => {
    if (event.persisted) resetForRestoredPage();
  });

  addEventListener('pagehide', event => {
    clearWatchdog();
    if (event.persisted) return;
    bodyObserver?.disconnect();
    stateObserver?.disconnect();
    frameObserver?.disconnect();
  }, { once: true });

  findFrame();
  if (introComplete) startAfterIntro();
}());
