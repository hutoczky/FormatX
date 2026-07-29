(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMobileRecovery === 'ready') return;

  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  root.dataset.fxMobileRecovery = mobile ? 'ready' : 'desktop-pass';
  if (!mobile) return;

  root.classList.add('fx-mobile-stable-3d');
  root.dataset.fxMobile3d = 'webgl-forced';

  const stageUrl = new URL('./three-stage-mobile.html', location.href);
  stageUrl.searchParams.set('v', '20260729-mobile-webgl-stage-2');

  let frame = null;
  let frameObserver = null;
  let watchdog = 0;
  let attempts = 0;

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
    const url = new URL(stageUrl.href);
    if (attempt > 0) url.searchParams.set('attempt', String(attempt));
    return url.href;
  }

  function armWatchdog() {
    clearWatchdog();
    watchdog = window.setTimeout(() => {
      if (root.dataset.fxThree === 'ready') return;
      attempts += 1;
      if (!frame || attempts > 2) {
        root.dataset.fxThree = 'error';
        root.dataset.fxThreeError = 'mobile-webgl-startup-timeout';
        telemetry('THREE / MOBILE TIMEOUT');
        return;
      }
      root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
      root.dataset.fxThree = 'loading';
      telemetry('THREE / MOBILE RECOVERY');
      frame.src = expectedUrl(attempts);
      armWatchdog();
    }, attempts === 0 ? 9000 : 12000);
  }

  function lockFrame(nextFrame) {
    if (!(nextFrame instanceof HTMLIFrameElement)) return;
    if (frame !== nextFrame) {
      frameObserver?.disconnect();
      frame = nextFrame;
      frameObserver = new MutationObserver(() => {
        if (!frame) return;
        const current = new URL(frame.getAttribute('src') || frame.src, location.href).href;
        const desired = expectedUrl(attempts);
        if (current !== desired) frame.src = desired;
      });
      frameObserver.observe(frame, { attributes: true, attributeFilter: ['src'] });
      frame.addEventListener('load', () => root.classList.add('fx-three-frame-loaded'));
    }

    const current = new URL(frame.getAttribute('src') || frame.src, location.href).href;
    const desired = expectedUrl(attempts);
    if (current !== desired) {
      root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
      root.dataset.fxThree = 'loading';
      telemetry('THREE / MOBILE WEBGL');
      frame.src = desired;
    }
    armWatchdog();
  }

  function findFrame() {
    const candidate = document.getElementById('fx-three-frame');
    if (candidate instanceof HTMLIFrameElement) lockFrame(candidate);
  }

  const bodyObserver = new MutationObserver(findFrame);
  bodyObserver.observe(document.documentElement, { childList: true, subtree: true });

  const stateObserver = new MutationObserver(() => {
    if (root.dataset.fxThree === 'ready') {
      clearWatchdog();
      root.dataset.fxMobile3d = 'ready';
      telemetry('THREE / MOBILE READY');
    }
  });
  stateObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three'] });

  addEventListener('formatx:threeready', () => {
    clearWatchdog();
    root.dataset.fxMobile3d = 'ready';
  });

  addEventListener('pagehide', () => {
    clearWatchdog();
    bodyObserver.disconnect();
    stateObserver.disconnect();
    frameObserver?.disconnect();
  }, { once: true });

  findFrame();
}());
