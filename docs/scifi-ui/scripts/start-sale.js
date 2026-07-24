(function () {
  'use strict';

  const PROMOTION = {
    id: 'formatx-start-sale-2026',
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

  const COPY = {
    hu: {
      bannerBadge: 'START AKCIÓ',
      bannerTitle: 'Bevezető FormatX árak',
      bannerText: 'Havi licencek 20%, éves licencek 30% kedvezménnyel.',
      bannerCta: 'Akciós csomagok',
      panelTitle: 'START AKCIÓ – BEVEZETŐ ÁRAK',
      panelText: 'A jelenlegi fizetendő árak már az induló kedvezményt tartalmazzák: havi csomagoknál −20%, éves csomagoknál −30%.',
      badgeMonthly: 'START AKCIÓ −20%',
      badgeAnnual: 'START AKCIÓ −30%',
      regularPrice: 'Normál ár',
      salePrice: 'Start akciós ár',
      saving: 'Megtakarítás',
      checkoutNote: 'A fizetendő összeg már a Start akciós kedvezményt tartalmazza.',
      monthly: 'hó',
      annual: 'év'
    },
    en: {
      bannerBadge: 'LAUNCH OFFER',
      bannerTitle: 'Introductory FormatX pricing',
      bannerText: '20% off monthly licences and 30% off annual licences.',
      bannerCta: 'View offer plans',
      panelTitle: 'LAUNCH OFFER – INTRODUCTORY PRICES',
      panelText: 'The current payable prices already include the launch discount: 20% off monthly plans and 30% off annual plans.',
      badgeMonthly: 'LAUNCH OFFER −20%',
      badgeAnnual: 'LAUNCH OFFER −30%',
      regularPrice: 'Regular price',
      salePrice: 'Launch price',
      saving: 'You save',
      checkoutNote: 'The amount payable already includes the launch discount.',
      monthly: 'month',
      annual: 'year'
    }
  };

  function currentLanguage() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function copy() {
    return COPY[currentLanguage()];
  }

  function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatPrice(value, currency) {
    return new Intl.NumberFormat(currentLanguage() === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function selectedPlanId() {
    const select = document.getElementById('plan-id');
    return select && PROMOTION.plans[select.value] ? select.value : 'business_pro';
  }

  function selectedCycle() {
    return document.getElementById('billing-cycle')?.value === 'annual' ? 'annual' : 'monthly';
  }

  function selectedCurrency() {
    return document.getElementById('payment-currency')?.value === 'EUR' ? 'EUR' : 'HUF';
  }

  function discountPercent(cycle) {
    return cycle === 'annual' ? PROMOTION.annualDiscount : PROMOTION.monthlyDiscount;
  }

  function ensureBanner() {
    if (document.getElementById('formatx-start-sale-banner')) return;
    const anchor = document.querySelector('.topbar, .site-header');
    if (!anchor) return;

    const banner = create('aside', 'start-sale-banner');
    banner.id = 'formatx-start-sale-banner';
    banner.setAttribute('aria-label', 'FormatX Start akció');

    const badge = create('span', 'start-sale-banner-badge');
    badge.dataset.saleCopy = 'bannerBadge';
    const content = create('div', 'start-sale-banner-copy');
    const title = create('strong');
    title.dataset.saleCopy = 'bannerTitle';
    const text = create('span');
    text.dataset.saleCopy = 'bannerText';
    content.append(title, text);
    const link = create('a', 'start-sale-banner-link');
    link.href = document.getElementById('pricing') ? '#pricing' : '/#pricing';
    link.dataset.saleCopy = 'bannerCta';
    banner.append(badge, content, link);
    anchor.insertAdjacentElement('afterend', banner);
  }

  function ensureHomePromotion() {
    const pricingPanel = document.querySelector('#pricing .pricing-panel');
    if (!pricingPanel) return;

    if (!document.getElementById('formatx-start-sale-callout')) {
      const callout = create('div', 'start-sale-callout');
      callout.id = 'formatx-start-sale-callout';
      const label = create('strong');
      label.dataset.saleCopy = 'panelTitle';
      const message = create('span');
      message.dataset.saleCopy = 'panelText';
      callout.append(label, message);
      const title = pricingPanel.querySelector('.panel-title');
      if (title) title.insertAdjacentElement('afterend', callout);
      else pricingPanel.prepend(callout);
    }

    const ids = ['business_lite', 'business_pro', 'technician_team'];
    document.querySelectorAll('#pricing .price-card').forEach(function (card, index) {
      const planId = ids[index];
      const plan = PROMOTION.plans[planId];
      if (!plan) return;

      if (!card.querySelector('.start-sale-badge')) {
        const badge = create('span', 'start-sale-badge');
        badge.dataset.saleCopy = 'badgeMonthly';
        card.prepend(badge);
      }

      const price = card.querySelector('.price');
      if (price && !card.querySelector('.start-sale-original')) {
        const original = create('div', 'start-sale-original');
        original.dataset.planId = planId;
        const label = create('span');
        label.dataset.saleCopy = 'regularPrice';
        const eur = create('del', '', formatPrice(plan.regular.EUR.monthly, 'EUR'));
        const huf = create('del', '', formatPrice(plan.regular.HUF.monthly, 'HUF'));
        original.append(label, eur, huf);
        price.insertAdjacentElement('beforebegin', original);
      }

      if (!card.querySelector('.start-sale-saving')) {
        const saving = create('div', 'start-sale-saving');
        saving.dataset.saleCopy = 'checkoutNote';
        const currentHuf = card.querySelector(':scope > small');
        if (currentHuf) currentHuf.insertAdjacentElement('afterend', saving);
        else card.append(saving);
      }
    });

    const preview = document.querySelector('.checkout-preview .checkout-price-box');
    if (preview && !document.getElementById('preview-regular-price')) {
      const original = create('div', 'start-sale-preview-original');
      original.id = 'preview-regular-price';
      const label = create('span');
      label.dataset.saleCopy = 'regularPrice';
      const value = create('del');
      value.id = 'preview-regular-value';
      original.append(label, value);
      const mainPrice = document.getElementById('preview-main-price');
      if (mainPrice) mainPrice.insertAdjacentElement('beforebegin', original);
      else preview.append(original);
    }

    updateHomePreview();
  }

  function updateHomePreview() {
    const value = document.getElementById('preview-regular-value');
    if (!value) return;
    const active = document.querySelector('[data-currency][aria-pressed="true"]');
    const currency = active?.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
    value.textContent = formatPrice(PROMOTION.plans.business_pro.regular[currency].monthly, currency);
  }

  function ensureCheckoutPromotion() {
    const summary = document.querySelector('.checkout-summary dl');
    if (!summary) return;

    if (!document.getElementById('summary-regular-price')) {
      const regularRow = create('div', 'start-sale-summary-row');
      const regularLabel = create('dt');
      regularLabel.dataset.saleCopy = 'regularPrice';
      const regularValue = create('dd');
      regularValue.id = 'summary-regular-price';
      regularRow.append(regularLabel, regularValue);

      const savingRow = create('div', 'start-sale-summary-row start-sale-summary-saving');
      const savingLabel = create('dt');
      savingLabel.dataset.saleCopy = 'saving';
      const savingValue = create('dd');
      savingValue.id = 'summary-sale-saving';
      savingRow.append(savingLabel, savingValue);

      const priceRow = document.getElementById('summary-price')?.closest('div');
      if (priceRow) priceRow.insertAdjacentElement('beforebegin', regularRow);
      else summary.append(regularRow);
      regularRow.insertAdjacentElement('afterend', savingRow);
    }

    if (!document.getElementById('checkout-start-sale-note')) {
      const note = create('p', 'start-sale-checkout-note');
      note.id = 'checkout-start-sale-note';
      note.dataset.saleCopy = 'checkoutNote';
      const hero = document.querySelector('.checkout-hero');
      if (hero) hero.append(note);
    }

    updateCheckoutPromotion();
  }

  function updateCheckoutPromotion() {
    const plan = PROMOTION.plans[selectedPlanId()];
    if (!plan) return;
    const cycle = selectedCycle();
    const currency = selectedCurrency();
    const regular = plan.regular[currency][cycle];
    const current = plan.current[currency][cycle];
    const saving = regular - current;

    const regularValue = document.getElementById('summary-regular-price');
    const savingValue = document.getElementById('summary-sale-saving');
    if (regularValue) {
      regularValue.textContent = formatPrice(regular, currency);
      regularValue.classList.add('start-sale-del');
    }
    if (savingValue) {
      savingValue.textContent = `${formatPrice(saving, currency)} (−${discountPercent(cycle)}%)`;
    }
  }

  function applyCopy() {
    const dictionary = copy();
    document.querySelectorAll('[data-sale-copy]').forEach(function (element) {
      const value = dictionary[element.dataset.saleCopy];
      if (typeof value === 'string') element.textContent = value;
    });
  }

  function refresh() {
    ensureBanner();
    ensureHomePromotion();
    ensureCheckoutPromotion();
    applyCopy();
    updateHomePreview();
    updateCheckoutPromotion();
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-currency], [data-language], [data-language-choice]')) {
      window.setTimeout(refresh, 0);
    }
  });

  ['plan-id', 'billing-cycle', 'payment-currency'].forEach(function (id) {
    document.getElementById(id)?.addEventListener('change', refresh);
  });

  window.addEventListener('formatx:languagechange', refresh);
  window.addEventListener('pageshow', refresh);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
}());
