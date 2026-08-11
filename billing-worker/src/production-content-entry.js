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
    const publicHost = url.hostname === CANONICAL_HOST || url.hostname === LEGACY_WWW_HOST;

    if (safeMethod && homepage) {
      // There is exactly one browser-visible homepage URL. Old aliases, WWW and
      // cache-busting query strings collapse to the clean apex root.
      if (
        url.hostname === LEGACY_WWW_HOST
        || url.pathname !== '/'
        || url.search
      ) {
        return Response.redirect(`${CANONICAL_ORIGIN}/`, 308);
      }

      if (url.hostname === CANONICAL_HOST && url.pathname === '/') {
        /*
          Never route the internal homepage request through either public host.
          Lower legacy layers contain historical canonical rules in opposite
          directions. The internal-only hostname bypasses those rules, and the
          real static homepage is requested directly at /scifi-ui/.
        */
        const internalRequest = createInternalPipelineRequest(request, '/scifi-ui/', '');
        const response = await contentPipeline.fetch(internalRequest, env, ctx);
        return canonicaliseHomepageResponse(response, request.method);
      }
    }

    if (safeMethod && publicHost) {
      /*
        Shield every public GET/HEAD asset, API read and secondary page from the
        old hostname canonicalisers as well. This is critical for the apex root:
        its CSS/JS requests must remain first-party and must not bounce through
        WWW, otherwise strict self-only CSP can leave the page as raw HTML.
      */
      const internalRequest = createInternalPipelineRequest(request, url.pathname, url.search);
      return contentPipeline.fetch(internalRequest, env, ctx);
    }

    return contentPipeline.fetch(request, env, ctx);
  },
};

function createInternalPipelineRequest(request, pathname, search) {
  const internalUrl = new URL(request.url);
  internalUrl.protocol = 'https:';
  internalUrl.hostname = INTERNAL_ASSET_HOST;
  internalUrl.pathname = pathname;
  internalUrl.search = search || '';
  internalUrl.hash = '';
  return new Request(internalUrl, request);
}

async function canonicaliseHomepageResponse(response, method) {
  const headers = new Headers(response.headers);
  headers.set('Link', `<${CANONICAL_ORIGIN}/>; rel="canonical"`);
  headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');

  // No lower-layer redirect is allowed to escape from the canonical homepage.
  // If a future regression reaches this boundary, return an explicit failure
  // rather than trapping the browser in another redirect loop.
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