import r529Production from './production-content-entry-r529.js';

/* FormatX R531 — preloader delivery closeout.
   Keep the proven R529 production/content/LCP architecture unchanged and only
   give the Event Horizon runtime a fresh cache identity so the real public
   homepage cannot receive the retired R507 intro bytes from browser/edge cache. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const EVENT_HORIZON_RE = /formatx-event-horizon\.js\?v=[^"']+/g;
const EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r531-preloader-reveal-cls-lock';

export default {
  async fetch(request, env, ctx) {
    const response = await r529Production.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (request.method !== 'GET' || !PUBLIC_HOSTS.has(url.hostname) || !HOMEPAGE_PATHS.has(url.pathname)) {
      return response;
    }

    const type = response.headers.get('Content-Type') || '';
    if (!type.includes('text/html')) return response;

    const html = (await response.text()).replace(EVENT_HORIZON_RE, EVENT_HORIZON_URL);
    const headers = new Headers(response.headers);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('X-FormatX-Preloader', 'r531-visual-only-navigation-owned');
    headers.set('X-FormatX-Preloader-Cache', 'r531-event-horizon-fresh-url');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
