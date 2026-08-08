import { describe, expect, it } from 'vitest';
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
  PUBLIC_API_RATE_LIMIT: {
    async limit() {
      return { success: true };
    },
  },
};

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
      ...overrides,
    }),
  });
}

describe('V100 checkout security and pricing', () => {
  it('accepts the secure 96-bit order-reference format and returns canonical Business Pro pricing', async () => {
    const reference = 'FX-20260808-0123456789ABCDEF01234567';
    const response = await handleV100PricingRequest(checkoutRequest(reference), baseEnv);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.order_reference).toBe(reference);
    expect(payload.pricing_version).toBe('v100-market-2026-07');
    expect(payload.amount).toBe(15900);
    expect(payload.currency).toBe('HUF');
    expect(payload.payment_provider).toBe('bank_transfer');
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
  });
});
