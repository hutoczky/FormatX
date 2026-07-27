(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteFix === 'ready') return;
  root.dataset.fxInfiniteFix = 'ready';

  let transferring = false;
  let fallbackTimer = 0;

  function elements() {
    return {
      hero: document.getElementById('hero'),
      clone: document.querySelector('[data-fx-loop-bridge="true"]')
    };
  }

  function atTransferPoint(clone) {
    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const cloneReach = Math.max(clone.offsetTop, clone.offsetTop + clone.offsetHeight - innerHeight);
    const trigger = Math.min(maximumScroll, cloneReach) - 2;
    return scrollY >= trigger;
  }

  function performFallback(hero, clone, baseline) {
    if (transferring) return;
    if (Number(root.dataset.fxLoopCount || 0) > baseline) return;
    if (!atTransferPoint(clone)) return;

    transferring = true;
    const maximumRelative = Math.max(0, clone.offsetHeight - innerHeight);
    const relative = Math.max(0, Math.min(maximumRelative, scrollY - clone.offsetTop));
    root.classList.add('fx-three-loop-transfer');

    requestAnimationFrame(() => {
      scrollTo(0, hero.offsetTop + relative);
      const count = Math.max(baseline, Number(root.dataset.fxLoopCount || 0)) + 1;
      root.dataset.fxLoopCount = String(count);

      requestAnimationFrame(() => {
        root.classList.remove('fx-three-loop-transfer');
        transferring = false;
        dispatchEvent(new CustomEvent('formatx:loop', { detail: { count, source: 'fallback' } }));
      });
    });
  }

  function transferIfNeeded() {
    if (transferring) return;
    const { hero, clone } = elements();
    if (!hero || !clone || !atTransferPoint(clone)) return;

    // The Three.js host gets the first chance to perform the hand-off. The
    // fallback runs only when the host did not increment the loop counter.
    const baseline = Number(root.dataset.fxLoopCount || 0);
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => performFallback(hero, clone, baseline), 180);
  }

  addEventListener('formatx:loop', () => {
    clearTimeout(fallbackTimer);
    fallbackTimer = 0;
  });
  addEventListener('scroll', transferIfNeeded, { passive: true });
  addEventListener('resize', transferIfNeeded, { passive: true });
  addEventListener('pageshow', transferIfNeeded, { passive: true });
  addEventListener('pagehide', () => clearTimeout(fallbackTimer), { once: true });
}());
