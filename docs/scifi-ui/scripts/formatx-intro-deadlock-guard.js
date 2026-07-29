(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxIntroDeadlockGuard === 'ready') return;
  root.dataset.fxIntroDeadlockGuard = 'ready';

  const OVERLAY_ID = 'formatx-event-horizon';
  const DEADLINE = 4800;
  let timer = 0;
  let completed = false;

  function clearGuard() {
    if (!timer) return;
    clearTimeout(timer);
    timer = 0;
  }

  function alreadyComplete() {
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running');
  }

  function forceComplete(source) {
    if (completed || alreadyComplete()) {
      completed = true;
      clearGuard();
      return;
    }

    completed = true;
    clearGuard();

    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      try {
        overlay.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
      } catch (_) {}
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
    }

    root.classList.remove(
      'fx-intro-pending',
      'fx-intro-running',
      'fx-intro-reveal',
      'fx-intro-managed',
    );
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro = 'deadlock-guard-complete';
    root.dataset.fxIntroGuardSource = source;

    document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
      detail: { source: 'deadlock-guard', reason: source },
    }));
  }

  function armGuard() {
    clearGuard();
    if (alreadyComplete()) return;
    timer = window.setTimeout(() => forceComplete('deadline'), DEADLINE);
  }

  document.addEventListener('formatx:introcomplete', () => {
    completed = true;
    clearGuard();
  }, { once: true });

  document.addEventListener('click', event => {
    if (!event.target.closest('.fx-intro-skip')) return;
    window.setTimeout(() => forceComplete('skip-fallback'), 260);
  }, true);

  addEventListener('pageshow', event => {
    if (event.persisted) forceComplete('page-restore');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armGuard, { once: true });
  } else {
    armGuard();
  }
}());
