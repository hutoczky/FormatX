(function () {
  const PLANS = {
    business_lite: {
      name: 'Business Lite',
      monthly: 19900,
      annual: 199000,
      team: '1 technikus • 10 gépig',
    },
    business_pro: {
      name: 'Business Pro',
      monthly: 49900,
      annual: 499000,
      team: '3 technikus • 50 gépig',
    },
    technician_team: {
      name: 'Technician Team',
      monthly: 99900,
      annual: 999000,
      team: '5 technikus • 150 gépig',
    },
  };

  const METHOD_LABELS = {
    card: 'Kártya demo',
    transfer: 'Banki átutalás',
    invoice: 'Beszerzési igény',
  };

  const CURRENCY = 'HUF';
  const paymentConfirmationMeta = document.querySelector('meta[name="formatx-payment-confirmation-endpoint"]');
  const paymentConfirmationEndpoint = paymentConfirmationMeta && paymentConfirmationMeta.content
    ? paymentConfirmationMeta.content.trim()
    : '';

  const form = document.getElementById('billing-form');
  const feedback = document.getElementById('billing-feedback');
  const planSelect = document.getElementById('billing-plan');
  const cycleSelect = document.getElementById('billing-cycle');
  const submitButton = document.getElementById('billing-submit');
  const consent = document.getElementById('billing-consent');
  const cardFieldsPanel = document.querySelector('.card-fields');
  const cardFields = Array.from(document.querySelectorAll('[data-card-field]'));
  const methodInputs = Array.from(document.querySelectorAll('input[name="payment_method"]'));
  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvc = document.getElementById('card-cvc');
  const summaryPlanName = document.getElementById('summary-plan-name');
  const summaryCycle = document.getElementById('summary-cycle');
  const summaryPrice = document.getElementById('summary-price');
  const summaryCurrency = document.getElementById('summary-currency');
  const summaryTeam = document.getElementById('summary-team');
  const summaryMethod = document.getElementById('summary-method');
  const summaryReference = document.getElementById('summary-reference');
  const summarySavings = document.getElementById('summary-savings');

  const confirmationForm = document.getElementById('payment-confirmation-form');
  const confirmationFeedback = document.getElementById('payment-confirmation-feedback');
  const confirmationStatus = document.getElementById('payment-confirmation-status');
  const confirmationBadge = document.getElementById('payment-confirmation-badge');
  const confirmationSubmitButton = document.getElementById('payment-confirmation-submit');
  const confirmationOrderId = document.getElementById('confirmation-order-id');
  const confirmationPlan = document.getElementById('confirmation-plan');
  const confirmationCurrency = document.getElementById('confirmation-currency');
  const confirmationAmount = document.getElementById('confirmation-amount');
  const confirmationConsent = document.getElementById('confirmation-consent');

  if (!form || !feedback || !planSelect || !cycleSelect || !submitButton || !cardFieldsPanel) {
    return;
  }

  const orderReference = createOrderReference();
  const confirmationAdapter = createPaymentConfirmationAdapter(paymentConfirmationEndpoint);

  function formatPrice(value) {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: CURRENCY,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getSelectedMethod() {
    const selected = methodInputs.find((input) => input.checked);
    return selected ? selected.value : 'card';
  }

  function getSelectedPlan() {
    return PLANS[planSelect.value] || PLANS.business_pro;
  }

  function getSelectedCycle() {
    return cycleSelect.value === 'annual' ? 'annual' : 'monthly';
  }

  function getCycleLabel(cycle) {
    return cycle === 'annual' ? 'Éves előfizetés' : 'Havi előfizetés';
  }

  function getSelectedAmount() {
    const plan = getSelectedPlan();
    const cycle = getSelectedCycle();
    return cycle === 'annual' ? plan.annual : plan.monthly;
  }

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state || '';
  }

  function setConfirmationFeedback(message, state) {
    if (!confirmationFeedback) return;
    confirmationFeedback.textContent = message;
    confirmationFeedback.dataset.state = state || '';
  }

  function setConfirmationStatusMessage(message, state) {
    if (confirmationStatus) {
      confirmationStatus.textContent = message;
      confirmationStatus.dataset.state = state || '';
    }

    if (confirmationBadge) {
      confirmationBadge.textContent = state === 'ready' ? 'Publikus végpont aktív' : 'Nincs összekötve';
    }
  }

  function normalizeDigits(value) {
    return (value || '').replace(/\D+/g, '');
  }

  function clearError(input) {
    input.setCustomValidity('');
    input.removeAttribute('aria-invalid');
  }

  function setError(input, message) {
    input.setCustomValidity(message);
    input.setAttribute('aria-invalid', 'true');
  }

  function createOrderReference() {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const time = String(Date.now()).slice(-6);
    return `FX-${date}-${time}`;
  }

  function createPaymentConfirmationAdapter(endpoint) {
    const publicEndpoint = (endpoint || '').trim();

    return {
      enabled: publicEndpoint.length > 0,
      async submit(payload) {
        if (!publicEndpoint) {
          throw new Error('A fizetési visszajelző űrlap még nincs összekötve publikus végponttal.');
        }

        const response = await fetch(publicEndpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('A publikus űrlapvégpont hibát adott vissza.');
        }

        return response;
      },
    };
  }

  function validateExpiry(value) {
    const cleaned = (value || '').trim();
    const match = cleaned.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = Number(match[1]);
    const year = Number(match[2]);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  }

  function updateSummary() {
    const plan = getSelectedPlan();
    const cycle = getSelectedCycle();
    const method = getSelectedMethod();
    const price = getSelectedAmount();

    summaryPlanName.textContent = plan.name;
    summaryCycle.textContent = getCycleLabel(cycle);
    summaryPrice.textContent = `${formatPrice(price)}${cycle === 'annual' ? ' / év' : ' / hó'}`;
    summaryCurrency.textContent = CURRENCY;
    summaryTeam.textContent = plan.team;
    summaryMethod.textContent = METHOD_LABELS[method] || METHOD_LABELS.card;
    summaryReference.textContent = orderReference;
    summarySavings.textContent = cycle === 'annual'
      ? `Megspórolsz ${formatPrice((plan.monthly * 12) - plan.annual)} összeget évente`
      : 'Éves csomag esetén 2 hónap kedvezmény';

    submitButton.textContent = method === 'card'
      ? 'DEMO FIZETÉS JÓVÁHAGYÁSA'
      : 'DEMO MEGRENDELÉS KÜLDÉSE';

    syncConfirmationFields();
  }

  function toggleCardFields() {
    const cardMode = getSelectedMethod() === 'card';
    cardFieldsPanel.hidden = !cardMode;
    cardFields.forEach((field) => {
      field.disabled = !cardMode;
      field.required = cardMode;
      if (!cardMode) {
        clearError(field);
      }
    });
  }

  function validateCardFields() {
    let firstInvalid = null;

    cardFields.forEach((field) => clearError(field));
    clearError(consent);

    if (getSelectedMethod() !== 'card') {
      return null;
    }

    const number = normalizeDigits(cardNumber.value);
    if (number.length < 16) {
      setError(cardNumber, 'Adj meg egy 16 számjegyű demó kártyaszámot.');
      firstInvalid = firstInvalid || cardNumber;
    }

    if (!validateExpiry(cardExpiry.value)) {
      setError(cardExpiry, 'Adj meg egy érvényes lejáratot MM/ÉÉ formátumban.');
      firstInvalid = firstInvalid || cardExpiry;
    }

    const cvc = normalizeDigits(cardCvc.value);
    if (cvc.length < 3) {
      setError(cardCvc, 'A CVC legalább 3 számjegy legyen.');
      firstInvalid = firstInvalid || cardCvc;
    }

    return firstInvalid;
  }

  function validateForm() {
    Array.from(form.elements).forEach((element) => {
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        if (element !== consent) clearError(element);
      }
    });

    const firstCardInvalid = validateCardFields();
    if (!form.checkValidity() || firstCardInvalid) {
      const invalidElement = firstCardInvalid || form.querySelector(':invalid');
      if (invalidElement) {
        invalidElement.setAttribute('aria-invalid', 'true');
        invalidElement.focus();
      }
      setFeedback('Kérlek töltsd ki a szükséges mezőket az előnézet megerősítéséhez.', 'error');
      return false;
    }

    return true;
  }

  function syncConfirmationFields() {
    if (!confirmationForm) return;

    const plan = getSelectedPlan();
    const cycle = getSelectedCycle();
    const amount = getSelectedAmount();

    if (confirmationOrderId && !confirmationOrderId.value.trim()) {
      confirmationOrderId.value = orderReference;
    }
    if (confirmationPlan) {
      confirmationPlan.value = `${plan.name} — ${getCycleLabel(cycle)}`;
    }
    if (confirmationCurrency) {
      confirmationCurrency.value = CURRENCY;
    }
    if (confirmationAmount) {
      confirmationAmount.value = formatPrice(amount);
    }
  }

  function updateConfirmationAvailability() {
    if (!confirmationForm || !confirmationSubmitButton) return;

    confirmationSubmitButton.disabled = !confirmationAdapter.enabled;
    confirmationSubmitButton.setAttribute('aria-disabled', confirmationSubmitButton.disabled ? 'true' : 'false');

    if (confirmationAdapter.enabled) {
      setConfirmationStatusMessage(
        'Publikus űrlapvégpont beállítva. A fogadó e-mail-címnek a szolgáltató vagy a backend privát konfigurációjában kell maradnia.',
        'ready'
      );
    } else {
      setConfirmationStatusMessage(
        'Ez a visszajelző űrlap még nincs összekötve. A statikus oldal csak egy publikus űrlapvégpont URL-jét használhatja; a fogadó e-mail-címet a Formspree vagy a szerveroldali szolgáltatás privát dashboardján kell beállítani.',
        'disabled'
      );
      setConfirmationFeedback('Bekötés nélkül az űrlap nem küld értesítést és nem szimulál kézbesítést.', 'info');
    }
  }

  function validateConfirmationForm() {
    if (!confirmationForm) return false;

    Array.from(confirmationForm.elements).forEach((element) => {
      if (
        element instanceof HTMLInputElement
        || element instanceof HTMLSelectElement
        || element instanceof HTMLTextAreaElement
      ) {
        if (element !== confirmationConsent) clearError(element);
      }
    });

    if (!confirmationForm.checkValidity()) {
      const invalidElement = confirmationForm.querySelector(':invalid');
      if (invalidElement) {
        invalidElement.setAttribute('aria-invalid', 'true');
        invalidElement.focus();
      }
      setConfirmationFeedback('Kérlek töltsd ki a kötelező mezőket a fizetési visszajelzéshez.', 'error');
      return false;
    }

    return true;
  }

  function buildConfirmationPayload() {
    const payload = Object.fromEntries(new FormData(confirmationForm).entries());
    payload.plan_id = planSelect.value;
    payload.billing_cycle = getSelectedCycle();
    payload.payment_method = getSelectedMethod();
    payload.currency = CURRENCY;
    payload.amount_value = String(getSelectedAmount());
    payload.amount_display = formatPrice(getSelectedAmount());
    payload.order_reference = confirmationOrderId.value.trim() || orderReference;
    return payload;
  }

  document.querySelectorAll('.billing-plan-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const planId = trigger.getAttribute('data-plan');
      if (planId && PLANS[planId]) {
        planSelect.value = planId;
        updateSummary();
      }
    });
  });

  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      const digits = normalizeDigits(cardNumber.value).slice(0, 16);
      cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', () => {
      const digits = normalizeDigits(cardExpiry.value).slice(0, 4);
      if (digits.length <= 2) {
        cardExpiry.value = digits;
      } else {
        cardExpiry.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }
    });
  }

  if (cardCvc) {
    cardCvc.addEventListener('input', () => {
      cardCvc.value = normalizeDigits(cardCvc.value).slice(0, 4);
    });
  }

  [planSelect, cycleSelect, consent].forEach((element) => {
    element.addEventListener('change', () => {
      updateSummary();
      if (feedback.dataset.state) setFeedback('', '');
    });
  });

  methodInputs.forEach((input) => {
    input.addEventListener('change', () => {
      toggleCardFields();
      updateSummary();
      setFeedback('', '');
    });
  });

  form.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      clearError(target);
      if (feedback.dataset.state === 'error') setFeedback('', '');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    toggleCardFields();

    if (!validateForm()) {
      return;
    }

    const plan = getSelectedPlan();
    const cycle = getSelectedCycle();
    const method = getSelectedMethod();
    const companyName = document.getElementById('company-name');
    const suffix = method === 'card'
      ? 'A demo kártyaellenőrzés helyben sikeres volt.'
      : method === 'transfer'
        ? 'Banki átutalás választva. A fizetés elindítása után használd az alábbi visszajelző űrlapot.'
        : 'A beszerzési igény demója rögzítve lett.';

    setFeedback(
      `${orderReference} • ${companyName.value.trim()} • ${plan.name} (${cycle === 'annual' ? 'éves' : 'havi'}) • ${METHOD_LABELS[method]}. ${suffix}`,
      'success'
    );

    syncConfirmationFields();
    if (confirmationOrderId && document.activeElement === submitButton) {
      confirmationOrderId.focus();
    }
  });

  if (confirmationForm) {
    confirmationForm.addEventListener('input', (event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement
        || target instanceof HTMLSelectElement
        || target instanceof HTMLTextAreaElement
      ) {
        clearError(target);
        if (confirmationFeedback && confirmationFeedback.dataset.state === 'error') {
          setConfirmationFeedback('', '');
        }
      }
    });

    confirmationForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!confirmationAdapter.enabled) {
        setConfirmationStatusMessage(
          'Az űrlap még nincs összekötve publikus végponttal, ezért most nem tud visszajelzést küldeni. Állíts be egy Formspree vagy szerveroldali URL-t, ahol a fogadó cím privát konfigurációban marad.',
          'disabled'
        );
        setConfirmationFeedback('Jelenleg nincs bekapcsolva kézbesítés, ezért nem történt beküldés.', 'info');
        return;
      }

      if (!validateConfirmationForm()) {
        return;
      }

      confirmationSubmitButton.disabled = true;
      setConfirmationFeedback('A visszajelzés elküldése folyamatban van a beállított publikus végpontra…', 'info');

      try {
        await confirmationAdapter.submit(buildConfirmationPayload());
        setConfirmationFeedback(
          'A visszajelzés eljutott a beállított publikus űrlapvégpontra. A további feldolgozást a háttérben konfigurált szolgáltatás végzi.',
          'success'
        );
      } catch (error) {
        setConfirmationFeedback(
          error instanceof Error
            ? error.message
            : 'A visszajelzés elküldése nem sikerült. Ellenőrizd a publikus űrlapvégpont beállítását.',
          'error'
        );
      } finally {
        confirmationSubmitButton.disabled = false;
      }
    });
  }

  toggleCardFields();
  updateSummary();
  updateConfirmationAvailability();
})();
