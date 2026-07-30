(function () {
  'use strict';

  const ROOT = document.documentElement;
  const OVERLAY_ID = 'formatx-event-horizon';
  const STORAGE_KEY = 'formatx-intro-seen-v1';
  const REDUCE_QUERY = matchMedia('(prefers-reduced-motion: reduce)');
  const PARAMETERS = new URLSearchParams(location.search);
  const AUDIT_MODE = PARAMETERS.get('lighthouse') === '1';
  const FORCE_INTRO = PARAMETERS.get('intro') === '1';
  const TIMELINE_DURATION = REDUCE_QUERY.matches ? 1 : 560;
  const EXIT_DURATION = REDUCE_QUERY.matches ? 1 : 100;
  const HARD_DEADLINE = 700;

  const COPY = {
    hu: {
      skip: 'Animáció átugrása',
      phases: [
        [34, 'KAPCSOLAT FELÉPÍTÉSE'],
        [68, 'MODULHÁLÓ SZINKRONIZÁLÁSA'],
        [94, 'RENDSZERINTEGRITÁS ELLENŐRZÉSE'],
        [101, 'FORMATX MAG AKTÍV']
      ]
    },
    en: {
      skip: 'Skip animation',
      phases: [
        [34, 'ESTABLISHING LINK'],
        [68, 'SYNCHRONISING MODULE NETWORK'],
        [94, 'VERIFYING SYSTEM INTEGRITY'],
        [101, 'FORMATX CORE ONLINE']
      ]
    }
  };

  let runToken = 0;
  let progressFrame = 0;
  let hardTimer = 0;
  let exitTimer = 0;
  let running = false;
  let finishing = false;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function seenBefore() {
    if (FORCE_INTRO) return false;
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch (_) { return false; }
  }

  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (_) {}
  }

  function cancelTimers() {
    cancelAnimationFrame(progressFrame);
    clearTimeout(hardTimer);
    clearTimeout(exitTimer);
    progressFrame = 0;
    hardTimer = 0;
    exitTimer = 0;
  }

  function cancelOverlayAnimations(overlay) {
    if (!overlay) return;
    try { overlay.getAnimations({ subtree: true }).forEach(animation => animation.cancel()); } catch (_) {}
  }

  function setProgress(overlay, value) {
    if (!overlay) return;
    const bounded = Math.max(0, Math.min(100, value));
    const output = overlay.querySelector('[data-fx-intro-output]');
    const progress = overlay.querySelector('[data-fx-intro-progress]');
    const status = overlay.querySelector('[data-fx-intro-status]');
    const copy = COPY[language()];
    if (output) output.textContent = String(Math.round(bounded)).padStart(3, '0');
    if (progress) progress.value = Math.round(bounded);
    if (status) {
      const phase = copy.phases.find(entry => bounded < entry[0]);
      status.textContent = phase ? phase[1] : copy.phases[copy.phases.length - 1][1];
    }
  }

  function dispatchComplete(source) {
    document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
      detail: { source: source || 'timeline' }
    }));
  }

  function releasePage(overlay, source) {
    cancelTimers();
    runToken += 1;
    running = false;
    finishing = false;
    if (overlay) {
      cancelOverlayAnimations(overlay);
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
      overlay.style.opacity = '';
    }
    ROOT.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    ROOT.classList.add('fx-intro-complete');
    ROOT.dataset.fxIntro = source || 'timeline-complete';
    dispatchComplete(source);
  }

  function animateSafely(element, keyframes, options) {
    if (!element) return;
    try { element.animate(keyframes, Object.assign({ fill: 'both' }, options)); } catch (_) {}
  }

  function startVisuals(overlay) {
    if (REDUCE_QUERY.matches) return;
    animateSafely(overlay.querySelector('.fx-intro-word span'), [
      { opacity: 0, transform: 'translateY(70%) scale(.98)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
    ], { duration: 420, easing: 'cubic-bezier(.16,.82,.16,1)' });
    animateSafely(overlay.querySelector('.fx-intro-progress-wrap'), [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 300, delay: 80, easing: 'ease-out' });
    animateSafely(overlay.querySelector('.fx-intro-portal'), [
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.72) rotate(-10deg)' },
      { opacity: .58, transform: 'translate(-50%, -50%) scale(1) rotate(8deg)' }
    ], { duration: 520, easing: 'cubic-bezier(.18,.78,.2,1)' });
  }

  function ensureControls(overlay) {
    let button = overlay.querySelector('.fx-intro-skip');
    if (!button) {
      button = document.createElement('button');
      button.className = 'fx-intro-skip';
      button.type = 'button';
      overlay.appendChild(button);
    }
    button.textContent = COPY[language()].skip;
    button.onclick = () => beginExit(overlay, runToken, 'skip');
  }

  function beginExit(overlay, token, source) {
    if (token !== runToken || finishing) return;
    finishing = true;
    cancelAnimationFrame(progressFrame);
    setProgress(overlay, 100);
    ROOT.classList.add('fx-intro-reveal');
    overlay.classList.add('is-exiting');
    markSeen();
    animateSafely(overlay, [{ opacity: 1 }, { opacity: 0 }], {
      duration: EXIT_DURATION,
      easing: 'ease-out'
    });
    exitTimer = setTimeout(() => {
      if (token === runToken) releasePage(overlay, source || 'timeline-complete');
    }, EXIT_DURATION + 12);
  }

  function startProgress(overlay, token) {
    const startedAt = performance.now();
    function frame(now) {
      if (token !== runToken || !running || finishing) return;
      const linear = Math.min(1, Math.max(0, now - startedAt) / TIMELINE_DURATION);
      setProgress(overlay, (1 - Math.pow(1 - linear, 2.4)) * 100);
      if (linear >= 1) beginExit(overlay, token, 'timeline-complete');
      else progressFrame = requestAnimationFrame(frame);
    }
    progressFrame = requestAnimationFrame(frame);
  }

  function startIntro() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      releasePage(null, 'overlay-missing');
      return;
    }

    if (AUDIT_MODE || seenBefore()) {
      releasePage(overlay, AUDIT_MODE ? 'audit-skip' : 'returning-visitor');
      if (AUDIT_MODE) ROOT.classList.add('fx-audit-mode');
      return;
    }

    cancelTimers();
    cancelOverlayAnimations(overlay);
    running = true;
    finishing = false;
    runToken += 1;
    const token = runToken;

    ensureControls(overlay);
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('is-exiting');
    overlay.style.opacity = '1';
    setProgress(overlay, 0);

    ROOT.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    ROOT.classList.add('fx-intro-managed', 'fx-intro-pending', 'fx-intro-running');
    ROOT.dataset.fxIntro = 'first-visit-running';

    startVisuals(overlay);
    startProgress(overlay, token);
    hardTimer = setTimeout(() => {
      if (token === runToken) {
        markSeen();
        releasePage(overlay, 'hard-deadline');
      }
    }, HARD_DEADLINE);
  }

  addEventListener('pageshow', event => {
    if (event.persisted) releasePage(document.getElementById(OVERLAY_ID), 'bfcache-restore');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startIntro, { once: true });
  else startIntro();
}());
