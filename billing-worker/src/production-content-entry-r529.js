import canonicalProduction from './production-content-entry.js';

/* FormatX R529 — direct canonical production ownership + R527 FCP preservation
   + R528 living-core/mobile first-paint closeout.

   Evidence:
   - R528 deploy 33931843758 was blocked before deployment because the versioned
     entry delegated indirectly through R527 instead of directly to the canonical
     production-content-entry.js required by production preflight.
   - R527 mobile LHRs proved a client/render slow path. The bad runs introduced a
     late fx-mag-heart-hit-r252 layout shift and ~1.8 s of legacy mobile CSS
     render blocking. R529 makes the real heart hit-surface part of initial HTML
     and keeps R528's mobile legacy CSS on the existing post-FCP scheduler.
   - Manual MAG pause is not a product contract. Normal MAG remains alive;
     reduced-motion/background lifecycle stays owned by the R528 runtime.
   - R533 refreshes the proven lightweight preloader with the roadmap timing,
     compositor visual deadline and lower-frequency progress work; the underlying
     R529 production/content/LCP architecture remains unchanged.
   - R533 CI is allowed to exercise this exact production entry only on the
     dedicated local candidate endpoint 127.0.0.1:8787 / localhost:8787. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const LOCAL_CANDIDATE_HOSTS = new Set(['127.0.0.1', 'localhost']);
const LOCAL_CANDIDATE_PORT = '8787';
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const CRITICAL_CORE_PATH = '/scifi-ui/styles/formatx-critical-core-r227.css';
const DEFERRED_SCHEDULER_RE = /formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = 'formatx-deferred-css-r487.js?v=20260904-r526-fcp-observer';
const EVENT_HORIZON_RE = /formatx-event-horizon\.js\?v=[^"']+/g;
const EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r533-intro-lcp-v1';
const DEFERRED_REDUCED_RE = /formatx-deferred-reduced-style-r232\.js\?v=[^"']+/g;
const DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner';
const QUALITY_RE = /formatx-quality-r461\.css\?v=[^"']+/g;
const QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r533-compositor-bound-v1';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const DESKTOP_MEDIA = '(min-width: 901px) and (pointer: fine) and (min-aspect-ratio: 27/25)';
const HEART_STYLE_PATH = '/scifi-ui/styles/formatx-heart-core-r252.css';
const HEART_STYLE_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-heart-core-r252="true" href="/scifi-ui/styles/formatx-heart-core-r252.css?v=20260905-r529-first-paint-hit-surface">';
const HEART_BUTTON = '<button type="button" class="fx-mag-heart-hit-r252" data-fx-heart-core-r252="true" aria-label="A FormatX élő MAG interakciójának indítása"></button>';

const MOBILE_LEGACY_PATHS = new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);
const GLOBAL_LEGACY_PATHS = new Set([
  '/scifi-ui/styles/formatx-critical-shell-v56.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
  '/scifi-ui/styles/formatx-quality-r461.css',
]);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}
function isDeliveryHost(url) {
  if (PUBLIC_HOSTS.has(url.hostname)) return true;
  return LOCAL_CANDIDATE_HOSTS.has(url.hostname) && url.port === LOCAL_CANDIDATE_PORT;
}
function stylesheetPath(tag) {
  const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
  if (!hrefMatch) return '';
  try { return new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname; }
  catch (_) { return ''; }
}
function withoutAttr(tag, name) {
  return tag.replace(new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'gi'), '');
}
function addAttrs(tag, attrs) {
  return tag.replace(/\s*\/?>$/, close => `${attrs}${close}`);
}
function deferredMobile(tag) {
  let next = withoutAttr(withoutAttr(withoutAttr(withoutAttr(tag, 'media'), 'fetchpriority'), 'data-fx-r487-deferred-style'), 'data-fx-r487-media');
  return addAttrs(next, ` data-fx-r487-deferred-style="true" data-fx-r487-media="${MOBILE_MEDIA}" media="print" data-fx-r529-mobile-legacy="true"`);
}
function desktopCopy(tag) {
  let next = withoutAttr(withoutAttr(tag, 'media'), 'fetchpriority');
  return addAttrs(next, ` media="${DESKTOP_MEDIA}" data-fx-r529-desktop-preserved="true"`);
}
function restoreCriticalCoreFirstPaint(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    if (stylesheetPath(tag) !== CRITICAL_CORE_PATH) return tag;
    const mediaMatch = tag.match(/\sdata-fx-r487-media=(["'])(.*?)\1/i);
    const originalMedia = mediaMatch ? mediaMatch[2] : 'all';
    let next = tag
      .replace(/\sdata-fx-r487-deferred-style=(["'])true\1/gi, '')
      .replace(/\sdata-fx-r487-media=(["'])(.*?)\1/gi, '')
      .replace(/\smedia=(["'])print\1/gi, '');
    if (originalMedia && originalMedia !== 'all' && !/\smedia=(["'])(.*?)\1/i.test(next)) {
      next = next.replace(/\s*\/?>$/, close => ` media="${originalMedia}"${close}`);
    }
    if (!/\sfetchpriority=/i.test(next)) {
      next = next.replace(/\s*\/?>$/, close => ` fetchpriority="high"${close}`);
    }
    return next;
  });
}
function stabilizeMobileFirstPaint(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (MOBILE_LEGACY_PATHS.has(pathname)) return deferredMobile(tag);
    if (GLOBAL_LEGACY_PATHS.has(pathname)) {
      if (/data-fx-r487-deferred-style/i.test(tag)) return tag;
      return `${desktopCopy(tag)}\n  ${deferredMobile(tag)}`;
    }
    return tag;
  });
}
function injectStaticHeart(html) {
  let source = String(html || '');
  const links = source.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || [];
  if (!links.some(tag => stylesheetPath(tag) === HEART_STYLE_PATH)) {
    source = source.replace('</head>', `  ${HEART_STYLE_LINK}\n</head>`);
  }
  if (!source.includes('class="fx-mag-heart-hit-r252"')) {
    source = source.replace(/<div\s+class=(["'])hero-space\1\s*>/i, match => `${match}\n          ${HEART_BUTTON}`);
  }
  return source;
}
function r529Headers(source, url) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r529-direct-canonical-living-core');
  headers.set('X-FormatX-Edge-Stability', 'r529-r527-fcp-r528-mobile-post-fcp');
  headers.set('X-FormatX-CSS-Scheduler', 'r526-post-first-contentful-paint');
  headers.set('X-FormatX-Product-Contract', 'r529-living-core-no-manual-pause');
  headers.set('X-FormatX-Mobile-LCP', 'static-heart-hit-plus-legacy-post-fcp');
  headers.set('X-FormatX-Preloader', 'r533-roadmap-timing-navigation-owned');
  headers.set('X-FormatX-Preloader-Cache', 'r533-intro-lcp-v1-compositor-css-v1');
  if (LOCAL_CANDIDATE_HOSTS.has(url.hostname) && url.port === LOCAL_CANDIDATE_PORT) {
    headers.set('X-FormatX-Candidate-Delivery', 'r533-exact-production-entry-localhost-8787');
  }
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    const response = await canonicalProduction.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !isDeliveryHost(url)) return response;

    const headers = r529Headers(response.headers, url);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }
    const type = headers.get('Content-Type') || '';
    if (!type.includes('text/html')) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    let html = restoreCriticalCoreFirstPaint(await response.text());
    html = html.replace(DEFERRED_SCHEDULER_RE, DEFERRED_SCHEDULER_URL);
    html = html.replace(EVENT_HORIZON_RE, EVENT_HORIZON_URL);
    html = html.replace(DEFERRED_REDUCED_RE, DEFERRED_REDUCED_URL);
    html = html.replace(QUALITY_RE, QUALITY_URL);
    if (HOMEPAGE_PATHS.has(url.pathname)) {
      html = stabilizeMobileFirstPaint(html);
      html = injectStaticHeart(html);
    }
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};