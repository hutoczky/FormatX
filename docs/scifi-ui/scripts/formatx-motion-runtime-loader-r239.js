/* FormatX r284 — first-frame core now, cinematic enhancement on intent.
   The native MAG and recovery path remain immediate. Continuity, heartbeat,
   narrative and seamless-carrier modules start only after a real navigation or
   interaction boundary, keeping the idle landing page measurable and responsive. */
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

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  if (!specs.length) {
    root.dataset.fxMotionRuntimeR239 = 'empty-template';
    return;
  }

  const mounted = new Set();
  const deferred = [];
  const passive = { passive: true };
  const intentListeners = [
    ['pointerdown', passive],
    ['touchstart', passive],
    ['wheel', passive],
    ['scroll', passive],
    ['keydown', false]
  ];
  let enhancementsStarted = false;

  function srcOf(spec) {
    return String(spec.getAttribute('src') || '');
  }

  function isLegacyLivingEnergy(spec) {
    return /\/formatx-living-energy-r168\.js(?:\?|$)/.test(srcOf(spec));
  }

  function isImmediateCore(spec) {
    return /\/(?:formatx-mobile-recovery|formatx-premium-finish|formatx-core-real3d-v20|formatx-signature-system-r185)\.js(?:\?|$)/.test(srcOf(spec));
  }

  function markMobileStaticEnergy() {
    root.dataset.fxLivingEnergyR168 = 'mobile-static-r284';
    root.dataset.fxLivingEnergyClockR168 = 'event-driven-static-r284';
    root.dataset.fxLivingEnergyEffectModeR168 = 'mobile-static-core-optics-r284';
    root.dataset.fxLivingEnergyInteractionR168 = 'idle-living';
    root.dataset.fxMobileEnergyPolicyR271 = 'no-idle-js-raf';
  }

  function mount(spec) {
    const raw = srcOf(spec);
    if (!raw) return false;
    const absolute = new URL(raw, document.baseURI).href;
    if (mounted.has(absolute) || Array.from(document.scripts).some(script => script.src === absolute)) return false;

    mounted.add(absolute);
    const script = document.createElement('script');
    script.async = false;
    for (const attribute of spec.attributes) {
      if (attribute.name === 'defer' || attribute.name === 'src') continue;
      script.setAttribute(attribute.name, attribute.value);
    }
    script.src = raw;
    document.head.appendChild(script);
    return true;
  }

  function disarmIntent() {
    for (const [type, options] of intentListeners) removeEventListener(type, startEnhancements, options);
  }

  function startEnhancements() {
    if (enhancementsStarted) return;
    enhancementsStarted = true;
    disarmIntent();
    let requested = 0;
    for (const spec of deferred) if (mount(spec)) requested += 1;
    root.dataset.fxMotionRuntimeDeferredRequestedR284 = String(requested);
    root.dataset.fxMotionRuntimeR239 = 'enhanced-r284-user-intent';
  }

  ensureStaticMotionCss();

  let immediateRequested = 0;
  let skippedMobileEnergy = 0;
  for (const spec of specs) {
    if (mobile.matches && isLegacyLivingEnergy(spec)) {
      skippedMobileEnergy += 1;
      markMobileStaticEnergy();
      continue;
    }

    if (isImmediateCore(spec)) {
      if (mount(spec)) immediateRequested += 1;
      continue;
    }

    deferred.push(spec);
  }

  root.dataset.fxMotionRuntimeRequestedR271 = String(immediateRequested);
  root.dataset.fxMotionRuntimeMobileEnergySkippedR271 = String(skippedMobileEnergy);
  root.dataset.fxMotionRuntimeDeferredCountR284 = String(deferred.length);
  root.dataset.fxMotionRuntimeR239 = mobile.matches
    ? 'core-ready-r284-mobile-idle-safe'
    : 'core-ready-r284-desktop-idle-safe';

  if (deferred.length) {
    for (const [type, options] of intentListeners) addEventListener(type, startEnhancements, options);
    if (location.hash && location.hash !== '#top' && location.hash !== '#hero') startEnhancements();
  }
}());
