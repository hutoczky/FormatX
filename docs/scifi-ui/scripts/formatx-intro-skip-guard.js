(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxIntroSkipGuard === 'ready-v3') return;
  root.dataset.fxIntroSkipGuard = 'ready-v3';

  let completionTimer = 0;

  function introVisible() {
    const overlay = document.getElementById('formatx-event-horizon');
    return Boolean(overlay && !overlay.hidden && overlay.getAttribute('aria-hidden') !== 'true');
  }

  function syncGenomeLaunchers() {
    const blocked = introVisible();
    document.querySelectorAll('.fx-genome-launcher').forEach(launcher => {
      launcher.hidden = blocked;
      launcher.setAttribute('aria-hidden', blocked ? 'true' : 'false');
      launcher.tabIndex = blocked ? -1 : 0;
    });
  }

  function isComplete() {
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }

  function forceComplete() {
    clearTimeout(completionTimer);
    completionTimer = 0;
    if (isComplete()) {
      syncGenomeLaunchers();
      return;
    }
    const overlay = document.getElementById('formatx-event-horizon');
    if (overlay) {
      overlay.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-exiting');
    }
    root.classList.remove('fx-intro-pending', 'fx-intro-running', 'fx-intro-reveal', 'fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro = 'skip-guard-complete-v3';
    syncGenomeLaunchers();
    document.dispatchEvent(new CustomEvent('formatx:introcomplete', {
      detail: { source: 'authoritative-skip-guard-v3' }
    }));
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('.fx-intro-skip')) return;
    clearTimeout(completionTimer);
    completionTimer = window.setTimeout(forceComplete, 120);
  }, true);

  document.addEventListener('formatx:introcomplete', syncGenomeLaunchers);

  const observer = new MutationObserver(syncGenomeLaunchers);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['hidden', 'aria-hidden', 'class']
  });
  syncGenomeLaunchers();

  addEventListener('pagehide', () => {
    clearTimeout(completionTimer);
    observer.disconnect();
    root.dataset.fxIntroSkipGuard = 'released';
  }, { once: true });
}());