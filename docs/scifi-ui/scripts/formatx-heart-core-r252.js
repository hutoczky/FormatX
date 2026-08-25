(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'heart-core-r252';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const STYLE = '/scifi-ui/styles/formatx-heart-core-r252.css?v=20260825-r252-controls';
  const LOOP_OVERSHOOT = 28;
  let touchActive = false;
  let idleTimer = 0;
  let bindingFrame = 0;
  let interactionCooldown = false;

  if (root.dataset.fxHeartCoreR252 === 'ready') return;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-heart-core-r252]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE;
    link.dataset.fxHeartCoreR252 = 'true';
    document.head.appendChild(link);
  }

  function syncPureWebglComposition() {
    const renderer = root.dataset.fxCoreRenderer || '';
    const real3d = root.dataset.fxCoreReal3d || '';
    if (!/webgl|mechanical-orb/i.test(renderer) || !/ready|visible|webgl/i.test(real3d)) return false;
    root.dataset.fxCoreCompositionR285 = 'pure-webgl3d-no-2d-overlays';
    root.dataset.fxCoreCompositionRevisionR252 = 'native-mechanical-orb-r250-no-2d-overlays';
    return true;
  }

  function closeConflictingUi() {
    root.classList.remove('fx-organism-menu-open');
    const nav = document.getElementById('main-nav');
    nav?.classList.remove('open');
    document.getElementById('menu-toggle')?.setAttribute('aria-expanded', 'false');
  }

  function activateCore(source) {
    if (interactionCooldown) return;
    interactionCooldown = true;
    setTimeout(() => { interactionCooldown = false; }, 240);

    closeConflictingUi();
    root.dataset.fxImmersive = 'active';
    root.dataset.fxCoreInteractionMode = 'active-r252';
    root.dataset.fxCoreInteractionSource = source;

    window.FormatXCoreMobileV69?.pulse?.({ phase: 'activate', source });
    dispatchEvent(new CustomEvent('formatx:coreinteraction', {
      detail: { phase: 'activate', source, x: 0, y: 0, revision: VERSION }
    }));
    dispatchEvent(new CustomEvent('formatx:immersiveactivate', {
      detail: { source: `mag-${source}-r252` }
    }));

    const hit = document.querySelector('.fx-mag-heart-hit-r252');
    if (hit instanceof HTMLElement) {
      hit.dataset.fxHeartActive = 'true';
      setTimeout(() => { if (hit.isConnected) delete hit.dataset.fxHeartActive; }, 720);
    }

    queueMicrotask(() => {
      if (window.FormatXOrganismVoice?.open) {
        window.FormatXOrganismVoice.open();
        root.dataset.fxCoreInteractionTarget = 'organism-voice';
        return;
      }
      const ask = document.querySelector('.fx-reference-ask');
      if (ask instanceof HTMLButtonElement) {
        ask.click();
        root.dataset.fxCoreInteractionTarget = 'ask-control';
        return;
      }
      const thought = document.querySelector('.fx-organism-thought-trigger');
      if (thought instanceof HTMLElement) {
        thought.click();
        root.dataset.fxCoreInteractionTarget = 'thought-trigger';
      }
    });
  }

  function installHeartHitTarget() {
    const hero = document.getElementById('hero');
    const space = hero?.querySelector(':scope .hero-space');
    if (!(hero instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    let hit = space.querySelector(':scope > .fx-mag-heart-hit-r252');
    if (!(hit instanceof HTMLButtonElement)) {
      hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'fx-mag-heart-hit-r252';
      hit.dataset.fxHeartCoreR252 = 'true';
      space.appendChild(hit);
    }

    hit.setAttribute('aria-label', language() === 'en'
      ? 'Activate the living FormatX core'
      : 'A FormatX élő MAG interakciójának indítása');
    hit.title = language() === 'en' ? 'Interact with the living core' : 'Interakció az élő MAG-gal';

    if (hit.dataset.fxHeartBound !== 'true') {
      hit.dataset.fxHeartBound = 'true';
      hit.addEventListener('click', event => {
        event.preventDefault();
        activateCore('core');
      });
      hit.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activateCore('keyboard');
      });
    }

    const headerMag = document.querySelector('.fx-reference-mag-button');
    if (headerMag instanceof HTMLButtonElement && headerMag.dataset.fxHeartBoundR252 !== 'true') {
      headerMag.dataset.fxHeartBoundR252 = 'true';
      headerMag.addEventListener('click', () => activateCore('header'));
    }

    root.dataset.fxMagHeartHit = 'ready-r252';
    return true;
  }

  function pruneMobileReferenceMirror() {
    if (!MOBILE_QUERY.matches) return;
    const bridge = document.querySelector('.fx-loop-bridge');
    if (!(bridge instanceof HTMLElement)) return;
    bridge.dataset.fxHeartLoopR252 = 'true';
    bridge.querySelectorAll(':scope > .fx-loop-reference-mirror, :scope > [data-fx-loop-mirror]').forEach(node => node.remove());
    root.dataset.fxLoopMirrorMode = 'none-mobile-r252';
  }

  function scheduleBinding() {
    if (bindingFrame) return;
    bindingFrame = requestAnimationFrame(() => {
      bindingFrame = 0;
      installHeartHitTarget();
      pruneMobileReferenceMirror();
      syncPureWebglComposition();
    });
  }

  function mobileLoopBoundary() {
    if (!MOBILE_QUERY.matches) return null;
    pruneMobileReferenceMirror();
    const footer = document.querySelector('body > .site-footer');
    const bridge = document.querySelector('.fx-loop-bridge');
    const hero = document.querySelector('#main-content > #hero');
    if (!(footer instanceof HTMLElement) || !(bridge instanceof HTMLElement) || !(hero instanceof HTMLElement)) return null;

    bridge.dataset.fxHeartLoopR252 = 'true';
    const bridgeTop = bridge.offsetTop;
    const viewportBottom = scrollY + innerHeight;
    return {
      bridge,
      hero,
      bridgeTop,
      overshoot: viewportBottom - bridgeTop
    };
  }

  function transferToRealCore(source) {
    if (!MOBILE_QUERY.matches || touchActive) return false;
    const boundary = mobileLoopBoundary();
    if (!boundary || boundary.overshoot < LOOP_OVERSHOOT) return false;

    const target = Math.max(0, boundary.hero.offsetTop);
    const nextLoopCount = Number(root.dataset.fxLoopCount || 0) + 1;
    root.classList.add('fx-seamless-loop-transfer');
    root.dataset.fxHeartLoopTransfer = source;
    root.dataset.fxInfiniteInput = 'heart-core-transfer';
    root.dataset.fxLoopCount = String(nextLoopCount);
    root.dataset.fxLoopSource = `heart-core-${source}`;
    root.dataset.fxLoopLanding = String(Math.round(target));
    root.dataset.fxLoopLandingState = 'heart-core-stabilising';

    window.scrollTo({ top: target, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: target, left: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        root.classList.remove('fx-seamless-loop-transfer');
        root.dataset.fxInfiniteInput = 'native';
        root.dataset.fxLoopLandingState = 'heart-core-settled';
        window.FormatXCoreMobileV69?.pulse?.({ phase: 'loop-return', source });
        dispatchEvent(new CustomEvent('formatx:loop', {
          detail: { count: nextLoopCount, source: `heart-core-${source}`, relative: 0, revision: VERSION }
        }));
      });
    });
    return true;
  }

  function onScroll() {
    if (!MOBILE_QUERY.matches) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => transferToRealCore('idle'), 90);
  }

  function onTouchStart() {
    if (!MOBILE_QUERY.matches) return;
    touchActive = true;
    clearTimeout(idleTimer);
  }

  function onTouchEnd() {
    if (!MOBILE_QUERY.matches) return;
    touchActive = false;
    requestAnimationFrame(() => transferToRealCore('touchend'));
  }

  function boot() {
    ensureStyle();
    root.dataset.fxHeartCoreR252 = 'ready';
    root.dataset.fxHeartLoopPolicy = 'footer-to-real-core-no-reference-mirror';
    installHeartHitTarget();
    pruneMobileReferenceMirror();
    syncPureWebglComposition();

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('scrollend', () => transferToRealCore('scrollend'), { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    for (const eventName of [
      'formatx:real3dready',
      'formatx:controlownerready',
      'formatx:mobilelayoutready',
      'formatx:languagechange',
      'formatx:loopgeometryrefresh',
      'pageshow'
    ]) addEventListener(eventName, scheduleBinding, { passive: true });

    addEventListener('formatx:real3dready', syncPureWebglComposition, { passive: true });

    const observer = new MutationObserver(scheduleBinding);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 6500);

    for (const delay of [0, 80, 220, 520, 1100, 2600]) setTimeout(scheduleBinding, delay);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  addEventListener('pagehide', () => {
    clearTimeout(idleTimer);
    cancelAnimationFrame(bindingFrame);
  }, { once: true });
}());
