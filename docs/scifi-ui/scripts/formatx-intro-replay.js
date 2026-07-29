(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxIntroReplayController === 'ready-v2') return;
  root.dataset.fxIntroReplayController = 'ready-v2';

  const OVERLAY_ID = 'formatx-event-horizon';
  const DURATION = 1900;
  let replaying = false;
  let token = 0;
  let frame = 0;

  function navigationType() {
    try {
      const entries = performance.getEntriesByType('navigation');
      return entries.length ? entries[0].type : 'navigate';
    } catch (_) {
      return 'navigate';
    }
  }

  const initialNavigationType = navigationType();
  if (initialNavigationType === 'back_forward') {
    root.dataset.fxIntroReplayPlanned = 'true';
  }

  function setProgress(overlay, value) {
    const bounded = Math.max(0, Math.min(100, value));
    const output = overlay.querySelector('[data-fx-intro-output]');
    const progress = overlay.querySelector('[data-fx-intro-progress]');
    const status = overlay.querySelector('[data-fx-intro-status]');
    if (output) output.textContent = String(Math.round(bounded)).padStart(3, '0');
    if (progress) progress.value = Math.round(bounded);
    if (status) {
      status.textContent = bounded < 30
        ? 'KAPCSOLAT FELÉPÍTÉSE'
        : bounded < 62
          ? 'TÉRBELI INDEX ÉPÍTÉSE'
          : bounded < 91
            ? 'MODULHÁLÓ SZINKRONIZÁLÁSA'
            : 'RENDSZERINTEGRITÁS ELLENŐRZÉSE';
    }
  }

  function revealElements(overlay) {
    const elements = [
      overlay.querySelector('.fx-intro-meta'),
      overlay.querySelector('.fx-intro-kicker'),
      overlay.querySelector('.fx-intro-word span'),
      overlay.querySelector('.fx-intro-subtitle'),
      overlay.querySelector('.fx-intro-progress-wrap'),
      overlay.querySelector('.fx-intro-skip'),
      overlay.querySelector('.fx-intro-portal'),
      overlay.querySelector('.fx-intro-grid')
    ].filter(Boolean);

    elements.forEach(element => {
      element.style.opacity = '1';
      element.style.transform = element.classList.contains('fx-intro-portal')
        ? 'translate(-50%, -50%) scale(1) rotate(12deg)'
        : 'none';
      element.style.filter = 'none';
    });
  }

  function completeReplay(overlay, currentToken, source) {
    if (currentToken !== token) return;
    cancelAnimationFrame(frame);
    setProgress(overlay, 100);
    overlay.classList.add('is-exiting');

    const fade = overlay.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
    );

    Promise.race([
      fade.finished.catch(() => {}),
      new Promise(resolve => setTimeout(resolve, 520))
    ]).then(() => {
      if (currentToken !== token) return;
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
      root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
      root.classList.add('fx-intro-complete');
      root.dataset.fxIntro = 'replayed';
      root.dataset.fxIntroReplaySource = source;
      delete root.dataset.fxIntroReplayPlanned;
      replaying = false;
      document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
        detail: { source: 'intro-replay', reason: source }
      }));
    });
  }

  function replay(source) {
    if (replaying) return;
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    replaying = true;
    root.dataset.fxIntroReplayPlanned = 'true';
    token += 1;
    const currentToken = token;
    cancelAnimationFrame(frame);

    document.dispatchEvent(new CustomEvent('formatx:introreplaystart', {
      detail: { source }
    }));

    try {
      overlay.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    } catch (_) {}

    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('is-exiting');
    overlay.style.opacity = '1';
    root.classList.remove('fx-intro-complete', 'fx-intro-reveal');
    root.classList.add('fx-intro-managed', 'fx-intro-pending', 'fx-intro-running');
    root.dataset.fxIntro = 'replaying';
    setProgress(overlay, 0);
    revealElements(overlay);

    let skip = overlay.querySelector('.fx-intro-skip');
    if (!skip) {
      skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'fx-intro-skip';
      skip.textContent = 'Animáció átugrása';
      overlay.appendChild(skip);
    }
    skip.onclick = () => completeReplay(overlay, currentToken, 'skip');

    const start = performance.now();
    function tick(now) {
      if (currentToken !== token || !replaying) return;
      const progress = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - progress, 3);
      setProgress(overlay, eased * 100);
      if (progress >= 1) completeReplay(overlay, currentToken, source);
      else frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    root.dataset.fxIntroReplayPlanned = 'true';
    setTimeout(() => replay('bfcache-restore'), 0);
  });

  function checkRestoredNavigation() {
    if (initialNavigationType !== 'back_forward') return;
    setTimeout(() => replay('back-forward-navigation'), 40);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkRestoredNavigation, { once: true });
  } else {
    checkRestoredNavigation();
  }
}());
