(function () {
  'use strict';

  const sections = [
    { id: 'product', short: 'CORE', labelHu: 'Termék', labelEn: 'Product' },
    { id: 'pricing', short: 'LIC', labelHu: 'Licencek', labelEn: 'Licences' },
    { id: 'features', short: 'MOD', labelHu: 'Modulok', labelEn: 'Modules' },
    { id: 'project-details', short: 'ARC', labelHu: 'Architektúra', labelEn: 'Architecture' },
    { id: 'solutions', short: 'INT', labelHu: 'Integritás', labelEn: 'Integrity' },
    { id: 'resources', short: 'REL', labelHu: 'Kiadás', labelEn: 'Release' }
  ];

  let scrollFrame = 0;
  let rail;
  let currentScene = 'product';

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function label(item) {
    return language() === 'en' ? item.labelEn : item.labelHu;
  }

  function prepareSections() {
    return sections.map(function (item, index) {
      const element = document.getElementById(item.id);
      if (!element) return null;
      element.classList.add('fx-directed-section');
      element.dataset.fxSectionIndex = String(index + 1).padStart(2, '0');
      element.dataset.fxSectionLabelHu = item.labelHu;
      element.dataset.fxSectionLabelEn = item.labelEn;
      element.dataset.fxSectionLabel = label(item);
      return { item: item, element: element, index: index };
    }).filter(Boolean);
  }

  function buildRail(items) {
    rail = document.createElement('nav');
    rail.className = 'fx-system-rail';
    rail.setAttribute('aria-label', language() === 'en' ? 'FormatX system sections' : 'FormatX rendszerfejezetek');
    rail.innerHTML = [
      '<div class="fx-system-rail-track"><i></i></div>',
      '<div class="fx-system-rail-brand" aria-hidden="true"><span>FX</span><small>Q/A</small></div>',
      '<div class="fx-system-rail-links">',
      items.map(function (entry) {
        return '<a href="#' + entry.item.id + '" data-fx-rail-target="' + entry.item.id + '" aria-label="' + label(entry.item) + '"><b>' + entry.item.short + '</b><span>' + label(entry.item) + '</span></a>';
      }).join(''),
      '</div>',
      '<output class="fx-system-rail-scene" aria-live="polite"><span>01</span><strong>' + label(items[0].item) + '</strong></output>'
    ].join('');
    document.body.appendChild(rail);
  }

  function updateLanguage(items) {
    items.forEach(function (entry) {
      entry.element.dataset.fxSectionLabel = label(entry.item);
      const link = rail && rail.querySelector('[data-fx-rail-target="' + entry.item.id + '"]');
      if (link) {
        link.setAttribute('aria-label', label(entry.item));
        const text = link.querySelector('span');
        if (text) text.textContent = label(entry.item);
      }
    });
    if (rail) rail.setAttribute('aria-label', language() === 'en' ? 'FormatX system sections' : 'FormatX rendszerfejezetek');
    setActive(items, currentScene);
  }

  function setActive(items, id) {
    const entry = items.find(function (candidate) { return candidate.item.id === id; }) || items[0];
    currentScene = entry.item.id;
    document.documentElement.dataset.fxActiveSection = entry.item.id;
    items.forEach(function (candidate) {
      const active = candidate.item.id === entry.item.id;
      candidate.element.classList.toggle('fx-section-active', active);
      const link = rail && rail.querySelector('[data-fx-rail-target="' + candidate.item.id + '"]');
      if (link) {
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    });
    if (rail) {
      const output = rail.querySelector('.fx-system-rail-scene');
      if (output) {
        const number = output.querySelector('span');
        const title = output.querySelector('strong');
        if (number) number.textContent = String(entry.index + 1).padStart(2, '0');
        if (title) title.textContent = label(entry.item);
      }
    }
  }

  function bindActiveSection(items) {
    if (!('IntersectionObserver' in window)) return;
    const ratios = new Map();
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        if (entry.isIntersecting) entry.target.classList.add('fx-section-seen');
      });
      let selected = items[0];
      let score = -1;
      items.forEach(function (candidate) {
        const rect = candidate.element.getBoundingClientRect();
        const ratio = ratios.get(candidate.element) || 0;
        const center = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        const centerScore = Math.max(0, 1 - center / Math.max(window.innerHeight, 1));
        const next = ratio * 1.4 + centerScore * 0.6;
        if (next > score) {
          score = next;
          selected = candidate;
        }
      });
      setActive(items, selected.item.id);
    }, { rootMargin: '-20% 0px -20% 0px', threshold: [0, 0.08, 0.2, 0.45, 0.7] });

    items.forEach(function (entry) {
      ratios.set(entry.element, 0);
      observer.observe(entry.element);
    });
  }

  function bindProgress() {
    function update() {
      scrollFrame = 0;
      const documentHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.max(0, Math.min(1, window.scrollY / documentHeight));
      document.documentElement.style.setProperty('--fx-page-progress', progress.toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initialise() {
    if (!document.body || document.documentElement.dataset.fxArtDirection === 'ready') return;
    const items = prepareSections();
    if (!items.length) return;

    document.documentElement.dataset.fxArtDirection = 'ready';
    document.documentElement.classList.add('fx-art-direction-ready');
    buildRail(items);
    bindActiveSection(items);
    bindProgress();
    setActive(items, items[0].item.id);

    const languageObserver = new MutationObserver(function (records) {
      if (records.some(function (record) { return record.attributeName === 'lang'; })) updateLanguage(items);
    });
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
