/* FormatX r265 — content enhancement + canonical control loading gate.
   Semantic homepage copy and navigation controls must exist before interaction,
   including reduced-motion mode. Heavier deck/proof/simulator enhancements may
   still wait for intent so the first paint remains light. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxContentRuntimeR241) return;

  const CONTROL_RUNTIME_URL = './scripts/formatx-award-runtime-r206.js?v=20260821-r265-nav-state-owner';
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

  function mountExternal(raw, marker) {
    if (!raw) return;
    const absolute = new URL(raw, document.baseURI).href;
    if (mounted.has(absolute) || Array.from(document.scripts).some(script => script.src === absolute)) return;

    mounted.add(absolute);
    const script = document.createElement('script');
    script.async = false;
    if (marker) script.dataset[marker] = 'true';
    script.src = raw;
    document.head.appendChild(script);
  }

  function ensureControlRuntime() {
    if (root.dataset.fxAwardRuntime === 'r264') return;
    if (document.querySelector('script[data-fx-content-control-runtime-r265]')) return;
    mountExternal(CONTROL_RUNTIME_URL, 'fxContentControlRuntimeR265');
    root.dataset.fxContentControlRuntime = 'requested-r265';
  }

  function mount(spec) {
    const raw = spec.getAttribute('src');
    if (!raw) return;
    const absolute = new URL(raw, document.baseURI).href;
    if (mounted.has(absolute) || Array.from(document.scripts).some(script => script.src === absolute)) return;

    mounted.add(absolute);
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
    root.dataset.fxContentRuntimeR241 = 'requested-r265';
  }

  // Header/menu/SOUND/ASK/PAUSE ownership is interaction infrastructure, not a
  // decorative motion enhancement. Mount it in both normal and reduced modes.
  ensureControlRuntime();

  if (!reduced.matches) {
    start();
    return;
  }

  /*
    Semantic floor:
    formatx-category-positioning.js owns real page copy (category title/cards,
    plan copy and the origin/proof narrative), so it is content, not decoration.
    Load that one script immediately. The remaining enhancement runtimes stay
    deferred until intent.
  */
  specs
    .filter(spec => spec.hasAttribute('data-fx-category-script'))
    .forEach(mount);

  root.dataset.fxContentRuntimeR241 = 'reduced-motion-semantic-r265';
  for (const [type, options] of listeners) addEventListener(type, start, options);
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
