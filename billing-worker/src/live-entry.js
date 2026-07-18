import worker from './index.js';

const LIVE_PRICE_KEYS = [
  'STRIPE_PRICE_ID_BUSINESS_LITE_MONTHLY',
  'STRIPE_PRICE_ID_BUSINESS_LITE_ANNUAL',
  'STRIPE_PRICE_ID_BUSINESS_PRO_MONTHLY',
  'STRIPE_PRICE_ID_BUSINESS_PRO_ANNUAL',
  'STRIPE_PRICE_ID_TECHNICIAN_TEAM_MONTHLY',
  'STRIPE_PRICE_ID_TECHNICIAN_TEAM_ANNUAL',
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const errors = getLiveConfigurationErrors(env);

    if (request.method === 'OPTIONS') {
      return worker.fetch(request, env, ctx);
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return jsonResponse({
        ok: errors.length === 0,
        provider: 'stripe',
        mode: env.PAYMENT_MODE || 'live',
        live_ready: errors.length === 0,
        configuration_errors: errors.length,
      }, 200, corsHeaders(request, env));
    }

    if (request.method === 'POST' && url.pathname === '/api/create-checkout-session' && errors.length > 0) {
      return jsonResponse({
        error: 'Az éles fizetés nincs teljesen konfigurálva.',
      }, 503, corsHeaders(request, env));
    }

    return worker.fetch(request, env, ctx);
  },
};

function getLiveConfigurationErrors(env) {
  const errors = [];

  if (env.PAYMENT_MODE !== 'live') errors.push('PAYMENT_MODE');
  if (env.PAYMENT_PROVIDER !== 'stripe') errors.push('PAYMENT_PROVIDER');
  if (!String(env.PAYMENT_SECRET_KEY || '').startsWith('sk_live_')) errors.push('PAYMENT_SECRET_KEY');
  if (!String(env.PAYMENT_WEBHOOK_SECRET || '').startsWith('whsec_')) errors.push('PAYMENT_WEBHOOK_SECRET');
  if (!isHttpsUrl(env.PAYMENT_SUCCESS_URL)) errors.push('PAYMENT_SUCCESS_URL');
  if (!isHttpsUrl(env.PAYMENT_CANCEL_URL)) errors.push('PAYMENT_CANCEL_URL');
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

  for (const key of LIVE_PRICE_KEYS) {
    if (!String(env[key] || '').startsWith('price_')) errors.push(key);
  }

  return errors;
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function corsHeaders(request, env) {
  const requestOrigin = request.headers.get('Origin') || '';
  const allowedOrigin = env.FRONTEND_URL || '';
  return {
    'Access-Control-Allow-Origin': requestOrigin && requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature,X-Admin-Debug-Token',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}
