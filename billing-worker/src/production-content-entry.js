import productionBase from './production-content-entry-r369-base.js';

/* FormatX R504 — seed the canonical responsive reference state before stylesheet
   discovery. The deferred r244 reconciler remains the runtime owner, while its
   final hero descendant geometry now applies during the first layout. */

const STARTUP_REVISION = '20260903-r504-reference-state-first-paint';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const EVENT_HORIZON_PATH = '/scifi-ui/styles/formatx-event-horizon.css';
const FIRST_FRAME_STABILITY_LINK = '<link rel="stylesheet" fetchpriority="high" media="(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine)" data-fx-first-frame-stability-r500="true" href="/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=20260902-r500-canonical-hero-state">';
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r504="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r504-reference-state-first-paint">';
const FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)" data-fx-mobile-first-paint-r358="true" data-fx-production-first-paint-r370="true" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity">';
const P0_MOTION_SCHEDULER = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js?v=20260903-r502-mag-pause-ownership';
const DEFERRED_CSS_SCRIPT = '<script defer data-fx-deferred-css-r487="true" src="/scifi-ui/scripts/formatx-deferred-css-r487.js?v=20260831-r487-first-paint"></script>';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const META_CSP = "default-src 'self';base-uri 'self';object-src 'none';script-src 'self' 'sha256-G5n9M4P0L5SRhfb6wEKZXWR7jW5EtgZHj5zzAsDobuI=' https://static.cloudflareinsights.com;style-src 'self' 'sha256-7rBs0DG3JKiyRfhDmfxpOZ+oAz3c/ADQoufKFW6Kd68=';img-src 'self' data: https://quickchart.io;connect-src 'self' https://api.github.com https://cloudflareinsights.com https://static.cloudflareinsights.com;form-action 'self'";
const HEADER_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'sha256-G5n9M4P0L5SRhfb6wEKZXWR7jW5EtgZHj5zzAsDobuI=' https://static.cloudflareinsights.com",
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
  '# FormatX canonical robots policy — served by production Worker R499',
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
  '/scifi-ui/styles/platform-status.css',
  '/scifi-ui/styles/formatx-copy-polish.css',
  '/scifi-ui/styles/formatx-feedback.css',
]);

const R502_ASSET_REWRITES = new Map([
  ['/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js', {
    marker: 'scheduler-to-loader',
    rewrites: [[/formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g, 'formatx-motion-runtime-loader-r239.js?v=20260903-r502-mag-pause-ownership']],
  }],
  ['/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js', {
    marker: 'loader-to-mag-shape-sync',
    rewrites: [[/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260903-r502-mag-pause-ownership']],
  }],
  ['/scifi-ui/scripts/living-architecture.js', {
    marker: 'living-to-igloo',
    rewrites: [[/igloo-parity\.js\?v=[^"']+/g, 'igloo-parity.js?v=20260903-r502-mobile-box-model']],
  }],
  ['/scifi-ui/scripts/igloo-parity.js', {
    marker: 'igloo-to-site-stability',
    rewrites: [[/formatx-site-stability\.css\?v=[^"']+/g, 'formatx-site-stability.css?v=20260903-r502-mobile-box-model']],
  }],
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
    'X-FormatX-Robots-Owner': 'worker-r499',
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
function cacheBustR502Runtime(html) {
  return String(html || '')
    .replace(/formatx-event-horizon\.js\?v=[^"']+/g, 'formatx-event-horizon.js?v=20260902-r500-canonical-hero-state')
    .replace(/formatx-content-runtime-loader-r241\.js\?v=[^"']+/g, 'formatx-content-runtime-loader-r241.js?v=20260902-r497-no-late-layout')
    .replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260903-r502-mag-pause-ownership')
    .replace(/living-architecture\.js\?v=[^"']+/g, 'living-architecture.js?v=20260903-r502-mobile-box-model')
    .replace(/platform-status\.js\?v=[^"']+/g, 'platform-status.js?v=20260902-r500-canonical-hero-state')
    .replace(/platform-status\.css\?v=[^"']+/g, 'platform-status.css?v=20260902-r500-canonical-hero-state');
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
    'formatx-quality-r461.css?v=20260902-r500-canonical-hero-state'
  );
}
function optimizeHomepage(html) {
  let source = normalizeHomepageSemantics(html);
  source = cacheBustR502Runtime(source);
  source = scheduleMotionRuntime(source);
  source = normalizeMobileStylesheetMedia(source);
  source = injectCriticalFirstPaint(source);
  source = cacheBustCriticalQuality(source);
  source = deferNonCriticalStyles(source);
  source = injectDeferredCssRuntime(source);
  return source;
}
function stripNestedFirstFrameImport(css) {
  return String(css || '').replace(/^\s*@import\s+url\(["']?\.\/formatx-first-frame-stability-r283\.css[^)]*\)\s*;\s*/i, '');
}
async function rewriteR502DeliveryAsset(url, response, headers) {
  const spec = R502_ASSET_REWRITES.get(url.pathname);
  if (!spec) return null;
  let source = await response.text();
  for (const [pattern, replacement] of spec.rewrites) source = source.replace(pattern, replacement);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('X-FormatX-R502-Asset-Graph', spec.marker);
  return new Response(source, { status: response.status, statusText: response.statusText, headers });
}
async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('X-FormatX-Edge-Stability', `r504-reference-state-first-paint:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r504-reference-state-r502-mobile-box-model');
  headers.set('X-FormatX-Motion-Scheduler', 'r502-mag-pause-ownership');
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
    headers.set('X-FormatX-First-Frame-Import', 'removed-r499-canonical-owner');
    return new Response(css, { status: response.status, statusText: response.statusText, headers });
  }
  const r502Asset = await rewriteR502DeliveryAsset(url, response, headers);
  if (r502Asset) return r502Asset;
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
