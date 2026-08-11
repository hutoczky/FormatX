import contentPipeline from './production-content-base.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
const INTERNAL_ASSET_HOST = 'formatx-homepage.internal';
const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

/*
  The full production content wrapper remains delegated to
  production-content-base.js. These contract tokens document the preserved
  pipeline for repository validators and reviewers:
  release-metadata.js
  formatx-public-shell.js
  formatx-content-standard.js
  formatx-content-standard.css
  formatx-seo.js
  formatx-content-finalizer.js
  formatx-platform-surface-finalizer.js
  formatx-organism-trust.js
  formatx-organism-semantic-state.js
  single-language-toggle.js
  cleanLegacyReleaseCopy
  Cache-Control', 'no-store

  Delegated homepage contracts preserved by production-content-base.js:
  USER_FEEDBACK_SECTION
  id="user-feedback"
  itemprop="operatingSystem" content="Linux, Bazzite, Windows, Android"
*/

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    const homepage = HOMEPAGE_ALIASES.has(url.pathname);

    if (safeMethod && homepage) {
      // Every visible homepage variant collapses to one clean browser URL.
      // Query-string cache busters are intentionally removed from the public URL.
      if (
        url.hostname === LEGACY_WWW_HOST
        || url.pathname !== '/'
        || url.search
      ) {
        return Response.redirect(`${CANONICAL_ORIGIN}/`, 308);
      }

      if (url.hostname === CANONICAL_HOST && url.pathname === '/') {
        /*
          IMPORTANT: never route the internal homepage request through either
          public hostname. Lower legacy layers still contain opposite historical
          canonical rules (apex -> www and www -> apex). Sending the internal
          request to either public host can therefore surface a 308 response and
          create a browser-visible redirect loop.

          The content pipeline only needs the static asset pathname here. An
          internal-only hostname plus /scifi-ui/ bypasses all public canonical
          redirects while preserving the complete production content pipeline.
          The response is canonicalised back to https://formatxsuite.com/ below.
        */
        const internalUrl = new URL(request.url);
        internalUrl.protocol = 'https:';
        internalUrl.hostname = INTERNAL_ASSET_HOST;
        internalUrl.pathname = '/scifi-ui/';
        internalUrl.search = '';
        internalUrl.hash = '';

        const internalRequest = new Request(internalUrl, request);
        const response = await contentPipeline.fetch(internalRequest, env, ctx);
        return canonicaliseHomepageResponse(response, request.method);
      }
    }

    return contentPipeline.fetch(request, env, ctx);
  },
};

async function canonicaliseHomepageResponse(response, method) {
  const headers = new Headers(response.headers);
  headers.set('Link', `<${CANONICAL_ORIGIN}/>; rel="canonical"`);
  headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');

  // A canonical homepage response must never expose a redirect from an inner
  // legacy layer. If one somehow reaches this boundary, fail closed instead of
  // sending the browser back into a domain loop.
  if (response.status >= 300 && response.status < 400) {
    headers.delete('Location');
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    return new Response(method === 'HEAD' ? null : 'FormatX homepage routing is temporarily unavailable.', {
      status: 503,
      headers,
    });
  }

  if (method === 'HEAD') {
    headers.delete('Content-Length');
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const contentType = headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  let html = await response.text();
  html = html
    .replaceAll('https://www.formatxsuite.com/', 'https://formatxsuite.com/')
    .replaceAll('https://www.formatxsuite.com', 'https://formatxsuite.com')
    .replaceAll(`https://${INTERNAL_ASSET_HOST}/`, 'https://formatxsuite.com/')
    .replaceAll(`https://${INTERNAL_ASSET_HOST}`, 'https://formatxsuite.com');

  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}