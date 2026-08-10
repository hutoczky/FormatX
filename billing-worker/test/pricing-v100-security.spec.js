import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleV100PricingRequest } from '../src/pricing-v100-api.js';

const baseEnv = {
  LEGAL_DOCUMENTS_APPROVED: 'true',
  MERCHANT_LEGAL_NAME: 'FormatX Test Merchant',
  MERCHANT_ADDRESS: 'Test address',
  MERCHANT_TAX_ID: 'TEST-TAX-ID',
  INVOICE_PROVIDER_NAME: 'Test invoice provider',
  SUPPORT_EMAIL: 'support@example.test',
  PAYMENT_MODE: 'live',
  PAYMENT_PROVIDER: 'bank_transfer',
  PAYMENT_ACCOUNT_CONFIRMED: 'true',
  BANK_ACCOUNT_HOLDER: 'FormatX Test Merchant',
  BANK_LOCAL_HUF_ACCOUNT: '30200014-19913410-90015751',
  BANK_IBAN_HUF: 'HU06302000141991341090015751',
  BANK_IBAN_EUR: 'HU06302000141991341090015751',
  BANK_BIC: 'REVOHUHB',
  BANK_CORRESPONDENT_BIC: 'CHASDEFX',
  SUPABASE_URL: 'https://supabase.example.test',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  PUBLIC_API_RATE_LIMIT: {
    async limit() {
      return { success: true };
    },
  },
};

let persistedSubscriptions;

function checkoutRequest(orderReference, overrides = {}) {
  return new Request('https://www.formatxsuite.com/api/create-checkout-session', {
    method: 'POST',
    headers: {
      Origin: 'https://www.formatxsuite.com',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: 'business_pro',
      billing_cycle: 'monthly',
      currency: 'HUF',
      company_name: 'FormatX Test Customer',
      contact_name: 'Test Customer',
      email: 'customer@example.test',
      billing_address: 'Test billing address',
      order_reference: orderReference,
      payment_method: 'direct_bank_transfer_qr',
      business_buyer_confirmed: true,
      terms_accepted: true,
      privacy_accepted: true,
      ...overrides,
    }),
  });
}

function readinessRequest() {
  return new Request('https://www.formatxsuite.com/api/checkout-readiness', {
    method: 'GET',
    headers: {
      Origin: 'https://www.formatxsuite.com',
      Accept: 'application/json',
    },
  });
}

beforeEach(() => {
  persistedSubscriptions = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.hostname !== 'supabase.example.test') {
      throw new Error(`Unexpected external request in test: ${url}`);
    }
    if (url.pathname.endsWith('/rest/v1/companies')) {
      return new Response(JSON.stringify([{ id: 'company-1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.pathname.endsWith('/rest/v1/subscriptions')) {
      const rows = JSON.parse(String(init.body || '[]'));
      persistedSubscriptions.push(...rows);
      return new Response(JSON.stringify([{ id: 'subscription-1' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw new Error(`Unexpected Supabase table in test: ${url.pathname}`);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('V100 checkout security and pricing', () => {
  it('reports checkout ready only when legal, payment and durable order storage are all configured', async () => {
    const response = await handleV100PricingRequest(readinessRequest(), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.live_ready).toBe(true);
    expect(payload.sales_ready).toBe(true);
    expect(payload.order_tracking_ready).toBe(true);
    expect(payload.business_checkout_only).toBe(true);
    expect(payload.legal_acceptance_required).toBe(true);
    expect(payload.configuration_errors).toBe(0);
  });

  it('reports checkout unsafe when durable order storage is missing', async () => {
    const env = { ...baseEnv };
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await handleV100PricingRequest(readinessRequest(), env);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(false);
    expect(payload.live_ready).toBe(false);
    expect(payload.sales_ready).toBe(true);
    expect(payload.order_tracking_ready).toBe(false);
    expect(payload.configuration_errors).toBeGreaterThanOrEqual(2);
  });

  it('refuses to create payment instructions when durable order storage is missing', async () => {
    const env = { ...baseEnv };
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;
    const reference = 'FX-20260808-0123456789ABCDEF01234567';

    const response = await handleV100PricingRequest(checkoutRequest(reference), env);
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toMatch(/rendeléskövetés/i);
  });

  it('accepts the secure 96-bit order-reference format, stores legal acceptance and returns canonical pricing', async () => {
    const reference = 'FX-20260808-0123456789ABCDEF01234567';
    const response = await handleV100PricingRequest(checkoutRequest(reference), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.order_reference).toBe(reference);
    expect(payload.pricing_version).toBe('v100-market-2026-07');
    expect(payload.amount).toBe(15900);
    expect(payload.currency).toBe('HUF');
    expect(payload.payment_provider).toBe('bank_transfer');
    expect(payload.order_tracking_ready).toBe(true);
    expect(payload.legal_acceptance_recorded).toBe(true);

    expect(persistedSubscriptions).toHaveLength(1);
    const metadata = persistedSubscriptions[0].metadata;
    expect(metadata.buyer_type).toBe('business');
    expect(metadata.business_buyer_confirmed).toBe(true);
    expect(metadata.terms_accepted).toBe(true);
    expect(metadata.privacy_accepted).toBe(true);
    expect(metadata.terms_version).toBe('2026-08-07');
    expect(metadata.privacy_version).toBe('2026-08-10');
    expect(metadata.legal_acceptance_recorded_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it.each([
    ['business_buyer_confirmed', false, /vállalkozási|szakmai/i],
    ['terms_accepted', false, /felhasználási feltételek/i],
    ['privacy_accepted', false, /adatkezelési/i],
  ])('rejects checkout when %s is not confirmed', async (field, value, expected) => {
    const reference = 'FX-20260808-ABCDEF0123456789ABCDEF01';
    const response = await handleV100PricingRequest(checkoutRequest(reference, { [field]: value }), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(expected);
    expect(persistedSubscriptions).toHaveLength(0);
  });

  it('keeps already-issued short legacy order references compatible', async () => {
    const reference = 'FX-20260808-A1B2C3';
    const response = await handleV100PricingRequest(checkoutRequest(reference), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.order_reference).toBe(reference);
    expect(payload.amount).toBe(15900);
  });

  it.each([
    'FX-20260808-TOO-LONG-LEGACY',
    'FX-20260808-0123456789ABCDEG01234567',
    'FX-20260808-123456789',
    'INVALID',
  ])('rejects malformed order reference %s', async (reference) => {
    const response = await handleV100PricingRequest(checkoutRequest(reference), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/rendelési azonosító/i);
  });

  it('uses the canonical annual Technician Team price', async () => {
    const reference = 'FX-20260808-FEDCBA9876543210FEDCBA98';
    const response = await handleV100PricingRequest(checkoutRequest(reference, {
      plan_id: 'technician_team',
      billing_cycle: 'annual',
    }), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.amount).toBe(299000);
    expect(payload.pricing_version).toBe('v100-market-2026-07');
    expect(payload.order_tracking_ready).toBe(true);
  });
});
