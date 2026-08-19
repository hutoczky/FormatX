/* FormatX r239 — motion-only runtime gate.
   Purely visual MAG/heartbeat/SOTY runtimes are unnecessary when the user
   explicitly requests reduced motion. Normal motion-capable presentation keeps
   the original script order and behaviour. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMotionRuntimeR239) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const template = document.getElementById('fx-motion-runtime-r239');

  if (!(template instanceof HTMLTemplateElement)) {
    root.dataset.fxMotionRuntimeR239 = 'missing-template';
    return;
  }

  if (reduced.matches) {
    root.dataset.fxMotionRuntimeR239 = 'reduced-motion-skipped';
    return;
  }

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  if (!specs.length) {
    root.dataset.fxMotionRuntimeR239 = 'empty-template';
    return;
  }

  root.dataset.fxMotionRuntimeR239 = 'loading';

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

  root.dataset.fxMotionRuntimeR239 = 'requested';
}());
