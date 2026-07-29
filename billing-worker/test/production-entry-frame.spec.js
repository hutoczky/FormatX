import { describe, expect, it } from 'vitest';
import productionEntry from '../src/production-entry.js';

function createEnvironment() {
  return {
    ASSETS: {
      async fetch(request) {
        const url = new URL(request.url);
        return new Response(`<!doctype html><title>${url.pathname}</title>`, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      },
    },
  };
}

describe('production entry iframe security', () => {
  it.each([
    '/scifi-ui/three-stage.html',
    '/scifi-ui/three-stage',
    '/scifi-ui/three-stage-mobile.html',
    '/scifi-ui/three-stage-mobile',
  ])('allows the same FormatX origin to embed %s', async (pathname) => {
    const response = await productionEntry.fetch(
      new Request(`https://www.formatxsuite.com${pathname}`),
      createEnvironment(),
      {},
    );
    const policy = response.headers.get('Content-Security-Policy') || '';

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(policy).toContain("frame-ancestors 'self'");
    expect(policy).toContain('https://cdn.jsdelivr.net');
    expect(policy).toContain('https://unpkg.com');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('keeps the main product page protected from framing', async () => {
    const response = await productionEntry.fetch(
      new Request('https://www.formatxsuite.com/scifi-ui/'),
      createEnvironment(),
      {},
    );
    const policy = response.headers.get('Content-Security-Policy') || '';

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(policy).toContain("frame-ancestors 'none'");
  });
});
