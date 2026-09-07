import canonicalProduction from './production-content-entry.js';
import r529Production from './production-content-entry-r529.js';

/* FormatX R637 — first-frame network ownership.
   Unsafe/non-page methods preserve direct canonical ownership. Safe public reads
   retain the proven R529 production wrapper, then this thin final layer prevents
   secondary stylesheet requests from competing with the semantic hero/intro first
   frame. Secondary CSS keeps its original cascade slot and media contract, but its
   href is restored autonomously immediately after the first committed contentful
   paint by r637. No audit, UA or user-intent branch. */

const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const DEFERRED_SCHEDULER_RE = /(?:\.\/|\/scifi-ui\/scripts\/)?formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = '/scifi-ui/scripts/formatx-deferred-css-r637.js?v=20260907-r637-post-fcp-network-restore';
const FIRST_FRAME_STYLES = new Set([
  '/scifi-ui/styles/formatx-mobile-first-paint-r358.css',
  '/scifi-ui/styles/formatx-first-frame-stability-r283.css',
  '/scifi-ui/styles/formatx-p0-first-paint-r490.css',
  '/scifi-ui/styles/formatx-quality-r461.css',
  '/scifi-ui/styles/formatx-critical-shell-v56.css',
  '/scifi-ui/styles/formatx-award-readiness.css',
  '/scifi-ui/styles/formatx-first-paint-r206.css',
  '/scifi-ui/styles/formatx-critical-core-r227.css'
]);

function attrValue(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp('\\s' + escaped + '=(["\\\'])(.*?)\\1', 'i'));
  return match ? match[2] : '';
}
function withoutAttr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tag.replace(new RegExp('\\s+' + escaped + '=(["\\\'])(.*?)\\1', 'ig'), '');
}
function stylesheetPath(href) {
  try { return new URL(href, 'https://formatxsuite.com/scifi-ui/').pathname; }
  catch (_) { return ''; }
}
function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function addAttrs(tag, attrs) {
  return tag.replace(/\s*\/?>$/, close => `${attrs}${close}`);
}

function deferSecondaryStylesheetNetwork(html) {
  let deferred = 0;
  const body = String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    const href = attrValue(tag, 'href');
    if (!href || FIRST_FRAME_STYLES.has(stylesheetPath(href))) return tag;
    const targetMedia = attrValue(tag, 'data-fx-r487-media')
      || attrValue(tag, 'data-fx-deferred-media-r300')
      || attrValue(tag, 'media')
      || 'all';
    let next = withoutAttr(tag, 'href');
    next = withoutAttr(next, 'media');
    next = withoutAttr(next, 'fetchpriority');
    next = withoutAttr(next, 'data-fx-r487-deferred-style');
    next = withoutAttr(next, 'data-fx-r487-media');
    next = withoutAttr(next, 'data-fx-r637-href');
    deferred += 1;
    return addAttrs(next,
      ` data-fx-r637-href="${escapeAttr(href)}" data-fx-r487-deferred-style="true" data-fx-r487-media="${escapeAttr(targetMedia)}" media="not all"`);
  });
  return { body, deferred };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return canonicalProduction.fetch(request, env, ctx);
    }
    const response = await r529Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    const type = response.headers.get('Content-Type') || '';
    if (!HOMEPAGE_PATHS.has(url.pathname) || !type.includes('text/html') || request.method === 'HEAD') return response;

    let html = await response.text();
    html = html.replace(DEFERRED_SCHEDULER_RE, DEFERRED_SCHEDULER_URL);
    const staged = deferSecondaryStylesheetNetwork(html);
    const headers = new Headers(response.headers);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-FormatX-First-Frame-Network', `r637-href-deferred-${staged.deferred}`);
    headers.set('X-FormatX-Deferred-CSS', 'r637-post-fcp-network-restore');
    return new Response(staged.body, { status: response.status, statusText: response.statusText, headers });
  }
};
