import contentEntry from './production-content-entry.js';

const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const R195_STYLE = '<link rel="stylesheet" data-fx-core-never-stuck-r195="true" href="/scifi-ui/styles/formatx-core-never-stuck-r195.css?v=20260817-r195-never-stuck">';
const R195_SCRIPT = '<script defer data-fx-core-never-stuck-r195="true" src="/scifi-ui/scripts/formatx-core-never-stuck-r195.js?v=20260817-r195-never-stuck"></script>';

/*
  r195 reliability wrapper.
  Keep the production content pipeline intact, but make the critical MAG path
  monotonic: fresh bootstrap URL + never-stuck watchdog + deterministic visual
  fallback. WebGL remains primary; the fallback only appears after a real
  renderer failure/deadline.
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
      let html = await response.text();

      html = html
        .replace(
          /formatx-production-idle-loader-r192\.js\?v=20260817-(?:r192c|r193b|r193|r194-recovery)/g,
          'formatx-production-idle-loader-r192.js?v=20260817-r195-recovery',
        )
        .replace(
          /formatx-core-real3d-v20\.js\?v=[^"']+/g,
          'formatx-core-real3d-v20.js?v=20260817-r195-never-stuck',
        );

      if (!html.includes('data-fx-core-never-stuck-r195')) {
        html = html.replace('</head>', `  ${R195_STYLE}\n  ${R195_SCRIPT}\n</head>`);
      }

      headers.set('Cache-Control', 'no-store, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('X-FormatX-Performance', 'r195-reliable-core-first');
      headers.set('X-FormatX-Recovery', 'never-stuck-webgl-with-fallback');
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
