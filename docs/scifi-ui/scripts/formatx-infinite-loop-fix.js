(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteFix === 'ready') return;
  root.dataset.fxInfiniteFix = 'ready';

  let transferring = false;

  function elements() {
    return {
      hero: document.getElementById('hero'),
      clone: document.querySelector('[data-fx-loop-bridge="true"]')
    };
  }

  function transferIfNeeded() {
    if (transferring) return;
    const { hero, clone } = elements();
    if (!hero || !clone) return;

    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const cloneReach = Math.max(clone.offsetTop, clone.offsetTop + clone.offsetHeight - innerHeight);
    const trigger = Math.min(maximumScroll, cloneReach) - 2;
    if (scrollY < trigger) return;

    transferring = true;
    const maximumRelative = Math.max(0, clone.offsetHeight - innerHeight);
    const relative = Math.max(0, Math.min(maximumRelative, scrollY - clone.offsetTop));
    root.classList.add('fx-three-loop-transfer');

    requestAnimationFrame(() => {
      scrollTo(0, hero.offsetTop + relative);
      const count = Number(root.dataset.fxLoopCount || 0) + 1;
      root.dataset.fxLoopCount = String(count);

      requestAnimationFrame(() => {
        root.classList.remove('fx-three-loop-transfer');
        transferring = false;
        dispatchEvent(new CustomEvent('formatx:loop', { detail: { count } }));
      });
    });
  }

  addEventListener('scroll', transferIfNeeded, { passive: true });
  addEventListener('resize', transferIfNeeded, { passive: true });
  addEventListener('pageshow', transferIfNeeded, { passive: true });
}());
