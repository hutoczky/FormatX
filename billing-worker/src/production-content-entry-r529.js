import canonicalProduction from './production-content-entry.js';

/* FormatX R538 — direct canonical production ownership + bounded static intro.
   Candidate mode exists only behind Wrangler-only FORMATX_LOCAL_CANDIDATE=1.
   The tiny reference layout selector remains prepaint, the critical shell remains
   first-paint safe, MAG starts from navigation with its lightweight semantic heart,
   and exact first-paint dependencies are warmed from HTTP headers before HTML parse. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const CANONICAL_CANDIDATE_ORIGIN = 'https://formatxsuite.com';
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const CRITICAL_CORE_PATH = '/scifi-ui/styles/formatx-critical-core-r227.css';
const P0_SCHEDULER_PATH = '/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js';
const P0_MOTION_SCHEDULER_RE = /formatx-p0-motion-scheduler-r490\.js\?v=[^"']+/g;
const P0_MOTION_SCHEDULER_URL = 'formatx-p0-motion-scheduler-r490.js?v=20260906-r537-navigation-interaction';
const MOTION_RUNTIME_RE = /formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g;
const MOTION_RUNTIME_URL = 'formatx-motion-runtime-loader-r239.js?v=20260906-r537-automatic-lifecycle';
const DEFERRED_SCHEDULER_RE = /formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = 'formatx-deferred-css-r487.js?v=20260906-r535-mobile-scroll-intent-v2';
const EVENT_HORIZON_RE = /formatx-event-horizon\.js\?v=[^"']+/g;
const EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260906-r537-no-manual-pause';
const DEFERRED_REDUCED_RE = /formatx-deferred-reduced-style-r232\.js\?v=[^"']+/g;
const DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner';
const QUALITY_RE = /formatx-quality-r461\.css\?v=[^"']+/g;
const QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r533-compositor-bound-v1';
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';
const DESKTOP_MOTION_MEDIA = '(prefers-reduced-motion: no-preference) and (min-width: 901px)';
const HEART_STYLE_PATH = '/scifi-ui/styles/formatx-heart-core-r252.css';
const HEART_STYLE_LINK = '<link rel="stylesheet" fetchpriority="high" data-fx-heart-core-r252="true" href="/scifi-ui/styles/formatx-heart-core-r252.css?v=20260906-r538-hero-hit-owner">';
const HEART_BUTTON = '<button type="button" class="fx-mag-heart-hit-r252" data-fx-heart-core-r252="true" aria-label="A FormatX élő MAG interakciójának indítása"></button>';

/* R538: all of these are already required by the normal visitor first frame.
   Header preloads only advance request discovery; they do not hide, disable or
   replace any product content, animation, MAG runtime or accessibility layer. */
const MOBILE_FIRST_PAINT_PRELOAD = `</scifi-ui/styles/formatx-mobile-first-paint-r358.css?v=20260827-r407-static-parity>; rel=preload; as=style; media="${MOBILE_MEDIA}"`;
const P0_FIRST_PAINT_PRELOAD = '</scifi-ui/styles/formatx-p0-first-paint-r490.css?v=20260903-r503-hero-ancestor-first-frame>; rel=preload; as=style';
const HEART_STYLE_PRELOAD = '</scifi-ui/styles/formatx-heart-core-r252.css?v=20260906-r538-hero-hit-owner>; rel=preload; as=style';
const CRITICAL_SHELL_PRELOAD = '</scifi-ui/styles/formatx-critical-shell-v56.css?v=20260818-r206-first-paint>; rel=preload; as=style';
const QUALITY_PRELOAD = '</scifi-ui/styles/formatx-quality-r461.css?v=20260905-r533-compositor-bound-v1>; rel=preload; as=style';
const AWARD_READINESS_PRELOAD = '</scifi-ui/styles/formatx-award-readiness.css?v=20260818-r206-lcp-stability>; rel=preload; as=style';
const FIRST_PAINT_R206_PRELOAD = '</scifi-ui/styles/formatx-first-paint-r206.css?v=20260818-r206-stable-hero>; rel=preload; as=style';
const REFERENCE_BOOT_PRELOAD = '</scifi-ui/scripts/formatx-reference-mode-boot-r334.js?v=20260903-r504-prepaint-reference-mode>; rel=preload; as=script';
const CRITICAL_CORE_PRELOAD = `</scifi-ui/styles/formatx-critical-core-r227.css?v=20260819-r227>; rel=preload; as=style; media="${DESKTOP_MOTION_MEDIA}"`;
const REFERENCE_PRODUCTION_PRELOAD = `</scifi-ui/styles/formatx-reference-production-r244.css?v=20260824-native-orb-r250>; rel=preload; as=style; media="${DESKTOP_MOTION_MEDIA}"`;

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
  const preloads = [
    MOBILE_FIRST_PAINT_PRELOAD,
    P0_FIRST_PAINT_PRELOAD,
    HEART_STYLE_PRELOAD,
    CRITICAL_SHELL_PRELOAD,
    QUALITY_PRELOAD,
    AWARD_READINESS_PRELOAD,
    FIRST_PAINT_R206_PRELOAD,
    REFERENCE_BOOT_PRELOAD,
    CRITICAL_CORE_PRELOAD,
    REFERENCE_PRODUCTION_PRELOAD,
  ].join(', ');
  headers.set('Link', existing ? `${existing}, ${preloads}` : preloads);
}
function r536Headers(source, localCandidate) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r536-direct-canonical-living-core');
  headers.set('X-FormatX-Edge-Stability', 'r538-first-paint-header-warm');
  headers.set('X-FormatX-CSS-Scheduler', 'r536-global-critical-first-paint-mobile-legacy-intent');
  headers.set('X-FormatX-Product-Contract', 'r536-navigation-mag-automatic-lifecycle');
  headers.set('X-FormatX-MAG-Startup', 'r536-navigation-owned-critical-living-core');
  headers.set('X-FormatX-Mobile-LCP', 'r538-critical-chain-header-preloaded');
  headers.set('X-FormatX-Preloader', 'r534-static-content-roadmap-timing');
  headers.set('X-FormatX-Preloader-Cache', 'r537-static-lcp-no-manual-pause');
  headers.set('X-FormatX-Reference-Boot', 'r536-prepaint-layout-selector');
  if (localCandidate) {
    headers.set('X-FormatX-Candidate-Delivery', 'r536-exact-production-entry-localhost-8787');
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
    headers.set('X-FormatX-Scheduler-Cache', 'r537-navigation-interaction');
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

    const headers = r536Headers(response.headers, localCandidate);
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
