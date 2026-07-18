import legacyWorker from './index.js';

const PLAN_CATALOG = {
  business_lite: {
    id: 'business_lite',
    name: 'Business Lite',
    monthlyAmount: 19900,
    annualAmount: 199000,
    maxTechnicians: 1,
    maxDevices: 10,
    licenseSegment: 'BUSINESS',
  },
  business_pro: {
    id: 'business_pro',
    name: 'Business Pro',
    monthlyAmount: 49900,
    annualAmount: 499000,
    maxTechnicians: 3,
    maxDevices: 50,
    licenseSegment: 'BUSINESS',
  },
  technician_team: {
    id: 'technician_team',
    name: 'Technician Team',
    monthlyAmount: 99900,
    annualAmount: 999000,
    maxTechnicians: 5,
    maxDevices: 150,
    licenseSegment: 'TEAM',
  },
};

const BILLING_CYCLES = new Set(['monthly', 'annual']);
const REVOLUT_LINK_KEYS = {
  business_lite: {
    monthly: 'REVOLUT_PAYMENT_LINK_BUSINESS_LITE_MONTHLY',
    annual: 'REVOLUT_PAYMENT_LINK_BUSINESS_LITE_ANNUAL',
  },
  business_pro: {
    monthly: 'REVOLUT_PAYMENT_LINK_BUSINESS_PRO_MONTHLY',
    annual: 'REVOLUT_PAYMENT_LINK_BUSINESS_PRO_ANNUAL',
  },
  technician_team: {
    monthly: 'REVOLUT_PAYMENT_LINK_TECHNICIAN_TEAM_MONTHLY',
    annual: 'REVOLUT_PAYMENT_LINK_TECHNICIAN_TEAM_ANNUAL',
  },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        const errors = getLiveConfigurationErrors(env);
        return jsonResponse({
          ok: errors.length === 0,
          provider: 'revolut_pro',
          mode: env.PAYMENT_MODE || 'live',
          live_ready: errors.length === 0,
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

      if (request.method === 'POST' && url.pathname === '/api/admin/approve-revolut-payment') {
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

async function handleCreateCheckoutSession(request, env, corsHeaders) {
  const errors = getLiveConfigurationErrors(env);
  if (errors.length > 0) {
    return jsonResponse({
      error: 'Az éles Revolut Pro fizetés nincs teljesen konfigurálva.',
    }, 503, corsHeaders);
  }

  const payload = await readJson(request);
  const validationError = validateCheckoutRequest(payload);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400, corsHeaders);
  }

  const plan = PLAN_CATALOG[payload.plan_id];
  const billingCycle = payload.billing_cycle;
  const checkoutUrl = getRevolutPaymentLink(env, plan.id, billingCycle);
  if (!isTrustedRevolutPaymentLink(checkoutUrl)) {
    return jsonResponse({ error: 'Érvénytelen Revolut Pro fizetési link.' }, 503, corsHeaders);
  }

  const supabase = createSupabaseClient(env);
  const company = await upsertCompany(supabase, payload);
  const now = new Date().toISOString();
  const amount = getPlanAmount(plan, billingCycle);
  const orderReference = payload.order_reference.trim();

  await supabase.upsert('subscriptions', [{
    company_id: company.id,
    plan_id: plan.id,
    plan_name: plan.name,
    billing_cycle: billingCycle,
    amount_huf: amount,
    currency: 'HUF',
    max_technicians: plan.maxTechnicians,
    max_devices: plan.maxDevices,
    payment_provider: 'revolut_pro',
    payment_mode: 'live',
    provider_customer_id: null,
    provider_subscription_id: null,
    provider_checkout_session_id: orderReference,
    checkout_url: checkoutUrl,
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
      manual_verification_required: true,
      automatic_renewal: false,
    },
    created_at: now,
    updated_at: now,
  }], 'provider_checkout_session_id');

  return jsonResponse({
    session_id: orderReference,
    order_reference: orderReference,
    checkout_url: checkoutUrl,
    payment_provider: 'revolut_pro',
    payment_mode: 'live',
    amount_huf: amount,
    currency: 'HUF',
    manual_verification_required: true,
    automatic_renewal: false,
  }, 200, corsHeaders);
}

async function handlePaymentConfirmation(request, env, corsHeaders) {
  const errors = getLiveConfigurationErrors(env);
  if (errors.length > 0) {
    return jsonResponse({ error: 'A fizetési visszajelző nincs konfigurálva.' }, 503, corsHeaders);
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

  const eventId = `revolut-pro-confirmation:${payload.order_reference.trim()}`;
  const now = new Date().toISOString();
  await supabase.upsert('payment_events', [{
    provider_event_id: eventId,
    event_type: 'manual_payment_confirmation',
    status: 'awaiting_manual_review',
    payload: {
      ...payload,
      amount_huf: subscription.amount_huf,
      currency: subscription.currency,
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
      revolut_transaction_reference: payload.transfer_reference.trim(),
      payment_reported_at: now,
      contact_channel: payload.contact_channel || 'email',
      customer_message: payload.message?.trim() || null,
    },
    updated_at: now,
  }, {
    id: ['eq', subscription.id],
  });

  return jsonResponse({
    ok: true,
    order_reference: payload.order_reference.trim(),
    status: 'awaiting_manual_review',
    message: 'A fizetési visszajelzés rögzítve lett. A licenc kézi Revolut-ellenőrzés után aktiválható.',
  }, 200, corsHeaders);
}

async function handleSessionStatus(url, env, corsHeaders) {
  const orderReference = url.searchParams.get('session_id') || url.searchParams.get('order_reference');
  if (!orderReference) {
    return jsonResponse({ error: 'A session_id vagy order_reference kötelező.' }, 400, corsHeaders);
  }

  ensureSupabaseConfiguration(env);
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
    subscription_status: subscription.subscription_status,
    payment_status: subscription.payment_status,
    license_active: Boolean(license),
    license_key: license?.license_key ?? null,
    valid_until: license?.valid_until ?? subscription.valid_until ?? null,
    manual_verification_required: !license,
    message: license
      ? 'A Revolut-fizetés ellenőrzése megtörtént, a FormatX licenc aktív.'
      : 'A fizetés vagy annak kézi ellenőrzése még folyamatban van.',
  }, 200, corsHeaders);
}

async function handleApprovePayment(request, env, corsHeaders) {
  const token = request.headers.get('X-Admin-Debug-Token') || '';
  if (!env.ADMIN_DEBUG_TOKEN || !safeEqual(token, env.ADMIN_DEBUG_TOKEN)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  const payload = await readJson(request);
  if (!payload.order_reference?.trim()) {
    return jsonResponse({ error: 'Az order_reference kötelező.' }, 400, corsHeaders);
  }
  if (!payload.revolut_transaction_id?.trim()) {
    return jsonResponse({ error: 'A revolut_transaction_id kötelező.' }, 400, corsHeaders);
  }

  ensureSupabaseConfiguration(env);
  ensureLicenseConfiguration(env);
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
  const providerTransactionId = `revolut:${payload.revolut_transaction_id.trim()}`;
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
      revolut_transaction_id: payload.revolut_transaction_id.trim(),
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
    payment_provider: 'revolut_pro',
    provider_customer_id: null,
    provider_subscription_id: providerTransactionId,
    payment_status: 'paid',
    valid_until: validUntil,
    features: [
      'revolut_pro_payment_link',
      'manual_payment_verification',
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
    verification_source: 'manual_revolut_pro_approval',
    request_ip: request.headers.get('CF-Connecting-IP') || null,
    user_agent: request.headers.get('User-Agent') || 'cloudflare-worker',
    result: 'active',
  });

  await supabase.upsert('payment_events', [{
    provider_event_id: `revolut-pro-approved:${payload.revolut_transaction_id.trim()}`,
    event_type: 'manual_payment_approved',
    status: 'processed',
    payload: {
      order_reference: payload.order_reference.trim(),
      revolut_transaction_id: payload.revolut_transaction_id.trim(),
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
  if (!payload.transfer_reference?.trim()) return 'A Revolut tranzakció hivatkozása kötelező.';
  return null;
}

function getLiveConfigurationErrors(env) {
  const errors = [];

  if (env.PAYMENT_MODE !== 'live') errors.push('PAYMENT_MODE');
  if (env.PAYMENT_PROVIDER !== 'revolut_pro') errors.push('PAYMENT_PROVIDER');
  if (env.REVOLUT_PRO_ACCOUNT_APPROVED !== 'true') errors.push('REVOLUT_PRO_ACCOUNT_APPROVED');
  if (!isHttpsUrl(env.FRONTEND_URL)) errors.push('FRONTEND_URL');
  if (!isHttpsUrl(env.WORKER_BASE_URL)) errors.push('WORKER_BASE_URL');
  if (!isHttpsUrl(env.SUPABASE_URL)) errors.push('SUPABASE_URL');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) errors.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!env.SUPPORT_EMAIL || !String(env.SUPPORT_EMAIL).includes('@')) errors.push('SUPPORT_EMAIL');
  if (env.LEGAL_DOCUMENTS_APPROVED !== 'true') errors.push('LEGAL_DOCUMENTS_APPROVED');
  if (!env.MERCHANT_LEGAL_NAME) errors.push('MERCHANT_LEGAL_NAME');
  if (!env.MERCHANT_ADDRESS) errors.push('MERCHANT_ADDRESS');
  if (!env.MERCHANT_TAX_ID) errors.push('MERCHANT_TAX_ID');
  if (!isHttpsUrl(env.TERMS_URL)) errors.push('TERMS_URL');
  if (!isHttpsUrl(env.PRIVACY_URL)) errors.push('PRIVACY_URL');
  if (!env.LICENSE_SECRET || String(env.LICENSE_SECRET).length < 32 || env.LICENSE_SECRET === 'change-me') errors.push('LICENSE_SECRET');
  if (!env.ADMIN_DEBUG_TOKEN || String(env.ADMIN_DEBUG_TOKEN).length < 24) errors.push('ADMIN_DEBUG_TOKEN');

  for (const planLinks of Object.values(REVOLUT_LINK_KEYS)) {
    for (const key of Object.values(planLinks)) {
      if (!isTrustedRevolutPaymentLink(env[key])) errors.push(key);
    }
  }

  return errors;
}

function getRevolutPaymentLink(env, planId, billingCycle) {
  const key = REVOLUT_LINK_KEYS[planId]?.[billingCycle];
  return key ? String(env[key] || '').trim() : '';
}

function isTrustedRevolutPaymentLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname === 'checkout.revolut.com'
      && url.pathname.startsWith('/payment-link/');
  } catch (_) {
    return false;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function getPlanAmount(plan, billingCycle) {
  return billingCycle === 'annual' ? plan.annualAmount : plan.monthlyAmount;
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

function ensureSupabaseConfiguration(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('A Supabase kapcsolat nincs konfigurálva.');
  }
}

function ensureLicenseConfiguration(env) {
  if (!env.LICENSE_SECRET || String(env.LICENSE_SECRET).length < 32) {
    throw new Error('A LICENSE_SECRET nincs biztonságosan konfigurálva.');
  }
}

function createSupabaseClient(env) {
  ensureSupabaseConfiguration(env);
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
