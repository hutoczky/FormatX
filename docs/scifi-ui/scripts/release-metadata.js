(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxReleaseMetadata === 'ready-v3') return;
  ROOT.dataset.fxReleaseMetadata = 'loading-v3';

  const RELEASE_URL = '/scifi-ui/data/current-release.json';
  const FALLBACK = Object.freeze({
    hu: {
      windows: 'Windows nyilvános béta letöltése',
      unavailable: 'A hivatalos Windows-csomag metaadata jelenleg nem érhető el.',
      beta: 'Tesztelhető béta kiadás. Még nem Stable verzió.',
      unknown: 'Nincs közzétett adat',
      integrity: {
        package_only: 'Csomag közzétéve; külön integritási bizonyíték nincs',
        digest_published: 'SHA-256 vagy ellenőrzőösszeg közzétéve',
        digest_and_signature_published: 'Digest és aláírási bizonyíték közzétéve'
      }
    },
    en: {
      windows: 'Download Windows public beta',
      unavailable: 'Official Windows package metadata is currently unavailable.',
      beta: 'Testable beta release. Not yet a Stable version.',
      unknown: 'No published data',
      integrity: {
        package_only: 'Package published; no separate integrity proof',
        digest_published: 'SHA-256 or checksum evidence published',
        digest_and_signature_published: 'Digest and signature evidence published'
      }
    }
  });

  let state = { release: null, available: false, error: null };

  const language = () => ROOT.lang === 'en' ? 'en' : 'hu';
  const copy = () => FALLBACK[language()];
  const safeText = value => typeof value === 'string' ? value.trim() : '';

  function isAllowedDownloadUrl(value) {
    try {
      const url = new URL(value, location.origin);
      if (url.origin === location.origin) return true;
      return url.protocol === 'https:'
        && url.hostname === 'github.com'
        && url.pathname.startsWith('/hutoczky/FormatX-Updates/releases/download/');
    } catch (_) {
      return false;
    }
  }

  function isAllowedReleaseUrl(value) {
    try {
      const url = new URL(value, location.origin);
      return url.protocol === 'https:'
        && url.hostname === 'github.com'
        && url.pathname.startsWith('/hutoczky/FormatX-Updates/releases/');
    } catch (_) {
      return false;
    }
  }

  function releaseVersion() {
    return safeText(state.release?.version);
  }

  function releaseDate(value = state.release?.published_at) {
    const raw = safeText(value);
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language() === 'en' ? 'en-GB' : 'hu-HU', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const units = ['B', 'KiB', 'MiB', 'GiB'];
    let index = 0;
    let amount = bytes;
    while (amount >= 1024 && index < units.length - 1) {
      amount /= 1024;
      index += 1;
    }
    return new Intl.NumberFormat(language() === 'en' ? 'en-GB' : 'hu-HU', {
      maximumFractionDigits: index >= 2 ? 2 : 0
    }).format(amount) + ' ' + units[index];
  }

  function windowsAsset() {
    const asset = state.release?.channels?.windows;
    if (!asset || asset.available !== true || !isAllowedDownloadUrl(asset.download_url)) return null;
    return asset;
  }

  function windowsLabel() {
    const version = releaseVersion();
    if (language() === 'en') return version ? `Download Windows ${version} public beta` : copy().windows;
    return version ? `Windows ${version} nyilvános béta letöltése` : copy().windows;
  }

  function integrityLabel() {
    const status = safeText(state.release?.integrity?.status);
    return copy().integrity[status] || copy().unknown;
  }

  function setText(selector, value, fallback = true) {
    document.querySelectorAll(selector).forEach(element => {
      element.textContent = value || (fallback ? copy().unknown : '');
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
    link.removeAttribute('aria-describedby');

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
    const releaseUrl = safeText(state.release?.release_url);
    const notesUrl = safeText(state.release?.notes_url) || releaseUrl;
    const evidence = state.release?.evidence || {};
    const mappings = [
      ['[data-release-page-url]', releaseUrl, isAllowedReleaseUrl],
      ['[data-release-notes-url]', notesUrl, isAllowedReleaseUrl],
      ['[data-release-checksum-url]', safeText(evidence.checksum_asset_url), isAllowedDownloadUrl],
      ['[data-release-signature-url]', safeText(evidence.signature_asset_url), isAllowedDownloadUrl]
    ];
    mappings.forEach(([selector, href, validator]) => {
      document.querySelectorAll(selector).forEach(link => {
        if (!(link instanceof HTMLAnchorElement)) return;
        if (href && validator(href)) {
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
    const asset = windowsAsset();
    setText('[data-release-version]', version);
    setText('[data-release-date]', releaseDate());
    setText('[data-release-status]', language() === 'en' ? 'Public beta' : 'Nyilvános béta');
    setText('[data-release-sha256]', asset && safeText(asset.digest) ? asset.digest : '');
    setText('[data-release-size]', asset ? formatBytes(asset.size) : '');
    setText('[data-release-integrity]', integrityLabel());
    setText('[data-release-source-updated]', releaseDate(state.release?.source_updated_at));
    document.querySelectorAll('[data-release-download="windows"], #hero-download').forEach(updateDownloadLink);
    updateEvidenceLinks();
    ensureFallbackNotice();
    ROOT.dataset.fxReleaseMetadata = state.available ? 'ready-v3' : 'fallback-v3';
    ROOT.dataset.fxReleaseSchema = String(state.release?.schema_version || 0);
    ROOT.__FORMATX_RELEASE_METADATA__ = Object.freeze({ ...state });
    dispatchEvent(new CustomEvent('formatx:releasemetadataready', { detail: ROOT.__FORMATX_RELEASE_METADATA__ }));
  }

  async function load() {
    try {
      const response = await fetch(RELEASE_URL, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`${RELEASE_URL}: ${response.status}`);
      const release = await response.json();
      const official = release?.source === 'github_published_release'
        && isAllowedReleaseUrl(release.release_url)
        && release.prerelease !== true;
      state = { release, available: release?.ok === true && official, error: official ? null : 'Untrusted release metadata source' };
    } catch (error) {
      state = { release: null, available: false, error: String(error?.message || error).slice(0, 160) };
      ROOT.dataset.fxReleaseMetadataError = state.error;
    }
    apply();
  }

  addEventListener('formatx:languagechange', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());
