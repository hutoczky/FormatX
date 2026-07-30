(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxSeo === 'ready-v1') return;
  ROOT.dataset.fxSeo = 'loading-v1';

  const ORIGIN = 'https://www.formatxsuite.com';
  const STATUS_URL = ORIGIN + '/scifi-ui/data/platform-status.json';

  function canonicalPath() {
    let path = location.pathname || '/scifi-ui/';
    if (path === '/scifi-ui/index.html') path = '/scifi-ui/';
    if (path === '/scifi-ui/downloads/index.html') path = '/scifi-ui/downloads/';
    return path;
  }

  function ensureLink(rel, href, hreflang) {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    let link = document.head.querySelector(selector);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      if (hreflang) link.hreflang = hreflang;
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function installLinks() {
    const canonical = ORIGIN + canonicalPath();
    ensureLink('canonical', canonical);
    ensureLink('alternate', canonical + '?lang=hu', 'hu');
    ensureLink('alternate', canonical + '?lang=en', 'en');
    ensureLink('alternate', canonical, 'x-default');
  }

  function pageName(path) {
    const names = {
      '/scifi-ui/': 'FormatX Suite Pro',
      '/scifi-ui/license.html': 'FormatX Suite Pro licence',
      '/scifi-ui/support.html': 'FormatX Suite Pro support',
      '/scifi-ui/terms.html': 'FormatX Suite Pro terms of use',
      '/scifi-ui/privacy.html': 'FormatX Suite Pro privacy notice',
      '/scifi-ui/checkout.html': 'FormatX Suite Pro checkout',
      '/scifi-ui/downloads/': 'FormatX Suite Pro downloads',
      '/scifi-ui/downloads/android.html': 'FormatX Android downloads',
      '/scifi-ui/test-matrix.html': 'FormatX public test matrix'
    };
    return names[path] || document.title || 'FormatX Suite Pro';
  }

  function installStructuredData() {
    const path = canonicalPath();
    const pageUrl = ORIGIN + path;
    const graph = [
      {
        '@type': 'WebSite',
        '@id': ORIGIN + '/#website',
        url: ORIGIN + '/',
        name: 'FormatX Suite Pro',
        inLanguage: ['hu-HU', 'en-GB']
      },
      {
        '@type': 'SoftwareApplication',
        '@id': ORIGIN + '/#software',
        name: 'FormatX Suite Pro',
        softwareVersion: 'V92',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Windows (Public beta); Linux/Bazzite (Development); macOS (Planned); Web (Technical preview); Android (Public beta); iOS/iPadOS (Planned)',
        url: ORIGIN + '/scifi-ui/',
        downloadUrl: ORIGIN + '/scifi-ui/downloads/',
        releaseNotes: 'https://github.com/hutoczky/FormatX/blob/master/RELEASE_NOTES.md',
        license: ORIGIN + '/scifi-ui/license.html',
        maintainer: {
          '@type': 'Person',
          name: 'Hutóczky József',
          email: 'mailto:hutoczky@gmail.com'
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Overall release status', value: 'Public beta' },
          { '@type': 'PropertyValue', name: 'Canonical platform status', value: STATUS_URL },
          { '@type': 'PropertyValue', name: 'Trial period', value: '5 days' },
          { '@type': 'PropertyValue', name: 'Activation', value: 'Manual after bank-transfer verification' }
        ],
        sameAs: ['https://github.com/hutoczky/FormatX']
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl + '#webpage',
        url: pageUrl,
        name: pageName(path),
        isPartOf: { '@id': ORIGIN + '/#website' },
        about: { '@id': ORIGIN + '/#software' },
        inLanguage: ROOT.lang === 'en' ? 'en-GB' : 'hu-HU'
      }
    ];

    let script = document.getElementById('formatx-structured-data');
    if (!script) {
      script = document.createElement('script');
      script.id = 'formatx-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }

  function install() {
    installLinks();
    installStructuredData();
    ROOT.dataset.fxSeo = 'ready-v1';
  }

  addEventListener('formatx:languagechange', install);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
}());
