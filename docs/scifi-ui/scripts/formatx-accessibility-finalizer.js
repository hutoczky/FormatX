(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAccessibilityFinalizer === 'ready-v1') return;
  root.dataset.fxAccessibilityFinalizer = 'ready-v1';

  let scheduled = 0;
  let applying = false;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function apply() {
    scheduled = 0;
    if (applying) return;
    applying = true;
    try {
      const brand = document.querySelector('.topbar > a.brand');
      brand?.removeAttribute('aria-label');

      const immersive = document.querySelector('.fx-immersive-launch');
      if (immersive instanceof HTMLButtonElement) {
        immersive.setAttribute('aria-label', language() === 'en'
          ? 'LIVING CORE LAUNCH — launch the living visual core'
          : 'ÉLŐ MAG INDÍTÁS — az élő vizuális mag indítása');
      }

      const coreNode = document.querySelector('[data-organ-node="0"]');
      if (coreNode instanceof HTMLAnchorElement) {
        coreNode.setAttribute('aria-label', language() === 'en'
          ? '01 CORE — launch the living visual core'
          : '01 MAG — az élő vizuális mag indítása');
      }

      document.querySelectorAll('.fx-plan-qr-link').forEach(link => {
        if (!(link instanceof HTMLAnchorElement)) return;
        const card = link.closest('[data-plan-qr]');
        const planName = card?.querySelector('.fx-plan-qr-copy strong')?.textContent?.trim() || 'FormatX';
        link.setAttribute('aria-label', language() === 'en'
          ? 'QR — open ' + planName + ' payment page'
          : 'QR — ' + planName + ' fizetési oldal megnyitása');
      });

      const launcher = document.querySelector('[data-fx-live-os-launcher]');
      if (launcher instanceof HTMLButtonElement) {
        launcher.setAttribute('aria-label', language() === 'en'
          ? 'Live OS — FormatX command'
          : 'Live OS — FormatX parancs');
        launcher.title = language() === 'en'
          ? 'Live OS — FormatX command · Ctrl/⌘ K'
          : 'Live OS — FormatX parancs · Ctrl/⌘ K';
      }
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = requestAnimationFrame(apply);
  }

  const observer = new MutationObserver(entries => {
    if (applying) return;
    if (entries.some(entry =>
      entry.type === 'childList'
      || entry.attributeName === 'aria-label'
      || entry.attributeName === 'lang'
    )) schedule();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-label', 'lang']
  });

  addEventListener('formatx:languagechange', schedule);
  addEventListener('formatx:livingready', schedule);
  addEventListener('formatx:open-live-os-ready', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', () => {
    observer.disconnect();
    if (scheduled) cancelAnimationFrame(scheduled);
  }, { once: true });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', schedule, { once: true })
    : schedule();
}());
