(function () {
  'use strict';

  const root = document.documentElement;
  const STORAGE_KEY = 'formatx-language';
  const PRICES = Object.freeze({
    business_lite: Object.freeze({ HUF: Object.freeze({ monthly: 7900, annual: 79000 }), EUR: Object.freeze({ monthly: 22, annual: 220 }) }),
    business_pro: Object.freeze({ HUF: Object.freeze({ monthly: 15900, annual: 159000 }), EUR: Object.freeze({ monthly: 44, annual: 440 }) }),
    technician_team: Object.freeze({ HUF: Object.freeze({ monthly: 29900, annual: 299000 }), EUR: Object.freeze({ monthly: 83, annual: 830 }) })
  });
  const PLAN_NAMES = Object.freeze({
    business_lite: 'Business Lite',
    business_pro: 'Business Pro',
    technician_team: 'Technician Team'
  });

  const TRANSLATIONS = [
    ['Banki átutalás | FormatX Suite Pro', 'Bank transfer | FormatX Suite Pro'],
    ['Ugrás a tartalomra', 'Skip to content'],
    ['FormatX Suite Pro főoldal', 'FormatX Suite Pro home'],
    ['HUF / EUR banki átutalás', 'HUF / EUR bank transfer'],
    ['Vissza a licencekhez', 'Back to licences'],
    ['Megjelenés', 'Appearance'],
    ['Sötét', 'Dark'],
    ['Világos', 'Light'],
    ['RÖGZÍTETT ÖSSZEG HUF-BAN VAGY EURÓBAN', 'FIXED AMOUNT IN HUF OR EUR'],
    ['Közvetlen banki átutalás QR-kóddal', 'Direct bank transfer with QR'],
    ['HUF-fizetésnél az RFC 8905 szabvány szerinti payto: QR-kód, EUR-fizetésnél pedig EPC SEPA átutalási QR-kód készül. A kiválasztott csomaghoz rögzített összeg és egyedi rendelési azonosító tartozik.', 'For HUF payments an RFC 8905 payto: QR is generated; for EUR payments an EPC SEPA transfer QR is generated. Every selected plan has a fixed amount and a unique order reference.'],
    ['RENDELÉS', 'ORDER'],
    ['Összegzés', 'Summary'],
    ['Csomag', 'Plan'],
    ['Időtartam', 'Duration'],
    ['Deviza', 'Currency'],
    ['Fizetendő', 'Amount due'],
    ['Technikusok száma', 'Technician seats'],
    ['Kezelhető gépek száma', 'Managed systems'],
    ['Azonosító', 'Reference'],
    ['Havi hozzáférés', 'Monthly access'],
    ['A licenc a beérkezett banki átutalás kézi ellenőrzése után aktiválódik. Az összeget és a közleményt változtatás nélkül add meg.', 'The licence is activated after manual verification of the received bank transfer. Enter the exact amount and reference without modification.'],
    ['1. LÉPÉS', 'STEP 1'],
    ['Rendelési adatok', 'Order details'],
    ['Hozzáférési idő', 'Access period'],
    ['Fizetési deviza', 'Payment currency'],
    ['Cég vagy vállalkozás neve', 'Company or business name'],
    ['Kapcsolattartó neve', 'Contact name'],
    ['E-mail-cím', 'Email address'],
    ['Számlázási cím', 'Billing address'],
    ['Adószám — opcionális', 'Tax number — optional'],
    ['Belső rendelési hivatkozás — opcionális', 'Internal purchase-order reference — optional'],
    ['1 hónap — egyszeri fizetés', '1 month — one-time payment'],
    ['1 év — egyszeri fizetés', '1 year — one-time payment'],
    ['1 év — egyszeri fizetés, 2 hónap díjmentes', '1 year — one-time payment, 2 months included'],
    ['Magyar forint (HUF)', 'Hungarian forint (HUF)'],
    ['Euró (EUR / SEPA)', 'Euro (EUR / SEPA)'],
    ['Elfogadom a ', 'I accept the '],
    ['felhasználási feltételeket', 'terms of use'],
    [' és az ', ' and the '],
    ['adatkezelési tájékoztatót', 'privacy notice'],
    ['. Tudomásul veszem, hogy ez egyszeri banki átutalás, és a licenc csak a jóváírás kézi ellenőrzése után aktiválódik.', '. I understand that this is a one-time bank transfer and the licence is activated only after manual verification of the credit.'],
    ['Bankszámla ellenőrzése…', 'Checking bank payment…'],
    ['Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR'],
    ['A fizetés átmenetileg nem elérhető', 'Payment temporarily unavailable'],
    ['A fizetés nem elérhető', 'Payment unavailable'],
    ['Mégsem', 'Cancel'],
    ['2. LÉPÉS', 'STEP 2'],
    ['Banki átutalás', 'Bank transfer'],
    ['A QR-kód a kiválasztott, rögzített összeget, az IBAN-t és a közleményt tartalmazza.', 'The QR code contains the selected fixed amount, IBAN and payment reference.'],
    ['Mindig ellenőrizd az alábbi adatokat jóváhagyás előtt.', 'Always verify the details below before approval.'],
    ['Kedvezményezett', 'Beneficiary'],
    ['HUF számlaszám', 'HUF account number'],
    ['Közvetítő bank BIC-kódja (ha szükséges)', 'Correspondent bank BIC (when required)'],
    ['Összeg', 'Amount'],
    ['Közlemény: ', 'Reference: '],
    ['Banki alkalmazás megnyitása', 'Open banking application'],
    ['SEPA átutalás megnyitása', 'Open SEPA transfer'],
    ['Átutalási adatok másolása', 'Copy transfer details'],
    ['Új rendelés', 'New order'],
    ['3. LÉPÉS', 'STEP 3'],
    ['Az átutalás bejelentése', 'Report the transfer'],
    ['A visszajelzés nem aktivál automatikusan licencet. Az adminisztrátor előbb ellenőrzi, hogy a pontos összeg és közlemény megérkezett-e a bankszámlára.', 'The report does not activate a licence automatically. An administrator first verifies that the exact amount and reference reached the bank account.'],
    ['Rendelési azonosító', 'Order reference'],
    ['Utaló neve', 'Payer name'],
    ['Vásárló e-mail-címe', 'Buyer email'],
    ['Banki tranzakció azonosítója', 'Bank transaction reference'],
    ['Megjegyzés — opcionális', 'Message — optional'],
    ['Hozzájárulok, hogy a FormatX üzemeltetője az adatokat az átutalás azonosításához és a licenc aktiválásához kezelje.', 'I consent to the FormatX operator processing these details to identify the transfer and activate the licence.'],
    ['Átutalás bejelentése', 'Report transfer'],
    ['Támogatás', 'Support'],
    ['Felhasználási feltételek', 'Terms of use'],
    ['Adatvédelem', 'Privacy'],
    ['Jogi és támogatási linkek', 'Legal and support links'],
    ['Rögzített összegű banki átutalás QR-kódja', 'Fixed-amount bank-transfer QR code'],
    ['Rendelés előkészítése…', 'Preparing order…'],
    ['Átutalási adatok elkészültek', 'Transfer details ready'],
    ['A QR-kód EPC SEPA átutalási adatot tartalmaz.', 'The QR code contains EPC SEPA transfer data.'],
    ['Jóváhagyás előtt ellenőrizd az EUR-összeget, az IBAN-t és a közleményt.', 'Before approval, verify the EUR amount, IBAN and payment reference.'],
    ['A QR-kód a fix HUF-összeget, az IBAN-t és a közleményt tartalmazza.', 'The QR code contains the fixed HUF amount, IBAN and payment reference.'],
    ['Ez nem qvik-QR. Jóváhagyás előtt mindig ellenőrizd az adatokat.', 'This is not a qvik QR. Always verify the details before approval.']
  ];

  const HU_EN = new Map(TRANSLATIONS);
  const EN_HU = new Map(TRANSLATIONS.map(([hu, en]) => [en, hu]));
  let applying = false;

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

  function language() {
    return root.lang === 'en' ? 'en' : 'hu';
  }

  function translateValue(value, target) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return value;
    const translated = target === 'en' ? (HU_EN.get(trimmed) || trimmed) : (EN_HU.get(trimmed) || trimmed);
    if (translated === trimmed) return value;
    const leading = String(value).match(/^\s*/)?.[0] || '';
    const trailing = String(value).match(/\s*$/)?.[0] || '';
    return leading + translated + trailing;
  }

  function translateTree(target) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,code,textarea')) continue;
      nodes.push(node);
    }
    nodes.forEach(node => {
      const next = translateValue(node.nodeValue, target);
      if (next !== node.nodeValue) node.nodeValue = next;
    });

    document.querySelectorAll('[aria-label],[alt],[title],[placeholder]').forEach(element => {
      ['aria-label', 'alt', 'title', 'placeholder'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const next = translateValue(current, target);
        if (next !== current) element.setAttribute(attribute, next);
      });
    });
  }

  function formatMoney(value, currency, target) {
    return new Intl.NumberFormat(target === 'en' ? 'en-GB' : 'hu-HU', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
  }

  function renderPricing(target) {
    const plan = document.getElementById('plan-id');
    const cycle = document.getElementById('billing-cycle');
    const currency = document.getElementById('payment-currency');
    const selectedCurrency = currency?.value === 'EUR' ? 'EUR' : 'HUF';
    const selectedCycle = cycle?.value === 'annual' ? 'annual' : 'monthly';

    Array.from(plan?.options || []).forEach(option => {
      const price = PRICES[option.value]?.[selectedCurrency]?.monthly;
      if (!Number.isFinite(price)) return;
      option.textContent = PLAN_NAMES[option.value] + ' — ' + formatMoney(price, selectedCurrency, target)
        + (target === 'en' ? '/month' : '/hó');
    });
    if (cycle?.options[0]) cycle.options[0].textContent = target === 'en' ? '1 month — one-time payment' : '1 hónap — egyszeri fizetés';
    if (cycle?.options[1]) cycle.options[1].textContent = target === 'en' ? '1 year — one-time payment' : '1 év — egyszeri fizetés';
    if (currency?.options[0]) currency.options[0].textContent = target === 'en' ? 'Hungarian forint (HUF)' : 'Magyar forint (HUF)';
    if (currency?.options[1]) currency.options[1].textContent = target === 'en' ? 'Euro (EUR / SEPA)' : 'Euró (EUR / SEPA)';

    const summaryCycle = document.getElementById('summary-cycle');
    if (summaryCycle) summaryCycle.textContent = selectedCycle === 'annual'
      ? (target === 'en' ? '1 year — one-time payment, 2 months included' : '1 év — egyszeri fizetés, 2 hónap díjmentes')
      : (target === 'en' ? '1 month — one-time payment' : '1 hónap — egyszeri fizetés');
  }

  function updateLinks(target) {
    document.querySelectorAll('a[href]').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        url.searchParams.set('lang', target);
        anchor.href = url.pathname + url.search + url.hash;
      } catch (_) {}
    });
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
      if (button) applyLanguage(button.dataset.checkoutLanguage, true, true);
    });
  }

  function applyLanguage(next, persist, notify) {
    if (applying) return;
    applying = true;
    const target = next === 'en' ? 'en' : 'hu';
    if (root.lang !== target) root.lang = target;
    root.dataset.fxCheckoutLanguage = 'authoritative-v3';
    root.dataset.formatxPricing = 'v100-market-2026-07';
    document.title = target === 'en' ? 'Bank transfer | FormatX Suite Pro' : 'Banki átutalás | FormatX Suite Pro';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = target === 'en'
      ? 'FormatX Suite Pro licence purchase by fixed-amount HUF or EUR bank transfer and QR.'
      : 'FormatX Suite Pro licencvásárlás rögzített összegű, forint- vagy euróalapú banki átutalással és QR-kóddal.';

    translateTree(target);
    renderPricing(target);
    updateLinks(target);
    document.querySelector('.theme-control:not(.checkout-language-control)')?.setAttribute('aria-label', target === 'en' ? 'Appearance' : 'Megjelenés');
    document.querySelector('.checkout-language-control')?.setAttribute('aria-label', target === 'en' ? 'Language' : 'Nyelv');
    document.querySelectorAll('[data-checkout-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.checkoutLanguage === target));
    });

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, target); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('lang', target);
      history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    applying = false;
    if (notify) dispatchEvent(new CustomEvent('formatx:languagechange', {
      detail: { language: target, source: 'checkout-authoritative-v3' }
    }));
  }

  installSwitch();
  applyLanguage(initialLanguage(), false, false);

  const observer = new MutationObserver(() => {
    if (!applying) queueMicrotask(() => applyLanguage(language(), false, false));
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  addEventListener('formatx:languagechange', event => {
    if (event.detail?.source === 'checkout-authoritative-v3') return;
    queueMicrotask(() => applyLanguage(language(), false, false));
  });
  addEventListener('pageshow', () => applyLanguage(language(), false, false));
}());