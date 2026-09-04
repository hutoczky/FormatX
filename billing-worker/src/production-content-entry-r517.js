import r515Production from './production-content-entry-r515.js';

/* FormatX R517 — stabilize the proven Lighthouse transport variance owner.
   Real R516 A/B evidence showed the same production revision switching from
   HTTP/2 fast-path to HTTP/3 slow-path after Alt-Svc/QUIC discovery. Preserve
   the complete R515/R516 runtime and only clear alternative-service
   advertisement at the Worker response boundary. MAG, first-paint geometry,
   language, checkout and product functionality remain untouched. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);

function isSafeMethod(request) {
  return request.method === 'GET' || request.method === 'HEAD';
}

export default {
  async fetch(request, env, ctx) {
    const response = await r515Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!isSafeMethod(request) || !PUBLIC_HOSTS.has(url.hostname)) return response;

    const headers = new Headers(response.headers);
    headers.set('Alt-Svc', 'clear');
    headers.set('X-FormatX-Transport-Stability', 'r517-http2-quic-variance');

    if (request.method === 'HEAD') {
      headers.delete('Content-Length');
      return new Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
