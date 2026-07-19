(function () {
  'use strict';

  const PLANS = {
    business_lite: {
      name: 'Business Lite',
      monthly: 15900,
      annual: 139300,
      team: '1 technikus • 10 gépig',
    },
    business_pro: {
      name: 'Business Pro',
      monthly: 39900,
      annual: 349300,
      team: '3 technikus • 50 gépig',
    },
    technician_team: {
      name: 'Technician Team',
      monthly: 79900,
      annual: 699300,
      team: '5 technikus • 150 gépig',
    },
  };

  const CURRENCY = 'HUF';
  const STRIPE_CHECKOUT_HOST = 'checkout.stripe.com';
  const QR_LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';

  const apiMeta = document.querySelector('meta[name="formatx-billing-api-base"]');
  const apiBase = normaliseApiBase(apiMeta ? apiMeta.content : '');

  const form = document.getElementById('billing-form');
  const feedback = document.getElementById('billing-feedback');
  const planSelect = document.getElementById('billing-plan');
  const cycleSelect = document.getElementById('billing-cycle');
  const submitButton = document.getElementById('billing-submit');
  const consent = document.getElementById('billing-consent');
  const methodInputs = Array.from(document.querySelectorAll('input[name="payment_method"]'));
  const cardFieldsPanel = document.querySelector('.card-fields');
  const cardFields = Array.from(document.querySelectorAll('[data-card-field]'));
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

  let liveReady = false;
  let currentCheckoutUrl = '';
  const orderReference = createOrderReference();
  const livePanel = createLiveCheckoutPanel();

  prepareLiveInterface();
  updateSummary();
  void verifyLiveBackend();

  function normaliseApiBase(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    return trimmed.replace(/\/+$/, '');
  }

  function apiUrl(path) {
    if (!apiBase) throw new Error('A fizetési API címe nincs beállítva.');
    if (location.hostname.endsWith('.github.io') && apiBase.startsWith('/')) {
      throw new Error('GitHub Pages alatt abszolút Cloudflare Worker API-címet kell beállítani.');
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return apiBase.endsWith('/api') ? `${apiBase}${cleanPath}` : `${apiBase}/api${cleanPath}`;
  }

  function createOrderReference() {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-5).toUpperCase();
    return `FX-${date}-${random}`;
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

  function getCycleLabel() {
    return getSelectedCycle() === 'annual' ? 'Éves előfizetés' : 'Havi előfizetés';
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

  function prepareLiveInterface() {
    injectLiveStyles();

    methodInputs.forEach((input) => {
      const card = input.closest('.choice-card');
      if (input.value === 'card') {
        input.checked = true;
        input.value = 'stripe_checkout';
        const title = card && card.querySelector('.choice-title');
        const meta = card && card.querySelector('.choice-meta');
        if (title) title.textContent = 'Stripe Checkout + QR-kód';
        if (meta) meta.textContent = 'Éles, titkosított fizetés a Stripe oldalán; mobilon QR-kóddal is megnyitható.';
      } else {
        input.checked = false;
        input.disabled = true;
        if (card) card.hidden = true;
      }
    });

    if (cardFieldsPanel) cardFieldsPanel.hidden = true;
    cardFields.forEach((field) => {
      field.required = false;
      field.disabled = true;
      field.removeAttribute('name');
      field.value = '';
    });

    const consentLabel = consent.closest('label');
    if (consentLabel) {
      consentLabel.lastChild.textContent = ' Elfogadom az ÁSZF-et és az adatkezelési tájékoztatót. Tudomásul veszem, hogy a fizetés a Stripe biztonságos felületén történik, és a licenc csak a hitelesített sikeres fizetés után aktiválódik.';
    }

    const trust = document.querySelector('.checkout-trust');
    if (trust) {
      trust.innerHTML = [
        '<h4>Biztonság és támogatás</h4>',
        '<p class="meta">A weboldal nem kér és nem tárol kártyaszámot, lejáratot vagy CVC-kódot. A fizetési adatokat kizárólag a Stripe kezeli.</p>',
        '<p class="meta">A QR-kód egy egyszer használható, időkorlátos Stripe Checkout munkamenetet nyit meg. A licencaktiválást szerveroldali, aláírt webhook igazolja.</p>',
      ].join('');
    }

    const confirmation = document.getElementById('payment-confirmation');
    if (confirmation) confirmation.hidden = true;

    submitButton.disabled = true;
    submitButton.setAttribute('aria-disabled', 'true');
    submitButton.textContent = 'FIZETÉSI KAPCSOLAT ELLENŐRZÉSE…';
  }

  function injectLiveStyles() {
    if (document.getElementById('formatx-live-payment-styles')) return;
    const style = document.createElement('style');
    style.id = 'formatx-live-payment-styles';
    style.textContent = `
      .live-payment-panel[hidden] { display: none !important; }
      .live-payment-panel { margin-top: 1rem; }
      .live-payment-grid { display: grid; grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); gap: 1.25rem; align-items: center; }
      .live-payment-qr { width: 232px; min-height: 232px; padding: 6px; border-radius: 12px; background: #fff; display: grid; place-items: center; overflow: hidden; }
      .live-payment-qr img, .live-payment-qr canvas { display: block; max-width: 100%; height: auto; }
      .live-payment-copy { display: grid; gap: .75rem; }
      .live-payment-copy p { margin: 0; }
      .live-payment-url { overflow-wrap: anywhere; font-family: var(--font-mono); font-size: .85rem; color: var(--muted); }
      .live-payment-actions { display: flex; flex-wrap: wrap; gap: .75rem; }
      .live-payment-status { font-family: var(--font-mono); }
      @media (max-width: 700px) {
        .live-payment-grid { grid-template-columns: 1fr; }
        .live-payment-qr { width: min(232px, 100%); margin-inline: auto; }
      }
    `;
    document.head.appendChild(style);
  }

  function createLiveCheckoutPanel() {
    const panel = document.createElement('section');
    panel.id = 'live-payment-panel';
    panel.className = 'checkout-block live-payment-panel';
    panel.hidden = true;
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = `
      <h4>Éles fizetés QR-kóddal</h4>
      <div class="live-payment-grid">
        <div id="live-payment-qr" class="live-payment-qr" role="img" aria-label="Stripe Checkout fizetési QR-kód"></div>
        <div class="live-payment-copy">
          <p class="live-payment-status"><strong>A biztonságos Stripe Checkout elkészült.</strong></p>
          <p>Telefonon olvasd be a QR-kódot, vagy nyisd meg a fizetési oldalt ezen az eszközön.</p>
          <div class="live-payment-actions">
            <a id="live-payment-open" class="pill lg accent" href="#" target="_blank" rel="noopener noreferrer">FIZETÉS MEGNYITÁSA</a>
            <button id="live-payment-new" class="pill lg alt" type="button">ÚJ QR-KÓD</button>
          </div>
          <p id="live-payment-url" class="live-payment-url"></p>
        </div>
      </div>
    `;
    feedback.insertAdjacentElement('afterend', panel);

    const newButton = panel.querySelector('#live-payment-new');
    if (newButton) {
      newButton.addEventListener('click', () => {
        currentCheckoutUrl = '';
        panel.hidden = true;
        submitButton.disabled = !liveReady;
        submitButton.setAttribute('aria-disabled', submitButton.disabled ? 'true' : 'false');
        setFeedback('Új fizetési munkamenet indítható.', 'info');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    return panel;
  }

  function updateSummary() {
    const plan = getSelectedPlan();
    const cycle = getSelectedCycle();
    const amount = getSelectedAmount();

    if (summaryPlanName) summaryPlanName.textContent = plan.name;
    if (summaryCycle) summaryCycle.textContent = getCycleLabel();
    if (summaryPrice) summaryPrice.textContent = `${formatPrice(amount)}${cycle === 'annual' ? ' / év' : ' / hó'}`;
    if (summaryCurrency) summaryCurrency.textContent = CURRENCY;
    if (summaryTeam) summaryTeam.textContent = plan.team;
    if (summaryMethod) summaryMethod.textContent = 'Stripe Checkout + QR-kód';
    if (summaryReference) summaryReference.textContent = orderReference;
    if (summarySavings) {
      summarySavings.textContent = cycle === 'annual'
        ? `Éves megtakarítás: ${formatPrice((plan.monthly * 12) - plan.annual)}`
        : 'Éves csomag esetén 2 hónap kedvezmény';
    }
  }

  async function verifyLiveBackend() {
    liveReady = false;
    try {
      const response = await fetch(apiUrl('/health'), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const health = await response.json();
      if (!health || health.mode !== 'live' || health.provider !== 'stripe' || health.live_ready === false) {
        throw new Error('A fizetési backend nincs teljesen éles módra konfigurálva.');
      }

      liveReady = true;
      submitButton.disabled = false;
      submitButton.setAttribute('aria-disabled', 'false');
      submitButton.textContent = 'ÉLES FIZETÉS / QR-KÓD INDÍTÁSA';
      setFeedback('Éles Stripe fizetési kapcsolat aktív. A weboldal nem kezel kártyaadatokat.', 'success');
    } catch (error) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-disabled', 'true');
      submitButton.textContent = 'ÉLES FIZETÉS NINCS KONFIGURÁLVA';
      setFeedback(
        `A fizetés biztonsági okból le van tiltva: ${error instanceof Error ? error.message : 'a backend nem érhető el'}`,
        'error'
      );
    }
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
      payment_method: 'stripe_checkout_qr',
    };
  }

  async function createCheckoutSession(payload) {
    const response = await fetch(apiUrl('/create-checkout-session'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const details = Array.isArray(result.details) ? ` ${result.details.join(' ')}` : '';
      throw new Error(`${result.error || `HTTP ${response.status}`}${details}`.trim());
    }
    if (result.payment_mode !== 'live') {
      throw new Error('A szolgáltató nem éles fizetési munkamenetet adott vissza.');
    }
    if (!isTrustedStripeCheckoutUrl(result.checkout_url)) {
      throw new Error('A visszakapott fizetési URL nem hiteles Stripe Checkout cím.');
    }
    return result;
  }

  function isTrustedStripeCheckoutUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === STRIPE_CHECKOUT_HOST;
    } catch (_) {
      return false;
    }
  }

  function loadQrLibrary() {
    if (typeof window.QRCode === 'function') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-formatx-qrcode]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('A QR-kód könyvtár nem tölthető be.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = QR_LIBRARY_URL;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.formatxQrcode = 'true';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('A QR-kód könyvtár nem tölthető be.')), { once: true });
      document.head.appendChild(script);
    });
  }

  async function showCheckout(result) {
    currentCheckoutUrl = result.checkout_url;
    const qr = livePanel.querySelector('#live-payment-qr');
    const open = livePanel.querySelector('#live-payment-open');
    const urlText = livePanel.querySelector('#live-payment-url');

    if (open) open.href = currentCheckoutUrl;
    if (urlText) urlText.textContent = currentCheckoutUrl;
    if (qr) {
      qr.replaceChildren();
      try {
        await loadQrLibrary();
        if (typeof window.QRCode !== 'function') throw new Error('A QR-kód generátor nem indult el.');
        new window.QRCode(qr, {
          text: currentCheckoutUrl,
          width: 220,
          height: 220,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M,
        });
      } catch (error) {
        const fallback = document.createElement('p');
        fallback.textContent = 'A QR-kód nem jeleníthető meg. Használd a Fizetés megnyitása gombot.';
        qr.appendChild(fallback);
      }
    }

    livePanel.hidden = false;
    livePanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  [planSelect, cycleSelect].forEach((element) => {
    element.addEventListener('change', () => {
      updateSummary();
      if (currentCheckoutUrl) {
        currentCheckoutUrl = '';
        livePanel.hidden = true;
        setFeedback('A csomag megváltozott. Indíts új fizetési munkamenetet.', 'info');
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!liveReady) {
      setFeedback('A fizetés nincs engedélyezve, amíg az éles backend ellenőrzése nem sikeres.', 'error');
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback('Töltsd ki a kötelező számlázási és kapcsolattartási mezőket.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-disabled', 'true');
    submitButton.textContent = 'ÉLES FIZETÉSI MUNKAMENET LÉTREHOZÁSA…';
    setFeedback('Kapcsolódás a Stripe biztonságos fizetési rendszeréhez…', 'info');

    try {
      const result = await createCheckoutSession(buildCheckoutPayload());
      await showCheckout(result);
      setFeedback('Az éles fizetési munkamenet elkészült. A QR-kód és a megnyitási gomb ugyanahhoz a Stripe Checkout oldalhoz vezet.', 'success');
    } catch (error) {
      setFeedback(
        `A fizetés nem indult el: ${error instanceof Error ? error.message : 'ismeretlen hiba'}`,
        'error'
      );
    } finally {
      submitButton.disabled = Boolean(currentCheckoutUrl) || !liveReady;
      submitButton.setAttribute('aria-disabled', submitButton.disabled ? 'true' : 'false');
      submitButton.textContent = currentCheckoutUrl
        ? 'FIZETÉSI MUNKAMENET ELKÉSZÜLT'
        : 'ÉLES FIZETÉS / QR-KÓD INDÍTÁSA';
    }
  });
})();
