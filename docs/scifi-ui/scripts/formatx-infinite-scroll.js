(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteScroll === 'ready-v4') return;

  root.dataset.fxInfiniteScroll = 'loading-v4';
  root.dataset.fxInfiniteController = 'boundary-v4';
  root.dataset.fxInfiniteCloneMode = 'none';
  root.dataset.fxInfiniteInput = 'idle';
  root.dataset.fxScrollActivity = 'idle';

  const TOP_SELECTOR = '#hero';
  const BOTTOM_SELECTOR = '#resources';
  const WHEEL_THRESHOLD = 110;
  const WHEEL_CAPTURE_PX = 96;
  const TOUCH_THRESHOLD = 62;
  const BOUNDARY_EPSILON = 12;
  const COOLDOWN_MS = 280;
  const NATIVE_LOOP_DELAY_MS = 180;
  const ACTIVITY_IDLE_MS = 140;
  const WHEEL_INTENT_IDLE_MS = 220;
  const DOWN_KEYS = new Set(['ArrowDown', 'PageDown', 'End', ' ']);
  const UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

  let looping = false;
  let cooldownUntil = 0;
  let loopCount = Number(
    root.dataset.fxLoopCount || root.dataset.fxInfiniteLoopCount || 0
  );
  let wheelDown = 0;
  let wheelUp = 0;
  let wheelIntentTimer = 0;
  let touchStartY = null;
  let lastExplicitInputAt = 0;
  let nativeLoopQueued = false;
  let activityTimer = 0;
  let scrollFrame = 0;
  let intentFrame = 0;
  let publishedBoundary = '';

  root.dataset.fxScrollScheduler = 'raf-coalesced-v1';

  function topNode() {
    return document.querySelector(TOP_SELECTOR);
  }

  function bottomNode() {
    return document.querySelector(BOTTOM_SELECTOR);
  }

  function documentEnd() {
    return Math.max(0, document.documentElement.scrollHeight - innerHeight);
  }

  function distanceFromBottom() {
    return Math.max(0, documentEnd() - scrollY);
  }

  function nearTop() {
    return scrollY <= BOUNDARY_EPSILON;
  }

  function nearBottom() {
    return distanceFromBottom() <= BOUNDARY_EPSILON;
  }

  function withinWheelTopZone() {
    return scrollY <= WHEEL_CAPTURE_PX;
  }

  function withinWheelBottomZone() {
    return distanceFromBottom() <= WHEEL_CAPTURE_PX;
  }

  function dialogueOpen() {
    const dialogue = document.querySelector('.fx-organism-dialogue');
    return Boolean(
      dialogue
      && !dialogue.hidden
      && dialogue.classList.contains('is-open')
      && getComputedStyle(dialogue).display !== 'none'
    );
  }

  function nestedScrollerCanConsume(target, deltaY) {
    if (!(target instanceof Element)) return false;
    const scroller = target.closest(
      '.fx-organism-console-viewport, .fx-organism-panel, .fx-organism-dialogue, '
      + '[data-scroll-container], [data-organism-panel]'
    );
    if (!(scroller instanceof HTMLElement)) return false;
    const maximum = scroller.scrollHeight - scroller.clientHeight;
    if (maximum <= 1) return false;
    if (deltaY > 0) return scroller.scrollTop < maximum - 1;
    if (deltaY < 0) return scroller.scrollTop > 1;
    return true;
  }

  function ignoredTarget(target) {
    return target instanceof Element && Boolean(target.closest(
      'input, textarea, select, [contenteditable="true"]'
    ));
  }

  function markActivity() {
    if (root.dataset.fxScrollActivity !== 'scrolling') {
      root.dataset.fxScrollActivity = 'scrolling';
      root.classList.add('fx-page-scrolling');
    }
    clearTimeout(activityTimer);
    activityTimer = window.setTimeout(() => {
      if (!looping) markIdle();
    }, ACTIVITY_IDLE_MS);
  }

  function markIdle() {
    clearTimeout(activityTimer);
    if (root.dataset.fxScrollActivity !== 'idle') {
      root.dataset.fxScrollActivity = 'idle';
      root.classList.remove('fx-page-scrolling');
    }
  }

  function resetWheelIntent() {
    clearTimeout(wheelIntentTimer);
    wheelDown = 0;
    wheelUp = 0;
  }

  function keepWheelIntentAlive() {
    clearTimeout(wheelIntentTimer);
    wheelIntentTimer = window.setTimeout(resetWheelIntent, WHEEL_INTENT_IDLE_MS);
  }

  function publishReadyState() {
    root.dataset.fxInfiniteScroll = 'ready-v4';
    root.dataset.fxInfiniteController = 'boundary-v4';
    root.dataset.fxInfiniteCloneMode = 'none';
    root.dataset.fxInfiniteLoopCount = String(loopCount);
    root.dataset.fxLoopCount = String(loopCount);
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: 'boundary-v4',
      clonedContent: false,
      reinitialisedRenderer: false,
      loopCount
    });
  }

  function publishLoop(direction, source, target) {
    root.dataset.fxInfiniteLast = direction;
    root.dataset.fxInfiniteLoopCount = String(loopCount);
    root.dataset.fxLoopCount = String(loopCount);
    root.dataset.fxLoopSource = source;
    root.dataset.fxLoopTarget = String(target);
    root.dataset.fxInfiniteBoundary = direction === 'down' ? 'top' : 'bottom';
  }

  function queueNativeBottomLoop() {
    if (
      nativeLoopQueued
      || looping
      || dialogueOpen()
      || performance.now() < cooldownUntil
      || performance.now() - lastExplicitInputAt < NATIVE_LOOP_DELAY_MS
    ) return;

    nativeLoopQueued = true;
    requestAnimationFrame(() => {
      nativeLoopQueued = false;
      if (
        nearBottom()
        && !looping
        && performance.now() - lastExplicitInputAt >= NATIVE_LOOP_DELAY_MS
      ) {
        void performLoop('down', 'native-scroll');
      }
    });
  }

  function finishWheelIntentAtBoundary() {
    if (looping || performance.now() < cooldownUntil) return;
    if (wheelDown >= WHEEL_THRESHOLD && withinWheelBottomZone()) {
      void performLoop('down', 'wheel');
    } else if (wheelUp >= WHEEL_THRESHOLD && withinWheelTopZone()) {
      void performLoop('up', 'wheel');
    }
  }

  function queueWheelIntentCheck() {
    if (intentFrame) return;
    intentFrame = requestAnimationFrame(() => {
      intentFrame = 0;
      finishWheelIntentAtBoundary();
    });
  }

  function publishScrollPosition() {
    scrollFrame = 0;
    const boundary = nearTop()
      ? 'top'
      : nearBottom()
        ? 'bottom'
        : 'middle';
    if (boundary !== publishedBoundary) {
      publishedBoundary = boundary;
      root.dataset.fxInfiniteBoundary = boundary;
    }
    markActivity();
    queueWheelIntentCheck();
    if (nearBottom()) queueNativeBottomLoop();
  }

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(publishScrollPosition);
  }

  function replaceHash(direction) {
    const hash = direction === 'down' ? '#hero' : '#resources';
    const next = location.pathname + location.search + hash;
    if (location.pathname + location.search + location.hash !== next) {
      history.replaceState({}, '', next);
    }
  }

  async function settleAt(target) {
    window.scrollTo(0, target);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (Math.abs(scrollY - target) > 1) window.scrollTo(0, target);
  }

  async function performLoop(direction, source) {
    if (looping || performance.now() < cooldownUntil || dialogueOpen()) return false;
    const top = topNode();
    const bottom = bottomNode();
    if (!top || !bottom) return false;

    const target = direction === 'down' ? 0 : documentEnd();
    looping = true;
    root.dataset.fxInfiniteInput = 'looping';
    root.dataset.fxInfiniteSource = source || 'unknown';
    root.classList.add('fx-infinite-loop-jump');
    markActivity();
    replaceHash(direction);

    await settleAt(target);

    loopCount += 1;
    publishLoop(direction, source || 'unknown', target);

    dispatchEvent(new CustomEvent('formatx:loop', {
      detail: {
        direction,
        target,
        source: source || 'unknown',
        continuous: true,
        clonedContent: false,
        reinitialisedRenderer: false,
        loopCount
      }
    }));

    await new Promise(resolve => requestAnimationFrame(resolve));
    if (Math.abs(scrollY - target) > 1) window.scrollTo(0, target);
    root.classList.remove('fx-infinite-loop-jump');
    root.dataset.fxInfiniteInput = 'idle';
    publishReadyState();
    looping = false;
    cooldownUntil = performance.now() + COOLDOWN_MS;
    resetWheelIntent();
    markIdle();
    return true;
  }

  function handleWheel(event) {
    lastExplicitInputAt = performance.now();
    if (
      looping
      || performance.now() < cooldownUntil
      || ignoredTarget(event.target)
      || dialogueOpen()
      || nestedScrollerCanConsume(event.target, event.deltaY)
    ) return;

    if (event.deltaY > 0) {
      wheelDown += Math.abs(event.deltaY);
      wheelUp = 0;
      keepWheelIntentAlive();
      if (withinWheelBottomZone()) {
        if (event.cancelable) event.preventDefault();
        finishWheelIntentAtBoundary();
      } else {
        queueWheelIntentCheck();
      }
      return;
    }

    if (event.deltaY < 0) {
      wheelUp += Math.abs(event.deltaY);
      wheelDown = 0;
      keepWheelIntentAlive();
      if (withinWheelTopZone()) {
        if (event.cancelable) event.preventDefault();
        finishWheelIntentAtBoundary();
      } else {
        queueWheelIntentCheck();
      }
    }
  }

  function handleKey(event) {
    if (
      event.altKey
      || event.ctrlKey
      || event.metaKey
      || ignoredTarget(event.target)
      || dialogueOpen()
    ) return;

    if (DOWN_KEYS.has(event.key) && nearBottom()) {
      lastExplicitInputAt = performance.now();
      event.preventDefault();
      void performLoop('down', 'keyboard');
      return;
    }

    if (UP_KEYS.has(event.key) && nearTop()) {
      lastExplicitInputAt = performance.now();
      event.preventDefault();
      void performLoop('up', 'keyboard');
    }
  }

  function handleTouchStart(event) {
    lastExplicitInputAt = performance.now();
    if (ignoredTarget(event.target) || dialogueOpen()) return;
    touchStartY = event.touches?.[0]?.clientY ?? null;
  }

  function handleTouchEnd(event) {
    if (touchStartY == null || looping || performance.now() < cooldownUntil) {
      touchStartY = null;
      return;
    }
    const endY = event.changedTouches?.[0]?.clientY;
    if (!Number.isFinite(endY)) {
      touchStartY = null;
      return;
    }
    const delta = touchStartY - endY;
    touchStartY = null;
    if (nestedScrollerCanConsume(event.target, delta)) return;
    if (delta >= TOUCH_THRESHOLD && nearBottom()) void performLoop('down', 'touch');
    else if (delta <= -TOUCH_THRESHOLD && nearTop()) void performLoop('up', 'touch');
  }

  addEventListener('wheel', handleWheel, { passive: false, capture: true });
  addEventListener('keydown', handleKey, { capture: true });
  addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
  addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('pageshow', () => {
    root.dataset.fxInfiniteInput = 'idle';
    onScroll();
    publishReadyState();
  });

  const loopNote = document.querySelector('.loop-note');
  if (loopNote) {
    loopNote.setAttribute('tabindex', '0');
    loopNote.setAttribute('role', 'button');
    loopNote.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      lastExplicitInputAt = performance.now();
      event.preventDefault();
      void performLoop('down', 'loop-note');
    });
  }

  onScroll();
  markIdle();
  publishReadyState();
}());
