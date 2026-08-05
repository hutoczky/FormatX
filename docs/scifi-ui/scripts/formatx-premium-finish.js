(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxPremiumFinish === 'ready-v1') return;
  root.dataset.fxPremiumFinish = 'ready-v1';

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function ensureFallbackStatus() {
    const heroSpace = document.querySelector('#hero .hero-space');
    if (!heroSpace) return;
    let status = heroSpace.querySelector('.fx-premium-core-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'fx-premium-core-status';
      status.setAttribute('aria-live', 'polite');
      heroSpace.appendChild(status);
    }
    status.textContent = language() === 'en'
      ? 'Safe visual core active'
      : 'Biztonságos vizuális mag aktív';
  }

  function syncRendererState() {
    const failed = root.dataset.fxThree === 'error';
    root.dataset.fxPremiumCore = failed ? 'css-fallback' : 'realtime-pending';
    const frame = document.getElementById('fx-three-frame');
    if (frame instanceof HTMLIFrameElement) {
      frame.setAttribute('aria-hidden', 'true');
      if (failed && frame.getAttribute('src') !== 'about:blank') frame.src = 'about:blank';
    }
    if (failed) ensureFallbackStatus();
  }

  function handleHashNavigation(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;
    let target = null;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (_) {
      return;
    }
    if (!target) return;

    event.preventDefault();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.pushState({}, '', location.pathname + location.search + hash);
  }

  const rendererObserver = new MutationObserver(syncRendererState);
  rendererObserver.observe(root, { attributes: true, attributeFilter: ['data-fx-three', 'lang'] });
  document.addEventListener('click', handleHashNavigation, true);
  addEventListener('formatx:languagechange', ensureFallbackStatus);
  addEventListener('formatx:premiumfallback', syncRendererState);
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', syncRendererState, { once: true })
    : syncRendererState();
}());
