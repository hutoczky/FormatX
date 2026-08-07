(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxPlatformStatus === 'ready') return;
  ROOT.dataset.fxPlatformStatus = 'loading';

  const DATA_URL = '/scifi-ui/data/platform-status.json';

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function ensureStyle() {
    if (document.querySelector('link[data-fx-platform-status-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/scifi-ui/styles/platform-status.css';
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

  function supportRole(platform, data, lang) {
    return text(data.support_role_labels && data.support_role_labels[platform.support_role], lang);
  }

  function buildCard(platform, data, lang) {
    const article = document.createElement('article');
    article.className = 'fx-platform-card';
    article.dataset.platform = platform.id;
    article.dataset.status = platform.status;
    article.dataset.supportRole = platform.support_role || '';

    const head = document.createElement('header');
    const titleWrap = document.createElement('div');
    const title = document.createElement('h3');
    const role = document.createElement('small');
    title.textContent = platform.name;
    role.textContent = supportRole(platform, data, lang);
    titleWrap.append(title, role);
    head.append(titleWrap, badge(platform.status, data.status_labels, lang));

    const description = document.createElement('p');
    description.textContent = text(platform, lang);
    article.append(head, description);
    return article;
  }

  function platformById(data, id) {
    return data.platforms.find(platform => platform.id === id) || null;
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
    heading.textContent = lang === 'en'
      ? 'One honest status matrix across every surface.'
      : 'Egyetlen valós állapotmátrix minden felületen.';
    lead.textContent = lang === 'en'
      ? 'FormatX is a full release. Bazzite/Linux is the primary system and Windows is a supported secondary platform in the same full multiplatform package. Use starts with a 5-day trial licence.'
      : 'A FormatX teljes verzió. A Bazzite/Linux az elsődleges rendszer, a Windows támogatott másodlagos platform ugyanabban a teljes multiplatform csomagban. A használat 5 napos próbalicenccel indul.';
    copy.append(eyebrow, heading, lead);

    const release = document.createElement('div');
    release.className = 'fx-product-release-state';
    release.append(
      badge(data.product_release.status, data.status_labels, lang),
      Object.assign(document.createElement('strong'), {
        textContent: lang === 'en' ? 'Full multiplatform package' : 'Teljes multiplatform csomag'
      }),
      Object.assign(document.createElement('small'), {
        textContent: lang === 'en'
          ? 'Bazzite/Linux primary · Windows supported · 5-day trial licence'
          : 'Bazzite/Linux elsődleges · Windows támogatott · 5 napos próbalicenc'
      })
    );
    header.append(copy, release);

    const grid = document.createElement('div');
    grid.className = 'fx-platform-status-grid';
    data.platforms.forEach(platform => grid.appendChild(buildCard(platform, data, lang)));

    const note = document.createElement('p');
    note.className = 'fx-platform-status-note';
    note.append(document.createTextNode(lang === 'en'
      ? 'Bazzite/Linux, Windows and Android are published as full releases. The independent evidence-gated Stable designation remains a separate verification level. '
      : 'A Bazzite/Linux, a Windows és az Android teljes verzióként jelenik meg. A független bizonyítékokhoz kötött Stable minősítés ettől külön ellenőrzési szint. '));
    const matrixLink = document.createElement('a');
    matrixLink.href = '/scifi-ui/test-matrix.html';
    matrixLink.textContent = lang === 'en' ? 'Open public test matrix' : 'Nyilvános tesztmátrix megnyitása';
    note.appendChild(matrixLink);
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
          ? 'Bazzite/Linux primary · Windows supported · full version · 5-day trial licence'
          : 'Bazzite/Linux elsődleges · Windows támogatott · teljes verzió · 5 napos próbalicenc'
      })
    );

    const download = document.getElementById('hero-download');
    if (download instanceof HTMLAnchorElement) {
      download.href = './downloads/';
      download.dataset.releaseDownload = 'multiplatform';
      download.removeAttribute('download');
      const label = download.querySelector('[data-release-download-label], span');
      if (label) {
        label.textContent = lang === 'en'
          ? 'Full multiplatform version'
          : 'Teljes multiplatform verzió';
      }
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
          ? '<strong>The current package is the full multiplatform release.</strong><span>Bazzite/Linux is primary; Windows is supported as a secondary platform. The licence starts with a 5-day trial period.</span>'
          : '<strong>Az aktuális csomag a teljes multiplatform kiadás.</strong><span>A Bazzite/Linux elsődleges; a Windows támogatott másodlagos platform. A licenc 5 napos próbaidővel indul.</span>'
      })
    );
  }

  function installCheckoutConsents() {
    const form = document.getElementById('checkout-form');
    const original = document.getElementById('checkout-consent')?.closest('.consent-row');
    if (!form || !original) return;

    let statusRow = form.querySelector('[data-fx-product-status-consent]');
    if (!statusRow) {
      statusRow = document.createElement('label');
      statusRow.className = 'consent-row';
      statusRow.dataset.fxProductStatusConsent = 'true';
      statusRow.innerHTML = '<input name="product_status_acknowledged" type="checkbox" required><span></span>';
      original.insertAdjacentElement('afterend', statusRow);
    }

    let immediateRow = form.querySelector('[data-fx-immediate-performance-consent]');
    if (!immediateRow) {
      immediateRow = document.createElement('label');
      immediateRow.className = 'consent-row';
      immediateRow.dataset.fxImmediatePerformanceConsent = 'true';
      immediateRow.innerHTML = '<input name="immediate_performance_requested" type="checkbox" required><span></span>';
      statusRow.insertAdjacentElement('afterend', immediateRow);
    }

    const lang = language();
    statusRow.querySelector('span').textContent = lang === 'en'
      ? 'I understand that FormatX is the full release and that first use starts with a 5-day trial licence before a paid licence is required.'
      : 'Tudomásul veszem, hogy a FormatX teljes verzió, és az első használat 5 napos próbalicenccel indul, amely után fizetős licenc szükséges.';
    immediateRow.querySelector('span').innerHTML = lang === 'en'
      ? 'I expressly request activation immediately after payment verification. If I qualify as a consumer, I acknowledge the digital-performance and withdrawal information in the <a href="./terms.html" target="_blank" rel="noopener">terms of use</a>.'
      : 'Kifejezetten kérem az aktiválást a jóváírás ellenőrzése után. Ha fogyasztónak minősülök, tudomásul veszem a <a href="./terms.html" target="_blank" rel="noopener">felhasználási feltételekben</a> szereplő digitális teljesítési és elállási tájékoztatást.';
  }

  function canonicalStatusAnswer(data) {
    const lang = language();
    const bazzite = platformById(data, 'linux-bazzite');
    const windows = platformById(data, 'windows');
    const macos = platformById(data, 'macos');
    const web = platformById(data, 'web');
    const android = platformById(data, 'android');
    const ios = platformById(data, 'ios');
    const status = platform => text(data.status_labels[platform?.status], lang);

    return lang === 'en'
      ? `FormatX is a full release with a 5-day trial licence. Bazzite/Linux is the primary system and is currently ${status(bazzite)}. Windows is a supported secondary platform and is currently ${status(windows)}. Android: ${status(android)}; Web: ${status(web)}; macOS: ${status(macos)}; iOS/iPadOS: ${status(ios)}.`
      : `A FormatX teljes verzió, 5 napos próbalicenccel. A Bazzite/Linux az elsődleges rendszer, jelenlegi állapota: ${status(bazzite)}. A Windows támogatott másodlagos platform, jelenlegi állapota: ${status(windows)}. Android: ${status(android)}; Web: ${status(web)}; macOS: ${status(macos)}; iOS/iPadOS: ${status(ios)}.`;
  }

  function publishOrganismAnswer(answer) {
    const api = window.FormatXOrganismVoice;
    if (api && typeof api.say === 'function') {
      api.say(answer);
      return;
    }
    const output = document.querySelector('.fx-organism-thought-output');
    if (output) output.textContent = answer;
    dispatchEvent(new CustomEvent('formatx:organismresponse', {
      detail: { text: answer, topic: 'platform-status', localOnly: true }
    }));
  }

  function installOrganismStatusSync(data) {
    if (ROOT.dataset.fxOrganismStatusSync === 'ready') return;
    ROOT.dataset.fxOrganismStatusSync = 'ready';

    document.addEventListener('submit', event => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches('.fx-organism-question')) return;
      const input = form.querySelector('input');
      const query = String(input?.value || '').toLocaleLowerCase(language() === 'en' ? 'en' : 'hu');
      if (!/(platform|állapot|status|stable|stabil|beta|béta|windows|linux|bazzite|macos|android|ios|letölt|download|release|kiadás|multiplatform|próba|trial)/i.test(query)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const answer = canonicalStatusAnswer(data);
      if (input) input.value = '';
      publishOrganismAnswer(answer);
    }, true);

    const observe = () => {
      const output = document.querySelector('.fx-organism-thought-output');
      if (!output || output.dataset.fxStatusObserved === 'true') return;
      output.dataset.fxStatusObserved = 'true';
      new MutationObserver(() => {
        const current = output.textContent || '';
        if (!/(stabil kiadásokat|stable releases|Linux és Bazzite az elsődleges|Linux and Bazzite are the primary)/i.test(current)) return;
        publishOrganismAnswer(canonicalStatusAnswer(data));
      }).observe(output, { childList: true, subtree: true, characterData: true });
    };
    observe();
    addEventListener('formatx:organisminterfaceready', observe);
  }

  function installDefaultTargets(data) {
    document.querySelectorAll('[data-platform-status-root]').forEach(target => renderInto(target, data));
    installHeroState(data);
    installCheckoutNotice(data);
    installCheckoutConsents();
    installOrganismStatusSync(data);

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
      ROOT.dataset.fxPlatformStatus = 'ready';
      dispatchEvent(new CustomEvent('formatx:platformstatusready', { detail: data }));
    } catch (error) {
      ROOT.dataset.fxPlatformStatus = 'failed';
      ROOT.dataset.fxPlatformStatusError = String(error && error.message || error).slice(0, 120);
    }
  }

  addEventListener('formatx:languagechange', () => {
    if (!ROOT.__FORMATX_PLATFORM_STATUS__) return;
    document.querySelectorAll('[data-platform-status-root]').forEach(target => renderInto(target, ROOT.__FORMATX_PLATFORM_STATUS__));
    installHeroState(ROOT.__FORMATX_PLATFORM_STATUS__);
    installCheckoutNotice(ROOT.__FORMATX_PLATFORM_STATUS__);
    installCheckoutConsents();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
}());