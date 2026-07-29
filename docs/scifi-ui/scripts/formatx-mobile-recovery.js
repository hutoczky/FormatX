(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileRecovery === 'ready-v5') return;

  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  root.dataset.fxMobileRecovery = mobile ? 'ready-v5' : 'desktop-pass';
  if (!mobile) return;

  root.classList.add('fx-mobile-stable-3d');
  root.dataset.fxMobile3d = 'intro-wait';

  const stageUrl = new URL('./three-stage-mobile.html', location.href);
  stageUrl.searchParams.set('v', '20260729-direct-mobile-stage-2');

  let frame = null;
  let frameObserver = null;
  let bodyObserver = null;
  let stateObserver = null;
  let watchdog = 0;
  let attempts = 0;
  let introComplete = root.classList.contains('fx-intro-complete');
  let threeStarted = false;

  function telemetry(text) {
    const output = document.querySelector('[data-fx-three-telemetry]');
    if (output) output.textContent = text;
  }

  function clearWatchdog() {
    if (!watchdog) return;
    clearTimeout(watchdog);
    watchdog = 0;
  }

  function expectedUrl(attempt) {
    if (!introComplete) return 'about:blank';
    const url = new URL(stageUrl.href);
    if (attempt > 0) url.searchParams.set('attempt', String(attempt));
    return url.href;
  }

  function sameUrl(current, desired) {
    if (desired === 'about:blank') return current === 'about:blank';
    try {
      return new URL(current, location.href).href === desired;
    } catch (_) {
      return false;
    }
  }

  function markReady() {
    clearWatchdog();
    root.dataset.fxMobile3d = 'ready';
    root.dataset.fxThree = 'ready';
    root.classList.add('fx-three-frame-loaded', 'fx-three-engine-ready');
    telemetry('THREE / DIRECT MOBILE READY');
  }

  function armWatchdog() {
    clearWatchdog();
    if (!introComplete || !frame) return;

    watchdog = window.setTimeout(() => {
      if (root.dataset.fxThree === 'ready') return;
      attempts += 1;
      if (!frame || attempts > 2) {
        root.dataset.fxThree = 'error';
        root.dataset.fxThreeError = 'direct-mobile-3d-startup-timeout';
        root.dataset.fxMobile3d = 'timeout';
        telemetry('THREE / MOBILE TIMEOUT');
        return;
      }

      root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
      root.dataset.fxThree = 'loading';
      root.dataset.fxMobile3d = 'retry-' + attempts;
      telemetry('THREE / DIRECT MOBILE RETRY');
      frame.src = expectedUrl(attempts);
      armWatchdog();
    }, attempts === 0 ? 10000 : 12000);
  }

  function applyDesiredFrameSource() {
    if (!(frame instanceof HTMLIFrameElement)) return;
    const desired = expectedUrl(attempts);
    const current = frame.getAttribute('src') || frame.src || 'about:blank';
    if (sameUrl(current, desired)) return;

    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    root.dataset.fxThree = introComplete ? 'loading' : 'intro-wait';
    root.dataset.fxMobile3d = introComplete ? 'direct-webgl-starting' : 'intro-wait';
    telemetry(introComplete ? 'THREE / DIRECT MOBILE 3D' : 'THREE / WAITING FOR INTRO');
    frame.src = desired;
  }

  function lockFrame(nextFrame) {
    if (!(nextFrame instanceof HTMLIFrameElement)) return;
    if (frame !== nextFrame) {
      frameObserver?.disconnect();
      frame = nextFrame;
      frameObserver = new MutationObserver(applyDesiredFrameSource);
      frameObserver.observe(frame, { attributes: true, attributeFilter: ['src'] });
      frame.addEventListener('load', () => {
        if (introComplete) root.classList.add('fx-three-frame-loaded');
      });
    }

    applyDesiredFrameSource();
    if (introComplete) armWatchdog();
  }

  function findFrame() {
    const candidate = document.getElementById('fx-three-frame');
    if (candidate instanceof HTMLIFrameElement) lockFrame(candidate);
  }

  function startThreeAfterIntro() {
    if (root.dataset.fxIntroReplayPlanned === 'true') return;
    if (threeStarted && root.dataset.fxThree !== 'error') return;
    introComplete = true;
    threeStarted = true;
    attempts = 0;
    root.dataset.fxMobile3d = 'direct-webgl-starting';
    root.dataset.fxThree = 'loading';
    findFrame();
    applyDesiredFrameSource();
    armWatchdog();
  }

  function resetForIntroReplay() {
    clearWatchdog();
    introComplete = false;
    threeStarted = false;
    attempts = 0;
    root.dataset.fxMobile3d = 'intro-replay-wait';
    root.dataset.fxThree = 'intro-wait';
    root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
    findFrame();
    applyDesiredFrameSource();
  }

  bodyObserver = new MutationObserver(findFrame);
  bodyObserver.observe(document.documentElement, { childList: true, subtree: true });

  stateObserver = new MutationObserver(() => {
    if (root.dataset.fxThree === 'ready') markReady();
  });
  stateObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three'] });

  document.addEventListener('formatx:introreplaystart', resetForIntroReplay);
  document.addEventListener('formatx:introcomplete', startThreeAfterIntro);
  addEventListener('formatx:threeready', markReady);
  document.addEventListener('formatx:threeready', markReady);

  addEventListener('pageshow', event => {
    if (event.persisted) findFrame();
  });

  addEventListener('pagehide', event => {
    clearWatchdog();
    if (event.persisted) return;
    bodyObserver?.disconnect();
    stateObserver?.disconnect();
    frameObserver?.disconnect();
  });

  findFrame();
  if (introComplete) startThreeAfterIntro();
}());
