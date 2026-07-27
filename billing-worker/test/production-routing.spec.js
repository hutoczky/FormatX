import { describe, expect, it } from 'vitest';
import {
  canonicalPageRedirect,
  isThreeStagePath,
  secureResponse,
} from '../src/production-with-license.js';

describe('production routing and frame security', () => {
  it('recognises both Cloudflare HTML forms of the Three.js stage', () => {
    expect(isThreeStagePath('/scifi-ui/three-stage.html')).toBe(true);
    expect(isThreeStagePath('/scifi-ui/three-stage')).toBe(true);
    expect(isThreeStagePath('/scifi-ui/three-stage/')).toBe(true);
    expect(isThreeStagePath('/scifi-ui/')).toBe(false);
  });

  it.each([
    '/scifi-ui/three-stage.html',
    '/scifi-ui/three-stage',
  ])('allows same-origin framing for %s', (pathname) => {
    const response = secureResponse(new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }), new URL(`https://www.formatxsuite.com${pathname}`));

    expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'self'");
    expect(response.headers.get('Content-Security-Policy')).toContain('https://cdn.jsdelivr.net');
  });

  it('keeps ordinary HTML pages protected from framing', () => {
    const response = secureResponse(new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }), new URL('https://www.formatxsuite.com/scifi-ui/'));

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
  });

  it('redirects the apex domain to the canonical www product page', () => {
    const request = new Request('https://formatxsuite.com/');
    const response = canonicalPageRedirect(request, new URL(request.url));

    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe('https://www.formatxsuite.com/scifi-ui/');
  });

  it('preserves the www origin and query string on canonical redirects', () => {
    const request = new Request('https://www.formatxsuite.com/scifi-ui?lang=hu');
    const response = canonicalPageRedirect(request, new URL(request.url));

    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe('https://www.formatxsuite.com/scifi-ui/?lang=hu');
  });
});
