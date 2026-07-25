(function () {
  'use strict';

  const SECTION_URL = './sections/professional-sections.html';

  function currentLanguage() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function updateProfessionalLinks() {
    const language = currentLanguage();
    document.querySelectorAll('#professional-sections-root a[href], #operations-console a[href], .pro-architecture a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        url.searchParams.set('lang', language);
        link.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  function applyProfessionalLanguage() {
    const language = currentLanguage();
    document.querySelectorAll('[data-pro-hu][data-pro-en]').forEach(function (element) {
      const value = language === 'en' ? element.dataset.proEn : element.dataset.proHu;
      if (typeof value === 'string') element.textContent = value;
    });
    updateProfessionalLinks();
  }

  function activateTab(button, focus) {
    const target = button.dataset.proTab;
    if (!target) return;

    document.querySelectorAll('[data-pro-tab]').forEach(function (candidate) {
      const selected = candidate === button;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    });

    document.querySelectorAll('[data-pro-panel]').forEach(function (panel) {
      const active = panel.dataset.proPanel === target;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    const root = document.getElementById('operations-console');
    if (root) root.dataset.activeScenario = target;
    if (focus) button.focus();
  }

  function initialiseTabs() {
    const buttons = Array.from(document.querySelectorAll('[data-pro-tab]'));
    if (!buttons.length) return;

    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        activateTab(button, false);
      });

      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        activateTab(buttons[nextIndex], true);
      });
    });

    const selected = buttons.find(function (button) {
      return button.getAttribute('aria-selected') === 'true';
    }) || buttons[0];
    activateTab(selected, false);
  }

  function initialiseReveal() {
    const elements = document.querySelectorAll('.pro-reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(function (element) { element.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    elements.forEach(function (element) { observer.observe(element); });
  }

  function openRequestedSection() {
    if (window.location.hash !== '#operations-console') return;
    window.requestAnimationFrame(function () {
      const section = document.getElementById('operations-console');
      if (section) section.scrollIntoView({ block: 'start' });
    });
  }

  async function mountSections() {
    if (document.getElementById('operations-console')) return true;

    const root = document.getElementById('professional-sections-root');
    if (!root) return false;

    root.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(SECTION_URL, { credentials: 'same-origin', cache: 'no-cache' });
      if (!response.ok) throw new Error('Section request failed: ' + response.status);
      root.innerHTML = await response.text();
      root.removeAttribute('aria-busy');
      return true;
    } catch (_) {
      root.removeAttribute('aria-busy');
      return false;
    }
  }

  const languageObserver = new MutationObserver(function (mutations) {
    if (mutations.some(function (mutation) { return mutation.attributeName === 'lang'; })) {
      applyProfessionalLanguage();
    }
  });

  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  mountSections().then(function (mounted) {
    if (!mounted) return;
    applyProfessionalLanguage();
    initialiseTabs();
    initialiseReveal();
    openRequestedSection();
  });
}());