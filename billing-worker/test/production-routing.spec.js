import { describe, expect, it } from 'vitest';
import productionWorker, {
  canonicalPageRedirect,
  createAudioTestWav,
  isLivingCorePath,
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

  it('recognises both Cloudflare HTML forms of the Living Core laboratory', () => {
    expect(isLivingCorePath('/scifi-ui/living-core.html')).toBe(true);
    expect(isLivingCorePath('/scifi-ui/living-core')).toBe(true);
    expect(isLivingCorePath('/scifi-ui/living-core/')).toBe(true);
    expect(isLivingCorePath('/scifi-ui/')).toBe(false);
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

  it.each([
    '/scifi-ui/living-core.html',
    '/scifi-ui/living-core',
  ])('isolates the Living Core CDN permissions for %s', (pathname) => {
    const response = secureResponse(new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }), new URL(`https://www.formatxsuite.com${pathname}`));
    const policy = response.headers.get('Content-Security-Policy') || '';

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("script-src 'self' https://cdn.jsdelivr.net");
    expect(policy).toContain('https://api.github.com');
    expect(policy).not.toContain('blob:');
    expect(policy).not.toContain('https://unpkg.com');
  });

  it('keeps ordinary HTML pages protected from framing', () => {
    const response = secureResponse(new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }), new URL('https://www.formatxsuite.com/scifi-ui/'));

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('Content-Security-Policy')).not.toContain('https://cdn.jsdelivr.net');
  });

  it('allows same-origin user-activated audio without opening microphone access', () => {
    const response = secureResponse(new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }), new URL('https://www.formatxsuite.com/scifi-ui/'));
    const policy = response.headers.get('Permissions-Policy') || '';

    expect(policy).toContain('autoplay=(self)');
    expect(policy).not.toContain('autoplay=()');
    expect(policy).toContain('microphone=()');
    expect(response.headers.get('Content-Security-Policy')).toContain("media-src 'self'");
  });

  it('generates a valid and audible PCM WAV fallback', () => {
    const wav = createAudioTestWav();
    const riff = String.fromCharCode(...wav.slice(0, 4));
    const wave = String.fromCharCode(...wav.slice(8, 12));
    const samples = new Int16Array(wav.buffer, wav.byteOffset + 44, (wav.byteLength - 44) / 2);
    let peak = 0;
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample));

    expect(riff).toBe('RIFF');
    expect(wave).toBe('WAVE');
    expect(wav.byteLength).toBeGreaterThan(4000);
    expect(peak).toBeGreaterThan(15000);
  });

  it('serves the audible WAV fallback through the production route', async () => {
    const response = await productionWorker.fetch(
      new Request('https://www.formatxsuite.com/scifi-ui/assets/audio/formatx-audio-test.wav?v=test'),
      {},
      {},
    );
    const bytes = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('audio/wav');
    expect(response.headers.get('Permissions-Policy')).toContain('autoplay=(self)');
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe('WAVE');
    expect(bytes.byteLength).toBeGreaterThan(4000);
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
