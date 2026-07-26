(function () {
  'use strict';

  const ROOT = document.documentElement;
  const OVERLAY_ID = 'formatx-event-horizon';
  const MOBILE_QUERY = window.matchMedia('(max-width: 820px), (pointer: coarse)');
  const REDUCE_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
  const FULL_DURATION = MOBILE_QUERY.matches ? 1580 : 1940;
  const LOAD_DEADLINE = 2900;
  const FAILSAFE_DEADLINE = 5200;

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
  let failsafeTimer = 0;
  let running = false;
  let finishing = false;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function navigationType() {
    try {
      const entries = performance.getEntriesByType('navigation');
      return entries.length ? entries[0].type : 'navigate';
    } catch (_) {
      return 'navigate';
    }
  }

  function delay(milliseconds) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function animationFinished(animation) {
    return animation.finished.catch(function () {});
  }

  function afterTwoFrames() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function loadOrDeadline() {
    if (document.readyState === 'complete') return Promise.resolve('loaded');

    return Promise.race([
      new Promise(function (resolve) {
        window.addEventListener('load', function () { resolve('loaded'); }, { once: true });
      }),
      delay(LOAD_DEADLINE).then(function () { return 'deadline'; })
    ]);
  }

  function ensureControls(overlay) {
    let button = overlay.querySelector('.fx-intro-skip');
    const shouldAppendButton = !button;
    if (!button) {
      button = document.createElement('button');
      button.className = 'fx-intro-skip';
      button.type = 'button';
    }
    button.textContent = COPY[language()].skip;
    button.onclick = function () { finishIntro(overlay, runToken, true); };
    if (shouldAppendButton) overlay.appendChild(button);

    if (!overlay.querySelector('.fx-intro-corners')) {
      const corners = document.createElement('div');
      corners.className = 'fx-intro-corners';
      corners.setAttribute('aria-hidden', 'true');
      corners.innerHTML = '<i></i><i></i><i></i><i></i>';
      overlay.appendChild(corners);
    }
  }

  function setProgress(overlay, value) {
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

  function cancelOverlayAnimations(overlay) {
    overlay.getAnimations({ subtree: true }).forEach(function (animation) {
      animation.cancel();
    });
  }

  function resetAnimatedElements(overlay) {
    cancelOverlayAnimations(overlay);
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('is-exiting');
    setProgress(overlay, 0);
  }

  function completeImmediately(overlay) {
    runToken += 1;
    running = false;
    finishing = false;
    window.cancelAnimationFrame(progressFrame);
    window.clearTimeout(failsafeTimer);

    if (overlay) {
      cancelOverlayAnimations(overlay);
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
    }

    ROOT.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    ROOT.classList.add('fx-intro-complete');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  }

  function playVisualSequence(overlay) {
    const reduced = REDUCE_QUERY.matches;
    const kicker = overlay.querySelector('.fx-intro-kicker');
    const word = overlay.querySelector('.fx-intro-word span');
    const subtitle = overlay.querySelector('.fx-intro-subtitle');
    const meta = overlay.querySelector('.fx-intro-meta');
    const progress = overlay.querySelector('.fx-intro-progress-wrap');
    const portal = overlay.querySelector('.fx-intro-portal');
    const flare = overlay.querySelector('.fx-intro-flare');
    const grid = overlay.querySelector('.fx-intro-grid');
    const scan = overlay.querySelector('.fx-intro-scan');
    const corners = overlay.querySelector('.fx-intro-corners');
    const skip = overlay.querySelector('.fx-intro-skip');

    if (reduced) {
      return Promise.all([
        animationFinished(overlay.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 110, easing: 'linear', fill: 'both' }
        )),
        delay(150)
      ]);
    }

    const animations = [];
    function animate(element, keyframes, options) {
      if (!element) return;
      animations.push(animationFinished(element.animate(keyframes, Object.assign({ fill: 'both' }, options))));
    }

    animate(meta,
      [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 520, delay: 40, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animate(corners,
      [{ opacity: 0 }, { opacity: 0.72 }],
      { duration: 680, delay: 60, easing: 'ease-out' });
    animate(kicker,
      [{ opacity: 0, transform: 'translateY(14px)', letterSpacing: '.58em' }, { opacity: 1, transform: 'translateY(0)', letterSpacing: '.42em' }],
      { duration: 620, delay: 120, easing: 'cubic-bezier(.18,.8,.2,1)' });
    animate(word,
      [
        { opacity: 0, transform: 'translateY(112%) skewY(6deg) scale(.97)', filter: 'blur(12px)' },
        { opacity: 1, offset: 0.58 },
        { opacity: 1, transform: 'translateY(0) skewY(0) scale(1)', filter: 'blur(0)' }
      ],
      { duration: 920, delay: 150, easing: 'cubic-bezier(.16,.82,.16,1)' });
    animate(subtitle,
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 560, delay: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animate(progress,
      [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 620, delay: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animate(skip,
      [{ opacity: 0 }, { opacity: 0.78 }],
      { duration: 520, delay: 720, easing: 'ease-out' });
    animate(grid,
      [
        { opacity: 0, transform: 'perspective(700px) rotateX(64deg) scale(1.82) translateY(25%)' },
        { opacity: 0.42, transform: 'perspective(700px) rotateX(64deg) scale(1.52) translateY(17%)' }
      ],
      { duration: 1500, easing: 'cubic-bezier(.16,.8,.2,1)' });
    animate(portal,
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.48) rotate(-24deg)', filter: 'blur(8px) drop-shadow(0 0 10px rgba(103,226,255,.08))' },
        { opacity: 0.78, offset: 0.56 },
        { opacity: 0.56, transform: 'translate(-50%, -50%) scale(1) rotate(16deg)', filter: 'blur(0) drop-shadow(0 0 38px rgba(103,226,255,.16))' }
      ],
      { duration: 1760, delay: 30, easing: 'cubic-bezier(.18,.78,.2,1)' });
    animate(flare,
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(.01)' },
        { opacity: 0.96, offset: 0.42 },
        { opacity: 0.34, transform: 'translate(-50%, -50%) scale(1)' }
      ],
      { duration: 1320, delay: 150, easing: 'cubic-bezier(.18,.8,.2,1)' });
    animate(scan,
      [
        { opacity: 0, transform: 'translateY(-80%)' },
        { opacity: 0.62, offset: 0.2 },
        { opacity: 0, transform: 'translateY(410%)' }
      ],
      { duration: 1450, delay: 210, easing: 'cubic-bezier(.2,.75,.2,1)' });

    return Promise.all(animations);
  }

  function beginProgress(overlay, token) {
    const startedAt = performance.now();

    function frame(now) {
      if (token !== runToken || !running || finishing) return;
      const elapsed = Math.max(0, now - startedAt);
      const normalised = Math.min(1, elapsed / FULL_DURATION);
      const eased = 1 - Math.pow(1 - normalised, 3);
      setProgress(overlay, Math.min(92, eased * 92));
      progressFrame = window.requestAnimationFrame(frame);
    }

    progressFrame = window.requestAnimationFrame(frame);
  }

  async function completeProgress(overlay, token) {
    const output = overlay.querySelector('[data-fx-intro-output]');
    const start = Number(output && output.textContent) || 92;
    const duration = REDUCE_QUERY.matches ? 80 : 260;
    const began = performance.now();

    await new Promise(function (resolve) {
      function frame(now) {
        if (token !== runToken) {
          resolve();
          return;
        }
        const progress = Math.min(1, (now - began) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setProgress(overlay, start + (100 - start) * eased);
        if (progress >= 1) resolve();
        else window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    });
  }

  async function finishIntro(overlay, token, skipped) {
    if (token !== runToken || finishing) return;
    finishing = true;
    window.cancelAnimationFrame(progressFrame);

    if (skipped) {
      setProgress(overlay, 100);
      cancelOverlayAnimations(overlay);
      ROOT.classList.add('fx-intro-reveal');
      overlay.classList.add('is-exiting');

      const fade = overlay.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 120, easing: 'ease-out', fill: 'both' }
      );
      await Promise.race([animationFinished(fade), delay(180)]);
      if (token === runToken) completeImmediately(overlay);
      return;
    }

    await completeProgress(overlay, token);
    if (token !== runToken) return;

    ROOT.classList.add('fx-intro-reveal');
    overlay.classList.add('is-exiting');

    const reduced = REDUCE_QUERY.matches;
    const duration = reduced ? 120 : 760;
    const center = overlay.querySelector('.fx-intro-center');
    const meta = overlay.querySelector('.fx-intro-meta');
    const progress = overlay.querySelector('.fx-intro-progress-wrap');
    const skip = overlay.querySelector('.fx-intro-skip');
    const top = overlay.querySelector('.fx-intro-curtain--top');
    const bottom = overlay.querySelector('.fx-intro-curtain--bottom');
    const atmospheric = overlay.querySelectorAll('.fx-intro-grid, .fx-intro-portal, .fx-intro-flare, .fx-intro-scan, .fx-intro-corners');

    const animations = [];
    function animate(element, keyframes, options) {
      if (!element) return;
      animations.push(animationFinished(element.animate(keyframes, Object.assign({ fill: 'both' }, options))));
    }

    [center, meta, progress, skip].forEach(function (element) {
      animate(element,
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
        { duration: reduced ? 80 : 300, easing: 'ease-in' });
    });
    atmospheric.forEach(function (element) {
      animate(element, [{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 80 : 360, easing: 'ease-in' });
    });
    animate(top,
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-103%)' }],
      { duration: duration, delay: reduced ? 0 : 110, easing: 'cubic-bezier(.78,0,.16,1)' });
    animate(bottom,
      [{ transform: 'translateY(0)' }, { transform: 'translateY(103%)' }],
      { duration: duration, delay: reduced ? 0 : 110, easing: 'cubic-bezier(.78,0,.16,1)' });
    animate(overlay,
      [{ opacity: 1 }, { opacity: reduced ? 0 : 0.94, offset: 0.72 }, { opacity: 0 }],
      { duration: duration + (reduced ? 20 : 180), easing: 'cubic-bezier(.2,.8,.2,1)' });

    await Promise.race([Promise.all(animations), delay(duration + 420)]);
    if (token === runToken) completeImmediately(overlay);
  }

  async function startIntro() {
    if (running) return;
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      completeImmediately(null);
      return;
    }

    if (navigationType() === 'back_forward') {
      completeImmediately(overlay);
      return;
    }

    running = true;
    finishing = false;
    runToken += 1;
    const token = runToken;

    ensureControls(overlay);
    resetAnimatedElements(overlay);
    ROOT.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    ROOT.classList.add('fx-intro-managed', 'fx-intro-pending', 'fx-intro-running');

    failsafeTimer = window.setTimeout(function () {
      if (token === runToken) completeImmediately(overlay);
    }, FAILSAFE_DEADLINE);

    await afterTwoFrames();
    if (token !== runToken || finishing) return;

    beginProgress(overlay, token);
    const visuals = playVisualSequence(overlay);

    if (REDUCE_QUERY.matches) {
      await Promise.all([visuals, delay(180)]);
    } else {
      await Promise.all([
        visuals,
        delay(FULL_DURATION),
        loadOrDeadline()
      ]);
    }

    if (token === runToken && !finishing) await finishIntro(overlay, token, false);
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) completeImmediately(document.getElementById(OVERLAY_ID));
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && running) completeImmediately(document.getElementById(OVERLAY_ID));
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startIntro, { once: true });
  } else {
    startIntro();
  }
}());
