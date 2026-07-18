(function () {
  'use strict';

  const THEME_KEY = 'formatx-site-theme';
  const LANGUAGE_KEY = 'formatx-language';
  const RELEASE_API = 'https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest';
  const RELEASE_DOWNLOAD_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/download/';
  const RELEASE_PAGE_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/';
  const FALLBACK_VERSION = 'V92';

  let lastRelease = null;

  installReferencePresentation();

  const elements = {
    menuToggle: document.getElementById('menu-toggle'),
    primaryNav: document.getElementById('primary-nav'),
    heroVersion: document.getElementById('hero-version'),
    heroDownload: document.getElementById('hero-download'),
    releaseDot: document.getElementById('release-state-dot'),
    releaseState: document.getElementById('release-state'),
    releaseName: document.getElementById('release-name'),
    releasePublished: document.getElementById('release-published'),
    releasePageLink: document.getElementById('release-page-link'),
    downloadFileName: document.getElementById('download-file-name'),
    downloadVersion: document.getElementById('download-version'),
    downloadSize: document.getElementById('download-size'),
    downloadPrimary: document.getElementById('download-primary'),
    downloadReleasePage: document.getElementById('download-release-page'),
    checksum: document.getElementById('release-sha256'),
    copyChecksum: document.getElementById('copy-checksum'),
    apiNote: document.getElementById('release-api-note'),
    toast: document.getElementById('toast')
  };

  function initialLanguage() {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {
      // Language persistence is optional.
    }
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function bilingual(hu, en) {
    const language = window.FormatXI18n?.getLanguage?.() || initialLanguage();
    return language === 'hu' ? hu : en;
  }

  function installReferencePresentation() {
    const body = document.body;
    if (!body || !body.classList.contains('future-2041')) return;

    body.classList.add('reference-exact');
    document.documentElement.dataset.theme = 'dark';

    if (!document.querySelector('link[data-reference-2041]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './styles/reference-2041.css?v=20260718-reference-2';
      link.dataset.reference2041 = 'true';
      document.head.appendChild(link);
    }

    const brandStrong = document.querySelector('.future-brand strong');
    const brandSmall = document.querySelector('.future-brand small');
    if (brandStrong) brandStrong.textContent = 'FORMATX';
    if (brandSmall) brandSmall.textContent = 'SUITE PRO';

    const navigationMap = {
      '#system': 'PRODUCT',
      '#platforms': 'PLATFORM',
      '#features': 'TECHNOLOGY',
      '#security': 'SECURITY',
      '#pro': 'PRICING'
    };

    document.querySelectorAll('#primary-nav > a').forEach(function (link) {
      const label = navigationMap[link.getAttribute('href')];
      if (label) {
        link.textContent = label;
      } else if (link.getAttribute('href') === '#downloads') {
        link.dataset.referenceHidden = 'true';
      }
    });

    const headerCta = document.querySelector('.header-cta');
    if (headerCta) {
      headerCta.textContent = 'ENTER PLATFORM';
      headerCta.href = '#downloads';
    }

    const kicker = document.querySelector('.future-hero-copy .future-kicker');
    const title = document.getElementById('hero-title');
    const tagline = document.querySelector('.future-hero-copy .future-tagline');
    const description = document.querySelector('.future-hero-copy .hero-copy');
    const heroActions = document.querySelector('.future-hero-copy .hero-actions');
    const capabilities = document.querySelector('.future-hero-copy .future-capabilities');

    if (kicker) kicker.innerHTML = '<span></span> MODULAR OPERATING PLATFORM';
    if (title) {
      title.innerHTML = '<span class="ref-formatx">FORMATX</span><span class="ref-suite">SUITE <b>PRO</b></span>';
    }
    if (tagline) tagline.innerHTML = 'Built for precision.<br><strong>Designed for the future.</strong>';
    if (description) {
      description.textContent = 'A cross-platform ecosystem engineered for technicians, creators, and professionals who demand complete control.';
    }

    if (heroActions) {
      const buttons = heroActions.querySelectorAll('a');
      if (buttons[0]) {
        buttons[0].innerHTML = 'ENTER THE SYSTEM <span aria-hidden="true">→</span><small id="hero-version" hidden>V92</small>';
      }
      if (buttons[1]) {
        buttons[1].innerHTML = '<span aria-hidden="true">▶</span> WATCH SYSTEM DEMO';
        buttons[1].href = '#features';
      }
    }

    if (capabilities) {
      capabilities.innerHTML = [
        '<span><i aria-hidden="true">●</i> FORMATX CORE ONLINE</span>',
        '<span><i aria-hidden="true">◇</i> TECHNICIAN INTERFACE // 2041</span>'
      ].join('');
    }

    const coreLabel = document.querySelector('.core-label');
    const coreTitle = document.querySelector('.core-topbar strong');
    const coreOnline = document.querySelector('.core-online');
    if (coreLabel) coreLabel.textContent = 'FORMATX SYSTEM INTERFACE';
    if (coreTitle) coreTitle.textContent = 'Core Module / Technology Preview';
    if (coreOnline) coreOnline.innerHTML = '<i aria-hidden="true"></i> ONLINE';

    const coreNavigation = [
      { icon: '◇', target: '#system', label: 'Core' },
      { icon: '▦', target: '#platforms', label: 'Platforms' },
      { icon: '⌁', target: '#features', label: 'Technology' },
      { icon: '⌬', target: '#downloads', label: 'Release' },
      { icon: '⬡', target: '#security', label: 'Security' },
      { icon: '⚙', target: '#pro', label: 'Pricing' }
    ];

    document.querySelectorAll('.core-nav span').forEach(function (item, index) {
      const config = coreNavigation[index];
      if (!config) return;
      item.innerHTML = '<i aria-hidden="true">' + config.icon + '</i>';
      item.title = config.label;
      item.setAttribute('role', 'link');
      item.setAttribute('tabindex', '0');
      item.dataset.target = config.target;
    });

    const telemetryHeadings = document.querySelectorAll('.telemetry-heading');
    if (telemetryHeadings[0]) telemetryHeadings[0].innerHTML = '<span>CORE STATUS</span><strong>100%</strong>';
    if (telemetryHeadings[1]) telemetryHeadings[1].innerHTML = '<span>MODULE SYNC</span><strong>87%</strong>';

    const telemetryNotes = document.querySelectorAll('.telemetry-stack small');
    if (telemetryNotes[0]) telemetryNotes[0].textContent = 'Windows · Linux / Bazzite · macOS';
    if (telemetryNotes[1]) telemetryNotes[1].textContent = 'Quantum-safe release integrity';

    const metrics = document.querySelectorAll('.core-metrics > div');
    const metricData = [
      ['CORE ENGINE', 'ONLINE', 'modular operating platform'],
      ['SECURITY GRID', 'ACTIVE', 'SHA256 / Ed25519'],
      ['TELEMETRY', 'REAL-TIME', 'zero-fiction system data']
    ];
    metrics.forEach(function (metric, index) {
      const data = metricData[index];
      if (!data) return;
      metric.innerHTML = '<span>' + data[0] + '</span><strong>' + data[1] + '</strong><small>' + data[2] + '</small>';
    });

    const principleData = [
      { icon: '⌬', title: 'CROSS PLATFORM', copy: 'One system. Every environment.', target: '#platforms' },
      { icon: '⬡', title: 'MODULAR BY DESIGN', copy: 'Built to evolve with you.', target: '#features' },
      { icon: '◇', title: 'SECURITY FIRST', copy: 'Protection at every layer.', target: '#security' },
      { icon: '⌁', title: 'REAL-TIME CONTROL', copy: 'Instant insight. Total command.', target: '#downloads' }
    ];

    document.querySelectorAll('.principle-grid article').forEach(function (card, index) {
      const data = principleData[index];
      if (!data) return;
      const icon = card.querySelector(':scope > span');
      const heading = card.querySelector('strong');
      const copy = card.querySelector('small');
      if (icon) icon.textContent = data.icon;
      if (heading) heading.textContent = data.title;
      if (copy) copy.textContent = data.copy;
      card.classList.add('interactive-holo');
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.dataset.target = data.target;
      card.setAttribute('aria-label', data.title + ': ' + data.copy);
    });
  }

  function readThemePreference() {
    if (document.body && document.body.classList.contains('reference-exact')) return 'dark';
    const queryTheme = new URLSearchParams(window.location.search).get('theme');
    if (queryTheme === 'dark' || queryTheme === 'light') return queryTheme;
    try {
      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    } catch (_) {
      // Storage is optional.
    }
    return 'dark';
  }

  function applyTheme(theme, persist) {
    const forcedReferenceDark = document.body && document.body.classList.contains('reference-exact');
    const selectedTheme = forcedReferenceDark ? 'dark' : (theme === 'light' ? 'light' : 'dark');
    document.documentElement.dataset.theme = selectedTheme;
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selectedTheme));
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = selectedTheme === 'light' ? '#e8f2f8' : '#02070d';
    if (persist && !forcedReferenceDark) {
      try {
        window.localStorage.setItem(THEME_KEY, selectedTheme);
      } catch (_) {
        // Theme persistence is optional.
      }
    }
  }

  function initialiseTheme() {
    applyTheme(readThemePreference(), false);
    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.addEventListener('click', function () {
        applyTheme(button.dataset.themeChoice, true);
      });
    });
  }

  function closeMenu() {
    if (!elements.menuToggle || !elements.primaryNav) return;
    elements.primaryNav.classList.remove('open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
  }

  function initialiseMenu() {
    if (!elements.menuToggle || !elements.primaryNav) return;
    elements.menuToggle.addEventListener('click', function () {
      const willOpen = !elements.primaryNav.classList.contains('open');
      elements.primaryNav.classList.toggle('open', willOpen);
      elements.menuToggle.setAttribute('aria-expanded', String(willOpen));
    });
    elements.primaryNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  function initialiseConnectedModules() {
    function activate(element) {
      const target = element.dataset.target;
      if (!target) return;
      const section = document.querySelector(target);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('[data-target]').forEach(function (element) {
      element.addEventListener('click', function () { activate(element); });
      element.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate(element);
        }
      });
    });
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return bilingual('Nem elérhető', 'Not available');
    const unit = bytes >= 1024 ** 3 ? 'GiB' : 'MiB';
    const divisor = unit === 'GiB' ? 1024 ** 3 : 1024 ** 2;
    return new Intl.NumberFormat(initialLanguage() === 'hu' ? 'hu-HU' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(bytes / divisor) + ' ' + unit;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return bilingual('Nem elérhető', 'Not available');
    return new Intl.DateTimeFormat(initialLanguage() === 'hu' ? 'hu-HU' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  function normaliseVersion(tagName) {
    const match = String(tagName || '').match(/^v?(\d+)$/i);
    if (!match) throw new Error(bilingual('Nem támogatott kiadási címke.', 'Unsupported release tag.'));
    return 'V' + match[1];
  }

  function isTrustedUrl(value, prefix) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.href.startsWith(prefix);
    } catch (_) {
      return false;
    }
  }

  function readChecksum(asset) {
    const digest = String(asset.digest || '').replace(/^sha256:/i, '').toLowerCase();
    return /^[a-f0-9]{64}$/.test(digest) ? digest : '';
  }

  function validateRelease(payload) {
    if (!payload || payload.draft || payload.prerelease || !Array.isArray(payload.assets)) {
      throw new Error(bilingual('A stabil kiadás metaadata hiányos.', 'Incomplete stable release metadata.'));
    }
    const version = normaliseVersion(payload.tag_name);
    const expectedName = 'FormatX-Suite-Pro-' + version + '.zip';
    const asset = payload.assets.find(function (candidate) {
      return candidate && candidate.name === expectedName;
    });
    if (!asset || !isTrustedUrl(asset.browser_download_url, RELEASE_DOWNLOAD_PREFIX)) {
      throw new Error(bilingual('A stabil univerzális ZIP nem található.', 'Stable universal ZIP not found.'));
    }
    if (!isTrustedUrl(payload.html_url, RELEASE_PAGE_PREFIX)) {
      throw new Error(bilingual('A kiadási oldal nem megbízható.', 'Untrusted release page.'));
    }
    return {
      version: version,
      name: expectedName,
      url: asset.browser_download_url,
      pageUrl: payload.html_url,
      size: Number(asset.size),
      checksum: readChecksum(asset),
      publishedAt: payload.published_at
    };
  }

  function setLink(element, url, label) {
    if (!element) return;
    element.href = url;
    if (label) element.textContent = label;
  }

  function renderRelease(release) {
    lastRelease = release;
    if (elements.heroVersion) elements.heroVersion.textContent = release.version;
    setLink(elements.heroDownload, release.url);
    if (elements.releaseState) elements.releaseState.textContent = bilingual('ELLENŐRZÖTT GITHUB KIADÁS', 'VERIFIED GITHUB RELEASE');
    if (elements.releaseDot) elements.releaseDot.classList.remove('warning');
    if (elements.releaseName) elements.releaseName.textContent = 'FormatX Suite Pro ' + release.version;
    if (elements.releasePublished) elements.releasePublished.textContent = formatDate(release.publishedAt);
    setLink(elements.releasePageLink, release.pageUrl);
    if (elements.downloadFileName) elements.downloadFileName.textContent = release.name;
    if (elements.downloadVersion) elements.downloadVersion.textContent = release.version;
    if (elements.downloadSize) elements.downloadSize.textContent = formatBytes(release.size);
    setLink(elements.downloadPrimary, release.url, release.version + bilingual(' stabil csomag', ' stable package'));
    setLink(elements.downloadReleasePage, release.pageUrl);
    if (elements.checksum) {
      elements.checksum.textContent = release.checksum || bilingual('Ehhez a kiadáshoz nincs SHA256 metaadat.', 'SHA256 metadata unavailable for this release.');
    }
    if (elements.copyChecksum) elements.copyChecksum.disabled = !release.checksum;
    if (elements.apiNote) {
      elements.apiNote.textContent = release.checksum
        ? bilingual('A letöltési cím és az SHA256 az élő GitHub kiadásból ellenőrizve.', 'Download URL and SHA256 verified from the live GitHub release.')
        : bilingual('A letöltési cím ellenőrzött; SHA256 metaadat nem érkezett.', 'Download URL verified; SHA256 metadata is not present.');
    }
  }

  function renderReleaseFallback() {
    if (elements.releaseState) elements.releaseState.textContent = bilingual('ELLENŐRZÖTT V92 TARTALÉK', 'VERIFIED V92 FALLBACK');
    if (elements.releaseDot) elements.releaseDot.classList.add('warning');
    if (elements.apiNote) {
      elements.apiNote.textContent = bilingual(
        'Az élő kiadáslekérdezés nem érhető el; az ellenőrzött ' + FALLBACK_VERSION + ' tartalék látható.',
        'Live release lookup unavailable; verified ' + FALLBACK_VERSION + ' fallback shown.'
      );
    }
  }

  async function loadLatestRelease() {
    if (!elements.downloadPrimary) return;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller ? window.setTimeout(function () { controller.abort(); }, 8000) : null;
    try {
      const response = await window.fetch(RELEASE_API, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller ? controller.signal : undefined
      });
      if (!response.ok) throw new Error('GitHub API HTTP ' + response.status);
      renderRelease(validateRelease(await response.json()));
    } catch (_) {
      renderReleaseFallback();
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    }
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    window.clearTimeout(showToast.timerId);
    showToast.timerId = window.setTimeout(function () {
      elements.toast.hidden = true;
    }, 2600);
  }

  async function copyChecksum() {
    if (!elements.checksum || !/^[a-f0-9]{64}$/i.test(elements.checksum.textContent.trim())) return;
    const value = elements.checksum.textContent.trim();
    try {
      await navigator.clipboard.writeText(value);
      showToast(bilingual('Az SHA256 ellenőrzőösszeg a vágólapra került.', 'SHA256 checksum copied.'));
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents(elements.checksum);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      showToast(bilingual('Az ellenőrzőösszeg kijelölve. Másold kézzel.', 'Checksum selected. Copy it manually.'));
    }
  }

  function initialiseLicenseCheckout() {
    const grid = document.querySelector('#pro .license-grid');
    if (!grid) return;
    const hu = initialLanguage() === 'hu';
    grid.innerHTML = hu ? [
      '<article class="interactive-holo license-trial">',
      '<p class="eyebrow">PRÓBAHOZZÁFÉRÉS</p>',
      '<h3>5 nap teljes hozzáférés</h3>',
      '<p>Próbáld ki a többplatformos technikusi munkafolyamatot a licenc kiválasztása előtt.</p>',
      '<a class="text-link" href="#downloads">Csomag letöltése</a>',
      '</article>',
      '<article class="interactive-holo license-lite">',
      '<p class="eyebrow">BUSINESS LITE</p>',
      '<h3>19 900 Ft<br>vagy 55 € / hónap</h3>',
      '<p>1 technikus, legfeljebb 10 rendszer. Éves díj: 199 000 Ft vagy 547 €.</p>',
      '<a class="text-link" href="./checkout.html?plan=business_lite&cycle=monthly&currency=HUF">HUF / EUR banki fizetés</a>',
      '</article>',
      '<article class="interactive-holo license-pro">',
      '<p class="eyebrow">BUSINESS PRO</p>',
      '<h3>49 900 Ft<br>vagy 137 € / hónap</h3>',
      '<p>3 technikus, legfeljebb 50 rendszer. Éves díj: 499 000 Ft vagy 1 373 €.</p>',
      '<a class="text-link" href="./checkout.html?plan=business_pro&cycle=monthly&currency=HUF">HUF / EUR banki fizetés</a>',
      '</article>',
      '<article class="interactive-holo license-team">',
      '<p class="eyebrow">TECHNICIAN TEAM</p>',
      '<h3>99 900 Ft<br>vagy 275 € / hónap</h3>',
      '<p>5 technikus, legfeljebb 150 rendszer. Éves díj: 999 000 Ft vagy 2 748 €.</p>',
      '<a class="text-link" href="./checkout.html?plan=technician_team&cycle=monthly&currency=HUF">HUF / EUR banki fizetés</a>',
      '</article>'
    ].join('') : [
      '<article class="interactive-holo license-trial">',
      '<p class="eyebrow">TRIAL ACCESS</p>',
      '<h3>5 days full access</h3>',
      '<p>Explore the cross-platform technician workflow before choosing a licence.</p>',
      '<a class="text-link" href="#downloads">Download package</a>',
      '</article>',
      '<article class="interactive-holo license-lite">',
      '<p class="eyebrow">BUSINESS LITE</p>',
      '<h3>19 900 Ft<br>or 55 € / month</h3>',
      '<p>1 technician, up to 10 systems. Annual: 199 000 Ft or 547 €.</p>',
      '<a class="text-link" href="./checkout.html?plan=business_lite&cycle=monthly&currency=HUF">HUF / EUR bank payment</a>',
      '</article>',
      '<article class="interactive-holo license-pro">',
      '<p class="eyebrow">BUSINESS PRO</p>',
      '<h3>49 900 Ft<br>or 137 € / month</h3>',
      '<p>3 technicians, up to 50 systems. Annual: 499 000 Ft or 1 373 €.</p>',
      '<a class="text-link" href="./checkout.html?plan=business_pro&cycle=monthly&currency=HUF">HUF / EUR bank payment</a>',
      '</article>',
      '<article class="interactive-holo license-team">',
      '<p class="eyebrow">TECHNICIAN TEAM</p>',
      '<h3>99 900 Ft<br>or 275 € / month</h3>',
      '<p>5 technicians, up to 150 systems. Annual: 999 000 Ft or 2 748 €.</p>',
      '<a class="text-link" href="./checkout.html?plan=technician_team&cycle=monthly&currency=HUF">HUF / EUR bank payment</a>',
      '</article>'
    ].join('');
  }

  function initialiseHolographicCards() {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;
    document.querySelectorAll('.interactive-holo').forEach(function (card) {
      if (card.dataset.hologramReady === 'true') return;
      card.dataset.hologramReady = 'true';
      card.addEventListener('pointermove', function (event) {
        const rect = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
        card.style.setProperty('--holo-x', x.toFixed(2) + '%');
        card.style.setProperty('--holo-y', y.toFixed(2) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--holo-x', '50%');
        card.style.setProperty('--holo-y', '50%');
      });
    });
  }

  function loadLanguageLayer() {
    if (document.querySelector('script[data-formatx-i18n]')) return;
    const script = document.createElement('script');
    script.src = './scripts/i18n.js?v=20260718-bilingual-1';
    script.async = false;
    script.dataset.formatxI18n = 'true';
    document.head.appendChild(script);
  }

  window.addEventListener('formatx:languagechange', function () {
    initialiseLicenseCheckout();
    initialiseHolographicCards();
    if (lastRelease) renderRelease(lastRelease);
  });

  initialiseTheme();
  initialiseMenu();
  initialiseConnectedModules();
  initialiseLicenseCheckout();
  initialiseHolographicCards();
  if (elements.copyChecksum) elements.copyChecksum.addEventListener('click', copyChecksum);
  loadLatestRelease();
  loadLanguageLayer();
}());
