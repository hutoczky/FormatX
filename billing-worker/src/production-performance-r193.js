import contentEntry from './production-content-entry.js';

const HOMEPAGE_ALIASES = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const R196_STYLE = '<link rel="stylesheet" data-fx-core-never-stuck-r195="true" data-fx-core-painted-frame-r196="true" href="/scifi-ui/styles/formatx-core-never-stuck-r195.css?v=20260817-r196b-early-painted-frame">';
const R196_SCRIPT = '<script data-fx-core-never-stuck-r195="true" data-fx-core-painted-frame-r196="true" src="/scifi-ui/scripts/formatx-core-never-stuck-r195.js?v=20260817-r196b-early-painted-frame"></script>';

/*
  r196b early painted-frame recovery.
  The rescue path must not sit behind the deferred script chain it is supposed
  to recover. It is injected immediately after the CSP meta and starts while the
  parser is still building the page. A native MAG is accepted only after an
  actual draw publishes data-fx-core-render-ms.
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
          /formatx-production-idle-loader-r192\.js\?v=20260817-(?:r192c|r193b|r193|r194-recovery|r195-recovery|r196-painted-frame)/g,
          'formatx-production-idle-loader-r192.js?v=20260817-r196b-early-painted-frame',
        )
        .replace(
          /formatx-core-real3d-v20\.js\?v=[^"']+/g,
          'formatx-core-real3d-v20.js?v=20260817-r196b-early-painted-frame',
        );

      // Remove any older recovery injection before placing the single early copy.
      html = html
        .replace(/<link\b[^>]*data-fx-core-never-stuck-r195[^>]*>/gi, '')
        .replace(/<script\b[^>]*data-fx-core-never-stuck-r195[^>]*>\s*<\/script>/gi, '');

      if (!html.includes('data-fx-core-painted-frame-r196')) {
        const recovery = `${R196_STYLE}\n  ${R196_SCRIPT}`;
        const cspMeta = /(<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>)/i;
        if (cspMeta.test(html)) html = html.replace(cspMeta, `$1\n  ${recovery}`);
        else html = html.replace('<head>', `<head>\n  ${recovery}`);
      }

      headers.set('Cache-Control', 'no-store, max-age=0');
      headers.set('Pragma', 'no-cache');
      headers.set('X-FormatX-Performance', 'r196b-early-painted-frame-core');
      headers.set('X-FormatX-Recovery', 'early-bootstrap-painted-frame-gate');
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
