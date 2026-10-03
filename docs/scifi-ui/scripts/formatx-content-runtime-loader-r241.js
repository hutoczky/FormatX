/* FormatX R538 — semantic-first, interaction-deferred content enhancements.
   Production owns every layout-critical stylesheet before first paint. This
   loader mounts enhancement scripts after explicit intent without changing
   stylesheet media. Desktop scroll geometry awaits the real section owners. */
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
  const loadTasks = new Map();
  let started = false;
  let contentReady = Promise.resolve([]);
  let metadataReady = Promise.resolve([]);
  const passive = { passive: true };
  const listeners = [
    ['wheel', passive],
    ['touchstart', passive],
    ['pointerdown', passive],
    ['keydown', false]
  ];

  function mount(spec) {
    const raw = spec.getAttribute('src');
    if (!raw) return Promise.resolve('missing-source');
    const absolute = new URL(raw, document.baseURI).href;
    if (loadTasks.has(absolute)) return loadTasks.get(absolute);
    if (Array.from(document.scripts).some(script => script.src === absolute)) return Promise.resolve('existing');

    const script = document.createElement('script');
    script.async = false;
    for (const attribute of spec.attributes) {
      if (attribute.name === 'defer' || attribute.name === 'src') continue;
      script.setAttribute(attribute.name, attribute.value);
    }
    const task = new Promise(resolve => {
      script.addEventListener('load', () => resolve('loaded'), { once: true });
      script.addEventListener('error', () => resolve('failed'), { once: true });
      script.src = raw;
      document.head.appendChild(script);
    });
    loadTasks.set(absolute, task);
    return task;
  }

  // R862: server-rendered homepage content is useful before live metadata
  // reconciliation. Keep those requests out of the first-frame dependency
  // chain, then start them automatically after the canonical release paints.
  // This is independent of interaction, MAG readiness and optional enhancements.
  const metadata = document.getElementById('fx-metadata-runtime-r862');
  let metadataScheduled = false;
  function startMetadata() {
    if (metadataScheduled || !(metadata instanceof HTMLTemplateElement)) return;
    if (root.dataset.fxPreloaderR531 !== 'done' && root.dataset.fxIntroCompletionR769 !== 'done') return;
    metadataScheduled = true;
    document.removeEventListener('formatx:preloadercomplete', startMetadata);
    metadataReady = new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => {
      const tasks = Array.from(metadata.content.querySelectorAll('script[src]')).map(mount);
      root.dataset.fxMetadataRuntimeR862 = 'requested-after-intro-paint';
      Promise.all(tasks).then(resolve);
    })));
  }
  if (metadata instanceof HTMLTemplateElement) {
    document.addEventListener('formatx:preloadercomplete', startMetadata);
    startMetadata(); // Late adoption reads durable state, not a past event.
  }

  function reservedInteraction(event) {
    if (root.dataset.fxOrganismThought === 'open') return true;
    const target = event?.target instanceof Element ? event.target : null;
    return Boolean(target?.closest('.fx-organism-dialogue,.fx-reference-ask,.fx-three-sound,#menu-toggle,.fx-language-toggle,.fx-reference-mag-button'));
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
    contentReady = Promise.all(specs.map(mount));
    root.dataset.fxDeferredVisualStylesR300 = 'production-css-owned-r538';
    root.dataset.fxContentRuntimeR241 = 'requested-r538-user-intent';
  }

  // Browser-generated scroll events are not explicit intent and never activate
  // enhancements. Wheel, pointer/touch and keyboard actions remain deliberate
  // user signals, while CSS geometry stays immutable throughout the session.
  root.dataset.fxContentRuntimeR241 = 'armed-r538-user-intent';
  root.dataset.fxDeferredVisualStylesR300 = 'production-css-owned-r538';
  root.dataset.fxFirstFrameStabilityR283 = 'immutable-css-r538';
  // Native input remains usable while the optional desktop loop prepares the
  // sections whose real content contributes to its document coordinates.
  window.FormatXContentRuntime = Object.freeze({
    async prepareDesktopGeometry() {
      start();
      startMetadata();
      await Promise.all([contentReady, metadataReady]);
      await window.FormatXPlatformStatusReady;
      if (window.FormatXDocumentSections) await window.FormatXDocumentSections.prepare();
      root.dataset.fxDocumentSectionsR869 = 'settled-before-desktop-bridge';
    }
  });
  for (const [type, options] of listeners) addEventListener(type, onIntent, options);

  // Deep links and the explicit immersive action are deliberate navigation
  // intent, so enhancement scripts may mount without touching stylesheet media.
  addEventListener('formatx:immersiveactivate', start, { passive: true });
  if (location.hash && location.hash !== '#top' && location.hash !== '#hero') start();
}());
