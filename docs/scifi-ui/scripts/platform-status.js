(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxPlatformStatus === 'ready-v2') return;
  ROOT.dataset.fxPlatformStatus = 'loading-v2';

  const DATA_URL = '/scifi-ui/data/platform-status.json?v=20260730-platform-status-1';

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-platform-status-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/platform-status.css?v=20260730-platform-status-2';
    link.dataset.fxPlatformStatusStyle = 'true';
    document.head.appendChild(link);
  }

  function text(value, lang) {
    if (value && typeof value === 'object') return value[lang] || value.hu || value.en || '';
    return String(value || '');
  }

  function badge(status, labels, lang) {
    const element = document.createElement('span');
    element.className = 'fx-platform-status-badge';
    element.dataset.status = status;
    element.textContent = text(labels[status], lang);
    return element;
  }

  function buildCard(platform, data, lang) {
    const article = document.createElement('article');
    article.className = 'fx-platform-card';
    article.dataset.platform = platform.id;
    article.dataset.status = platform.status;
    const head = document.createElement('header');
    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    const version = document.createElement('small');
    title.textContent = platform.name;
    version.textContent = platform.version;
    titleWrap.append(title, version);
    head.append(titleWrap, badge(platform.status, data.status_labels, lang));
    const description = document.createElement('p');
    description.textContent = text(platform, lang);
    article.append(head, description);
    return article;
  }

  function buildMatrix(data, compact) {
    const lang = language();
    const section = document.createElement('section');
    section.className = 'fx-platform-status' + (compact ? ' fx-platform-status--compact' : '');
    section.dataset.fxPlatformStatusRendered = 'true';

    const header = document.createElement('header');
    const copy = document.createElement('div');
    const eyebrow = document.createElement('p');
    const heading = document.createElement('h2');
    const lead = document.createElement('p');
    eyebrow.className = 'section-index';
    eyebrow.textContent = lang === 'en' ? 'PUBLIC PRODUCT STATUS' : 'NYILVÁNOS TERMÉKÁLLAPOT';
    heading.textContent = lang === 'en' ? 'One status matrix across every surface.' : 'Egyetlen állapotmátrix minden felületen.';
    lead.textContent = lang === 'en'
      ? 'V92 is a public beta. Platform labels describe actual availability and are not marketing promises.'
      : 'A V92 nyilvános béta. A platformcímkék a tényleges elérhetőséget jelzik, nem marketingígéretek.';
    copy.append(eyebrow, heading, lead);

    const release = document.createElement('div');
    release.className = 'fx-product-release-state';
    release.append(
      badge(data.product_release.status, data.status_labels, lang),
      Object.assign(document.createElement('strong'), { textContent: data.product_release.name }),
      Object.assign(document.createElement('small'), {
        textContent: lang === 'en'
          ? '5-day trial · manual activation after payment verification'
          : '5 napos próbalicenc · kézi aktiválás a jóváírás ellenőrzése után'
      })
    );
    header.append(copy, release);

    const grid = document.createElement('div');
    grid.className = 'fx-platform-status-grid';
    data.platforms.forEach(platform => grid.appendChild(buildCard(platform, data, lang)));

    const note = document.createElement('p');
    note.className = 'fx-platform-status-note';
    note.textContent = lang === 'en'
      ? 'No platform is currently labelled Stable. Stable will only be used after the public test matrix and release evidence meet the published acceptance criteria.'
      : 'Jelenleg egyik platform sem kap Stabil címkét. A Stabil állapot csak a nyilvános tesztmátrix és a kiadási bizonyítékok elfogadási feltételeinek teljesítése után jelenhet meg.';
    section.append(header, grid, note);
    return section;
  }

  function renderInto(target, data) {
    if (!(target instanceof Element)) return;
    target.replaceChildren(buildMatrix(data, target.dataset.platformStatusMode === 'compact'));
  }

  function installHeroState(data) {
    const heroCopy = document.querySelector('#hero .hero-copy');
    if (!heroCopy) return;
    let state = heroCopy.querySelector('.fx-hero-product-state');
    if (!state) {
      state = document.createElement('div');
      state.className = 'fx-hero-product-state';
      const lead = heroCopy.querySelector('.hero-lead');
      if (lead) lead.insertAdjacentElement('afterend', state);
      else heroCopy.prepend(state);
    }
    const lang = language();
    state.replaceChildren(
      badge(data.product_release.status, data.status_labels, lang),
      Object.assign(document.createElement('span'), {
        textContent: lang === 'en'
          ? 'Windows V92 available · Linux/Bazzite in development · 5-day trial'
          : 'Windows V92 elérhető · Linux/Bazzite fejlesztés alatt · 5 napos próbalicenc'
      })
    );

    const download = document.getElementById('hero-download');
    if (download instanceof HTMLAnchorElement) {
      download.href = './downloads/';
      download.removeAttribute('download');
      const label = download.querySelector('span');
      if (label) label.textContent = lang === 'en' ? 'Downloads and platform status' : 'Letöltések és platformállapot';
    }
  }

  function installCheckoutNotice(data) {
    const page = document.querySelector('.checkout-page');
    if (!page) return;
    let notice = page.querySelector('.fx-checkout-product-state');
    if (!notice) {
      notice = document.createElement('aside');
      notice.className = 'content-width fx-checkout-product-state';
      notice.setAttribute('aria-label', 'Product status');
      const hero = page.querySelector('.checkout-hero');
      if (hero) hero.insertAdjacentElement('afterend', notice);
      else page.prepend(notice);
    }
    const lang = language();
    notice.replaceChildren(
      badge(data.product_release.status, data.status_labels, lang),
      Object.assign(document.createElement('div'), {
        innerHTML: lang === 'en'
          ? '<strong>V92 is a public beta.</strong><span>The licence grants access to the released beta build. No platform is currently labelled Stable.</span>'
          : '<strong>A V92 nyilvános béta.</strong><span>A licenc a kiadott béta build használatára jogosít. Jelenleg egyik platform sem kap Stabil címkét.</span>'
      })
    );
  }

  function installDefaultTargets(data) {
    document.querySelectorAll('[data-platform-status-root]').forEach(target => renderInto(target, data));
    installHeroState(data);
    installCheckoutNotice(data);

    if (document.body.classList.contains('living-architecture') && !document.querySelector('[data-platform-status-root]')) {
      const anchor = document.getElementById('pricing') || document.getElementById('system');
      if (anchor) {
        const root = document.createElement('div');
        root.className = 'fx-platform-status-host';
        root.dataset.platformStatusRoot = 'true';
        anchor.before(root);
        renderInto(root, data);
      }
    }
  }

  async function load() {
    ensureStyle();
    try {
      const response = await fetch(DATA_URL, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('status ' + response.status);
      const data = await response.json();
      ROOT.__FORMATX_PLATFORM_STATUS__ = data;
      installDefaultTargets(data);
      ROOT.dataset.fxPlatformStatus = 'ready-v2';
      dispatchEvent(new CustomEvent('formatx:platformstatusready', { detail: data }));
    } catch (error) {
      ROOT.dataset.fxPlatformStatus = 'failed-v2';
      ROOT.dataset.fxPlatformStatusError = String(error && error.message || error).slice(0, 120);
    }
  }

  addEventListener('formatx:languagechange', () => {
    if (!ROOT.__FORMATX_PLATFORM_STATUS__) return;
    document.querySelectorAll('[data-platform-status-root]').forEach(target => renderInto(target, ROOT.__FORMATX_PLATFORM_STATUS__));
    installHeroState(ROOT.__FORMATX_PLATFORM_STATUS__);
    installCheckoutNotice(ROOT.__FORMATX_PLATFORM_STATUS__);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());
