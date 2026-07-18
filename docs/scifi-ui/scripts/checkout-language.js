(function () {
  'use strict';

  const SUPPORT_EMAIL = 'hutoczky@gmail.com';
  const apiMeta = document.querySelector('meta[name="formatx-billing-api-base"]');
  const apiBase = String(apiMeta?.content || '').trim().replace(/\/+$/, '');
  const confirmationForm = document.getElementById('confirmation-form');
  const confirmationFeedback = document.getElementById('confirmation-feedback');
  const confirmationButton = document.getElementById('confirmation-submit');
  let staticMode = false;

  if (!confirmationForm) return;

  function language() {
    return window.FormatXI18n?.getLanguage?.()
      || (String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en');
  }

  function apiUrl(path) {
    const clean = path.startsWith('/') ? path : '/' + path;
    return apiBase.endsWith('/api') ? apiBase + clean : apiBase + '/api' + clean;
  }

  async function detectMode() {
    try {
      if (!apiBase) throw new Error('missing API');
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller ? window.setTimeout(function () { controller.abort(); }, 4500) : null;
      const response = await fetch(apiUrl('/health'), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller?.signal
      });
      if (timer !== null) window.clearTimeout(timer);
      const result = await response.json().catch(function () { return {}; });
      const currencies = Array.isArray(result.supported_currencies) ? result.supported_currencies : [];
      staticMode = !(response.ok
        && result.provider === 'bank_transfer'
        && result.mode === 'live'
        && result.live_ready === true
        && currencies.includes('HUF')
        && currencies.includes('EUR'));
    } catch (_) {
      staticMode = true;
    }
  }

  function field(id) {
    return String(document.getElementById(id)?.value || '').trim();
  }

  function text(id) {
    return String(document.getElementById(id)?.textContent || '').trim();
  }

  function cycleName() {
    return document.getElementById('billing-cycle')?.value === 'annual' ? '1 year' : '1 month';
  }

  function setStatus(message, state) {
    if (confirmationFeedback) {
      confirmationFeedback.textContent = message;
      confirmationFeedback.dataset.state = state;
    }
  }

  confirmationForm.addEventListener('submit', function (event) {
    if (language() !== 'en' || !staticMode) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!confirmationForm.checkValidity()) {
      confirmationForm.reportValidity();
      setStatus('Complete all required payment report fields.', 'error');
      return;
    }

    const orderReference = field('confirmation-order-reference') || text('summary-reference');
    const subject = 'FormatX payment report – ' + orderReference;
    const body = [
      'FormatX payment report',
      '',
      'Order reference: ' + orderReference,
      'Plan: ' + text('summary-plan'),
      'Duration: ' + cycleName(),
      'Currency: ' + text('summary-currency'),
      'Amount: ' + text('summary-price'),
      'Payer name: ' + field('confirmation-payer-name'),
      'Buyer email: ' + field('confirmation-email'),
      'Bank transaction reference: ' + field('confirmation-transaction'),
      'Message: ' + field('confirmation-message'),
      '',
      'Please manually verify the bank transaction, currency, exact amount and payment reference.'
    ].join('\n');

    if (confirmationButton) confirmationButton.disabled = true;
    setStatus('Opening your mail application with a pre-filled payment report…', '');
    window.location.href = 'mailto:' + SUPPORT_EMAIL
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);

    window.setTimeout(function () {
      if (confirmationButton) confirmationButton.disabled = false;
      setStatus('The mail application opened with the pre-filled report. You still need to send the email.', 'success');
    }, 600);
  }, true);

  detectMode();
}());
