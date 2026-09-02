import productionBase from './production-content-entry-r369-base.js';

/* FormatX R497 — immutable canonical first frame.
   Every stylesheet that owns hero geometry is active at its final media query
   before first paint. Interaction loaders may mount enhancement scripts only;
   they never change stylesheet media. The canonical MAG control owns both the
   WebGL pause event and the visible canvas animation play state. */

const STARTUP_REVISION = '20260902-r497-immutable-first-frame';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const EVENT_HORIZON_PATH = '/scifi-ui/styles/formatx-event-horizon.css';
const FIRST_FRAME_STABILITY_LINK = '<link rel="stylesheet" fetchpriority="high" media="(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine)" data-fx-first-frame-stability-r497="true" href="/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=20260902-r497-immutable-first-frame">';
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r497="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260902-r497-honeypot-touch">';
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
  '# FormatX canonical robots policy — served by production Worker R497',
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  'Disallow: /scifi-ui/payment/',
  '',
  'Sitemap: https://formatxsuite.com/sitemap.xml',
  '',
].join('\n');

/* These legacy bundles contain physical hero geometry and must never transition
   from media="not all" to active after first paint. Their own source comments
   identify them as critical first-frame/narrative owners. */
const FIRST_PAINT_LEGACY_MEDIA = new Map([
  ['/scifi-ui/styles/formatx-critical-signature-r227.css', '(prefers-reduced-motion: no-preference)'],
  ['/scifi-ui/styles/formatx-critical-narrative-r227.css', '(min-width: 901px) and (prefers-reduced-motion: no-preference)'],
]);

/* Only presentation/enhancement layers proven not to own first-frame geometry
   are deferred. Hero typography/layout, CTA geometry, language controls,
   content-standard spacing and first-paint geometry remain blocking. */
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
    'X-FormatX-Robots-Owner': 'worker-r497',
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
function stylesheetPath(tag) {
  const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
  if (!hrefMatch) return '';
  try {
    return new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname;
  } catch (_) {
    return '';
  }
}
function setTagAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'i');
  if (pattern.test(tag)) return tag.replace(pattern, ` ${name}="${value}"`);
  return tag.replace(/\s*\/?>$/, close => ` ${name}="${value}"${close}`);
}
function removeTagAttribute(tag, name) {
  const pattern = new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'i');
  return tag.replace(pattern, '');
}
function promoteLegacyFirstPaintStyles(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    const media = FIRST_PAINT_LEGACY_MEDIA.get(pathname);
    if (!media) return tag;
    let next = removeTagAttribute(tag, 'data-fx-deferred-media-r300');
    next = setTagAttribute(next, 'media', media);
    next = setTagAttribute(next, 'fetchpriority', 'high');
    next = setTagAttribute(next, 'data-fx-r497-critical-layout', 'true');
    return next;
  });
}
function injectCriticalFirstPaint(html) {
  let source = String(html || '');
  source = source.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (pathname === '/scifi-ui/styles/formatx-first-frame-stability-r283.css') return '';
    if (pathname === '/scifi-ui/styles/formatx-p0-first-paint-r490.css') return '';
    if (pathname === '/scifi-ui/styles/formatx-mobile-first-paint-r358.css' && /data-fx-production-first-paint-r370/i.test(tag)) return '';
    return tag;
  });
  const critical = `  ${FIRST_PAINT_LINK}\n  ${FIRST_FRAME_STABILITY_LINK}\n  ${P0_FIRST_PAINT_LINK}\n`;
  /* Canonical owners remain last in cascade order after every blocking layout
     bundle. Their geometry is therefore the geometry of the first paint. */
  return source.replace('</head>', `${critical}</head>`);
}
function normalizeMobileStylesheetMedia(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
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
function cacheBustR497Runtime(html) {
  return String(html || '')
    .replace(/formatx-event-horizon\.js\?v=[^"']+/g, 'formatx-event-horizon.js?v=20260902-r497-canonical-resume')
    .replace(/formatx-content-runtime-loader-r241\.js\?v=[^"']+/g, 'formatx-content-runtime-loader-r241.js?v=20260902-r497-no-late-layout');
}
function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function deferNonCriticalStyles(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (!pathname || !DEFERRED_STYLE_PATHS.has(pathname)) return tag;
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
    'formatx-quality-r461.css?v=20260902-r497-immutable-first-frame'
  );
}
function optimizeHomepage(html) {
  let source = normalizeHomepageSemantics(html);
  source = cacheBustR497Runtime(source);
  source = scheduleMotionRuntime(source);
  source = normalizeMobileStylesheetMedia(source);
  source = promoteLegacyFirstPaintStyles(source);
  source = injectCriticalFirstPaint(source);
  source = cacheBustCriticalQuality(source);
  source = deferNonCriticalStyles(source);
  source = injectDeferredCssRuntime(source);
  return source;
}
function stripNestedFirstFrameImport(css) {
  return String(css || '').replace(/^\s*@import\s+url\(["']?\.\/formatx-first-frame-stability-r283\.css[^)]*\)\s*;\s*/i, '');
}
async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('X-FormatX-Edge-Stability', `r497-immutable-first-frame:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r497-layout-critical-blocking-no-interaction-media-mutation');
  headers.set('X-FormatX-Motion-Scheduler', 'r493-explicit-intent-late-auto');
  if (request.method === 'HEAD') {
    headers.delete('Content-Length');
    return new Response(null, { status: response.status, statusText: response.statusText, headers });
  }
  const contentType = headers.get('Content-Type') || '';
  if (url.pathname === EVENT_HORIZON_PATH && contentType.includes('text/css')) {
    const css = stripNestedFirstFrameImport(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('X-FormatX-First-Frame-Import', 'removed-r497-canonical-owner');
    return new Response(css, { status: response.status, statusText: response.statusText, headers });
  }
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
