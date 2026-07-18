(function () {
  'use strict';

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

  const CURRENCY = 'HUF';
  const QR_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const QR_SCRIPT_INTEGRITY = 'sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==';

  const form = document.getElementById('billing-form');
  const feedback = document.getElementById('billing-feedback');
  const planSelect = document.getElementById('billing-plan');
  const cycleSelect = document.getElementById('billing-cycle');
  const submitButton = document.getElementById('billing-submit');
  const consent = document.getElementById('billing-consent');
  const summaryPlanName = document.getElementById('summary-plan-name');
  const summaryCycle = document.getElementById('summary-cycle');
  const summaryPrice = document.getElementById('summary-price');
  const summaryCurrency = document.getElementById('summary-currency');
  const summaryTeam = document.getElementById('summary-team');
  const summaryMethod = document.getElementById('summary-method');
  const summaryReference = document.getElementById('summary-reference');
  const summarySavings = document.getElementById('summary-savings');

  if (!form || !feedback || !planSelect || !cycleSelect || !submitButton || !consent) {
    return;
  }

  const orderReference = createOrderReference();
  let apiBasePromise = null;
  let qrLibraryPromise = null;

  prepareLiveCheckoutUi();
  bindEvents();
  updateSummary();
  void reportInitialReadiness();

  function prepareLiveCheckoutUi() {
    const paymentMethodFieldset = form.querySelector('fieldset.field-group');
    if (paymentMethodFieldset) {
      paymentMethodFieldset.innerHTML = [
        '<legend>Fizetési mód</legend>',
        '<div class="choice-grid">',
        '  <div class="choice-card" aria-live="polite">',
        '    <span class="choice-copy">',
        '      <span class="choice-title">Éles Stripe Checkout QR-kóddal</span>',
        '      <span class="choice-meta">A bankkártyaadatokat kizárólag a Stripe biztonságos HTTPS oldala kezeli.</span>',
        '    </span>',
        '  </div>',
        '</div>',
      ].join('');
    }

    const cardFieldsPanel = form.querySelector('.card-fields');
    if (cardFieldsPanel) {
      cardFieldsPanel.remove();
    }

    const confirmationSection = document.getElementById('payment-confirmation');
    if (confirmationSection) {
      confirmationSection.remove();
    }

    const consentLabel = consent.closest('label');
    if (consentLabel) {
      consentLabel.lastChild.textContent = ' Elfogadom az ÁSZF-et és tudomásul veszem, hogy a kiválasztott csomag ismétlődő havi vagy éves Stripe-előfizetést indít.';
    }

    submitButton.textContent = 'ÉLES FIZETÉS ELŐKÉSZÍTÉSE';

    const trustBlock = document.querySelector('.checkout-trust');
    if (trustBlock) {
      trustBlock.innerHTML = [
        '<h4>Biztonság és támogatás</h4>',
        '<p class="meta">A FormatX oldal nem kér és nem tárol bankkártyaszámot, lejáratot vagy CVC-kódot.</p>',
        '<p class="meta">A fizetéshez minden alkalommal új Stripe Checkout munkamenet készül. A QR-kód kizárólag ennek a rövid élettartamú HTTPS fizetési oldalnak a címét tartalmazza.</p>',
      ].join('');
    }

    ensureQrPanel();
  }

  function bindEvents() {
    document.querySelectorAll('.billing-plan-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const planId = trigger.getAttribute('data-plan');
        if (planId && PLANS[planId]) {
          planSelect.value = planId;
          updateSummary();
        }
      });
    });

    [planSelect, cycleSelect, consent].forEach((element) => {
      element.addEventListener('change', () => {
        updateSummary();
        clearPaymentPanel();
        if (feedback.dataset.state) setFeedback('', '');
      });
    });

    form.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
        target.setCustomValidity('');
        target.removeAttribute('aria-invalid');
        if (feedback.dataset.state === 'error') setFeedback('', '');
      }
    });

    form.addEventListener('submit', handleSubmit);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearPaymentPanel();

    if (!validateForm()) {
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    setFeedback('Az éles Stripe kapcsolat és a fizetési konfiguráció ellenőrzése folyamatban van…', 'info');

    try {
      const apiBase = await resolveApiBase();
      const health = await fetchJson(`${apiBase}/health`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
      });

      if (health.provider !== 'stripe') {
        throw new Error('A fizetési backend nem Stripe szolgáltatót jelentett. A fizetés biztonsági okból leállt.');
      }
      if (health.mode !== 'live') {
        throw new Error('A fizetési backend még tesztmódban fut. Éles terhelés nem indítható.');
      }

      setFeedback('Éles Stripe Checkout munkamenet létrehozása…', 'info');
      const session = await fetchJson(`${apiBase}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const checkoutUrl = validateStripeCheckoutUrl(session.checkout_url);
      await showLivePayment(checkoutUrl, session.session_id || '');
      setFeedback('Az éles Stripe fizetési oldal elkészült. Olvasd be a QR-kódot, vagy nyisd meg a biztonságos fizetési oldalt ezen az eszközön.', 'success');
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Az éles fizetés előkészítése nem sikerült.',
        'error'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  }

  function validateForm() {
    Array.from(form.elements).forEach((element) => {
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        element.setCustomValidity('');
        element.removeAttribute('aria-invalid');
      }
    });

    if (!form.checkValidity()) {
      const invalidElement = form.querySelector(':invalid');
      if (invalidElement) {
        invalidElement.setAttribute('aria-invalid', 'true');
        invalidElement.focus();
      }
      setFeedback('Töltsd ki a kötelező számlázási adatokat, és fogadd el az ÁSZF-et.', 'error');
      return false;
    }

    return true;
  }

  function buildCheckoutPayload() {
    const data = new FormData(form);
    return {
      plan_id: planSelect.value,
      billing_cycle: getSelectedCycle(),
      company_name: String(data.get('company_name') || '').trim(),
      contact_name: String(data.get('contact_name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      billing_address: String(data.get('billing_address') || '').trim(),
      tax_number: String(data.get('tax_number') || '').trim(),
      purchase_order: String(data.get('purchase_order') || '').trim(),
      order_reference: orderReference,
    };
  }

  async function resolveApiBase() {
    if (!apiBasePromise) {
      apiBasePromise = (async () => {
        const meta = document.querySelector('meta[name="formatx-billing-api-base"]');
        const metaValue = meta && meta.content ? meta.content.trim() : '';
        if (isUsableApiBase(metaValue)) {
          return normalizeApiBase(metaValue);
        }

        try {
          const response = await fetch('./billing-config.json', {
            cache: 'no-store',
            credentials: 'same-origin',
          });
          if (response.ok) {
            const config = await response.json();
            if (isUsableApiBase(config.api_base)) {
              return normalizeApiBase(config.api_base);
            }
          }
        } catch (_) {
          // A részletes, felhasználónak szóló hiba lent készül el.
        }

        throw new Error('Az éles fizetési API címe nincs beállítva. A demó fizetés eltávolításra került, ezért konfiguráció nélkül nem indul terhelés.');
      })();
    }

    return apiBasePromise;
  }

  function isUsableApiBase(value) {
    if (typeof value !== 'string' || !value.trim() || value.trim() === '/api') {
      return false;
    }

    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
    } catch (_) {
      return false;
    }
  }

  function normalizeApiBase(value) {
    const url = new URL(value, window.location.href);
    return url.toString().replace(/\/$/, '');
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options && options.headers ? options.headers : {}),
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_) {
      payload = null;
    }

    if (!response.ok) {
      const details = Array.isArray(payload && payload.details) ? ` ${payload.details.join(' ')}` : '';
      throw new Error(`${payload && payload.error ? payload.error : `Fizetési API hiba (${response.status}).`}${details}`.trim());
    }

    return payload || {};
  }

  function validateStripeCheckoutUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('A Stripe nem adott vissza fizetési URL-t.');
    }

    const url = new URL(value);
    const stripeHost = url.hostname === 'checkout.stripe.com' || url.hostname.endsWith('.stripe.com');
    if (url.protocol !== 'https:' || !stripeHost) {
      throw new Error('A backend nem hiteles Stripe HTTPS fizetési címet adott vissza. A fizetés leállt.');
    }

    return url.toString();
  }

  async function showLivePayment(checkoutUrl, sessionId) {
    const panel = ensureQrPanel();
    const qrTarget = panel.querySelector('[data-qr-target]');
    const paymentLink = panel.querySelector('[data-payment-link]');
    const sessionLabel = panel.querySelector('[data-session-label]');
    const fallback = panel.querySelector('[data-qr-fallback]');

    panel.hidden = false;
    paymentLink.href = checkoutUrl;
    sessionLabel.textContent = sessionId ? `Stripe munkamenet: ${sessionId}` : 'Éles Stripe Checkout munkamenet';
    qrTarget.replaceChildren();
    fallback.hidden = true;

    try {
      await loadQrLibrary();
      if (typeof window.QRCode !== 'function') {
        throw new Error('A QR-kód könyvtár nem érhető el.');
      }

      new window.QRCode(qrTarget, {
        text: checkoutUrl,
        width: 240,
        height: 240,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    } catch (_) {
      fallback.hidden = false;
    }

    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function ensureQrPanel() {
    let panel = document.getElementById('live-payment-panel');
    if (panel) return panel;

    panel = document.createElement('section');
    panel.id = 'live-payment-panel';
    panel.className = 'checkout-block';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = [
      '<h4>Éles Stripe QR-fizetés</h4>',
      '<p class="meta">A QR-kód egy rövid élettartamú Stripe Checkout HTTPS munkamenetet nyit meg. Fizetés előtt mindig ellenőrizd, hogy a megnyíló cím <strong>stripe.com</strong> tartományú.</p>',
      '<div data-qr-target style="display:flex;justify-content:center;align-items:center;min-height:260px;padding:10px;margin:1rem 0;background:#fff;border-radius:12px;"></div>',
      '<p class="meta" data-qr-fallback hidden>A QR-kód megjelenítése nem sikerült, de az alábbi hiteles Stripe fizetési gomb továbbra is használható.</p>',
      '<div class="checkout-actions">',
      '  <a class="pill lg accent" data-payment-link href="#" target="_blank" rel="noopener noreferrer">STRIPE FIZETÉS MEGNYITÁSA</a>',
      '</div>',
      '<p class="meta" data-session-label></p>',
    ].join('');

    feedback.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function clearPaymentPanel() {
    const panel = document.getElementById('live-payment-panel');
    if (!panel) return;
    panel.hidden = true;
    const qrTarget = panel.querySelector('[data-qr-target]');
    if (qrTarget) qrTarget.replaceChildren();
    const paymentLink = panel.querySelector('[data-payment-link]');
    if (paymentLink) paymentLink.removeAttribute('href');
  }

  function loadQrLibrary() {
    if (typeof window.QRCode === 'function') {
      return Promise.resolve();
    }
    if (qrLibraryPromise) {
      return qrLibraryPromise;
    }

    qrLibraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = QR_SCRIPT_URL;
      script.integrity = QR_SCRIPT_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('A QR-kód könyvtár betöltése nem sikerült.'));
      document.head.appendChild(script);
    });

    return qrLibraryPromise;
  }

  async function reportInitialReadiness() {
    try {
      const apiBase = await resolveApiBase();
      const health = await fetchJson(`${apiBase}/health`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
      });

      if (health.provider === 'stripe' && health.mode === 'live') {
        setFeedback('Éles Stripe fizetési kapcsolat elérhető. A fizetési munkamenet csak az adatok elküldése után készül el.', 'success');
      } else {
        setFeedback('Az éles fizetés jelenleg nincs engedélyezve. Tesztmódban terhelés nem indítható.', 'error');
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Az éles fizetési kapcsolat nem érhető el.', 'error');
    }
  }

  function updateSummary() {
    const plan = getSelectedPlan();
    const cycle = getSelectedCycle();
    const price = getSelectedAmount();

    if (summaryPlanName) summaryPlanName.textContent = plan.name;
    if (summaryCycle) summaryCycle.textContent = cycle === 'annual' ? 'Éves előfizetés' : 'Havi előfizetés';
    if (summaryPrice) summaryPrice.textContent = `${formatPrice(price)}${cycle === 'annual' ? ' / év' : ' / hó'}`;
    if (summaryCurrency) summaryCurrency.textContent = CURRENCY;
    if (summaryTeam) summaryTeam.textContent = plan.team;
    if (summaryMethod) summaryMethod.textContent = 'Éles Stripe Checkout QR';
    if (summaryReference) summaryReference.textContent = orderReference;
    if (summarySavings) {
      summarySavings.textContent = cycle === 'annual'
        ? `Megspórolsz ${formatPrice((plan.monthly * 12) - plan.annual)} összeget évente`
        : 'Éves csomag esetén 2 hónap kedvezmény';
    }
  }

  function getSelectedPlan() {
    return PLANS[planSelect.value] || PLANS.business_pro;
  }

  function getSelectedCycle() {
    return cycleSelect.value === 'annual' ? 'annual' : 'monthly';
  }

  function getSelectedAmount() {
    const plan = getSelectedPlan();
    return getSelectedCycle() === 'annual' ? plan.annual : plan.monthly;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: CURRENCY,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state || '';
  }

  function createOrderReference() {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 6).padStart(6, '0');
    return `FX-${date}-${random}`;
  }
})();
