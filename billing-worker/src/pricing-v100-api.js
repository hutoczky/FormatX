import { isSalesLegallyReady } from './sales-gate.js';

const PUBLIC_ORIGIN = 'https://www.formatxsuite.com';
const TERMS_VERSION = '2026-08-07';
const PRIVACY_VERSION = '2026-08-10';

const PLAN_CATALOG = {
  business_lite: {
    id: 'business_lite',
    name: 'Business Lite',
    prices: {
      HUF: { monthly: 7900, annual: 79000 },
      EUR: { monthly: 22, annual: 220 },
    },
    maxTechnicians: 1,
    maxDevices: 10,
  },
  business_pro: {
    id: 'business_pro',
    name: 'Business Pro',
    prices: {
      HUF: { monthly: 15900, annual: 159000 },
      EUR: { monthly: 44, annual: 440 },
    },
    maxTechnicians: 3,
    maxDevices: 50,
  },
  technician_team: {
    id: 'technician_team',
    name: 'Technician Team',
    prices: {
      HUF: { monthly: 29900, annual: 299000 },
      EUR: { monthly: 83, annual: 830 },
    },
    maxTechnicians: 5,
    maxDevices: 150,
  },
};

const BILLING_CYCLES = new Set(['monthly', 'annual']);
const SUPPORTED_CURRENCIES = new Set(['HUF', 'EUR']);
const SECURE_ORDER_REFERENCE = /^FX-\d{8}-[A-F0-9]{24}$/;
const LEGACY_ORDER_REFERENCE = /^FX-\d{8}-[A-Z0-9]{3,8}$/;

export async function handleV100PricingRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/api/checkout-qr') {
    return await handleCheckoutQr(request, url);
  }

  if (request.method === 'GET' && url.pathname === '/api/checkout-readiness') {
    return handleCheckoutReadiness(request, env);
  }

  if (request.method !== 'POST' || url.pathname !== '/api/create-checkout-session') {
    return null;
  }

  if (!isSalesLegallyReady(env)) return null;

  const rateLimited = await enforceRateLimit(request, env, url.pathname);
  if (rateLimited) return rateLimited;

  return await handleCreateCheckoutSession(request, env);
}

function handleCheckoutReadiness(request, env) {
  const corsHeaders = buildCorsHeaders(request, env);
  const configurationErrors = getConfigurationErrors(env);
  const salesReady = isSalesLegallyReady(env);
  const ready = salesReady && configurationErrors.length === 0;
  return jsonResponse({
    ok: ready,
    provider: 'bank_transfer',
    mode: env.PAYMENT_MODE || 'unconfigured',
    live_ready: ready,
    sales_ready: salesReady,
    order_tracking_ready: hasSupabaseConfiguration(env),
    supported_currencies: [...SUPPORTED_CURRENCIES],
    manual_verification_required: true,
    business_checkout_only: true,
    legal_acceptance_required: true,
    configuration_errors: configurationErrors.length,
  }, 200, corsHeaders);
}

async function handleCheckoutQr(request, url) {
  const planId = url.searchParams.get('plan') || 'business_pro';
  const cycle = url.searchParams.get('cycle') === 'annual' ? 'annual' : 'monthly';
  const currency = normaliseCurrency(url.searchParams.get('currency') || 'HUF');

  if (!PLAN_CATALOG[planId] || !SUPPORTED_CURRENCIES.has(currency)) {
    return jsonResponse({ error: 'Érvénytelen QR-paraméter.' }, 400);
  }

  const checkoutUrl = new URL('/checkout.html', PUBLIC_ORIGIN);
  checkoutUrl.searchParams.set('plan', planId);
  checkoutUrl.searchParams.set('cycle', cycle);
  checkoutUrl.searchParams.set('currency', currency);
  checkoutUrl.searchParams.set('source', 'pricing-qr');

  const qrUrl = new URL('https://quickchart.io/qr');
  qrUrl.searchParams.set('text', checkoutUrl.toString());
  qrUrl.searchParams.set('size', '260');
  qrUrl.searchParams.set('margin', '2');
  qrUrl.searchParams.set('ecLevel', 'M');
  qrUrl.searchParams.set('format', 'png');

  const upstream = await fetch(qrUrl, {
    headers: { Accept: 'image/png' },
    cf: { cacheEverything: true, cacheTtl: 86400 },
  });

  if (!upstream.ok) {
    return jsonResponse({ error: 'A QR-kód jelenleg nem készíthető el.' }, 502);
  }

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'image/png');
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  headers.set('Content-Disposition', 'inline; filename="formatx-checkout-qr.png"');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.delete('Set-Cookie');
  headers.delete('Content-Encoding');
  headers.delete('Content-Length');

  return new Response(upstream.body, { status: 200, headers });
}

async function handleCreateCheckoutSession(request, env) {
  const corsHeaders = buildCorsHeaders(request, env);
  const configurationErrors = getConfigurationErrors(env);
  if (configurationErrors.length > 0) {
    return jsonResponse({
      error: 'A banki fizetés és a tartós rendeléskövetés nincs teljesen konfigurálva.',
      configuration_errors: configurationErrors.length,
    }, 503, corsHeaders);
  }

  const payload = await readJson(request);
  const validationError = validateCheckoutRequest(payload);
  if (validationError) return jsonResponse({ error: validationError }, 400, corsHeaders);

  const plan = PLAN_CATALOG[payload.plan_id];
  const billingCycle = payload.billing_cycle;
  const currency = normaliseCurrency(payload.currency);
  const amount = plan.prices[currency][billingCycle];
  const orderReference = payload.order_reference.trim().toUpperCase();
  const account = getBankAccount(env);
  const paymentUri = buildPaytoUri(account, amount, currency, orderReference);
  const qrPayload = currency === 'EUR'
    ? buildEpcQrPayload(account, amount, orderReference)
    : paymentUri;
  const qrFormat = currency === 'EUR' ? 'epc069-12-v3.1' : 'payto-rfc8905';
  const supabase = createSupabaseClient(env);
  const company = await upsertCompany(supabase, payload);
  const now = new Date().toISOString();

  await supabase.upsert('subscriptions', [{
    company_id: company.id,
    plan_id: plan.id,
    plan_name: plan.name,
    billing_cycle: billingCycle,
    amount_huf: plan.prices.HUF[billingCycle],
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
      pricing_version: 'v100-market-2026-07',
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
      buyer_type: 'business',
      business_buyer_confirmed: true,
      terms_accepted: true,
      privacy_accepted: true,
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
      legal_acceptance_recorded_at: now,
    },
    created_at: now,
    updated_at: now,
  }], 'provider_checkout_session_id');

  return jsonResponse({
    session_id: orderReference,
    order_reference: orderReference,
    payment_provider: 'bank_transfer',
    payment_mode: 'live',
    pricing_version: 'v100-market-2026-07',
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
    order_tracking_ready: true,
    legal_acceptance_recorded: true,
    automatic_renewal: false,
  }, 200, corsHeaders);
}

function isValidOrderReference(value) {
  const reference = String(value || '').trim().toUpperCase();
  return SECURE_ORDER_REFERENCE.test(reference) || LEGACY_ORDER_REFERENCE.test(reference);
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
  if (!isValidOrderReference(payload.order_reference)) return 'Érvénytelen rendelési azonosító.';
  if (payload.business_buyer_confirmed !== true) return 'A vállalkozási vagy szakmai célú vásárlói státusz megerősítése kötelező.';
  if (payload.terms_accepted !== true) return 'A felhasználási feltételek elfogadása kötelező.';
  if (payload.privacy_accepted !== true) return 'Az adatkezelési tájékoztató elfogadása kötelező.';
  return null;
}

function getConfigurationErrors(env) {
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
  if (!env.SUPABASE_URL) errors.push('SUPABASE_URL');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) errors.push('SUPABASE_SERVICE_ROLE_KEY');
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
    'BCD', '001', '1', 'SCT', account.bic, account.holder,
    account.eur_iban, `EUR${Number(amountEur).toFixed(2)}`, '', '',
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
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

function isValidBic(value) {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(String(value || '').trim().toUpperCase());
}

function hasSupabaseConfiguration(env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function createSupabaseClient(env) {
  if (!hasSupabaseConfiguration(env)) {
    throw new Error('A tartós rendelés-adatbázis nincs konfigurálva.');
  }
  const baseUrl = String(env.SUPABASE_URL).replace(/\/$/, '');
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    async select(table, options = {}) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      url.searchParams.set('select', options.select || '*');
      if (options.limit) url.searchParams.set('limit', String(options.limit));
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
  if (!rows[0]) throw new Error('A vásárlói adatok nem rögzíthetők.');
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

async function enforceRateLimit(request, env, pathname) {
  const limiter = env.PUBLIC_API_RATE_LIMIT || env.PROJECT_AI_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') return null;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const data = new TextEncoder().encode(`formatx-public-api|${pathname}|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const key = Array.from(new Uint8Array(digest)).slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const result = await limiter.limit({ key });
  if (result.success) return null;
  return jsonResponse({
    error: 'rate_limited',
    message: 'Túl sok kérés érkezett. Várj egy percet, majd próbáld újra.',
  }, 429, { 'Retry-After': '60' });
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

function jsonResponse(payload, status, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}
