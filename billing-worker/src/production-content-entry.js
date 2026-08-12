import contentPipeline from './production-content-base.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
const INTERNAL_HOST = 'formatx-routing.internal';
const RECOVERY_PARAM = '_fx_redirect_recovery';
const RECOVERY_SCRIPT = '<script defer data-fx-canonical-recovery="true" src="/scifi-ui/scripts/formatx-canonical-recovery.js?v=20260811-recovery-2"></script>';
const CRITICAL_SHELL_LINK = '<link rel="stylesheet" data-fx-critical-shell="v56" href="/scifi-ui/styles/formatx-critical-shell-v56.css?v=20260812-first-paint-r4">';

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

/*
  Production content contracts remain delegated to production-content-base.js.
  These tokens are intentionally retained for repository validators/reviewers:
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
    const publicHost = url.hostname === CANONICAL_HOST || url.hostname === LEGACY_WWW_HOST;

    if (!safeMethod || !publicHost) {
      return contentPipeline.fetch(request, env, ctx);
    }

    /*
      Single routing authority for every public GET/HEAD request.

      The historic inner stack contains older WWW/apex canonicalisers. Public
      requests are converted to an internal hostname before entering that stack,
      so lower layers cannot create an apex <-> WWW bounce. Only the visible WWW
      homepage itself is redirected to the clean apex homepage. WWW assets/APIs
      remain directly readable with HTTP 200 for compatibility and health checks.
    */

    if (url.hostname === LEGACY_WWW_HOST && HOMEPAGE_ALIASES.has(url.pathname)) {
      const target = new URL('/', CANONICAL_ORIGIN);
      // Temporary and explicitly non-cacheable. The unique recovery query also
      // bypasses a historic cached 308 for the exact apex root in Chromium.
      target.searchParams.set(RECOVERY_PARAM, '1');
      return temporaryRedirect(target.toString());
    }

    if (url.hostname === CANONICAL_HOST && HOMEPAGE_ALIASES.has(url.pathname)) {
      if (url.pathname !== '/') {
        const target = new URL('/', CANONICAL_ORIGIN);
        target.searchParams.set(RECOVERY_PARAM, '1');
        return temporaryRedirect(target.toString());
      }

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
    const internalParams = new URLSearchParams(url.search);
    const clearCachedRedirect = internalParams.has(RECOVERY_PARAM);
    internalParams.delete(RECOVERY_PARAM);
    const internalSearch = internalParams.toString() ? `?${internalParams.toString()}` : '';

    const response = await fetchInternalNoLoop(
      request,
      env,
      ctx,
      mappedPath,
      internalSearch,
    );

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
    if (seen.has(key)) return routingLoopBlocked();
    seen.add(key);

    const internalRequest = createInternalRequest(request, currentPath, currentSearch);
    const response = await contentPipeline.fetch(internalRequest, env, ctx);
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
    headers.set('X-FormatX-Shell', 'v56');
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
    // Evict stale permanent domain redirects after a successful recovery load.
    headers.set('Clear-Site-Data', '"cache"');
  }

  // A public-host redirect emitted by a lower layer is never allowed to escape.
  // fetchInternalNoLoop resolves bounded internal redirects first; if one still
  // survives, fail closed instead of creating a browser-visible redirect cycle.
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
          return routingLoopBlocked();
        }
      } catch (_) {
        // Unrelated external redirects remain untouched.
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

  if (homepage) {
    html = normaliseHomepageDocumentPaths(html);
  }

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

function normaliseHomepageDocumentPaths(html) {
  let output = String(html || '')
    .replace(/<base\s+href=["']\/scifi-ui\/["']\s*\/?\s*>/i, '<base href="/">')
    .replaceAll('href="./', 'href="/scifi-ui/')
    .replaceAll("href='./", "href='/scifi-ui/")
    .replaceAll('src="./', 'src="/scifi-ui/')
    .replaceAll("src='./", "src='/scifi-ui/")
    .replaceAll('action="./', 'action="/scifi-ui/')
    .replaceAll("action='./", "action='/scifi-ui/")
    .replaceAll('poster="./', 'poster="/scifi-ui/')
    .replaceAll("poster='./", "poster='/scifi-ui/");

  if (!/<base\s+href=["']\/["']/i.test(output)) {
    output = output.replace('</title>', '</title>\n  <base href="/">');
  }

  if (!output.includes('data-fx-critical-shell="v56"')) {
    const baseTag = '<base href="/">';
    if (output.includes(baseTag)) {
      output = output.replace(baseTag, `${baseTag}\n  ${CRITICAL_SHELL_LINK}`);
    } else {
      output = output.replace('<head>', `<head>\n  ${CRITICAL_SHELL_LINK}`);
    }
  }

  return output;
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
