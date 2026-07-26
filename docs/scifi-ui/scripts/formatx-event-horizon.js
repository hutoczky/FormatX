(function () {
  'use strict';

  const ROOT = document.documentElement;
  const OVERLAY_ID = 'formatx-event-horizon';
  const MOBILE_QUERY = window.matchMedia('(max-width: 820px), (pointer: coarse)');
  const REDUCE_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MIN_DURATION = REDUCE_QUERY.matches ? 520 : (MOBILE_QUERY.matches ? 1550 : 1780);
  const MAX_DURATION = REDUCE_QUERY.matches ? 1300 : 4600;

  let activeRun = 0;
  let started = false;

  function navigationType() {
    try {
      const entries = performance.getEntriesByType('navigation');
      return entries.length ? entries[0].type : 'navigate';
    } catch (_) {
      return 'navigate';
    }
  }

  function pad(value) {
    return String(Math.max(0, Math.min(100, Math.round(value)))).padStart(3, '0');
  }

  function phaseFor(progress, loaded) {
    if (progress < 22) return 'KAPCSOLAT FELÉPÍTÉSE';
    if (progress < 48) return 'TÉRBELI INDEX ÉPÍTÉSE';
    if (progress < 76) return 'MODULHÁLÓ SZINKRONIZÁLÁSA';
    if (!loaded || progress < 96) return 'RENDSZERINTEGRITÁS ELLENŐRZÉSE';
    return 'FORMATX MAG AKTÍV';
  }

  function prepareOverlay(overlay) {
    overlay.hidden = false;
    overlay.classList.remove('is-exiting');
    const output = overlay.querySelector('[data-fx-intro-output]');
    const progress = overlay.querySelector('[data-fx-intro-progress]');
    const status = overlay.querySelector('[data-fx-intro-status]');
    if (output) output.textContent = '000';
    if (progress) progress.value = 0;
    if (status) status.textContent = 'KAPCSOLAT FELÉPÍTÉSE';
  }

  function finish(overlay, runId) {
    if (runId !== activeRun || overlay.classList.contains('is-exiting')) return;

    const output = overlay.querySelector('[data-fx-intro-output]');
    const progress = overlay.querySelector('[data-fx-intro-progress]');
    const status = overlay.querySelector('[data-fx-intro-status]');
    if (output) output.textContent = '100';
    if (progress) progress.value = 100;
    if (status) status.textContent = 'FORMATX MAG AKTÍV';

    overlay.classList.add('is-exiting');
    ROOT.classList.add('fx-intro-reveal');

    window.setTimeout(function () {
      if (runId !== activeRun) return;
      overlay.hidden = true;
      overlay.classList.remove('is-exiting');
      ROOT.classList.remove('fx-intro-pending', 'fx-intro-running');
      ROOT.classList.add('fx-intro-complete');

      window.setTimeout(function () {
        ROOT.classList.remove('fx-intro-reveal');
      }, 1100);
    }, REDUCE_QUERY.matches ? 260 : 980);
  }

  function runIntro(reason) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      ROOT.classList.remove('fx-intro-pending', 'fx-intro-running');
      ROOT.classList.add('fx-intro-complete');
      return;
    }

    activeRun += 1;
    const runId = activeRun;
    const startedAt = performance.now();
    const isRestore = reason === 'bfcache' || navigationType() === 'back_forward';
    const minimum = isRestore ? Math.min(MIN_DURATION, 880) : MIN_DURATION;
    let loaded = document.readyState === 'complete';
    let current = 0;
    let lastTime = startedAt;

    prepareOverlay(overlay);
    ROOT.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    ROOT.classList.add('fx-intro-pending', 'fx-intro-running');

    const output = overlay.querySelector('[data-fx-intro-output]');
    const progress = overlay.querySelector('[data-fx-intro-progress]');
    const status = overlay.querySelector('[data-fx-intro-status]');

    function markLoaded() {
      loaded = true;
    }

    if (!loaded) {
      window.addEventListener('load', markLoaded, { once: true });
    }

    function frame(now) {
      if (runId !== activeRun) return;

      const elapsed = now - startedAt;
      const delta = Math.min(64, now - lastTime);
      lastTime = now;
      const preLoadTarget = Math.min(89, 8 + elapsed / 24);
      const target = loaded ? 100 : preLoadTarget;
      const easing = loaded ? 0.085 : 0.045;
      current += (target - current) * (1 - Math.pow(1 - easing, delta / 16.67));

      if (!loaded && current > 89) current = 89;
      if (loaded && elapsed >= minimum && current > 99.15) current = 100;

      if (output) output.textContent = pad(current);
      if (progress) progress.value = Math.round(current);
      if (status) status.textContent = phaseFor(current, loaded);

      if ((loaded && elapsed >= minimum && current >= 100) || elapsed >= MAX_DURATION) {
        finish(overlay, runId);
        return;
      }

      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
    window.setTimeout(function () {
      finish(overlay, runId);
    }, MAX_DURATION + 300);
  }

  function initialStart() {
    if (started) return;
    started = true;
    runIntro(navigationType());
  }

  window.addEventListener('pageshow', function (event) {
    if (!started) {
      started = true;
      runIntro(event.persisted ? 'bfcache' : navigationType());
      return;
    }

    if (event.persisted) runIntro('bfcache');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialStart, { once: true });
  } else {
    initialStart();
  }
}());
