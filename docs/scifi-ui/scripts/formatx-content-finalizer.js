(function () {
  'use strict';

  const ROOT = document.documentElement;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function bilingual(element, hu, en) {
    if (!element) return;
    element.dataset.hu = hu;
    element.dataset.en = en;
    element.textContent = language() === 'en' ? en : hu;
  }

  function release() {
    return ROOT.__FORMATX_RELEASE_METADATA__?.release || null;
  }

  function content() {
    return ROOT.__FORMATX_CONTENT_DATA__ || {};
  }

  function allowed(url) {
    try {
      const parsed = new URL(url, location.origin);
      return parsed.origin === location.origin || (
        parsed.protocol === 'https:'
        && parsed.hostname === 'github.com'
        && parsed.pathname.startsWith('/hutoczky/FormatX-Updates/releases/download/')
      );
    } catch (_) {
      return false;
    }
  }

  function updateTelemetry() {
    const data = content();
    const facts = document.querySelectorAll('#hero .hero-facts > span');
    const platforms = Array.isArray(data.status?.platforms) ? data.status.platforms.length : null;
    const verified = Array.isArray(data.tests?.cases)
      ? data.tests.cases.filter(item => item.status === 'verified').length
      : null;
    const issues = Array.isArray(data.issues?.items) ? data.issues.items.length : null;

    const values = [
      ['04', language() === 'en' ? 'method steps' : 'módszerlépés'],
      [
        platforms == null ? '—' : String(platforms).padStart(2, '0'),
        language() === 'en' ? 'published platform states' : 'közzétett platformállapot'
      ],
      [
        verified == null ? '—' : String(verified).padStart(2, '0'),
        language() === 'en' ? 'verified public tests' : 'ellenőrzött nyilvános teszt'
      ]
    ];

    facts.forEach((fact, index) => {
      if (!values[index]) return;
      const value = fact.querySelector('b');
      const label = fact.querySelector('small');
      if (value) value.textContent = values[index][0];
      if (label) label.textContent = values[index][1];
      fact.dataset.state = values[index][0] === '—' ? 'unavailable' : 'available';
    });

    const labels = document.querySelectorAll('#hero .hero-label');
    if (labels[0]) {
      labels[0].querySelector('span').textContent = '01/04';
      labels[0].querySelector('b').textContent = 'METHOD STEP';
    }
    if (labels[1]) {
      labels[1].querySelector('span').textContent = 'BETA';
      labels[1].querySelector('b').textContent = 'PUBLIC RELEASE';
    }
    if (labels[2]) {
      labels[2].querySelector('span').textContent = issues == null
        ? '—'
        : String(issues).padStart(2, '0');
      labels[2].querySelector('b').textContent = 'KNOWN LIMITS';
    }
  }

  function updateDownload() {
    const link = document.getElementById('hero-download');
    if (!link) return;

    const metadata = release();
    const asset = metadata?.channels?.multiplatform || metadata?.channels?.windows || null;
    const label = link.querySelector('[data-release-download-label], span') || link;

    bilingual(
      label,
      'Multiplatform nyilvános béta letöltése',
      'Download multiplatform public beta'
    );
    label.dataset.releaseDownloadLabel = 'true';
    link.dataset.releaseDownload = 'multiplatform';
    link.dataset.releaseChannel = 'multiplatform';
    link.removeAttribute('download');

    if (asset?.available === true && allowed(asset.download_url)) {
      link.href = asset.download_url;
      link.classList.remove('is-metadata-fallback', 'is-disabled');
      link.removeAttribute('aria-disabled');
    } else {
      link.href = '/scifi-ui/downloads/';
      link.classList.add('is-metadata-fallback');
    }
  }

  function ensureLicenceLink() {
    const footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('[data-fx-licence-link]')) return;

    const nav = footer.querySelectorAll('nav')[1] || footer.querySelector('nav');
    if (!nav) return;

    const link = document.createElement('a');
    link.href = './license.html';
    link.dataset.fxLicenceLink = 'true';
    bilingual(link, 'Licenc', 'Licence');
    nav.prepend(link);
  }

  function apply() {
    const lead = document.querySelector('#hero .hero-lead');
    bilingual(
      lead,
      'A FormatX Suite Pro független fejlesztésű technikusi szoftver. Valós rendszerállapotot tár fel, műveleti tervet készít, csak kontrollált megerősítés után hajt végre, majd visszaellenőrzi az eredményt.',
      'FormatX Suite Pro is independently developed technician software. It discovers real system state, builds an operation plan, executes only after controlled confirmation, then verifies the result.'
    );

    const navigation = [
      ['#experience', 'Idegrendszer — Hogyan működik', 'Nervous system — How it works'],
      ['#capabilities', 'Szervek — Funkciók és modulok', 'Organs — Functions and modules'],
      ['#pricing', 'Kereskedelmi szív — Licencek és árak', 'Commerce heart — Licences and pricing'],
      ['#system', 'Váz — Technológia és biztonság', 'Skeleton — Technology and safety'],
      ['#resources', 'Jeladó — Letöltés és bizonyítékok', 'Beacon — Downloads and evidence']
    ];
    navigation.forEach(([href, hu, en]) => {
      document.querySelectorAll(`#main-nav a[href="${href}"]`).forEach(element => {
        bilingual(element, hu, en);
      });
    });

    updateDownload();
    updateTelemetry();
    ensureLicenceLink();
    ROOT.dataset.fxContentFinalizer = 'ready-v2';
  }

  [
    'formatx:languagechange',
    'formatx:platformstatusready',
    'formatx:organisminterfaceready',
    'formatx:releasemetadataready'
  ].forEach(name => addEventListener(name, apply));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  setTimeout(apply, 1200);
  setTimeout(apply, 3600);
}());
