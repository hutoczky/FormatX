(function () {
  'use strict';

  // Production deployment marker: current master release metadata, 2026-08-03.
  const ROOT = document.documentElement;
  if (ROOT.dataset.fxOrganismCoreInteraction === 'ready-v1') return;
  ROOT.dataset.fxOrganismCoreInteraction = 'loading-v1';

  const MAX_TAP_TRAVEL = 14;
  const MAX_TAP_DURATION = 760;
  let gesture = null;
  let thoughtLabelObserver = null;
  let thoughtDiscoveryObserver = null;
  let syncingThoughtLabel = false;

  function ensureStyle() {
    if (document.querySelector('link[data-fx-organism-core-interaction-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/organism-core-interaction.css?v=20260803-single-mag-1';
    link.dataset.fxOrganismCoreInteractionStyle = 'true';
    document.head.appendChild(link);
  }

  function dialogueEnabled() {
    return ROOT.dataset.fxOrganismDialogueEnabled !== 'false';
  }

  function thoughtActionLabel() {
    if (!dialogueEnabled()) return ROOT.lang === 'en' ? 'OFF' : 'KI';
    return ROOT.lang === 'en' ? 'ASK' : 'KÉRDEZZ';
  }

  function syncThoughtLabel() {
    if (syncingThoughtLabel) return false;
    const label = document.querySelector('.fx-organism-thought-trigger b');
    if (!(label instanceof HTMLElement)) return false;

    syncingThoughtLabel = true;
    const next = thoughtActionLabel();
    if (label.textContent !== next) label.textContent = next;
    label.closest('.fx-organism-thought-trigger')?.setAttribute(
      'data-fx-core-label-role',
      'thought-action'
    );
    syncingThoughtLabel = false;
    return true;
  }

  function bindThoughtLabel() {
    if (!syncThoughtLabel()) return false;
    const label = document.querySelector('.fx-organism-thought-trigger b');
    if (!(label instanceof HTMLElement)) return false;

    if (!thoughtLabelObserver) {
      thoughtLabelObserver = new MutationObserver(syncThoughtLabel);
      thoughtLabelObserver.observe(label, {
        subtree: true,
        childList: true,
        characterData: true
      });
    }
    thoughtDiscoveryObserver?.disconnect();
    thoughtDiscoveryObserver = null;
    return true;
  }

  function discoverThoughtLabel() {
    if (bindThoughtLabel() || thoughtDiscoveryObserver) return;
    thoughtDiscoveryObserver = new MutationObserver(bindThoughtLabel);
    thoughtDiscoveryObserver.observe(document.documentElement, {
      subtree: true,
      childList: true
    });
  }

  function interfaceBlocked() {
    return ROOT.classList.contains('fx-intro-pending')
      || ROOT.classList.contains('fx-intro-running')
      || ROOT.classList.contains('fx-intro-reveal')
      || ROOT.classList.contains('fx-organism-menu-open')
      || document.body?.classList.contains('fx-organism-panel-open');
  }

  function currentSceneIsCore() {
    return Number(ROOT.dataset.fxScene || 0) === 0;
  }

  function heroIsVisible() {
    const hero = document.getElementById('hero');
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight;
  }

  function interactiveTarget(target) {
    return Boolean(target?.closest?.('a,button,input,select,textarea,[contenteditable="true"],[role="button"]'));
  }

  function coreHitRegion() {
    const shell = document.querySelector('.fx-three-stage-shell');
    const rect = shell?.getBoundingClientRect();
    const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;

    if (rect && rect.width > 40 && rect.height > 40) {
      const radius = Math.max(92, Math.min(mobile ? 176 : 205, Math.min(rect.width, rect.height) * (mobile ? 0.27 : 0.245)));
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * (mobile ? 0.43 : 0.47),
        radius
      };
    }

    return {
      x: innerWidth * (mobile ? 0.5 : 0.75),
      y: innerHeight * (mobile ? 0.43 : 0.48),
      radius: Math.max(92, Math.min(mobile ? 168 : 198, Math.min(innerWidth, innerHeight) * 0.2))
    };
  }

  function isCoreHit(x, y) {
    if (!currentSceneIsCore() || !heroIsVisible() || interfaceBlocked()) return false;
    const hit = coreHitRegion();
    return Math.hypot(x - hit.x, y - hit.y) <= hit.radius;
  }

  function openDialogue(source) {
    if (!dialogueEnabled() || interfaceBlocked()) return false;

    const api = window.FormatXOrganismVoice;
    if (api && typeof api.open === 'function') {
      api.open();
    } else {
      const trigger = document.querySelector('.fx-organism-thought-trigger');
      if (!(trigger instanceof HTMLButtonElement)) return false;
      if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
    }

    ROOT.dataset.fxOrganismCoreActivation = source || 'core';
    dispatchEvent(new CustomEvent('formatx:organismcoreactivate', {
      detail: { source: source || 'core', scene: 0, userInitiated: true }
    }));
    return true;
  }

  function onNavigationClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const coreLink = target?.closest('[data-organ-node="0"], [data-scene-link="0"], a[href="#hero"]');
    if (!coreLink || coreLink.matches('.brand, .skip-link')) return;
    setTimeout(() => openDialogue('mag-navigation'), 0);
  }

  function onPointerDown(event) {
    if (!event.isPrimary || event.button > 0 || interactiveTarget(event.target)) {
      gesture = null;
      return;
    }
    if (!isCoreHit(event.clientX, event.clientY)) {
      gesture = null;
      return;
    }
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: performance.now(),
      moved: false
    };
  }

  function onPointerMove(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > MAX_TAP_TRAVEL) {
      gesture.moved = true;
    }
  }

  function onPointerUp(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const active = gesture;
    gesture = null;
    const travel = Math.hypot(event.clientX - active.x, event.clientY - active.y);
    const duration = performance.now() - active.startedAt;
    if (active.moved || travel > MAX_TAP_TRAVEL || duration > MAX_TAP_DURATION) return;
    if (!isCoreHit(event.clientX, event.clientY)) return;
    openDialogue(event.pointerType === 'touch' ? 'core-touch' : 'core-pointer');
  }

  function cancelGesture() {
    gesture = null;
  }

  ensureStyle();
  discoverThoughtLabel();
  addEventListener('formatx:organismvoiceready', bindThoughtLabel);
  addEventListener('formatx:languagechange', () => queueMicrotask(syncThoughtLabel));
  new MutationObserver(syncThoughtLabel).observe(ROOT, {
    attributes: true,
    attributeFilter: ['lang', 'data-fx-organism-dialogue-enabled']
  });
  addEventListener('click', onNavigationClick, true);
  addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
  addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
  addEventListener('pointerup', onPointerUp, { capture: true, passive: true });
  addEventListener('pointercancel', cancelGesture, { capture: true, passive: true });
  addEventListener('blur', cancelGesture);

  ROOT.dataset.fxOrganismCoreInteraction = 'ready-v1';
  dispatchEvent(new CustomEvent('formatx:organismcoreinteractionready', {
    detail: { mouse: true, touch: true, navigation: true, singleMagLabel: true }
  }));
}());
