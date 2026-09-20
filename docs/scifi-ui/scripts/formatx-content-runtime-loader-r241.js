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

  function ensureLiveOsBootstrap() {
    let button = document.querySelector('[data-fx-live-os-launcher]');
    if (!(button instanceof HTMLButtonElement)) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.fxLiveOsLauncher = 'true';
      button.innerHTML = '<span>Live OS</span>';
      Object.assign(button.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: '2147482000',
        minWidth: '54px',
        minHeight: '54px',
        padding: '0 14px',
        border: '1px solid rgba(44,231,243,.68)',
        borderRadius: '999px',
        background: 'rgba(5,18,31,.92)',
        color: '#effcff',
        boxShadow: '0 16px 50px rgba(0,0,0,.4),0 0 28px rgba(44,231,243,.12)',
        cursor: 'pointer',
        font: '800 12px/1 system-ui,sans-serif',
        letterSpacing: '.04em'
      });
      document.body.appendChild(button);
    }
    const label = root.lang === 'en' ? 'Live OS — FormatX command' : 'Live OS — FormatX parancs';
    button.setAttribute('aria-label', label);
    button.title = label + ' · Ctrl/⌘ K';
    if (button.dataset.fxLiveOsBootstrapR642 === 'ready') return button;
    button.dataset.fxLiveOsBootstrapR642 = 'ready';
    button.addEventListener('click', () => {
      if (root.dataset.fxLiveOsLoader === 'v1') return;
      start();
      let attempts = 0;
      const timer = setInterval(() => {
        attempts += 1;
        if (root.dataset.fxLiveOsLoader === 'v1') {
          clearInterval(timer);
          button.click();
        } else if (attempts >= 80) clearInterval(timer);
      }, 25);
    });
    root.dataset.fxLiveOsBootstrapR642 = 'visible-lightweight-launcher-heavy-runtime-on-demand';
    return button;
  }

  // Browser-generated scroll events are not explicit intent and never activate
  // enhancements. Wheel, pointer/touch and keyboard actions remain deliberate
  // user signals, while CSS geometry stays immutable throughout the session.
  root.dataset.fxContentRuntimeR241 = 'armed-r497-user-intent';
  root.dataset.fxDeferredVisualStylesR300 = 'production-css-owned-r497';
  ensureLiveOsBootstrap();
  root.dataset.fxFirstFrameStabilityR283 = 'immutable-css-r497';
  for (const [type, options] of listeners) addEventListener(type, onIntent, options);

  // Deep links and the explicit immersive action are deliberate navigation
  // intent, so enhancement scripts may mount without touching stylesheet media.
  addEventListener('formatx:immersiveactivate', start, { passive: true });
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
