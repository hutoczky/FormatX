import r515Production from './production-content-entry-r515.js';

/* FormatX R517 — remove the R487 time-based deferred-CSS race.
   R515 first-paint geometry remains authoritative. The only runtime change here
   is a cache-revision handoff to the FCP-gated deferred CSS scheduler. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const OLD_DEFERRED_CSS = '/scifi-ui/scripts/formatx-deferred-css-r487.js?v=20260831-r487-first-paint';
const R517_DEFERRED_CSS = '/scifi-ui/scripts/formatx-deferred-css-r487.js?v=20260904-r517-fcp-gated';

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}

function r517Headers(source) {
  const headers = new Headers(source);
  headers.set('X-FormatX-Transport-Stability', 'r517-fcp-gated-deferred-css');
  headers.set('X-FormatX-Edge-Stability', 'r515-critical-core-first-paint-geometry');
  headers.set('X-FormatX-CSS-Scheduler', 'r517-fcp-gated-deferred-enhancements');
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    const response = await r515Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = r517Headers(response.headers);
    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, { status: response.status, statusText: response.statusText, headers });
    }

    const contentType = headers.get('Content-Type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const html = (await response.text()).replaceAll(OLD_DEFERRED_CSS, R517_DEFERRED_CSS);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  },
};
