(function () {
  'use strict';

  const PRICES = Object.freeze({
    business_lite: Object.freeze({ HUF: Object.freeze({ monthly: 7900, annual: 79000 }), EUR: Object.freeze({ monthly: 22, annual: 220 }) }),
    business_pro: Object.freeze({ HUF: Object.freeze({ monthly: 15900, annual: 159000 }), EUR: Object.freeze({ monthly: 44, annual: 440 }) }),
    technician_team: Object.freeze({ HUF: Object.freeze({ monthly: 29900, annual: 299000 }), EUR: Object.freeze({ monthly: 83, annual: 830 }) })
  });

  window.FormatXV100Pricing = PRICES;

  function announcePricingVersion() {
    document.documentElement.dataset.formatxPricing = 'v100-market-2026-07';
  }

  announcePricingVersion();
  window.addEventListener('formatx:languagechange', announcePricingVersion);
}());
