(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxPlatformStatus === 'ready-v1') return;
  ROOT.dataset.fxPlatformStatus = 'loading-v1';

  const DATA_URL = '/scifi-ui/data/platform-status.json?v=20260730-platform-status-1';

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-platform-status-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/platform-status.css?v=20260730-platform-status-1';
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
      ? 'No platform is currently labelled Stable. The first stable label will only be used after the public test matrix and release evidence meet the published acceptance criteria.'
      : 'Jelenleg egyik platform sem kap Stabil címkét. A Stabil állapot csak a nyilvános tesztmátrix és a kiadási bizonyítékok elfogadási feltételeinek teljesítése után jelenhet meg.';

    section.append(header, grid, note);
    return section;
  }

  function renderInto(target, data) {
    if (!(target instanceof Element)) return;
    target.replaceChildren(buildMatrix(data, target.dataset.platformStatusMode === 'compact'));
  }

  function installDefaultTargets(data) {
    document.querySelectorAll('[data-platform-status-root]').forEach(target => renderInto(target, data));

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

    if (document.body.classList.contains('checkout-page') || document.querySelector('.checkout-page')) {
      const hero = document.querySelector('.checkout-hero');
      if (hero && !document.querySelector('.checkout-page [data-platform-status-root]')) {
        const root = document.createElement('div');
        root.className = 'content-width fx-platform-status-host';
        root.dataset.platformStatusRoot = 'true';
        root.dataset.platformStatusMode = 'compact';
        hero.insertAdjacentElement('afterend', root);
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
      ROOT.dataset.fxPlatformStatus = 'ready-v1';
      dispatchEvent(new CustomEvent('formatx:platformstatusready', { detail: data }));
    } catch (error) {
      ROOT.dataset.fxPlatformStatus = 'failed-v1';
      ROOT.dataset.fxPlatformStatusError = String(error && error.message || error).slice(0, 120);
    }
  }

  addEventListener('formatx:languagechange', () => {
    if (!ROOT.__FORMATX_PLATFORM_STATUS__) return;
    document.querySelectorAll('[data-platform-status-root]').forEach(target => renderInto(target, ROOT.__FORMATX_PLATFORM_STATUS__));
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());
