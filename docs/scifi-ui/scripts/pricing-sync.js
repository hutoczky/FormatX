(function () {
  'use strict';

  const BUSINESS_PRO = {
    HUF: 15900,
    EUR: 44
  };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function formatPrice(value, currency) {
    return new Intl.NumberFormat(language() === 'hu' ? 'hu-HU' : 'en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function selectedCurrency() {
    const active = document.querySelector('[data-currency][aria-pressed="true"]');
    return active && active.dataset.currency === 'EUR' ? 'EUR' : 'HUF';
  }

  function update() {
    const currency = selectedCurrency();
    const otherCurrency = currency === 'HUF' ? 'EUR' : 'HUF';
    const mainPrice = document.getElementById('preview-main-price');
    const secondaryPrice = document.getElementById('preview-secondary-price');
    const secondaryLabel = document.getElementById('preview-secondary-label');
    const checkoutLink = document.getElementById('preview-checkout-link');
    const qrLink = document.getElementById('qr-preview-link');

    if (mainPrice) mainPrice.textContent = formatPrice(BUSINESS_PRO[currency], currency);
    if (secondaryPrice) secondaryPrice.textContent = formatPrice(BUSINESS_PRO[otherCurrency], otherCurrency);
    if (secondaryLabel) {
      secondaryLabel.textContent = language() === 'hu'
        ? (otherCurrency === 'EUR' ? 'Összeg EUR-ban' : 'Összeg HUF-ban')
        : (otherCurrency === 'EUR' ? 'Amount in EUR' : 'Amount in HUF');
    }

    const href = './checkout.html?plan=business_pro&cycle=monthly&currency=' + currency + '&lang=' + language();
    if (checkoutLink) checkoutLink.href = href;
    if (qrLink) qrLink.href = href;
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-currency], [data-language]')) {
      window.setTimeout(update, 0);
    }
  });

  const languageObserver = new MutationObserver(update);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update, { once: true });
  } else {
    update();
  }
}());
