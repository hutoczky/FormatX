(function () {
  'use strict';

  const ROOT = document.documentElement;
  const OVERLAY_ID = 'formatx-event-horizon';
  const MOBILE_QUERY = matchMedia('(max-width: 820px), (pointer: coarse)');
  const REDUCE_QUERY = matchMedia('(prefers-reduced-motion: reduce)');
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  const TIMELINE_DURATION = REDUCE_QUERY.matches ? 260 : (MOBILE_QUERY.matches ? 2100 : 2400);
  const EXIT_DURATION = REDUCE_QUERY.matches ? 80 : 280;
  const HARD_DEADLINE = TIMELINE_DURATION + EXIT_DURATION + 1100;

  const COPY = {
    hu: {
      skip: 'Animáció átugrása',
      phases: [
        [18, 'KAPCSOLAT FELÉPÍTÉSE'],
        [42, 'TÉRBELI INDEX ÉPÍTÉSE'],
        [70, 'MODULHÁLÓ SZINKRONIZÁLÁSA'],
        [94, 'RENDSZERINTEGRITÁS ELLENŐRZÉSE'],
        [101, 'FORMATX MAG AKTÍV']
      ]
    },
    en: {
      skip: 'Skip animation',
      phases: [
        [18, 'ESTABLISHING LINK'],
        [42, 'BUILDING SPATIAL INDEX'],
        [70, 'SYNCHRONISING MODULE NETWORK'],
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
    try {
      overlay.getAnimations({ subtree: true }).forEach(function (animation) {
        animation.cancel();
      });
    } catch (_) {}
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
      const phase = copy.phases.find(function (entry) { return bounded < entry[0]; });
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
    }

    ROOT.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    ROOT.classList.add('fx-intro-complete');
    ROOT.dataset.fxIntro = source || 'timeline-complete';
    dispatchComplete(source);
  }

  function animateSafely(element, keyframes, options) {
    if (!element) return;
    try {
      element.animate(keyframes, Object.assign({ fill: 'both' }, options));
    } catch (_) {}
  }

  function startVisuals(overlay) {
    const speed = REDUCE_QUERY.matches ? 0.12 : 1;
    function timing(duration, delay, easing) {
      return {
        duration: Math.max(1, duration * speed),
        delay: Math.max(0, delay * speed),
        easing: easing
      };
    }

    animateSafely(overlay.querySelector('.fx-intro-meta'),
      [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      timing(520, 40, 'cubic-bezier(.2,.8,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-corners'),
      [{ opacity: 0 }, { opacity: 0.72 }],
      timing(680, 60, 'ease-out'));
    animateSafely(overlay.querySelector('.fx-intro-kicker'),
      [{ opacity: 0, transform: 'translateY(14px)', letterSpacing: '.58em' }, { opacity: 1, transform: 'translateY(0)', letterSpacing: '.42em' }],
      timing(620, 120, 'cubic-bezier(.18,.8,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-word span'),
      [
        { opacity: 0, transform: 'translateY(112%) skewY(6deg) scale(.97)', filter: 'blur(12px)' },
        { opacity: 1, offset: 0.58 },
        { opacity: 1, transform: 'translateY(0) skewY(0) scale(1)', filter: 'blur(0)' }
      ],
      timing(920, 150, 'cubic-bezier(.16,.82,.16,1)'));
    animateSafely(overlay.querySelector('.fx-intro-subtitle'),
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      timing(560, 650, 'cubic-bezier(.2,.8,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-progress-wrap'),
      [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
      timing(620, 360, 'cubic-bezier(.2,.8,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-skip'),
      [{ opacity: 0 }, { opacity: 0.78 }],
      timing(520, 720, 'ease-out'));
    animateSafely(overlay.querySelector('.fx-intro-grid'),
      [
        { opacity: 0, transform: 'perspective(700px) rotateX(64deg) scale(1.82) translateY(25%)' },
        { opacity: 0.42, transform: 'perspective(700px) rotateX(64deg) scale(1.52) translateY(17%)' }
      ],
      timing(1500, 0, 'cubic-bezier(.16,.8,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-portal'),
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.48) rotate(-24deg)', filter: 'blur(8px)' },
        { opacity: 0.78, offset: 0.56 },
        { opacity: 0.56, transform: 'translate(-50%, -50%) scale(1) rotate(16deg)', filter: 'blur(0)' }
      ],
      timing(1760, 30, 'cubic-bezier(.18,.78,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-flare'),
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.01)' },
        { opacity: 0.96, offset: 0.42 },
        { opacity: 0.34, transform: 'translate(-50%, -50%) scale(1)' }
      ],
      timing(1320, 150, 'cubic-bezier(.18,.8,.2,1)'));
    animateSafely(overlay.querySelector('.fx-intro-scan'),
      [
        { opacity: 0, transform: 'translateY(-80%)' },
        { opacity: 0.62, offset: 0.2 },
        { opacity: 0, transform: 'translateY(410%)' }
      ],
      timing(1450, 210, 'cubic-bezier(.2,.75,.2,1)'));
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
    button.onclick = function () { beginExit(overlay, runToken, 'skip'); };

    if (!overlay.querySelector('.fx-intro-corners')) {
      const corners = document.createElement('div');
      corners.className = 'fx-intro-corners';
      corners.setAttribute('aria-hidden', 'true');
      corners.innerHTML = '<i></i><i></i><i></i><i></i>';
      overlay.appendChild(corners);
    }
  }

  function beginExit(overlay, token, source) {
    if (token !== runToken || finishing) return;
    finishing = true;
    cancelAnimationFrame(progressFrame);
    setProgress(overlay, 100);
    ROOT.classList.add('fx-intro-reveal');
    overlay.classList.add('is-exiting');

    animateSafely(overlay,
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: EXIT_DURATION, easing: 'ease-out' });

    exitTimer = setTimeout(function () {
      if (token === runToken) releasePage(overlay, source || 'timeline-complete');
    }, EXIT_DURATION + 40);
  }

  function startProgress(overlay, token) {
    const startedAt = performance.now();

    function frame(now) {
      if (token !== runToken || !running || finishing) return;
      const elapsed = Math.max(0, now - startedAt);
      const linear = Math.min(1, elapsed / TIMELINE_DURATION);
      const eased = 1 - Math.pow(1 - linear, 2.35);
      setProgress(overlay, eased * 100);

      if (linear >= 1) {
        beginExit(overlay, token, 'timeline-complete');
        return;
      }
      progressFrame = requestAnimationFrame(frame);
    }

    progressFrame = requestAnimationFrame(frame);
  }

  function startIntro() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      releasePage(null, 'overlay-missing');
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
    setProgress(overlay, 0);

    ROOT.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    ROOT.classList.add('fx-intro-managed', 'fx-intro-pending', 'fx-intro-running');
    ROOT.dataset.fxIntro = 'timeline-running';

    startVisuals(overlay);
    startProgress(overlay, token);

    hardTimer = setTimeout(function () {
      if (token === runToken) releasePage(overlay, 'hard-deadline');
    }, HARD_DEADLINE);
  }

  if (AUDIT_MODE) {
    releasePage(document.getElementById(OVERLAY_ID), 'audit-skip');
    ROOT.classList.add('fx-audit-mode');
    return;
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) startIntro();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startIntro, { once: true });
  } else {
    startIntro();
  }
}());
