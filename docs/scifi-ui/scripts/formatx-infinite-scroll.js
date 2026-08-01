(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteScroll === 'ready-v4') return;

  const BOUNDARY_PX = 28;
  const COOLDOWN_MS = 360;
  const SCROLL_IDLE_MS = 190;
  const DOWN_KEYS = new Set(['ArrowDown', 'PageDown', 'End', ' ']);

  let lastY = window.scrollY;
  let lastDirection = 0;
  let looping = false;
  let cooldownUntil = 0;
  let scrollFrame = 0;
  let settleFrame = 0;
  let scrollIdleTimer = 0;
  let scrolling = false;

  function maximumScroll() {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    return Math.max(0, document.documentElement.scrollHeight - viewportHeight);
  }

  function heroTop() {
    const hero = document.getElementById('hero');
    return hero ? Math.max(0, hero.getBoundingClientRect().top + window.scrollY) : 0;
  }

  function dialogueOpen() {
    return Boolean(document.querySelector('.fx-organism-dialogue.is-open'));
  }

  function overlayOpen() {
    return root.classList.contains('fx-organism-menu-open')
      || document.body?.classList.contains('fx-organism-panel-open')
      || document.getElementById('fx-organism-console')?.classList.contains('is-authorised-open')
      || dialogueOpen();
  }

  function atBoundary(projectedY) {
    const maximum = maximumScroll();
    return maximum > BOUNDARY_PX && projectedY >= maximum - BOUNDARY_PX;
  }

  function nestedScrollerCanConsume(target, deltaY) {
    let element = target instanceof Element ? target : null;
    while (element && element !== document.body && element !== document.documentElement) {
      const style = getComputedStyle(element);
      const scrollable = /(auto|scroll|overlay)/.test(style.overflowY)
        && element.scrollHeight > element.clientHeight + 1;
      if (scrollable) {
        if (deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) return true;
        if (deltaY < 0 && element.scrollTop > 1) return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  function publishReadyState() {
    root.dataset.fxInfinite = 'ready';
    root.dataset.fxInfiniteController = 'boundary-v4';
    root.dataset.fxInfiniteScroll = 'ready-v4';
  }

  function stopScrolling(source) {
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = 0;
    if (!scrolling) return;
    scrolling = false;
    root.classList.remove('fx-page-scrolling');
    root.dataset.fxScrollActivity = 'idle';
    dispatchEvent(new CustomEvent('formatx:pagestopscroll', { detail: { source } }));
  }

  function markScrolling(source) {
    clearTimeout(scrollIdleTimer);
    if (!scrolling) {
      scrolling = true;
      root.classList.add('fx-page-scrolling');
      root.dataset.fxScrollActivity = source;
      dispatchEvent(new CustomEvent('formatx:pagestartscroll', { detail: { source } }));
    } else {
      root.dataset.fxScrollActivity = source;
    }
    scrollIdleTimer = setTimeout(() => stopScrolling(source), SCROLL_IDLE_MS);
  }

  function finishLoop(source, count, target) {
    root.dataset.fxLoopCount = String(count);
    root.dataset.fxLoopSource = source;
    root.dataset.fxLoopTarget = String(Math.round(target));
    window.scrollTo(0, target);
    root.dataset.fxInfiniteInput = 'idle';
    root.classList.remove('fx-infinite-loop-jump');
    looping = false;
    cooldownUntil = performance.now() + COOLDOWN_MS;
    lastY = window.scrollY;
    lastDirection = 0;
    stopScrolling('loop-complete');
    publishReadyState();

    dispatchEvent(new CustomEvent('formatx:loop', {
      detail: {
        count,
        source,
        controller: 'boundary-v4',
        target,
        actual: window.scrollY,
        clonedContent: false,
        reinitialisedRenderer: false
      }
    }));
  }

  function settle(source, count, target, attempt) {
    cancelAnimationFrame(settleFrame);
    settleFrame = requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - target) > 1.5 && attempt < 5) {
        window.scrollTo(0, target);
        settle(source, count, target, attempt + 1);
        return;
      }
      settleFrame = 0;
      finishLoop(source, count, target);
    });
  }

  function loopToCore(source, projectedY = window.scrollY) {
    if (looping || overlayOpen() || performance.now() < cooldownUntil) return false;
    if (!atBoundary(projectedY)) return false;

    looping = true;
    const target = heroTop();
    const count = Number(root.dataset.fxLoopCount || 0) + 1;

    root.dataset.fxInfiniteInput = source;
    root.classList.add('fx-infinite-loop-jump');

    requestAnimationFrame(() => {
      window.scrollTo(0, target);
      settle(source, count, target, 0);
    });
    return true;
  }

  function normaliseWheel(event) {
    const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? window.innerHeight
        : 1;
    return event.deltaY * multiplier;
  }

  function onWheel(event) {
    if (event.ctrlKey || event.defaultPrevented || overlayOpen()) return;
    const deltaY = normaliseWheel(event);
    if (!Number.isFinite(deltaY) || deltaY === 0 || Math.abs(deltaY) <= Math.abs(event.deltaX)) return;
    markScrolling('wheel');
    if (deltaY <= 0 || nestedScrollerCanConsume(event.target, deltaY)) return;

    const projected = window.scrollY + deltaY;
    if (!atBoundary(projected)) return;
    if (loopToCore('wheel', projected) && event.cancelable) event.preventDefault();
  }

  function onScroll() {
    const current = window.scrollY;
    const delta = current - lastY;
    if (Math.abs(delta) > 0.5) {
      lastDirection = Math.sign(delta);
      markScrolling('native-scroll');
    }
    lastY = current;

    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (looping || lastDirection <= 0 || overlayOpen()) return;
      if (atBoundary(window.scrollY)) loopToCore('native-scroll');
    });
  }

  function onKeyDown(event) {
    const target = event.target;
    const typing = target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target?.isContentEditable;
    if (typing || event.altKey || event.ctrlKey || event.metaKey || !DOWN_KEYS.has(event.key)) return;
    if (event.key === ' ' && event.shiftKey) return;
    markScrolling('keyboard');
    if (!atBoundary(window.scrollY)) return;
    if (loopToCore('keyboard')) event.preventDefault();
  }

  const readinessObserver = new MutationObserver(() => {
    if (root.dataset.fxInfinite !== 'ready') root.dataset.fxInfinite = 'ready';
  });
  readinessObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-infinite'] });

  addEventListener('wheel', onWheel, { capture: true, passive: false });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('keydown', onKeyDown, true);
  addEventListener('resize', () => {
    lastY = window.scrollY;
    lastDirection = 0;
  }, { passive: true });
  addEventListener('pageshow', () => {
    lastY = window.scrollY;
    lastDirection = 0;
    looping = false;
    stopScrolling('pageshow');
    root.classList.remove('fx-infinite-loop-jump');
    publishReadyState();
  }, { passive: true });
  addEventListener('pagehide', event => {
    clearTimeout(scrollIdleTimer);
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(settleFrame);
    if (!event.persisted) readinessObserver.disconnect();
  });

  root.dataset.fxInfiniteInput = 'idle';
  root.dataset.fxScrollActivity = 'idle';
  publishReadyState();
}());