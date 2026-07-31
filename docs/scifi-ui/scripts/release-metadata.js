(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxReleaseMetadata === 'ready-v1') return;
  ROOT.dataset.fxReleaseMetadata = 'loading-v1';

  const CHANNEL_URL = '/scifi-ui/data/release-channel.json';
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

  let state = {
    channel: null,
    release: null,
    available: false,
    error: null
  };

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return FALLBACK[language()];
  }

  function safeText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function isHttpUrl(value) {
    try {
      const url = new URL(value, location.origin);
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === '127.0.0.1');
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
    if (!asset || asset.available !== true || !isHttpUrl(asset.download_url)) return null;
    return asset;
  }

  function windowsLabel() {
    const version = releaseVersion();
    if (language() === 'en') return version
      ? `Download Windows ${version} public beta`
      : copy().windows;
    return version
      ? `Windows ${version} nyilvános béta letöltése`
      : copy().windows;
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
      element.textContent = value || copy().unknown;
    });
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
      link.classList.remove('is-disabled');
      link.title = windowsLabel();
    } else {
      link.href = '/scifi-ui/downloads/';
      link.setAttribute('aria-describedby', ensureFallbackNotice().id);
      link.classList.add('is-metadata-fallback');
      link.title = copy().unavailable;
    }
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

  function apply() {
    const version = releaseVersion();
    const date = releaseDate();
    const releaseUrl = safeText(state.release && state.release.release_url);
    const notesUrl = safeText(state.release && state.release.notes_url) || releaseUrl;
    const asset = windowsAsset();

    setText('[data-release-version]', version);
    setText('[data-release-date]', date);
    setText('[data-release-status]', language() === 'en' ? 'Public beta' : 'Nyilvános béta');
    setText('[data-release-sha256]', asset && safeText(asset.digest) ? asset.digest : '');

    document.querySelectorAll('[data-release-page-url]').forEach(link => {
      if (!(link instanceof HTMLAnchorElement)) return;
      if (isHttpUrl(releaseUrl)) link.href = releaseUrl;
      else link.removeAttribute('href');
    });
    document.querySelectorAll('[data-release-notes-url]').forEach(link => {
      if (!(link instanceof HTMLAnchorElement)) return;
      if (isHttpUrl(notesUrl)) link.href = notesUrl;
      else link.removeAttribute('href');
    });
    document.querySelectorAll('[data-release-download="windows"], #hero-download').forEach(updateDownloadLink);

    ensureFallbackNotice();
    ROOT.dataset.fxReleaseMetadata = state.available ? 'ready-v1' : 'fallback-v1';
    ROOT.__FORMATX_RELEASE_METADATA__ = Object.freeze({ ...state });
    dispatchEvent(new CustomEvent('formatx:releasemetadataready', { detail: ROOT.__FORMATX_RELEASE_METADATA__ }));
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    return response.json();
  }

  async function load() {
    try {
      const channel = await fetchJson(CHANNEL_URL);
      const apiPath = safeText(channel && channel.source && channel.source.api_path) || '/api/release-metadata';
      const release = await fetchJson(apiPath);
      state = {
        channel,
        release,
        available: release && release.ok === true,
        error: null
      };
    } catch (error) {
      state = {
        channel: null,
        release: null,
        available: false,
        error: String(error && error.message || error).slice(0, 160)
      };
      ROOT.dataset.fxReleaseMetadataError = state.error;
    }
    apply();
  }

  addEventListener('formatx:languagechange', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());
