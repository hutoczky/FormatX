(function () {
  'use strict';

  const PLANS = {
    business_lite: {
      name: 'Business Lite',
      prices: {
        HUF: { monthly: 19900, annual: 199000 },
        EUR: { monthly: 55, annual: 547 }
      },
      technicians: 1,
      devices: 10
    },
    business_pro: {
      name: 'Business Pro',
      prices: {
        HUF: { monthly: 49900, annual: 499000 },
        EUR: { monthly: 137, annual: 1373 }
      },
      technicians: 3,
      devices: 50
    },
    technician_team: {
      name: 'Technician Team',
      prices: {
        HUF: { monthly: 99900, annual: 999000 },
        EUR: { monthly: 275, annual: 2748 }
      },
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

  let liveReady = false;
  let paymentData = null;
  let backendMode = 'checking';
  let orderReference = createOrderReference();

  applyQuerySelection();
  updateSummary();
  verifyBackend();

  function apiUrl(path) {
    if (!apiBase) throw new Error('A fizetési API címe nincs beállítva.');
    const clean = path.startsWith('/') ? path : '/' + path;
    return apiBase.endsWith('/api') ? apiBase + clean : apiBase + '/api' + clean;
  }

  function createOrderReference() {
    const date = new Date();
    const ymd = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('');
    const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-6).toUpperCase();
    return 'FX-' + ymd + '-' + random;
  }

  function applyQuerySelection() {
    const query = new URLSearchParams(window.location.search);
    const plan = query.get('plan');
    const cycle = query.get('cycle');
    const currency = String(query.get('currency') || '').toUpperCase();
    if (PLANS[plan]) planSelect.value = plan;
    if (cycle === 'monthly' || cycle === 'annual') cycleSelect.value = cycle;
    if (currency === 'HUF' || currency === 'EUR') currencySelect.value = currency;
  }

  function selectedPlan() {
    return PLANS[planSelect.value] || PLANS.business_pro;
  }

  function selectedCycle() {
    return cycleSelect.value === 'annual' ? 'annual' : 'monthly';
  }

  function selectedCurrency() {
    return currencySelect.value === 'EUR' ? 'EUR' : 'HUF';
  }

  function selectedAmount() {
    const plan = selectedPlan();
    return plan.prices[selectedCurrency()][selectedCycle()];
  }

  function formatPrice(value, currency) {
    return new Intl.NumberFormat('hu-HU', {
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

  function updateSummary() {
    const plan = selectedPlan();
    const cycle = selectedCycle();
    const currency = selectedCurrency();
    if (summaryPlan) summaryPlan.textContent = plan.name;
    if (summaryCycle) summaryCycle.textContent = cycle === 'annual' ? '1 év — egyszeri fizetés' : '1 hónap — egyszeri fizetés';
    if (summaryCurrency) summaryCurrency.textContent = currency;
    if (summaryPrice) summaryPrice.textContent = formatPrice(selectedAmount(), currency);
    if (summaryTeam) summaryTeam.textContent = String(plan.technicians);
    if (summaryDevices) summaryDevices.textContent = String(plan.devices);
    if (summaryReference) summaryReference.textContent = orderReference;

    const orderInput = document.getElementById('confirmation-order-reference');
    if (orderInput) orderInput.value = orderReference;
  }

  function enableStaticMode(reason) {
    backendMode = 'static';
    liveReady = true;
    submitButton.disabled = false;
    submitButton.textContent = 'Fix összegű átutalási QR előkészítése';
    setFeedback(
      feedback,
      'Közvetlen GitHub Pages mód aktív. A HUF- és EUR-QR a beépített, ellenőrzött bankszámlaadatokkal készül; a fizetés és a licencellenőrzés kézi. ' + (reason || ''),
      'success'
    );
  }

  async function verifyBackend() {
    liveReady = false;
    submitButton.disabled = true;
    submitButton.textContent = 'Bankszámla ellenőrzése…';

    try {
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller ? window.setTimeout(function () { controller.abort(); }, 4000) : null;
      const response = await fetch(apiUrl('/health'), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller ? controller.signal : undefined
      });
      if (timer !== null) window.clearTimeout(timer);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const result = await response.json();
      const currencies = Array.isArray(result.supported_currencies) ? result.supported_currencies : ['HUF'];
      if (!result || result.provider !== 'bank_transfer' || result.mode !== 'live' || result.live_ready !== true || !currencies.includes('EUR')) {
        throw new Error('A HUF/EUR banki átutalási backend nincs teljesen konfigurálva.');
      }
      backendMode = 'api';
      liveReady = true;
      submitButton.disabled = false;
      submitButton.textContent = 'Fix összegű átutalási QR előkészítése';
      setFeedback(
        feedback,
        'A HUF banki átutalás és az EUR SEPA QR-fizetés aktív. Jóváhagyás előtt mindig ellenőrizd az adatokat.',
        'success'
      );
    } catch (_) {
      enableStaticMode('A szerveres rendeléskövetés jelenleg nem elérhető.');
    }
  }

  function checkoutPayload() {
    const data = new FormData(form);
    const currency = selectedCurrency();
    return {
      plan_id: planSelect.value,
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
    return [
      'BCD',
      '001',
      '1',
      'SCT',
      account.bic,
      account.holder,
      account.eur_iban,
      'EUR' + Number(amount).toFixed(2),
      '',
      '',
      'FormatX ' + reference
    ].join('\n');
  }

  function createStaticCheckout() {
    const currency = selectedCurrency();
    const amount = selectedAmount();
    const paymentUri = buildPaytoUri(STATIC_ACCOUNT, amount, currency, orderReference);
    const qrPayload = currency === 'EUR'
      ? buildEpcQrPayload(STATIC_ACCOUNT, amount, orderReference)
      : paymentUri;

    return {
      session_id: orderReference,
      order_reference: orderReference,
      payment_provider: 'bank_transfer',
      payment_mode: 'live',
      amount: amount,
      currency: currency,
      account: STATIC_ACCOUNT,
      qr_payload: qrPayload,
      payment_uri: paymentUri,
      qvik: false,
      sepa: currency === 'EUR',
      qr_format: currency === 'EUR' ? 'epc069-12-v3.1' : 'payto-rfc8905',
      manual_verification_required: true,
      order_tracking_ready: false,
      automatic_renewal: false
    };
  }

  function normaliseCheckoutResult(result) {
    const amount = Number(result.amount ?? result.amount_huf);
    return {
      ...result,
      amount: amount,
      qr_payload: result.qr_payload || result.payto_uri,
      payment_uri: result.payment_uri || result.payto_uri
    };
  }

  async function createCheckout() {
    if (backendMode === 'static') return createStaticCheckout();

    try {
      const response = await fetch(apiUrl('/create-checkout-session'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutPayload())
      });
      const raw = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(raw.error || 'HTTP ' + response.status);
      const result = normaliseCheckoutResult(raw);
      if (result.payment_provider !== 'bank_transfer' || result.payment_mode !== 'live') {
        throw new Error('Nem éles banki átutalási válasz érkezett.');
      }
      if (result.order_reference !== orderReference) {
        throw new Error('A rendelési azonosító eltér.');
      }
      if (!result.qr_payload || !result.payment_uri || !result.account || result.amount !== selectedAmount() || result.currency !== selectedCurrency()) {
        throw new Error('A fizetési adatok hiányosak, vagy az összeg/deviza eltér.');
      }
      return result;
    } catch (_) {
      enableStaticMode('A rendelés most közvetlen, statikus módban folytatódik.');
      return createStaticCheckout();
    }
  }

  function buildCopyText(result) {
    const lines = [
      'Kedvezményezett: ' + result.account.holder
    ];
    if (result.currency === 'HUF') {
      lines.push('Belföldi HUF számlaszám: ' + result.account.local_huf_account);
    }
    lines.push(
      'IBAN: ' + (result.currency === 'EUR' ? result.account.eur_iban : result.account.iban),
      'BIC / SWIFT: ' + result.account.bic,
      'Levelező bank BIC: ' + result.account.correspondent_bic,
      'Összeg: ' + formatPrice(result.amount, result.currency),
      'Közlemény: ' + result.order_reference
    );
    return lines.join('\n');
  }

  function showPayment(result) {
    paymentData = result;
    paymentOpen.href = result.payment_uri;
    paymentReference.textContent = 'Közlemény: ' + orderReference;
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
      paymentQrDescription.textContent = 'A QR-kód EPC SEPA átutalási adatot tartalmaz: EUR-összeg, IBAN, BIC, kedvezményezett és közlemény.';
      paymentWarning.textContent = 'EPC SEPA QR: a támogatás bankonként eltérhet. Jóváhagyás előtt ellenőrizd az EUR-összeget, az IBAN-t és a közleményt.';
      paymentOpen.textContent = 'SEPA átutalás megnyitása';
    } else {
      paymentQrDescription.textContent = 'A QR-kód a kiválasztott fix HUF-összeget, az IBAN-t és a közleményt tartalmazza.';
      paymentWarning.textContent = 'Ez nem qvik-QR. A banki alkalmazás automatikus kitöltése nem garantált; mindig ellenőrizd az adatokat.';
      paymentOpen.textContent = 'Banki alkalmazás megnyitása';
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
    const text = buildCopyText(paymentData);
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(feedback, 'Az átutalási adatok a vágólapra kerültek.', 'success');
    } catch (_) {
      setFeedback(feedback, 'A másolás nem sikerült. Jelöld ki kézzel az átutalási adatokat.', 'error');
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
      ? 'Fix összegű átutalási QR előkészítése'
      : 'Banki átutalás nincs konfigurálva';
    updateSummary();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openStaticConfirmationEmail(payload) {
    const currency = selectedCurrency();
    const subject = 'FormatX fizetési visszajelzés – ' + orderReference;
    const body = [
      'FormatX fizetési visszajelzés',
      '',
      'Rendelési azonosító: ' + orderReference,
      'Csomag: ' + selectedPlan().name,
      'Időtartam: ' + (selectedCycle() === 'annual' ? '1 év' : '1 hónap'),
      'Deviza: ' + currency,
      'Összeg: ' + formatPrice(selectedAmount(), currency),
      'Utaló neve: ' + String(payload.payer_name || ''),
      'Vásárló e-mail-címe: ' + String(payload.buyer_email || ''),
      'Banki tranzakció hivatkozása: ' + String(payload.transfer_reference || ''),
      'Megjegyzés: ' + String(payload.message || ''),
      '',
      'A banki tranzakciót, a devizát, az összeget és a közleményt kérem kézzel ellenőrizni.'
    ].join('\n');
    window.location.href = 'mailto:' + SUPPORT_EMAIL
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  async function submitConfirmation() {
    if (!confirmationForm.checkValidity()) {
      confirmationForm.reportValidity();
      throw new Error('Töltsd ki a visszajelző űrlap kötelező mezőit.');
    }
    const payload = Object.fromEntries(new FormData(confirmationForm).entries());
    payload.order_reference = orderReference;
    payload.plan_id = planSelect.value;
    payload.billing_cycle = selectedCycle();
    payload.amount = String(selectedAmount());
    payload.currency = selectedCurrency();

    if (backendMode === 'static') {
      openStaticConfirmationEmail(payload);
      return { static_email: true };
    }

    const response = await fetch(apiUrl('/payment-confirmation'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);
    return result;
  }

  function selectionChanged() {
    if (paymentData) resetOrder();
    updateSummary();
  }

  planSelect.addEventListener('change', selectionChanged);
  cycleSelect.addEventListener('change', selectionChanged);
  currencySelect.addEventListener('change', selectionChanged);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!liveReady) {
      setFeedback(feedback, 'A banki átutalás nincs engedélyezve.', 'error');
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback(feedback, 'Töltsd ki a kötelező rendelési adatokat.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Rendelés előkészítése…';
    setFeedback(feedback, 'A fix ' + selectedCurrency() + '-összegű átutalási adatok előkészítése folyamatban van…', '');

    try {
      const result = await createCheckout();
      showPayment(result);
      setFeedback(
        feedback,
        'Az átutalási QR és a másolható banki adatok elkészültek. Az összeget és a közleményt változtatás nélkül add meg.',
        'success'
      );
      submitButton.textContent = 'Átutalási adatok elkészültek';
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = 'Fix összegű átutalási QR előkészítése';
      setFeedback(feedback, 'A fizetés nem indult el: ' + (error instanceof Error ? error.message : 'ismeretlen hiba'), 'error');
    }
  });

  paymentCopy.addEventListener('click', copyPaymentData);
  paymentReset.addEventListener('click', resetOrder);

  confirmationForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const button = document.getElementById('confirmation-submit');
    button.disabled = true;
    setFeedback(confirmationFeedback, 'A visszajelzés előkészítése folyamatban van…', '');

    try {
      const result = await submitConfirmation();
      setFeedback(
        confirmationFeedback,
        result.static_email
          ? 'A levelezőprogram megnyílt az előre kitöltött visszajelzéssel. Az e-mailt még el kell küldeni.'
          : 'A visszajelzés rögzítve lett. A licenc a beérkezett banki átutalás kézi ellenőrzése után aktiválódik.',
        'success'
      );
    } catch (error) {
      setFeedback(confirmationFeedback, 'A visszajelzés nem készíthető elő: ' + (error instanceof Error ? error.message : 'ismeretlen hiba'), 'error');
    } finally {
      button.disabled = false;
    }
  });
}());
