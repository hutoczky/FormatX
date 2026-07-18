(function () {
  'use strict';

  const THEME_KEY = 'formatx-site-theme';
  const RELEASE_API = 'https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest';
  const RELEASE_DOWNLOAD_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/download/';
  const RELEASE_PAGE_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/';
  const FALLBACK_VERSION = 'V92';

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

  function readThemePreference() {
    const queryTheme = new URLSearchParams(window.location.search).get('theme');
    if (queryTheme === 'dark' || queryTheme === 'light') return queryTheme;

    try {
      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    } catch (_) {
      // The site remains usable when storage is unavailable.
    }

    return 'dark';
  }

  function applyTheme(theme, persist) {
    const selectedTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = selectedTheme;

    document.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selectedTheme));
    });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = selectedTheme === 'light' ? '#eaf0f3' : '#050a10';

    if (persist) {
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

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return 'Nem elérhető';
    const unit = bytes >= 1024 ** 3 ? 'GiB' : 'MiB';
    const divisor = unit === 'GiB' ? 1024 ** 3 : 1024 ** 2;
    return new Intl.NumberFormat('hu-HU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(bytes / divisor) + ' ' + unit;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Nem elérhető';
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  function normaliseVersion(tagName) {
    const match = String(tagName || '').match(/^v?(\d+)$/i);
    if (!match) throw new Error('A kiadás verziócímkéje nem támogatott.');
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
      throw new Error('A stabil kiadás metaadata hiányos.');
    }

    const version = normaliseVersion(payload.tag_name);
    const expectedName = 'FormatX-Suite-Pro-' + version + '.zip';
    const asset = payload.assets.find(function (candidate) {
      return candidate && candidate.name === expectedName;
    });

    if (!asset || !isTrustedUrl(asset.browser_download_url, RELEASE_DOWNLOAD_PREFIX)) {
      throw new Error('A stabil kiadás univerzális ZIP-je nem található.');
    }

    if (!isTrustedUrl(payload.html_url, RELEASE_PAGE_PREFIX)) {
      throw new Error('A kiadási oldal címe nem megbízható.');
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
    if (elements.heroVersion) elements.heroVersion.textContent = release.version;
    setLink(elements.heroDownload, release.url, release.version + ' letöltése');

    if (elements.releaseState) elements.releaseState.textContent = 'Élő GitHub Release ellenőrizve';
    if (elements.releaseDot) elements.releaseDot.classList.remove('warning');
    if (elements.releaseName) elements.releaseName.textContent = 'FormatX Suite Pro ' + release.version;
    if (elements.releasePublished) elements.releasePublished.textContent = formatDate(release.publishedAt);
    setLink(elements.releasePageLink, release.pageUrl);

    if (elements.downloadFileName) elements.downloadFileName.textContent = release.name;
    if (elements.downloadVersion) elements.downloadVersion.textContent = release.version;
    if (elements.downloadSize) elements.downloadSize.textContent = formatBytes(release.size);
    setLink(elements.downloadPrimary, release.url, release.version + ' univerzális csomag letöltése');
    setLink(elements.downloadReleasePage, release.pageUrl);

    if (elements.checksum) {
      elements.checksum.textContent = release.checksum || 'A GitHub metaadat nem tartalmaz SHA256 értéket.';
    }
    if (elements.copyChecksum) elements.copyChecksum.disabled = !release.checksum;
    if (elements.apiNote) {
      elements.apiNote.textContent = release.checksum
        ? 'A letöltési linket és a SHA256 értéket az élő GitHub kiadásból ellenőriztük.'
        : 'A letöltési link élő és ellenőrzött; ehhez a kiadáshoz nem érkezett SHA256 metaadat.';
    }
  }

  function renderReleaseFallback() {
    if (elements.releaseState) elements.releaseState.textContent = 'Ellenőrzött V92 tartalék link';
    if (elements.releaseDot) elements.releaseDot.classList.add('warning');
    if (elements.apiNote) {
      elements.apiNote.textContent = 'Az élő kiadásellenőrzés nem érhető el; az ellenőrzött ' + FALLBACK_VERSION + ' link látható.';
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
      showToast('A SHA256 ellenőrzőösszeg a vágólapra került.');
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents(elements.checksum);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      showToast('Az ellenőrzőösszeg kijelölve; másold a vágólapra.');
    }
  }

  function initialiseLicenseCheckout() {
    const grid = document.querySelector('#pro .license-grid');
    if (!grid) return;

    grid.innerHTML = [
      '<article>',
      '<p class="eyebrow">PRÓBAIDŐ</p>',
      '<h3>5 nap</h3>',
      '<p>Az első indításkor kezdődik. A próbaidő lejárata után aktiválható a választott licenc.</p>',
      '<a class="text-link" href="#downloads">Csomag letöltése</a>',
      '</article>',
      '<article>',
      '<p class="eyebrow">BUSINESS LITE</p>',
      '<h3>19 900 Ft / hó</h3>',
      '<p>1 technikus, legfeljebb 10 gép. Éves díj: 199 000 Ft.</p>',
      '<a class="text-link" href="./checkout.html?plan=business_lite&cycle=monthly">Revolut fizetés</a>',
      '</article>',
      '<article>',
      '<p class="eyebrow">BUSINESS PRO</p>',
      '<h3>49 900 Ft / hó</h3>',
      '<p>3 technikus, legfeljebb 50 gép. Éves díj: 499 000 Ft.</p>',
      '<a class="text-link" href="./checkout.html?plan=business_pro&cycle=monthly">Revolut fizetés</a>',
      '</article>',
      '<article>',
      '<p class="eyebrow">TECHNICIAN TEAM</p>',
      '<h3>99 900 Ft / hó</h3>',
      '<p>5 technikus, legfeljebb 150 gép. Éves díj: 999 000 Ft.</p>',
      '<a class="text-link" href="./checkout.html?plan=technician_team&cycle=monthly">Revolut fizetés</a>',
      '</article>'
    ].join('');
  }

  initialiseTheme();
  initialiseMenu();
  initialiseLicenseCheckout();
  if (elements.copyChecksum) elements.copyChecksum.addEventListener('click', copyChecksum);
  loadLatestRelease();
}());
