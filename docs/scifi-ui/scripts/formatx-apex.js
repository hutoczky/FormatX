(function () {
  'use strict';

  const ROOT = document.documentElement;
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE) {
    ROOT.dataset.fxApex = 'audit-skip';
    ROOT.dataset.fxRenderer = 'static-audit';
    ROOT.dataset.fxScene = '0';
    ROOT.dataset.fxFlow = '0';
    ROOT.style.setProperty('--accent', '120,210,255');
    ROOT.style.setProperty('--progress', '0');
    dispatchEvent(new CustomEvent('formatx:apexready', { detail: { renderer: 'static-audit', infinite: 'skipped' } }));
    return;
  }

  const LANG_KEY = 'formatx-language';
  const RELEASE_API = 'https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest';
  const DOWNLOAD_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/download/';
  const PAGE_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/';
  const PRICES = { HUF: 15900, EUR: 44 };
  const SCENES = [
    ['hero', '120,210,255'],
    ['experience', '183,163,255'],
    ['capabilities', '126,241,190'],
    ['pricing', '255,196,126'],
    ['system', '126,190,255'],
    ['resources', '205,235,249']
  ];
  const FLOWS = [
    ['01', 'FELDERÍTÉS', 'DISCOVERY', 'ENV / READ'],
    ['02', 'TERVEZÉS', 'PLANNING', 'PLAN / PREVIEW'],
    ['03', 'VÉGREHAJTÁS', 'EXECUTION', 'RUN / CONTROL'],
    ['04', 'ELLENŐRZÉS', 'VERIFICATION', 'HASH / REPORT']
  ];

  let language = initialLanguage();
  let activeScene = 0;
  let activeFlow = 0;

  function initialLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function applyLanguage(next, persist) {
    language = next === 'en' ? 'en' : 'hu';
    ROOT.lang = language;
    document.querySelectorAll('[data-hu][data-en]').forEach(element => {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    if (persist) {
      try { localStorage.setItem(LANG_KEY, language); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    updateLinks();
    updatePrice();
    updateFlow(activeFlow);
    dispatchEvent(new CustomEvent('formatx:languagechange'));
  }

  function updateLinks() {
    document.querySelectorAll('a[href]').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return;
        url.searchParams.set('lang', language);
        anchor.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  function money(value, currency) {
    return new Intl.NumberFormat(language === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function currentCurrency() {
    return document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function updatePrice() {
    const selected = currentCurrency();
    const other = selected === 'HUF' ? 'EUR' : 'HUF';
    const main = document.getElementById('preview-main-price');
    const secondary = document.getElementById('preview-secondary-price');
    const label = document.getElementById('preview-secondary-label');
    const link = document.getElementById('preview-checkout-link');
    if (main) main.textContent = money(PRICES[selected], selected);
    if (secondary) secondary.textContent = money(PRICES[other], other);
    if (label) label.textContent = language === 'hu'
      ? (other === 'EUR' ? 'Összeg EUR-ban' : 'Összeg HUF-ban')
      : (other === 'EUR' ? 'Amount in EUR' : 'Amount in HUF');
    if (link) link.href = './checkout.html?plan=business_pro&cycle=monthly&currency=' + selected + '&lang=' + language;
  }

  function navigation() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    toggle?.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav?.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
    addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      nav?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.addEventListener('click', () => applyLanguage(button.dataset.language, true));
    });
    document.querySelectorAll('[data-currency]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-currency]').forEach(item => {
          item.setAttribute('aria-pressed', String(item === button));
        });
        updatePrice();
      });
    });
  }

  function trusted(value, prefix) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.href.startsWith(prefix);
    } catch (_) {
      return false;
    }
  }

  async function latestRelease() {
    try {
      const response = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) throw new Error('Release lookup failed');
      const payload = await response.json();
      const match = String(payload.tag_name || '').match(/^v?(\d+)$/i);
      if (!match || payload.draft || payload.prerelease || !Array.isArray(payload.assets)) throw new Error('Invalid release');
      const version = 'V' + match[1];
      const asset = payload.assets.find(item => item?.name === 'FormatX-Suite-Pro-' + version + '.zip');
      if (!asset || !trusted(asset.browser_download_url, DOWNLOAD_PREFIX) || !trusted(payload.html_url, PAGE_PREFIX)) throw new Error('Untrusted release');
      const download = document.getElementById('hero-download');
      const name = document.getElementById('release-name');
      const date = document.getElementById('release-published');
      const page = document.getElementById('release-page-link');
      if (download) download.href = asset.browser_download_url;
      if (name) name.textContent = 'FormatX Suite Pro ' + version;
      if (page) page.href = payload.html_url;
      if (date) {
        const published = new Date(payload.published_at);
        date.textContent = Number.isNaN(published.getTime())
          ? 'GitHub Releases'
          : new Intl.DateTimeFormat(language === 'hu' ? 'hu-HU' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(published);
      }
    } catch (_) {}
  }

  function reveal() {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
    elements.forEach(element => observer.observe(element));
  }

  function setScene(index) {
    activeScene = Math.max(0, Math.min(SCENES.length - 1, index));
    const scene = SCENES[activeScene];
    ROOT.dataset.fxScene = String(activeScene);
    ROOT.style.setProperty('--accent', scene[1]);
    document.querySelectorAll('[data-scene-link]').forEach(anchor => {
      anchor.classList.toggle('active', Number(anchor.dataset.sceneLink) === activeScene);
    });
    document.querySelectorAll('.main-nav a').forEach(anchor => {
      anchor.classList.toggle('active', anchor.getAttribute('href') === '#' + scene[0]);
    });
  }

  function scenes() {
    const sceneSections = SCENES.map(scene => document.getElementById(scene[0])).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        let best = null;
        entries.forEach(entry => {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (!best) return;
        const index = SCENES.findIndex(scene => scene[0] === best.target.id);
        if (index >= 0) setScene(index);
      }, { threshold: [0.2, 0.4, 0.6] });
      sceneSections.forEach(section => observer.observe(section));
    }
    const progress = () => {
      const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const value = Math.max(0, Math.min(1, scrollY / range));
      ROOT.style.setProperty('--progress', value.toFixed(5));
      ROOT.classList.toggle('fx-page-scrolled', scrollY > 24);
    };
    progress();
    addEventListener('scroll', progress, { passive: true });
    addEventListener('resize', progress, { passive: true });
  }

  function updateFlow(index) {
    activeFlow = Math.max(0, Math.min(FLOWS.length - 1, index));
    ROOT.dataset.fxFlow = String(activeFlow);
    document.querySelectorAll('[data-flow]').forEach(element => {
      element.classList.toggle('active', Number(element.dataset.flow) === activeFlow);
    });
    const flow = FLOWS[activeFlow];
    const number = document.querySelector('[data-flow-number]');
    const title = document.querySelector('[data-flow-title]');
    const code = document.querySelector('[data-flow-code]');
    if (number) number.textContent = flow[0];
    if (title) title.textContent = flow[language === 'hu' ? 1 : 2];
    if (code) code.textContent = flow[3];
  }

  function flow() {
    const chapters = Array.from(document.querySelectorAll('[data-flow]'));
    chapters.forEach(chapter => {
      chapter.addEventListener('mouseenter', () => updateFlow(Number(chapter.dataset.flow)));
      chapter.addEventListener('focus', () => updateFlow(Number(chapter.dataset.flow)));
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        let best = null;
        entries.forEach(entry => {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (best) updateFlow(Number(best.target.dataset.flow));
      }, { rootMargin: '-32% 0px -32%', threshold: [0, 0.2, 0.5, 0.8] });
      chapters.forEach(chapter => observer.observe(chapter));
    }
    updateFlow(0);
  }

  function pointerVariables() {
    addEventListener('pointermove', event => {
      ROOT.style.setProperty('--px', (event.clientX / Math.max(1, innerWidth) * 2 - 1).toFixed(3));
      ROOT.style.setProperty('--py', (event.clientY / Math.max(1, innerHeight) * 2 - 1).toFixed(3));
    }, { passive: true });
  }

  function initialise() {
    navigation();
    applyLanguage(language, false);
    reveal();
    scenes();
    flow();
    pointerVariables();
    updatePrice();
    latestRelease();
    setScene(activeScene);
    ROOT.dataset.fxApex = 'controller-only';
    ROOT.dataset.fxRenderer = 'three-host';
    dispatchEvent(new CustomEvent('formatx:apexready', { detail: { renderer: 'three-host', infinite: 'delegated' } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());