(function () {
  'use strict';

  const ROOT = document.documentElement;
  const STORAGE_KEY = 'formatx-language';
  const SUPPORTED = new Set(['hu', 'en']);
  const VERSION = '3';
  if (ROOT.dataset.fxSingleLanguageToggle === 'ready' && ROOT.dataset.fxSingleLanguageToggleVersion === VERSION) return;
  ROOT.dataset.fxSingleLanguageToggle = 'loading';
  ROOT.dataset.fxSingleLanguageToggleVersion = VERSION;

  /* r210: legacy/reference layers still create a few visible labels without
     data-hu/data-en. Keep those labels in the selected language on both mobile
     and desktop, including nodes mounted after initial page load. */
  const FIXED_COPY = [
    ['.topbar .brand small', 'ÉLŐ RENDSZER', 'LIVING SYSTEM'],
    ['#formatx-event-horizon .fx-intro-meta span:nth-child(1)', 'FORMATX / ÉLŐ MAG', 'FORMATX / LIVING CORE'],
    ['#formatx-event-horizon .fx-intro-meta span:nth-child(2)', 'RESZPONZÍV RENDSZERARCHITEKTÚRA', 'RESPONSIVE SYSTEM ARCHITECTURE'],
    ['#formatx-event-horizon .fx-intro-kicker', 'RENDSZERORGANIZMUS INDÍTÁSA', 'SYSTEM ORGANISM INITIALISING'],
    ['#formatx-event-horizon .fx-intro-subtitle', 'SUITE PRO · ÉLŐ ARCHITEKTÚRA', 'SUITE PRO · LIVING ARCHITECTURE'],
    ['#hero .hero-label.a b', 'MAG ÁLLAPOT', 'CORE STATE'],
    ['#hero .hero-label.b b', 'KIADÁSI CSATORNA', 'RELEASE CHANNEL'],
    ['#hero .hero-label.c b', 'INTEGRITÁS', 'INTEGRITY'],
    ['#experience .section-heading .section-index', '02 — IDEGRENDSZER', '02 — NERVOUS SYSTEM'],
    ['#capabilities .section-heading .section-index', '03 — RENDSZERSZERVEK', '03 — SYSTEM ORGANS'],
    ['#pricing .section-heading .section-index', '04 — KERESKEDELMI SZÍV', '04 — COMMERCE HEART'],
    ['#system .section-heading .section-index', '05 — RENDSZERVÁZ', '05 — SYSTEM SKELETON'],
    ['#resources .section-index', '06 — KIADÁSI JELADÓ', '06 — RELEASE BEACON'],
    ['#experience .flow-chapters article[data-flow="0"] small', 'FELDERÍTÉS', 'DISCOVER'],
    ['#experience .flow-chapters article[data-flow="1"] small', 'TERVEZÉS', 'PLAN'],
    ['#experience .flow-chapters article[data-flow="2"] small', 'VÉGREHAJTÁS', 'EXECUTE'],
    ['#experience .flow-chapters article[data-flow="3"] small', 'ELLENŐRZÉS', 'VERIFY'],
    ['#capabilities .card:nth-child(1) > b', 'ÍRÁS / ELLENŐRZÉS', 'WRITE / VERIFY'],
    ['#capabilities .card:nth-child(2) > b', 'GYORS / MÉLY', 'QUICK / DEEP'],
    ['#capabilities .card:nth-child(3) > b', 'TERV / ELŐNÉZET', 'PLAN / PREVIEW'],
    ['#capabilities .card:nth-child(4) > b', 'MEGERŐSÍTÉS / TÖRLÉS', 'CONFIRM / ERASE'],
    ['#capabilities .card:nth-child(5) > b', 'OLVASÁS / ELEMZÉS', 'READ / ANALYSE'],
    ['#capabilities .card:nth-child(6) > b', 'MAGYARÁZAT / SEGÍTSÉG', 'EXPLAIN / GUIDE'],
    ['#pricing .price-card:nth-child(1) header b', 'EGYÉNI', 'INDIVIDUAL'],
    ['#pricing .price-card:nth-child(2) header b', 'AJÁNLOTT', 'RECOMMENDED'],
    ['#pricing .price-card:nth-child(3) header b', 'CSAPAT', 'TEAM'],
    ['#formatx-plan-qr-dock .fx-plan-qr-head .section-index', 'FIZETÉSI HOZZÁFÉRÉSI RÉTEG', 'PAYMENT ACCESS LAYER'],
    ['#formatx-plan-qr-dock [data-plan-qr="business_lite"] .fx-plan-qr-copy small', '01 / EGYÉNI', '01 / INDIVIDUAL'],
    ['#formatx-plan-qr-dock [data-plan-qr="business_pro"] .fx-plan-qr-copy small', '02 / AJÁNLOTT', '02 / RECOMMENDED'],
    ['#formatx-plan-qr-dock [data-plan-qr="technician_team"] .fx-plan-qr-copy small', '03 / CSAPAT', '03 / TEAM'],
    ['#system .marquee span', 'FORMATX / ÉRZÉKEL / TERVEZ / VÉGREHAJT / ELLENŐRIZ / FORMATX / ÉRZÉKEL / TERVEZ / VÉGREHAJT / ELLENŐRIZ / ', 'FORMATX / SENSE / PLAN / EXECUTE / VERIFY / FORMATX / SENSE / PLAN / EXECUTE / VERIFY / '],
    ['#hero .fx-reference-ask span', 'KÉRDEZZ', 'ASK'],
    ['#hero .fx-reference-proof h2', 'NYILVÁNOS BIZONYÍTÉK', 'PUBLIC PROOF'],
    ['.fx-r181-apex-meta b', 'ÉLŐ MAG', 'LIVING CORE'],
    ['.fx-r181-apex-meta span:nth-of-type(1)', 'WEBGL2 / REAKTÍV', 'WEBGL2 / REACTIVE'],
    ['.fx-r181-apex-meta span:nth-of-type(2)', 'MUTATÓMEZŐ', 'POINTER FIELD'],
    ['#hero .fx-method-inline li:nth-child(1)', 'Felderítés', 'Discover'],
    ['#hero .fx-method-inline li:nth-child(2)', 'Terv', 'Plan'],
    ['#hero .fx-method-inline li:nth-child(3)', 'Kontrollált végrehajtás', 'Controlled execution'],
    ['#hero .fx-method-inline li:nth-child(4)', 'Visszaellenőrzés', 'Verification']
  ];

  function ownScript() {
    return document.currentScript
      || Array.from(document.scripts).find(script => /\/single-language-toggle\.js(?:\?|$)/.test(script.src));
  }

  function assetUrl(relativePath) {
    const script = ownScript();
    return script?.src ? new URL(relativePath, script.src).href : relativePath;
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-single-language-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = assetUrl('../styles/single-language-toggle.css?v=20260729-single-language-3');
    link.dataset.fxSingleLanguageStyle = 'true';
    document.head.appendChild(link);
  }

  function storedLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.has(query)) return query;
    const apiLanguage = window.FormatXI18n?.getLanguage?.();
    if (SUPPORTED.has(apiLanguage)) return apiLanguage;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.has(stored)) return stored;
    } catch (_) {}
    if (SUPPORTED.has(ROOT.lang)) return ROOT.lang;
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
      if (element.textContent !== value) element.textContent = value;
    });
  }

  function applyFixedCopy(language) {
    const index = language === 'en' ? 2 : 1;
    FIXED_COPY.forEach(entry => setText(entry[0], entry[index]));
    ROOT.dataset.fxFixedCopyLanguage = language;
    ROOT.dataset.fxFixedCopyVersion = 'r210';
  }

  function applyBilingualCopy(language) {
    ROOT.lang = language;
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      const value = element.dataset[language];
      if (typeof value === 'string' && element.textContent !== value) element.textContent = value;
    });
    document.querySelectorAll('[data-hu-label][data-en-label]').forEach(element => {
      element.setAttribute('aria-label', element.dataset[language + 'Label']);
    });
    applyFixedCopy(language);
  }

  function persistLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  function mobileMode() {
    return matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  }

  function placeContainer(container) {
    if (!(container instanceof HTMLElement)) return;
    if (mobileMode() && document.body && container.parentElement !== document.body) {
      document.body.appendChild(container);
    }
    if (mobileMode()) {
      container.hidden = false;
      container.removeAttribute('aria-hidden');
      container.style.setProperty('display', 'block', 'important');
      container.style.setProperty('position', 'fixed', 'important');
      container.style.setProperty('top', '14px', 'important');
      container.style.setProperty('right', '70px', 'important');
      container.style.setProperty('z-index', '10040', 'important');
      container.style.setProperty('visibility', 'visible', 'important');
      container.style.setProperty('opacity', '1', 'important');
    }
  }

  function createContainer() {
    const container = document.createElement('div');
    container.className = 'language-switch language-control fx-single-language-switch';
    container.dataset.i18nControl = 'true';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Language / Nyelv');

    const headerActions = document.querySelector('.header-actions');
    const legalHeader = document.querySelector('.legal-header-inner');
    if (mobileMode() && document.body) document.body.appendChild(container);
    else if (headerActions) headerActions.prepend(container);
    else if (legalHeader) legalHeader.insertBefore(container, legalHeader.querySelector('.theme-control'));
    else document.body?.prepend(container);
    placeContainer(container);
    return container;
  }

  function findContainer() {
    return document.querySelector('.language-switch, .language-control') || createContainer();
  }

  function legacyButtons(container) {
    return Array.from(container.querySelectorAll('[data-language], [data-language-choice]'));
  }

  function hideLegacyControls(primaryContainer) {
    document.querySelectorAll('.language-switch, .language-control').forEach(container => {
      if (container !== primaryContainer) {
        container.querySelectorAll('.fx-language-toggle').forEach(button => button.remove());
        container.hidden = true;
        container.setAttribute('aria-hidden', 'true');
      }
    });

    legacyButtons(primaryContainer).forEach(button => {
      button.hidden = true;
      button.tabIndex = -1;
      button.setAttribute('aria-hidden', 'true');
    });
  }

  function updateToggle(toggle, language) {
    const next = language === 'hu' ? 'en' : 'hu';
    toggle.textContent = language.toUpperCase();
    toggle.dataset.nextLanguage = next;
    toggle.lang = language;
    toggle.setAttribute('aria-label', language === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian');
    toggle.title = language === 'hu' ? 'Váltás angol nyelvre' : 'Switch to Hungarian';
    if (mobileMode()) {
      toggle.hidden = false;
      toggle.style.setProperty('display', 'inline-flex', 'important');
      toggle.style.setProperty('visibility', 'visible', 'important');
      toggle.style.setProperty('opacity', '1', 'important');
    }
  }

  function publishLanguageChange(language) {
    dispatchEvent(new CustomEvent('formatx:languagechange', {
      detail: { language, source: 'single-language-toggle-v3-r210' }
    }));
  }

  function setLanguage(language, persist, container, toggle) {
    if (!SUPPORTED.has(language)) return;
    const preservedHash = location.hash;
    if (persist) persistLanguage(language);
    applyBilingualCopy(language);

    const legacy = legacyButtons(container).find(button => (
      button.dataset.language === language || button.dataset.languageChoice === language
    ));

    if (window.FormatXI18n?.setLanguage) {
      window.FormatXI18n.setLanguage(language, persist);
    } else if (legacy) {
      legacy.click();
    }

    publishLanguageChange(language);

    requestAnimationFrame(() => {
      if (preservedHash && location.hash !== preservedHash) {
        const url = new URL(location.href);
        url.hash = preservedHash;
        history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
      applyBilingualCopy(language);
      updateToggle(toggle, language);
    });
  }

  function install() {
    const container = findContainer();
    if (!(container instanceof HTMLElement)) return false;

    placeContainer(container);
    container.hidden = false;
    container.removeAttribute('aria-hidden');
    container.classList.add('language-switch', 'language-control', 'fx-single-language-switch');
    container.dataset.fxSingleLanguageToggle = 'ready-v3';
    container.dataset.i18nControl = 'true';
    hideLegacyControls(container);

    container.querySelectorAll('.fx-language-toggle').forEach(button => button.remove());
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'fx-language-toggle';
    toggle.dataset.languageToggle = 'true';

    const initial = storedLanguage();
    applyBilingualCopy(initial);
    updateToggle(toggle, initial);

    toggle.addEventListener('click', () => {
      const current = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      setLanguage(current === 'hu' ? 'en' : 'hu', true, container, toggle);
    });
    container.addEventListener('click', event => {
      if (event.target === container) toggle.click();
    });

    container.appendChild(toggle);
    addEventListener('formatx:languagechange', event => {
      const language = event.detail?.language;
      if (SUPPORTED.has(language)) {
        applyBilingualCopy(language);
        updateToggle(toggle, language);
      }
    });

    const languageObserver = new MutationObserver(() => {
      const language = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
      placeContainer(container);
      applyFixedCopy(language);
      updateToggle(toggle, language);
      hideLegacyControls(container);
    });
    languageObserver.observe(ROOT, { attributes: true, attributeFilter: ['lang'] });

    let copyQueued = false;
    const duplicateObserver = new MutationObserver(records => {
      placeContainer(container);
      hideLegacyControls(container);
      if (!records.some(record => record.addedNodes.length || record.removedNodes.length) || copyQueued) return;
      copyQueued = true;
      queueMicrotask(() => {
        copyQueued = false;
        const language = SUPPORTED.has(ROOT.lang) ? ROOT.lang : storedLanguage();
        applyFixedCopy(language);
      });
    });
    duplicateObserver.observe(document.documentElement, { subtree: true, childList: true });

    addEventListener('resize', () => placeContainer(container), { passive: true });
    ROOT.dataset.fxSingleLanguageToggle = 'ready';
    ROOT.dataset.fxSingleLanguageToggleVersion = VERSION;
    return true;
  }

  ensureStyle();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
}());
