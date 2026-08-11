import { describe, expect, it } from 'vitest';
import canonicalWorker from '../src/canonical-entry.js';

function testEnv(onAsset) {
  return {
    ASSETS: {
      async fetch(request) {
        const url = new URL(request.url);
        onAsset?.(url);
        if (url.pathname.endsWith('.css')) {
          return new Response('body{background:#000}', {
            status: 200,
            headers: { 'Content-Type': 'text/css; charset=utf-8' },
          });
        }
        if (url.pathname.endsWith('.js')) {
          return new Response('window.__formatxTest=true;', {
            status: 200,
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
          });
        }
        return new Response('<!doctype html><html><head><title>FORMATX</title></head><body><main id="hero">FORMATX</main></body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      },
    },
  };
}

describe('canonical production gateway', () => {
  it('serves the canonical apex root as a 200 without any Location header', async () => {
    let assetPath = '';
    const response = await canonicalWorker.fetch(
      new Request('https://formatxsuite.com/'),
      testEnv((url) => { assetPath = url.pathname; }),
      {},
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('Link')).toBe('<https://formatxsuite.com/>; rel="canonical"');
    expect(assetPath).toBe('/scifi-ui/');
  });

  it('never emits a permanent WWW-to-apex redirect for the homepage recovery hop', async () => {
    const response = await canonicalWorker.fetch(
      new Request('https://www.formatxsuite.com/'),
      {},
      {},
    );

    expect(response.status).toBe(302);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('Location')).toBe('https://formatxsuite.com/?_fx_redirect_recovery=1');
  });

  it('serves an apex recovery URL as real HTML and does not redirect it again', async () => {
    const response = await canonicalWorker.fetch(
      new Request('https://formatxsuite.com/?_fx_redirect_recovery=1'),
      testEnv(),
      {},
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('Clear-Site-Data')).toBe('"cache"');
    expect(html).toContain('data-fx-canonical-recovery');
  });

  it('serves first-party CSS directly on the apex host without a domain redirect', async () => {
    let assetPath = '';
    const response = await canonicalWorker.fetch(
      new Request('https://formatxsuite.com/scifi-ui/styles/example.css'),
      testEnv((url) => { assetPath = url.pathname; }),
      {},
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('Content-Type')).toContain('text/css');
    expect(assetPath).toBe('/scifi-ui/styles/example.css');
  });

  it('resolves public page aliases internally instead of exposing a WWW redirect', async () => {
    let assetPath = '';
    const response = await canonicalWorker.fetch(
      new Request('https://formatxsuite.com/support'),
      testEnv((url) => { assetPath = url.pathname; }),
      {},
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
    expect(assetPath).toBe('/scifi-ui/support.html');
  });
});
