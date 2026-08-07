(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxInteractionGenomeExport === 'ready') return;

  let applying = false;
  let scheduled = 0;

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function setText(element, text) {
    if (element && element.textContent !== text) element.textContent = text;
  }

  function setImportant(element, property, value) {
    if (element instanceof HTMLElement) {
      element.style.setProperty(property, value, 'important');
    }
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

  function stabilizeMobileGeometry() {
    if (!matchMedia('(max-width: 900px), (pointer: coarse)').matches) return;

    const heroCopy = document.querySelector('#hero .hero-copy');
    setImportant(heroCopy, 'box-sizing', 'border-box');
    setImportant(heroCopy, 'position', 'relative');
    setImportant(heroCopy, 'inset', 'auto');
    setImportant(heroCopy, 'width', 'calc(100% - 108px)');
    setImportant(heroCopy, 'max-width', 'calc(100% - 108px)');
    setImportant(heroCopy, 'margin-left', innerWidth <= 430 ? '12px' : '16px');
    setImportant(heroCopy, 'margin-right', '0');
    setImportant(heroCopy, 'padding-right', '0');
    setImportant(heroCopy, 'transform', 'none');
    setImportant(heroCopy, 'translate', 'none');

    const sound = document.querySelector('.fx-three-sound');
    setImportant(sound, 'box-sizing', 'border-box');
    setImportant(sound, 'display', 'inline-flex');
    setImportant(sound, 'position', 'fixed');
    setImportant(sound, 'top', '72px');
    setImportant(sound, 'right', '10px');
    setImportant(sound, 'bottom', 'auto');
    setImportant(sound, 'left', 'auto');
    setImportant(sound, 'width', '58px');
    setImportant(sound, 'min-width', '58px');
    setImportant(sound, 'max-width', '58px');
    setImportant(sound, 'height', '44px');
    setImportant(sound, 'min-height', '44px');
    setImportant(sound, 'padding', '0');
    setImportant(sound, 'gap', '0');
    setImportant(sound, 'justify-content', 'center');
    setImportant(sound, 'overflow', 'hidden');
    setImportant(sound, 'transform', 'none');
    setImportant(sound, 'translate', 'none');
    setImportant(sound, 'z-index', '10025');
    const soundLabel = sound?.querySelector('span');
    setImportant(soundLabel, 'display', 'none');

    const consoleShell = document.querySelector('.fx-organism-console-shell');
    setImportant(consoleShell, 'box-sizing', 'border-box');
    setImportant(consoleShell, 'position', 'fixed');
    setImportant(consoleShell, 'top', '8px');
    setImportant(consoleShell, 'right', '8px');
    setImportant(consoleShell, 'bottom', '8px');
    setImportant(consoleShell, 'left', '8px');
    setImportant(consoleShell, 'width', 'auto');
    setImportant(consoleShell, 'min-width', '0');
    setImportant(consoleShell, 'max-width', 'calc(100vw - 16px)');
    setImportant(consoleShell, 'height', 'auto');
    setImportant(consoleShell, 'min-height', '0');
    setImportant(consoleShell, 'max-height', 'calc(100svh - 16px)');
    setImportant(consoleShell, 'margin', '0');
    setImportant(consoleShell, 'transform', 'none');
    setImportant(consoleShell, 'translate', 'none');
    setImportant(consoleShell, 'animation', 'none');
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
    const categoryHtml = language() === 'en'
      ? '<strong>Technician Operating Layer</strong>One shared, verifiable workflow for drive management, system diagnostics, installation and safe maintenance.'
      : '<strong>Technikusi operációs réteg</strong>Egy közös, ellenőrizhető munkafolyamat meghajtókezeléshez, rendszerdiagnosztikához, telepítéshez és biztonságos karbantartáshoz.';
    if (category.innerHTML !== categoryHtml) category.innerHTML = categoryHtml;

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

  function ensureLicenceClarity() {
    let section = document.getElementById('fx-licence-clarity');
    const container = document.querySelector('[data-organism-panel="pricing"]')
      || document.getElementById('pricing');
    if (!container) return;

    if (!section) {
      section = document.createElement('section');
      section.id = 'fx-licence-clarity';
      section.className = 'fx-licence-clarity';
      section.dataset.fxLicenceClarity = 'true';
      section.setAttribute('aria-labelledby', 'fx-licence-clarity-title');
      section.innerHTML = '<div class="fx-licence-clarity-copy">'
        + '<p class="section-index"></p><h3 id="fx-licence-clarity-title"></h3><p data-fx-licence-lead></p>'
        + '</div><div class="fx-licence-clarity-details"><ul></ul>'
        + '<div class="fx-licence-clarity-actions">'
        + '<a class="button button-line" href="./license.html"></a>'
        + '<a class="button button-line" href="./terms.html"></a>'
        + '</div><small class="fx-licence-clarity-note"></small></div>';
      const anchor = container.querySelector('#formatx-plan-qr-dock')
        || container.querySelector('.payment')
        || container.lastElementChild;
      if (anchor) anchor.insertAdjacentElement('afterend', section);
      else container.appendChild(section);
    }

    const en = language() === 'en';
    setText(section.querySelector('.section-index'), en ? 'LICENCE TERMS' : 'LICENCFELTÉTELEK');
    setText(section.querySelector('#fx-licence-clarity-title'),
      en ? 'What does the FormatX licence grant?' : 'Mit ad a FormatX licenc?');
    setText(section.querySelector('[data-fx-licence-lead]'), en
      ? 'The trial and paid plans grant permission to use the released FormatX application. They do not transfer ownership of the source code or the FormatX brand.'
      : 'A próbalicenc és a fizetős csomagok a kiadott FormatX alkalmazás használatára jogosítanak. A forráskód és a FormatX márka tulajdonjoga nem kerül át a felhasználóhoz.');

    const items = en ? [
      'A 5-day trial licence for evaluating the full release.',
      'A paid licence is valid for the selected access period and technician/device limits.',
      'Copying, modifying, publishing, reselling or redistributing the software or source code requires prior written permission.',
      'Activation follows manual verification of the bank credit and order reference; there is no automatic renewal.'
    ] : [
      '5 napos próbalicenc a teljes kiadás kipróbálásához.',
      'A fizetős licenc a kiválasztott hozzáférési időre, technikus- és gépkeretre érvényes.',
      'A szoftver vagy a forráskód másolása, módosítása, közzététele, továbbértékesítése vagy terjesztése csak előzetes írásos engedéllyel lehetséges.',
      'Az aktiválás a banki jóváírás és a rendelési azonosító kézi ellenőrzése után történik; automatikus megújítás nincs.'
    ];
    const list = section.querySelector('ul');
    if (list && (list.children.length !== 4
      || Array.from(list.children).some((item, index) => item.textContent !== items[index]))) {
      list.replaceChildren(...items.map(text => Object.assign(document.createElement('li'), {
        textContent: text
      })));
    }

    const actions = section.querySelectorAll('.fx-licence-clarity-actions a');
    setText(actions[0], en ? 'Detailed licence' : 'Részletes licenc');
    setText(actions[1], en ? 'Terms of use' : 'Felhasználási feltételek');
    setText(section.querySelector('.fx-licence-clarity-note'), en
      ? 'This is a plain-language summary. The governing text is contained in the licence and the terms of use.'
      : 'Ez közérthető összefoglaló. Az irányadó szöveget a licenc és a felhasználási feltételek tartalmazzák.');
  }

  function ensureCoreCurrentState() {
    const consoleClosed = root.dataset.fxOrganismConsole === 'closed'
      && !document.body?.classList.contains('fx-organism-panel-open');
    if (root.dataset.fxScene !== '0' || !consoleClosed) return;
    document.querySelector('[data-organ-node="0"]')?.setAttribute('aria-current', 'page');
    document.querySelector('[data-scene-link="0"]')?.setAttribute('aria-current', 'page');
  }

  function forceCloseOrganism() {
    const shell = document.getElementById('fx-organism-console');
    if (shell) {
      shell.hidden = true;
      shell.setAttribute('aria-hidden', 'true');
      shell.classList.remove('is-authorised-open');
      shell.style.setProperty('display', 'none');
    }
    document.querySelectorAll('[data-organism-panel]').forEach(panel => {
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-organism-tab]').forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
    });
    document.body?.classList.remove('fx-organism-panel-open');
    root.dataset.fxOrganismConsole = 'closed';
    root.dataset.fxScene = '0';
    root.dataset.fxOrganismState = 'core';
    root.classList.add('fx-organism-core-active');
    document.getElementById('hero')?.classList.add('is-core-active');
    history.replaceState({}, '', location.pathname + location.search + '#hero');
    schedulePublicState();
  }

  function stabilizePublicState() {
    if (applying) return;
    applying = true;
    try {
      ensureAudioControl();
      stabilizeMobileGeometry();
      ensureHeroContent();
      ensureLicenceClarity();
      ensureCoreCurrentState();

      const download = document.getElementById('hero-download');
      if (download) {
        const label = download.querySelector('[data-release-download-label], span') || download;
        const hu = 'Teljes multiplatform verzió letöltése';
        const en = 'Download full multiplatform version';
        label.dataset.hu = hu;
        label.dataset.en = en;
        label.dataset.releaseDownloadLabel = 'true';
        setText(label, language() === 'en' ? en : hu);
        download.dataset.releaseDownload = 'multiplatform';
        download.dataset.releaseChannel = 'multiplatform';
        download.removeAttribute('download');
      }

      const telemetryValue = document.querySelector('#hero .hero-label.b span');
      const telemetryLabel = document.querySelector('#hero .hero-label.b b');
      setText(telemetryValue, 'FULL');
      setText(telemetryLabel, 'PUBLIC RELEASE');

      const releaseName = document.getElementById('release-name');
      setText(releaseName, language() === 'en'
        ? 'Full multiplatform version'
        : 'Teljes multiplatform verzió');

      const footer = document.querySelector('.site-footer');
      let licence = footer?.querySelector('[data-fx-licence-link], [data-fx-local-licence]');
      if (footer && !licence) {
        const terms = footer.querySelector('a[href="./terms.html"]');
        if (terms) {
          licence = document.createElement('a');
          licence.href = './license.html';
          licence.dataset.fxLicenceLink = 'true';
          licence.dataset.fxLocalLicence = 'true';
          terms.before(licence);
        }
      }
      if (licence) {
        licence.href = './license.html?lang=' + language();
        licence.dataset.fxLicenceLink = 'true';
        licence.dataset.fxLocalLicence = 'true';
        licence.dataset.hu = 'Licenc';
        licence.dataset.en = 'Licence';
        setText(licence, language() === 'en' ? 'Licence' : 'Licenc');
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

    const fingerprint = String(current.fingerprint || fingerprintFallback(current.items));
    const payload = {
      schema: 'formatx-interaction-genome-v1',
      generated_at: new Date().toISOString(),
      local_only: true,
      contains_form_values: false,
      contains_personal_text: false,
      fingerprint_sha256: fingerprint,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio || 1 },
      states: current.items
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'FormatX-Interaction-Genome-'
      + fingerprint.slice(0, 16) + '.fxgenome.json';
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    requestAnimationFrame(() => anchor.remove());
    setTimeout(() => URL.revokeObjectURL(url), 30000);

    root.dataset.fxInteractionGenomeExport = 'completed';
    dispatchEvent(new CustomEvent('formatx:interaction-genome-export', {
      detail: { states: current.items.length, localOnly: true, containsPersonalText: false }
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
  addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    requestAnimationFrame(forceCloseOrganism);
    setTimeout(forceCloseOrganism, 60);
  }, true);

  [
    'formatx:languagechange',
    'formatx:releasemetadataready',
    'formatx:organismstatechange',
    'formatx:organismpanelclose',
    'formatx:loop',
    'pageshow',
    'resize'
  ].forEach(name => addEventListener(name, schedulePublicState));

  const observer = new MutationObserver(schedulePublicState);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });

  stabilizePublicState();
  setTimeout(stabilizePublicState, 0);
  setTimeout(stabilizePublicState, 900);
  setTimeout(stabilizePublicState, 2400);
  root.dataset.fxInteractionGenomeExport = 'ready';
}());
