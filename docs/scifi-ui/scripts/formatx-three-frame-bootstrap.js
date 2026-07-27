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
  stageUrl.searchParams.set('v', '20260727-three-7');

  root.classList.remove('fx-three-frame-loaded', 'fx-three-engine-ready');
  root.dataset.fxThree = 'loading';
  delete root.dataset.fxThreeError;

  let settled = false;
  let timeout = 0;

  function clearTimer() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = 0;
    }
  }

  function markReady() {
    if (settled) return;
    settled = true;
    clearTimer();
    root.dataset.fxThree = 'ready';
    root.classList.add('fx-three-engine-ready');
    if (telemetry && /INITIALISING|FRAME ERROR/.test(telemetry.textContent || '')) {
      telemetry.textContent = 'THREE / READY';
    }
  }

  function markError(message) {
    if (settled) return;
    settled = true;
    clearTimer();
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = String(message || 'three-stage-timeout').slice(0, 180);
    root.classList.remove('fx-three-engine-ready');
    if (telemetry) telemetry.textContent = 'THREE / FRAME ERROR';
  }

  addEventListener('formatx:threeready', markReady, { once: true });
  addEventListener('formatx:threeerror', event => {
    markError(event.detail && event.detail.message ? event.detail.message : 'three-engine-error');
  }, { once: true });

  frame.addEventListener('error', () => markError('three-frame-network-error'), { once: true });

  if (frame.src !== stageUrl.href) frame.src = stageUrl.href;

  timeout = setTimeout(() => {
    if (root.dataset.fxThree !== 'ready') markError('three-stage-ready-timeout');
  }, 12000);

  root.dataset.fxThreeBootstrap = 'ready';
}());
