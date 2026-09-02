import productionBase from './production-content-entry-r369-base.js';

/*
  FormatX r490 — P0 first-paint stabilizer + evidence-safe public edge owner.

  The production base remains the functional owner. This edge layer keeps the
  canonical security/robots contract, adds the P0 first-paint geometry lock and
  lets one stable readable frame paint before non-critical presentation styles
  and the heavy MAG/WebGL motion runtime join the cascade. No product feature or
  MAG/WebGL capability is removed.
*/

const STARTUP_REVISION = '20260902-r490-p0-first-paint-motion';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r490="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260902-r490-p0">';
const FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)" data-fx-mobile-first-paint-r358="true" data-fx-production-first-paint-r370="true" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity">';
const P0_MOTION_SCHEDULER = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js?v=20260902-r490-p0';
const DEFERRED_CSS_SCRIPT = '<script defer data-fx-deferred-css-r487="true" src="/scifi-ui/scripts/formatx-deferred-css-r487.js?v=20260831-r487-first-paint"></script>';
const META_CSP = "default-src 'self';base-uri 'self';object-src 'none';script-src 'self' https://static.cloudflareinsights.com;style-src 'self' 'sha256-7rBs0DG3JKiyRfhDmfxpOZ+oAz3c/ADQoufKFW6Kd68=';img-src 'self' data: https://quickchart.io;connect-src 'self' https://api.github.com https://cloudflareinsights.com https://static.cloudflareinsights.com;form-action 'self'";
const HEADER_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'sha256-7rBs0DG3JKiyRfhDmfxpOZ+oAz3c/ADQoufKFW6Kd68='",
  "img-src 'self' data: https://quickchart.io",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com https://cloudflareinsights.com https://static.cloudflareinsights.com",
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');
const ROBOTS = [
  '# FormatX canonical robots policy — served by the production Worker r490',
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  'Disallow: /scifi-ui/payment/',
  '',
  'Sitemap: https://formatxsuite.com/sitemap.xml',
  '',
].join('\n');

const DEFERRED_STYLE_PATHS = new Set([
  '/scifi-ui/styles/formatx-continuous-scroll.css',
  '/scifi-ui/styles/formatx-seamless-loop.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
  '/scifi-ui/styles/platform-status.css',
  '/scifi-ui/styles/formatx-copy-polish.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-content-standard.css',
  '/scifi-ui/styles/formatx-feedback.css',
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
]);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}

function isPublicRequest(url) {
  return PUBLIC_HOSTS.has(url.hostname);
}

function robotsResponse(request) {
  const headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'X-FormatX-Robots-Owner': 'worker-r490',
  });
  return new Response(request.method === 'HEAD' ? null : ROBOTS, { status: 200, headers });
}

function normalizeMetaCsp(html) {
  const source = String(html || '');
  const tag = `<meta http-equiv="Content-Security-Policy" content="${META_CSP}">`;
  if (/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i.test(source)) {
    return source.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i, tag);
  }
  return source.replace(/<meta\s+name=["']color-scheme["'][^>]*>/i, match => `${match}\n  ${tag}`);
}

function injectP0FirstPaint(html) {
  const source = String(html || '');
  if (source.includes('data-fx-p0-first-paint-r490="true"')) return source;
  return source.replace('</head>', `  ${P0_FIRST_PAINT_LINK}\n</head>`);
}

function injectFirstPaint(html) {
  const source = String(html || '');
  if (source.includes('data-fx-production-first-paint-r370="true"')) return source;
  return source.replace('</head>', `  ${FIRST_PAINT_LINK}\n</head>`);
}

function normalizeHomepageSemantics(html) {
  let source = String(html || '');
  source = source.replace(
    /<section\s+id=["']live-os-overview["']/i,
    match => /data-fx-live-os=/i.test(match) ? match : `${match} data-fx-live-os="true"`
  );
  source = source.replace(
    /<a\b([^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'][^>]*)>/i,
    (match, attrs) => /data-fx-skip-link=/i.test(attrs) ? match : `<a${attrs} data-fx-skip-link="true">`
  );
  return source;
}

function scheduleMotionRuntime(html) {
  return String(html || '').replace(
    /<script\b([^>]*\bdata-fx-motion-runtime-loader-r239=["']true["'][^>]*)\bsrc=(["'])[^"']*formatx-motion-runtime-loader-r239\.js[^"']*\2([^>]*)><\/script>/i,
    (_match, before, quote, after) => `<script${before}src=${quote}${P0_MOTION_SCHEDULER}${quote}${after} data-fx-p0-motion-scheduler-r490="true"></script>`
  );
}

function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function deferNonCriticalStyles(html) {
  let awardReadinessSeen = false;
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
    if (!hrefMatch) return tag;

    let pathname = '';
    try {
      pathname = new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname;
    } catch (_) {
      return tag;
    }

    if (pathname === '/scifi-ui/styles/formatx-award-readiness.css') {
      if (awardReadinessSeen) return '';
      awardReadinessSeen = true;
    }
    if (!DEFERRED_STYLE_PATHS.has(pathname)) return tag;

    const mediaMatch = tag.match(/\smedia=(["'])(.*?)\1/i);
    const originalMedia = mediaMatch ? mediaMatch[2] : 'all';
    let next = mediaMatch ? tag.replace(mediaMatch[0], '') : tag;
    const close = /\/>$/.test(next) ? '/>' : '>';
    next = next.replace(/\s*\/?>$/, '');
    return `${next} data-fx-r487-deferred-style="true" data-fx-r487-media="${escapeAttribute(originalMedia)}" media="print"${close}`;
  });
}

function injectDeferredCssRuntime(html) {
  const source = String(html || '');
  if (source.includes('data-fx-deferred-css-r487="true"')) return source;
  return source.replace('</head>', `  ${DEFERRED_CSS_SCRIPT}\n</head>`);
}

function cacheBustR490CriticalQuality(html) {
  return String(html || '').replace(
    /formatx-quality-r461\.css\?v=[^"']+/g,
    'formatx-quality-r461.css?v=20260902-r490-p0-stability'
  );
}

function optimizeHomepage(html) {
  let source = normalizeHomepageSemantics(html);
  source = scheduleMotionRuntime(source);
  source = injectP0FirstPaint(source);
  source = injectFirstPaint(source);
  source = cacheBustR490CriticalQuality(source);
  source = deferNonCriticalStyles(source);
  source = injectDeferredCssRuntime(source);
  return source;
}

async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;

  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('X-FormatX-Edge-Stability', `r490-p0-first-paint:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r487-post-first-paint');
  headers.set('X-FormatX-Motion-Scheduler', 'r490-post-first-paint');

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
  html = normalizeMetaCsp(html);
  if (HOMEPAGE_PATHS.has(url.pathname)) html = optimizeHomepage(html);

  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store, max-age=0');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isSafeMethod(request) && isPublicRequest(url) && url.pathname === '/robots.txt') {
      return robotsResponse(request);
    }
    const response = await productionBase.fetch(request, env, ctx);
    return stabilizePublicResponse(request, url, response);
  },
};
