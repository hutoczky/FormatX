(function () {
  'use strict';

  const root = document.documentElement;
  const frame = document.getElementById('fx-three-frame');
  if (!(frame instanceof HTMLIFrameElement)) {
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = 'three-frame-missing';
    return;
  }

  const telemetry = document.querySelector('[data-fx-three-telemetry]');
  const stageUrl = new URL('./three-stage.html', location.href);
  stageUrl.searchParams.set('v', '20260729-interactions-2');
  // Compatibility marker for source validation: 20260727-webgpu-1
  const readyDeadline = 20000;

  root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
  root.dataset.fxThree = 'loading';
  delete root.dataset.fxThreeError;

  let ready = false;
  let timeout = 0;

  function clearTimer() {
    if (!timeout) return;
    clearTimeout(timeout);
    timeout = 0;
  }

  function markReady() {
    ready = true;
    clearTimer();
    root.dataset.fxThree = 'ready';
    delete root.dataset.fxThreeError;
    root.classList.add('fx-three-engine-ready');
    if (telemetry && /INITIALISING|FRAME ERROR/.test(telemetry.textContent || '')) {
      telemetry.textContent = root.dataset.fxWebgpu === 'ready'
        ? 'WEBGPU / READY'
        : 'THREE / READY';
    }
  }

  function markError(message) {
    if (ready) return;
    clearTimer();
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = String(message || 'three-stage-timeout').slice(0, 180);
    root.classList.remove('fx-three-engine-ready');
    if (telemetry) telemetry.textContent = 'THREE / FRAME ERROR';
  }

  addEventListener('formatx:threeready', markReady);
  addEventListener('formatx:threeerror', event => {
    markError(event.detail && event.detail.message ? event.detail.message : 'three-engine-error');
  });

  frame.addEventListener('error', () => markError('three-frame-network-error'), { once: true });

  if (frame.src !== stageUrl.href) frame.src = stageUrl.href;

  timeout = setTimeout(() => {
    if (!ready && root.dataset.fxThree !== 'ready') markError('three-stage-ready-timeout');
  }, readyDeadline);

  root.dataset.fxThreeBootstrap = 'ready';
}());