(function () {
  'use strict';

  const PLANS = [
    { id: 'business_lite', name: 'Business Lite', HUF: 7900, EUR: 22 },
    { id: 'business_pro', name: 'Business Pro', HUF: 15900, EUR: 44 },
    { id: 'technician_team', name: 'Technician Team', HUF: 29900, EUR: 83 }
  ];

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function currency() {
    const selected = document.querySelector('[data-currency][aria-pressed="true"]');
    return selected && selected.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function formatPrice(value, selectedCurrency) {
    return new Intl.NumberFormat(language() === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function checkoutHref(planId, selectedCurrency) {
    const params = new URLSearchParams({
      plan: planId,
      cycle: 'monthly',
      currency: selectedCurrency,
      lang: language(),
      source: 'pricing-qr'
    });
    return './checkout.html?' + params.toString();
  }

  function qrHref(planId, selectedCurrency) {
    const params = new URLSearchParams({
      plan: planId,
      cycle: 'monthly',
      currency: selectedCurrency
    });
    return '/api/checkout-qr?' + params.toString();
  }

  function copy() {
    if (language() === 'en') {
      return {
        title: 'PAYMENT QR CODES',
        intro: 'Each licence plan has its own QR code. Scan it to open the selected checkout securely.',
        note: 'Monthly licence · fixed amount · no card-data handling',
        alt: 'FormatX payment QR code',
        open: 'Open checkout for'
      };
    }
    return {
      title: 'FIZETÉS QR-KÓDDAL',
      intro: 'Mindhárom licenccsomag saját QR-kódot kapott. Beolvasás után a kiválasztott fizetési oldal nyílik meg.',
      note: 'Havi licenc · rögzített összeg · bankkártyaadat-kezelés nélkül',
      alt: 'FormatX fizetési QR-kód',
      open: 'Fizetés megnyitása:'
    };
  }

  function markup() {
    return [
      '<section id="formatx-plan-qr-dock" class="fx-plan-qr-dock" aria-labelledby="formatx-plan-qr-title">',
      '<header class="fx-plan-qr-head">',
      '<strong id="formatx-plan-qr-title"></strong>',
      '<span class="fx-plan-qr-intro"></span>',
      '</header>',
      '<div class="fx-plan-qr-grid">',
      PLANS.map(function (plan) {
        return [
          '<article class="fx-plan-qr-card is-qr-loading" data-plan-qr="', plan.id, '">',
          '<div class="fx-plan-qr-copy">',
          '<strong>', plan.name, '</strong>',
          '<span></span>',
          '<small></small>',
          '</div>',
          '<a class="fx-plan-qr-link" href="#" aria-label="">',
          '<img width="112" height="112" alt="">',
          '</a>',
          '</article>'
        ].join('');
      }).join(''),
      '</div>',
      '</section>'
    ].join('');
  }

  function ensureDock() {
    let dock = document.getElementById('formatx-plan-qr-dock');
    if (dock) return dock;

    const cards = document.querySelector('#pricing .price-cards');
    if (!cards) return null;
    cards.insertAdjacentHTML('afterend', markup());
    dock = document.getElementById('formatx-plan-qr-dock');
    return dock;
  }

  function loadImage(card, image, src) {
    let retries = 0;
    card.classList.remove('is-qr-ready', 'is-qr-error');
    card.classList.add('is-qr-loading');

    function applySource(cacheBust) {
      const separator = src.includes('?') ? '&' : '?';
      image.src = cacheBust ? src + separator + 'retry=' + Date.now() : src;
    }

    image.onload = function () {
      if (image.naturalWidth < 32 || image.naturalHeight < 32) {
        image.onerror();
        return;
      }
      card.classList.remove('is-qr-loading', 'is-qr-error');
      card.classList.add('is-qr-ready');
    };

    image.onerror = function () {
      retries += 1;
      if (retries <= 2) {
        window.setTimeout(function () {
          applySource(true);
        }, retries * 900);
        return;
      }
      card.classList.remove('is-qr-loading', 'is-qr-ready');
      card.classList.add('is-qr-error');
    };

    applySource(false);
  }

  function refresh() {
    const dock = ensureDock();
    if (!dock) return;

    const selectedCurrency = currency();
    const words = copy();
    const title = dock.querySelector('#formatx-plan-qr-title');
    const intro = dock.querySelector('.fx-plan-qr-intro');
    if (title) title.textContent = words.title;
    if (intro) intro.textContent = words.intro;

    PLANS.forEach(function (plan) {
      const card = dock.querySelector('[data-plan-qr="' + plan.id + '"]');
      if (!card) return;
      const amount = card.querySelector('.fx-plan-qr-copy span');
      const note = card.querySelector('.fx-plan-qr-copy small');
      const link = card.querySelector('.fx-plan-qr-link');
      const image = card.querySelector('img');
      const checkout = checkoutHref(plan.id, selectedCurrency);
      const qr = qrHref(plan.id, selectedCurrency);

      if (amount) amount.textContent = formatPrice(plan[selectedCurrency], selectedCurrency) + (language() === 'en' ? ' / month' : ' / hónap');
      if (note) note.textContent = words.note;
      if (link) {
        link.href = checkout;
        link.setAttribute('aria-label', words.open + ' ' + plan.name);
      }
      if (image) {
        image.alt = words.alt + ' — ' + plan.name;
        if (image.dataset.fxQrSource !== qr || !image.complete || image.naturalWidth < 32) {
          image.dataset.fxQrSource = qr;
          loadImage(card, image, qr);
        }
      }
    });

    dock.dataset.fxQrReady = 'true';
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-currency], [data-language], [data-language-choice]')) {
      window.setTimeout(refresh, 0);
    }
  });

  window.addEventListener('pageshow', refresh);
  window.addEventListener('formatx:languagechange', refresh);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
}());
