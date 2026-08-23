(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxGeometryGuardR286 === 'ready') return;
  root.dataset.fxGeometryGuardR286 = 'booting-r320';

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

  let bootObserver = null;
  let bootTimer = 0;
  let scheduled = false;

  /* r320: the external canonical stylesheets are the only geometry owner.
     Older revisions used CSSStyleDeclaration.removeProperty() from permanent
     per-control MutationObservers. Besides creating avoidable mutation churn,
     CSSOM writes are not compatible with the site's strict style-src policy.
     A bounded pass now removes stale legacy style attributes atomically and
     then gets out of the render path. */
  function sanitize(node) {
    if (!(node instanceof HTMLElement)) return;
    if (!node.hasAttribute('style')) return;
    node.removeAttribute('style');
    root.dataset.fxGeometryGuardR286LastRepair = node.className || node.id || node.tagName;
  }

  function scan() {
    scheduled = false;
    let found = 0;
    for (const selector of SELECTORS) {
      document.querySelectorAll(selector).forEach(node => {
        found += 1;
        sanitize(node);
      });
    }
    if (found >= 6) {
      root.dataset.fxGeometryGuardR286 = 'ready';
      root.dataset.fxGeometryGuardPolicyR320 = 'bounded-attribute-cleanup-no-cssom-observer';
      stopBootObserver();
    }
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
    if (scan() >= 6) return;
    const target = document.body || document.documentElement;
    bootObserver = new MutationObserver(schedule);
    bootObserver.observe(target, { childList: true, subtree: true });
    bootTimer = setTimeout(() => {
      stopBootObserver();
      scan();
      root.dataset.fxGeometryGuardR286 = 'ready';
      root.dataset.fxGeometryGuardPolicyR320 = 'bounded-attribute-cleanup-no-cssom-observer';
    }, 4000);
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

  for (const delay of [0, 120, 420, 1100]) setTimeout(schedule, delay);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());