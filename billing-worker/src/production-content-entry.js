import productionBase from './production-content-entry-r369-base.js';

/* FormatX R493 — deterministic P0 first-frame edge owner.
   Server-visible product/MAG/Live OS content stays intact. The settled hero
   geometry is discovered in parallel with the rest of the critical CSS, while
   genuinely non-layout presentation remains deferred. */

const STARTUP_REVISION = '20260902-r493-deterministic-first-frame';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const FIRST_FRAME_STABILITY_LINK = '<link rel="stylesheet" fetchpriority="high" media="(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine)" data-fx-first-frame-stability-r493="true" href="/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=20260823-r320-render-blocking">';
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r490="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260902-r493-deterministic-first-frame">';
const FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)" data-fx-mobile-first-paint-r358="true" data-fx-production-first-paint-r370="true" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity">';
const P0_MOTION_SCHEDULER = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js?v=20260902-r493-explicit-intent';
const DEFERRED_CSS_SCRIPT = '<script defer data-fx-deferred-css-r487="true" src="/scifi-ui/scripts/formatx-deferred-css-r487.js?v=20260831-r487-first-paint"></script>';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
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
  '# FormatX canonical robots policy — served by production Worker R493',
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  'Disallow: /scifi-ui/payment/',
  '',
  'Sitemap: https://formatxsuite.com/sitemap.xml',
  '',
].join('\n');

/* IMPORTANT: never defer a stylesheet that can alter hero/header geometry.
   Award readiness, content-standard, reference/flow/text guards and mobile
   layout owners therefore remain normal blocking styles. */
const DEFERRED_STYLE_PATHS = new Set([
  '/scifi-ui/styles/formatx-continuous-scroll.css',
  '/scifi-ui/styles/formatx-seamless-loop.css',
  '/scifi-ui/styles/platform-status.css',
  '/scifi-ui/styles/formatx-copy-polish.css',
  '/scifi-ui/styles/formatx-feedback.css',
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
    'X-FormatX-Robots-Owner': 'worker-r493',
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
function injectFirstFrameStability(html) {
  const source = String(html || '');
  if (source.includes('data-fx-first-frame-stability-r493="true"')) return source;
  return source.replace('</head>', `  ${FIRST_FRAME_STABILITY_LINK}\n</head>`);
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
function normalizeMobileStylesheetMedia(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
    if (!hrefMatch) return tag;
    let pathname = '';
    try {
      pathname = new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname;
    } catch (_) {
      return tag;
    }
    if (pathname !== '/scifi-ui/styles/formatx-mobile-apex-composition.css') return tag;
    if (/\smedia=(["'])(.*?)\1/i.test(tag)) return tag;
    return tag.replace(/\s*\/?>$/, close => ` media="${MOBILE_MEDIA}"${close}`);
  });
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
function cacheBustCriticalQuality(html) {
  return String(html || '').replace(
    /formatx-quality-r461\.css\?v=[^"']+/g,
    'formatx-quality-r461.css?v=20260902-r493-deterministic-first-frame'
  );
}
function optimizeHomepage(html) {
  let source = normalizeHomepageSemantics(html);
  source = scheduleMotionRuntime(source);
  source = normalizeMobileStylesheetMedia(source);
  source = injectFirstFrameStability(source);
  source = injectP0FirstPaint(source);
  source = injectFirstPaint(source);
  source = cacheBustCriticalQuality(source);
  source = deferNonCriticalStyles(source);
  source = injectDeferredCssRuntime(source);
  return source;
}
async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('X-FormatX-Edge-Stability', `r493-deterministic-first-frame:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r493-parallel-final-geometry');
  headers.set('X-FormatX-Motion-Scheduler', 'r493-explicit-intent-late-auto');
  if (request.method === 'HEAD') {
    headers.delete('Content-Length');
    return new Response(null, { status: response.status, statusText: response.statusText, headers });
  }
  const contentType = headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  let html = await response.text();
  html = normalizeMetaCsp(html);
  if (HOMEPAGE_PATHS.has(url.pathname)) html = optimizeHomepage(html);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store, max-age=0');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
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
