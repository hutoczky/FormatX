/* FormatX r273 — content enhancement + canonical event-driven control loading gate.
   Semantic homepage copy and navigation controls must exist before interaction,
   including reduced-motion mode. Heavier deck/proof/simulator enhancements may
   still wait for intent so the first paint remains light. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxContentRuntimeR241) return;

  const CONTROL_OWNER_STYLE_URL = './styles/formatx-control-owner-r264.css?v=20260821-r264-single-owner';
  const CONTROL_OWNER_URL = './scripts/formatx-control-owner-r268.js?v=20260821-r273-primary-event-owner';
  const NAV_OWNER_URL = './scripts/formatx-nav-state-owner-r265.js?v=20260821-r265-nav-state-owner';
  const DIALOGUE_OWNER_URL = './scripts/formatx-dialogue-render-owner-r273.js?v=20260821-r273-open-state-owner';
  const AWARD_RUNTIME_URL = './scripts/formatx-award-runtime-r206.js?v=20260821-r273-primary-event-owner';
  const template = document.getElementById('fx-content-runtime-r241');
  if (!(template instanceof HTMLTemplateElement)) {
    root.dataset.fxContentRuntimeR241 = 'missing-template';
    return;
  }

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  const mounted = new Set();
  let started = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const passive = { passive: true };
  const listeners = [
    ['wheel', passive],
    ['touchstart', passive],
    ['pointerdown', passive],
    ['scroll', passive],
    ['keydown', false]
  ];

  function absolute(raw) {
    return new URL(raw, document.baseURI).href;
  }

  function hasScript(raw) {
    const url = absolute(raw);
    return mounted.has(url) || Array.from(document.scripts).some(script => script.src === url);
  }

  function mountExternal(raw, datasetKey, onLoad) {
    if (!raw) return null;
    const url = absolute(raw);
    if (mounted.has(url)) return null;
    const existing = Array.from(document.scripts).find(script => script.src === url);
    if (existing) {
      if (onLoad) {
        if (existing.dataset.fxLoaded === 'true') queueMicrotask(onLoad);
        else existing.addEventListener('load', onLoad, { once: true });
      }
      return existing;
    }

    mounted.add(url);
    const script = document.createElement('script');
    script.async = false;
    if (datasetKey) script.dataset[datasetKey] = 'true';
    script.addEventListener('load', () => {
      script.dataset.fxLoaded = 'true';
      if (onLoad) onLoad();
    }, { once: true });
    script.src = raw;
    document.head.appendChild(script);
    return script;
  }

  function ensureOwnerStyle() {
    if (document.querySelector('link[data-fx-control-owner-style-r264]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CONTROL_OWNER_STYLE_URL;
    link.dataset.fxControlOwnerStyleR264 = 'true';
    document.head.appendChild(link);
  }

  function ensureNavOwner() {
    if (root.dataset.fxNavStateOwnerR265 === 'ready' || root.dataset.fxNavStateOwnerR265 === 'open-owned') return;
    if (document.querySelector('script[data-fx-nav-state-owner-r265]')) return;
    mountExternal(NAV_OWNER_URL, 'fxNavStateOwnerR265');
  }

  function ensureDialogueOwner() {
    if (root.dataset.fxDialogueRenderOwnerR273 === 'ready' || root.dataset.fxDialogueRenderOwnerR273 === 'open-owned') return;
    if (document.querySelector('script[data-fx-dialogue-render-owner-r273], script[src*="formatx-dialogue-render-owner-r273.js"]')) return;
    mountExternal(DIALOGUE_OWNER_URL, 'fxDialogueRenderOwnerR273');
  }

  function ensureControlOwner() {
    ensureOwnerStyle();
    if (root.dataset.fxControlOwnerR268 === 'ready') {
      ensureNavOwner();
      ensureDialogueOwner();
      return;
    }

    /* Keep the historical data attribute on the script element so the award
       runtime recognises that the physical owner is already mounted. The
       actual source is r268 and its root readiness marker is authoritative. */
    const existing = document.querySelector('script[data-fx-control-owner-r264], script[src*="formatx-control-owner-r268.js"]');
    if (existing) {
      existing.addEventListener('load', () => {
        ensureNavOwner();
        ensureDialogueOwner();
      }, { once: true });
      queueMicrotask(() => {
        ensureNavOwner();
        ensureDialogueOwner();
      });
      return;
    }

    mountExternal(CONTROL_OWNER_URL, 'fxControlOwnerR264', () => {
      ensureNavOwner();
      ensureDialogueOwner();
    });
  }

  function ensureAwardRuntime() {
    if (root.dataset.fxAwardRuntime === 'r268' || hasScript(AWARD_RUNTIME_URL)) return;
    mountExternal(AWARD_RUNTIME_URL, 'fxContentControlRuntimeR273');
  }

  function ensureInteractionInfrastructure() {
    // Navigation, dialogue and hero controls are interaction infrastructure.
    // Mount their physical owners directly; award/audio/GPU enhancement startup
    // must never be able to delay basic menu or ASK operation.
    ensureControlOwner();
    ensureDialogueOwner();
    ensureAwardRuntime();
    root.dataset.fxContentControlRuntime = 'requested-r273-r268-owner';
  }

  function mount(spec) {
    const raw = spec.getAttribute('src');
    if (!raw) return;
    const url = absolute(raw);
    if (mounted.has(url) || Array.from(document.scripts).some(script => script.src === url)) return;

    mounted.add(url);
    const script = document.createElement('script');
    script.async = false;
    for (const attribute of spec.attributes) {
      if (attribute.name === 'defer' || attribute.name === 'src') continue;
      script.setAttribute(attribute.name, attribute.value);
    }
    script.src = raw;
    document.head.appendChild(script);
  }

  function start() {
    if (started) return;
    started = true;
    for (const [type, options] of listeners) removeEventListener(type, start, options);
    specs.forEach(mount);
    root.dataset.fxContentRuntimeR241 = 'requested-r273';
  }

  ensureInteractionInfrastructure();

  if (!reduced.matches) {
    start();
    return;
  }

  specs
    .filter(spec => spec.hasAttribute('data-fx-category-script'))
    .forEach(mount);

  root.dataset.fxContentRuntimeR241 = 'reduced-motion-semantic-r273';
  for (const [type, options] of listeners) addEventListener(type, start, options);
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
