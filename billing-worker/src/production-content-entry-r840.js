import production from './production-content-entry.js';

/* FormatX R840 — active-entry first-frame network budget.
   The canonical production entry remains authoritative for semantics, geometry,
   MAG ownership, intro timing, deferred CSS and all response contracts. This thin
   outer delivery layer only removes two measured first-frame network conflicts:
   mobile does not need the desktop Event Horizon quality sheet, and the tiny
   reference-mode bootstrap is redundant with the blocking scrollbar/hero geometry
   floor, so it must not compete at high priority with render-blocking CSS. */
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const DESKTOP_MOTION_MEDIA = '(prefers-reduced-motion: no-preference) and (min-width: 901px)';
const INTRO_P0_PATH = '/scifi-ui/styles/formatx-intro-p0-r575.css';
const REFERENCE_BOOT_RE = /<script\b(?=[^>]*\bdata-fx-reference-mode-boot-r504=["']true["'])[^>]*><\/script>/i;

function stylesheetPath(tag) {
  const href = tag.match(/\bhref=(["'])(.*?)\1/i)?.[2] || '';
  if (!href) return '';
  try { return new URL(href, 'https://formatxsuite.com/scifi-ui/').pathname; }
  catch (_) { return ''; }
}
function withoutValueAttr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tag.replace(new RegExp(`\\s${escaped}=(["'])[^"']*\\1`, 'i'), '');
}
function withoutBooleanAttr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tag.replace(new RegExp(`\\s${escaped}(?=\\s|>)`, 'i'), '');
}
function addAttrs(tag, attrs) {
  return tag.replace(/\s*\/?>$/, close => `${attrs}${close}`);
}
function scopeDesktopIntroCss(html) {
  return String(html || '').replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, tag => {
    if (stylesheetPath(tag) !== INTRO_P0_PATH) return tag;
    let next = withoutValueAttr(withoutValueAttr(withoutValueAttr(tag, 'media'), 'fetchpriority'), 'data-fx-r840-intro-desktop-only');
    return addAttrs(next, ` media="${DESKTOP_MOTION_MEDIA}" data-fx-r840-intro-desktop-only="true"`);
  });
}
function reprioritizeReferenceBoot(html) {
  return String(html || '').replace(REFERENCE_BOOT_RE, tag => {
    let next = withoutValueAttr(withoutValueAttr(tag, 'fetchpriority'), 'data-fx-r840-reference-budget');
    next = withoutBooleanAttr(next, 'defer');
    next = withoutBooleanAttr(next, 'async');
    return next.replace('<script', '<script async fetchpriority="low" data-fx-r840-reference-budget="true"');
  });
}

export default {
  async fetch(request, env, ctx) {
    const response = await production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!HOMEPAGE_PATHS.has(url.pathname) || (request.method !== 'GET' && request.method !== 'HEAD')) return response;

    const headers = new Headers(response.headers);
    headers.set('X-FormatX-R840-First-Frame', 'active-entry-mobile-intro-reference-budget');
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const type = headers.get('Content-Type') || '';
    if (!type.includes('text/html')) return new Response(response.body, { status: response.status, statusText: response.statusText, headers });

    let html = await response.text();
    html = scopeDesktopIntroCss(html);
    html = reprioritizeReferenceBoot(html);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};
