(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxReleaseMetadata === 'ready-v2') return;
  ROOT.dataset.fxReleaseMetadata = 'loading-v2';

  const RELEASE_URL = '/scifi-ui/data/current-release.json';
  const FALLBACK = Object.freeze({
    hu: {
      windows: 'Windows nyilvános béta letöltése',
      unavailable: 'A hivatalos Windows-csomag metaadata jelenleg nem érhető el.',
      beta: 'Tesztelhető béta kiadás. Még nem Stable verzió.',
      unknown: 'Nincs közzétett adat'
    },
    en: {
      windows: 'Download Windows public beta',
      unavailable: 'Official Windows package metadata is currently unavailable.',
      beta: 'Testable beta release. Not yet a Stable version.',
      unknown: 'No published data'
    }
  });

  let state = { release: null, available: false, error: null };

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return FALLBACK[language()];
  }

  function safeText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function isAllowedDownloadUrl(value) {
    try {
      const url = new URL(value, location.origin);
      if (url.origin === location.origin) return true;
      return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith('/hutoczky/FormatX-Updates/releases/download/');
    } catch (_) {
      return false;
    }
  }

  function releaseVersion() {
    return safeText(state.release && state.release.version);
  }

  function releaseDate() {
    const raw = safeText(state.release && state.release.published_at);
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'hu-HU', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  function windowsAsset() {
    const asset = state.release && state.release.channels && state.release.channels.windows;
    if (!asset || asset.available !== true || !isAllowedDownloadUrl(asset.download_url)) return null;
    return asset;
  }

  function windowsLabel() {
    const version = releaseVersion();
    if (language() === 'en') return version ? `Download Windows ${version} public beta` : copy().windows;
    return version ? `Windows ${version} nyilvános béta letöltése` : copy().windows;
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
      element.textContent = value || copy().unknown;
    });
  }

  function ensureFallbackNotice() {
    let notice = document.getElementById('formatx-release-fallback-notice');
    if (!notice) {
      notice = document.createElement('p');
      notice.id = 'formatx-release-fallback-notice';
      notice.className = 'fx-release-fallback-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      const heroActions = document.querySelector('#hero .hero-actions');
      const downloadIntro = document.querySelector('.fx-download-intro');
      if (heroActions) heroActions.insertAdjacentElement('afterend', notice);
      else if (downloadIntro) downloadIntro.appendChild(notice);
      else notice.hidden = true;
    }
    notice.textContent = state.available ? copy().beta : copy().unavailable;
    return notice;
  }

  function updateDownloadLink(link) {
    if (!(link instanceof HTMLAnchorElement)) return;
    const asset = windowsAsset();
    const labelTarget = link.querySelector('[data-release-download-label], span') || link;
    labelTarget.textContent = windowsLabel();
    link.dataset.releaseState = asset ? 'available' : 'metadata-unavailable';
    link.removeAttribute('download');

    if (asset) {
      link.href = asset.download_url;
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-disabled', 'is-metadata-fallback');
      link.title = windowsLabel();
    } else {
      link.href = '/scifi-ui/downloads/';
      link.setAttribute('aria-describedby', ensureFallbackNotice().id);
      link.classList.add('is-metadata-fallback');
      link.title = copy().unavailable;
    }
  }

  function updateEvidenceLinks() {
    const releaseUrl = safeText(state.release && state.release.release_url);
    const notesUrl = safeText(state.release && state.release.notes_url) || releaseUrl;
    const evidence = state.release && state.release.evidence || {};
    const mappings = [
      ['[data-release-page-url]', releaseUrl],
      ['[data-release-notes-url]', notesUrl],
      ['[data-release-checksum-url]', safeText(evidence.checksum_asset_url)],
      ['[data-release-signature-url]', safeText(evidence.signature_asset_url)]
    ];
    mappings.forEach(([selector, href]) => {
      document.querySelectorAll(selector).forEach(link => {
        if (!(link instanceof HTMLAnchorElement)) return;
        if (href && isAllowedDownloadUrl(href) || href && href.startsWith('https://github.com/hutoczky/FormatX-Updates/releases/')) {
          link.href = href;
          link.removeAttribute('aria-disabled');
        } else {
          link.removeAttribute('href');
          link.setAttribute('aria-disabled', 'true');
        }
      });
    });
  }

  function apply() {
    const version = releaseVersion();
    const date = releaseDate();
    const asset = windowsAsset();
    setText('[data-release-version]', version);
    setText('[data-release-date]', date);
    setText('[data-release-status]', language() === 'en' ? 'Public beta' : 'Nyilvános béta');
    setText('[data-release-sha256]', asset && safeText(asset.digest) ? asset.digest : '');
    document.querySelectorAll('[data-release-download="windows"], #hero-download').forEach(updateDownloadLink);
    updateEvidenceLinks();
    ensureFallbackNotice();
    ROOT.dataset.fxReleaseMetadata = state.available ? 'ready-v2' : 'fallback-v2';
    ROOT.__FORMATX_RELEASE_METADATA__ = Object.freeze({ ...state });
    dispatchEvent(new CustomEvent('formatx:releasemetadataready', { detail: ROOT.__FORMATX_RELEASE_METADATA__ }));
  }

  async function load() {
    try {
      const response = await fetch(RELEASE_URL, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`${RELEASE_URL}: ${response.status}`);
      const release = await response.json();
      state = { release, available: release && release.ok === true, error: null };
    } catch (error) {
      state = { release: null, available: false, error: String(error && error.message || error).slice(0, 160) };
      ROOT.dataset.fxReleaseMetadataError = state.error;
    }
    apply();
  }

  addEventListener('formatx:languagechange', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());
