import productionWorker from './production-content-entry.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
const INTERNAL_HOST = 'formatx-routing.internal';
const RECOVERY_PARAM = '_fx_redirect_recovery';
const RECOVERY_SCRIPT = '<script defer data-fx-canonical-recovery="true" src="/scifi-ui/scripts/formatx-canonical-recovery.js?v=20260811-recovery-2"></script>';

const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const PUBLIC_PAGE_ALIASES = new Map([
  ['/downloads', '/scifi-ui/downloads/'],
  ['/downloads/', '/scifi-ui/downloads/'],
  ['/support', '/scifi-ui/support.html'],
  ['/support.html', '/scifi-ui/support.html'],
  ['/license', '/scifi-ui/license.html'],
  ['/license.html', '/scifi-ui/license.html'],
  ['/privacy', '/scifi-ui/privacy.html'],
  ['/privacy.html', '/scifi-ui/privacy.html'],
  ['/terms', '/scifi-ui/terms.html'],
  ['/terms.html', '/scifi-ui/terms.html'],
  ['/verification', '/scifi-ui/verification.html'],
  ['/verification.html', '/scifi-ui/verification.html'],
  ['/test-matrix', '/scifi-ui/test-matrix.html'],
  ['/test-matrix.html', '/scifi-ui/test-matrix.html'],
  ['/known-issues', '/scifi-ui/known-issues.html'],
  ['/known-issues.html', '/scifi-ui/known-issues.html'],
  ['/security', '/scifi-ui/security.html'],
  ['/security.html', '/scifi-ui/security.html'],
  ['/technical-report', '/scifi-ui/technical-report.html'],
  ['/technical-report.html', '/scifi-ui/technical-report.html'],
  ['/method', '/scifi-ui/method.html'],
  ['/method.html', '/scifi-ui/method.html'],
  ['/checkout.html', '/scifi-ui/checkout.html'],
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    const publicHost = url.hostname === CANONICAL_HOST || url.hostname === LEGACY_WWW_HOST;

    if (!safeMethod || !publicHost) {
      return productionWorker.fetch(request, env, ctx);
    }

    /*
      One public routing authority only.

      Every safe request is converted to an internal hostname before entering
      the historic production stack. Lower layers can therefore keep their
      legacy canonicalisation code without ever being able to bounce a browser
      between formatxsuite.com and www.formatxsuite.com.
    */

    if (url.hostname === LEGACY_WWW_HOST) {
      const target = new URL(url.pathname, CANONICAL_ORIGIN);
      target.search = url.search;

      if (HOMEPAGE_ALIASES.has(url.pathname)) {
        target.pathname = '/';
        target.search = '';
      }

      // A unique recovery query bypasses any historic cached 308 for the exact
      // apex URL. The loaded page removes it with history.replaceState.
      target.searchParams.set(RECOVERY_PARAM, '1');
      return temporaryRedirect(target.toString());
    }

    if (HOMEPAGE_ALIASES.has(url.pathname)) {
      if (url.pathname !== '/') {
        const target = new URL('/', CANONICAL_ORIGIN);
        target.searchParams.set(RECOVERY_PARAM, '1');
        return temporaryRedirect(target.toString());
      }

      const internalSearch = new URLSearchParams(url.search);
      internalSearch.delete(RECOVERY_PARAM);
      // The visible homepage is always clean. Public query strings are used only
      // as a cache-recovery transport and are never part of the internal page URL.
      const response = await fetchInternalNoLoop(
        request,
        env,
        ctx,
        '/scifi-ui/',
        '',
      );
      return canonicalisePublicResponse(response, request, url, {
        homepage: true,
        cleanAddressBar: Boolean(url.search || url.hash),
        clearCachedRedirect: url.searchParams.has(RECOVERY_PARAM),
      });
    }

    const mappedPath = PUBLIC_PAGE_ALIASES.get(url.pathname) || url.pathname;
    const internalSearch = new URLSearchParams(url.search);
    const clearCachedRedirect = internalSearch.has(RECOVERY_PARAM);
    internalSearch.delete(RECOVERY_PARAM);
    const search = internalSearch.toString() ? `?${internalSearch.toString()}` : '';

    const response = await fetchInternalNoLoop(request, env, ctx, mappedPath, search);
    return canonicalisePublicResponse(response, request, url, {
      homepage: false,
      cleanAddressBar: clearCachedRedirect,
      clearCachedRedirect,
    });
  },
};

function temporaryRedirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
      Vary: 'Host',
    },
  });
}

function createInternalRequest(request, pathname, search = '') {
  const internalUrl = new URL(request.url);
  internalUrl.protocol = 'https:';
  internalUrl.hostname = INTERNAL_HOST;
  internalUrl.pathname = pathname;
  internalUrl.search = search;
  internalUrl.hash = '';
  return new Request(internalUrl, request);
}

async function fetchInternalNoLoop(request, env, ctx, pathname, search = '') {
  let currentPath = pathname;
  let currentSearch = search;
  const seen = new Set();

  for (let hop = 0; hop < 5; hop += 1) {
    const key = `${currentPath}${currentSearch}`;
    if (seen.has(key)) {
      return routingLoopBlocked();
    }
    seen.add(key);

    const internalRequest = createInternalRequest(request, currentPath, currentSearch);
    const response = await productionWorker.fetch(internalRequest, env, ctx);
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get('Location');
    if (!location) return response;

    let target;
    try {
      target = new URL(location, internalRequest.url);
    } catch (_) {
      return response;
    }

    const internalTarget = target.hostname === INTERNAL_HOST
      || target.hostname === CANONICAL_HOST
      || target.hostname === LEGACY_WWW_HOST;
    if (!internalTarget) return response;

    currentPath = PUBLIC_PAGE_ALIASES.get(target.pathname) || target.pathname;
    if (HOMEPAGE_ALIASES.has(currentPath)) currentPath = '/scifi-ui/';
    const params = new URLSearchParams(target.search);
    params.delete(RECOVERY_PARAM);
    currentSearch = params.toString() ? `?${params.toString()}` : '';
  }

  return routingLoopBlocked();
}

function routingLoopBlocked() {
  return new Response('FormatX routing loop blocked before it reached the browser.', {
    status: 508,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

async function canonicalisePublicResponse(response, request, publicUrl, options = {}) {
  const {
    homepage = false,
    cleanAddressBar = false,
    clearCachedRedirect = false,
  } = options;

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Vary', mergeVary(headers.get('Vary'), 'Host'));

  if (homepage) {
    headers.set('Link', `<${CANONICAL_ORIGIN}/>; rel="canonical"`);
  } else {
    const link = headers.get('Link');
    if (link) {
      headers.set(
        'Link',
        link
          .replaceAll(`https://${LEGACY_WWW_HOST}`, CANONICAL_ORIGIN)
          .replaceAll(`https://${INTERNAL_HOST}`, CANONICAL_ORIGIN),
      );
    }
  }

  if (clearCachedRedirect) {
    headers.set('Clear-Site-Data', '"cache"');
  }

  // Never leak a lower-layer public-host redirect back to the browser. The
  // bounded internal follower above either resolves it or converts a cycle to 508.
  if (response.status >= 300 && response.status < 400) {
    const location = headers.get('Location');
    if (location) {
      try {
        const target = new URL(location, publicUrl);
        if (
          target.hostname === LEGACY_WWW_HOST
          || target.hostname === CANONICAL_HOST
          || target.hostname === INTERNAL_HOST
        ) {
          headers.delete('Location');
          headers.delete('Content-Length');
          return routingLoopBlocked();
        }
      } catch (_) {
        // Leave unrelated malformed/external redirects untouched.
      }
    }
  }

  if (request.method === 'HEAD') {
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
    .replaceAll(`https://${LEGACY_WWW_HOST}/`, `${CANONICAL_ORIGIN}/`)
    .replaceAll(`https://${LEGACY_WWW_HOST}`, CANONICAL_ORIGIN)
    .replaceAll(`https://${INTERNAL_HOST}/`, `${CANONICAL_ORIGIN}/`)
    .replaceAll(`https://${INTERNAL_HOST}`, CANONICAL_ORIGIN);

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

function mergeVary(existing, value) {
  const values = new Set(
    String(existing || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  values.add(value);
  return Array.from(values).join(', ');
}
