/* FormatX r271 — motion runtime gate with an idle-safe mobile energy path.
   Reduced-motion remains fully skipped. Normal desktop keeps the complete
   cinematic runtime. Mobile keeps the native MAG, heartbeat, SOTY and control
   layers, but does not load the legacy per-frame living-energy controller: its
   mobile branch was already visually static while still writing styles every
   frame and preventing Lighthouse from observing CPU idle. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxMotionRuntimeR239) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)');
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

    if (!document.getElementById('fx-live-heartbeat-r155-style')) {
      const marker = document.createElement('meta');
      marker.id = 'fx-live-heartbeat-r155-style';
      marker.dataset.fxExternalStyleOwner = 'r243';
      document.head.appendChild(marker);
    }

    root.dataset.fxMotionCssR243 = 'external-strict-csp';
  }

  function isLegacyLivingEnergy(spec) {
    const src = String(spec.getAttribute('src') || '');
    return /\/formatx-living-energy-r168\.js(?:\?|$)/.test(src);
  }

  function markMobileStaticEnergy() {
    root.dataset.fxLivingEnergyR168 = 'mobile-static-r271';
    root.dataset.fxLivingEnergyClockR168 = 'event-driven-static-r271';
    root.dataset.fxLivingEnergyEffectModeR168 = 'mobile-static-core-optics-r271';
    root.dataset.fxLivingEnergyInteractionR168 = 'idle-living';
    root.dataset.fxMobileEnergyPolicyR271 = 'no-idle-js-raf';
  }

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  if (!specs.length) {
    root.dataset.fxMotionRuntimeR239 = 'empty-template';
    return;
  }

  root.dataset.fxMotionRuntimeR239 = 'loading';
  ensureStaticMotionCss();

  let requested = 0;
  let skippedMobileEnergy = 0;
  for (const spec of specs) {
    if (mobile.matches && isLegacyLivingEnergy(spec)) {
      skippedMobileEnergy += 1;
      markMobileStaticEnergy();
      continue;
    }

    const script = document.createElement('script');
    script.async = false;

    for (const attribute of spec.attributes) {
      if (attribute.name === 'defer' || attribute.name === 'src') continue;
      script.setAttribute(attribute.name, attribute.value);
    }

    script.src = spec.getAttribute('src');
    document.head.appendChild(script);
    requested += 1;
  }

  root.dataset.fxMotionRuntimeRequestedR271 = String(requested);
  root.dataset.fxMotionRuntimeMobileEnergySkippedR271 = String(skippedMobileEnergy);
  root.dataset.fxMotionRuntimeR239 = mobile.matches
    ? 'requested-r271-mobile-idle-safe'
    : 'requested-r243';
}());
