import contentEntry from './production-content-entry.js';

const CANONICAL_HOST = 'formatxsuite.com';
const INTERNAL_HOST = 'formatx-routing.internal';
const HOMEPAGE_ALIASES = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const R196_STYLE = '<link rel="stylesheet" data-fx-core-never-stuck-r195="true" data-fx-reliable-home-r196="true" href="/scifi-ui/styles/formatx-core-never-stuck-r195.css?v=20260817-r196-reliable-home">';
const R196_SCRIPT = '<script data-fx-core-never-stuck-r195="true" data-fx-reliable-home-r196="true" src="/scifi-ui/scripts/formatx-core-never-stuck-r195.js?v=20260817-r196-reliable-home"></script>';

/*
  r196 reliable homepage wrapper.

  The r192 homepage optimizer removes/deferes part of the canonical visual
  hydration chain. On affected browsers this leaves the hero background and
  controls visible while the MAG never reaches a painted state. The homepage
  therefore fetches the canonical /scifi-ui/ document through the internal
  routing host, which preserves all content/security/release processing but
  skips the destructive homepage optimization pass.

  Every non-homepage request stays on production-content-entry.js.
*/
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';

    if (
      safeMethod
      && url.hostname === CANONICAL_HOST
      && HOMEPAGE_ALIASES.has(url.pathname)
    ) {
      return serveReliableHomepage(request, env, ctx, url);
    }

    return contentEntry.fetch(request, env, ctx);
  },
};

async function serveReliableHomepage(request, env, ctx, publicUrl) {
  const internalUrl = new URL(request.url);
  internalUrl.protocol = 'https:';
  internalUrl.hostname = INTERNAL_HOST;
  internalUrl.pathname = '/scifi-ui/';
  internalUrl.hash = '';
  internalUrl.searchParams.delete('_fx_redirect_recovery');

  // Internal host deliberately bypasses production-content-entry's homepage
  // optimizer while still traversing the canonical content pipeline.
  const response = await contentEntry.fetch(new Request(internalUrl, request), env, ctx);
  const headers = new Headers(response.headers);

  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Link', '<https://formatxsuite.com/>; rel="canonical"');
  headers.set('X-FormatX-Shell', 'v56');
  headers.set('X-FormatX-Performance', 'r196-reliable-full-hydration');
  headers.set('X-FormatX-Recovery', 'r196-bypass-homepage-optimizer');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  if (request.method === 'HEAD') {
    return new Response(null, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const contentType = headers.get('Content-Type') || '';
  if (!response.ok || !contentType.includes('text/html')) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  let html = await response.text();
  html = html
    .replaceAll(`https://${INTERNAL_HOST}/`, 'https://formatxsuite.com/')
    .replaceAll(`https://${INTERNAL_HOST}`, 'https://formatxsuite.com')
    .replace(/formatx-core-real3d-v20\.js\?v=[^"']+/g,
      'formatx-core-real3d-v20.js?v=20260817-r196-reliable-full-hydration');

  // Keep one early recovery guard, independent of the deferred hydration chain.
  html = html
    .replace(/<link\b[^>]*data-fx-core-never-stuck-r195[^>]*>/gi, '')
    .replace(/<script\b[^>]*data-fx-core-never-stuck-r195[^>]*>\s*<\/script>/gi, '');

  if (!html.includes('data-fx-reliable-home-r196')) {
    const recovery = `${R196_STYLE}\n  ${R196_SCRIPT}`;
    const cspMeta = /(<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>)/i;
    if (cspMeta.test(html)) html = html.replace(cspMeta, `$1\n  ${recovery}`);
    else html = html.replace('<head>', `<head>\n  ${recovery}`);
  }

  if (publicUrl.searchParams.has('_fx_redirect_recovery')) {
    headers.set('Clear-Site-Data', '"cache"');
  }

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
