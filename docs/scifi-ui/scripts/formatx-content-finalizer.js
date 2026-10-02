(function () {
  'use strict';

  const ROOT = document.documentElement;

  // Metadata notifications may repeat or arrive after the UI is already ready.
  // Reconcile actual changes without replacing text nodes or waking observers.
  function setAttributeIfChanged(element, name, value) {
    if (element && element.getAttribute(name) !== value) element.setAttribute(name, value);
  }

  function setTextIfChanged(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function bilingual(element, hu, en) {
    if (!element) return;
    setAttributeIfChanged(element, 'data-hu', hu);
    setAttributeIfChanged(element, 'data-en', en);
    setTextIfChanged(element, language() === 'en' ? en : hu);
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
    if (element && (element.style.getPropertyValue(property) !== value
      || element.style.getPropertyPriority(property) !== 'important')) {
      element.style.setProperty(property, value, 'important');
    }
  }

  function ensureCrawlableHeroLinks() {
    const actions = Array.from(document.querySelectorAll('#hero .hero-actions a'));
    actions.forEach(link => {
      if (link.hasAttribute('href') && link.getAttribute('href')) return;
      const label = `${link.textContent || ''} ${link.getAttribute('aria-label') || ''}`.toLowerCase();
      if (link.matches('[data-fx-simulator-entry]') || /szimulátor|simulator|operational twin/.test(label)) {
        link.href = '/scifi-ui/project-simulator.html';
      } else if (/android/.test(label)) {
        link.href = '/download/android';
      }
    });

    const destinations = ['#hero', '#experience', '#capabilities', '#pricing', '#system', '#resources'];
    document.querySelectorAll('#hero .fx-organism-map a[data-organ-node]').forEach((link, index) => {
      if (!link.hasAttribute('href') || !link.getAttribute('href')) {
        link.href = destinations[index] || '#hero';
      }
    });
    setAttributeIfChanged(ROOT, 'data-fx-crawlable-hero-links', 'ready-v1');
  }

  function ensureMobileCoreButton(languageContainer, languageToggle) {
    if (!(languageContainer instanceof HTMLElement)) return;

    let coreButton = languageContainer.querySelector('[data-fx-mobile-core-button]');
    if (ROOT.dataset.fxMobileReferenceLayout === 'ready-v1'
      || document.querySelector('.fx-reference-mag-button')) {
      coreButton?.remove();
      return;
    }
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
    setAttributeIfChanged(coreButton,
      'aria-label',
      language() === 'en' ? 'Return to the FormatX core' : 'Vissza a FormatX Maghoz'
    );
    setAttributeIfChanged(coreButton, 'title', language() === 'en' ? 'FormatX core' : 'FormatX Mag');

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
      if (languageContainer.hidden) languageContainer.hidden = false;
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
      if (languageToggle.hidden) languageToggle.hidden = false;
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
      setTextIfChanged(value, values[index][0]);
      setTextIfChanged(label, values[index][1]);
      setAttributeIfChanged(fact, 'data-state', values[index][0] === '—' ? 'unavailable' : 'available');
    });

    const labels = document.querySelectorAll('#hero .hero-label');
    if (labels[0]) {
      setTextIfChanged(labels[0].querySelector('span'), '01/04');
      setTextIfChanged(labels[0].querySelector('b'), 'METHOD STEP');
    }
    if (labels[1]) {
      setTextIfChanged(labels[1].querySelector('span'), 'FULL');
      setTextIfChanged(labels[1].querySelector('b'), 'PUBLIC RELEASE');
    }
    if (labels[2]) {
      setTextIfChanged(labels[2].querySelector('span'), issues == null
        ? '—'
        : String(issues).padStart(2, '0'));
      setTextIfChanged(labels[2].querySelector('b'), 'KNOWN LIMITS');
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
      'Teljes multiplatform verzió letöltése',
      'Download full multiplatform version'
    );
    setAttributeIfChanged(label, 'data-release-download-label', 'true');
    setAttributeIfChanged(link, 'data-release-download', 'multiplatform');
    setAttributeIfChanged(link, 'data-release-channel', 'multiplatform');
    link.removeAttribute('download');

    if (asset?.available === true && allowed(asset.download_url)) {
      setAttributeIfChanged(link, 'href', asset.download_url);
      link.classList.toggle('is-metadata-fallback', false);
      link.classList.toggle('is-disabled', false);
      link.removeAttribute('aria-disabled');
    } else {
      setAttributeIfChanged(link, 'href', '/scifi-ui/downloads/');
      link.classList.toggle('is-metadata-fallback', true);
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
    // Keep the server/static hero lead as the first-paint LCP element. Rewriting
    // this paragraph after JavaScript startup caused late LCP and layout shift.
    ensureCrawlableHeroLinks();

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
    setAttributeIfChanged(ROOT, 'data-fx-content-finalizer', 'ready-v4');
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
