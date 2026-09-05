import canonicalProduction from './production-content-entry.js';

/* FormatX R529/R535 — direct canonical production ownership + bounded static-content intro.
   Candidate mode exists only behind the Wrangler-only FORMATX_LOCAL_CANDIDATE=1
   binding and is absent from deployed production. Candidate requests traverse the
   same canonical production chain. R535 keeps the tiny reference layout selector
   prepaint, preserves the mobile critical/accessibility shell at first paint,
   starts the living MAG from navigation, and defers only non-critical enhancements. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const CANONICAL_CANDIDATE_ORIGIN = 'https://formatxsuite.com';
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const CRITICAL_CORE_PATH = '/scifi-ui/styles/formatx-critical-core-r227.css';
const P0_SCHEDULER_PATH = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js';
const P0_MOTION_SCHEDULER_RE = /formatx-p0-motion-scheduler-r490\.js\?v=[^"']+/g;
const P0_MOTION_SCHEDULER_URL = 'formatx-p0-motion-scheduler-r490.js?v=20260906-r535-navigation-mag-scroll-intent';
const MOTION_RUNTIME_RE = /formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g;
const MOTION_RUNTIME_URL = 'formatx-motion-runtime-loader-r239.js?v=20260906-r535-scroll-intent-owner';
const DEFERRED_SCHEDULER_RE = /formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = 'formatx-deferred-css-r487.js?v=20260906-r535-mobile-scroll-intent-v2';
const EVENT_HORIZON_RE = /formatx-event-horizon\.js\?v=[^"']+/g;
const EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r534-static-lcp-v1';
const DEFERRED_REDUCED_RE = /formatx-deferred-reduced-style-r232\.js\?v=[^"']+/g;
const DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner';
const QUALITY_RE = /formatx-quality-r461\.css\?v=[^"']+/g;
const QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r533-compositor-bound-v1';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const HEART_STYLE_PATH = '/scifi-ui/styles/formatx-heart-core-r252.css';
const HEART_STYLE_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-heart-core-r252="true" href="/scifi-ui/styles/formatx-heart-core-r252.css?v=20260905-r529-first-paint-hit-surface">';
const HEART_BUTTON = '<button type="button" class="fx-mag-heart-hit-r252" data-fx-heart-core-r252="true" aria-label="A FormatX élő MAG interakciójának indítása"></button>';
const MOBILE_FIRST_PAINT_PRELOAD = '</scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity>; rel=preload; as=style; media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)"';
const P0_FIRST_PAINT_PRELOAD = '</scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r503-hero-ancestor-first-frame>; rel=preload; as=style';
const HEART_STYLE_PRELOAD = '</scifi-ui/styles/formatx-heart-core-r252.css?v=20260905-r529-first-paint-hit-surface>; rel=preload; as=style';

const MOBILE_LEGACY_PATHS = new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);

function isSafeMethod(request) { return request.method === 'GET' || request.method === 'HEAD'; }
function isLocalCandidateEnv(env) { return String(env?.FORMATX_LOCAL_CANDIDATE || '') === '1'; }
function isDeliveryHost(url, localCandidate) { return PUBLIC_HOSTS.has(url.hostname) || localCandidate; }
function canonicalDeliveryRequest(request, url) {
  const canonicalUrl = new URL(url.pathname + url.search, CANONICAL_CANDIDATE_ORIGIN);
  return new Request(canonicalUrl, request);
}
function stylesheetPath(tag) {
  const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
  if (!hrefMatch) return '';
  try { return new URL(hrefMatch[2], 'https://formatxsuite.com/scifi-ui/').pathname; }
  catch (_) { return ''; }
}
function withoutAttr(tag, name) {
  if (!/^[a-z0-9-]+$/i.test(name)) return tag;
  const lower = tag.toLowerCase();
  const needle = `${name.toLowerCase()}=`;
  let index = 0;
  while ((index = lower.indexOf(needle, index)) !== -1) {
    const before = index - 1;
    if (before < 0 || !/\s/.test(tag[before])) { index += needle.length; continue; }
    const quote = tag[index + needle.length];
    if (quote !== '"' && quote !== "'") { index += needle.length; continue; }
    const end = tag.indexOf(quote, index + needle.length + 1);
    if (end === -1) return tag;
    return tag.slice(0, before) + tag.slice(end + 1);
  }
  return tag;
}
function addAttrs(tag, attrs) { return tag.replace(/\s*\/?>$/, close => `${attrs}${close}`); }
function deferredMobile(tag) {
  let next = withoutAttr(withoutAttr(withoutAttr(withoutAttr(tag, 'media'), 'fetchpriority'), 'data-fx-r487-deferred-style'), 'data-fx-r487-media');
  return addAttrs(next, ` data-fx-r487-deferred-style="true" data-fx-r487-media="${MOBILE_MEDIA}" media="print" data-fx-r529-mobile-legacy="true"`);
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
    if (originalMedia && originalMedia !== 'all' && !/\smedia=(["'])(.*?)\1/i.test(next)) next = next.replace(/\s*\/?>$/, close => ` media="${originalMedia}"${close}`);
    if (!/\sfetchpriority=/i.test(next)) next = next.replace(/\s*\/?>$/, close => ` fetchpriority="high"${close}`);
    return next;
  });
}
function stabilizeMobileFirstPaint(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const pathname = stylesheetPath(tag);
    if (MOBILE_LEGACY_PATHS.has(pathname)) return deferredMobile(tag);
    return tag;
  });
}
function injectStaticHeart(html) {
  let source = String(html || '');
  const links = source.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || [];
  if (!links.some(tag => stylesheetPath(tag) === HEART_STYLE_PATH)) source = source.replace('</head>', `  ${HEART_STYLE_LINK}\n</head>`);
  if (!source.includes('class="fx-mag-heart-hit-r252"')) source = source.replace(/<div\s+class=(["'])hero-space\1\s*>/i, match => `${match}\n          ${HEART_BUTTON}`);
  return source;
}
function addFirstPaintPreloads(headers) {
  const existing = headers.get('Link');
  const preloads = [MOBILE_FIRST_PAINT_PRELOAD, P0_FIRST_PAINT_PRELOAD, HEART_STYLE_PRELOAD].join(', ');
  headers.set('Link', existing ? `${existing}, ${preloads}` : preloads);
}
function r529Headers(source, localCandidate) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r529-direct-canonical-living-core');
  headers.set('X-FormatX-Edge-Stability', 'r535-prepaint-reference-critical-shell');
  headers.set('X-FormatX-CSS-Scheduler', 'r535-global-critical-first-paint-mobile-legacy-intent');
  headers.set('X-FormatX-Product-Contract', 'r535-navigation-mag-no-manual-pause');
  headers.set('X-FormatX-MAG-Startup', 'r535-navigation-owned-critical-living-core');
  headers.set('X-FormatX-Mobile-LCP', 'r535-critical-shell-first-paint-preloaded');
  headers.set('X-FormatX-Preloader', 'r534-static-content-roadmap-timing');
  headers.set('X-FormatX-Preloader-Cache', 'r534-static-lcp-v1-compositor-css-v1');
  headers.set('X-FormatX-Reference-Boot', 'r535-prepaint-layout-selector');
  if (localCandidate) {
    headers.set('X-FormatX-Candidate-Delivery', 'r535-exact-production-entry-localhost-8787');
    headers.set('X-FormatX-Candidate-Canonical-Origin', 'formatxsuite.com');
    headers.set('Link', '<https://formatxsuite.com/>; rel="canonical"');
  }
  return headers;
}
function rewrittenSchedulerResponse(response, headers) {
  return response.text().then(source => {
    const body = String(source || '').replace(MOTION_RUNTIME_RE, MOTION_RUNTIME_URL);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-FormatX-Scheduler-Cache', 'r535-navigation-mag-scroll-intent');
    return new Response(body, { status: response.status, statusText: response.statusText, headers });
  });
}

export default {
  async fetch(request, env, ctx) {
    const deliveryUrl = new URL(request.url);
    const localCandidate = isLocalCandidateEnv(env);
    if (localCandidate) request = canonicalDeliveryRequest(request, deliveryUrl);
    const response = await canonicalProduction.fetch(request, env, ctx);
    if (!isSafeMethod(request) || !isDeliveryHost(deliveryUrl, localCandidate)) return response;

    const headers = r529Headers(response.headers, localCandidate);
    if (request.method === 'HEAD') { headers.delete('Content-Length'); return new Response(null, { status: response.status, statusText: response.statusText, headers }); }
    const type = headers.get('Content-Type') || '';
    if (deliveryUrl.pathname === P0_SCHEDULER_PATH && /javascript|text\/plain/i.test(type)) {
      return rewrittenSchedulerResponse(response, headers);
    }
    if (!type.includes('text/html')) return new Response(response.body, { status: response.status, statusText: response.statusText, headers });

    let html = restoreCriticalCoreFirstPaint(await response.text());
    html = html.replace(P0_MOTION_SCHEDULER_RE, P0_MOTION_SCHEDULER_URL);
    html = html.replace(DEFERRED_SCHEDULER_RE, DEFERRED_SCHEDULER_URL);
    html = html.replace(EVENT_HORIZON_RE, EVENT_HORIZON_URL);
    html = html.replace(DEFERRED_REDUCED_RE, DEFERRED_REDUCED_URL);
    html = html.replace(QUALITY_RE, QUALITY_URL);
    if (HOMEPAGE_PATHS.has(deliveryUrl.pathname)) {
      html = stabilizeMobileFirstPaint(html);
      html = injectStaticHeart(html);
      addFirstPaintPreloads(headers);
    }
    headers.delete('Content-Length'); headers.delete('Content-Encoding'); headers.delete('ETag'); headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};