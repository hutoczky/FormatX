(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxPublicShell === 'ready-v1') return;

  const PUBLIC_PATHS = new Set([
    '/scifi-ui/method.html',
    '/scifi-ui/verification.html',
    '/scifi-ui/test-matrix.html',
    '/scifi-ui/known-issues.html',
    '/scifi-ui/security.html',
    '/scifi-ui/decision-log.html',
    '/scifi-ui/downloads/',
    '/scifi-ui/downloads/index.html',
    '/scifi-ui/downloads/android.html',
    '/scifi-ui/license.html',
    '/scifi-ui/terms.html',
    '/scifi-ui/privacy.html',
    '/scifi-ui/support.html'
  ]);

  if (!PUBLIC_PATHS.has(location.pathname) && !document.body.dataset.fxPublicPage) return;
  ROOT.dataset.fxPublicShell = 'loading-v1';

  const NAV = Object.freeze({
    hu: [
      ['/scifi-ui/method.html', 'Módszer'],
      ['/scifi-ui/verification.html', 'Bizonyíték'],
      ['/scifi-ui/test-matrix.html', 'Tesztek'],
      ['/scifi-ui/known-issues.html', 'Ismert hibák'],
      ['/scifi-ui/security.html', 'Biztonság'],
      ['/scifi-ui/decision-log.html', 'Döntésnapló'],
      ['/scifi-ui/downloads/', 'Letöltések'],
      ['/scifi-ui/support.html', 'Támogatás']
    ],
    en: [
      ['/scifi-ui/method.html', 'Method'],
      ['/scifi-ui/verification.html', 'Verification'],
      ['/scifi-ui/test-matrix.html', 'Tests'],
      ['/scifi-ui/known-issues.html', 'Known issues'],
      ['/scifi-ui/security.html', 'Security'],
      ['/scifi-ui/decision-log.html', 'Decision log'],
      ['/scifi-ui/downloads/', 'Downloads'],
      ['/scifi-ui/support.html', 'Support']
    ]
  });

  const LEGAL = Object.freeze({
    hu: [
      ['/scifi-ui/license.html', 'Licenc'],
      ['/scifi-ui/terms.html', 'Feltételek'],
      ['/scifi-ui/privacy.html', 'Adatvédelem']
    ],
    en: [
      ['/scifi-ui/license.html', 'Licence'],
      ['/scifi-ui/terms.html', 'Terms'],
      ['/scifi-ui/privacy.html', 'Privacy']
    ]
  });

  const language = () => ROOT.lang === 'en' ? 'en' : 'hu';
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function isCurrent(href) {
    return location.pathname === href || (href.endsWith('/') && location.pathname === href + 'index.html');
  }

  function navigation(items, label) {
    const nav = create('nav', 'fx-page-nav');
    nav.setAttribute('aria-label', label);
    items.forEach(([href, title]) => {
      const anchor = create('a', '', title);
      anchor.href = href;
      if (isCurrent(href)) anchor.setAttribute('aria-current', 'page');
      nav.append(anchor);
    });
    return nav;
  }

  function ensureSkipLink() {
    const main = document.querySelector('main');
    if (main && !main.id) main.id = 'main-content';
    const existing = document.querySelector('.skip-link');
    if (existing) {
      existing.href = '#main-content';
      return;
    }
    const skip = create('a', 'skip-link');
    skip.href = '#main-content';
    skip.dataset.hu = 'Ugrás a tartalomra';
    skip.dataset.en = 'Skip to content';
    skip.textContent = language() === 'en' ? skip.dataset.en : skip.dataset.hu;
    document.body.prepend(skip);
  }

  function findOrCreateLanguageControl() {
    let control = document.querySelector('.language-switch, .language-control');
    if (control) return control;
    control = create('div', 'language-switch language-control fx-single-language-switch');
    control.dataset.i18nControl = 'true';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Language / Nyelv');
    const hu = create('button', '', 'HU');
    hu.type = 'button';
    hu.dataset.language = 'hu';
    const en = create('button', '', 'EN');
    en.type = 'button';
    en.dataset.language = 'en';
    control.append(hu, en);
    return control;
  }

  function ensureHeader() {
    let header = document.querySelector('header.fx-public-header');
    if (!header) {
      const existing = document.querySelector('header.site-header');
      if (existing) {
        header = existing;
        header.classList.add('fx-public-header');
      } else {
        header = create('header', 'fx-public-header');
        document.body.insertBefore(header, document.querySelector('main') || document.body.firstChild);
      }
    }

    let inner = header.querySelector('.fx-public-header__inner, .header-inner');
    if (!inner) {
      inner = create('div', 'fx-public-header__inner');
      while (header.firstChild) inner.append(header.firstChild);
      header.append(inner);
    }
    inner.classList.add('fx-public-header__inner');

    let brand = inner.querySelector('.brand, .fx-public-brand');
    if (!brand) {
      brand = create('a', 'fx-public-brand');
      brand.href = '/scifi-ui/';
      brand.setAttribute('aria-label', 'FormatX Suite Pro');
      const icon = document.createElement('img');
      icon.src = '/scifi-ui/assets/images/formatx-icon.png';
      icon.width = 36;
      icon.height = 36;
      icon.alt = '';
      const copy = create('span');
      copy.append(create('strong', '', 'FORMATX'), create('small', '', 'PUBLIC EVIDENCE'));
      brand.append(icon, copy);
      inner.prepend(brand);
    }
    brand.classList.add('fx-public-brand');

    let tools = inner.querySelector('.fx-public-tools');
    if (!tools) {
      tools = create('div', 'fx-public-tools');
      inner.append(tools);
    }

    let home = inner.querySelector('.fx-public-home, .legal-home-link');
    if (!home) {
      home = create('a', 'fx-public-home');
      home.href = '/scifi-ui/';
      home.dataset.hu = 'Főoldal';
      home.dataset.en = 'Home';
      home.textContent = language() === 'en' ? home.dataset.en : home.dataset.hu;
    }
    home.classList.add('fx-public-home');
    tools.append(home);

    const themeControl = inner.querySelector('.theme-control');
    if (themeControl) {
      themeControl.classList.add('fx-public-theme-control');
      tools.append(themeControl);
    }

    const languageControl = findOrCreateLanguageControl();
    tools.append(languageControl);

    let badge = tools.querySelector('[data-public-release-badge]');
    if (!badge) {
      badge = create('span', 'fx-public-release-badge');
      badge.dataset.publicReleaseBadge = 'true';
      badge.dataset.hu = 'BÉTA';
      badge.dataset.en = 'BETA';
      badge.textContent = language() === 'en' ? badge.dataset.en : badge.dataset.hu;
      tools.insertBefore(badge, themeControl || languageControl);
    }
    return badge;
  }

  function ensureFooter() {
    let footer = document.querySelector('footer.fx-public-footer');
    if (!footer) {
      footer = create('footer', 'fx-public-footer');
      document.body.append(footer);
    }
    footer.replaceChildren();
    footer.append(
      navigation(NAV[language()], language() === 'en' ? 'Public FormatX pages' : 'Nyilvános FormatX oldalak'),
      navigation(LEGAL[language()], language() === 'en' ? 'Legal information' : 'Jogi információk')
    );
    const note = create('p');
    note.dataset.hu = 'A nyilvános oldalak irányadó JSON-adatforrásokra épülnek. Hiányzó bizonyítékot vagy csomagot a felület nem jelöl igazoltnak vagy elérhetőnek.';
    note.dataset.en = 'Public pages are based on canonical JSON records. Missing evidence or packages are not presented as verified or available.';
    note.textContent = language() === 'en' ? note.dataset.en : note.dataset.hu;
    footer.append(note);
  }

  function syncReleaseBadge(detail) {
    const badge = document.querySelector('[data-public-release-badge]');
    if (!badge) return;
    const release = detail?.release || ROOT.__FORMATX_RELEASE_METADATA__?.release;
    const version = release?.ok === true && typeof release.version === 'string' ? release.version.trim() : '';
    badge.textContent = version || (language() === 'en' ? 'BETA' : 'BÉTA');
    badge.dataset.state = version ? 'synchronised' : 'fallback';
    badge.title = language() === 'en'
      ? (version ? `Official public beta: ${version}` : 'Official release metadata unavailable')
      : (version ? `Hivatalos nyilvános béta: ${version}` : 'A hivatalos kiadási metaadat nem érhető el');
  }

  function syncLanguage() {
    ensureFooter();
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      if (!element.matches('input,textarea')) element.textContent = element.dataset[language()];
    });
    syncReleaseBadge();
  }

  function initialise() {
    ensureSkipLink();
    ensureHeader();
    ensureFooter();
    syncReleaseBadge();
    ROOT.dataset.fxPublicShell = 'ready-v1';
    dispatchEvent(new CustomEvent('formatx:publicshellready'));
  }

  addEventListener('formatx:languagechange', syncLanguage);
  addEventListener('formatx:releasemetadataready', event => syncReleaseBadge(event.detail));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
