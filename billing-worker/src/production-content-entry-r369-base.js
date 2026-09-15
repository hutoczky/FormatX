import contentPipeline from './production-content-base.js';

const CANONICAL_ORIGIN = 'https://formatxsuite.com';
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_WWW_HOST = 'www.formatxsuite.com';
const INTERNAL_HOST = 'formatx-routing.internal';
const RECOVERY_PARAM = '_fx_redirect_recovery';
const RECOVERY_SCRIPT = '<script defer data-fx-canonical-recovery="true" src="/scifi-ui/scripts/formatx-canonical-recovery.js?v=20260819-r243-language-canonical"></script>';
const CRITICAL_SHELL_LINK = '<link rel="stylesheet" data-fx-critical-shell="v56" href="/scifi-ui/styles/formatx-critical-shell-v56.css?v=20260818-r206-first-paint">';
const R206_BOOTSTRAP = [
  '<link rel="stylesheet" data-fx-award-readiness-style="true" href="/scifi-ui/styles/formatx-award-readiness.css?v=20260818-r206-lcp-stability">',
  '<link rel="stylesheet" media="(max-width: 900px)" data-fx-mobile-reference-layout-style="true" href="/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260818-r207-preloaded">',
  '<link rel="stylesheet" media="(max-width: 900px)" data-fx-flow-first-r74="true" href="/scifi-ui/styles/formatx-flow-first-r74.css?v=20260818-r207-preloaded">',
  '<link rel="stylesheet" media="(max-width: 900px)" data-fx-responsive-text-guard="true" href="/scifi-ui/styles/formatx-responsive-text-guard-r72.css?v=20260818-r207-preloaded">',
  '<link rel="stylesheet" media="(max-width: 900px)" data-fx-mobile-proof-controls-r204="true" href="/scifi-ui/styles/formatx-mobile-proof-controls-r204.css?v=20260818-r207-preloaded">',
  '<link rel="stylesheet" media="(max-width: 900px)" data-fx-mobile-layout-r207="true" href="/scifi-ui/styles/formatx-mobile-layout-r207.css?v=20260824-native-orb-r250">',
  '<link rel="stylesheet" media="(max-width: 900px)" data-fx-native-orb-reference-r250="true" href="/scifi-ui/styles/formatx-native-orb-reference-r250.css?v=20260824-native-orb-r250">',
  '<link rel="stylesheet" data-fx-first-paint-r206="true" href="/scifi-ui/styles/formatx-first-paint-r206.css?v=20260818-r206-stable-hero">',
  '<script defer data-fx-mobile-reference-layout="true" src="/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260824-native-orb-r250"></script>',
  '<script defer data-fx-flow-first-r75="true" src="/scifi-ui/scripts/formatx-flow-first-r75.js?v=20260820-r248-reference-owner"></script>',
  '<script defer data-fx-mobile-layout-r207="true" src="/scifi-ui/scripts/formatx-mobile-layout-r207.js?v=20260824-native-orb-r250"></script>',
].join('\n  ');
const STARTUP_REVISION = '20260818-r208-flicker-free-owner';
const STARTUP_COOKIE = /(?:^|;\s*)fx_startup_r208=1(?:;|$)/;
const HOMEPAGE_LANGUAGE_META = {
  hu: {
    title: 'FormatX Suite Pro | Technikusi operációs réteg',
    description: 'Független technikusi operációs réteg diagnosztikához, telepítéshez, meghajtókezeléshez és ellenőrizhető karbantartáshoz.',
    locale: 'hu_HU',
    alternateLocale: 'en_GB',
    inLanguage: 'hu-HU',
  },
  en: {
    title: 'FormatX Suite Pro | Technician Operating Layer',
    description: 'An independent technician operating layer for diagnostics, installation, drive management and verifiable maintenance. Full release with a 5-day trial licence.',
    locale: 'en_GB',
    alternateLocale: 'hu_HU',
    inLanguage: 'en-GB',
  },
};

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
  r208 flicker-free mobile layout ownership.

  Readable content and mobile layout remain independent from the WebGL renderer.
  The Worker preloads one authoritative normal-flow mobile layer and its DOM
  reconciler. Legacy r75/r180 geometry writers delegate to that owner and the
  r208 inline shield removes stale cached inline geometry before paint. The new
  startup revision performs a one-shot cache migration from earlier r207 assets.

  Current product/content contracts remain delegated to production-content-base.js:
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

    if (url.hostname === LEGACY_WWW_HOST && HOMEPAGE_ALIASES.has(url.pathname)) {
      const target = new URL('/', CANONICAL_ORIGIN);
      const language = supportedLanguage(url.searchParams.get('lang'));
      if (language) target.searchParams.set('lang', language);
      target.searchParams.set(RECOVERY_PARAM, '1');
      return temporaryRedirect(target.toString());
    }

    if (url.hostname === CANONICAL_HOST && HOMEPAGE_ALIASES.has(url.pathname)) {
      if (url.pathname !== '/') {
        const target = new URL('/', CANONICAL_ORIGIN);
        const language = supportedLanguage(url.searchParams.get('lang'));
        if (language) target.searchParams.set('lang', language);
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

function supportedLanguage(value) {
  return value === 'hu' || value === 'en' ? value : '';
}

function canonicalHomepageUrl(publicUrl) {
  const language = supportedLanguage(publicUrl.searchParams.get('lang'));
  return language
    ? `${CANONICAL_ORIGIN}/?lang=${language}`
    : `${CANONICAL_ORIGIN}/`;
}

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
    const canonical = canonicalHomepageUrl(publicUrl);
    const language = supportedLanguage(publicUrl.searchParams.get('lang'));
    headers.set('Link', `<${canonical}>; rel="canonical"`);
    if (language) headers.set('Content-Language', language);
    headers.set('X-FormatX-Shell', 'v56');
    headers.set('X-FormatX-Client-Revision', 'r208-flicker-free-owner');
    headers.set('X-FormatX-Startup-Mode', 'canonical-normal-flow');
    headers.set('X-FormatX-Recovery', 'r243-language-canonical');

    const cookie = request.headers.get('Cookie') || '';
    if (!STARTUP_COOKIE.test(cookie)) {
      headers.set('Clear-Site-Data', '"cache"');
      headers.append(
        'Set-Cookie',
        'fx_startup_r208=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly',
      );
      headers.set('X-FormatX-Cache-Migration', 'r208-one-shot-cleared');
    }
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
    html = alignHomepageLanguageMetadata(html, publicUrl);
    html = injectR206Bootstrap(html);
    html = cacheBustCriticalCoreR206(html);
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

function replaceMetaContent(html, attribute, name, value) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<meta\\b(?=[^>]*\\b${attribute}=["']${escaped}["'])[^>]*\\bcontent=["'])[^"']*(["'][^>]*>)`, 'i');
  return html.replace(pattern, `$1${value}$2`);
}

function alignHomepageLanguageMetadata(html, publicUrl) {
  const language = supportedLanguage(publicUrl.searchParams.get('lang'));
  const canonical = canonicalHomepageUrl(publicUrl);
  const metadata = language ? HOMEPAGE_LANGUAGE_META[language] : null;
  let output = String(html || '');

  if (language) {
    output = output.replace(/<html\b([^>]*?)\blang=["'][^"']*["']/i, `<html$1lang="${language}"`);
    output = output.replace(/(<title>)[\s\S]*?(<\/title>)/i, `$1${metadata.title}$2`);
    output = replaceMetaContent(output, 'name', 'description', metadata.description);
    output = replaceMetaContent(output, 'property', 'og:title', metadata.title);
    output = replaceMetaContent(output, 'property', 'og:description', metadata.description);
    output = replaceMetaContent(output, 'property', 'og:locale', metadata.locale);
    output = replaceMetaContent(output, 'property', 'og:locale:alternate', metadata.alternateLocale);
    output = replaceMetaContent(output, 'name', 'twitter:title', metadata.title);
    output = replaceMetaContent(output, 'name', 'twitter:description', metadata.description);
  }

  output = output.replace(
    /(<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["'])[^"']*(["'][^>]*>)/i,
    `$1${canonical}$2`,
  );
  output = output.replace(
    /(<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["'])[^"']*(["'][^>]*>)/i,
    `$1${canonical}$2`,
  );

  if (language) {
    output = output.replace(
      /(<script\b[^>]*\bid=["']formatx-structured-data["'][^>]*>)([\s\S]*?)(<\/script>)/i,
      (match, open, rawJson, close) => {
        try {
          const payload = JSON.parse(rawJson);
          const graph = Array.isArray(payload?.['@graph']) ? payload['@graph'] : [];
          const webPage = graph.find((node) => node && node['@type'] === 'WebPage');
          if (!webPage) return match;
          webPage['@id'] = `${canonical}#webpage`;
          webPage.url = canonical;
          webPage.name = metadata.title;
          webPage.description = metadata.description;
          webPage.inLanguage = metadata.inLanguage;
          return `${open}${JSON.stringify(payload)}${close}`;
        } catch (_) {
          return match;
        }
      },
    );
  }

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

function injectR206Bootstrap(html) {
  let output = String(html || '');
  if (!output.includes('data-fx-first-paint-r206="true"')) {
    output = output.replace('</head>', `  ${R206_BOOTSTRAP}\n</head>`);
  }
  return output;
}

function cacheBustCriticalCoreR206(html) {
  return String(html || '').replace(
    /(<script\b[^>]*src=["'][^"']*formatx-core-real3d-v20\.js[^"']*)(["'][^>]*>\s*<\/script>)/i,
    (match, prefix, suffix) => {
      const cleaned = prefix
        .replace(/([?&])fx(?:r|rev|stable)=[^&"']*/gi, '$1')
        .replace(/[?&]$/, '');
      return `${cleaned}${cleaned.includes('?') ? '&' : '?'}fxstable=${STARTUP_REVISION}${suffix}`;
    },
  );
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
