import { describe, expect, it } from 'vitest';
import productionWorker, { concealUpstreamText } from '../src/production-with-license.js';
import { redactLegacySessionStatus } from '../src/production-feedback-entry.js';

describe('production order-status and Android beta security', () => {
  it('rate-limits the public order-status endpoint before database lookup', async () => {
    let limiterCalls = 0;
    const response = await productionWorker.fetch(
      new Request('https://www.formatxsuite.com/api/session-status?session_id=FX-20260808-0123456789ABCDEF01234567'),
      {
        PUBLIC_API_RATE_LIMIT: {
          async limit() {
            limiterCalls += 1;
            return { success: false };
          },
        },
      },
      {},
    );
    const payload = await response.json();

    expect(limiterCalls).toBe(1);
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(payload.error).toBe('rate_limited');
  });

  it('redacts licence keys when a legacy short order reference is used', async () => {
    const request = new Request('https://www.formatxsuite.com/api/session-status?session_id=FX-20260808-A1B2C3');
    const response = new Response(JSON.stringify({
      session_id: 'FX-20260808-A1B2C3',
      license_active: true,
      license_key: 'FXPRO-BUSINESS-ABCD-EF01-2345',
      message: 'active',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });

    const protectedResponse = await redactLegacySessionStatus(request, new URL(request.url), response);
    const payload = await protectedResponse.json();

    expect(payload.license_active).toBe(true);
    expect(payload.license_key).toBeNull();
    expect(payload.legacy_reference).toBe(true);
    expect(payload.license_key_available).toBe(false);
    expect(payload.message).toMatch(/biztonsági okból/i);
  });

  it('keeps licence-key delivery unchanged for secure 96-bit order references', async () => {
    const reference = 'FX-20260808-0123456789ABCDEF01234567';
    const request = new Request(`https://www.formatxsuite.com/api/session-status?session_id=${reference}`);
    const response = new Response(JSON.stringify({
      session_id: reference,
      license_active: true,
      license_key: 'FXPRO-BUSINESS-ABCD-EF01-2345',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });

    const protectedResponse = await redactLegacySessionStatus(request, new URL(request.url), response);
    const payload = await protectedResponse.json();

    expect(payload.license_key).toBe('FXPRO-BUSINESS-ABCD-EF01-2345');
    expect(payload.legacy_reference).toBeUndefined();
  });

  it('keeps the Native Android beta action on the first-party download endpoint', () => {
    const source = 'https://github.com/hutoczky/FormatX/releases/tag/android-native-v1.1.0-beta';
    const output = concealUpstreamText(source);

    expect(output).toBe('/download/android-native-beta');
    expect(output).not.toContain('/scifi-ui/android/');
  });
});