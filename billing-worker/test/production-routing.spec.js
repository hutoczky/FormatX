import { describe, expect, it } from 'vitest';
import productionWorker, {
  canonicalPageRedirect,
  concealUpstreamText,
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
    expect(policy).toContain("connect-src 'self' https://cdn.jsdelivr.net");
    expect(policy.toLowerCase()).not.toContain('github');
    expect(policy).not.toContain('blob:');
    expect(policy).not.toContain('https://unpkg.com');
  });

  it('keeps ordinary HTML pages protected from framing and upstream-host disclosure', () => {
    const response = secureResponse(new Response('<!doctype html>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }), new URL('https://www.formatxsuite.com/scifi-ui/'));
    const policy = response.headers.get('Content-Security-Policy') || '';

    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain('https://cdn.jsdelivr.net');
    expect(policy.toLowerCase()).not.toContain('github');
  });

  it('maps upstream public references to first-party FormatX routes', () => {
    const input = [
      'https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest',
      'https://github.com/hutoczky/FormatX-Updates/releases/download/v127/FormatX-Suite-Pro-V127.zip',
      'https://github.com/hutoczky/FormatX/issues/new',
      'https://raw.githubusercontent.com/hutoczky/FormatX/master/docs/scifi-ui/downloads/FormatX-Native-Android.apk',
      'GitHub Releases',
    ].join('\n');
    const output = concealUpstreamText(input);

    expect(output).toContain('/api/public-release');
    expect(output).toContain('/download/multiplatform');
    expect(output).toContain('/download/android-native-beta');
    expect(output).toContain('/scifi-ui/support.html');
    expect(output.toLowerCase()).not.toContain('github');
    expect(output.toLowerCase()).not.toContain('githubusercontent');
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

  it('serves sanitised first-party release metadata', async () => {
    const rawRelease = {
      schema_version: 2,
      ok: true,
      source: 'github_published_release',
      repository: 'hutoczky/FormatX-Updates',
      source_release_id: 123,
      version: 'v127',
      release_name: 'FormatX Suite Pro V127',
      published_at: '2026-08-06T11:31:54Z',
      release_url: 'https://github.com/hutoczky/FormatX-Updates/releases/tag/v127',
      channels: {
        multiplatform: {
          available: true,
          name: 'FormatX-Suite-Pro-V127.zip',
          download_url: 'https://github.com/hutoczky/FormatX-Updates/releases/download/v127/FormatX-Suite-Pro-V127.zip',
          size: 12345,
          digest: `sha256:${'a'.repeat(64)}`,
          content_type: 'application/zip',
          primary_platform: 'linux-bazzite',
          supported_platforms: ['linux-bazzite', 'windows'],
        },
        android: { available: true, name: 'FormatX-Suite-Pro-Android.apk', download_url: '/download/android' },
      },
      integrity: { status: 'digest_published' },
    };
    const response = await productionWorker.fetch(
      new Request('https://www.formatxsuite.com/scifi-ui/data/current-release.json'),
      {
        ASSETS: {
          async fetch() {
            return new Response(JSON.stringify(rawRelease), {
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
          },
        },
      },
      {},
    );
    const text = await response.text();
    const payload = JSON.parse(text);

    expect(response.status).toBe(200);
    expect(payload.source).toBe('formatx_release_service');
    expect(payload.repository).toBeUndefined();
    expect(payload.source_release_id).toBeUndefined();
    expect(payload.release_url).toBe('/scifi-ui/downloads/');
    expect(payload.channels.multiplatform.download_url).toBe('/download/multiplatform');
    expect(text.toLowerCase()).not.toContain('github');
  });

  it('redirects the apex domain to the canonical www product page', () => {
    const request = new Request('https://formatxsuite.com/');
    const response = canonicalPageRedirect(request, new URL(request.url));

    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe('https://www.formatxsuite.com/');
  });

  it('normalises the no-slash legacy homepage path without sending it back to root', () => {
    const request = new Request('https://www.formatxsuite.com/scifi-ui?lang=hu');
    const response = canonicalPageRedirect(request, new URL(request.url));

    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe('https://www.formatxsuite.com/scifi-ui/?lang=hu');
  });

  it.each([
    '/scifi-ui/',
    '/scifi-ui/index.html',
  ])('never redirects the legacy homepage alias %s back to root', (pathname) => {
    const request = new Request(`https://www.formatxsuite.com${pathname}`);
    expect(canonicalPageRedirect(request, new URL(request.url))).toBeNull();
  });

  it('redirects an apex legacy homepage alias to the canonical www root', () => {
    const request = new Request('https://formatxsuite.com/scifi-ui/?lang=en');
    const response = canonicalPageRedirect(request, new URL(request.url));

    expect(response?.status).toBe(308);
    expect(response?.headers.get('Location')).toBe('https://www.formatxsuite.com/?lang=en');
  });

  it('serves the homepage directly at the www domain root', async () => {
    let assetPath = '';
    const response = await productionWorker.fetch(
      new Request('https://www.formatxsuite.com/'),
      {
        ASSETS: {
          async fetch(request) {
            assetPath = new URL(request.url).pathname;
            return new Response('<!doctype html><title>FORMATX</title>', {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          },
        },
      },
      {},
    );

    expect(response.status).toBe(200);
    expect(assetPath).toBe('/scifi-ui/');
    expect(response.headers.get('Link')).toBe('<https://www.formatxsuite.com/>; rel="canonical"');
  });

  it('does not redirect the canonical www domain root', () => {
    const request = new Request('https://www.formatxsuite.com/');
    expect(canonicalPageRedirect(request, new URL(request.url))).toBeNull();
  });

  it.each([
    '/scifi-ui/',
    '/scifi-ui/index.html',
  ])('serves legacy homepage alias %s with a 200 response', async (pathname) => {
    const response = await productionWorker.fetch(
      new Request(`https://www.formatxsuite.com${pathname}`),
      {
        ASSETS: {
          async fetch(request) {
            return new Response(`<!doctype html><title>${new URL(request.url).pathname}</title>`, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          },
        },
      },
      {},
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('Link')).toBe('<https://www.formatxsuite.com/>; rel="canonical"');
  });
});
