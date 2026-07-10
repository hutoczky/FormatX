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
  const summaryTeam = document.getElementById('summary-team');
  const summaryMethod = document.getElementById('summary-method');
  const summarySavings = document.getElementById('summary-savings');

  if (!form || !feedback || !planSelect || !cycleSelect || !submitButton || !cardFieldsPanel) {
    return;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
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

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state || '';
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
    const cycle = cycleSelect.value === 'annual' ? 'annual' : 'monthly';
    const method = getSelectedMethod();
    const price = cycle === 'annual' ? plan.annual : plan.monthly;

    summaryPlanName.textContent = plan.name;
    summaryCycle.textContent = cycle === 'annual' ? 'Éves előfizetés' : 'Havi előfizetés';
    summaryPrice.textContent = `${formatPrice(price)}${cycle === 'annual' ? ' / év' : ' / hó'}`;
    summaryTeam.textContent = plan.team;
    summaryMethod.textContent = METHOD_LABELS[method] || METHOD_LABELS.card;
    summarySavings.textContent = cycle === 'annual'
      ? `Megspórolsz ${formatPrice((plan.monthly * 12) - plan.annual)} összeget évente`
      : 'Éves csomag esetén 2 hónap kedvezmény';

    submitButton.textContent = method === 'card'
      ? 'DEMO FIZETÉS JÓVÁHAGYÁSA'
      : 'DEMO MEGRENDELÉS KÜLDÉSE';
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
    const cycle = cycleSelect.value === 'annual' ? 'éves' : 'havi';
    const method = getSelectedMethod();
    const contactEmail = document.getElementById('contact-email');
    const companyName = document.getElementById('company-name');
    const reference = `FX-DEMO-${Date.now().toString().slice(-6)}`;
    const suffix = method === 'card'
      ? 'A demo kártyaellenőrzés helyben sikeres volt.'
      : 'A demo rendelés jóváhagyásra előkészítve.';

    setFeedback(
      `${reference} • ${companyName.value.trim()} • ${plan.name} (${cycle}) • ${METHOD_LABELS[method]}. ${suffix} Aktiválási összefoglaló a ${contactEmail.value.trim()} címre kerülne éles környezetben.`,
      'success'
    );
  });

  toggleCardFields();
  updateSummary();
})();
