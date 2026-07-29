(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxSafeThreeGate === 'ready-v1') return;

  root.dataset.fxSafeThreeGate = 'ready-v1';
  root.dataset.fxMobileRecovery = 'safe-all-devices-v1';
  root.dataset.fxThree = 'intro-wait';
  root.classList.add('fx-mobile-stable-3d');

  const stageUrl = new URL('./three-stage-mobile.html', location.href);
  stageUrl.searchParams.set('v', '20260729-direct-safe-stage-1');

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
    root.dataset.fxThreeError = String(message || 'safe-three-startup-failed').slice(0, 180);
    root.dataset.fxMobile3d = 'safe-stage-error';
    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    telemetry('THREE / SAFE MODE UNAVAILABLE');
    // Do not reload the frame automatically. The website must remain usable.
  }

  function markReady() {
    if (failed) return;
    clearWatchdog();
    root.dataset.fxThree = 'ready';
    root.dataset.fxMobile3d = 'safe-stage-ready';
    root.dataset.fxThreeRenderer = 'three-webgl-direct-safe';
    root.classList.add('fx-three-frame-loaded', 'fx-three-engine-ready');
    telemetry('THREE / DIRECT WEBGL READY');
  }

  function enforceFrameSource() {
    if (!(frame instanceof HTMLIFrameElement)) return;
    const desired = desiredUrl();
    const current = frame.getAttribute('src') || frame.src || 'about:blank';
    if (sameUrl(current, desired)) return;

    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    root.dataset.fxThree = desired === 'about:blank' ? 'intro-wait' : 'loading';
    root.dataset.fxMobile3d = desired === 'about:blank' ? 'intro-wait' : 'safe-stage-starting';
    telemetry(desired === 'about:blank' ? 'THREE / WAITING FOR INTRO' : 'THREE / DIRECT WEBGL STARTING');
    frame.src = desired;
  }

  function lockFrame(nextFrame) {
    if (!(nextFrame instanceof HTMLIFrameElement)) return;
    if (frame !== nextFrame) {
      frameObserver?.disconnect();
      frame = nextFrame;
      frameObserver = new MutationObserver(enforceFrameSource);
      frameObserver.observe(frame, { attributes: true, attributeFilter: ['src'] });
      frame.addEventListener('error', () => markError('safe-three-frame-network-error'), { once: true });
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
      if (root.dataset.fxThree !== 'ready') markError('safe-three-ready-timeout');
    }, 15000);
  }

  function startAfterIntro() {
    if (started || failed) return;
    introComplete = true;
    started = true;
    root.dataset.fxThree = 'loading';
    root.dataset.fxMobile3d = 'safe-stage-starting';
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
    markError(event.detail?.message || 'safe-three-engine-error');
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
