(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteScroll === 'ready-v4') return;

  root.dataset.fxInfiniteScroll = 'loading-v4';
  root.dataset.fxInfiniteController = 'boundary-v4';
  root.dataset.fxInfiniteCloneMode = 'none';
  root.dataset.fxInfiniteInput = 'idle';

  const TOP_SELECTOR = '#hero';
  const BOTTOM_SELECTOR = '#resources';
  const WHEEL_THRESHOLD = 110;
  const TOUCH_THRESHOLD = 62;
  const BOUNDARY_EPSILON = 12;
  const COOLDOWN_MS = 360;
  const SETTLE_MS = 320;
  const DOWN_KEYS = new Set(['ArrowDown', 'PageDown', 'End', ' ']);
  const UP_KEYS = new Set(['ArrowUp', 'PageUp', 'Home']);

  let looping = false;
  let cooldownUntil = 0;
  let loopCount = Number(root.dataset.fxInfiniteLoopCount || 0);
  let wheelDown = 0;
  let wheelUp = 0;
  let touchStartY = null;

  function topNode() {
    return document.querySelector(TOP_SELECTOR);
  }

  function bottomNode() {
    return document.querySelector(BOTTOM_SELECTOR);
  }

  function documentEnd() {
    return Math.max(0, document.documentElement.scrollHeight - innerHeight);
  }

  function nearTop() {
    return scrollY <= BOUNDARY_EPSILON;
  }

  function nearBottom() {
    return documentEnd() - scrollY <= BOUNDARY_EPSILON;
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
    const max = scroller.scrollHeight - scroller.clientHeight;
    if (max <= 1) return false;
    if (deltaY > 0) return scroller.scrollTop < max - 1;
    if (deltaY < 0) return scroller.scrollTop > 1;
    return true;
  }

  function ignoredTarget(target) {
    return target instanceof Element && Boolean(target.closest(
      'input, textarea, select, button, [contenteditable="true"], '
      + '.fx-organism-console, .fx-organism-panel, .fx-organism-dialogue'
    ));
  }

  function publishReadyState() {
    root.dataset.fxInfiniteScroll = 'ready-v4';
    root.dataset.fxInfiniteController = 'boundary-v4';
    root.dataset.fxInfiniteCloneMode = 'none';
    root.dataset.fxInfiniteLoopCount = String(loopCount);
    root.__FORMATX_INFINITE_SCROLL__ = Object.freeze({
      version: 'boundary-v4',
      clonedContent: false,
      reinitialisedRenderer: false,
      loopCount
    });
  }

  function onScroll() {
    root.dataset.fxInfiniteBoundary = nearTop()
      ? 'top'
      : nearBottom()
        ? 'bottom'
        : 'middle';
  }

  function replaceHash(direction) {
    const hash = direction === 'down' ? '#hero' : '#resources';
    const next = location.pathname + location.search + hash;
    if (location.pathname + location.search + location.hash !== next) {
      history.replaceState({}, '', next);
    }
  }

  async function settleAt(target) {
    const deadline = performance.now() + SETTLE_MS;
    while (performance.now() < deadline) {
      window.scrollTo(0, target);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    window.scrollTo(0, target);
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
    replaceHash(direction);

    await settleAt(target);

    loopCount += 1;
    root.dataset.fxInfiniteLast = direction;
    root.dataset.fxInfiniteLoopCount = String(loopCount);
    root.dataset.fxInfiniteBoundary = direction === 'down' ? 'top' : 'bottom';

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

    await settleAt(target);
    root.classList.remove('fx-infinite-loop-jump');
    root.dataset.fxInfiniteInput = 'idle';
    publishReadyState();
    looping = false;
    cooldownUntil = performance.now() + COOLDOWN_MS;
    wheelDown = 0;
    wheelUp = 0;
    return true;
  }

  function handleWheel(event) {
    if (
      looping
      || performance.now() < cooldownUntil
      || ignoredTarget(event.target)
      || dialogueOpen()
      || nestedScrollerCanConsume(event.target, event.deltaY)
    ) return;

    if (event.deltaY > 0 && nearBottom()) {
      wheelDown += Math.abs(event.deltaY);
      wheelUp = 0;
      if (event.cancelable) event.preventDefault();
      if (wheelDown >= WHEEL_THRESHOLD) void performLoop('down', 'wheel');
      return;
    }

    if (event.deltaY < 0 && nearTop()) {
      wheelUp += Math.abs(event.deltaY);
      wheelDown = 0;
      if (event.cancelable) event.preventDefault();
      if (wheelUp >= WHEEL_THRESHOLD) void performLoop('up', 'wheel');
      return;
    }

    wheelDown = 0;
    wheelUp = 0;
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
      event.preventDefault();
      void performLoop('down', 'keyboard');
      return;
    }

    if (UP_KEYS.has(event.key) && nearTop()) {
      event.preventDefault();
      void performLoop('up', 'keyboard');
    }
  }

  function handleTouchStart(event) {
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
      event.preventDefault();
      void performLoop('down', 'loop-note');
    });
  }

  onScroll();
  publishReadyState();
}());
