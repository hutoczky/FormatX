import legacyWorker from './index.js';

const ANDROID_APK_RELEASE_URL = 'https://github.com/hutoczky/FormatX/releases/download/android-v1.0.1-beta/FormatX-Suite-Pro-Android.apk';

const PLAN_CATALOG = {
  business_lite: {
    id: 'business_lite',
    name: 'Business Lite',
    prices: {
      HUF: { monthly: 15900, annual: 139300 },
      EUR: { monthly: 44, annual: 383 },
    },
    maxTechnicians: 1,
    maxDevices: 10,
    licenseSegment: 'BUSINESS',
  },
  business_pro: {
    id: 'business_pro',
    name: 'Business Pro',
    prices: {
      HUF: { monthly: 39900, annual: 349300 },
      EUR: { monthly: 110, annual: 961 },
    },
    maxTechnicians: 3,
    maxDevices: 50,
    licenseSegment: 'BUSINESS',
  },
  technician_team: {
    id: 'technician_team',
    name: 'Technician Team',
    prices: {
      HUF: { monthly: 79900, annual: 699300 },
      EUR: { monthly: 220, annual: 1924 },
    },
    maxTechnicians: 5,
    maxDevices: 150,
    licenseSegment: 'TEAM',
  },
};

const BILLING_CYCLES = new Set(['monthly', 'annual']);
const SUPPORTED_CURRENCIES = new Set(['HUF', 'EUR']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/download/android') {
        return await handleAndroidDownload(request);
      }

      if (request.method === 'GET' && url.pathname === '/api/health') {
        const errors = getLiveConfigurationErrors(env);
        return jsonResponse({
          ok: errors.length === 0,
          provider: 'bank_transfer',
          mode: env.PAYMENT_MODE || 'live',
          live_ready: errors.length === 0,
          supported_currencies: [...SUPPORTED_CURRENCIES],
          qvik: false,
          qr_formats: {
            HUF: 'payto-rfc8905',
            EUR: 'epc069-12-v3.1',
          },
          manual_verification_required: true,
          configuration_errors: errors.length,
        }, 200, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await handleCreateCheckoutSession(request, env, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/payment-confirmation') {
        return await handlePaymentConfirmation(request, env, corsHeaders);
      }

      if (request.method === 'GET' && url.pathname === '/api/session-status') {
        return await handleSessionStatus(url, env, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/admin/approve-bank-transfer') {
        return await handleApprovePayment(request, env, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/license/verify') {
        return await legacyWorker.fetch(request, { ...env, PAYMENT_PROVIDER: 'stripe' }, ctx);
      }

      if (url.pathname.startsWith('/api/')) {
        return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      return jsonResponse({
        error: error instanceof Error ? error.message : 'Unexpected error',
      }, 500, corsHeaders);
    }
  },
};

async function handleAndroidDownload(request) {
  const upstreamHeaders = new Headers();
  const range = request.headers.get('Range');
  if (range) upstreamHeaders.set('Range', range);

  const upstream = await fetch(ANDROID_APK_RELEASE_URL, {
    method: 'GET',
    headers: upstreamHeaders,
    redirect: 'follow',
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response('Az Android alkalmazás jelenleg nem tölthető le.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/vnd.android.package-archive');
  headers.set('Content-Disposition', 'attachment; filename="FormatX-Suite-Pro-Android-1.0.1.apk"');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('X-Content-Type-Options', 'nosniff');
  for (const name of ['Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag', 'Last-Modified']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

async function handleCreateCheckoutSession(request, env, corsHeaders) {
  const errors = getLiveConfigurationErrors(env);
  if (errors.length > 0) {
    return jsonResponse({
      error: 'A közvetlen HUF/EUR banki átutalás nincs teljesen konfigurálva.',
      details: errors,
    }, 503, corsHeaders);
  }

  const payload = await readJson(request);
  const validationError = validateCheckoutRequest(payload);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400, corsHeaders);
  }

  const plan = PLAN_CATALOG[payload.plan_id];
  const billingCycle = payload.billing_cycle;
  const currency = normaliseCurrency(payload.currency);
  const amount = getPlanAmount(plan, billingCycle, currency);
  const orderReference = payload.order_reference.trim();
  const account = getBankAccount(env);
  const paymentUri = buildPaytoUri(account, amount, currency, orderReference);
  const qrPayload = currency === 'EUR'
    ? buildEpcQrPayload(account, amount, orderReference)
    : paymentUri;
  const qrFormat = currency === 'EUR' ? 'epc069-12-v3.1' : 'payto-rfc8905';

  if (hasSupabaseConfiguration(env)) {
    const supabase = createSupabaseClient(env);
    const company = await upsertCompany(supabase, payload);
    const now = new Date().toISOString();

    await supabase.upsert('subscriptions', [{
      company_id: company.id,
      plan_id: plan.id,
      plan_name: plan.name,
      billing_cycle: billingCycle,
      amount_huf: getPlanAmount(plan, billingCycle, 'HUF'),
      currency,
      max_technicians: plan.maxTechnicians,
      max_devices: plan.maxDevices,
      payment_provider: 'bank_transfer',
      payment_mode: 'live',
      provider_customer_id: null,
      provider_subscription_id: null,
      provider_checkout_session_id: orderReference,
      checkout_url: paymentUri,
      subscription_status: 'pending_payment',
      payment_status: 'pending',
      metadata: {
        company_name: payload.company_name.trim(),
        contact_name: payload.contact_name.trim(),
        contact_email: payload.email.trim(),
        billing_address: payload.billing_address.trim(),
        tax_number: payload.tax_number?.trim() || null,
        purchase_order: payload.purchase_order?.trim() || null,
        order_reference: orderReference,
        account_holder: account.holder,
        account_iban: currency === 'EUR' ? account.eur_iban : account.iban,
        account_local_huf: currency === 'HUF' ? account.local_huf_account : null,
        amount,
        currency,
        qr_format: qrFormat,
        automatic_renewal: false,
        qvik: false,
        sepa: currency === 'EUR',
      },
      created_at: now,
      updated_at: now,
    }], 'provider_checkout_session_id');
  }

  return jsonResponse({
    session_id: orderReference,
    order_reference: orderReference,
    payment_provider: 'bank_transfer',
    payment_mode: 'live',
    amount,
    amount_huf: currency === 'HUF' ? amount : null,
    currency,
    account,
    qr_payload: qrPayload,
    payment_uri: paymentUri,
    payto_uri: paymentUri,
    qvik: false,
    sepa: currency === 'EUR',
    qr_format: qrFormat,
    manual_verification_required: true,
    order_tracking_ready: hasSupabaseConfiguration(env),
    automatic_renewal: false,
  }, 200, corsHeaders);
}

async function handlePaymentConfirmation(request, env, corsHeaders) {
  if (!hasSupabaseConfiguration(env)) {
    return jsonResponse({
      error: 'A fizetési visszajelzés adatbázisa nincs konfigurálva.',
    }, 503, corsHeaders);
  }

  const payload = await readJson(request);
  const validationError = validatePaymentConfirmation(payload);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400, corsHeaders);
  }

  const supabase = createSupabaseClient(env);
  const subscription = await supabase.selectSingle('subscriptions', {
    provider_checkout_session_id: ['eq', payload.order_reference.trim()],
  });
  if (!subscription) {
    return jsonResponse({ error: 'A rendelési azonosító nem található.' }, 404, corsHeaders);
  }

  const expectedEmail = String(subscription.metadata?.contact_email || '').toLowerCase();
  if (expectedEmail && expectedEmail !== payload.buyer_email.trim().toLowerCase()) {
    return jsonResponse({ error: 'A vásárlói e-mail nem egyezik a rendelésben megadott címmel.' }, 409, corsHeaders);
  }

  const expectedCurrency = String(subscription.currency || subscription.metadata?.currency || 'HUF').toUpperCase();
  const submittedCurrency = normaliseCurrency(payload.currency);
  if (expectedCurrency !== submittedCurrency) {
    return jsonResponse({ error: 'A visszajelzett deviza nem egyezik a rendeléssel.' }, 409, corsHeaders);
  }

  const expectedAmount = Number(subscription.metadata?.amount ?? subscription.amount_huf);
  if (Number(payload.amount) !== expectedAmount) {
    return jsonResponse({ error: 'A visszajelzett összeg nem egyezik a rendeléssel.' }, 409, corsHeaders);
  }

  const eventId = `bank-transfer-confirmation:${payload.order_reference.trim()}`;
  const now = new Date().toISOString();
  await supabase.upsert('payment_events', [{
    provider_event_id: eventId,
    event_type: 'manual_bank_transfer_confirmation',
    status: 'awaiting_manual_review',
    payload: {
      ...payload,
      amount: expectedAmount,
      currency: expectedCurrency,
      plan_id: subscription.plan_id,
      billing_cycle: subscription.billing_cycle,
    },
    processed_at: now,
    created_at: now,
  }], 'provider_event_id');

  await supabase.update('subscriptions', {
    subscription_status: 'payment_reported',
    payment_status: 'pending_verification',
    metadata: {
      ...(subscription.metadata || {}),
      payer_name: payload.payer_name.trim(),
      buyer_email: payload.buyer_email.trim(),
      bank_transaction_reference: payload.transfer_reference.trim(),
      payment_reported_at: now,
      customer_message: payload.message?.trim() || null,
    },
    updated_at: now,
  }, {
    id: ['eq', subscription.id],
  });

  return jsonResponse({
    ok: true,
    order_reference: payload.order_reference.trim(),
    amount: expectedAmount,
    currency: expectedCurrency,
    status: 'awaiting_manual_review',
    message: 'A fizetési visszajelzés rögzítve lett. A licenc a beérkezett átutalás kézi ellenőrzése után aktiválható.',
  }, 200, corsHeaders);
}

async function handleSessionStatus(url, env, corsHeaders) {
  if (!hasSupabaseConfiguration(env)) {
    return jsonResponse({ error: 'A rendeléskövetés nincs konfigurálva.' }, 503, corsHeaders);
  }

  const orderReference = url.searchParams.get('session_id') || url.searchParams.get('order_reference');
  if (!orderReference) {
    return jsonResponse({ error: 'A session_id vagy order_reference kötelező.' }, 400, corsHeaders);
  }

  const supabase = createSupabaseClient(env);
  const subscription = await supabase.selectSingle('subscriptions', {
    provider_checkout_session_id: ['eq', orderReference],
  });
  if (!subscription) {
    return jsonResponse({ error: 'A rendelés nem található.' }, 404, corsHeaders);
  }

  const license = await supabase.selectSingle('licenses', {
    subscription_id: ['eq', subscription.id],
  });

  return jsonResponse({
    session_id: orderReference,
    order_reference: orderReference,
    plan_id: subscription.plan_id,
    plan_name: subscription.plan_name,
    billing_cycle: subscription.billing_cycle,
    amount: Number(subscription.metadata?.amount ?? subscription.amount_huf),
    currency: subscription.currency || subscription.metadata?.currency || 'HUF',
    subscription_status: subscription.subscription_status,
    payment_status: subscription.payment_status,
    license_active: Boolean(license),
    license_key: license?.license_key ?? null,
    valid_until: license?.valid_until ?? subscription.valid_until ?? null,
    manual_verification_required: !license,
    message: license
      ? 'A banki átutalás ellenőrzése megtörtént, a FormatX licenc aktív.'
      : 'Az átutalás vagy annak kézi ellenőrzése még folyamatban van.',
  }, 200, corsHeaders);
}

async function handleApprovePayment(request, env, corsHeaders) {
  const token = request.headers.get('X-Admin-Debug-Token') || '';
  if (!env.ADMIN_DEBUG_TOKEN || !safeEqual(token, env.ADMIN_DEBUG_TOKEN)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  if (!hasSupabaseConfiguration(env)) {
    return jsonResponse({ error: 'A Supabase kapcsolat nincs konfigurálva.' }, 503, corsHeaders);
  }
  ensureLicenseConfiguration(env);

  const payload = await readJson(request);
  if (!payload.order_reference?.trim()) {
    return jsonResponse({ error: 'Az order_reference kötelező.' }, 400, corsHeaders);
  }
  if (!payload.bank_transaction_id?.trim()) {
    return jsonResponse({ error: 'A bank_transaction_id kötelező.' }, 400, corsHeaders);
  }

  const supabase = createSupabaseClient(env);
  const subscription = await supabase.selectSingle('subscriptions', {
    provider_checkout_session_id: ['eq', payload.order_reference.trim()],
  });
  if (!subscription) {
    return jsonResponse({ error: 'A rendelés nem található.' }, 404, corsHeaders);
  }

  const existingLicense = await supabase.selectSingle('licenses', {
    subscription_id: ['eq', subscription.id],
  });
  if (existingLicense) {
    return jsonResponse({
      ok: true,
      duplicate: true,
      license_key: existingLicense.license_key,
      valid_until: existingLicense.valid_until,
    }, 200, corsHeaders);
  }

  const now = new Date().toISOString();
  const validUntil = computeValidUntil(subscription.billing_cycle);
  const providerTransactionId = `bank:${payload.bank_transaction_id.trim()}`;
  const licenseKey = await generateLicenseKey(
    env,
    subscription.provider_checkout_session_id,
    PLAN_CATALOG[subscription.plan_id]?.licenseSegment || 'BUSINESS',
    subscription.metadata?.contact_email || ''
  );

  await supabase.update('subscriptions', {
    provider_subscription_id: providerTransactionId,
    subscription_status: 'active',
    payment_status: 'paid',
    valid_until: validUntil,
    last_error: null,
    metadata: {
      ...(subscription.metadata || {}),
      bank_transaction_id: payload.bank_transaction_id.trim(),
      payment_approved_at: now,
      payment_approved_by: 'admin',
    },
    updated_at: now,
  }, {
    id: ['eq', subscription.id],
  });

  await supabase.upsert('licenses', [{
    subscription_id: subscription.id,
    license_key: licenseKey,
    license_status: 'active',
    company_name: subscription.metadata?.company_name || '',
    contact_email: subscription.metadata?.contact_email || '',
    plan_id: subscription.plan_id,
    billing_cycle: subscription.billing_cycle,
    max_technicians: subscription.max_technicians,
    max_devices: subscription.max_devices,
    payment_provider: 'bank_transfer',
    provider_customer_id: null,
    provider_subscription_id: providerTransactionId,
    payment_status: 'paid',
    valid_until: validUntil,
    features: [
      'direct_bank_transfer',
      'manual_payment_verification',
      `currency:${subscription.currency || subscription.metadata?.currency || 'HUF'}`,
      `plan:${subscription.plan_id}`,
      `billing_cycle:${subscription.billing_cycle}`,
      `max_technicians:${subscription.max_technicians}`,
      `max_devices:${subscription.max_devices}`,
    ],
  }], 'subscription_id');

  const license = await supabase.selectSingle('licenses', {
    subscription_id: ['eq', subscription.id],
  });

  await supabase.insert('license_activations', {
    license_id: license?.id ?? null,
    verification_source: 'manual_bank_transfer_approval',
    request_ip: request.headers.get('CF-Connecting-IP') || null,
    user_agent: request.headers.get('User-Agent') || 'cloudflare-worker',
    result: 'active',
  });

  await supabase.upsert('payment_events', [{
    provider_event_id: `bank-transfer-approved:${payload.bank_transaction_id.trim()}`,
    event_type: 'manual_bank_transfer_approved',
    status: 'processed',
    payload: {
      order_reference: payload.order_reference.trim(),
      bank_transaction_id: payload.bank_transaction_id.trim(),
      amount: Number(subscription.metadata?.amount ?? subscription.amount_huf),
      currency: subscription.currency || subscription.metadata?.currency || 'HUF',
      approved_at: now,
    },
    processed_at: now,
    created_at: now,
  }], 'provider_event_id');

  return jsonResponse({
    ok: true,
    order_reference: payload.order_reference.trim(),
    license_key: licenseKey,
    valid_until: validUntil,
  }, 200, corsHeaders);
}

function validateCheckoutRequest(payload) {
  if (!payload || typeof payload !== 'object') return 'Hiányzó kérés törzs.';
  if (!PLAN_CATALOG[payload.plan_id]) return 'Ismeretlen csomag.';
  if (!BILLING_CYCLES.has(payload.billing_cycle)) return 'Érvénytelen számlázási ciklus.';
  if (!SUPPORTED_CURRENCIES.has(normaliseCurrency(payload.currency))) return 'Érvénytelen fizetési deviza.';
  if (!payload.company_name?.trim()) return 'A cégnév vagy tevékenységnév kötelező.';
  if (!payload.contact_name?.trim()) return 'A kapcsolattartó neve kötelező.';
  if (!payload.email?.includes('@')) return 'Érvényes e-mail-cím szükséges.';
  if (!payload.billing_address?.trim()) return 'A számlázási cím kötelező.';
  if (!/^FX-\d{8}-[A-Z0-9]{3,8}$/.test(payload.order_reference || '')) return 'Érvénytelen rendelési azonosító.';
  return null;
}

function validatePaymentConfirmation(payload) {
  if (!payload || typeof payload !== 'object') return 'Hiányzó kérés törzs.';
  if (!payload.order_reference?.trim()) return 'A rendelési azonosító kötelező.';
  if (!payload.payer_name?.trim()) return 'Az utaló neve kötelező.';
  if (!payload.buyer_email?.includes('@')) return 'Érvényes vásárlói e-mail-cím szükséges.';
  if (!payload.transfer_reference?.trim()) return 'A banki tranzakció hivatkozása kötelező.';
  if (!SUPPORTED_CURRENCIES.has(normaliseCurrency(payload.currency))) return 'Érvénytelen visszajelzett deviza.';
  if (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0) return 'Érvénytelen visszajelzett összeg.';
  return null;
}

function getLiveConfigurationErrors(env) {
  const errors = [];
  const account = getBankAccount(env);

  if (env.PAYMENT_MODE !== 'live') errors.push('PAYMENT_MODE');
  if (env.PAYMENT_PROVIDER !== 'bank_transfer') errors.push('PAYMENT_PROVIDER');
  if (env.PAYMENT_ACCOUNT_CONFIRMED !== 'true') errors.push('PAYMENT_ACCOUNT_CONFIRMED');
  if (!account.holder) errors.push('BANK_ACCOUNT_HOLDER');
  if (!isValidIban(account.iban)) errors.push('BANK_IBAN_HUF');
  if (!isValidIban(account.eur_iban)) errors.push('BANK_IBAN_EUR');
  if (!/^\d{8}-\d{8}-\d{8}$/.test(account.local_huf_account)) errors.push('BANK_LOCAL_HUF_ACCOUNT');
  if (!isValidBic(account.bic)) errors.push('BANK_BIC');
  if (!isValidBic(account.correspondent_bic)) errors.push('BANK_CORRESPONDENT_BIC');

  return errors;
}

function getBankAccount(env) {
  return {
    holder: String(env.BANK_ACCOUNT_HOLDER || '').trim(),
    local_huf_account: String(env.BANK_LOCAL_HUF_ACCOUNT || '').trim(),
    iban: normaliseIban(env.BANK_IBAN_HUF || env.BANK_IBAN_EUR || ''),
    eur_iban: normaliseIban(env.BANK_IBAN_EUR || env.BANK_IBAN_HUF || ''),
    bic: String(env.BANK_BIC || '').trim().toUpperCase(),
    correspondent_bic: String(env.BANK_CORRESPONDENT_BIC || '').trim().toUpperCase(),
  };
}

function buildPaytoUri(account, amount, currency, orderReference) {
  const params = new URLSearchParams();
  params.set('amount', `${currency}:${amount}`);
  params.set('receiver-name', account.holder);
  params.set('message', `FormatX ${orderReference}`);
  params.set('instruction', orderReference);
  const iban = currency === 'EUR' ? account.eur_iban : account.iban;
  return `payto://iban/${account.bic}/${iban}?${params.toString()}`;
}

function buildEpcQrPayload(account, amountEur, orderReference) {
  const payload = [
    'BCD',
    '001',
    '1',
    'SCT',
    account.bic,
    account.holder,
    account.eur_iban,
    `EUR${Number(amountEur).toFixed(2)}`,
    '',
    '',
    `FormatX ${orderReference}`,
  ].join('\n');

  if (new TextEncoder().encode(payload).length > 331) {
    throw new Error('Az EPC SEPA QR-adat túllépi a 331 bájtos korlátot.');
  }
  return payload;
}

function normaliseCurrency(value) {
  return String(value || '').trim().toUpperCase();
}

function normaliseIban(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase();
}

function isValidIban(value) {
  const iban = normaliseIban(value);
  if (!/^HU\d{26}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;

  for (const character of rearranged) {
    const digits = /\d/.test(character) ? character : String(character.charCodeAt(0) - 55);
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
}

function isValidBic(value) {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(String(value || '').trim().toUpperCase());
}

function getPlanAmount(plan, billingCycle, currency) {
  return plan.prices[currency][billingCycle];
}

function computeValidUntil(billingCycle) {
  const date = new Date();
  if (billingCycle === 'annual') {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
  } else {
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return date.toISOString();
}

async function generateLicenseKey(env, orderReference, planSegment, email) {
  const digest = await sha256HmacHex(env.LICENSE_SECRET, `${orderReference}|${email}`);
  const chunks = [digest.slice(0, 4), digest.slice(4, 8), digest.slice(8, 12)].map((part) => part.toUpperCase());
  return `FXPRO-${planSegment}-${chunks.join('-')}`;
}

async function sha256HmacHex(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqual(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  if (!a || !b || a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

function hasSupabaseConfiguration(env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function ensureLicenseConfiguration(env) {
  if (!env.LICENSE_SECRET || String(env.LICENSE_SECRET).length < 32) {
    throw new Error('A LICENSE_SECRET nincs biztonságosan konfigurálva.');
  }
}

function createSupabaseClient(env) {
  if (!hasSupabaseConfiguration(env)) {
    throw new Error('A Supabase kapcsolat nincs konfigurálva.');
  }

  const baseUrl = String(env.SUPABASE_URL).replace(/\/$/, '');
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    async select(table, options = {}) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      url.searchParams.set('select', options.select || '*');
      if (options.limit) url.searchParams.set('limit', String(options.limit));
      if (options.order) url.searchParams.set('order', options.order);
      if (options.filters) applyFilters(url, options.filters);
      const response = await supabaseFetch(url, serviceRoleKey, {
        headers: { Prefer: 'return=representation' },
      });
      return response.status === 204 ? [] : await response.json();
    },

    async selectSingle(table, filters, select = '*') {
      const rows = await this.select(table, { filters, limit: 1, select });
      return rows[0] || null;
    },

    async insert(table, row) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      const response = await supabaseFetch(url, serviceRoleKey, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(row),
      });
      const rows = response.status === 204 ? [] : await response.json();
      return rows[0] || null;
    },

    async upsert(table, rows, onConflict) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      if (onConflict) url.searchParams.set('on_conflict', onConflict);
      const response = await supabaseFetch(url, serviceRoleKey, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(rows),
      });
      return response.status === 204 ? [] : await response.json();
    },

    async update(table, values, filters) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      applyFilters(url, filters);
      const response = await supabaseFetch(url, serviceRoleKey, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(values),
      });
      return response.status === 204 ? [] : await response.json();
    },
  };
}

async function upsertCompany(supabase, payload) {
  const rows = await supabase.upsert('companies', [{
    company_name: payload.company_name.trim(),
    contact_name: payload.contact_name.trim(),
    contact_email: payload.email.trim(),
    billing_address: payload.billing_address.trim(),
    tax_number: payload.tax_number?.trim() || null,
    updated_at: new Date().toISOString(),
  }], 'company_name,contact_email');

  if (!rows[0]) {
    throw new Error('A vásárlói adatok nem rögzíthetők.');
  }
  return rows[0];
}

function applyFilters(url, filters = {}) {
  for (const [key, [operator, value]] of Object.entries(filters)) {
    url.searchParams.set(key, `${operator}.${value}`);
  }
}

async function supabaseFetch(url, serviceRoleKey, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${errorText}`);
  }
  return response;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (_) {
    throw new Error('Érvénytelen JSON kérés.');
  }
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get('Origin') || '';
  const allowedOrigin = env.FRONTEND_URL || new URL(request.url).origin;
  const origin = requestOrigin && requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Debug-Token',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(payload, status, corsHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders,
    },
  });
}
