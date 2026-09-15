(function () {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.fxProductShowcase === 'v1') return;
  root.dataset.fxProductShowcase = 'v1';

  const ASSET_ROOT = './assets/images/product-showcase/';
  const ITEMS = [
    {
      image: 'control-center.svg',
      accent: 'cyan',
      hu: ['01 / VEZÉRLŐKÖZPONT', 'Tizenkét modul. Egyetlen technikusi munkatér.', 'A központi áttekintés valós állapotokat, modulhozzáférést és az aktív munkafolyamatot egyetlen konzisztens felületen fogja össze.'],
      en: ['01 / CONTROL CENTRE', 'Twelve modules. One technician workspace.', 'The central overview unifies real system state, module access and the active workflow in one consistent interface.']
    },
    {
      image: 'live-system-monitor.svg',
      accent: 'cyan',
      hu: ['02 / ÉLŐ RENDSZERFELÜGYELET', 'Valós idejű telemetria díszadatok nélkül.', 'CPU-, memória-, hálózati és hőmérsékleti értékek közvetlenül a helyi rendszerforrásokból, folyamatosan frissítve.'],
      en: ['02 / LIVE SYSTEM MONITOR', 'Real-time telemetry without decorative data.', 'CPU, memory, network and thermal values are read directly from local system sources and kept continuously current.']
    },
    {
      image: 'diagnostics.svg',
      accent: 'green',
      hu: ['03 / DIAGNOSZTIKA', 'A környezet felmérése a művelet előtt.', 'Hardver-, jogosultság-, csomagkezelő-, meghajtó- és szenzorinformációk egyetlen diagnosztikai nézetben.'],
      en: ['03 / DIAGNOSTICS', 'Assess the environment before acting.', 'Hardware, permissions, package manager, drive and sensor information in one diagnostic view.']
    },
    {
      image: 'portable-installer-compatible.svg',
      accent: 'cyan',
      hu: ['04 / HORDOZHATÓ TELEPÍTŐ', 'Egy projektből több célkörnyezet.', 'Aktuális rendszerre optimalizált vagy teljes cross-platform csomag készíthető Linux-, Windows- és macOS-indítókkal.'],
      en: ['04 / PORTABLE INSTALLER', 'One project, multiple target environments.', 'Build an optimized current-system package or a complete cross-platform bundle with Linux, Windows and macOS launchers.']
    },
    {
      image: 'usb-creator.svg',
      accent: 'cyan',
      hu: ['05 / USB KÉSZÍTŐ', 'Automatikus forrás- és céleszköz-felismerés.', 'ISO-képből indítható adathordozó készül valós idejű folyamattal, állapotjelzéssel és naplóval. A képen az üres, eszközre váró állapot látható.'],
      en: ['05 / USB CREATOR', 'Automatic source and target detection.', 'Create bootable media from an ISO with real-time progress, state feedback and logging. The image shows the empty state waiting for media.']
    }
  ];

  const COPY = {
    hu: {
      eyebrow: '03.5 — A RENDSZER MŰKÖDÉS KÖZBEN',
      title: 'Nem koncepciókép. A valódi FormatX felület.',
      lead: 'A weboldal vizuális rendszere ugyanabból a terméklogikából épül, mint az alkalmazás. Nyisd meg a képeket, és nézd végig a működő Linux / Bazzite kiadás fő munkaterületeit.',
      open: 'Teljes képernyős nézet',
      close: 'Bezárás',
      count: 'valós termékképernyő'
    },
    en: {
      eyebrow: '03.5 — THE SYSTEM IN OPERATION',
      title: 'Not a concept render. The real FormatX interface.',
      lead: 'The website and the application share the same product logic and visual system. Open the images to inspect the primary workspaces of the working Linux / Bazzite edition.',
      open: 'Open full-size view',
      close: 'Close',
      count: 'real product screens'
    }
  };

  const language = () => root.lang === 'en' ? 'en' : 'hu';
  let observer;

  function targetCapabilities() {
    const candidates = Array.from(document.querySelectorAll('section#capabilities, section[data-organ="organs"]'));
    return candidates.find(section => section.isConnected && !section.closest('[data-fx-loop-bridge="true"]'))
      || candidates.find(section => section.isConnected)
      || null;
  }

  function build() {
    const existing = document.getElementById('product-showcase');
    if (existing) return existing;
    const target = targetCapabilities();
    if (!target) return null;

    const section = document.createElement('section');
    section.id = 'product-showcase';
    section.className = 'fx-product-showcase';
    section.dataset.fxProductShowcaseBlock = 'true';
    section.setAttribute('aria-labelledby', 'fx-product-showcase-title');
    section.innerHTML = [
      '<header class="fx-product-showcase__heading">',
      '  <div><p class="section-index" data-showcase-eyebrow></p><h2 id="fx-product-showcase-title" data-showcase-title></h2></div>',
      '  <p data-showcase-lead></p>',
      '  <span class="fx-product-showcase__count"><b>' + String(ITEMS.length).padStart(2, '0') + '</b><small data-showcase-count></small></span>',
      '</header>',
      '<div class="fx-product-showcase__grid" data-showcase-grid></div>',
      '<dialog class="fx-product-showcase__dialog" data-showcase-dialog aria-labelledby="fx-showcase-dialog-title">',
      '  <button type="button" class="fx-product-showcase__close" data-showcase-close></button>',
      '  <figure><img data-showcase-dialog-image width="800" height="418" alt=""><figcaption><span data-showcase-dialog-eyebrow></span><h3 id="fx-showcase-dialog-title" data-showcase-dialog-title></h3><p data-showcase-dialog-description></p></figcaption></figure>',
      '</dialog>'
    ].join('');

    target.insertAdjacentElement('afterend', section);
    wire(section);
    return section;
  }

  function makeCard(item, index, lang) {
    const copy = item[lang];
    const article = document.createElement('article');
    article.className = 'fx-product-showcase__card fx-product-showcase__card--' + item.accent;
    if (index === 0) article.classList.add('fx-product-showcase__card--hero');
    article.innerHTML = [
      '<button type="button" data-showcase-index="' + index + '">',
      '  <span class="fx-product-showcase__media"><img src="' + ASSET_ROOT + item.image + '" loading="lazy" decoding="async" width="800" height="418" alt=""><i aria-hidden="true"></i></span>',
      '  <span class="fx-product-showcase__copy"><small></small><strong></strong><span></span><b aria-hidden="true">↗</b></span>',
      '</button>'
    ].join('');
    const image = article.querySelector('img');
    image.alt = copy[1] + ' — FormatX Suite Pro';
    article.querySelector('small').textContent = copy[0];
    article.querySelector('strong').textContent = copy[1];
    article.querySelector('.fx-product-showcase__copy > span').textContent = copy[2];
    return article;
  }

  function openDialog(section, index) {
    const item = ITEMS[index];
    if (!item) return;
    const lang = language();
    const copy = item[lang];
    const dialog = section.querySelector('[data-showcase-dialog]');
    const image = dialog.querySelector('[data-showcase-dialog-image]');
    image.src = ASSET_ROOT + item.image;
    image.alt = copy[1] + ' — FormatX Suite Pro';
    dialog.querySelector('[data-showcase-dialog-eyebrow]').textContent = copy[0];
    dialog.querySelector('[data-showcase-dialog-title]').textContent = copy[1];
    dialog.querySelector('[data-showcase-dialog-description]').textContent = copy[2];
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function wire(section) {
    section.addEventListener('click', event => {
      const trigger = event.target.closest('[data-showcase-index]');
      if (trigger) {
        openDialog(section, Number(trigger.dataset.showcaseIndex));
        return;
      }
      const dialog = section.querySelector('[data-showcase-dialog]');
      if (event.target.closest('[data-showcase-close]') || event.target === dialog) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
    });
  }

  function render() {
    const section = build();
    if (!section) return false;
    const lang = language();
    const copy = COPY[lang];
    section.querySelector('[data-showcase-eyebrow]').textContent = copy.eyebrow;
    section.querySelector('[data-showcase-title]').textContent = copy.title;
    section.querySelector('[data-showcase-lead]').textContent = copy.lead;
    section.querySelector('[data-showcase-count]').textContent = copy.count;
    section.querySelector('[data-showcase-close]').textContent = copy.close;
    const grid = section.querySelector('[data-showcase-grid]');
    grid.replaceChildren(...ITEMS.map((item, index) => makeCard(item, index, lang)));
    root.dataset.fxProductShowcaseState = 'ready';
    return true;
  }

  function ensure() {
    if (render()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (render() || attempts >= 80) clearInterval(timer);
    }, 250);
  }

  ensure();
  ['DOMContentLoaded', 'pageshow', 'formatx:livingready', 'formatx:loop'].forEach(name => addEventListener(name, ensure));
  addEventListener('formatx:languagechange', () => queueMicrotask(render));
  observer = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(render);
  });
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
}());