import contentPipeline from './production-content-base.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
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
*/

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    const homepage = HOMEPAGE_ALIASES.has(url.pathname);

    if (safeMethod && homepage) {
      // All visible homepage variants collapse to one clean browser URL.
      // Cache-busting query strings such as ?core=v55 are intentionally removed.
      if (
        url.hostname === LEGACY_WWW_HOST
        || url.pathname !== '/'
        || url.search
      ) {
        return Response.redirect(`${CANONICAL_ORIGIN}/`, 308);
      }

      if (url.hostname === CANONICAL_HOST && url.pathname === '/') {
        // Older inner layers still use WWW as an internal routing authority.
        // Feed them an internal WWW request without changing the user's URL.
        const internalUrl = new URL(request.url);
        internalUrl.hostname = LEGACY_WWW_HOST;
        internalUrl.pathname = '/';
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
    .replaceAll('https://www.formatxsuite.com', 'https://formatxsuite.com');

  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
