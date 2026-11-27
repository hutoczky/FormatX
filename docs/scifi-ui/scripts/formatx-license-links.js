(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (/^ready-v(?:2|3)$/.test(ROOT.dataset.fxLicenceLinks || '')) return;
  ROOT.dataset.fxLicenceLinks = 'loading-v3';

  const pendingRoots = new Set();
  let frame = 0;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function localLicenceUrl() {
    const url = new URL('/scifi-ui/license.html', location.origin);
    url.searchParams.set('lang', language());
    return url.pathname + url.search;
  }

  function ensureFooterLink() {
    const nav = document.querySelector('.site-footer nav');
    if (!nav || nav.querySelector('[data-fx-local-licence]')) return null;

    const link = document.createElement('a');
    link.dataset.fxLocalLicence = 'true';
    link.dataset.internalLink = 'true';
    link.dataset.hu = 'Licenc';
    link.dataset.en = 'Licence';
    link.textContent = language() === 'en' ? 'Licence' : 'Licenc';
    link.href = localLicenceUrl();

    const terms = nav.querySelector('a[href*="terms.html"]');
    if (terms) terms.before(link);
    else nav.prepend(link);
    return link;
  }

  function localiseLink(link, localUrl) {
    if (!(link instanceof HTMLAnchorElement)) return;
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim().toLowerCase();
    const isGithubLicence = /github\.com\/hutoczky\/FormatX\/(?:blob|raw)\/[^/]+\/LICENSE/i.test(href);
    const isLegacyTextLicence = /(?:^|\/)Licenc\.txt(?:\?|$)/i.test(href);
    const isDetailedLicenceLabel = /^(részletes licenc|full licence|detailed licence)$/i.test(text);

    if (!(
      isGithubLicence ||
      isLegacyTextLicence ||
      isDetailedLicenceLabel ||
      link.dataset.fxLicenceLink === 'true' ||
      link.dataset.fxLocalLicence === 'true'
    )) return;

    if (link.getAttribute('href') !== localUrl) link.href = localUrl;
    if (link.hasAttribute('target')) link.removeAttribute('target');
    if (link.hasAttribute('rel')) link.removeAttribute('rel');
    if (link.dataset.internalLink !== 'true') link.dataset.internalLink = 'true';
    if (link.dataset.fxLocalLicence === 'true') {
      const label = language() === 'en' ? 'Licence' : 'Licenc';
      if (link.textContent !== label) link.textContent = label;
    }
  }

  function scan(scope) {
    const localUrl = localLicenceUrl();
    if (scope instanceof HTMLAnchorElement) localiseLink(scope, localUrl);
    if (!(scope instanceof Document || scope instanceof DocumentFragment || scope instanceof Element)) return;
    scope.querySelectorAll('a[href],a[data-fx-licence-link],a[data-fx-local-licence]').forEach(link => localiseLink(link, localUrl));
  }

  function flush() {
    frame = 0;
    ensureFooterLink();
    const roots = Array.from(pendingRoots);
    pendingRoots.clear();
    roots.forEach(scope => { if (scope === document || scope.isConnected || scope instanceof DocumentFragment) scan(scope); });
    ROOT.dataset.fxLicenceLinks = 'ready-v3';
  }

  function schedule(scope = document) {
    // R2297: collapse overlapping mutation roots before the next scan.
    if (scope !== document && !(scope instanceof DocumentFragment)
        && !(scope instanceof HTMLAnchorElement)
        && !(scope instanceof Element && scope.querySelector('a'))) return;
    for (const queued of pendingRoots) {
      if (queued === scope || queued.contains?.(scope)) return;
      if (scope.contains?.(queued)) pendingRoots.delete(queued);
    }
    pendingRoots.add(scope);
    if (frame) return;
    frame = requestAnimationFrame(flush);
  }

  ensureFooterLink();
  scan(document);
  ROOT.dataset.fxLicenceLinks = 'ready-v3';

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => schedule(document), { once: true });
  addEventListener('formatx:languagechange', () => schedule(document));
  addEventListener('formatx:organisminterfaceready', () => schedule(document));
  addEventListener('formatx:organismpanelopen', event => schedule(event.target instanceof Element ? event.target : document));

  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element || node instanceof DocumentFragment) schedule(node);
      }
    }
  });
  const observeTarget = document.body || document.documentElement;
  observer.observe(observeTarget, { subtree: true, childList: true });
  addEventListener('pagehide', () => {
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pendingRoots.clear();
  });
  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    observer.observe(document.body || document.documentElement, { subtree: true, childList: true });
    schedule(document);
  });
}());
