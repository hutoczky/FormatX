import r527Production from './production-content-entry-r527.js';

/* FormatX R528 — evidence-backed mobile critical-path stabilization plus the
   explicit living-core product contract. R527 remains the canonical delegate:
   its critical-core restore and R526 post-FCP scheduler are preserved.

   R527 mobile Lighthouse artifact 9955437028 proved that the 10 s LCP path is
   CLIENT/RENDER, not network: the same static hero text spent ~9.6–10.1 s in
   element render delay while TTFB/resource timing stayed fast. The first
   measurable divergence was the warm path expanding from 2 to 13 render
   blockers. R528 makes legacy/redundant mobile layers explicitly post-FCP so
   their cache state can no longer decide the critical graph. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const MOBILE_MEDIA = '(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)';

const MOBILE_DEFER_PATHS = new Set([
  '/scifi-ui/styles/formatx-mobile-reference-layout-v1.css',
  '/scifi-ui/styles/formatx-flow-first-r74.css',
  '/scifi-ui/styles/formatx-responsive-text-guard-r72.css',
  '/scifi-ui/styles/formatx-mobile-proof-controls-r204.css',
  '/scifi-ui/styles/formatx-mobile-layout-r207.css',
  '/scifi-ui/styles/formatx-native-orb-reference-r250.css',
  '/scifi-ui/styles/formatx-mobile-apex-composition.css',
]);

/* These global legacy layers predate the current R358/R490 first-paint owners.
   Desktop keeps them on its blocking path; mobile receives the same stylesheet
   after FCP through the already-proven R526/R487 scheduler. */
const SPLIT_DESKTOP_MOBILE_PATHS = new Set([
  '/scifi-ui/styles/formatx-critical-shell-v56.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-quality-r461.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
]);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}

function stylesheetHref(tag) {
  const match = tag.match(/\bhref=(["'])(.*?)\1/i);
  return match ? match[2] : '';
}

function stylesheetPath(tag) {
  const href = stylesheetHref(tag);
  if (!href) return '';
  try {
    return new URL(href, 'https://formatxsuite.com/scifi-ui/').pathname;
  } catch (_) {
    return '';
  }
}

function stripAttr(tag, name) {
  const re = new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'ig');
  return tag.replace(re, '');
}

function appendAttrs(tag, attrs) {
  return tag.replace(/\s*\/?>$/, close => ` ${attrs}${close}`);
}

function deferredTag(tag, targetMedia) {
  let next = stripAttr(tag, 'media');
  next = stripAttr(next, 'fetchpriority');
  next = stripAttr(next, 'data-fx-r487-deferred-style');
  next = stripAttr(next, 'data-fx-r487-media');
  return appendAttrs(
    next,
    `data-fx-r487-deferred-style="true" data-fx-r487-media="${targetMedia}" media="print"`
  );
}

function desktopTag(tag) {
  let next = stripAttr(tag, 'media');
  return appendAttrs(next, 'media="(min-width: 901px) and (pointer: fine)"');
}

function stabilizeMobileCriticalGraph(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const path = stylesheetPath(tag);
    if (!path) return tag;

    if (MOBILE_DEFER_PATHS.has(path)) {
      return deferredTag(tag, MOBILE_MEDIA);
    }

    if (SPLIT_DESKTOP_MOBILE_PATHS.has(path)) {
      const desktop = desktopTag(tag);
      const mobile = deferredTag(tag, MOBILE_MEDIA);
      return `${desktop}\n  ${mobile}`;
    }

    return tag;
  });
}

function r528Headers(source) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r528-mobile-critical-graph');
  headers.set('X-FormatX-Edge-Stability', 'r528-mobile-critical-graph-deterministic');
  headers.set('X-FormatX-CSS-Scheduler', 'r526-post-first-contentful-paint');
  headers.set('X-FormatX-MAG-Contract', 'r528-living-core-no-manual-pause');
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    const response = await r527Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = r528Headers(response.headers);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const html = stabilizeMobileCriticalGraph(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};
