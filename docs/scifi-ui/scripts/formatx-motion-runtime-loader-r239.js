/* FormatX r243 — motion-only runtime gate.
   Purely visual MAG/heartbeat/SOTY runtimes are unnecessary when the user
   explicitly requests reduced motion. Normal motion-capable presentation keeps
   the original script order and behaviour. Static motion CSS is now loaded from
   a same-origin stylesheet so strict CSP never needs unsafe-inline. */
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

  function ensureStaticMotionCss() {
    let stylesheet = document.getElementById('fx-r170-mobile-seam-override');
    if (!stylesheet) {
      stylesheet = document.createElement('link');
      stylesheet.id = 'fx-r170-mobile-seam-override';
      stylesheet.rel = 'stylesheet';
      stylesheet.href = './styles/formatx-runtime-static-r243.css?v=20260819-r243-csp';
      stylesheet.dataset.fxRuntimeStaticR243 = 'true';
      document.head.appendChild(stylesheet);
    }

    /* r155 historically probes only this id before creating an inline <style>.
       A metadata marker preserves that compatibility while the real rules live
       in the external stylesheet above. */
    if (!document.getElementById('fx-live-heartbeat-r155-style')) {
      const marker = document.createElement('meta');
      marker.id = 'fx-live-heartbeat-r155-style';
      marker.dataset.fxExternalStyleOwner = 'r243';
      document.head.appendChild(marker);
    }

    root.dataset.fxMotionCssR243 = 'external-strict-csp';
  }

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  if (!specs.length) {
    root.dataset.fxMotionRuntimeR239 = 'empty-template';
    return;
  }

  root.dataset.fxMotionRuntimeR239 = 'loading';
  ensureStaticMotionCss();

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

  root.dataset.fxMotionRuntimeR239 = 'requested-r243';
}());
