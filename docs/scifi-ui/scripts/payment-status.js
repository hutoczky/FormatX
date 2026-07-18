(function () {
  'use strict';

  const STORAGE_KEY = 'formatx-language';
  const apiMeta = document.querySelector('meta[name="formatx-billing-api-base"]');
  const apiBase = String(apiMeta?.content || '/api').replace(/\/$/, '');
  const page = document.body?.dataset.paymentPage || 'cancel';
  const supported = new Set(['hu', 'en']);
  let language = resolveLanguage();

  function resolveLanguage() {
    const query = new URLSearchParams(window.location.search).get('lang');
    if (supported.has(query)) return query;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (supported.has(stored)) return stored;
    } catch (_) {
      // Storage is optional.
    }
    return String(navigator.language || '').toLowerCase().startsWith('hu') ? 'hu' : 'en';
  }

  function t(hu, en) {
    return language === 'hu' ? hu : en;
  }

  function setLanguage(nextLanguage, persist) {
    if (!supported.has(nextLanguage)) return;
    language = nextLanguage;
    document.documentElement.lang = language;

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch (_) {
        // Persistence is optional.
      }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    document.querySelectorAll('[data-hu][data-en]').forEach(function (element) {
      element.textContent = element.dataset[language];
    });
    document.querySelectorAll('[data-hu-label][data-en-label]').forEach(function (element) {
      element.setAttribute('aria-label', element.dataset[language + 'Label']);
    });
    document.querySelectorAll('[data-language-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.languageChoice === language));
    });
    document.querySelectorAll('a[data-internal-link]').forEach(function (link) {
      const url = new URL(link.getAttribute('href'), window.location.href);
      url.searchParams.set('lang', language);
      link.href = url.pathname + url.search + url.hash;
    });

    document.title = page === 'success'
      ? t('Fizetési állapot | FormatX Suite Pro', 'Payment status | FormatX Suite Pro')
      : t('Fizetés megszakítva | FormatX Suite Pro', 'Payment cancelled | FormatX Suite Pro');
  }

  function createDetail(labelHu, labelEn, value) {
    const item = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = t(labelHu, labelEn) + ': ';
    item.append(strong, document.createTextNode(String(value)));
    return item;
  }

  function cycleLabel(cycle) {
    if (cycle === 'annual') return t('Éves', 'Annual');
    if (cycle === 'monthly') return t('Havi', 'Monthly');
    return cycle || '—';
  }

  function statusLabel(result) {
    if (result.license_active) {
      return t(
        'A banki átutalás ellenőrzése megtörtént, a FormatX licenc aktív.',
        'The bank transfer has been verified and the FormatX licence is active.'
      );
    }
    return t(
      'Az átutalás vagy annak kézi ellenőrzése még folyamatban van.',
      'The transfer or its manual verification is still in progress.'
    );
  }

  async function loadStatus() {
    if (page !== 'success') return;
    const message = document.getElementById('payment-status-message');
    const details = document.getElementById('payment-status-details');
    const sessionId = new URL(window.location.href).searchParams.get('session_id');

    if (!sessionId) {
      message.textContent = t(
        'Hiányzik a rendelési azonosító, ezért a fizetés állapota nem kérdezhető le.',
        'The order reference is missing, so the payment status cannot be retrieved.'
      );
      message.dataset.state = 'error';
      return;
    }

    try {
      const response = await fetch(apiBase + '/session-status?session_id=' + encodeURIComponent(sessionId), {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      const result = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(result.error || 'HTTP ' + response.status);

      message.textContent = statusLabel(result);
      message.dataset.state = result.license_active ? 'success' : 'pending';
      details.replaceChildren(
        createDetail('Rendelési azonosító', 'Order reference', result.order_reference || sessionId),
        createDetail('Csomag', 'Plan', result.plan_name || result.plan_id || '—'),
        createDetail('Fizetési ciklus', 'Billing cycle', cycleLabel(result.billing_cycle)),
        createDetail('Összeg', 'Amount', (result.amount ?? '—') + ' ' + (result.currency || '')),
        createDetail('Fizetési állapot', 'Payment status', result.payment_status || '—'),
        createDetail('Licenc', 'Licence', result.license_key || t('még nincs aktiválva', 'not active yet'))
      );
    } catch (_) {
      message.textContent = t(
        'A fizetési állapot jelenleg nem kérdezhető le. Ellenőrizd később, vagy keresd a támogatást.',
        'The payment status cannot be retrieved right now. Check again later or contact support.'
      );
      message.dataset.state = 'error';
    }
  }

  document.querySelectorAll('[data-language-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      setLanguage(button.dataset.languageChoice, true);
      loadStatus();
    });
  });

  setLanguage(language, false);
  loadStatus();
}());
