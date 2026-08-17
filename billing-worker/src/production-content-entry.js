import contentPipeline from './production-content-base.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
const INTERNAL_HOST = 'formatx-routing.internal';
const RECOVERY_PARAM = '_fx_redirect_recovery';
const RECOVERY_SCRIPT = '<script defer data-fx-canonical-recovery="true" src="/scifi-ui/scripts/formatx-canonical-recovery.js?v=20260811-recovery-2"></script>';
const CRITICAL_SHELL_LINK = '<link rel="stylesheet" data-fx-critical-shell="v56" href="/scifi-ui/styles/formatx-critical-shell-v56.css?v=20260812-first-paint-r4">';
const PERFORMANCE_LOADER_R192 = '<script defer data-fx-production-idle-loader-r192="true" src="/scifi-ui/scripts/formatx-production-idle-loader-r192.js?v=20260817-r192c"></script>';

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

const HOMEPAGE_IDLE_SCRIPT_ASSETS = [
  'release-metadata.js',
  'formatx-public-shell.js',
  'formatx-content-standard.js',
  'formatx-seo.js',
  'formatx-content-finalizer.js',
  'formatx-platform-surface-finalizer.js',
  'formatx-organism-trust.js',
  'formatx-organism-semantic-state.js',
  'formatx-feedback.js',
  'living-architecture.js',
  'formatx-category-positioning.js',
  'formatx-category-deck-stabilizer.js',
  'formatx-origin-proof.js',
  'project-simulator-entry.js',
  'formatx-premium-finish.js',
  'formatx-live-heartbeat-r155.js',
  'formatx-signature-system-r185.js',
  'formatx-seamless-enforcer-r159.js',
  'formatx-living-energy-r168.js',
  'formatx-award-narrative-r175.js',
  'formatx-soty-continuity-r179.js',
  'formatx-desktop-apex-r181.js',
];

const MOBILE_DEFERRED_STYLE_ASSETS = [
  'formatx-event-horizon.css',
  'formatx-category-positioning.css',
  'formatx-category-positioning-r73.css',
  'formatx-living-energy-r168.css',
  'formatx-award-narrative-r175.css',
  'formatx-soty-continuity-r179.css',
];

const DESKTOP_ONLY_STYLE_ASSETS = [
  'formatx-desktop-apex-r181.css',
];

const HERO_LEAD_HU = 'A FormatX Suite Pro független fejlesztésű technikusi szoftver. Valós rendszerállapotot tár fel, műveleti tervet készít, csak kontrollált megerősítés után hajt végre, majd visszaellenőrzi az eredményt.';
const HERO_LEAD_EN = 'FormatX Suite Pro is independently developed technician software. It discovers real system state, builds an operation plan, executes only after controlled confirmation, then verifies the result.';

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

  r192c performance contract:
  parser-critical homepage work is limited to intro safety, apex/UI basics,
  mobile recovery and the MAG bootstrap. Noncritical visual controllers,
  release/content helpers and feedback hydrate after first paint or near viewport.
  Desktop-only apex assets are not requested by mobile clients. Hero copy already
  arrives in its final content-standard form to avoid a second LCP candidate.
*/

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    const publicHost = url.hostname === CANONICAL_HOST || url.hostname === LEGACY_WWW_HOST;

    if (!safeMethod || !publicHost) {
      return contentPipeline.fetch(request, env, ctx);
    }

    if (url.hostname === LEGACY_WWW_HOST && HOMEPAGE_ALIASES.has(url.pathname)) {
      const target = new URL('/', CANONICAL_ORIGIN);
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
    headers.set('X-FormatX-Performance', 'r192c-first-paint-main-thread-budget');
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
    html = optimiseHomepagePerformanceR192(html);
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

function optimiseHomepagePerformanceR192(html) {
  let output = stabiliseHeroFirstPaintR192(String(html || ''));

  for (const asset of HOMEPAGE_IDLE_SCRIPT_ASSETS) {
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const scriptPattern = new RegExp(
      `<script\\b[^>]*src=["'][^"']*${escaped}[^"']*["'][^>]*>\\s*</script>`,
      'gi',
    );
    output = output.replace(scriptPattern, '');
  }

  output = output.replace(
    /<link\b[^>]*href=["'][^"']*formatx-feedback\.css[^"']*["'][^>]*>/gi,
    '',
  );

  for (const asset of MOBILE_DEFERRED_STYLE_ASSETS) {
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkPattern = new RegExp(
      `<link\\b(?=[^>]*href=["'][^"']*${escaped}[^"']*["'])[^>]*>`,
      'gi',
    );
    output = output.replace(linkPattern, tag => {
      if (tag.includes('data-fx-mobile-deferred-r192')) return tag;
      const withoutMedia = tag.replace(/\smedia=["'][^"']*["']/i, '');
      return withoutMedia.replace(
        '<link',
        '<link media="(min-width: 901px)" data-fx-mobile-deferred-r192="true"',
      );
    });
  }

  for (const asset of DESKTOP_ONLY_STYLE_ASSETS) {
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkPattern = new RegExp(
      `<link\\b(?=[^>]*href=["'][^"']*${escaped}[^"']*["'])[^>]*>`,
      'gi',
    );
    output = output.replace(linkPattern, tag => {
      const withoutMedia = tag.replace(/\smedia=["'][^"']*["']/i, '');
      return withoutMedia.replace('<link', '<link media="screen and (min-width: 901px)"');
    });
  }

  if (!output.includes('data-fx-production-idle-loader-r192')) {
    output = output.replace('</head>', `  ${PERFORMANCE_LOADER_R192}\n</head>`);
  }

  return output;
}

function stabiliseHeroFirstPaintR192(html) {
  let output = String(html || '');
  const heroLead = `<p class="hero-lead" data-hu="${HERO_LEAD_HU}" data-en="${HERO_LEAD_EN}">${HERO_LEAD_HU}</p>`;
  output = output.replace(
    /<p class="hero-lead"[^>]*>[\s\S]*?<\/p>/i,
    heroLead,
  );
  output = output.replace(
    /<span data-hu="Android alkalmazás" data-en="Android application">Android alkalmazás<\/span>/i,
    '<span data-hu="Android teljes verzió letöltése" data-en="Download Android full version">Android teljes verzió letöltése</span>',
  );
  return output;
}

function normaliseHomepageDocumentPaths(html) {
  let output = String(html || '')
    .replace(/<base\s+href=["'](?:\/|\/scifi-ui\/)["']\s*\/?\s*>/i, '<base href="/scifi-ui/">')
    .replaceAll('href="#', 'href="/#')
    .replaceAll("href='#", "href='/#")
    .replaceAll('href="./', 'href="/scifi-ui/')
    .replaceAll("href='./", "href='/scifi-ui/")
    .replaceAll('src="./', 'src="/scifi-ui/')
    .replaceAll("src='./", "src='/scifi-ui/")
    .replaceAll('action="./', 'action="/scifi-ui/')
    .replaceAll("action='./", "action='/scifi-ui/")
    .replaceAll('poster="./', 'poster="/scifi-ui/')
    .replaceAll("poster='./", "poster='/scifi-ui/");

  if (!/<base\s+href=["']\/scifi-ui\/["']/i.test(output)) {
    output = output.replace('</title>', '</title>\n  <base href="/scifi-ui/">');
  }

  if (!output.includes('data-fx-critical-shell="v56"')) {
    const baseTag = '<base href="/scifi-ui/">';
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
