import { describe, expect, it } from 'vitest';
import productionWorker, { concealUpstreamText } from '../src/production-with-license.js';

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

  it('keeps the Native Android beta action on the first-party download endpoint', () => {
    const source = 'https://github.com/hutoczky/FormatX/releases/tag/android-native-v1.1.0-beta';
    const output = concealUpstreamText(source);

    expect(output).toBe('/download/android-native-beta');
    expect(output).not.toContain('/scifi-ui/android/');
  });
});
