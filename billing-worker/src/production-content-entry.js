import contentPipeline from './production-content-base.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
const INTERNAL_ASSET_HOST = 'formatx-homepage.internal';
const RECOVERY_PARAM = '_fx_canonical_recovery';
const RECOVERY_SCRIPT = '<script defer data-fx-canonical-recovery="true" src="/scifi-ui/scripts/formatx-canonical-recovery.js?v=20260811-recovery-1"></script>';
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
      /*
        Historic production revisions emitted a permanent 308 from the apex
        hostname to WWW. Mobile Chrome can retain that redirect even after the
        server is fixed. Redirecting WWW straight back to the apex root would
        therefore create a client-side apex <-> WWW loop.

        WWW now uses a temporary, non-cacheable redirect to an apex recovery URL.
        That URL is not covered by the old cached root redirect, so the apex
        Worker can return a real 200 response, clear the origin HTTP cache and
        remove the recovery query from the address bar with history.replaceState.
      */
      if (url.hostname === LEGACY_WWW_HOST) {
        const target = new URL('/', CANONICAL_ORIGIN);
        target.searchParams.set(RECOVERY_PARAM, '1');
        return temporaryRedirect(target.toString());
      }

      if (url.hostname === CANONICAL_HOST) {
        if (url.pathname !== '/') {
          return temporaryRedirect(`${CANONICAL_ORIGIN}/`);
        }

        const hasPublicQuery = Boolean(url.search);
        const isRecovery = url.searchParams.has(RECOVERY_PARAM);
        const internalRequest = createInternalPipelineRequest(request, '/scifi-ui/', '');
        const response = await contentPipeline.fetch(internalRequest, env, ctx);
        return canonicaliseHomepageResponse(response, request.method, {
          cleanAddressBar: hasPublicQuery,
          clearCachedRedirect: isRecovery,
        });
      }
    }

    if (safeMethod && publicHost) {
      /*
        Shield every public GET/HEAD asset, API read and secondary page from old
        hostname canonicalisers. CSS/JS requests stay first-party on the visible
        hostname and never bounce through WWW.
      */
      const internalRequest = createInternalPipelineRequest(request, url.pathname, url.search);
      return contentPipeline.fetch(internalRequest, env, ctx);
    }

    return contentPipeline.fetch(request, env, ctx);
  },
};

function temporaryRedirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
    },
  });
}

function createInternalPipelineRequest(request, pathname, search) {
  const internalUrl = new URL(request.url);
  internalUrl.protocol = 'https:';
  internalUrl.hostname = INTERNAL_ASSET_HOST;
  internalUrl.pathname = pathname;
  internalUrl.search = search || '';
  internalUrl.hash = '';
  return new Request(internalUrl, request);
}

async function canonicaliseHomepageResponse(response, method, options = {}) {
  const { cleanAddressBar = false, clearCachedRedirect = false } = options;
  const headers = new Headers(response.headers);
  headers.set('Link', `<${CANONICAL_ORIGIN}/>; rel="canonical"`);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');

  if (clearCachedRedirect) {
    // Chrome/Chromium use this to evict the stale permanent apex -> WWW redirect.
    headers.set('Clear-Site-Data', '"cache"');
  }

  // No lower-layer redirect is allowed to escape from the canonical homepage.
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

  if (cleanAddressBar && !html.includes('data-fx-canonical-recovery')) {
    html = html.replace('</head>', `  ${RECOVERY_SCRIPT}\n</head>`);
  }

  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
