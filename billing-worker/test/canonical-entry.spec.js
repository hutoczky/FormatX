import { describe, expect, it } from 'vitest';
import canonicalWorker from '../src/production-content-entry.js';

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

describe('active production canonical gateway', () => {
  it('authorizes and preserves the canonical R504 responsive state before stylesheet discovery', async () => {
    const seed = "document.documentElement.dataset.fxReferenceProductionR244=matchMedia('(max-width: 900px)').matches?'ready':'desktop';";
    const response = await canonicalWorker.fetch(
      new Request('https://formatxsuite.com/'),
      {
        ASSETS: {
          async fetch() {
            return new Response(
              '<!doctype html><html><head>'
                + '<meta http-equiv="Content-Security-Policy" content="default-src \'self\';script-src \'self\'">'
                + `<script data-fx-reference-first-paint-r504="true">${seed}</script>`
                + '<link rel="stylesheet" href="/scifi-ui/styles/example.css">'
                + '</head><body><main id="hero">FORMATX</main></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
            );
          },
        },
      },
      {},
    );
    const html = await response.text();
    const stateScript = `<script data-fx-reference-first-paint-r504="true">${seed}</script>`;

    expect(html.indexOf(stateScript)).toBeGreaterThan(-1);
    expect(html.indexOf(stateScript)).toBeLessThan(html.indexOf('<link rel="stylesheet"'));
    expect(response.headers.get('Content-Security-Policy')).toContain(
      "'sha256-G5n9M4P0L5SRhfb6wEKZXWR7jW5EtgZHj5zzAsDobuI='",
    );
    expect(html).toContain("script-src 'self' 'sha256-G5n9M4P0L5SRhfb6wEKZXWR7jW5EtgZHj5zzAsDobuI='");
  });

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

  it('keeps dynamic homepage assets rooted in /scifi-ui without moving hash navigation', async () => {
    const response = await canonicalWorker.fetch(
      new Request('https://formatxsuite.com/'),
      {
        ASSETS: {
          async fetch() {
            return new Response('<!doctype html><html><head><title>FORMATX</title><base href="/scifi-ui/"></head><body><a href="#hero">Core</a></body></html>', {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
          },
        },
      },
      {},
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('<base href="/scifi-ui/">');
    expect(html).toContain('href="/#hero"');
    expect(html).toContain('data-fx-critical-shell="v56"');
    expect(html).not.toContain('<base href="/">');
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

  it.each(['hu', 'en'])('preserves %s through the WWW-to-apex recovery hop', async (language) => {
    const response = await canonicalWorker.fetch(
      new Request(`https://www.formatxsuite.com/?lang=${language}`),
      {},
      {},
    );

    expect(response.status).toBe(302);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('Location')).toBe(
      `https://formatxsuite.com/?lang=${language}&_fx_redirect_recovery=1`,
    );
  });

  it.each(['hu', 'en'])('aligns explicit %s canonical headers and server SEO metadata', async (language) => {
    const sourceSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://formatxsuite.com/#website',
          url: 'https://formatxsuite.com/',
          name: 'FormatX Suite Pro',
        },
        {
          '@type': 'WebPage',
          '@id': 'https://formatxsuite.com/#webpage',
          url: 'https://formatxsuite.com/',
          name: 'Old title',
          description: 'Old description',
          inLanguage: 'hu-HU',
        },
      ],
    });
    const response = await canonicalWorker.fetch(
      new Request(`https://formatxsuite.com/?lang=${language}`),
      {
        ASSETS: {
          async fetch() {
            return new Response(
              '<!doctype html><html lang="hu"><head>'
                + '<title>FORMATX</title>'
                + '<base href="/scifi-ui/">'
                + '<meta name="description" content="Old description">'
                + '<link rel="canonical" href="https://formatxsuite.com/">'
                + '<meta property="og:title" content="Old title">'
                + '<meta property="og:description" content="Old description">'
                + '<meta property="og:url" content="https://formatxsuite.com/">'
                + '<meta property="og:locale" content="hu_HU">'
                + '<meta property="og:locale:alternate" content="en_GB">'
                + '<meta name="twitter:title" content="Old title">'
                + '<meta name="twitter:description" content="Old description">'
                + `<script id="formatx-structured-data" type="application/ld+json">${sourceSchema}</script>`
                + '</head><body><main id="hero">FORMATX</main></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
            );
          },
        },
      },
      {},
    );
    const html = await response.text();
    const canonical = `https://formatxsuite.com/?lang=${language}`;
    const expected = language === 'en'
      ? {
          title: 'FormatX Suite Pro | Technician Operating Layer',
          locale: 'en_GB',
          alternateLocale: 'hu_HU',
          inLanguage: 'en-GB',
        }
      : {
          title: 'FormatX Suite Pro | Technikusi operációs réteg',
          locale: 'hu_HU',
          alternateLocale: 'en_GB',
          inLanguage: 'hu-HU',
        };

    expect(response.status).toBe(200);
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('Link')).toBe(`<${canonical}>; rel="canonical"`);
    expect(response.headers.get('Content-Language')).toBe(language);
    expect(html).toMatch(new RegExp(`<html\\b[^>]*\\blang="${language}"(?:\\s|>)`));
    expect(html).toContain(`<title>${expected.title}</title>`);
    expect(html).toContain(`<link rel="canonical" href="${canonical}">`);
    expect(html).toContain(`<meta property="og:url" content="${canonical}">`);
    expect(html).toContain(`<meta property="og:locale" content="${expected.locale}">`);
    expect(html).toContain(`<meta property="og:locale:alternate" content="${expected.alternateLocale}">`);
    expect(html).toContain(`<meta name="twitter:title" content="${expected.title}">`);

    const schemaMatch = html.match(/<script id="formatx-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(schemaMatch).not.toBeNull();
    const schema = JSON.parse(schemaMatch[1]);
    const webPage = schema['@graph'].find((node) => node['@type'] === 'WebPage');
    expect(webPage).toMatchObject({
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: expected.title,
      inLanguage: expected.inLanguage,
    });
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
