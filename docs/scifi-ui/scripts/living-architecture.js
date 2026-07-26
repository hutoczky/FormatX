(function () {
  'use strict';

  const ROOT = document.documentElement;
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
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
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

  function qrImageUrl(planId, selectedCurrency, retry) {
    const params = new URLSearchParams({
      plan: planId,
      cycle: 'monthly',
      currency: selectedCurrency
    });
    if (retry) params.set('retry', String(Date.now()));
    return '/api/checkout-qr?' + params.toString();
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
    nodes.forEach(function (node, nodeIndex) {
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

    document.querySelectorAll('[data-plan-id]').forEach(function (card) {
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

    PLAN_IDS.forEach(function (planId) {
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

      let retries = 0;
      card.classList.remove('is-qr-ready', 'is-qr-error');
      card.classList.add('is-qr-loading');

      function loadQr(cacheBust) {
        image.src = qrImageUrl(planId, selectedCurrency, cacheBust);
      }

      image.onload = function () {
        if (generation !== qrGeneration) return;
        if (image.naturalWidth < 32 || image.naturalHeight < 32) {
          image.onerror();
          return;
        }
        card.classList.remove('is-qr-loading', 'is-qr-error');
        card.classList.add('is-qr-ready');
      };

      image.onerror = function () {
        if (generation !== qrGeneration) return;
        retries += 1;
        if (retries <= 2) {
          setTimeout(function () {
            if (generation === qrGeneration) loadQr(true);
          }, retries * 900);
          return;
        }
        card.classList.remove('is-qr-loading', 'is-qr-ready');
        card.classList.add('is-qr-error');
      };

      loadQr(false);
      image.alt = plan.name + ' — '
        + (language() === 'hu' ? 'fizetési oldal QR-kódja' : 'payment page QR code');
    });
  }

  function pulse() {
    if (reduceMotion.matches) {
      ROOT.style.setProperty('--organism-scale', '1');
      return;
    }
    let frame = 0;
    function draw(now) {
      if (++frame % 2 === 0) {
        const value = 1 + Math.sin(now * .0027) * .22;
        ROOT.style.setProperty('--organism-scale', value.toFixed(3));
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  function bind() {
    const observer = new MutationObserver(function (entries) {
      if (entries.some(function (entry) {
        return entry.type === 'attributes' && (entry.attributeName === 'data-fx-scene' || entry.attributeName === 'lang');
      })) {
        syncScene();
        updateCommerce();
      }
    });
    observer.observe(ROOT, { attributes: true, attributeFilter: ['data-fx-scene', 'lang'] });

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-currency], [data-language]')) {
        setTimeout(function () {
          syncScene();
          updateCommerce();
        }, 0);
      }
    });

    window.addEventListener('formatx:languagechange', function () {
      syncScene();
      updateCommerce();
    });
    window.addEventListener('pageshow', function () {
      revealQrDock();
      updateCommerce();
    });
  }

  function initialise() {
    revealQrDock();
    syncScene();
    updateCommerce();
    pulse();
    bind();
    ROOT.dataset.fxLivingArchitecture = 'ready';
    window.dispatchEvent(new CustomEvent('formatx:livingready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
}());
