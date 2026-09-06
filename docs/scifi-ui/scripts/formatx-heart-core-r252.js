(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'heart-core-r551';
  const MOBILE_QUERY = matchMedia('(max-width: 900px), (pointer: coarse)');
  const STYLE = '/scifi-ui/styles/formatx-heart-core-r252.css?v=20260906-r549-pointer-transparent-router';
  const LOOP_OVERSHOOT = 28;
  const HEART_HIT_Z = '2147482500';
  let touchActive = false;
  let idleTimer = 0;
  let bindingFrame = 0;
  let geometryFrame = 0;
  let interactionCooldown = false;

  if (root.dataset.fxHeartCoreR252 === 'ready') return;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function ensureStyle() {
    const existing = document.querySelector('link[data-fx-heart-core-r252]');
    if (existing instanceof HTMLLinkElement) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE;
    link.dataset.fxHeartCoreR252 = 'true';
    document.head.appendChild(link);
  }

  function ensureStyleAfterFirstPaint() {
    if (root.dataset.fxHeartStyleR551) return;
    root.dataset.fxHeartStyleR551 = 'queued-post-first-paint';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ensureStyle();
      root.dataset.fxHeartStyleR551 = 'requested-post-first-paint';
    }));
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
      detail: { source: `mag-${source}-r551` }
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

  function syncHeartGeometry(hit) {
    if (!(hit instanceof HTMLButtonElement)) return false;
    const hero = document.getElementById('hero');
    const space = hero?.querySelector(':scope .hero-space');
    const stage = space?.querySelector(':scope > .fx-crystal-organism-r326-stage');
    const target = stage instanceof HTMLElement && stage.getBoundingClientRect().width > 80 ? stage : space;
    if (!(target instanceof HTMLElement)) return false;

    const rect = target.getBoundingClientRect();
    const visible = !document.hidden
      && rect.width > 80
      && rect.height > 120
      && rect.bottom > 0
      && rect.top < innerHeight
      && rect.right > 0
      && rect.left < innerWidth;

    if (!visible) {
      hit.style.visibility = 'hidden';
      hit.style.setProperty('pointer-events', 'none', 'important');
      hit.setAttribute('aria-hidden', 'true');
      root.dataset.fxMagHeartHitGeometryR542 = 'offscreen-suspended';
      return true;
    }

    const base = Math.min(rect.width, rect.height);
    const diameter = MOBILE_QUERY.matches
      ? Math.min(280, Math.max(176, base * .68))
      : Math.min(360, Math.max(180, base * .58));
    hit.style.left = `${rect.left + rect.width / 2}px`;
    hit.style.top = `${rect.top + rect.height / 2}px`;
    hit.style.width = `${diameter}px`;
    hit.style.height = `${diameter}px`;
    hit.style.visibility = 'visible';
    hit.style.setProperty('z-index', HEART_HIT_Z, 'important');
    hit.style.setProperty('pointer-events', 'none', 'important');
    hit.removeAttribute('aria-hidden');
    root.dataset.fxMagHeartHitGeometryR542 = 'viewport-stage-synced';
    root.dataset.fxMagHeartHitPlaneR544 = 'body-top-interaction-below-intro';
    root.dataset.fxMagHeartPointerPolicyR549 = 'semantic-focus-pointer-transparent-trusted-document-router';
    return true;
  }

  function installHeartHitTarget() {
    const body = document.body;
    const hero = document.getElementById('hero');
    const space = hero?.querySelector(':scope .hero-space');
    if (!(body instanceof HTMLBodyElement) || !(hero instanceof HTMLElement) || !(space instanceof HTMLElement)) return false;

    let hit = document.querySelector('.fx-mag-heart-hit-r252');
    if (!(hit instanceof HTMLButtonElement)) {
      hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'fx-mag-heart-hit-r252';
      hit.dataset.fxHeartCoreR252 = 'true';
    }

    if (hit.parentElement !== body) {
      const main = document.getElementById('main-content');
      if (main?.parentElement === body) body.insertBefore(hit, main);
      else body.appendChild(hit);
    }

    hit.dataset.fxHeartOwnerR542 = 'body-fixed-stage-synced';
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

    syncHeartGeometry(hit);
    root.dataset.fxMagHeartHit = 'ready-r542';
    root.dataset.fxMagHeartHitOwnerR542 = 'body-fixed-stage-synced';
    root.dataset.fxMagHeartPhysicalRouteR546 = 'armed-trusted-stage-hit';
    return true;
  }

  function isReservedInteractiveTarget(target) {
    return target instanceof Element
      && Boolean(target.closest('a[href],button,input,select,textarea,[role="button"],[contenteditable="true"]'));
  }

  function routePhysicalHeartClick(event) {
    if (!event.isTrusted) return;
    if (isReservedInteractiveTarget(event.target)) return;
    const hit = document.querySelector('.fx-mag-heart-hit-r252');
    if (!(hit instanceof HTMLButtonElement) || hit.getAttribute('aria-hidden') === 'true') return;
    const rect = hit.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 80) return;
    const x = Number(event.clientX);
    const y = Number(event.clientY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
    root.dataset.fxMagHeartPhysicalRouteR546 = 'captured-stage-hit';
    root.dataset.fxMagHeartPhysicalRouteR549 = 'captured-pointer-transparent-stage-hit';
    root.dataset.fxMagHeartTouchRouteR551 = event.defaultPrevented ? 'trusted-after-default-prevented' : 'trusted-direct';
    activateCore('core-hit-zone');
  }

  function pruneMobileReferenceMirror() {
    if (!MOBILE_QUERY.matches) return;
    const bridge = document.querySelector('.fx-loop-bridge');
    if (!(bridge instanceof HTMLElement)) return;
    bridge.dataset.fxHeartLoopR252 = 'true';
    bridge.querySelectorAll(':scope > .fx-loop-reference-mirror, :scope > [data-fx-loop-mirror]').forEach(node => node.remove());
    root.dataset.fxLoopMirrorMode = 'none-mobile-r252';
  }

  function scheduleGeometry() {
    if (geometryFrame) return;
    geometryFrame = requestAnimationFrame(() => {
      geometryFrame = 0;
      const hit = document.querySelector('.fx-mag-heart-hit-r252');
      if (hit instanceof HTMLButtonElement) syncHeartGeometry(hit);
    });
  }

  function scheduleBinding() {
    if (bindingFrame) return;
    bindingFrame = requestAnimationFrame(() => {
      bindingFrame = 0;
      installHeartHitTarget();
      pruneMobileReferenceMirror();
      syncPureWebglComposition();
      scheduleGeometry();
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
    return { bridge, hero, bridgeTop, overshoot: viewportBottom - bridgeTop };
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
        scheduleGeometry();
      });
    });
    return true;
  }

  function onScroll() {
    scheduleGeometry();
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
    ensureStyleAfterFirstPaint();
    root.dataset.fxHeartCoreR252 = 'ready';
    root.dataset.fxHeartLoopPolicy = 'footer-to-real-core-no-reference-mirror';
    installHeartHitTarget();
    pruneMobileReferenceMirror();
    syncPureWebglComposition();

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('scrollend', () => { transferToRealCore('scrollend'); scheduleGeometry(); }, { passive: true });
    addEventListener('resize', scheduleGeometry, { passive: true });
    addEventListener('orientationchange', scheduleGeometry, { passive: true });
    document.addEventListener('click', routePhysicalHeartClick, true);
    document.addEventListener('visibilitychange', scheduleGeometry, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    for (const eventName of [
      'formatx:real3dready',
      'formatx:controlownerready',
      'formatx:mobilelayoutready',
      'formatx:languagechange',
      'formatx:loopgeometryrefresh',
      'formatx:preloadercomplete',
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
    cancelAnimationFrame(geometryFrame);
  }, { once: true });
}());
