(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxIntroSkipGuard === 'ready') return;
  root.dataset.fxIntroSkipGuard = 'ready';

  function isComplete() {
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }

  function forceComplete() {
    if (isComplete()) return;
    const overlay = document.getElementById('formatx-event-horizon');
    if (overlay) {
      overlay.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
    }
    root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro = 'skip-guard-complete';
    document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
      detail: { source: 'authoritative-skip-guard' }
    }));
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('.fx-intro-skip')) return;
    window.setTimeout(forceComplete, 420);
  }, true);

  addEventListener('pagehide', () => {
    root.dataset.fxIntroSkipGuard = 'released';
  }, { once: true });
}());
