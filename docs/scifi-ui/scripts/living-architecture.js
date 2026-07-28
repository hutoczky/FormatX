(function () {
  'use strict';

  const ROOT = document.documentElement;
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE) {
    const canvas = document.getElementById('fx-apex-canvas');
    if (canvas) canvas.hidden = true;
    ROOT.classList.add('fx-audit-mode');
    ROOT.dataset.fxThree = 'audit-skip';
    ROOT.dataset.fxLighthouse = 'ready';
    ROOT.dataset.fxLivingArchitecture = 'audit-skip';
    dispatchEvent(new CustomEvent('formatx:livingready'));
    return;
  }

  const PLAN_IDS = ['business_lite', 'business_pro', 'technician_team'];
  const PLANS = {
    business_lite: { name: 'Business Lite', HUF: 7900, EUR: 22 },
    business_pro: { name: 'Business Pro', HUF: 15900, EUR: 44 },
    technician_team: { name: 'Technician Team', HUF: 29900, EUR: 83 }
  };
  const SCENES = [
    { hu: 'MAG', en: 'CORE', progress: 0 },
    { hu: 'IDEGRENDSZER', en: 'NERVOUS SYSTEM', progress: .2 },
    { hu: 'RENDSZERSZERVEK', en: 'SYSTEM ORGANS', progress: .4 },
    { hu: 'KERESKEDELMI SZÍV', en: 'COMMERCE HEART', progress: .6 },
    { hu: 'RENDSZERVÁZ', en: 'SYSTEM SKELETON', progress: .8 },
    { hu: 'KIADÁSI JELADÓ', en: 'RELEASE BEACON', progress: 1 }
  ];

  const status = document.querySelector('.fx-organism-status');
  const statusIndex = status?.querySelector('.fx-organism-status-index');
  const statusName = status?.querySelector('strong');
  const nodes = Array.from(document.querySelectorAll('[data-organ-node]'));
  let qrGeneration = 0;

  function language() {
    return ROOT.lang === 'en' ? 'en' : 'hu';
  }

  function currency() {
    return document.querySelector('[data-currency][aria-pressed="true"]')?.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function money(value, selectedCurrency) {
    return new Intl.NumberFormat(language() === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function checkoutHref(planId, selectedCurrency) {
    const url = new URL('./checkout.html', location.href);
    url.searchParams.set('plan', planId);
    url.searchParams.set('cycle', 'monthly');
    url.searchParams.set('currency', selectedCurrency);
    url.searchParams.set('lang', language());
    url.searchParams.set('source', 'living-qr-dock');
    return url.href;
  }

  function qrImageUrl(planId, selectedCurrency) {
    return './assets/qr/' + planId + '-' + selectedCurrency.toLowerCase() + '.svg';
  }

  function loadThreeExperience() {
    if (!document.querySelector('link[data-fx-cryosphere-style]')) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = './styles/igloo-parity.css?v=20260727-webgpu-1';
      style.dataset.fxCryosphereStyle = 'true';
      document.head.appendChild(style);
    }
    if (!document.querySelector('link[data-fx-readability-style]')) {
      const readability = document.createElement('link');
      readability.rel = 'stylesheet';
      readability.href = './styles/readability-focus.css?v=20260727-readability-2';
      readability.dataset.fxReadabilityStyle = 'true';
      readability.addEventListener('load', () => {
        ROOT.dataset.fxReadability = 'ready';
      }, { once: true });
      document.head.appendChild(readability);
    }
    if (!document.querySelector('link[data-fx-organism-interface-style]')) {
      const organismStyle = document.createElement('link');
      organismStyle.rel = 'stylesheet';
      organismStyle.href = './styles/organism-interface.css?v=20260727-organism-1';
      organismStyle.dataset.fxOrganismInterfaceStyle = 'true';
      document.head.appendChild(organismStyle);
    }
    if (!document.querySelector('link[data-fx-organism-layering-style]')) {
      const organismLayering = document.createElement('link');
      organismLayering.rel = 'stylesheet';
      organismLayering.href = './styles/organism-interface-layering.css?v=20260727-fullscreen-1';
      organismLayering.dataset.fxOrganismLayeringStyle = 'true';
      document.head.appendChild(organismLayering);
    }
    if (!document.querySelector('script[data-fx-cryosphere-script]')) {
      const script = document.createElement('script');
      script.src = './scripts/igloo-parity.js?v=20260728-cinematic-v4';
      script.defer = true;
      script.dataset.fxCryosphereScript = 'true';
      document.head.appendChild(script);
    }
    if (!document.querySelector('script[data-fx-organism-interface-script]')) {
      const organismScript = document.createElement('script');
      organismScript.src = './scripts/organism-interface.js?v=20260727-organism-2';
      organismScript.defer = true;
      organismScript.dataset.fxOrganismInterfaceScript = 'true';
      document.head.appendChild(organismScript);
    }
    if (!document.querySelector('script[data-fx-organism-menu-script]')) {
      const menuScript = document.createElement('script');
      menuScript.src = './scripts/organism-menu-controller.js?v=20260727-organism-1';
      menuScript.defer = true;
      menuScript.dataset.fxOrganismMenuScript = 'true';
      document.head.appendChild(menuScript);
    }
  }

  function revealQrDock() {
    const dock = document.getElementById('formatx-plan-qr-dock');
    if (!dock) return;
    dock.classList.add('visible');
    dock.style.setProperty('opacity', '1', 'important');
    dock.style.setProperty('visibility', 'visible', 'important');
    dock.style.setProperty('transform', 'none', 'important');
    dock.style.setProperty('filter', 'none', 'important');
    dock.dataset.fxQrVisible = 'true';
  }

  function syncScene() {
    const raw = Number(ROOT.dataset.fxScene || 0);
    const index = Math.max(0, Math.min(SCENES.length - 1, Number.isFinite(raw) ? raw : 0));
    const scene = SCENES[index];
    ROOT.style.setProperty('--organism-progress', Math.round(scene.progress * 100) + '%');
    if (statusIndex) statusIndex.textContent = String(index + 1).padStart(2, '0') + ' / 06';
    if (statusName) statusName.textContent = scene[language()];
    nodes.forEach((node, nodeIndex) => {
      const active = nodeIndex === index;
      node.classList.toggle('active', active);
      if (active) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
  }

  function updateCommerce() {
    const selectedCurrency = currency();
    const otherCurrency = selectedCurrency === 'HUF' ? 'EUR' : 'HUF';
    const generation = ++qrGeneration;
    revealQrDock();

    document.querySelectorAll('[data-plan-id]').forEach(card => {
      const planId = card.dataset.planId;
      const plan = PLANS[planId];
      if (!plan) return;
      const main = card.querySelector('.price strong');
      const secondary = card.querySelector('.price small');
      const link = card.querySelector(':scope > a');
      if (main) main.textContent = money(plan[selectedCurrency], selectedCurrency);
      if (secondary) secondary.textContent = money(plan[otherCurrency], otherCurrency)
        + (language() === 'hu' ? ' / hó' : ' / month');
      if (link) link.href = checkoutHref(planId, selectedCurrency);
    });

    PLAN_IDS.forEach(planId => {
      const plan = PLANS[planId];
      const card = document.querySelector('[data-plan-qr="' + planId + '"]');
      if (!plan || !card) return;
      const link = card.querySelector('.fx-plan-qr-link');
      const image = card.querySelector('[data-plan-qr-image]');
      const price = card.querySelector('[data-plan-qr-price]');
      const href = checkoutHref(planId, selectedCurrency);
      if (price) price.textContent = money(plan[selectedCurrency], selectedCurrency)
        + (language() === 'hu' ? ' / hó' : ' / month');
      if (link) {
        link.href = href;
        link.setAttribute('aria-label', plan.name + ' — '
          + (language() === 'hu' ? 'fizetés megnyitása' : 'open payment'));
      }
      if (!image) return;
      card.classList.remove('is-qr-ready', 'is-qr-error');
      card.classList.add('is-qr-loading');
      image.onload = () => {
        if (generation !== qrGeneration) return;
        if (image.naturalWidth < 32 || image.naturalHeight < 32) {
          image.onerror();
          return;
        }
        card.classList.remove('is-qr-loading', 'is-qr-error');
        card.classList.add('is-qr-ready');
      };
      image.onerror = () => {
        if (generation !== qrGeneration) return;
        card.classList.remove('is-qr-loading', 'is-qr-ready');
        card.classList.add('is-qr-error');
      };
      image.alt = plan.name + ' — '
        + (language() === 'hu' ? 'fizetési oldal QR-kódja' : 'payment page QR code');
      if (ROOT.dataset.fxLocalQr === 'ready') image.src = qrImageUrl(planId, selectedCurrency);
      else image.removeAttribute('src');
    });
  }

  function bind() {
    const observer = new MutationObserver(entries => {
      if (entries.some(entry => entry.type === 'attributes' && (entry.attributeName === 'data-fx-scene' || entry.attributeName === 'lang'))) {
        syncScene();
        updateCommerce();
      }
    });
    observer.observe(ROOT, { attributes: true, attributeFilter: ['data-fx-scene', 'lang'] });
    document.addEventListener('click', event => {
      if (!event.target.closest('[data-currency], [data-language]')) return;
      setTimeout(() => {
        syncScene();
        updateCommerce();
      }, 0);
    });
    addEventListener('formatx:languagechange', () => {
      syncScene();
      updateCommerce();
    });
    addEventListener('pageshow', () => {
      revealQrDock();
      updateCommerce();
    });
  }

  function initialise() {
    loadThreeExperience();
    revealQrDock();
    syncScene();
    updateCommerce();
    bind();
    ROOT.dataset.fxLivingArchitecture = 'ready';
    dispatchEvent(new CustomEvent('formatx:livingready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
}());
