import productionBase from './production-content-entry-r369-base.js';

/* FormatX R514 — preserve the proven R513 MAG runtime and R504/R506 first-paint
   contracts while removing the exact R513 Lighthouse first-divergence owner from
   the blocking path. R513 artifact 9912491940 showed critical-core-r227 as the
   sole render blocker on the fast run and the largest modeled H3 blocker on the
   slow runs. It now uses the existing R487 double-rAF post-first-paint scheduler;
   MAG clock, PAUSE/RESUME, ASK and renderer ownership remain unchanged. */

const STARTUP_REVISION = '20260903-r514-critical-core-post-first-paint';
const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const EVENT_HORIZON_PATH = '/scifi-ui/styles/formatx-event-horizon.css';
const REFERENCE_MODE_BOOT_SCRIPT = '<script fetchpriority="high" data-fx-reference-mode-boot-r504="true" src="/scifi-ui/scripts/formatx-reference-mode-boot-r334.js?v=20260903-r504-prepaint-reference-mode"></script>';
const FIRST_FRAME_STABILITY_LINK = '<link rel="stylesheet" fetchpriority="high" media="(prefers-reduced-motion: no-preference) and (min-width: 901px) and (pointer: fine)" data-fx-first-frame-stability-r500="true" href="/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=20260902-r500-canonical-hero-state">';
const P0_FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-p0-first-paint-r503="true" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r503-hero-ancestor-first-frame">';
const FIRST_PAINT_LINK = '<link rel="stylesheet" fetchpriority="high" media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)" data-fx-mobile-first-paint-r358="true" data-fx-production-first-paint-r370="true" href="/scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity">';
const P0_MOTION_SCHEDULER = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js?v=20260903-r505-mag-resume-clock';
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
  // R514: artifact-proven first-divergence owner; activate with the existing
  // R487 double-rAF scheduler after the first painted frame.
  '/scifi-ui/styles/formatx-critical-core-r227.css',
  '/scifi-ui/styles/formatx-continuous-scroll.css',
  '/scifi-ui/styles/formatx-seamless-loop.css',
  '/scifi-ui/styles/platform-status.css',
  '/scifi-ui/styles/formatx-copy-polish.css',
  '/scifi-ui/styles/formatx-feedback.css',
  '/scifi-ui/styles/single-language-toggle.css',
  '/scifi-ui/styles/formatx-content-standard.css',
]);

const R502_ASSET_REWRITES = new Map([
  ['/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js', {
    marker: 'scheduler-to-loader-r505',
    rewrites: [[/formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g, 'formatx-motion-runtime-loader-r239.js?v=20260903-r505-mag-resume-clock']],
  }],
  ['/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js', {
    marker: 'loader-to-mag-shape-sync-r505',
    rewrites: [[/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260903-r505-mag-resume-clock']],
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
    'Alt-Svc': 'clear',
    'X-FormatX-Transport-Stability': 'r514-critical-core-post-first-paint',
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
function injectReferenceModeBoot(html) {
  const source = String(html || '');
  if (source.includes('data-fx-reference-mode-boot-r504="true"') || /formatx-reference-mode-boot-r334\.js/i.test(source)) return source;
  return source.replace('</head>', `  ${REFERENCE_MODE_BOOT_SCRIPT}\n</head>`);
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
    .replace(/formatx-event-horizon\.js\?v=[^"']+/g, 'formatx-event-horizon.js?v=20260903-r507-mag-single-clock-owner')
    .replace(/formatx-content-runtime-loader-r241\.js\?v=[^"']+/g, 'formatx-content-runtime-loader-r241.js?v=20260902-r497-no-late-layout')
    .replace(/formatx-mag-shape-sync-r476\.js\?v=[^"']+/g, 'formatx-mag-shape-sync-r476.js?v=20260903-r505-mag-resume-clock')
    .replace(/living-architecture\.js\?v=[^"']+/g, 'living-architecture.js?v=20260903-r502-mobile-box-model')
    .replace(/platform-status\.js\?v=[^"']+/g, 'platform-status.js?v=20260902-r500-canonical-hero-state')
    .replace(/platform-status\.css\?v=[^"']+/g, 'platform-status.css?v=20260902-r500-canonical-hero-state');
}
function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function dedupeAwardReadinessStylesheet(html) {
  const source = String(html || '');
  const links = source.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || [];
  const target = '/scifi-ui/styles/formatx-award-readiness.css';
  const count = links.reduce((total, tag) => total + (stylesheetPath(tag) === target ? 1 : 0), 0);
  if (count <= 1) return source;
  let remaining = count;
  return source.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    if (stylesheetPath(tag) !== target) return tag;
    const keep = remaining === 1;
    remaining -= 1;
    return keep ? tag : '';
  });
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
  source = injectReferenceModeBoot(source);
  source = injectCriticalFirstPaint(source);
  source = cacheBustCriticalQuality(source);
  source = dedupeAwardReadinessStylesheet(source);
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
  headers.set('X-FormatX-R505-Asset-Graph', spec.marker);
  return new Response(source, { status: response.status, statusText: response.statusText, headers });
}
async function stabilizePublicResponse(request, url, response) {
  if (!isSafeMethod(request) || !isPublicRequest(url)) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', HEADER_CSP);
  headers.set('Alt-Svc', 'clear');
  headers.set('X-FormatX-Transport-Stability', 'r514-critical-core-post-first-paint');
  headers.set('X-FormatX-Edge-Stability', `r514-critical-core:${STARTUP_REVISION}`);
  headers.set('X-FormatX-CSS-Scheduler', 'r514-critical-core-r487-post-first-paint-r504-prepaint');
  headers.set('X-FormatX-Motion-Scheduler', 'r507-single-css-animation-clock-owner');
  headers.set('X-FormatX-Mag-Clock-Owner', 'shape-sync-r476-only');
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
