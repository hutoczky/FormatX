/* FormatX R497 — semantic-first, interaction-deferred content enhancements.
   Production owns every layout-critical stylesheet before first paint. This
   loader may mount enhancement scripts after explicit intent, but it must never
   mutate stylesheet media and therefore cannot change document geometry. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxContentRuntimeR241) return;

  const template = document.getElementById('fx-content-runtime-r241');
  if (!(template instanceof HTMLTemplateElement)) {
    root.dataset.fxContentRuntimeR241 = 'missing-template';
    return;
  }

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  const mounted = new Set();
  let started = false;
  const passive = { passive: true };
  const listeners = [
    ['wheel', passive],
    ['touchstart', passive],
    ['pointerdown', passive],
    ['keydown', false]
  ];

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

  function reservedInteraction(event) {
    if (root.dataset.fxOrganismThought === 'open') return true;
    const target = event?.target instanceof Element ? event.target : null;
    return Boolean(target?.closest('.fx-organism-dialogue,.fx-reference-ask,.fx-reference-pause,.fx-three-sound,#menu-toggle,.fx-language-toggle,.fx-reference-mag-button'));
  }

  function onIntent(event) {
    if (reservedInteraction(event)) return;
    start();
  }

  function disarm() {
    for (const [type, options] of listeners) removeEventListener(type, onIntent, options);
  }

  function start() {
    if (started) return;
    started = true;
    disarm();
    specs.forEach(mount);
    root.dataset.fxDeferredVisualStylesR300 = 'production-css-owned-r497';
    root.dataset.fxContentRuntimeR241 = 'requested-r497-user-intent';
  }

  let liveOsRequestTimer = 0;

  function requestLiveOsRuntime(event) {
    const target = event?.target instanceof Element
      ? event.target.closest('[data-fx-live-os-launcher]')
      : null;
    if (event && !(target instanceof HTMLElement)) return;
    if (target?.dataset.fxLiveOsRuntimeBoundR643 === 'true') return;
    if (event) event.preventDefault();

    start();
    clearInterval(liveOsRequestTimer);
    let attempts = 0;
    liveOsRequestTimer = window.setInterval(() => {
      attempts += 1;
      if (root.dataset.fxLiveOsLoader === 'v1') {
        clearInterval(liveOsRequestTimer);
        liveOsRequestTimer = 0;
        dispatchEvent(new CustomEvent('formatx:open-live-os'));
      } else if (attempts >= 120) {
        clearInterval(liveOsRequestTimer);
        liveOsRequestTimer = 0;
        root.dataset.fxLiveOsBootstrapR643 = 'runtime-timeout';
      }
    }, 25);
    root.dataset.fxLiveOsBootstrapR643 = 'existing-hero-cta-heavy-runtime-on-demand';
  }

  function onLiveOsShortcut(event) {
    if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) return;
    if (root.dataset.fxLiveOsLoader === 'v1') return;
    event.preventDefault();
    requestLiveOsRuntime();
  }

  // Browser-generated scroll events are not explicit intent and never activate
  // enhancements. Wheel, pointer/touch and keyboard actions remain deliberate
  // user signals, while CSS geometry stays immutable throughout the session.
  root.dataset.fxContentRuntimeR241 = 'armed-r497-user-intent';
  root.dataset.fxDeferredVisualStylesR300 = 'production-css-owned-r497';
  root.dataset.fxLiveOsBootstrapR643 = 'hero-cta-no-fixed-overlay';
  root.dataset.fxFirstFrameStabilityR283 = 'immutable-css-r497';
  for (const [type, options] of listeners) addEventListener(type, onIntent, options);
  document.addEventListener('click', requestLiveOsRuntime);
  addEventListener('keydown', onLiveOsShortcut);

  // Deep links and the explicit immersive action are deliberate navigation
  // intent, so enhancement scripts may mount without touching stylesheet media.
  addEventListener('formatx:immersiveactivate', start, { passive: true });
  addEventListener('pagehide', () => {
    clearInterval(liveOsRequestTimer);
    document.removeEventListener('click', requestLiveOsRuntime);
    removeEventListener('keydown', onLiveOsShortcut);
  }, { once: true });
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
