/* FormatX r241 — content enhancement loading gate.
   Non-critical category/proof/simulator enhancements stay immediate in the
   normal presentation, while reduced-motion first paint waits for user intent. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxContentRuntimeR241) return;

  const template = document.getElementById('fx-content-runtime-r241');
  if (!(template instanceof HTMLTemplateElement)) {
    root.dataset.fxContentRuntimeR241 = 'missing-template';
    return;
  }

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

  function start() {
    if (started) return;
    started = true;
    for (const [type, options] of listeners) removeEventListener(type, start, options);

    const specs = Array.from(template.content.querySelectorAll('script[src]'));
    for (const spec of specs) {
      const script = document.createElement('script');
      script.async = false;
      for (const attribute of spec.attributes) {
        if (attribute.name === 'defer' || attribute.name === 'src') continue;
        script.setAttribute(attribute.name, attribute.value);
      }
      script.src = spec.getAttribute('src');
      document.head.appendChild(script);
    }
    root.dataset.fxContentRuntimeR241 = 'requested';
  }

  if (!reduced.matches) {
    start();
    return;
  }

  root.dataset.fxContentRuntimeR241 = 'reduced-motion-armed';
  for (const [type, options] of listeners) addEventListener(type, start, options);
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
