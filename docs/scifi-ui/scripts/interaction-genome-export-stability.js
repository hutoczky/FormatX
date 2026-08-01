(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInteractionGenomeExport === 'ready') return;

  let applying = false;
  let scheduled = 0;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function schedulePublicState() {
    if (scheduled) return;
    scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      stabilizePublicState();
    });
  }

  function ensureAudioControl() {
    if (document.querySelector('.fx-three-sound')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fx-three-sound';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute(
      'aria-label',
      language() === 'en' ? 'Enable the cinematic score' : 'Filmes zene bekapcsolása'
    );
    button.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>'
      + (language() === 'en' ? 'MUSIC OFF' : 'ZENE KI')
      + '</span>';
    document.body.appendChild(button);
  }

  function ensureHeroContent() {
    const heroCopy = document.querySelector('#hero .hero-copy');
    if (!heroCopy) return;

    let category = heroCopy.querySelector('.fx-category-definition');
    if (!category) {
      category = document.createElement('p');
      category.className = 'fx-category-definition';
      const kicker = heroCopy.querySelector('.kicker');
      if (kicker) kicker.insertAdjacentElement('afterend', category);
      else heroCopy.prepend(category);
    }
    category.innerHTML = language() === 'en'
      ? '<strong>Technician Operating Layer</strong>One shared, verifiable workflow for drive management, system diagnostics, installation and safe maintenance.'
      : '<strong>Technikusi operációs réteg</strong>Egy közös, ellenőrizhető munkafolyamat meghajtókezeléshez, rendszerdiagnosztikához, telepítéshez és biztonságos karbantartáshoz.';

    const lead = heroCopy.querySelector('.hero-lead');
    let method = heroCopy.querySelector('.fx-method-inline');
    if (!method) {
      method = document.createElement('ol');
      method.className = 'fx-method-inline';
      method.setAttribute('aria-label', 'FormatX Method');
      lead?.insertAdjacentElement('afterend', method);
    }
    const steps = language() === 'en'
      ? ['Discover', 'Plan', 'Controlled execution', 'Verify']
      : ['Felderítés', 'Terv', 'Kontrollált végrehajtás', 'Visszaellenőrzés'];
    if (method.children.length !== steps.length
      || Array.from(method.children).some((item, index) => item.textContent !== steps[index])) {
      method.replaceChildren(...steps.map(text => Object.assign(document.createElement('li'), {
        textContent: text
      })));
    }
  }

  function ensureCoreCurrentState() {
    const consoleClosed = root.dataset.fxOrganismConsole === 'closed'
      && !document.body?.classList.contains('fx-organism-panel-open');
    if (root.dataset.fxScene !== '0' || !consoleClosed) return;

    const mapCore = document.querySelector('[data-organ-node="0"]');
    const railCore = document.querySelector('[data-scene-link="0"]');
    mapCore?.setAttribute('aria-current', 'page');
    railCore?.setAttribute('aria-current', 'page');
  }

  function stabilizePublicState() {
    if (applying) return;
    applying = true;
    try {
      ensureAudioControl();
      ensureHeroContent();
      ensureCoreCurrentState();

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
        download.removeAttribute('download');
      }

      const telemetryValue = document.querySelector('#hero .hero-label.b span');
      const telemetryLabel = document.querySelector('#hero .hero-label.b b');
      if (telemetryValue) telemetryValue.textContent = 'BETA';
      if (telemetryLabel) telemetryLabel.textContent = 'PUBLIC RELEASE';

      const footer = document.querySelector('.site-footer');
      let licence = footer?.querySelector('[data-fx-licence-link]');
      if (footer && !licence) {
        const terms = footer.querySelector('a[href="./terms.html"]');
        if (terms) {
          licence = document.createElement('a');
          licence.href = './license.html';
          licence.dataset.fxLicenceLink = 'true';
          terms.before(licence);
        }
      }
      if (licence) {
        licence.dataset.hu = 'Licenc';
        licence.dataset.en = 'Licence';
        licence.textContent = language() === 'en' ? 'Licence' : 'Licenc';
      }
    } finally {
      applying = false;
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

  function createExport() {
    const api = window.FormatXInteractionGenome;
    if (!api || typeof api.getState !== 'function') return false;
    const current = api.getState();
    if (!Array.isArray(current.items) || !current.items.length) return false;

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
    requestAnimationFrame(() => {
      root.dataset.fxInteractionGenomeExport = 'ready';
    });
    return true;
  }

  function exportFromClick(event) {
    const button = event.target instanceof Element
      ? event.target.closest('#fx-genome-export')
      : null;
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    createExport();
  }

  window.FormatXExportInteractionGenome = createExport;
  document.addEventListener('click', exportFromClick, true);
  [
    'formatx:languagechange',
    'formatx:releasemetadataready',
    'formatx:organismstatechange',
    'formatx:organismpanelclose',
    'formatx:loop',
    'pageshow'
  ].forEach(name => {
    addEventListener(name, schedulePublicState);
  });

  const observer = new MutationObserver(schedulePublicState);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  stabilizePublicState();
  setTimeout(stabilizePublicState, 0);
  setTimeout(stabilizePublicState, 900);
  setTimeout(stabilizePublicState, 2400);
  root.dataset.fxInteractionGenomeExport = 'ready';
}());
