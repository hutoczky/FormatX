(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxCopyPolish === 'ready-v1') return;
  root.dataset.fxCopyPolish = 'loading-v1';

  const COPY = Object.freeze({
    title: {
      hu: 'FormatX Suite Pro | Élő rendszerarchitektúra',
      en: 'FormatX Suite Pro | Living System Architecture'
    },
    description: {
      hu: 'FormatX Suite Pro — többplatformos technikusi rendszer meghajtókezeléshez, diagnosztikához, telepítéshez és ellenőrizhető rendszerkarbantartáshoz.',
      en: 'FormatX Suite Pro — a cross-platform technician system for drive management, diagnostics, deployment and verifiable system maintenance.'
    }
  });

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-copy-polish-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/formatx-copy-polish.css?v=20260729-copy-polish-1';
    link.dataset.fxCopyPolishStyle = 'true';
    document.head.appendChild(link);
  }

  function setBilingual(element, hu, en) {
    if (!(element instanceof Element)) return;
    element.dataset.hu = hu;
    element.dataset.en = en;
    element.textContent = language() === 'en' ? en : hu;
  }

  function setAll(selector, hu, en) {
    document.querySelectorAll(selector).forEach(element => setBilingual(element, hu, en));
  }

  function setAria(element, hu, en) {
    if (!(element instanceof Element)) return;
    element.setAttribute('aria-label', language() === 'en' ? en : hu);
  }

  function createCopy(tag, className, hu, en) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    setBilingual(element, hu, en);
    return element;
  }

  function ensureFooterLicenceLink() {
    const terms = document.querySelector('.site-footer a[href="./terms.html"]');
    if (!terms || document.querySelector('.site-footer a[data-fx-licence-link]')) return;
    const link = document.createElement('a');
    link.href = './Licenc.txt';
    link.dataset.fxLicenceLink = 'true';
    setBilingual(link, 'Licenc', 'Licence');
    terms.before(link);
  }

  function ensureLicenceClarity() {
    if (document.getElementById('fx-licence-clarity')) return;

    const container = document.querySelector('[data-organism-panel="pricing"]')
      || document.getElementById('pricing');
    if (!container) return;

    const section = document.createElement('section');
    section.id = 'fx-licence-clarity';
    section.className = 'fx-licence-clarity';
    section.dataset.fxLicenceClarity = 'true';
    section.setAttribute('aria-labelledby', 'fx-licence-clarity-title');

    const copy = document.createElement('div');
    copy.className = 'fx-licence-clarity-copy';
    copy.append(
      createCopy('p', 'section-index', 'LICENCFELTÉTELEK', 'LICENCE TERMS'),
      createCopy('h3', '', 'Mit ad a FormatX licenc?', 'What does the FormatX licence grant?'),
      createCopy(
        'p',
        '',
        'A próbalicenc és a fizetős csomagok a kiadott FormatX alkalmazás használatára jogosítanak. A forráskód és a FormatX márka tulajdonjoga nem kerül át a felhasználóhoz.',
        'The trial and paid plans grant permission to use the released FormatX application. They do not transfer ownership of the source code or the FormatX brand.'
      )
    );
    copy.querySelector('h3').id = 'fx-licence-clarity-title';

    const details = document.createElement('div');
    details.className = 'fx-licence-clarity-details';
    const list = document.createElement('ul');
    list.append(
      createCopy('li', '', '5 napos próbalicenc a teljes kiadás kipróbálásához.', 'A 5-day trial licence for evaluating the full release.'),
      createCopy('li', '', 'A fizetős licenc a kiválasztott hozzáférési időre, technikus- és gépkeretre érvényes.', 'A paid licence is valid for the selected access period and technician/device limits.'),
      createCopy('li', '', 'A szoftver vagy a forráskód másolása, módosítása, közzététele, továbbértékesítése vagy terjesztése csak előzetes írásos engedéllyel lehetséges.', 'Copying, modifying, publishing, reselling or redistributing the software or source code requires prior written permission.'),
      createCopy('li', '', 'Az aktiválás a banki jóváírás és a rendelési azonosító kézi ellenőrzése után történik; automatikus megújítás nincs.', 'Activation follows manual verification of the bank credit and order reference; there is no automatic renewal.')
    );

    const actions = document.createElement('div');
    actions.className = 'fx-licence-clarity-actions';
    const licence = createCopy('a', 'button button-line', 'Részletes licenc', 'Full licence');
    licence.href = 'https://github.com/hutoczky/FormatX/blob/master/LICENSE';
    licence.target = '_blank';
    licence.rel = 'noopener noreferrer';
    const terms = createCopy('a', 'button button-line', 'Felhasználási feltételek', 'Terms of use');
    terms.href = './terms.html';
    actions.append(licence, terms);

    const note = createCopy(
      'small',
      'fx-licence-clarity-note',
      'Ez közérthető összefoglaló. Az irányadó szöveget a LICENSE fájl és a felhasználási feltételek tartalmazzák.',
      'This is a plain-language summary. The governing text is contained in the LICENSE file and the terms of use.'
    );

    details.append(list, actions, note);
    section.append(copy, details);

    const anchor = container.querySelector('#formatx-plan-qr-dock')
      || container.querySelector('.payment')
      || container.lastElementChild;
    if (anchor) anchor.insertAdjacentElement('afterend', section);
    else container.appendChild(section);
  }

  function updateMeta() {
    const lang = language();
    document.title = COPY.title[lang];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = COPY.description[lang];
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.content = lang === 'en'
        ? 'A living system that senses, plans, executes and verifies.'
        : 'Egy élő rendszer, amely érzékel, tervez, végrehajt és visszaellenőriz.';
    }
  }

  function updateIntro() {
    setAll('.fx-intro-meta span:last-child', 'REAKTÍV RENDSZERARCHITEKTÚRA', 'RESPONSIVE SYSTEM ARCHITECTURE');
    setAll('.fx-intro-kicker', 'RENDSZERORGANIZMUS INDÍTÁSA', 'SYSTEM ORGANISM INITIALISING');
    setAll('.fx-intro-subtitle', 'SUITE PRO · ÉLŐ ARCHITEKTÚRA', 'SUITE PRO · LIVING ARCHITECTURE');
  }

  function updateNavigation() {
    setAll('#main-nav a[href="#experience"]', 'Működés', 'Workflow');
    setAll('#main-nav a[href="#capabilities"]', 'Modulok', 'Modules');
    setAll('#main-nav a[href="#pricing"]', 'Licenc és árak', 'Licence & pricing');
    setAll('#main-nav a[href="#system"]', 'Biztonság', 'Safety');
    setAll('#main-nav a[href="#resources"]', 'Letöltés', 'Downloads');

    setAll('.site-footer a[href="#experience"]', 'Működés', 'Workflow');
    setAll('.site-footer a[href="#capabilities"]', 'Modulok', 'Modules');
    setAll('.site-footer a[href="#pricing"]', 'Licenc és árak', 'Licence & pricing');

    setAll('.fx-rail a[href="#pricing"] span', 'Licenc', 'Licence');
    setAria(document.getElementById('main-nav'), 'Fő navigáció', 'Main navigation');
    setAria(document.querySelector('.fx-rail'), 'Organizmus-fejezetek', 'Organism chapters');
  }

  function updateHero() {
    setAll('#hero-download span', 'Teljes verzió – 5 napos próbalicenc', 'Full version – 5-day trial');
    setAll('.hero-facts > span:nth-child(1) small', 'rendszermodul', 'system modules');
    setAll('.hero-facts > span:nth-child(2) small', 'natív platformprofil', 'native platform profiles');
    setAll('.hero-facts > span:nth-child(3) small', 'napos próbalicenc', 'day trial licence');
    setAll('.hero-label.a b', 'MAGÁLLAPOT', 'CORE STATE');
    setAll('.hero-label.b b', 'KIADÁSI DNS', 'RELEASE DNA');
    setAll('.hero-label.c b', 'INTEGRITÁS', 'INTEGRITY');
  }

  function updateSectionLabels() {
    setAll('#experience .section-heading > .section-index, [data-organism-panel="experience"] .section-heading > .section-index', '02 — IDEGRENDSZER', '02 — NERVOUS SYSTEM');
    setAll('#capabilities .section-heading > .section-index, [data-organism-panel="capabilities"] .section-heading > .section-index', '03 — RENDSZERSZERVEK', '03 — SYSTEM ORGANS');
    setAll('#pricing .section-heading > .section-index, [data-organism-panel="pricing"] .section-heading > .section-index', '04 — LICENC ÉS ÁRAK', '04 — LICENCE & PRICING');
    setAll('#system .section-heading > .section-index, [data-organism-panel="system"] .section-heading > .section-index', '05 — RENDSZERVÁZ', '05 — SYSTEM SKELETON');
    setAll('#resources .section-index, [data-organism-panel="resources"] .section-index', '06 — KIADÁSI JELADÓ', '06 — RELEASE BEACON');

    setAll('#pricing-title > span', 'A licenccsomag', 'The licence plan');
    setAll('#pricing-title > em', 'a munkádhoz igazodik.', 'fits your work.');

    setAll('[data-plan-id="business_lite"] header b', 'EGYÉNI', 'INDIVIDUAL');
    setAll('[data-plan-id="business_pro"] header b', 'AJÁNLOTT', 'RECOMMENDED');
    setAll('[data-plan-id="technician_team"] header b', 'CSAPAT', 'TEAM');

    setAll('[data-plan-id="business_lite"] a.button', 'Business Lite licenc kiválasztása', 'Choose Business Lite licence');
    setAll('[data-plan-id="business_pro"] a.button', 'Business Pro licenc kiválasztása', 'Choose Business Pro licence');
    setAll('[data-plan-id="technician_team"] a.button', 'Technician Team licenc kiválasztása', 'Choose Technician Team licence');

    setAll('.payment > div:first-child .section-index', 'LICENC ÉS FIZETÉS', 'LICENCE & PAYMENT');
    setAll('.payment > div:first-child h3', 'Egyszeri fizetés. Nincs automatikus megújítás és nincs bankkártyaadat-kezelés.', 'One-time payment. No automatic renewal and no payment-card data processing.');
    setAll('.payment > div:first-child > p:last-child', 'Rögzített HUF- vagy EUR-ár, kézi jóváírás-ellenőrzéssel.', 'Fixed HUF or EUR price with manual payment verification.');
    setAll('.payment-console > span', 'Business Pro licenc', 'Business Pro licence');
    setAll('#preview-checkout-link', 'Rendelés megnyitása', 'Open order');

    setAll('#formatx-plan-qr-dock .section-index', 'FIZETÉSI HOZZÁFÉRÉS', 'PAYMENT ACCESS');
    setAll('#formatx-plan-qr-title', 'Fizetési QR-kód mindhárom licenchez', 'Payment QR codes for all three licences');
  }

  function updateOrganismPanels() {
    const panels = {
      experience: {
        hu: 'Működés', en: 'Workflow',
        indexHu: '02 / MŰKÖDÉS', indexEn: '02 / WORKFLOW'
      },
      capabilities: {
        hu: 'Modulok', en: 'Modules',
        indexHu: '03 / MODULOK', indexEn: '03 / MODULES'
      },
      pricing: {
        hu: 'Licenc és árak', en: 'Licence & pricing',
        indexHu: '04 / LICENC ÉS ÁRAK', indexEn: '04 / LICENCE & PRICING'
      },
      system: {
        hu: 'Biztonság és platform', en: 'Safety & platform',
        indexHu: '05 / BIZTONSÁG ÉS PLATFORM', indexEn: '05 / SAFETY & PLATFORM'
      },
      resources: {
        hu: 'Letöltés és támogatás', en: 'Downloads & support',
        indexHu: '06 / LETÖLTÉS ÉS TÁMOGATÁS', indexEn: '06 / DOWNLOADS & SUPPORT'
      }
    };

    Object.entries(panels).forEach(([id, copy]) => {
      setAll('[data-organism-open="' + id + '"] .fx-organism-chapter-title', copy.hu, copy.en);
      setAll('[data-organism-tab="' + id + '"]', copy.hu, copy.en);
      document.querySelectorAll('[data-organism-open="' + id + '"] .fx-organism-chapter-index')
        .forEach(element => { element.textContent = language() === 'en' ? copy.indexEn : copy.indexHu; });
    });

    setAll('[data-organism-open="pricing"] .fx-organism-chapter-summary',
      'Próbalicenc, csomagok, árak, fizetés és licencfeltételek egy helyen.',
      'Trial licence, plans, pricing, payment and licence terms in one place.');

    if (root.dataset.fxScene === '3') {
      const title = document.getElementById('fx-organism-console-title');
      const kicker = document.querySelector('.fx-organism-console-kicker');
      if (title) title.textContent = language() === 'en' ? panels.pricing.en : panels.pricing.hu;
      if (kicker) kicker.textContent = language() === 'en' ? panels.pricing.indexEn : panels.pricing.indexHu;
    }
  }

  function updateSecondaryPriceLabel() {
    const label = document.getElementById('preview-secondary-label');
    if (!label) return;
    const selected = document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency || 'HUF';
    const other = selected === 'EUR' ? 'HUF' : 'EUR';
    setBilingual(label, 'Összeg ' + other + '-ban', 'Amount in ' + other);
  }

  function applyCopy() {
    ensureStyle();
    ensureLicenceClarity();
    ensureFooterLicenceLink();
    updateMeta();
    updateIntro();
    updateNavigation();
    updateHero();
    updateSectionLabels();
    updateOrganismPanels();
    updateSecondaryPriceLabel();
    root.dataset.fxCopyPolish = 'ready-v1';
  }

  document.addEventListener('DOMContentLoaded', applyCopy, { once: true });
  addEventListener('formatx:languagechange', () => requestAnimationFrame(applyCopy));
  addEventListener('formatx:organisminterfaceready', () => requestAnimationFrame(applyCopy));
  addEventListener('formatx:organismpanelopen', () => requestAnimationFrame(applyCopy));
  addEventListener('pageshow', applyCopy);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('[data-currency]')) {
      setTimeout(updateSecondaryPriceLabel, 0);
    }
  }, true);

  if (document.readyState === 'loading') {
    root.dataset.fxCopyPolish = 'waiting-v1';
  } else {
    applyCopy();
  }
}());
