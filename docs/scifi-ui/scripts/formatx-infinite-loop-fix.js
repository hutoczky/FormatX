(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInfiniteFix === 'ready') return;
  root.dataset.fxInfiniteFix = 'ready';
  root.dataset.fxInfiniteController = 'authoritative';
  root.dataset.fxAudioLabelFix = 'v1';

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

  function loadCategoryLayer() {
    if (!document.querySelector('link[data-fx-category-style]')) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = './styles/formatx-category-positioning.css?v=20260728-category-v1';
      style.dataset.fxCategoryStyle = 'true';
      document.head.appendChild(style);
    }
    if (!document.querySelector('script[data-fx-category-script]')) {
      const script = document.createElement('script');
      script.src = './scripts/formatx-category-positioning.js?v=20260728-category-v1';
      script.async = false;
      script.dataset.fxCategoryScript = 'true';
      script.addEventListener('load', () => {
        root.dataset.fxCategoryLayer = 'ready';
      }, { once: true });
      script.addEventListener('error', () => {
        root.dataset.fxCategoryLayer = 'error';
      }, { once: true });
      document.head.appendChild(script);
    }
  }

  const audioLabelObserver = new MutationObserver(syncAudioActionLabel);
  audioLabelObserver.observe(root, {
    attributes: true,
    attributeFilter: ['data-fx-audio-state', 'data-fx-audio-level', 'lang'],
    childList: true,
    subtree: true
  });

  addEventListener('scroll', transferAtBoundary, { capture: true, passive: true });
  addEventListener('resize', transferAtBoundary, { capture: true, passive: true });
  addEventListener('pageshow', () => {
    transferAtBoundary();
    syncAudioActionLabel();
    loadCategoryLayer();
  }, { passive: true });
  addEventListener('formatx:languagechange', syncAudioActionLabel);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('.fx-three-sound')) {
      queueMicrotask(syncAudioActionLabel);
    }
  }, true);

  syncAudioActionLabel();
  loadCategoryLayer();

  addEventListener('pagehide', () => {
    cancelAnimationFrame(settleFrame);
    audioLabelObserver.disconnect();
  }, { once: true });
}());