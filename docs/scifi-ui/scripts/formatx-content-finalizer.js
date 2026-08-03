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

  function mobileMode() {
    return matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  }

  function setImportant(element, property, value) {
    element?.style.setProperty(property, value, 'important');
  }

  function ensureMobileCoreButton(languageContainer, languageToggle) {
    if (!(languageContainer instanceof HTMLElement)) return;

    let coreButton = languageContainer.querySelector('[data-fx-mobile-core-button]');
    if (!(coreButton instanceof HTMLAnchorElement)) {
      coreButton = document.createElement('a');
      coreButton.href = '#hero';
      coreButton.className = 'fx-mobile-core-button';
      coreButton.dataset.fxMobileCoreButton = 'true';
      coreButton.addEventListener('click', event => {
        event.preventDefault();

        const source = document.querySelector(
          '.fx-rail [data-scene-link="0"], .fx-organism-map [data-organ-node="0"]'
        );
        if (source instanceof HTMLElement && source !== coreButton) {
          source.click();
          return;
        }

        const hero = document.getElementById('hero');
        hero?.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
        history.replaceState({}, '', location.pathname + location.search + '#hero');
      });
      languageContainer.insertBefore(coreButton, languageToggle || languageContainer.firstChild);
    }

    bilingual(coreButton, 'MAG', 'CORE');
    coreButton.setAttribute(
      'aria-label',
      language() === 'en' ? 'Return to the FormatX core' : 'Vissza a FormatX Maghoz'
    );
    coreButton.title = language() === 'en' ? 'FormatX core' : 'FormatX Mag';

    setImportant(coreButton, 'position', 'relative');
    setImportant(coreButton, 'display', 'inline-flex');
    setImportant(coreButton, 'align-items', 'center');
    setImportant(coreButton, 'justify-content', 'center');
    setImportant(coreButton, 'width', '48px');
    setImportant(coreButton, 'height', '34px');
    setImportant(coreButton, 'min-width', '48px');
    setImportant(coreButton, 'padding', '0 8px');
    setImportant(coreButton, 'color', 'rgba(231, 247, 253, .9)');
    setImportant(coreButton, 'border', '1px solid rgba(178, 230, 249, .24)');
    setImportant(coreButton, 'border-radius', '11px');
    setImportant(coreButton, 'background', 'rgba(3, 10, 18, .78)');
    setImportant(coreButton, 'box-shadow', 'inset 0 0 0 1px rgba(255,255,255,.02), 0 8px 24px rgba(0,0,0,.22)');
    setImportant(coreButton, 'font-family', 'var(--font-mono, ui-monospace, SFMono-Regular, Consolas, monospace)');
    setImportant(coreButton, 'font-size', '9px');
    setImportant(coreButton, 'font-weight', '800');
    setImportant(coreButton, 'letter-spacing', '.08em');
    setImportant(coreButton, 'line-height', '1');
    setImportant(coreButton, 'text-decoration', 'none');
    setImportant(coreButton, 'touch-action', 'manipulation');
    setImportant(coreButton, 'visibility', 'visible');
    setImportant(coreButton, 'opacity', '1');
  }

  function finalizeMobileControls() {
    if (!mobileMode()) return;

    const languageContainer = document.querySelector('.fx-single-language-switch');
    if (languageContainer instanceof HTMLElement && document.body
      && languageContainer.parentElement !== document.body) {
      document.body.appendChild(languageContainer);
    }
    if (languageContainer instanceof HTMLElement) {
      languageContainer.hidden = false;
      languageContainer.removeAttribute('aria-hidden');
      setImportant(languageContainer, 'display', 'inline-flex');
      setImportant(languageContainer, 'align-items', 'center');
      setImportant(languageContainer, 'justify-content', 'center');
      setImportant(languageContainer, 'gap', '8px');
      setImportant(languageContainer, 'position', 'fixed');
      setImportant(languageContainer, 'top', '14px');
      setImportant(languageContainer, 'right', '70px');
      setImportant(languageContainer, 'min-width', 'auto');
      setImportant(languageContainer, 'z-index', '10040');
      setImportant(languageContainer, 'visibility', 'visible');
      setImportant(languageContainer, 'opacity', '1');
    }

    const languageToggle = document.querySelector('.fx-language-toggle');
    if (languageToggle instanceof HTMLElement) {
      languageToggle.hidden = false;
      setImportant(languageToggle, 'display', 'inline-flex');
      setImportant(languageToggle, 'visibility', 'visible');
      setImportant(languageToggle, 'opacity', '1');
    }
    ensureMobileCoreButton(languageContainer, languageToggle);

    const dialogue = document.querySelector('.fx-organism-dialogue:not(.is-open)');
    if (dialogue instanceof HTMLElement) {
      setImportant(dialogue, 'position', 'fixed');
      setImportant(dialogue, 'top', 'auto');
      setImportant(dialogue, 'right', '10px');
      setImportant(dialogue, 'bottom', '150px');
      setImportant(dialogue, 'left', 'auto');
      setImportant(dialogue, 'width', '58px');
      setImportant(dialogue, 'max-width', '58px');
      setImportant(dialogue, 'transform', 'none');
      setImportant(dialogue, 'translate', 'none');
      setImportant(dialogue, 'z-index', '10030');
    }

    const thought = dialogue?.querySelector('.fx-organism-thought-trigger');
    if (thought instanceof HTMLElement) {
      setImportant(thought, 'position', 'relative');
      setImportant(thought, 'inset', 'auto');
      setImportant(thought, 'top', 'auto');
      setImportant(thought, 'right', 'auto');
      setImportant(thought, 'bottom', 'auto');
      setImportant(thought, 'left', 'auto');
      setImportant(thought, 'transform', 'none');
      setImportant(thought, 'translate', 'none');
    }

    const genome = document.querySelector('.fx-genome-launcher');
    if (genome instanceof HTMLElement) {
      setImportant(genome, 'position', 'fixed');
      setImportant(genome, 'top', '170px');
      setImportant(genome, 'right', '10px');
      setImportant(genome, 'bottom', 'auto');
      setImportant(genome, 'left', 'auto');
      setImportant(genome, 'width', '58px');
      setImportant(genome, 'max-width', '58px');
      setImportant(genome, 'transform', 'none');
      setImportant(genome, 'translate', 'none');
      setImportant(genome, 'z-index', '10020');
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
    finalizeMobileControls();
    ROOT.dataset.fxContentFinalizer = 'ready-v2';
  }

  [
    'formatx:languagechange',
    'formatx:platformstatusready',
    'formatx:organisminterfaceready',
    'formatx:releasemetadataready'
  ].forEach(name => addEventListener(name, apply));

  addEventListener('resize', finalizeMobileControls, { passive: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  setTimeout(apply, 1200);
  setTimeout(apply, 3600);
}());
