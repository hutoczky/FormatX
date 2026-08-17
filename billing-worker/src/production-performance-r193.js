import contentEntry from './production-content-entry.js';

const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const R196_STYLE = '<link rel="stylesheet" data-fx-core-never-stuck-r195="true" data-fx-core-painted-frame-r196="true" href="/scifi-ui/styles/formatx-core-never-stuck-r195.css?v=20260817-r196-painted-frame">';
const R196_SCRIPT = '<script defer data-fx-core-never-stuck-r195="true" data-fx-core-painted-frame-r196="true" src="/scifi-ui/scripts/formatx-core-never-stuck-r195.js?v=20260817-r196-painted-frame"></script>';

/*
  r196 painted-frame reliability wrapper.
  Initialization alone is not success: the MAG is considered ready only after
  the native renderer has actually produced a frame. Until then the existing
  hero-ring node provides a visible core placeholder; persistent failures fall
  back to the deterministic CSS core.
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
          /formatx-production-idle-loader-r192\.js\?v=20260817-(?:r192c|r193b|r193|r194-recovery|r195-recovery)/g,
          'formatx-production-idle-loader-r192.js?v=20260817-r196-painted-frame',
        )
        .replace(
          /formatx-core-real3d-v20\.js\?v=[^"']+/g,
          'formatx-core-real3d-v20.js?v=20260817-r196-painted-frame',
        );

      // Replace older r195 injected assets if the content layer already carried them.
      html = html
        .replace(/<link\b[^>]*data-fx-core-never-stuck-r195[^>]*>/gi, '')
        .replace(/<script\b[^>]*data-fx-core-never-stuck-r195[^>]*>\s*<\/script>/gi, '');

      if (!html.includes('data-fx-core-painted-frame-r196')) {
        html = html.replace('</head>', `  ${R196_STYLE}\n  ${R196_SCRIPT}\n</head>`);
      }

      headers.set('Cache-Control', 'no-store, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('X-FormatX-Performance', 'r196-painted-frame-core-first');
      headers.set('X-FormatX-Recovery', 'painted-frame-gate-with-visible-placeholder');
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
