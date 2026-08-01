(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInteractionGenomeExport === 'ready') return;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function stabilizePublicCopy() {
    const download = document.getElementById('hero-download');
    if (download) {
      const label = download.querySelector('[data-release-download-label], span') || download;
      const hu = 'Multiplatform nyilvános béta letöltése';
      const en = 'Download multiplatform public beta';
      label.dataset.hu = hu;
      label.dataset.en = en;
      label.dataset.releaseDownloadLabel = 'true';
      label.textContent = language() === 'en' ? en : hu;
      download.dataset.releaseDownload = 'multiplatform';
      download.dataset.releaseChannel = 'multiplatform';
    }

    const releaseTelemetry = document.querySelector('#hero .hero-label.b span');
    if (releaseTelemetry) releaseTelemetry.textContent = 'BETA';
    const releaseCaption = document.querySelector('#hero .hero-label.b b');
    if (releaseCaption) releaseCaption.textContent = 'PUBLIC RELEASE';

    const footer = document.querySelector('.site-footer');
    if (footer && !footer.querySelector('[data-fx-licence-link]')) {
      const terms = footer.querySelector('a[href="./terms.html"]');
      if (terms) {
        const link = document.createElement('a');
        link.href = './license.html';
        link.dataset.fxLicenceLink = 'true';
        link.dataset.hu = 'Licenc';
        link.dataset.en = 'Licence';
        link.textContent = language() === 'en' ? 'Licence' : 'Licenc';
        terms.before(link);
      }
    } else {
      const link = footer?.querySelector('[data-fx-licence-link]');
      if (link) link.textContent = language() === 'en' ? 'Licence' : 'Licenc';
    }
  }

  function fingerprintFallback(items) {
    const value = JSON.stringify(items);
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0)
      .toString(16)
      .padStart(8, '0')
      .repeat(8)
      .slice(0, 64)
      .toUpperCase();
  }

  function exportGenome(event) {
    const button = event.target instanceof Element
      ? event.target.closest('#fx-genome-export')
      : null;
    if (!button) return;

    const api = window.FormatXInteractionGenome;
    if (!api || typeof api.getState !== 'function') return;
    const current = api.getState();
    if (!Array.isArray(current.items) || !current.items.length) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const fingerprint = String(
      current.fingerprint || fingerprintFallback(current.items)
    );
    const payload = {
      schema: 'formatx-interaction-genome-v1',
      generated_at: new Date().toISOString(),
      local_only: true,
      contains_form_values: false,
      contains_personal_text: false,
      fingerprint_sha256: fingerprint,
      viewport: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio || 1
      },
      states: current.items
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: 'application/json;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'FormatX-Interaction-Genome-'
      + fingerprint.slice(0, 16)
      + '.fxgenome.json';
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    requestAnimationFrame(() => anchor.remove());
    setTimeout(() => URL.revokeObjectURL(url), 30000);

    root.dataset.fxInteractionGenomeExport = 'completed';
    dispatchEvent(new CustomEvent('formatx:interaction-genome-export', {
      detail: {
        states: current.items.length,
        localOnly: true,
        containsPersonalText: false
      }
    }));
  }

  document.addEventListener('click', exportGenome, true);
  addEventListener('formatx:languagechange', stabilizePublicCopy);
  addEventListener('formatx:releasemetadataready', stabilizePublicCopy);
  addEventListener('pageshow', stabilizePublicCopy);

  stabilizePublicCopy();
  setTimeout(stabilizePublicCopy, 0);
  setTimeout(stabilizePublicCopy, 1400);
  setTimeout(stabilizePublicCopy, 3800);
  root.dataset.fxInteractionGenomeExport = 'ready';
}());
