import productionWorker from './production-content-entry.js';

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isSafeMethod = request.method === 'GET' || request.method === 'HEAD';
    const isHomepage = HOMEPAGE_ALIASES.has(url.pathname);

    if (isSafeMethod && isHomepage) {
      // Any visible WWW homepage or legacy homepage alias resolves to one clean URL.
      // Query/hash cache-busters such as ?core=v55 are intentionally discarded.
      if (
        url.hostname === LEGACY_WWW_HOST
        || url.pathname !== '/'
        || url.search
      ) {
        return Response.redirect(`${CANONICAL_ORIGIN}/`, 308);
      }

      if (url.hostname === CANONICAL_HOST && url.pathname === '/') {
        // The underlying production stack historically treats WWW as its internal
        // homepage authority. Rewrite only the internal request so the browser can
        // remain on the bare canonical domain without creating a redirect loop.
        const internalUrl = new URL(request.url);
        internalUrl.hostname = LEGACY_WWW_HOST;
        internalUrl.pathname = '/';
        internalUrl.search = '';
        internalUrl.hash = '';

        const internalRequest = new Request(internalUrl, request);
        const response = await productionWorker.fetch(internalRequest, env, ctx);
        return canonicaliseHomepageResponse(response, request.method);
      }
    }

    return productionWorker.fetch(request, env, ctx);
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
  if (!contentType.includes('text/html')) return response;

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
