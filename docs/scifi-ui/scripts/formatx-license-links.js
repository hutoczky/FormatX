(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxLicenceLinks === 'ready-v1') return;
  ROOT.dataset.fxLicenceLinks = 'loading-v1';

  function localLicenceUrl() {
    const url = new URL('/scifi-ui/license.html', location.origin);
    const language = ROOT.lang === 'en' ? 'en' : 'hu';
    url.searchParams.set('lang', language);
    return url.pathname + url.search;
  }

  function localiseLinks() {
    const localUrl = localLicenceUrl();

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent.trim().toLowerCase();
      const isGithubLicence = /github\.com\/hutoczky\/FormatX\/(?:blob|raw)\/[^/]+\/LICENSE/i.test(href);
      const isLegacyTextLicence = /(?:^|\/)Licenc\.txt(?:\?|$)/i.test(href);
      const isDetailedLicenceLabel = /^(részletes licenc|full licence|detailed licence)$/i.test(text);

      if (isGithubLicence || isLegacyTextLicence || isDetailedLicenceLabel || link.dataset.fxLicenceLink === 'true') {
        link.href = localUrl;
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.dataset.internalLink = 'true';
      }
    });

    ROOT.dataset.fxLicenceLinks = 'ready-v1';
  }

  localiseLinks();
  document.addEventListener('DOMContentLoaded', localiseLinks, { once: true });
  addEventListener('formatx:languagechange', () => requestAnimationFrame(localiseLinks));
  addEventListener('formatx:organisminterfaceready', () => requestAnimationFrame(localiseLinks));
  addEventListener('formatx:organismpanelopen', () => requestAnimationFrame(localiseLinks));

  const observer = new MutationObserver(() => requestAnimationFrame(localiseLinks));
  observer.observe(document.documentElement, { subtree: true, childList: true });
}());
