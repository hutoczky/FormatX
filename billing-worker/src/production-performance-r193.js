import contentEntry from './production-content-entry.js';

const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

/*
  r194 recovery wrapper.
  Keep the proven production-content-entry response intact and only cache-bust
  the restored visual hydration loader. The r193 HTML restructuring, proof
  injection and immutable asset-policy layer are intentionally disabled here
  because they could leave mobile visitors in a partially hydrated hero state.
*/
export default {
  async fetch(request, env, ctx) {
    const response = await contentEntry.fetch(request, env, ctx);
    const url = new URL(request.url);
    const contentType = response.headers.get('Content-Type') || '';

    if (
      request.method === 'GET'
      && response.status === 200
      && HOMEPAGE_ALIASES.has(url.pathname)
      && contentType.includes('text/html')
    ) {
      const headers = new Headers(response.headers);
      const html = (await response.text()).replace(
        /formatx-production-idle-loader-r192\.js\?v=20260817-(?:r192c|r193b|r193)/g,
        'formatx-production-idle-loader-r192.js?v=20260817-r194-recovery',
      );

      headers.set('Cache-Control', 'no-store, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('X-FormatX-Performance', 'r194-reliable-mobile-render');
      headers.set('X-FormatX-Recovery', 'visual-hydration-restored');
      headers.delete('Content-Length');
      headers.delete('Content-Encoding');
      headers.delete('ETag');

      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
