(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteController === 'authoritative-wheel-v2') return;

  root.dataset.fxInfiniteFix = 'ready-v2';
  root.dataset.fxInfiniteController = 'authoritative-wheel-v2';
  root.dataset.fxInfiniteInput = 'idle';
  root.dataset.fxAudioLabelFix = 'v2';

  let transferring = false;
  let settleFrame = 0;
  let precisionTimer = 0;
  let lastScrollY = scrollY;
  let lastDirection = 0;
  let cooldownUntil = 0;

  function elements() {
    return {
      hero: document.getElementById('hero'),
      clone: document.querySelector('[data-fx-loop-bridge="true"]')
    };
  }

  function pageTop(element) {
    return element.getBoundingClientRect().top + scrollY;
  }

  function metrics(hero, clone) {
    const heroTop = pageTop(hero);
    const cloneTop = pageTop(clone);
    const heroHeight = Math.max(1, hero.getBoundingClientRect().height || hero.offsetHeight);
    const cloneHeight = Math.max(1, clone.getBoundingClientRect().height || clone.offsetHeight);
    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const cloneTravel = Math.max(0, cloneHeight - innerHeight);
    const handoffOffset = cloneTravel * 0.58;
    const trigger = Math.min(maximumScroll - 1, cloneTop + handoffOffset);

    return {
      heroTop,
      cloneTop,
      heroHeight,
      cloneHeight,
      maximumScroll,
      trigger
    };
  }

  function normalizeWheel(event) {
    const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? innerHeight
        : 1;
    return event.deltaY * multiplier;
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

  function markPrecisionInput() {
    root.classList.add('fx-precision-wheel');
    root.dataset.fxInfiniteInput = 'wheel';
    clearTimeout(precisionTimer);
    precisionTimer = window.setTimeout(() => {
      root.classList.remove('fx-precision-wheel');
      if (!transferring) root.dataset.fxInfiniteInput = 'idle';
    }, 280);
  }

  function settleTransfer(target, count, source, attempt) {
    cancelAnimationFrame(settleFrame);
    settleFrame = requestAnimationFrame(() => {
      const difference = Math.abs(scrollY - target);
      if (difference > 1.5 && attempt < 5) {
        scrollTo(0, target);
        settleTransfer(target, count, source, attempt + 1);
        return;
      }

      root.dataset.fxLoopCount = String(count);
      root.dataset.fxLoopSource = source;
      root.dataset.fxLoopTarget = String(Math.round(target));
      root.classList.remove('fx-three-loop-transfer');
      transferring = false;
      settleFrame = 0;
      cooldownUntil = performance.now() + 90;
      lastScrollY = scrollY;

      dispatchEvent(new CustomEvent('formatx:loop', {
        detail: {
          count,
          source,
          controller: 'authoritative-wheel-v2',
          target,
          actual: scrollY
        }
      }));
    });
  }

  function transfer(projectedY, source) {
    if (transferring || performance.now() < cooldownUntil) return false;
    const { hero, clone } = elements();
    if (!hero || !clone) return false;

    const data = metrics(hero, clone);
    const relative = Math.max(0, projectedY - data.cloneTop);
    const target = Math.max(0, Math.min(data.maximumScroll, data.heroTop + relative));
    const baseline = Number(root.dataset.fxLoopCount || 0);

    transferring = true;
    root.dataset.fxInfiniteInput = source;
    root.classList.add('fx-three-loop-transfer');

    requestAnimationFrame(() => {
      scrollTo(0, target);
      settleTransfer(target, baseline + 1, source, 0);
    });
    return true;
  }

  function onWheel(event) {
    if (event.ctrlKey || event.defaultPrevented) return;
    const deltaY = normalizeWheel(event);
    if (!Number.isFinite(deltaY) || deltaY <= 0 || Math.abs(deltaY) <= Math.abs(event.deltaX)) return;
    if (nestedScrollerCanConsume(event.target, deltaY)) return;

    markPrecisionInput();

    const { hero, clone } = elements();
    if (!hero || !clone || transferring) return;
    const data = metrics(hero, clone);
    const projectedY = scrollY + deltaY;
    if (projectedY < data.trigger) return;

    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    transfer(projectedY, 'wheel');
  }

  function onScroll() {
    const current = scrollY;
    const delta = current - lastScrollY;
    if (Math.abs(delta) > 0.5) lastDirection = Math.sign(delta);
    lastScrollY = current;

    if (transferring || lastDirection <= 0 || performance.now() < cooldownUntil) return;
    const { hero, clone } = elements();
    if (!hero || !clone) return;
    const data = metrics(hero, clone);
    if (current < data.trigger) return;

    transfer(current, root.classList.contains('fx-precision-wheel') ? 'wheel-scroll' : 'scroll');
  }

  function syncAudioActionLabel() {
    const button = document.querySelector('.fx-three-sound');
    const label = button?.querySelector('span');
    if (!button || !label) return;

    const state = button.dataset.fxAudioState || root.dataset.fxAudioState || 'off';
    const english = root.lang === 'en';
    let nextLabel;
    let nextAria;

    if (state === 'pending') {
      nextLabel = english ? 'STARTING…' : 'INDÍTÁS…';
      nextAria = english ? 'Starting the cinematic score' : 'Filmes zene indítása';
    } else if (state === 'blocked') {
      nextLabel = english ? 'TAP AGAIN' : 'KOPPINTS ÚJRA';
      nextAria = english ? 'Tap again to enable the cinematic score' : 'Koppints újra a filmes zene bekapcsolásához';
    } else if (state === 'on') {
      nextLabel = english ? 'MUSIC OFF' : 'ZENE KI';
      nextAria = english ? 'Disable the cinematic score' : 'Filmes zene kikapcsolása';
    } else {
      nextLabel = english ? 'MUSIC ON' : 'ZENE BE';
      nextAria = english ? 'Enable the cinematic score' : 'Filmes zene bekapcsolása';
    }

    if (label.textContent !== nextLabel) label.textContent = nextLabel;
    if (button.getAttribute('aria-label') !== nextAria) button.setAttribute('aria-label', nextAria);
  }

  function loadStyle() {
    if (document.querySelector('link[data-fx-infinite-v2-style]')) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = './styles/formatx-infinite-loop-v2.css?v=20260728-loop-v2';
    style.dataset.fxInfiniteV2Style = 'true';
    document.head.appendChild(style);
  }

  function loadScriptOnce(attribute, source, successKey) {
    if (document.querySelector('script[' + attribute + ']')) return;
    const script = document.createElement('script');
    script.src = source;
    script.async = false;
    script.setAttribute(attribute, 'true');
    script.addEventListener('load', () => { root.dataset[successKey] = 'ready'; }, { once: true });
    script.addEventListener('error', () => { root.dataset[successKey] = 'error'; }, { once: true });
    document.head.appendChild(script);
  }

  function loadDependentLayers() {
    loadScriptOnce('data-fx-category-deck-stabilizer', './scripts/formatx-category-deck-stabilizer.js?v=20260728-category-deck-v1', 'fxCategoryDeckStabilizerLayer');
    loadScriptOnce('data-fx-origin-proof-script', './scripts/formatx-origin-proof.js?v=20260728-origin-proof-v1', 'fxOriginProofLayer');
    loadScriptOnce('data-fx-simulator-entry-script', './scripts/project-simulator-entry.js?v=20260728-operational-twin-1', 'fxSimulatorEntryLayer');
  }

  function loadCategoryLayer() {
    if (!document.querySelector('link[data-fx-category-style]')) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = './styles/formatx-category-positioning.css?v=20260728-category-v1';
      style.dataset.fxCategoryStyle = 'true';
      document.head.appendChild(style);
    }

    const existing = document.querySelector('script[data-fx-category-script]');
    if (existing) {
      loadDependentLayers();
      return;
    }

    const script = document.createElement('script');
    script.src = './scripts/formatx-category-positioning.js?v=20260728-category-v1';
    script.async = false;
    script.dataset.fxCategoryScript = 'true';
    script.addEventListener('load', () => {
      root.dataset.fxCategoryLayer = 'ready';
      loadDependentLayers();
    }, { once: true });
    script.addEventListener('error', () => {
      root.dataset.fxCategoryLayer = 'error';
      loadDependentLayers();
    }, { once: true });
    document.head.appendChild(script);
  }

  const audioLabelObserver = new MutationObserver(syncAudioActionLabel);
  audioLabelObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-state', 'data-fx-audio-level', 'lang'],
    childList: true,
    subtree: true
  });

  loadStyle();
  addEventListener('wheel', onWheel, { capture: true, passive: false });
  addEventListener('scroll', onScroll, { capture: true, passive: true });
  addEventListener('pageshow', () => {
    lastScrollY = scrollY;
    syncAudioActionLabel();
    loadCategoryLayer();
  }, { passive: true });
  addEventListener('formatx:languagechange', syncAudioActionLabel);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('.fx-three-sound')) queueMicrotask(syncAudioActionLabel);
  }, true);

  syncAudioActionLabel();
  loadCategoryLayer();

  addEventListener('pagehide', () => {
    cancelAnimationFrame(settleFrame);
    clearTimeout(precisionTimer);
    audioLabelObserver.disconnect();
  }, { once: true });
}());
