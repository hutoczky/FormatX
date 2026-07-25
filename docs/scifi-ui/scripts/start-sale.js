(function () {
  'use strict';

  // Retained only as a migration/CI reference for the previous launch campaign.
  // These values are never used for display, checkout or payment calculation.
  const LEGACY_PRICE_REFERENCE = {
    monthlyDiscount: 20,
    annualDiscount: 30,
    plans: {
      business_lite: {
        current: { HUF: { monthly: 15900, annual: 139300 }, EUR: { monthly: 44, annual: 383 } },
        regular: { HUF: { monthly: 19900, annual: 199000 }, EUR: { monthly: 55, annual: 547 } }
      },
      business_pro: {
        current: { HUF: { monthly: 39900, annual: 349300 }, EUR: { monthly: 110, annual: 961 } },
        regular: { HUF: { monthly: 49900, annual: 499000 }, EUR: { monthly: 137, annual: 1373 } }
      },
      technician_team: {
        current: { HUF: { monthly: 79900, annual: 699300 }, EUR: { monthly: 220, annual: 1924 } },
        regular: { HUF: { monthly: 99900, annual: 999000 }, EUR: { monthly: 275, annual: 2748 } }
      }
    }
  };
  void LEGACY_PRICE_REFERENCE;

  const PRICING = {
    business_lite: {
      name: 'Business Lite',
      HUF: { monthly: 7900, annual: 79000 },
      EUR: { monthly: 22, annual: 220 }
    },
    business_pro: {
      name: 'Business Pro',
      HUF: { monthly: 15900, annual: 159000 },
      EUR: { monthly: 44, annual: 440 }
    },
    technician_team: {
      name: 'Technician Team',
      HUF: { monthly: 29900, annual: 299000 },
      EUR: { monthly: 83, annual: 830 }
    }
  };

  const PLAN_IDS = ['business_lite', 'business_pro', 'technician_team'];
  const COPY = {
    hu: {
      badge: 'BEVEZETŐ AJÁNLAT',
      title: 'Bevezető árak',
      message: 'Piaci bevezető árszint. Éves licencnél 12 hónapot kapsz 10 hónap áráért.',
      annual: 'Éves: {price} · 2 hónap díjmentes',
      qr: 'Fizetés QR-kóddal',
      qrAlt: 'FormatX checkout QR-kód',
      monthly: '/ hónap',
      checkoutNote: 'A bevezető ár aktív. Az éves csomag két hónap díjmentes hozzáférést tartalmaz.'
    },
    en: {
      badge: 'INTRODUCTORY OFFER',
      title: 'Introductory pricing',
      message: 'Market-entry pricing. Annual licences include 12 months for the price of 10.',
      annual: 'Annual: {price} · 2 months included',
      qr: 'Pay by QR code',
      qrAlt: 'FormatX checkout QR code',
      monthly: '/ month',
      checkoutNote: 'Introductory pricing is active. Annual plans include two months at no extra charge.'
    }
  };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function text(key) {
    return COPY[language()][key];
  }

  function currency() {
    const selected = document.querySelector('[data-currency][aria-pressed="true"]');
    return selected?.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function formatPrice(value, selectedCurrency) {
    return new Intl.NumberFormat(language() === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function checkoutHref(planId, cycle, selectedCurrency) {
    const params = new URLSearchParams({
      plan: planId,
      cycle: cycle,
      currency: selectedCurrency,
      lang: language(),
      source: 'pricing'
    });
    return './checkout.html?' + params.toString();
  }

  function qrSrc(planId, cycle, selectedCurrency) {
    const params = new URLSearchParams({
      plan: planId,
      cycle: cycle,
      currency: selectedCurrency
    });
    return '/api/checkout-qr?' + params.toString();
  }

  function ensureBanner() {
    const existing = document.getElementById('formatx-start-sale-banner');
    if (existing) return existing;
    const anchor = document.querySelector('.topbar, .site-header');
    if (!anchor) return null;

    const banner = document.createElement('aside');
    banner.id = 'formatx-start-sale-banner';
    banner.className = 'start-sale-banner v100-price-banner';
    banner.innerHTML = [
      '<span class="start-sale-banner-badge" data-v100="badge"></span>',
      '<div class="start-sale-banner-copy"><strong data-v100="title"></strong><span data-v100="message"></span></div>',
      '<a class="start-sale-banner-link" href="#pricing" data-v100="qr"></a>'
    ].join('');
    anchor.insertAdjacentElement('afterend', banner);
    return banner;
  }

  function ensurePricingCallout() {
    const panel = document.querySelector('#pricing .pricing-panel');
    if (!panel) return;
    let callout = document.getElementById('formatx-v100-pricing-callout');
    if (!callout) {
      callout = document.createElement('div');
      callout.id = 'formatx-v100-pricing-callout';
      callout.className = 'start-sale-callout v100-price-callout';
      callout.innerHTML = '<strong data-v100="title"></strong><span data-v100="message"></span>';
      const title = panel.querySelector('.panel-title');
      if (title) title.insertAdjacentElement('afterend', callout);
      else panel.prepend(callout);
    }
  }

  function ensureCardAnnualPrice(card) {
    // QR payment belongs only in the dedicated payment panel on the right.
    // Remove any card-level QR left by an older cached script or markup.
    card.querySelectorAll('.v100-card-qr').forEach(function (qr) {
      qr.remove();
    });

    let annual = card.querySelector('.v100-annual-price');
    if (!annual) {
      annual = document.createElement('div');
      annual.className = 'v100-annual-price';
      const list = card.querySelector('ul');
      if (list) list.insertAdjacentElement('beforebegin', annual);
      else card.append(annual);
    }
    return annual;
  }

  function updateHomeCards() {
    document.querySelectorAll('#pricing .price-card').forEach(function (card, index) {
      const planId = PLAN_IDS[index];
      const plan = PRICING[planId];
      if (!plan) return;
      const selectedCurrency = currency();
      const strong = card.querySelector('.price strong');
      const period = card.querySelector('.price span');
      const secondary = card.querySelector(':scope > small');
      const selectLink = card.querySelector(':scope > a');
      const annual = ensureCardAnnualPrice(card);

      if (strong) strong.textContent = formatPrice(plan[selectedCurrency].monthly, selectedCurrency);
      if (period) period.textContent = text('monthly');
      if (secondary) {
        const otherCurrency = selectedCurrency === 'HUF' ? 'EUR' : 'HUF';
        secondary.textContent = formatPrice(plan[otherCurrency].monthly, otherCurrency) + text('monthly');
      }
      annual.textContent = text('annual').replace(
        '{price}',
        formatPrice(plan[selectedCurrency].annual, selectedCurrency)
      );
      if (selectLink) selectLink.href = checkoutHref(planId, 'monthly', selectedCurrency);
    });
  }

  function updatePreview() {
    const plan = PRICING.business_pro;
    const selectedCurrency = currency();
    const otherCurrency = selectedCurrency === 'HUF' ? 'EUR' : 'HUF';
    const mainPrice = document.getElementById('preview-main-price');
    const secondaryPrice = document.getElementById('preview-secondary-price');
    const checkoutLink = document.getElementById('preview-checkout-link');
    const qrLink = document.getElementById('qr-preview-link');

    if (mainPrice) mainPrice.textContent = formatPrice(plan[selectedCurrency].monthly, selectedCurrency);
    if (secondaryPrice) secondaryPrice.textContent = formatPrice(plan[otherCurrency].monthly, otherCurrency);
    const href = checkoutHref('business_pro', 'monthly', selectedCurrency);
    if (checkoutLink) checkoutLink.href = href;

    if (qrLink) {
      qrLink.href = href;
      qrLink.classList.add('v100-preview-qr');
      let image = qrLink.querySelector('.v100-real-qr');
      if (!image) {
        qrLink.textContent = '';
        const title = document.createElement('span');
        title.className = 'scan-label';
        title.textContent = text('qr');
        image = document.createElement('img');
        image.className = 'v100-real-qr';
        image.width = 180;
        image.height = 180;
        const note = document.createElement('small');
        note.textContent = 'FormatX Suite Pro · Business Pro';
        qrLink.append(title, image, note);
      }
      image.src = qrSrc('business_pro', 'monthly', selectedCurrency);
      image.alt = text('qrAlt') + ' — Business Pro';
      const title = qrLink.querySelector('.scan-label');
      if (title) title.textContent = text('qr');
    }
  }

  function updateCheckoutPage() {
    const hero = document.querySelector('.checkout-hero');
    if (!hero) return;
    let note = document.getElementById('v100-checkout-pricing-note');
    if (!note) {
      note = document.createElement('p');
      note.id = 'v100-checkout-pricing-note';
      note.className = 'start-sale-checkout-note';
      hero.append(note);
    }
    note.textContent = text('checkoutNote');
  }

  function applyCopy() {
    document.querySelectorAll('[data-v100]').forEach(function (element) {
      const value = text(element.dataset.v100);
      if (value) element.textContent = value;
    });
  }

  function refresh() {
    ensureBanner();
    ensurePricingCallout();
    updateHomeCards();
    updatePreview();
    updateCheckoutPage();
    applyCopy();
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-currency], [data-language], [data-language-choice]')) {
      window.setTimeout(refresh, 0);
    }
  });
  window.addEventListener('formatx:languagechange', refresh);
  window.addEventListener('pageshow', refresh);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
}());
