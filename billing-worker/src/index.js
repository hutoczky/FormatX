const PLAN_CATALOG = {
  business_lite: {
    id: 'business_lite',
    name: 'Business Lite',
    monthlyAmount: 19900,
    annualAmount: 199000,
    maxTechnicians: 1,
    maxDevices: 10,
    licenseSegment: 'BUSINESS',
    description: 'FormatX Suite Pro Business Lite',
  },
  business_pro: {
    id: 'business_pro',
    name: 'Business Pro',
    monthlyAmount: 49900,
    annualAmount: 499000,
    maxTechnicians: 3,
    maxDevices: 50,
    licenseSegment: 'BUSINESS',
    description: 'FormatX Suite Pro Business Pro',
  },
  technician_team: {
    id: 'technician_team',
    name: 'Technician Team',
    monthlyAmount: 99900,
    annualAmount: 999000,
    maxTechnicians: 5,
    maxDevices: 150,
    licenseSegment: 'TEAM',
    description: 'FormatX Suite Pro Technician Team',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyAmount: 199000,
    annualAmount: 1990000,
    maxTechnicians: 0,
    maxDevices: 0,
    requiresQuote: true,
    licenseSegment: 'ENTERPRISE',
    description: 'FormatX Suite Pro Enterprise',
  },
};

const BILLING_CYCLES = new Set(['monthly', 'annual']);

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const supabase = createSupabaseClient(env);
      const provider = createPaymentProvider(env, supabase);

      if (request.method === 'GET' && url.pathname === '/api/health') {
        return jsonResponse({ ok: true, provider: env.PAYMENT_PROVIDER ?? 'stripe', mode: env.PAYMENT_MODE ?? 'test' }, 200, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await handleCreateCheckoutSession(request, env, supabase, provider, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/webhook') {
        return await handleWebhook(request, env, supabase, provider, corsHeaders);
      }

      if (request.method === 'GET' && url.pathname === '/api/session-status') {
        return await handleSessionStatus(url, supabase, corsHeaders);
      }

      if (request.method === 'POST' && url.pathname === '/api/license/verify') {
        return await handleLicenseVerify(request, supabase, corsHeaders);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/debug') {
        return await handleAdminDebug(request, env, supabase, corsHeaders);
      }

      return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
    } catch (error) {
      return jsonResponse({ error: error.message ?? 'Unexpected error' }, 500, corsHeaders);
    }
  },
};

async function handleCreateCheckoutSession(request, env, supabase, provider, corsHeaders) {
  const payload = await request.json();
  const validationError = validateCheckoutRequest(payload);
  if (validationError) {
    return jsonResponse({ error: validationError }, 400, corsHeaders);
  }

  const plan = PLAN_CATALOG[payload.plan_id];
  if (!plan) {
    return jsonResponse({ error: 'Ismeretlen csomag.' }, 400, corsHeaders);
  }

  if (plan.requiresQuote) {
    return jsonResponse({ error: 'Az Enterprise csomaghoz egyedi ajánlat szükséges.', quote_required: true, quote_url: '/scifi-ui/support.html' }, 400, corsHeaders);
  }

  const readinessErrors = getLiveReadinessErrors(env);
  if ((env.PAYMENT_MODE ?? 'test') === 'live' && readinessErrors.length > 0) {
    return jsonResponse({ error: 'Live payment is not fully configured', details: readinessErrors }, 503, corsHeaders);
  }

  ensureRuntimeConfiguration(env);

  const company = await upsertCompany(supabase, payload);
  const checkoutSession = await provider.createCheckoutSession(payload, plan);
  const now = new Date().toISOString();

  await supabase.upsert('subscriptions', [
    {
      company_id: company.id,
      plan_id: plan.id,
      plan_name: plan.name,
      billing_cycle: payload.billing_cycle,
      amount_huf: getPlanAmount(plan, payload.billing_cycle),
      currency: 'HUF',
      max_technicians: plan.maxTechnicians,
      max_devices: plan.maxDevices,
      payment_provider: env.PAYMENT_PROVIDER ?? 'stripe',
      payment_mode: env.PAYMENT_MODE ?? 'test',
      provider_checkout_session_id: checkoutSession.sessionId,
      checkout_url: checkoutSession.checkoutUrl,
      subscription_status: 'pending',
      payment_status: 'pending',
      metadata: {
        company_name: payload.company_name,
        contact_name: payload.contact_name,
        contact_email: payload.email,
        billing_address: payload.billing_address,
        tax_number: payload.tax_number || null,
      },
      created_at: now,
      updated_at: now,
    },
  ], 'provider_checkout_session_id');

  return jsonResponse({
    session_id: checkoutSession.sessionId,
    checkout_url: checkoutSession.checkoutUrl,
    payment_provider: env.PAYMENT_PROVIDER ?? 'stripe',
    payment_mode: env.PAYMENT_MODE ?? 'test',
  }, 200, corsHeaders);
}

async function handleWebhook(request, env, supabase, provider, corsHeaders) {
  ensureRuntimeConfiguration(env);
  const payload = await request.text();
  const signatureHeader = request.headers.get('Stripe-Signature') || '';

  if (!(await provider.verifyWebhook(payload, signatureHeader))) {
    return jsonResponse({ error: 'Érvénytelen webhook aláírás.' }, 400, corsHeaders);
  }

  const event = JSON.parse(payload);
  if (!event.id || !event.type) {
    return jsonResponse({ error: 'Hiányzó webhook metaadat.' }, 400, corsHeaders);
  }

  const existing = await supabase.selectSingle('payment_events', {
    provider_event_id: ['eq', event.id],
  });
  if (existing) {
    return jsonResponse({ ok: true, duplicate: true }, 200, corsHeaders);
  }

  await supabase.insert('payment_events', {
    provider_event_id: event.id,
    event_type: event.type,
    status: 'received',
    payload: event,
    processed_at: new Date().toISOString(),
  });

  try {
    if (['checkout.session.completed', 'invoice.paid'].includes(event.type)) {
      await provider.handlePaymentSuccess(event);
    }

    if (['checkout.session.expired', 'invoice.payment_failed', 'customer.subscription.deleted'].includes(event.type)) {
      await provider.handlePaymentFailure(event);
    }

    await supabase.update('payment_events', {
      status: 'processed',
      processed_at: new Date().toISOString(),
    }, {
      provider_event_id: ['eq', event.id],
    });

    return jsonResponse({ ok: true }, 200, corsHeaders);
  } catch (error) {
    await supabase.update('payment_events', {
      status: `failed: ${error.message ?? 'unknown error'}`,
      processed_at: new Date().toISOString(),
    }, {
      provider_event_id: ['eq', event.id],
    });
    throw error;
  }
}

async function handleSessionStatus(url, supabase, corsHeaders) {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return jsonResponse({ error: 'A session_id kötelező.' }, 400, corsHeaders);
  }

  const subscription = await supabase.selectSingle('subscriptions', {
    provider_checkout_session_id: ['eq', sessionId],
  });

  if (!subscription) {
    return jsonResponse({ error: 'A megadott session nem található.' }, 404, corsHeaders);
  }

  const license = await supabase.selectSingle('licenses', {
    subscription_id: ['eq', subscription.id],
  });

  const message = license
    ? 'Köszönjük az előfizetést. A FormatX Suite Pro licenc aktív.'
    : subscription.payment_status === 'paid'
      ? 'A fizetés feldolgozás alatt van. A licenc aktiválása néhány másodpercet vehet igénybe.'
      : ['failed', 'canceled'].includes(subscription.payment_status) || ['past_due', 'canceled', 'expired'].includes(subscription.subscription_status)
        ? 'A fizetés nem sikerült vagy megszakadt. Az előfizetés nem aktiválódott.'
        : 'A fizetés feldolgozás alatt van. A licenc aktiválása néhány másodpercet vehet igénybe.';

  return jsonResponse({
    session_id: sessionId,
    plan_id: subscription.plan_id,
    plan_name: subscription.plan_name,
    billing_cycle: subscription.billing_cycle,
    subscription_status: subscription.subscription_status,
    payment_status: subscription.payment_status,
    license_active: Boolean(license),
    license_key: license?.license_key ?? null,
    company_name: subscription.metadata?.company_name ?? '',
    contact_email: subscription.metadata?.contact_email ?? '',
    valid_until: license?.valid_until ?? subscription.valid_until ?? null,
    message,
  }, 200, corsHeaders);
}

async function handleLicenseVerify(request, supabase, corsHeaders) {
  const payload = await request.json();
  if (!payload.license_key) {
    return jsonResponse({ error: 'A license_key kötelező.' }, 400, corsHeaders);
  }

  const license = await supabase.selectSingle('licenses', {
    license_key: ['eq', payload.license_key],
  });

  const requestIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  if (!license) {
    await supabase.insert('license_activations', {
      license_id: null,
      verification_source: 'license_verify_api',
      request_ip: requestIp,
      user_agent: userAgent,
      result: 'not_found',
    });
    return jsonResponse({ valid: false, error: 'A licenc nem található.' }, 404, corsHeaders);
  }

  const isActive = license.license_status === 'active' && new Date(license.valid_until).getTime() > Date.now();
  await supabase.insert('license_activations', {
    license_id: license.id,
    verification_source: 'license_verify_api',
    request_ip: requestIp,
    user_agent: userAgent,
    result: isActive ? 'active' : 'inactive',
  });

  return jsonResponse({
    valid: isActive,
    license_key: license.license_key,
    plan_id: license.plan_id,
    billing_cycle: license.billing_cycle,
    max_technicians: license.max_technicians,
    max_devices: license.max_devices,
    valid_until: license.valid_until,
  }, 200, corsHeaders);
}

async function handleAdminDebug(request, env, supabase, corsHeaders) {
  const token = request.headers.get('X-Admin-Debug-Token') || '';
  if (!env.ADMIN_DEBUG_TOKEN || token !== env.ADMIN_DEBUG_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  const [activeSubscriptions, createdLicenses, paymentFailures] = await Promise.all([
    supabase.count('subscriptions', { subscription_status: ['eq', 'active'] }),
    supabase.count('licenses'),
    supabase.count('payment_events', { status: ['like', 'failed%'] }),
  ]);

  const recentEvents = await supabase.select('payment_events', {
    limit: 10,
    order: 'processed_at.desc',
  });

  return jsonResponse({
    payment_mode: env.PAYMENT_MODE ?? 'test',
    provider: env.PAYMENT_PROVIDER ?? 'stripe',
    live_ready: getLiveReadinessErrors(env).length === 0,
    live_readiness_errors: getLiveReadinessErrors(env),
    active_subscriptions: activeSubscriptions,
    created_licenses: createdLicenses,
    payment_failures: paymentFailures,
    recent_events: recentEvents,
  }, 200, corsHeaders);
}

function createPaymentProvider(env, supabase) {
  const provider = (env.PAYMENT_PROVIDER ?? 'stripe').toLowerCase();
  if (provider === 'stripe') {
    return new StripePaymentProvider(env, supabase);
  }

  throw new Error(`Unsupported payment provider: ${provider}`);
}

class StripePaymentProvider {
  constructor(env, supabase) {
    this.env = env;
    this.supabase = supabase;
  }

  async createCheckoutSession(payload, plan) {
    const form = new URLSearchParams();
    form.set('mode', 'subscription');
    form.set('success_url', appendQuery(this.env.PAYMENT_SUCCESS_URL, 'session_id', '{CHECKOUT_SESSION_ID}'));
    form.set('cancel_url', appendQuery(this.env.PAYMENT_CANCEL_URL, 'plan_id', plan.id));
    form.set('billing_address_collection', 'required');
    form.set('customer_email', payload.email.trim());
    form.set('allow_promotion_codes', 'false');
    form.set('metadata[plan_id]', plan.id);
    form.set('metadata[billing_cycle]', payload.billing_cycle);
    form.set('metadata[company_name]', payload.company_name.trim());
    form.set('metadata[contact_name]', payload.contact_name.trim());
    form.set('metadata[contact_email]', payload.email.trim());
    form.set('metadata[billing_address]', payload.billing_address.trim());
    form.set('subscription_data[metadata][plan_id]', plan.id);
    form.set('subscription_data[metadata][billing_cycle]', payload.billing_cycle);
    form.set('subscription_data[metadata][company_name]', payload.company_name.trim());
    form.set('subscription_data[metadata][contact_email]', payload.email.trim());
    if (payload.tax_number) {
      form.set('metadata[tax_number]', payload.tax_number.trim());
      form.set('subscription_data[metadata][tax_number]', payload.tax_number.trim());
    }

    const configuredPriceId = getStripePriceId(this.env, plan.id, payload.billing_cycle);
    if (configuredPriceId) {
      form.set('line_items[0][price]', configuredPriceId);
    } else if ((this.env.PAYMENT_MODE ?? 'test') === 'live') {
      throw new Error('Live payment is not fully configured');
    } else {
      form.set('line_items[0][price_data][currency]', 'huf');
      form.set('line_items[0][price_data][unit_amount]', String(getPlanAmount(plan, payload.billing_cycle)));
      form.set('line_items[0][price_data][product_data][name]', plan.name);
      form.set('line_items[0][price_data][product_data][description]', plan.description);
      form.set('line_items[0][price_data][recurring][interval]', payload.billing_cycle === 'annual' ? 'year' : 'month');
    }
    form.set('line_items[0][quantity]', '1');

    const response = await stripeFetch('/checkout/sessions', this.env, {
      method: 'POST',
      body: form,
    });

    return {
      sessionId: response.id,
      checkoutUrl: response.url,
    };
  }

  async verifyWebhook(payload, signatureHeader) {
    if (!signatureHeader || !this.env.PAYMENT_WEBHOOK_SECRET) {
      return false;
    }

    const pieces = Object.fromEntries(signatureHeader.split(',').map((part) => part.split('=')));
    if (!pieces.t || !pieces.v1) {
      return false;
    }

    const timestamp = Number(pieces.t);
    if (Number.isNaN(timestamp) || Date.now() - timestamp * 1000 > 5 * 60 * 1000) {
      return false;
    }

    const signedPayload = `${pieces.t}.${payload}`;
    const expected = await sha256HmacHex(this.env.PAYMENT_WEBHOOK_SECRET, signedPayload);
    return safeEqual(expected, pieces.v1);
  }

  async handlePaymentSuccess(event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      const subscription = await this.supabase.selectSingle('subscriptions', {
        provider_checkout_session_id: ['eq', session.id],
      });
      if (!subscription) return;

      await this.supabase.update('subscriptions', {
        provider_customer_id: session.customer ?? null,
        provider_subscription_id: session.subscription ?? null,
        subscription_status: session.payment_status === 'paid' ? 'active' : 'processing',
        payment_status: session.payment_status ?? 'pending',
        valid_until: computeValidUntil(subscription.billing_cycle),
        updated_at: new Date().toISOString(),
        last_error: null,
      }, {
        id: ['eq', subscription.id],
      });

      if (session.payment_status === 'paid') {
        await activateLicense(this.supabase, this.env, {
          ...subscription,
          provider_customer_id: session.customer ?? null,
          provider_subscription_id: session.subscription ?? null,
        });
      }
      return;
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data?.object;
      const subscription = await this.supabase.selectSingle('subscriptions', {
        provider_subscription_id: ['eq', invoice.subscription],
      });
      if (!subscription) return;

      await this.supabase.update('subscriptions', {
        provider_customer_id: invoice.customer ?? subscription.provider_customer_id ?? null,
        subscription_status: 'active',
        payment_status: 'paid',
        valid_until: computeValidUntil(subscription.billing_cycle),
        updated_at: new Date().toISOString(),
        last_error: null,
      }, {
        id: ['eq', subscription.id],
      });

      await activateLicense(this.supabase, this.env, {
        ...subscription,
        provider_customer_id: invoice.customer ?? subscription.provider_customer_id ?? null,
      });
    }
  }

  async handlePaymentFailure(event) {
    if (event.type === 'checkout.session.expired') {
      const session = event.data?.object;
      await this.supabase.update('subscriptions', {
        subscription_status: 'expired',
        payment_status: 'failed',
        last_error: 'A checkout session lejárt.',
        updated_at: new Date().toISOString(),
      }, {
        provider_checkout_session_id: ['eq', session.id],
      });
      return;
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data?.object;
      await this.supabase.update('subscriptions', {
        subscription_status: 'past_due',
        payment_status: 'failed',
        last_error: 'A provider sikertelen fizetést jelzett.',
        updated_at: new Date().toISOString(),
      }, {
        provider_subscription_id: ['eq', invoice.subscription],
      });
      await this.supabase.update('licenses', {
        license_status: 'suspended',
        payment_status: 'failed',
      }, {
        provider_subscription_id: ['eq', invoice.subscription],
      });
      return;
    }

    if (event.type === 'customer.subscription.deleted') {
      const providerSubscriptionId = event.data?.object?.id;
      await this.supabase.update('subscriptions', {
        subscription_status: 'canceled',
        payment_status: 'canceled',
        last_error: 'Az előfizetés megszűnt a providernél.',
        updated_at: new Date().toISOString(),
      }, {
        provider_subscription_id: ['eq', providerSubscriptionId],
      });
      await this.supabase.update('licenses', {
        license_status: 'canceled',
        payment_status: 'canceled',
      }, {
        provider_subscription_id: ['eq', providerSubscriptionId],
      });
    }
  }
}

async function activateLicense(supabase, env, subscription) {
  const plan = PLAN_CATALOG[subscription.plan_id];
  if (!plan) {
    throw new Error(`Missing plan catalog for ${subscription.plan_id}`);
  }

  const licenseKey = await generateLicenseKey(env, subscription.provider_checkout_session_id, plan.licenseSegment, subscription.metadata?.contact_email ?? '');
  const validUntil = computeValidUntil(subscription.billing_cycle);
  const existingLicense = await supabase.selectSingle('licenses', {
    subscription_id: ['eq', subscription.id],
  });

  const licensePayload = {
    subscription_id: subscription.id,
    license_key: licenseKey,
    license_status: 'active',
    company_name: subscription.metadata?.company_name ?? '',
    contact_email: subscription.metadata?.contact_email ?? '',
    plan_id: subscription.plan_id,
    billing_cycle: subscription.billing_cycle,
    max_technicians: subscription.max_technicians,
    max_devices: subscription.max_devices,
    payment_provider: subscription.payment_provider,
    provider_customer_id: subscription.provider_customer_id ?? null,
    provider_subscription_id: subscription.provider_subscription_id ?? null,
    payment_status: 'paid',
    valid_until: validUntil,
    features: [
      'secure_checkout',
      'webhook_activated',
      `plan:${subscription.plan_id}`,
      `billing_cycle:${subscription.billing_cycle}`,
      `max_technicians:${subscription.max_technicians}`,
      `max_devices:${subscription.max_devices}`,
    ],
  };

  await supabase.upsert('licenses', [licensePayload], 'subscription_id');
  const insertedLicense = existingLicense || await supabase.selectSingle('licenses', {
    subscription_id: ['eq', subscription.id],
  });

  await supabase.insert('license_activations', {
    license_id: insertedLicense?.id ?? null,
    verification_source: 'webhook_activation',
    request_ip: null,
    user_agent: 'cloudflare-worker',
    result: 'active',
  });
}

function createSupabaseClient(env) {
  const baseUrl = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

  return {
    async select(table, options = {}) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      url.searchParams.set('select', options.select || '*');
      if (options.limit) url.searchParams.set('limit', String(options.limit));
      if (options.order) url.searchParams.set('order', options.order);
      if (options.filters) applyFilters(url, options.filters);
      const response = await supabaseFetch(url, serviceRoleKey, { headers: { Prefer: 'return=representation' } });
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
      if (onConflict) {
        url.searchParams.set('on_conflict', onConflict);
      }
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
    async count(table, filters = {}) {
      const url = new URL(`${baseUrl}/rest/v1/${table}`);
      url.searchParams.set('select', 'id');
      applyFilters(url, filters);
      const response = await supabaseFetch(url, serviceRoleKey, {
        method: 'HEAD',
        headers: { Prefer: 'count=exact' },
      });
      const contentRange = response.headers.get('content-range') || '0-0/0';
      return Number(contentRange.split('/')[1] || 0);
    },
  };
}

async function upsertCompany(supabase, payload) {
  const rows = await supabase.upsert('companies', [
    {
      company_name: payload.company_name.trim(),
      contact_name: payload.contact_name.trim(),
      contact_email: payload.email.trim(),
      billing_address: payload.billing_address.trim(),
      tax_number: payload.tax_number?.trim() || null,
      updated_at: new Date().toISOString(),
    },
  ], 'company_name,contact_email');

  return rows[0];
}

function validateCheckoutRequest(payload) {
  if (!payload || typeof payload !== 'object') return 'Hiányzó kérés törzs.';
  if (!payload.plan_id || typeof payload.plan_id !== 'string') return 'A plan_id kötelező.';
  if (!payload.billing_cycle || !BILLING_CYCLES.has(payload.billing_cycle)) return 'Érvénytelen billing_cycle.';
  if (!payload.company_name?.trim()) return 'A cégnév kötelező.';
  if (!payload.contact_name?.trim()) return 'A kapcsolattartó neve kötelező.';
  if (!payload.email?.includes('@')) return 'Érvényes email cím szükséges.';
  if (!payload.billing_address?.trim()) return 'A számlázási cím kötelező.';
  return null;
}

function ensureRuntimeConfiguration(env) {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'PAYMENT_SECRET_KEY', 'PAYMENT_WEBHOOK_SECRET', 'PAYMENT_SUCCESS_URL', 'PAYMENT_CANCEL_URL', 'LICENSE_SECRET'];
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required configuration: ${key}`);
    }
  }
}

function getLiveReadinessErrors(env) {
  const errors = [];
  if ((env.PAYMENT_MODE ?? 'test') !== 'live') {
    return errors;
  }

  if (!env.PAYMENT_SECRET_KEY) errors.push('PAYMENT_SECRET_KEY hiányzik.');
  if (!env.PAYMENT_WEBHOOK_SECRET) errors.push('PAYMENT_WEBHOOK_SECRET hiányzik.');
  if (!env.PAYMENT_SUCCESS_URL || !env.PAYMENT_SUCCESS_URL.startsWith('https://')) errors.push('PAYMENT_SUCCESS_URL éles HTTPS URL kell legyen.');
  if (!env.PAYMENT_CANCEL_URL || !env.PAYMENT_CANCEL_URL.startsWith('https://')) errors.push('PAYMENT_CANCEL_URL éles HTTPS URL kell legyen.');
  if (!env.FRONTEND_URL || !env.FRONTEND_URL.startsWith('https://')) errors.push('FRONTEND_URL éles HTTPS URL kell legyen.');
  if (!env.WORKER_BASE_URL || !env.WORKER_BASE_URL.startsWith('https://')) errors.push('WORKER_BASE_URL éles HTTPS URL kell legyen.');
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) errors.push('Supabase kapcsolat hiányzik.');
  if (!env.LICENSE_SECRET) errors.push('LICENSE_SECRET hiányzik.');
  if (!env.SUPPORT_EMAIL) errors.push('SUPPORT_EMAIL hiányzik.');
  if (!env.TERMS_URL) errors.push('TERMS_URL hiányzik.');
  if (!env.PRIVACY_URL) errors.push('PRIVACY_URL hiányzik.');
  for (const key of [
    'STRIPE_PRICE_ID_BUSINESS_LITE_MONTHLY',
    'STRIPE_PRICE_ID_BUSINESS_LITE_ANNUAL',
    'STRIPE_PRICE_ID_BUSINESS_PRO_MONTHLY',
    'STRIPE_PRICE_ID_BUSINESS_PRO_ANNUAL',
    'STRIPE_PRICE_ID_TECHNICIAN_TEAM_MONTHLY',
    'STRIPE_PRICE_ID_TECHNICIAN_TEAM_ANNUAL',
  ]) {
    if (!env[key]) errors.push(`${key} hiányzik.`);
  }
  return errors;
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get('Origin');
  const allowedOrigin = env.FRONTEND_URL || '';
  const origin = requestOrigin && allowedOrigin && requestOrigin === allowedOrigin ? requestOrigin : (allowedOrigin || '*');
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature,X-Admin-Debug-Token',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(payload, status, corsHeaders) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
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

async function stripeFetch(path, env, init = {}) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.PAYMENT_SECRET_KEY}`,
      ...(init.body instanceof URLSearchParams ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(init.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Stripe API hiba: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload;
}

function getStripePriceId(env, planId, billingCycle) {
  const suffix = billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY';
  return env[`STRIPE_PRICE_ID_${planId.toUpperCase()}_${suffix}`];
}

function getPlanAmount(plan, billingCycle) {
  return billingCycle === 'annual' ? plan.annualAmount : plan.monthlyAmount;
}

async function generateLicenseKey(env, sessionId, planSegment, email) {
  const digest = await sha256HmacHex(env.LICENSE_SECRET, `${sessionId}|${email}`);
  const chunks = [digest.slice(0, 4), digest.slice(4, 8), digest.slice(8, 12)].map((part) => part.toUpperCase());
  return `FXPRO-${planSegment}-${chunks.join('-')}`;
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

function appendQuery(url, key, value) {
  const next = new URL(url);
  next.searchParams.set(key, value);
  return next.toString();
}

async function sha256HmacHex(secret, message) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((key) => crypto.subtle.sign('HMAC', key, msgData))
    .then((signature) => [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join(''));
}

function safeEqual(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
