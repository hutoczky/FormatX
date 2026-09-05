import canonicalProduction from './production-content-entry.js';

/* FormatX R528 — retire the manual MAG PAUSE/RESUME product control while
   preserving the proven R527 canonical delegate, R515 critical-core first-paint
   restore and R526 post-FCP deferred scheduler. MAG remains the continuously
   living core. Reduced-motion and automatic offscreen/background suspension
   remain accessibility/lifecycle behavior, not a user-facing PAUSE feature. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const CRITICAL_CORE_PATH = '/scifi-ui/styles/formatx-critical-core-r227.css';
const DEFERRED_SCHEDULER_RE = /formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = 'formatx-deferred-css-r487.js?v=20260904-r526-fcp-observer';
const R528_QUERY = '20260905-r528-living-core-no-manual-pause';

const HTML_RUNTIME_REWRITES = [
  [/formatx-event-horizon\.js\?v=[^"']+/g, `formatx-event-horizon.js?v=${R528_QUERY}`],
  [/formatx-reference-production-r244\.js\?v=[^"']+/g, `formatx-reference-production-r244.js?v=${R528_QUERY}`],
  [/formatx-control-owner-r268\.js\?v=[^"']+/g, `formatx-control-owner-r268.js?v=${R528_QUERY}`],
  [/formatx-wda-controls-r198\.js\?v=[^"']+/g, `formatx-wda-controls-r198.js?v=${R528_QUERY}`],
];

const JS_GRAPH_REWRITES = new Map([
  ['/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js', [
    [/formatx-motion-runtime-loader-r239\.js\?v=[^"']+/g, `formatx-motion-runtime-loader-r239.js?v=${R528_QUERY}`],
  ]],
  ['/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js', [
    [/formatx-current-mag-loader-r422\.js\?v=[^"']+/g, `formatx-current-mag-loader-r422.js?v=${R528_QUERY}`],
  ]],
  ['/scifi-ui/scripts/formatx-current-mag-loader-r422.js', [
    [/formatx-mini-mag-assistant-r459\.js\?v=[^"']+/g, `formatx-mini-mag-assistant-r459.js?v=${R528_QUERY}`],
  ]],
  ['/scifi-ui/scripts/formatx-award-runtime-r206.js', [
    [/formatx-control-owner-r268\.js\?v=[^"']+/g, `formatx-control-owner-r268.js?v=${R528_QUERY}`],
    [/formatx-wda-controls-r198\.js\?v=[^"']+/g, `formatx-wda-controls-r198.js?v=${R528_QUERY}`],
  ]],
  ['/scifi-ui/scripts/formatx-client-cache-recovery-r197.js', [
    [/formatx-wda-controls-r198\.js\?v=[^"']+/g, `formatx-wda-controls-r198.js?v=${R528_QUERY}`],
  ]],
]);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
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

function rewriteHtmlRuntime(html) {
  let source = String(html || '');
  source = source.replace(DEFERRED_SCHEDULER_RE, DEFERRED_SCHEDULER_URL);
  for (const [pattern, replacement] of HTML_RUNTIME_REWRITES) source = source.replace(pattern, replacement);
  return source;
}

function rewriteJavascript(url, source) {
  const rewrites = JS_GRAPH_REWRITES.get(url.pathname);
  if (!rewrites) return null;
  let next = String(source || '');
  for (const [pattern, replacement] of rewrites) next = next.replace(pattern, replacement);
  return next;
}

function r528Headers(source) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r528-living-core-no-manual-pause');
  headers.set('X-FormatX-Edge-Stability', 'r528-living-core-no-manual-pause');
  headers.set('X-FormatX-CSS-Scheduler', 'r526-post-first-contentful-paint');
  headers.set('X-FormatX-MAG-Contract', 'living-core-no-manual-pause');
  return headers;
}

function rewrittenResponse(response, headers, body) {
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  headers.set('Cache-Control', 'no-store, max-age=0');
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const response = await canonicalProduction.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = r528Headers(response.headers);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      let html = restoreCriticalCoreFirstPaint(await response.text());
      html = rewriteHtmlRuntime(html);
      return rewrittenResponse(response, headers, html);
    }

    if (contentType.includes('javascript') || contentType.includes('ecmascript') || url.pathname.endsWith('.js')) {
      const rewrites = JS_GRAPH_REWRITES.get(url.pathname);
      if (rewrites) {
        const source = await response.text();
        const javascript = rewriteJavascript(url, source);
        headers.set('X-FormatX-R528-Asset-Graph', 'living-core-no-manual-pause');
        return rewrittenResponse(response, headers, javascript);
      }
    }

    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};