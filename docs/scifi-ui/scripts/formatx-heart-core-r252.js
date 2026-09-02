(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'heart-core-r252';
  const STYLE = '/scifi-ui/styles/formatx-heart-core-r252.css?v=20260901-r524-visible-surface-owner';
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

  function protectedSurfaceTarget(target) {
    return target instanceof Element && Boolean(target.closest(
      '.fx-reference-controls-r204,.fx-reference-mag-button,.fx-language-toggle,#menu-toggle,#main-nav,a[href],input,select,textarea,[contenteditable="true"]'
    ));
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

    if (space.dataset.fxHeartSurfaceBoundR524 !== 'true') {
      space.dataset.fxHeartSurfaceBoundR524 = 'true';
      space.addEventListener('click', event => {
        if (!event.isTrusted || protectedSurfaceTarget(event.target)) return;
        activateCore('surface');
      });
    }

    const headerMag = document.querySelector('.fx-reference-mag-button');
    if (headerMag instanceof HTMLButtonElement && headerMag.dataset.fxHeartBoundR252 !== 'true') {
      headerMag.dataset.fxHeartBoundR252 = 'true';
      headerMag.addEventListener('click', () => activateCore('header'));
    }

    root.dataset.fxMagHeartHit = 'ready-r524-visible-surface-owner';
    return true;
  }

  function scheduleBinding() {
    if (bindingFrame) return;
    bindingFrame = requestAnimationFrame(() => {
      bindingFrame = 0;
      installHeartHitTarget();
      syncPureWebglComposition();
    });
  }

  function boot() {
    ensureStyle();
    root.dataset.fxHeartCoreR252 = 'ready';
    root.dataset.fxHeartLoopPolicy = 'seamless-v7-single-owner-interaction-only';
    root.dataset.fxHeartScrollOwner = 'retired-r508-seamless-v7';
    root.dataset.fxHeartPointerOwnerR524 = 'visible-mag-surface-plus-semantic-keyboard-target';
    installHeartHitTarget();
    syncPureWebglComposition();

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
    cancelAnimationFrame(bindingFrame);
  }, { once: true });
}());