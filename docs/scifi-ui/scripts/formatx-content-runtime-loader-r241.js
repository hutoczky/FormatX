/* FormatX r283 — lightweight content enhancement loading gate.
   Semantic copy is available without interaction. A tiny geometry reservation
   loads before normal-motion enhancement scripts so the settled r244/r263
   composition does not shift after first paint. */
(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxContentRuntimeR241) return;

  const STABILITY_STYLE_URL = './styles/formatx-first-frame-stability-r283.css?v=20260821-r283-minimal-stability';
  const template = document.getElementById('fx-content-runtime-r241');
  if (!(template instanceof HTMLTemplateElement)) {
    root.dataset.fxContentRuntimeR241 = 'missing-template';
    return;
  }

  const specs = Array.from(template.content.querySelectorAll('script[src]'));
  const mounted = new Set();
  let started = false;
  let stabilityReady = false;
  let stabilityFallback = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const passive = { passive: true };
  const listeners = [
    ['wheel', passive],
    ['touchstart', passive],
    ['pointerdown', passive],
    ['scroll', passive],
    ['keydown', false]
  ];

  function markStabilityReady() {
    if (stabilityReady) return;
    stabilityReady = true;
    if (stabilityFallback) clearTimeout(stabilityFallback);
    stabilityFallback = 0;
    root.dataset.fxFirstFrameStabilityR283 = 'ready';
    if (!reduced.matches) start();
  }

  function ensureStabilityStyle() {
    const existing = document.querySelector('link[data-fx-first-frame-stability-r283]');
    if (existing instanceof HTMLLinkElement) {
      if (existing.sheet) markStabilityReady();
      else {
        existing.addEventListener('load', markStabilityReady, { once: true });
        existing.addEventListener('error', markStabilityReady, { once: true });
      }
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STABILITY_STYLE_URL;
    link.dataset.fxFirstFrameStabilityR283 = 'true';
    link.addEventListener('load', markStabilityReady, { once: true });
    link.addEventListener('error', markStabilityReady, { once: true });
    document.head.appendChild(link);
    stabilityFallback = setTimeout(markStabilityReady, 450);
    root.dataset.fxFirstFrameStabilityR283 = 'loading';
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
    if (!stabilityReady) {
      ensureStabilityStyle();
      return;
    }
    started = true;
    for (const [type, options] of listeners) removeEventListener(type, start, options);
    specs.forEach(mount);
    root.dataset.fxContentRuntimeR241 = 'requested-r283';
  }

  ensureStabilityStyle();

  if (!reduced.matches) return;

  /* The category-positioning runtime owns actual semantic product copy, so it
     remains part of reduced-motion first paint. Other visual enhancements wait
     for intent. */
  specs
    .filter(spec => spec.hasAttribute('data-fx-category-script'))
    .forEach(mount);

  root.dataset.fxContentRuntimeR241 = 'reduced-motion-semantic-r283';
  for (const [type, options] of listeners) addEventListener(type, start, options);
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
