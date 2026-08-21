(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxNavStateOwnerR265 === 'ready') return;
  root.dataset.fxNavStateOwnerR265 = 'booting';

  let nav = null;
  let observer = null;
  let queued = false;

  const isMobile = () => matchMedia('(max-width: 900px)').matches;

  function setImportant(element, property, value) {
    if (element.style.getPropertyValue(property) === value
      && element.style.getPropertyPriority(property) === 'important') return;
    element.style.setProperty(property, value, 'important');
  }

  function clearOwnedGeometry(element) {
    for (const property of [
      'display', 'visibility', 'opacity', 'pointer-events', 'position', 'z-index',
      'top', 'right', 'bottom', 'left', 'width', 'max-width', 'max-height',
      'overflow-x', 'overflow-y', 'transform'
    ]) element.style.removeProperty(property);
  }

  function enforceOpenState() {
    if (!(nav instanceof HTMLElement) || !nav.classList.contains('open')) return;

    nav.hidden = false;
    nav.removeAttribute('hidden');
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');

    setImportant(nav, 'display', 'grid');
    setImportant(nav, 'visibility', 'visible');
    setImportant(nav, 'opacity', '1');
    setImportant(nav, 'pointer-events', 'auto');
    setImportant(nav, 'position', 'fixed');
    setImportant(nav, 'z-index', '12045');
    setImportant(nav, 'transform', 'none');
    setImportant(nav, 'overflow-y', 'auto');
    setImportant(nav, 'overflow-x', 'hidden');

    if (isMobile()) {
      setImportant(nav, 'top', '72px');
      setImportant(nav, 'right', '12px');
      setImportant(nav, 'bottom', 'auto');
      setImportant(nav, 'left', '12px');
      setImportant(nav, 'width', 'auto');
      setImportant(nav, 'max-width', 'none');
      setImportant(nav, 'max-height', 'calc(100dvh - 84px)');
    } else {
      setImportant(nav, 'top', '76px');
      setImportant(nav, 'right', '22px');
      setImportant(nav, 'bottom', 'auto');
      setImportant(nav, 'left', 'auto');
      setImportant(nav, 'width', 'min(360px, calc(100vw - 44px))');
      setImportant(nav, 'max-width', '360px');
      setImportant(nav, 'max-height', 'calc(100dvh - 96px)');
    }

    root.dataset.fxNavStateOwnerR265 = 'open-owned';
  }

  function reconcile() {
    queued = false;
    if (!(nav instanceof HTMLElement)) return;
    if (nav.classList.contains('open')) {
      enforceOpenState();
      return;
    }

    clearOwnedGeometry(nav);
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
    root.dataset.fxNavStateOwnerR265 = 'ready';
  }

  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(reconcile);
  }

  function bind() {
    const current = document.getElementById('main-nav');
    if (!(current instanceof HTMLElement)) return false;

    if (observer && nav !== current) observer.disconnect();
    nav = current;
    nav.dataset.fxNavStateOwnerR265 = 'true';

    observer = new MutationObserver(schedule);
    observer.observe(nav, {
      attributes: true,
      attributeFilter: ['class', 'hidden', 'aria-hidden', 'inert', 'style']
    });

    reconcile();
    root.dataset.fxNavStateOwnerR265 = 'ready';
    return true;
  }

  function boot() {
    if (bind()) return;
    const bootObserver = new MutationObserver(() => {
      if (!bind()) return;
      bootObserver.disconnect();
    });
    bootObserver.observe(document.documentElement, { subtree: true, childList: true });
    setTimeout(() => bootObserver.disconnect(), 5000);
  }

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });
  addEventListener('pageshow', schedule, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
