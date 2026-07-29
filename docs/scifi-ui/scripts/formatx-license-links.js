(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxLicenceLinks === 'ready-v2') return;
  ROOT.dataset.fxLicenceLinks = 'loading-v2';

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
    if (!nav || nav.querySelector('[data-fx-local-licence]')) return;

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
  }

  function localiseLinks() {
    ensureFooterLink();
    const localUrl = localLicenceUrl();

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent.trim().toLowerCase();
      const isGithubLicence = /github\.com\/hutoczky\/FormatX\/(?:blob|raw)\/[^/]+\/LICENSE/i.test(href);
      const isLegacyTextLicence = /(?:^|\/)Licenc\.txt(?:\?|$)/i.test(href);
      const isDetailedLicenceLabel = /^(részletes licenc|full licence|detailed licence)$/i.test(text);

      if (
        isGithubLicence ||
        isLegacyTextLicence ||
        isDetailedLicenceLabel ||
        link.dataset.fxLicenceLink === 'true' ||
        link.dataset.fxLocalLicence === 'true'
      ) {
        link.href = localUrl;
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.dataset.internalLink = 'true';
        if (link.dataset.fxLocalLicence === 'true') {
          link.textContent = language() === 'en' ? 'Licence' : 'Licenc';
        }
      }
    });

    ROOT.dataset.fxLicenceLinks = 'ready-v2';
  }

  localiseLinks();
  document.addEventListener('DOMContentLoaded', localiseLinks, { once: true });
  addEventListener('formatx:languagechange', () => requestAnimationFrame(localiseLinks));
  addEventListener('formatx:organisminterfaceready', () => requestAnimationFrame(localiseLinks));
  addEventListener('formatx:organismpanelopen', () => requestAnimationFrame(localiseLinks));

  const observer = new MutationObserver(() => requestAnimationFrame(localiseLinks));
  observer.observe(document.documentElement, { subtree: true, childList: true });
}());
