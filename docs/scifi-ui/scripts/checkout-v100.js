(function () {
  'use strict';

  const PLANS = {
    business_lite: {
      name: 'Business Lite',
      prices: { HUF: { monthly: 7900, annual: 79000 }, EUR: { monthly: 22, annual: 220 } },
      technicians: 1,
      devices: 10
    },
    business_pro: {
      name: 'Business Pro',
      prices: { HUF: { monthly: 15900, annual: 159000 }, EUR: { monthly: 44, annual: 440 } },
      technicians: 3,
      devices: 50
    },
    technician_team: {
      name: 'Technician Team',
      prices: { HUF: { monthly: 29900, annual: 299000 }, EUR: { monthly: 83, annual: 830 } },
      technicians: 5,
      devices: 150
    }
  };

  const STATIC_ACCOUNT = {
    holder: 'Hutóczky József',
    local_huf_account: '30200014-19913410-90015751',
    iban: 'HU06302000141991341090015751',
    eur_iban: 'HU06302000141991341090015751',
    bic: 'REVOHUHB',
    correspondent_bic: 'CHASDEFX'
  };
  const SUPPORT_EMAIL = 'hutoczky@gmail.com';

  const apiMeta = document.querySelector('meta[name="formatx-billing-api-base"]');
  const apiBase = String(apiMeta ? apiMeta.content : '').trim().replace(/\/+$/, '');
  const form = document.getElementById('checkout-form');
  const planSelect = document.getElementById('plan-id');
  const cycleSelect = document.getElementById('billing-cycle');
  const currencySelect = document.getElementById('payment-currency');
  const submitButton = document.getElementById('checkout-submit');
  const feedback = document.getElementById('checkout-feedback');
  const paymentPanel = document.getElementById('payment-panel');
  const paymentQr = document.getElementById('payment-qr');
  const paymentOpen = document.getElementById('payment-open');
  const paymentCopy = document.getElementById('payment-copy');
  const paymentReset = document.getElementById('payment-reset');
  const paymentReference = document.getElementById('payment-reference');
  const paymentHolder = document.getElementById('payment-holder');
  const paymentLocalAccountRow = document.getElementById('payment-local-account-row');
  const paymentLocalAccount = document.getElementById('payment-local-account');
  const paymentIban = document.getElementById('payment-iban');
  const paymentBic = document.getElementById('payment-bic');
  const paymentCorrespondentBic = document.getElementById('payment-correspondent-bic');
  const paymentAmount = document.getElementById('payment-amount');
  const paymentQrDescription = document.getElementById('payment-qr-description');
  const paymentWarning = document.getElementById('payment-warning');
  const confirmationForm = document.getElementById('confirmation-form');
  const confirmationFeedback = document.getElementById('confirmation-feedback');
  const summaryPlan = document.getElementById('summary-plan');
  const summaryCycle = document.getElementById('summary-cycle');
  const summaryCurrency = document.getElementById('summary-currency');
  const summaryPrice = document.getElementById('summary-price');
  const summaryTeam = document.getElementById('summary-team');
  const summaryDevices = document.getElementById('summary-devices');
  const summaryReference = document.getElementById('summary-reference');

  if (!form || !planSelect || !cycleSelect || !currencySelect || !submitButton || !feedback) return;

  let backendMode = 'checking';
  let liveReady = false;
  let paymentData = null;
  let orderReference = createOrderReference();

  applyQuerySelection();
  updateOptionLabels();
  updateSummary();
  verifyBackend();

  function lang() {
    return document.documentElement.lang === 'en' ? 'en' : 'hu';
  }

  function t(hu, en) {
    return lang() === 'en' ? en : hu;
  }

  function apiUrl(path) {
    if (!apiBase) throw new Error(t('A fizetési API címe nincs beállítva.', 'The payment API address is not configured.'));
    const clean = path.startsWith('/') ? path : '/' + path;
    return apiBase.endsWith('/api') ? apiBase + clean : apiBase + '/api' + clean;
  }

  function isProductionHost() {
    return location.hostname === 'formatxsuite.com' || location.hostname === 'www.formatxsuite.com';
  }

  function createOrderReference() {
    const date = new Date();
    const ymd = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('');
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    const random = Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('').toUpperCase();
    return 'FX-' + ymd + '-' + random;
  }

  function applyQuerySelection() {
    const query = new URLSearchParams(location.search);
    const plan = query.get('plan');
    const cycle = query.get('cycle');
    const currency = String(query.get('currency') || '').toUpperCase();
    if (PLANS[plan]) planSelect.value = plan;
    if (cycle === 'monthly' || cycle === 'annual') cycleSelect.value = cycle;
    if (currency === 'HUF' || currency === 'EUR') currencySelect.value = currency;
  }

  function selectedPlanId() {
    return PLANS[planSelect.value] ? planSelect.value : 'business_pro';
  }

  function selectedPlan() {
    return PLANS[selectedPlanId()];
  }

  function selectedCycle() {
    return cycleSelect.value === 'annual' ? 'annual' : 'monthly';
  }

  function selectedCurrency() {
    return currencySelect.value === 'EUR' ? 'EUR' : 'HUF';
  }

  function selectedAmount() {
    return selectedPlan().prices[selectedCurrency()][selectedCycle()];
  }

  function formatPrice(value, currency) {
    return new Intl.NumberFormat(lang() === 'en' ? 'en-GB' : 'hu-HU', {
      style: 'currency',
      currency: currency || selectedCurrency(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function setFeedback(element, message, state) {
    if (!element) return;
    element.textContent = message;
    element.dataset.state = state || '';
  }

  function updateOptionLabels() {
    Array.from(planSelect.options).forEach(function (option) {
      const plan = PLANS[option.value];
      if (!plan) return;
      option.textContent = plan.name + ' — ' + formatPrice(plan.prices[selectedCurrency()].monthly, selectedCurrency()) + t('/hó', '/month');
    });
  }

  function updateSummary() {
    const plan = selectedPlan();
    const cycle = selectedCycle();
    const currency = selectedCurrency();
    if (summaryPlan) summaryPlan.textContent = plan.name;
    if (summaryCycle) {
      summaryCycle.textContent = cycle === 'annual'
        ? t('1 év — egyszeri fizetés, 2 hónap díjmentes', '1 year — one-time payment, 2 months included')
        : t('1 hónap — egyszeri fizetés', '1 month — one-time payment');
    }
    if (summaryCurrency) summaryCurrency.textContent = currency;
    if (summaryPrice) summaryPrice.textContent = formatPrice(selectedAmount(), currency);
    if (summaryTeam) summaryTeam.textContent = String(plan.technicians);
    if (summaryDevices) summaryDevices.textContent = String(plan.devices);
    if (summaryReference) summaryReference.textContent = orderReference;
    const orderInput = document.getElementById('confirmation-order-reference');
    if (orderInput) orderInput.value = orderReference;
  }

  function enableStaticMode(reason) {
    if (isProductionHost()) {
      backendMode = 'unavailable';
      liveReady = false;
      submitButton.disabled = true;
      submitButton.textContent = t('A fizetés átmenetileg nem elérhető', 'Payment temporarily unavailable');
      setFeedback(
        feedback,
        t(
          'A szerveres rendeléskövetés nem érhető el, ezért biztonsági okból az éles oldalon nem indítható fizetés. ' + (reason || ''),
          'Server-side order tracking is unavailable, so payment is disabled on the production site for safety. ' + (reason || '')
        ),
        'error'
      );
      return;
    }

    backendMode = 'static';
    liveReady = true;
    submitButton.disabled = false;
    submitButton.textContent = t('Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR');
    setFeedback(
      feedback,
      t(
        'Fejlesztői statikus mód aktív. A fizetés és a licencellenőrzés kézi. ' + (reason || ''),
        'Developer static mode is active. Payment and licence verification are manual. ' + (reason || '')
      ),
      'success'
    );
  }

  async function verifyBackend() {
    liveReady = false;
    submitButton.disabled = true;
    submitButton.textContent = t('Bankszámla ellenőrzése…', 'Checking bank payment…');

    try {
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller ? window.setTimeout(function () { controller.abort(); }, 5000) : null;
      const response = await fetch(apiUrl('/health'), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller ? controller.signal : undefined
      });
      if (timer !== null) window.clearTimeout(timer);
      const result = await response.json().catch(function () { return {}; });
      const currencies = Array.isArray(result.supported_currencies) ? result.supported_currencies : [];
      if (!response.ok
        || result.provider !== 'bank_transfer'
        || result.mode !== 'live'
        || result.live_ready !== true
        || result.sales_ready === false
        || !currencies.includes('HUF')
        || !currencies.includes('EUR')) {
        throw new Error(t('A fizetési backend nincs teljesen konfigurálva.', 'The payment backend is not fully configured.'));
      }

      backendMode = 'api';
      liveReady = true;
      submitButton.disabled = false;
      submitButton.textContent = t('Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR');
      setFeedback(
        feedback,
        t(
          'A szerveroldali rendeléskövetés és a HUF/EUR QR-fizetés aktív.',
          'Server-side order tracking and HUF/EUR QR payment are active.'
        ),
        'success'
      );
    } catch (error) {
      enableStaticMode(error instanceof Error ? error.message : '');
    }
  }

  function checkoutPayload() {
    const data = new FormData(form);
    const currency = selectedCurrency();
    return {
      plan_id: selectedPlanId(),
      billing_cycle: selectedCycle(),
      currency: currency,
      company_name: String(data.get('company_name') || '').trim(),
      contact_name: String(data.get('contact_name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      billing_address: String(data.get('billing_address') || '').trim(),
      tax_number: String(data.get('tax_number') || '').trim(),
      purchase_order: String(data.get('purchase_order') || '').trim(),
      order_reference: orderReference,
      payment_method: currency === 'EUR' ? 'sepa_credit_transfer_qr' : 'direct_bank_transfer_qr'
    };
  }

  function buildPaytoUri(account, amount, currency, reference) {
    const params = new URLSearchParams();
    params.set('amount', currency + ':' + amount);
    params.set('receiver-name', account.holder);
    params.set('message', 'FormatX ' + reference);
    params.set('instruction', reference);
    const iban = currency === 'EUR' ? account.eur_iban : account.iban;
    return 'payto://iban/' + account.bic + '/' + iban + '?' + params.toString();
  }

  function buildEpcQrPayload(account, amount, reference) {
    return ['BCD', '001', '1', 'SCT', account.bic, account.holder, account.eur_iban,
      'EUR' + Number(amount).toFixed(2), '', '', 'FormatX ' + reference].join('\n');
  }

  function createStaticCheckout() {
    const currency = selectedCurrency();
    const amount = selectedAmount();
    const paymentUri = buildPaytoUri(STATIC_ACCOUNT, amount, currency, orderReference);
    return {
      session_id: orderReference,
      order_reference: orderReference,
      payment_provider: 'bank_transfer',
      payment_mode: 'live',
      pricing_version: 'v100-market-2026-07',
      amount: amount,
      currency: currency,
      account: STATIC_ACCOUNT,
      qr_payload: currency === 'EUR' ? buildEpcQrPayload(STATIC_ACCOUNT, amount, orderReference) : paymentUri,
      payment_uri: paymentUri,
      qvik: false,
      sepa: currency === 'EUR',
      qr_format: currency === 'EUR' ? 'epc069-12-v3.1' : 'payto-rfc8905',
      manual_verification_required: true,
      order_tracking_ready: false,
      automatic_renewal: false
    };
  }

  async function createCheckout() {
    if (backendMode === 'static') return createStaticCheckout();
    if (backendMode !== 'api') throw new Error(t('A fizetés nem érhető el.', 'Payment is unavailable.'));

    const response = await fetch(apiUrl('/create-checkout-session'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload())
    });
    const result = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(result.message || result.error || 'HTTP ' + response.status);

    const amount = Number(result.amount ?? result.amount_huf);
    if (result.payment_provider !== 'bank_transfer'
      || result.payment_mode !== 'live'
      || result.order_reference !== orderReference
      || result.pricing_version !== 'v100-market-2026-07'
      || amount !== selectedAmount()
      || result.currency !== selectedCurrency()
      || !result.qr_payload
      || !result.payment_uri
      || !result.account) {
      throw new Error(t('A szerver hibás vagy eltérő fizetési adatot adott vissza.', 'The server returned invalid or mismatched payment data.'));
    }
    result.amount = amount;
    return result;
  }

  function buildCopyText(result) {
    const lines = [t('Kedvezményezett: ', 'Beneficiary: ') + result.account.holder];
    if (result.currency === 'HUF') {
      lines.push(t('Belföldi HUF számlaszám: ', 'Domestic HUF account: ') + result.account.local_huf_account);
    }
    lines.push(
      'IBAN: ' + (result.currency === 'EUR' ? result.account.eur_iban : result.account.iban),
      'BIC / SWIFT: ' + result.account.bic,
      t('Levelező bank BIC: ', 'Correspondent bank BIC: ') + result.account.correspondent_bic,
      t('Összeg: ', 'Amount: ') + formatPrice(result.amount, result.currency),
      t('Közlemény: ', 'Reference: ') + result.order_reference
    );
    return lines.join('\n');
  }

  function showPayment(result) {
    paymentData = result;
    paymentOpen.href = result.payment_uri;
    paymentReference.textContent = t('Közlemény: ', 'Reference: ') + orderReference;
    paymentHolder.textContent = result.account.holder;
    paymentLocalAccount.textContent = result.account.local_huf_account;
    paymentLocalAccountRow.hidden = result.currency !== 'HUF';
    paymentIban.textContent = result.currency === 'EUR' ? result.account.eur_iban : result.account.iban;
    paymentBic.textContent = result.account.bic;
    paymentCorrespondentBic.textContent = result.account.correspondent_bic;
    paymentAmount.textContent = formatPrice(result.amount, result.currency);
    paymentQr.src = 'https://quickchart.io/qr?text=' + encodeURIComponent(result.qr_payload)
      + '&size=260&margin=3&ecLevel=M&format=png';

    if (result.currency === 'EUR') {
      paymentQrDescription.textContent = t(
        'A QR-kód EPC SEPA átutalási adatot tartalmaz.',
        'The QR code contains EPC SEPA transfer data.'
      );
      paymentWarning.textContent = t(
        'Jóváhagyás előtt ellenőrizd az EUR-összeget, az IBAN-t és a közleményt.',
        'Before approval, verify the EUR amount, IBAN and payment reference.'
      );
      paymentOpen.textContent = t('SEPA átutalás megnyitása', 'Open SEPA transfer');
    } else {
      paymentQrDescription.textContent = t(
        'A QR-kód a fix HUF-összeget, az IBAN-t és a közleményt tartalmazza.',
        'The QR code contains the fixed HUF amount, IBAN and payment reference.'
      );
      paymentWarning.textContent = t(
        'Ez nem qvik-QR. Jóváhagyás előtt mindig ellenőrizd az adatokat.',
        'This is not a qvik QR. Always verify the details before approval.'
      );
      paymentOpen.textContent = t('Banki alkalmazás megnyitása', 'Open banking application');
    }

    paymentPanel.hidden = false;
    confirmationForm.hidden = false;
    const payer = document.getElementById('confirmation-payer-name');
    const email = document.getElementById('confirmation-email');
    const contactName = document.getElementById('contact-name');
    const contactEmail = document.getElementById('contact-email');
    if (payer && contactName) payer.value = contactName.value.trim();
    if (email && contactEmail) email.value = contactEmail.value.trim();
    paymentPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function copyPaymentData() {
    if (!paymentData) return;
    try {
      await navigator.clipboard.writeText(buildCopyText(paymentData));
      setFeedback(feedback, t('Az átutalási adatok a vágólapra kerültek.', 'Transfer details copied to the clipboard.'), 'success');
    } catch (_) {
      setFeedback(feedback, t('A másolás nem sikerült.', 'Copying failed.'), 'error');
    }
  }

  function resetOrder() {
    paymentData = null;
    orderReference = createOrderReference();
    paymentPanel.hidden = true;
    confirmationForm.hidden = true;
    confirmationForm.reset();
    submitButton.disabled = !liveReady;
    submitButton.textContent = liveReady
      ? t('Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR')
      : t('A fizetés nem elérhető', 'Payment unavailable');
    updateSummary();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openStaticConfirmationEmail(payload) {
    const currency = selectedCurrency();
    const subject = 'FormatX payment report – ' + orderReference;
    const body = [
      'FormatX payment report', '',
      'Order reference: ' + orderReference,
      'Plan: ' + selectedPlan().name,
      'Duration: ' + (selectedCycle() === 'annual' ? '1 year' : '1 month'),
      'Currency: ' + currency,
      'Amount: ' + formatPrice(selectedAmount(), currency),
      'Payer: ' + String(payload.payer_name || ''),
      'Buyer email: ' + String(payload.buyer_email || ''),
      'Bank transaction reference: ' + String(payload.transfer_reference || ''),
      'Message: ' + String(payload.message || '')
    ].join('\n');
    location.href = 'mailto:' + SUPPORT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  async function submitConfirmation() {
    if (!confirmationForm.checkValidity()) {
      confirmationForm.reportValidity();
      throw new Error(t('Töltsd ki a kötelező visszajelző mezőket.', 'Complete the required payment report fields.'));
    }
    const payload = Object.fromEntries(new FormData(confirmationForm).entries());
    payload.order_reference = orderReference;
    payload.plan_id = selectedPlanId();
    payload.billing_cycle = selectedCycle();
    payload.amount = String(selectedAmount());
    payload.currency = selectedCurrency();

    if (backendMode === 'static') {
      openStaticConfirmationEmail(payload);
      return { static_email: true };
    }

    const response = await fetch(apiUrl('/payment-confirmation'), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(result.message || result.error || 'HTTP ' + response.status);
    return result;
  }

  function selectionChanged() {
    if (paymentData) resetOrder();
    updateOptionLabels();
    updateSummary();
  }

  planSelect.addEventListener('change', selectionChanged);
  cycleSelect.addEventListener('change', selectionChanged);
  currencySelect.addEventListener('change', selectionChanged);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!liveReady) {
      setFeedback(feedback, t('A fizetés nincs engedélyezve.', 'Payment is not enabled.'), 'error');
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback(feedback, t('Töltsd ki a kötelező rendelési adatokat.', 'Complete the required order details.'), 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = t('Rendelés előkészítése…', 'Preparing order…');
    try {
      const result = await createCheckout();
      showPayment(result);
      setFeedback(
        feedback,
        t(
          'Az átutalási QR és a szerveroldalon rögzített rendelés elkészült.',
          'The transfer QR and server-side order record are ready.'
        ),
        'success'
      );
      submitButton.textContent = t('Átutalási adatok elkészültek', 'Transfer details ready');
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = t('Fix összegű átutalási QR előkészítése', 'Prepare fixed-amount transfer QR');
      setFeedback(feedback, t('A fizetés nem indult el: ', 'Payment did not start: ')
        + (error instanceof Error ? error.message : t('ismeretlen hiba', 'unknown error')), 'error');
    }
  });

  paymentCopy.addEventListener('click', copyPaymentData);
  paymentReset.addEventListener('click', resetOrder);

  confirmationForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const button = document.getElementById('confirmation-submit');
    button.disabled = true;
    setFeedback(confirmationFeedback, t('A visszajelzés rögzítése folyamatban van…', 'Submitting payment report…'), '');
    try {
      const result = await submitConfirmation();
      setFeedback(
        confirmationFeedback,
        result.static_email
          ? t('A levelezőprogram megnyílt. Az e-mailt még el kell küldeni.', 'Your mail application opened. You still need to send the email.')
          : t('A visszajelzés rögzítve lett. A licenc az átutalás ellenőrzése után aktiválható.', 'The report was recorded. The licence can be activated after the transfer is verified.'),
        'success'
      );
    } catch (error) {
      setFeedback(confirmationFeedback, t('A visszajelzés nem rögzíthető: ', 'The report could not be submitted: ')
        + (error instanceof Error ? error.message : t('ismeretlen hiba', 'unknown error')), 'error');
    } finally {
      button.disabled = false;
    }
  });

  window.addEventListener('formatx:languagechange', function () {
    updateOptionLabels();
    updateSummary();
  });
}());
