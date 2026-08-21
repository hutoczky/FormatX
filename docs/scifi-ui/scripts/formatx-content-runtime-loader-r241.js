/* FormatX r284 — semantic-first, interaction-deferred content enhancements.
   The settled hero geometry is now render-blocking in the normal-motion core
   stylesheet, so this loader no longer injects a late layout stylesheet. */
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
    ['scroll', passive],
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

  function disarm() {
    for (const [type, options] of listeners) removeEventListener(type, start, options);
  }

  function start() {
    if (started) return;
    started = true;
    disarm();
    specs.forEach(mount);
    root.dataset.fxContentRuntimeR241 = 'requested-r284-user-intent';
  }

  // Category/product definition copy is already delivered by static HTML plus
  // the dedicated semantic positioning runtime. The template contains only
  // enhancement layers, so it can remain dormant through first paint and CPU
  // idle. A real scroll, pointer/touch, wheel or keyboard action activates it.
  root.dataset.fxContentRuntimeR241 = 'armed-r284-user-intent';
  root.dataset.fxFirstFrameStabilityR283 = 'render-blocking-r284';
  for (const [type, options] of listeners) addEventListener(type, start, options);

  // Deep links are explicit navigation intent and need their enhancement layer
  // immediately at the destination.
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
