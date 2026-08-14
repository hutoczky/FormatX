(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxAccessibilityFinalizer === 'ready-v2') return;
  root.dataset.fxAccessibilityFinalizer = 'ready-v2';

  let scheduled = 0;
  let applying = false;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function setAttributeIfChanged(element, name, value) {
    if (!(element instanceof Element)) return;
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }

  function ensureOrganismTruthGuard() {
    if (document.querySelector('script[data-fx-organism-truth-guard]')) return;
    const script = document.createElement('script');
    script.src = './scripts/formatx-organism-truth-guard.js?v=20260808-truth-1';
    script.defer = true;
    script.dataset.fxOrganismTruthGuard = 'true';
    document.head.appendChild(script);
  }

  function repairCrawlableAnchors() {
    const simulatorHref = '/scifi-ui/project-simulator.html?lang=' + encodeURIComponent(language());
    document.querySelectorAll('a[data-fx-simulator-entry]').forEach(link => {
      setAttributeIfChanged(link, 'href', simulatorHref);
    });

    document.querySelectorAll('#hero .hero-actions a:not([href])').forEach(link => {
      const label = (link.textContent || '') + ' ' + (link.getAttribute('aria-label') || '');
      if (/android/i.test(label)) setAttributeIfChanged(link, 'href', '/download/android');
    });

    const organTargets = ['#hero', '#experience', '#capabilities', '#system'];
    document.querySelectorAll('a[data-organ-node]').forEach(link => {
      const index = Number.parseInt(link.dataset.organNode || '0', 10);
      const target = organTargets[Number.isFinite(index) ? index : 0] || '#system';
      setAttributeIfChanged(link, 'href', target);
    });
  }

  function apply() {
    scheduled = 0;
    if (applying) return;
    applying = true;
    try {
      const brand = document.querySelector('.topbar > a.brand');
      if (brand?.hasAttribute('aria-label')) brand.removeAttribute('aria-label');

      const immersive = document.querySelector('.fx-immersive-launch');
      if (immersive instanceof HTMLButtonElement) {
        setAttributeIfChanged(immersive, 'aria-label', language() === 'en'
          ? 'LIVING CORE LAUNCH — launch the living visual core'
          : 'ÉLŐ MAG INDÍTÁS — az élő vizuális mag indítása');
      }

      const coreNode = document.querySelector('[data-organ-node="0"]');
      if (coreNode instanceof HTMLAnchorElement && coreNode.hasAttribute('aria-label')) {
        coreNode.removeAttribute('aria-label');
      }

      document.querySelectorAll('.fx-plan-qr-link').forEach(link => {
        if (!(link instanceof HTMLAnchorElement)) return;
        const card = link.closest('[data-plan-qr]');
        const planName = card?.querySelector('.fx-plan-qr-copy strong')?.textContent?.trim() || 'FormatX';
        setAttributeIfChanged(link, 'aria-label', language() === 'en'
          ? 'QR — open ' + planName + ' payment page'
          : 'QR — ' + planName + ' fizetési oldal megnyitása');
      });

      const launcher = document.querySelector('[data-fx-live-os-launcher]');
      if (launcher instanceof HTMLButtonElement) {
        const label = language() === 'en'
          ? 'Live OS — FormatX command'
          : 'Live OS — FormatX parancs';
        setAttributeIfChanged(launcher, 'aria-label', label);
        if (launcher.title !== label + ' · Ctrl/⌘ K') launcher.title = label + ' · Ctrl/⌘ K';
      }

      repairCrawlableAnchors();
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
      || entry.attributeName === 'href'
      || entry.attributeName === 'lang'
    )) schedule();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-label', 'href', 'lang']
  });

  addEventListener('formatx:languagechange', schedule);
  addEventListener('formatx:livingready', schedule);
  addEventListener('formatx:open-live-os-ready', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', () => {
    observer.disconnect();
    if (scheduled) cancelAnimationFrame(scheduled);
  }, { once: true });

  ensureOrganismTruthGuard();
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', schedule, { once: true })
    : schedule();
}());