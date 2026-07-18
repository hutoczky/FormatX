(function () {
  'use strict';

  const PLANS = {
    business_lite: {
      name: 'Business Lite',
      monthly: 19900,
      annual: 199000,
      technicians: 1,
      devices: 10
    },
    business_pro: {
      name: 'Business Pro',
      monthly: 49900,
      annual: 499000,
      technicians: 3,
      devices: 50
    },
    technician_team: {
      name: 'Technician Team',
      monthly: 99900,
      annual: 999000,
      technicians: 5,
      devices: 150
    }
  };

  const REVOLUT_HOST = 'checkout.revolut.com';
  const apiMeta = document.querySelector('meta[name="formatx-billing-api-base"]');
  const apiBase = String(apiMeta ? apiMeta.content : '').trim().replace(/\/+$/, '');

  const form = document.getElementById('checkout-form');
  const planSelect = document.getElementById('plan-id');
  const cycleSelect = document.getElementById('billing-cycle');
  const submitButton = document.getElementById('checkout-submit');
  const feedback = document.getElementById('checkout-feedback');
  const paymentPanel = document.getElementById('payment-panel');
  const paymentQr = document.getElementById('payment-qr');
  const paymentOpen = document.getElementById('payment-open');
  const paymentReset = document.getElementById('payment-reset');
  const paymentReference = document.getElementById('payment-reference');
  const confirmationForm = document.getElementById('confirmation-form');
  const confirmationFeedback = document.getElementById('confirmation-feedback');

  const summaryPlan = document.getElementById('summary-plan');
  const summaryCycle = document.getElementById('summary-cycle');
  const summaryPrice = document.getElementById('summary-price');
  const summaryTeam = document.getElementById('summary-team');
  const summaryDevices = document.getElementById('summary-devices');
  const summaryReference = document.getElementById('summary-reference');

  if (!form || !planSelect || !cycleSelect || !submitButton || !feedback) return;

  let liveReady = false;
  let checkoutUrl = '';
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
    if (PLANS[plan]) planSelect.value = plan;
    if (cycle === 'monthly' || cycle === 'annual') cycleSelect.value = cycle;
  }

  function selectedPlan() {
    return PLANS[planSelect.value] || PLANS.business_pro;
  }

  function selectedCycle() {
    return cycleSelect.value === 'annual' ? 'annual' : 'monthly';
  }

  function selectedAmount() {
    const plan = selectedPlan();
    return selectedCycle() === 'annual' ? plan.annual : plan.monthly;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
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
    if (summaryPlan) summaryPlan.textContent = plan.name;
    if (summaryCycle) summaryCycle.textContent = cycle === 'annual' ? '1 év — egyszeri fizetés' : '1 hónap — egyszeri fizetés';
    if (summaryPrice) summaryPrice.textContent = formatPrice(selectedAmount());
    if (summaryTeam) summaryTeam.textContent = String(plan.technicians);
    if (summaryDevices) summaryDevices.textContent = String(plan.devices);
    if (summaryReference) summaryReference.textContent = orderReference;

    const orderInput = document.getElementById('confirmation-order-reference');
    if (orderInput) orderInput.value = orderReference;
  }

  async function verifyBackend() {
    liveReady = false;
    submitButton.disabled = true;
    submitButton.textContent = 'Fizetési kapcsolat ellenőrzése…';

    try {
      const response = await fetch(apiUrl('/health'), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const result = await response.json();
      if (!result || result.provider !== 'revolut_pro' || result.mode !== 'live' || result.live_ready !== true) {
        throw new Error('A Revolut Pro backend nincs teljesen konfigurálva.');
      }
      liveReady = true;
      submitButton.disabled = false;
      submitButton.textContent = 'Revolut fizetés és QR-kód előkészítése';
      setFeedback(feedback, 'Az éles Revolut Pro fizetési kapcsolat aktív.', 'success');
    } catch (error) {
      submitButton.disabled = true;
      submitButton.textContent = 'Revolut fizetés nincs konfigurálva';
      setFeedback(feedback, 'A fizetés le van tiltva: ' + (error instanceof Error ? error.message : 'ismeretlen hiba'), 'error');
    }
  }

  function trustedRevolutUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:'
        && url.hostname === REVOLUT_HOST
        && url.pathname.startsWith('/payment-link/');
    } catch (_) {
      return false;
    }
  }

  function checkoutPayload() {
    const data = new FormData(form);
    return {
      plan_id: planSelect.value,
      billing_cycle: selectedCycle(),
      company_name: String(data.get('company_name') || '').trim(),
      contact_name: String(data.get('contact_name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      billing_address: String(data.get('billing_address') || '').trim(),
      tax_number: String(data.get('tax_number') || '').trim(),
      purchase_order: String(data.get('purchase_order') || '').trim(),
      order_reference: orderReference,
      payment_method: 'revolut_pro_payment_link_qr'
    };
  }

  async function createCheckout() {
    const response = await fetch(apiUrl('/create-checkout-session'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutPayload())
    });
    const result = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);
    if (result.payment_provider !== 'revolut_pro' || result.payment_mode !== 'live') {
      throw new Error('Nem éles Revolut Pro fizetési válasz érkezett.');
    }
    if (!trustedRevolutUrl(result.checkout_url)) {
      throw new Error('A fizetési link nem hiteles Revolut checkout cím.');
    }
    if (result.order_reference !== orderReference) {
      throw new Error('A rendelési azonosító eltér.');
    }
    return result;
  }

  function showPayment(result) {
    checkoutUrl = result.checkout_url;
    paymentOpen.href = checkoutUrl;
    paymentReference.textContent = 'Rendelési azonosító: ' + orderReference + ' · Fizetendő: ' + formatPrice(selectedAmount());
    paymentQr.src = 'https://quickchart.io/qr?text=' + encodeURIComponent(checkoutUrl)
      + '&size=260&margin=3&ecLevel=M&format=png';
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

  function resetOrder() {
    checkoutUrl = '';
    orderReference = createOrderReference();
    paymentPanel.hidden = true;
    confirmationForm.hidden = true;
    confirmationForm.reset();
    submitButton.disabled = !liveReady;
    submitButton.textContent = liveReady
      ? 'Revolut fizetés és QR-kód előkészítése'
      : 'Revolut fizetés nincs konfigurálva';
    updateSummary();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    payload.amount_huf = String(selectedAmount());
    payload.currency = 'HUF';

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

  planSelect.addEventListener('change', function () {
    if (checkoutUrl) resetOrder();
    updateSummary();
  });

  cycleSelect.addEventListener('change', function () {
    if (checkoutUrl) resetOrder();
    updateSummary();
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!liveReady) {
      setFeedback(feedback, 'A fizetés nincs engedélyezve.', 'error');
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback(feedback, 'Töltsd ki a kötelező rendelési adatokat.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Rendelés rögzítése…';
    setFeedback(feedback, 'A fix összegű Revolut Pro link előkészítése folyamatban van…', '');

    try {
      const result = await createCheckout();
      showPayment(result);
      setFeedback(feedback, 'A valódi Revolut Pro fizetési link és QR-kód elkészült.', 'success');
      submitButton.textContent = 'Revolut fizetési link elkészült';
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = 'Revolut fizetés és QR-kód előkészítése';
      setFeedback(feedback, 'A fizetés nem indult el: ' + (error instanceof Error ? error.message : 'ismeretlen hiba'), 'error');
    }
  });

  paymentReset.addEventListener('click', resetOrder);

  confirmationForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const button = document.getElementById('confirmation-submit');
    button.disabled = true;
    setFeedback(confirmationFeedback, 'A visszajelzés rögzítése folyamatban van…', '');

    try {
      await submitConfirmation();
      setFeedback(
        confirmationFeedback,
        'A visszajelzés rögzítve lett. A licenc a Revolut tranzakció kézi ellenőrzése után aktiválódik.',
        'success'
      );
    } catch (error) {
      setFeedback(confirmationFeedback, 'A visszajelzés nem rögzíthető: ' + (error instanceof Error ? error.message : 'ismeretlen hiba'), 'error');
    } finally {
      button.disabled = false;
    }
  });
}());
