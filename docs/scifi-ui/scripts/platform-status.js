(function () {
  'use strict';

  const ROOT = document.documentElement;
  if (ROOT.dataset.fxPlatformStatus === 'ready-v3') return;
  ROOT.dataset.fxPlatformStatus = 'loading-v3';

  const DATA_URL = '/scifi-ui/data/platform-status.json?v=20260730-platform-status-2';

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
    const version = document.createElement('small');
    title.textContent = platform.name;
    version.textContent = [supportRole(platform, data, lang), platform.version].filter(Boolean).join(' · ');
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
      ? 'Linux/Bazzite is the primary target and support platform. Windows is secondary supported. V92 remains a public beta.'
      : 'A Linux/Bazzite az elsődleges cél- és támogatási platform. A Windows másodlagosan támogatott. A V92 továbbra is nyilvános béta.';
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
    note.append(document.createTextNode(lang === 'en'
      ? 'Support priority and maturity are separate: Linux/Bazzite is primary while its native build is in Development; Windows is secondary supported and currently Public beta. No platform is labelled Stable. '
      : 'A támogatási prioritás és a fejlettségi állapot külön fogalom: a Linux/Bazzite elsődleges, miközben a natív kiadás Development; a Windows másodlagosan támogatott és jelenleg Public beta. Egyik platform sem Stable. '));
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
          ? 'Linux/Bazzite primary platform · Windows secondary supported Public beta · 5-day trial'
          : 'Linux/Bazzite elsődleges platform · Windows másodlagosan támogatott Public beta · 5 napos próbalicenc'
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
          ? '<strong>V92 is a public beta.</strong><span>Linux/Bazzite is the primary platform direction; Windows is secondary supported. No platform is currently labelled Stable.</span>'
          : '<strong>A V92 nyilvános béta.</strong><span>A Linux/Bazzite az elsődleges platformirány; a Windows másodlagosan támogatott. Jelenleg egyik platform sem kap Stable címkét.</span>'
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
      ? 'I understand that V92 is a Public beta, not a Stable release, and that platform capabilities differ according to the published status matrix.'
      : 'Tudomásul veszem, hogy a V92 nyilvános béta, nem Stable kiadás, és a platformok képességei a közzétett állapotmátrix szerint eltérnek.';
    immediateRow.querySelector('span').innerHTML = lang === 'en'
      ? 'I expressly request activation immediately after payment verification. If I qualify as a consumer, I acknowledge the digital-performance and withdrawal information in the <a href="./terms.html" target="_blank" rel="noopener">terms of use</a>.'
      : 'Kifejezetten kérem az aktiválást a jóváírás ellenőrzése után. Ha fogyasztónak minősülök, tudomásul veszem a <a href="./terms.html" target="_blank" rel="noopener">felhasználási feltételekben</a> szereplő digitális teljesítési és elállási tájékoztatást.';
  }

  function canonicalStatusAnswer(data) {
    const lang = language();
    const names = Object.fromEntries(data.platforms.map(item => [item.name, text(data.status_labels[item.status], lang)]));
    return lang === 'en'
      ? `Linux/Bazzite is the primary target and support platform and is currently ${names['Linux / Bazzite']}. Windows is the secondary supported platform and is currently ${names.Windows}. V92 overall is a Public beta. macOS: ${names.macOS}; Web: ${names.Web}; Android: ${names.Android}; iOS / iPadOS: ${names['iOS / iPadOS']}. No platform is currently labelled Stable.`
      : `A Linux/Bazzite az elsődleges cél- és támogatási platform, jelenlegi állapota: ${names['Linux / Bazzite']}. A Windows a másodlagosan támogatott platform, jelenlegi állapota: ${names.Windows}. A V92 összesített állapota nyilvános béta. macOS: ${names.macOS}; Web: ${names.Web}; Android: ${names.Android}; iOS / iPadOS: ${names['iOS / iPadOS']}. Jelenleg egyik platform sem kap Stable címkét.`;
  }

  function speakCanonical(textValue) {
    const voiceButton = document.querySelector('.fx-organism-voice-toggle[aria-pressed="true"]');
    if (!voiceButton || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textValue);
      utterance.lang = language() === 'en' ? 'en-GB' : 'hu-HU';
      speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function installOrganismStatusSync(data) {
    if (ROOT.dataset.fxOrganismStatusSync === 'ready') return;
    ROOT.dataset.fxOrganismStatusSync = 'ready';

    document.addEventListener('submit', event => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches('.fx-organism-question')) return;
      const input = form.querySelector('input');
      const query = String(input?.value || '').toLocaleLowerCase(language() === 'en' ? 'en' : 'hu');
      if (!/(platform|állapot|status|stable|stabil|beta|béta|windows|linux|bazzite|macos|android|ios|letölt|download|release|kiadás)/i.test(query)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const answer = canonicalStatusAnswer(data);
      const output = document.querySelector('.fx-organism-thought-output');
      if (output) output.textContent = answer;
      if (input) input.value = '';
      speakCanonical(answer);
      dispatchEvent(new CustomEvent('formatx:organismresponse', {
        detail: { text: answer, topic: 'platform-status', localOnly: true }
      }));
    }, true);

    const observe = () => {
      const output = document.querySelector('.fx-organism-thought-output');
      if (!output || output.dataset.fxStatusObserved === 'true') return;
      output.dataset.fxStatusObserved = 'true';
      new MutationObserver(() => {
        const current = output.textContent || '';
        if (!/(stabil kiadásokat|stable releases|Linux és Bazzite az elsődleges|Linux and Bazzite are the primary)/i.test(current)) return;
        const answer = canonicalStatusAnswer(data);
        output.textContent = answer;
        speakCanonical(answer);
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
      ROOT.dataset.fxPlatformStatus = 'ready-v3';
      dispatchEvent(new CustomEvent('formatx:platformstatusready', { detail: data }));
    } catch (error) {
      ROOT.dataset.fxPlatformStatus = 'failed-v3';
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
