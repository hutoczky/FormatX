(function () {
  'use strict';

  const root = document.documentElement;
  const STORAGE_KEY = 'formatx-language';
  const PRICES = Object.freeze({
    business_lite: Object.freeze({ HUF: Object.freeze({ monthly: 7900, annual: 79000 }), EUR: Object.freeze({ monthly: 22, annual: 220 }) }),
    business_pro: Object.freeze({ HUF: Object.freeze({ monthly: 15900, annual: 159000 }), EUR: Object.freeze({ monthly: 44, annual: 440 }) }),
    technician_team: Object.freeze({ HUF: Object.freeze({ monthly: 29900, annual: 299000 }), EUR: Object.freeze({ monthly: 83, annual: 830 }) })
  });

  const PLAN_NAMES = {
    business_lite: 'Business Lite',
    business_pro: 'Business Pro',
    technician_team: 'Technician Team'
  };

  const STATIC = [
    ['.skip-link', 'Ugrás a tartalomra', 'Skip to content'],
    ['.brand small', 'HUF / EUR banki átutalás', 'HUF / EUR bank transfer'],
    ['.legal-home-link', 'Vissza a licencekhez', 'Back to licences'],
    ['[data-theme-choice="dark"]', 'Sötét', 'Dark'],
    ['[data-theme-choice="light"]', 'Világos', 'Light'],
    ['.checkout-hero .eyebrow', 'RÖGZÍTETT ÖSSZEG HUF-BAN VAGY EURÓBAN', 'FIXED AMOUNT IN HUF OR EUR'],
    ['.checkout-hero h1', 'Közvetlen banki átutalás QR-kóddal', 'Direct bank transfer with QR'],
    ['.checkout-hero > p:last-child', 'HUF-fizetésnél az RFC 8905 szabvány szerinti payto: QR-kód, EUR-fizetésnél pedig EPC SEPA átutalási QR-kód készül. A kiválasztott csomaghoz rögzített összeg és egyedi rendelési azonosító tartozik.', 'For HUF payments an RFC 8905 payto: QR is generated; for EUR payments an EPC SEPA transfer QR is generated. Every selected plan has a fixed amount and a unique order reference.'],
    ['.checkout-summary .eyebrow', 'RENDELÉS', 'ORDER'],
    ['#checkout-title', 'Összegzés', 'Summary'],
    ['.checkout-summary dt:nth-of-type(1)', 'Csomag', 'Plan'],
    ['.checkout-summary dl > div:nth-child(1) dt', 'Csomag', 'Plan'],
    ['.checkout-summary dl > div:nth-child(2) dt', 'Időtartam', 'Duration'],
    ['.checkout-summary dl > div:nth-child(3) dt', 'Deviza', 'Currency'],
    ['.checkout-summary dl > div:nth-child(4) dt', 'Fizetendő', 'Amount due'],
    ['.checkout-summary dl > div:nth-child(5) dt', 'Technikusok száma', 'Technician seats'],
    ['.checkout-summary dl > div:nth-child(6) dt', 'Kezelhető gépek száma', 'Managed systems'],
    ['.checkout-summary dl > div:nth-child(7) dt', 'Azonosító', 'Reference'],
    ['.checkout-note', 'A licenc a beérkezett banki átutalás kézi ellenőrzése után aktiválódik. Az összeget és a közleményt változtatás nélkül add meg.', 'The licence is activated after manual verification of the received bank transfer. Enter the exact amount and reference without modification.'],
    ['#checkout-form .form-heading .eyebrow', '1. LÉPÉS', 'STEP 1'],
    ['#checkout-form .form-heading h2', 'Rendelési adatok', 'Order details'],
    ['label[for="plan-id"] span', 'Csomag', 'Plan'],
    ['label[for="billing-cycle"] span', 'Hozzáférési idő', 'Access period'],
    ['label[for="payment-currency"] span', 'Fizetési deviza', 'Payment currency'],
    ['label[for="company-name"] span', 'Cég vagy vállalkozás neve', 'Company or business name'],
    ['label[for="contact-name"] span', 'Kapcsolattartó neve', 'Contact name'],
    ['label[for="contact-email"] span', 'E-mail-cím', 'Email address'],
    ['label[for="billing-address"] span', 'Számlázási cím', 'Billing address'],
    ['label[for="tax-number"] span', 'Adószám — opcionális', 'Tax number — optional'],
    ['label[for="purchase-order"] span', 'Belső rendelési hivatkozás — opcionális', 'Internal purchase-order reference — optional'],
    ['#checkout-form .form-grid label:nth-child(1) > span', 'Csomag', 'Plan'],
    ['#checkout-form .form-grid label:nth-child(2) > span', 'Hozzáférési idő', 'Access period'],
    ['#checkout-form .form-grid label:nth-child(3) > span', 'Fizetési deviza', 'Payment currency'],
    ['#checkout-form .form-grid label:nth-child(4) > span', 'Cég vagy vállalkozás neve', 'Company or business name'],
    ['#checkout-form .form-grid label:nth-child(5) > span', 'Kapcsolattartó neve', 'Contact name'],
    ['#checkout-form .form-grid label:nth-child(6) > span', 'E-mail-cím', 'Email address'],
    ['#checkout-form .form-grid label:nth-child(7) > span', 'Számlázási cím', 'Billing address'],
    ['#checkout-form .form-grid label:nth-child(8) > span', 'Adószám — opcionális', 'Tax number — optional'],
    ['#checkout-form .form-grid label:nth-child(9) > span', 'Belső rendelési hivatkozás — opcionális', 'Internal purchase-order reference — optional'],
    ['#checkout-form .consent-row span', 'Elfogadom a felhasználási feltételeket és az adatkezelési tájékoztatót. Tudomásul veszem, hogy ez egyszeri banki átutalás, és a licenc csak a jóváírás kézi ellenőrzése után aktiválódik.', 'I accept the terms of use and the privacy notice. I understand that this is a one-time bank transfer and that the licence is activated only after manual verification of the credit.'],
    ['#checkout-form .button.secondary', 'Mégsem', 'Cancel'],
    ['#payment-panel .form-heading .eyebrow', '2. LÉPÉS', 'STEP 2'],
    ['#payment-panel-title', 'Banki átutalás', 'Bank transfer'],
    ['#payment-warning', 'Mindig ellenőrizd az alábbi adatokat jóváhagyás előtt.', 'Always verify the details below before approval.'],
    ['.bank-details > div:nth-child(1) dt', 'Kedvezményezett', 'Beneficiary'],
    ['#payment-local-account-row dt', 'HUF számlaszám', 'HUF account number'],
    ['.bank-details > div:nth-child(3) dt', 'IBAN', 'IBAN'],
    ['.bank-details > div:nth-child(4) dt', 'BIC / SWIFT', 'BIC / SWIFT'],
    ['.bank-details > div:nth-child(5) dt', 'Közvetítő bank BIC-kódja (ha szükséges)', 'Correspondent bank BIC (when required)'],
    ['.bank-details > div:nth-child(6) dt', 'Összeg', 'Amount'],
    ['#payment-copy', 'Átutalási adatok másolása', 'Copy transfer details'],
    ['#payment-reset', 'Új rendelés', 'New order'],
    ['#confirmation-form .form-heading .eyebrow', '3. LÉPÉS', 'STEP 3'],
    ['#confirmation-form .form-heading h2', 'Az átutalás bejelentése', 'Report the transfer'],
    ['#confirmation-form > p:not(.form-feedback)', 'A visszajelzés nem aktivál automatikusan licencet. Az adminisztrátor előbb ellenőrzi, hogy a pontos összeg és közlemény megérkezett-e a bankszámlára.', 'The report does not activate a licence automatically. An administrator first verifies that the exact amount and reference have reached the bank account.'],
    ['#confirmation-form .form-grid label:nth-child(1) > span', 'Rendelési azonosító', 'Order reference'],
    ['#confirmation-form .form-grid label:nth-child(2) > span', 'Utaló neve', 'Payer name'],
    ['#confirmation-form .form-grid label:nth-child(3) > span', 'Vásárló e-mail-címe', 'Buyer email'],
    ['#confirmation-form .form-grid label:nth-child(4) > span', 'Banki tranzakció azonosítója', 'Bank transaction reference'],
    ['#confirmation-form .form-grid label:nth-child(5) > span', 'Megjegyzés — opcionális', 'Message — optional'],
    ['#confirmation-form .consent-row span', 'Hozzájárulok, hogy a FormatX üzemeltetője az adatokat az átutalás azonosításához és a licenc aktiválásához kezelje.', 'I consent to the FormatX operator processing these details to identify the transfer and activate the licence.'],
    ['#confirmation-submit', 'Átutalás bejelentése', 'Report transfer'],
    ['.site-footer nav a:nth-child(1)', 'Támogatás', 'Support'],
    ['.site-footer nav a:nth-child(2)', 'Felhasználási feltételek', 'Terms of use'],
    ['.site-footer nav a:nth-child(3)', 'Adatvédelem', 'Privacy']
  ];

  const FEEDBACK = new Map([
    ['Bankszámla ellenőrzése…', 'Checking bank payment…'],
    ['Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR'],
    ['A fizetés átmenetileg nem elérhető', 'Payment temporarily unavailable'],
    ['A fizetés nem elérhető', 'Payment unavailable'],
    ['Rendelés előkészítése…', 'Preparing order…'],
    ['Átutalási adatok elkészültek', 'Transfer details ready'],
    ['Banki alkalmazás megnyitása', 'Open banking application'],
    ['SEPA átutalás megnyitása', 'Open SEPA transfer'],
    ['Közlemény: ', 'Reference: ']
  ]);

  window.FormatXV100Pricing = PRICES;

  function initialLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'hu' || query === 'en') return query;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'hu' || stored === 'en') return stored;
    } catch (_) {}
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function currentLanguage() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function money(value, currency) {
    return new Intl.NumberFormat(currentLanguage() === 'en' ? 'en-GB' : 'hu-HU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function installSwitch() {
    if (document.querySelector('[data-checkout-language-control]')) return;
    const theme = document.querySelector('.theme-control');
    if (!theme) return;
    const control = document.createElement('div');
    control.className = 'theme-control checkout-language-control';
    control.dataset.checkoutLanguageControl = 'true';
    control.setAttribute('role', 'group');
    control.setAttribute('aria-label', 'Nyelv / Language');
    control.innerHTML = '<button type="button" data-checkout-language="hu">HU</button><button type="button" data-checkout-language="en">EN</button>';
    theme.insertAdjacentElement('beforebegin', control);
    control.addEventListener('click', event => {
      const button = event.target instanceof Element ? event.target.closest('[data-checkout-language]') : null;
      if (!button) return;
      applyLanguage(button.dataset.checkoutLanguage, true, true);
    });
  }

  function setStaticText(language) {
    STATIC.forEach(([selector, hu, en]) => {
      document.querySelectorAll(selector).forEach(element => {
        element.textContent = language === 'en' ? en : hu;
      });
    });
  }

  function renderConsentLinks(language) {
    const container = document.querySelector('#checkout-form .consent-row span');
    if (!container) return;
    const terms = './terms.html?lang=' + language;
    const privacy = './privacy.html?lang=' + language;
    container.innerHTML = language === 'en'
      ? 'I accept the <a href="' + terms + '" target="_blank" rel="noopener">terms of use</a> and the <a href="' + privacy + '" target="_blank" rel="noopener">privacy notice</a>. I understand that this is a one-time bank transfer and that the licence is activated only after manual verification of the credit.'
      : 'Elfogadom a <a href="' + terms + '" target="_blank" rel="noopener">felhasználási feltételeket</a> és az <a href="' + privacy + '" target="_blank" rel="noopener">adatkezelési tájékoztatót</a>. Tudomásul veszem, hogy ez egyszeri banki átutalás, és a licenc csak a jóváírás kézi ellenőrzése után aktiválódik.';
  }

  function renderDynamic(language) {
    const planSelect = document.getElementById('plan-id');
    const cycleSelect = document.getElementById('billing-cycle');
    const currencySelect = document.getElementById('payment-currency');
    const planId = PLAN_NAMES[planSelect?.value] ? planSelect.value : 'business_pro';
    const cycle = cycleSelect?.value === 'annual' ? 'annual' : 'monthly';
    const currency = currencySelect?.value === 'EUR' ? 'EUR' : 'HUF';

    if (cycleSelect?.options[0]) cycleSelect.options[0].textContent = language === 'en' ? '1 month — one-time payment' : '1 hónap — egyszeri fizetés';
    if (cycleSelect?.options[1]) cycleSelect.options[1].textContent = language === 'en' ? '1 year — one-time payment' : '1 év — egyszeri fizetés';
    if (currencySelect?.options[0]) currencySelect.options[0].textContent = language === 'en' ? 'Hungarian forint (HUF)' : 'Magyar forint (HUF)';
    if (currencySelect?.options[1]) currencySelect.options[1].textContent = language === 'en' ? 'Euro (EUR / SEPA)' : 'Euró (EUR / SEPA)';

    Array.from(planSelect?.options || []).forEach(option => {
      const prices = PRICES[option.value];
      if (!prices) return;
      option.textContent = PLAN_NAMES[option.value] + ' — ' + money(prices[currency].monthly, currency)
        + (language === 'en' ? '/month' : '/hó');
    });

    const summaryCycle = document.getElementById('summary-cycle');
    if (summaryCycle) summaryCycle.textContent = cycle === 'annual'
      ? (language === 'en' ? '1 year — one-time payment, 2 months included' : '1 év — egyszeri fizetés, 2 hónap díjmentes')
      : (language === 'en' ? '1 month — one-time payment' : '1 hónap — egyszeri fizetés');

    const submit = document.getElementById('checkout-submit');
    if (submit) {
      const current = submit.textContent.trim();
      if (language === 'en' && FEEDBACK.has(current)) submit.textContent = FEEDBACK.get(current);
      if (language === 'hu') {
        for (const [hu, en] of FEEDBACK) if (current === en) submit.textContent = hu;
      }
    }

    const paymentPanel = document.getElementById('payment-panel');
    if (paymentPanel && !paymentPanel.hidden) {
      const qrDescription = document.getElementById('payment-qr-description');
      const warning = document.getElementById('payment-warning');
      const open = document.getElementById('payment-open');
      if (currency === 'EUR') {
        if (qrDescription) qrDescription.textContent = language === 'en' ? 'The QR code contains EPC SEPA transfer data.' : 'A QR-kód EPC SEPA átutalási adatot tartalmaz.';
        if (warning) warning.textContent = language === 'en' ? 'Before approval, verify the EUR amount, IBAN and payment reference.' : 'Jóváhagyás előtt ellenőrizd az EUR-összeget, az IBAN-t és a közleményt.';
        if (open) open.textContent = language === 'en' ? 'Open SEPA transfer' : 'SEPA átutalás megnyitása';
      } else {
        if (qrDescription) qrDescription.textContent = language === 'en' ? 'The QR code contains the fixed HUF amount, IBAN and payment reference.' : 'A QR-kód a fix HUF-összeget, az IBAN-t és a közleményt tartalmazza.';
        if (warning) warning.textContent = language === 'en' ? 'This is not a qvik QR. Always verify the details before approval.' : 'Ez nem qvik-QR. Jóváhagyás előtt mindig ellenőrizd az adatokat.';
        if (open) open.textContent = language === 'en' ? 'Open banking application' : 'Banki alkalmazás megnyitása';
      }
      const reference = document.getElementById('payment-reference');
      if (reference) reference.textContent = (language === 'en' ? 'Reference: ' : 'Közlemény: ') + String(reference.textContent).replace(/^(Reference:|Közlemény:)\s*/, '');
    }

    const feedback = document.getElementById('checkout-feedback');
    if (feedback) {
      const current = feedback.textContent.trim();
      if (language === 'en' && FEEDBACK.has(current)) feedback.textContent = FEEDBACK.get(current);
      if (language === 'hu') {
        for (const [hu, en] of FEEDBACK) if (current === en) feedback.textContent = hu;
      }
    }

    root.dataset.fxCheckoutPlan = planId;
  }

  function updateAttributes(language) {
    document.querySelector('.brand')?.setAttribute('aria-label', language === 'en' ? 'FormatX Suite Pro home' : 'FormatX Suite Pro főoldal');
    document.querySelector('.theme-control')?.setAttribute('aria-label', language === 'en' ? 'Appearance' : 'Megjelenés');
    document.querySelector('.site-footer nav')?.setAttribute('aria-label', language === 'en' ? 'Legal and support links' : 'Jogi és támogatási linkek');
    document.getElementById('payment-qr')?.setAttribute('alt', language === 'en' ? 'Fixed-amount bank-transfer QR code' : 'Rögzített összegű banki átutalás QR-kódja');
  }

  function updateLinks(language) {
    document.querySelectorAll('a[href]').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        url.searchParams.set('lang', language);
        anchor.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
  }

  let applying = false;
  function applyLanguage(next, persist, notify) {
    if (applying) return;
    applying = true;
    const language = next === 'en' ? 'en' : 'hu';
    root.lang = language;
    root.dataset.fxCheckoutLanguage = 'authoritative-v2';
    root.dataset.formatxPricing = 'v100-market-2026-07';
    document.title = language === 'en' ? 'Bank transfer | FormatX Suite Pro' : 'Banki átutalás | FormatX Suite Pro';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === 'en'
      ? 'FormatX Suite Pro licence purchase by fixed-amount HUF or EUR bank transfer and QR.'
      : 'FormatX Suite Pro licencvásárlás rögzített összegű, forint- vagy euróalapú banki átutalással és QR-kóddal.';

    setStaticText(language);
    renderConsentLinks(language);
    renderDynamic(language);
    updateAttributes(language);
    updateLinks(language);
    document.querySelectorAll('[data-checkout-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.checkoutLanguage === language));
    });

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, language); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    applying = false;
    if (notify) dispatchEvent(new CustomEvent('formatx:languagechange', { detail: { language, source: 'checkout-authoritative-v2' } }));
  }

  installSwitch();
  applyLanguage(initialLanguage(), false, false);

  addEventListener('formatx:languagechange', event => {
    if (event.detail?.source === 'checkout-authoritative-v2') return;
    queueMicrotask(() => applyLanguage(currentLanguage(), false, false));
  });
  addEventListener('pageshow', () => applyLanguage(currentLanguage(), false, false));
  const observer = new MutationObserver(entries => {
    if (entries.some(entry => entry.attributeName === 'lang')) queueMicrotask(() => applyLanguage(currentLanguage(), false, false));
  });
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });
}());