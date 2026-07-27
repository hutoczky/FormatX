(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteFix === 'ready') return;
  root.dataset.fxInfiniteFix = 'ready';
  root.dataset.fxInfiniteController = 'authoritative';

  let transferring = false;
  let settleFrame = 0;

  function elements() {
    return {
      hero: document.getElementById('hero'),
      clone: document.querySelector('[data-fx-loop-bridge="true"]')
    };
  }

  function metrics(clone) {
    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const cloneReach = Math.max(clone.offsetTop, clone.offsetTop + clone.offsetHeight - innerHeight);
    return {
      maximumScroll,
      trigger: Math.min(maximumScroll, cloneReach) - 2
    };
  }

  function settleTransfer(target, count, attempt) {
    cancelAnimationFrame(settleFrame);
    settleFrame = requestAnimationFrame(() => {
      if (Math.abs(scrollY - target) > 2 && attempt < 5) {
        scrollTo(0, target);
        settleTransfer(target, count, attempt + 1);
        return;
      }

      root.dataset.fxLoopCount = String(count);
      root.classList.remove('fx-three-loop-transfer');
      transferring = false;
      settleFrame = 0;
      dispatchEvent(new CustomEvent('formatx:loop', {
        detail: { count, source: 'authoritative-controller', target, actual: scrollY }
      }));
    });
  }

  function transferAtBoundary(event) {
    const { hero, clone } = elements();
    if (!hero || !clone) return;
    const { trigger } = metrics(clone);
    if (scrollY < trigger) return;

    // This capture-phase handler owns the boundary hand-off. It prevents the
    // older host listener from racing the same scroll event and changing the
    // counter before the viewport has actually returned to the core.
    if (event && typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
    if (transferring) return;

    transferring = true;
    const baseline = Number(root.dataset.fxLoopCount || 0);
    const maximumRelative = Math.max(0, clone.offsetHeight - innerHeight);
    const relative = Math.max(0, Math.min(maximumRelative, scrollY - clone.offsetTop));
    const target = Math.max(0, hero.offsetTop + relative);
    root.classList.add('fx-three-loop-transfer');

    requestAnimationFrame(() => {
      scrollTo(0, target);
      settleTransfer(target, baseline + 1, 0);
    });
  }

  addEventListener('scroll', transferAtBoundary, { capture: true, passive: true });
  addEventListener('resize', transferAtBoundary, { capture: true, passive: true });
  addEventListener('pageshow', transferAtBoundary, { passive: true });
  addEventListener('pagehide', () => cancelAnimationFrame(settleFrame), { once: true });
}());
