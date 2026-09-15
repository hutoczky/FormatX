import r515Production from './production-content-entry-r515.js';

/* FormatX R526 — make deferred stylesheet activation deterministic by serving
   the FCP-observer scheduler with a fresh asset URL. R517 award first-paint
   ownership and all MAG runtime/clock/renderer ownership remain unchanged. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const DEFERRED_SCHEDULER_RE = /formatx-deferred-css-r487\.js\?v=[^"']+/g;
const DEFERRED_SCHEDULER_URL = 'formatx-deferred-css-r487.js?v=20260904-r526-fcp-observer';

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}

function r526Headers(source) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r526-fcp-observer');
  headers.set('X-FormatX-Edge-Stability', 'r526-fcp-observer-deferred-css');
  headers.set('X-FormatX-CSS-Scheduler', 'r526-post-first-contentful-paint');
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    const response = await r515Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = r526Headers(response.headers);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const html = (await response.text()).replace(DEFERRED_SCHEDULER_RE, DEFERRED_SCHEDULER_URL);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};
