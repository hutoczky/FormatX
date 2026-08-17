import contentEntry from './production-content-entry.js';

const CANONICAL_HOST = 'formatxsuite.com';
const INTERNAL_HOST = 'formatx-routing.internal';
const HOMEPAGE_ALIASES = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const R195_STYLE = '<link rel="stylesheet" data-fx-core-never-stuck-r195="true" href="/scifi-ui/styles/formatx-core-never-stuck-r195.css?v=20260817-r196-recovery">';
const R195_SCRIPT = '<script defer data-fx-core-never-stuck-r195="true" src="/scifi-ui/scripts/formatx-core-never-stuck-r195.js?v=20260817-r196-recovery"></script>';

/*
  r196 reliability entry.

  The r192 homepage optimizer removed/deferred several scripts and styles from
  the canonical document. That can leave the hero partially hydrated while the
  rest of the page exists. For the apex homepage we deliberately bypass that
  transform and request the canonical /scifi-ui/ document through the internal
  routing host. The content/security/release pipeline still runs; only the
  destructive homepage performance rewrite is skipped.

  Non-homepage requests remain delegated to production-content-entry.js.
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

  const internalRequest = new Request(internalUrl, request);
  const response = await contentEntry.fetch(internalRequest, env, ctx);
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

  // Ensure root navigation is canonical even though the document was fetched
  // from the internal routing host.
  html = html
    .replaceAll(`https://${INTERNAL_HOST}/`, 'https://formatxsuite.com/')
    .replaceAll(`https://${INTERNAL_HOST}`, 'https://formatxsuite.com')
    .replace(/formatx-core-real3d-v20\.js\?v=[^"']+/g,
      'formatx-core-real3d-v20.js?v=20260817-r196-reliable-full-hydration');

  if (!html.includes('data-fx-core-never-stuck-r195')) {
    html = html.replace('</head>', `  ${R195_STYLE}\n  ${R195_SCRIPT}\n</head>`);
  }

  // If a recovery query was used, clear stale browser cache once while still
  // serving the same canonical document. This does not affect normal visits.
  if (publicUrl.searchParams.has('_fx_redirect_recovery')) {
    headers.set('Clear-Site-Data', '"cache"');
  }

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
