import liveWorker from './live-entry.js';

const ANDROID_APK_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const ANDROID_APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.5.apk';
const CANONICAL_HOST = 'www.formatxsuite.com';
const APEX_HOST = 'formatxsuite.com';
const LEGACY_HOME_PATHS = new Set([
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.hostname === APEX_HOST) {
      const target = new URL(request.url);
      target.hostname = CANONICAL_HOST;
      target.protocol = 'https:';
      return Response.redirect(target.toString(), 308);
    }

    if (
      request.method === 'GET'
      && (
        url.pathname === '/'
        || url.pathname === '/index.html'
        || LEGACY_HOME_PATHS.has(url.pathname)
      )
    ) {
      return serveEnhancedHome(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/download/android') {
      return serveAndroidApk(request, env);
    }

    return liveWorker.fetch(request, env, ctx);
  },
};

async function serveEnhancedHome(request, env) {
  const assetUrl = new URL('/scifi-ui/index.html', request.url);
  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: 'GET',
    headers: request.headers,
  }));

  if (!upstream.ok) {
    return upstream;
  }

  let html = await upstream.text();
  html = html
    .replaceAll('="./', '="/scifi-ui/')
    .replaceAll("='./", "='/scifi-ui/")
    .replaceAll('https://formatx1.formatx.workers.dev/download/android?v=1.0.4', '/download/android')
    .replace(
      '</head>',
      [
        '<link rel="stylesheet" href="/scifi-ui/styles/main-spatial.css?v=20260720-spatial-6">',
        '<link rel="stylesheet" href="/scifi-ui/styles/main-readability.css?v=20260720-readability-1">',
        '</head>',
      ].join(''),
    )
    .replace(
      '</body>',
      '<script defer src="/scifi-ui/scripts/project-hub.js?v=20260720-project-hub-6"></script></body>',
    );

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Content-Location', new URL(request.url).pathname);
  headers.set('Vary', 'Accept-Encoding');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');

  return new Response(html, {
    status: 200,
    headers,
  });
}

async function serveAndroidApk(request, env) {
  const assetUrl = new URL(ANDROID_APK_PATH, request.url);
  assetUrl.searchParams.set('v', '1.0.5');
  const assetHeaders = new Headers();
  const range = request.headers.get('Range');
  if (range) assetHeaders.set('Range', range);

  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: 'GET',
    headers: assetHeaders,
  }));

  if (!upstream.ok && upstream.status !== 206) {
    return new Response('Az Android alkalmazás jelenleg nem tölthető le.', {
      status: 502,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'application/vnd.android.package-archive');
  headers.set('Content-Disposition', `attachment; filename="${ANDROID_APK_FILENAME}"`);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
