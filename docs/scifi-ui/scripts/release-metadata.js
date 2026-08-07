(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxReleaseMetadata === 'ready-v6') return;
  ROOT.dataset.fxReleaseMetadata = 'loading-v6';

  const RELEASE_URL = '/scifi-ui/data/current-release.json';
  const FALLBACK = Object.freeze({
    hu: {
      package: 'Teljes multiplatform verzió letöltése',
      unavailable: 'A hivatalos multiplatform csomag metaadata jelenleg nem érhető el.',
      release: 'Bazzite/Linux az elsődleges platform; a Windows támogatott ugyanebben a teljes multiplatform verzióban. A használat 5 napos próbalicenccel indul.',
      status: 'Teljes multiplatform verzió',
      unknown: 'Nincs közzétett adat',
      integrity: {
        package_only: 'Csomag közzétéve; külön integritási bizonyíték nincs',
        digest_published: 'SHA-256 vagy ellenőrzőösszeg közzétéve',
        digest_and_signature_published: 'Digest és aláírási bizonyíték közzétéve'
      }
    },
    en: {
      package: 'Download full multiplatform version',
      unavailable: 'Official multiplatform package metadata is currently unavailable.',
      release: 'Bazzite/Linux is the primary platform; Windows is supported in the same full multiplatform version. Use starts with a 5-day trial licence.',
      status: 'Full multiplatform version',
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

  function firstPartyUrl(value) {
    try {
      const url = new URL(value, location.origin);
      return url.origin === location.origin ? url : null;
    } catch (_) {
      return null;
    }
  }

  function isAllowedDownloadUrl(value) {
    const url = firstPartyUrl(value);
    if (!url) return false;
    return ['/download/multiplatform', '/download/android', '/download/android-native-beta'].includes(url.pathname)
      || url.pathname.startsWith('/scifi-ui/downloads/');
  }

  function isAllowedReleaseUrl(value) {
    const url = firstPartyUrl(value);
    return Boolean(url && url.pathname.startsWith('/scifi-ui/'));
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

  function packageAsset() {
    if (!state.available) return null;
    const asset = state.release?.channels?.multiplatform;
    if (!asset || asset.available !== true || !isAllowedDownloadUrl(asset.download_url)) return null;
    return asset;
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
    notice.textContent = state.available ? copy().release : copy().unavailable;
    return notice;
  }

  function updateDownloadLink(link) {
    if (!(link instanceof HTMLAnchorElement)) return;
    const asset = packageAsset();
    const labelTarget = link.querySelector('[data-release-download-label], span') || link;
    const defaultDescription = link.dataset.releaseDescription
      || link.getAttribute('aria-describedby')
      || '';
    if (defaultDescription) link.dataset.releaseDescription = defaultDescription;

    labelTarget.textContent = copy().package;
    link.dataset.releaseState = asset ? 'available' : 'metadata-unavailable';
    link.dataset.releaseChannel = 'multiplatform';
    link.removeAttribute('download');

    if (asset) {
      link.href = asset.download_url;
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-disabled', 'is-metadata-fallback');
      if (link.dataset.releaseDescription) link.setAttribute('aria-describedby', link.dataset.releaseDescription);
      else link.removeAttribute('aria-describedby');
      link.title = copy().package;
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
    const asset = packageAsset();
    setText('[data-release-version]', '', false);
    setText('[data-release-date]', releaseDate());
    setText('[data-release-status]', copy().status);
    setText('[data-release-sha256]', asset && safeText(asset.digest) ? asset.digest : '');
    setText('[data-release-size]', asset ? formatBytes(asset.size) : '');
    setText('[data-release-integrity]', integrityLabel());
    setText('[data-release-source-updated]', releaseDate(state.release?.source_updated_at));
    document.querySelectorAll(
      '[data-release-download="multiplatform"], [data-release-download="windows"], #hero-download'
    ).forEach(updateDownloadLink);
    updateEvidenceLinks();
    ensureFallbackNotice();
    ROOT.dataset.fxReleaseMetadata = state.available ? 'ready-v6' : 'fallback-v6';
    ROOT.dataset.fxReleaseSchema = String(state.release?.schema_version || 0);
    ROOT.__FORMATX_RELEASE_METADATA__ = Object.freeze({ ...state });
    dispatchEvent(new CustomEvent('formatx:releasemetadataready', { detail: ROOT.__FORMATX_RELEASE_METADATA__ }));
  }

  async function load() {
    try {
      const response = await fetch(RELEASE_URL, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`${RELEASE_URL}: ${response.status}`);
      const release = await response.json();
      const official = release?.source === 'formatx_release_service'
        && isAllowedReleaseUrl(release.release_url)
        && release.prerelease !== true;
      state = {
        release,
        available: release?.ok === true && official,
        error: official ? null : 'Untrusted release metadata source'
      };
    } catch (error) {
      state = {
        release: null,
        available: false,
        error: String(error?.message || error).slice(0, 160)
      };
      ROOT.dataset.fxReleaseMetadataError = state.error;
    }
    apply();
  }

  addEventListener('formatx:languagechange', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());
