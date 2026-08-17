(function () {
  'use strict';

  const ROOT = document.documentElement;
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  const LANG_KEY = 'formatx-language';
  const RELEASE_API = './data/current-release.json';
  const DOWNLOAD_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/download/';
  const PAGE_PREFIX = 'https://github.com/hutoczky/FormatX-Updates/releases/';
  const PRICES = { HUF: 15900, EUR: 44 };
  const SCENES = ['hero', 'experience', 'capabilities', 'pricing', 'system', 'resources'];
  const FLOWS = [
    ['01', 'FELDERÍTÉS', 'DISCOVERY', 'ENV / READ'],
    ['02', 'TERVEZÉS', 'PLANNING', 'PLAN / PREVIEW'],
    ['03', 'VÉGREHAJTÁS', 'EXECUTION', 'RUN / CONTROL'],
    ['04', 'ELLENŐRZÉS', 'VERIFICATION', 'HASH / REPORT']
  ];

  let language = initialLanguage();
  let activeScene = 0;
  let activeFlow = 0;
  let scrollFrame = 0;

  function ensureCspSafeStyles() {
    if (document.querySelector('link[data-fx-apex-csp-safe-r190]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/formatx-apex-csp-safe-r190.css?v=20260817-r190-csp-safe';
    link.dataset.fxApexCspSafeR190 = 'true';
    document.head.appendChild(link);
  }

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
        const url = new URL(href, document.baseURI);
        if (url.origin !== location.origin) return;
        if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return;
        url.searchParams.set('lang', language);
        anchor.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  function money(value, currency) {
    return new Intl.NumberFormat(language === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0
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
      const open = !nav?.classList.contains('open');
      nav?.classList.toggle('open', open);
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
      const url = new URL(value, location.origin);
      return url.protocol === 'https:' && url.href.startsWith(prefix);
    } catch (_) {
      return false;
    }
  }

  async function latestRelease() {
    try {
      const response = await fetch(RELEASE_API, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Release lookup failed');
      const payload = await response.json();
      const asset = payload?.channels?.multiplatform;
      if (payload?.ok !== true || payload?.prerelease === true || !asset?.available) throw new Error('Invalid release');
      if (!trusted(asset.download_url, DOWNLOAD_PREFIX) || !trusted(payload.release_url, PAGE_PREFIX)) throw new Error('Untrusted release');
      const download = document.getElementById('hero-download');
      const name = document.getElementById('release-name');
      const date = document.getElementById('release-published');
      const page = document.getElementById('release-page-link');
      if (download) download.href = asset.download_url;
      if (name) name.textContent = 'FormatX Suite Pro';
      if (page) page.href = payload.release_url;
      if (date) {
        const published = new Date(payload.published_at);
        date.textContent = Number.isNaN(published.getTime())
          ? 'GitHub Releases'
          : new Intl.DateTimeFormat(language === 'hu' ? 'hu-HU' : 'en-GB', {
              year: 'numeric', month: '2-digit', day: '2-digit'
            }).format(published);
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
    const sceneId = SCENES[activeScene];
    ROOT.dataset.fxScene = String(activeScene);
    document.querySelectorAll('[data-scene-link]').forEach(anchor => {
      anchor.classList.toggle('active', Number(anchor.dataset.sceneLink) === activeScene);
    });
    document.querySelectorAll('.main-nav a').forEach(anchor => {
      anchor.classList.toggle('active', anchor.getAttribute('href') === '#' + sceneId);
    });
  }

  function scenes() {
    const sceneSections = SCENES.map(id => document.getElementById(id)).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        let best = null;
        entries.forEach(entry => {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (!best) return;
        const index = SCENES.indexOf(best.target.id);
        if (index >= 0) setScene(index);
      }, { threshold: [0.2, 0.4, 0.6] });
      sceneSections.forEach(section => observer.observe(section));
    }

    const syncScrolledState = () => {
      scrollFrame = 0;
      ROOT.classList.toggle('fx-page-scrolled', scrollY > 24);
    };
    const scheduleScrolledState = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScrolledState);
    };
    syncScrolledState();
    addEventListener('scroll', scheduleScrolledState, { passive: true });
    addEventListener('resize', scheduleScrolledState, { passive: true });
    addEventListener('pagehide', () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    }, { once: true });
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

  function initialise() {
    ensureCspSafeStyles();
    navigation();
    applyLanguage(language, false);
    reveal();
    scenes();
    flow();
    updatePrice();
    latestRelease();
    setScene(activeScene);
    ROOT.dataset.fxApex = 'controller-performance-v3-csp-safe-r190';
    ROOT.dataset.fxRenderer = 'three-host';
    ROOT.dataset.fxApexInlineStyleWrites = '0';
    dispatchEvent(new CustomEvent('formatx:apexready', {
      detail: { renderer: 'three-host', infinite: 'delegated', cspSafe: true }
    }));
  }

  ensureCspSafeStyles();
  if (AUDIT_MODE) {
    ROOT.dataset.fxApex = 'audit-skip-r190';
    ROOT.dataset.fxRenderer = 'static-audit';
    ROOT.dataset.fxScene = '0';
    ROOT.dataset.fxFlow = '0';
    ROOT.dataset.fxApexInlineStyleWrites = '0';
    dispatchEvent(new CustomEvent('formatx:apexready', {
      detail: { renderer: 'static-audit', infinite: 'skipped', cspSafe: true }
    }));
    return;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
