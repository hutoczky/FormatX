(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxGeometryGuardR286 === 'ready') return;
  root.dataset.fxGeometryGuardR286 = 'booting';

  const SELECTORS = [
    '.topbar .fx-reference-mag-button',
    '.topbar .fx-language-toggle',
    '.topbar .fx-reference-menu-button',
    '#hero .fx-reference-controls-r204',
    '#hero .fx-reference-controls-r204 .fx-reference-rail',
    '#hero .fx-reference-controls-r204 .fx-three-sound',
    '#hero .fx-reference-controls-r204 .fx-reference-ask',
    '#hero .fx-reference-controls-r204 .fx-reference-pause',
    '#hero .fx-reference-controls-r204 .fx-reference-ask span'
  ];

  const GEOMETRY = [
    'position', 'inset', 'top', 'right', 'bottom', 'left',
    'display', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
    'flex', 'flex-basis', 'flex-direction', 'flex-wrap', 'align-items', 'align-self',
    'justify-content', 'justify-items', 'order',
    'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'overflow', 'clip', 'clip-path', 'white-space',
    'transform', 'translate', 'visibility', 'opacity', 'pointer-events', 'z-index'
  ];

  const observed = new WeakSet();
  const observers = new WeakMap();
  let bootObserver = null;
  let bootTimer = 0;
  let scheduled = false;

  function stripGeometry(node) {
    if (!(node instanceof HTMLElement)) return;
    let changed = false;
    for (const property of GEOMETRY) {
      if (!node.style.getPropertyValue(property)) continue;
      node.style.removeProperty(property);
      changed = true;
    }
    if (changed) root.dataset.fxGeometryGuardR286LastRepair = node.className || node.id || node.tagName;
  }

  function bind(node) {
    if (!(node instanceof HTMLElement) || observed.has(node)) return;
    observed.add(node);
    stripGeometry(node);
    let repairing = false;
    const observer = new MutationObserver(() => {
      if (repairing) return;
      repairing = true;
      queueMicrotask(() => {
        stripGeometry(node);
        repairing = false;
      });
    });
    observer.observe(node, { attributes: true, attributeFilter: ['style'] });
    observers.set(node, observer);
  }

  function scan() {
    scheduled = false;
    let found = 0;
    for (const selector of SELECTORS) {
      document.querySelectorAll(selector).forEach(node => {
        found += 1;
        bind(node);
      });
    }
    if (found >= 6) root.dataset.fxGeometryGuardR286 = 'ready';
    return found;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(scan);
  }

  function stopBootObserver() {
    bootObserver?.disconnect();
    bootObserver = null;
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = 0;
  }

  function boot() {
    scan();
    const target = document.body || document.documentElement;
    bootObserver = new MutationObserver(schedule);
    bootObserver.observe(target, { childList: true, subtree: true });
    bootTimer = setTimeout(() => {
      stopBootObserver();
      scan();
      root.dataset.fxGeometryGuardR286 = 'ready';
    }, 5000);
  }

  for (const eventName of [
    'formatx:real3dready',
    'formatx:mobilelayoutready',
    'formatx:languagechange',
    'formatx:controlownerready',
    'pageshow'
  ]) addEventListener(eventName, schedule, { passive: true });

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });

  for (const delay of [0, 120, 420, 1100, 2400]) setTimeout(schedule, delay);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
