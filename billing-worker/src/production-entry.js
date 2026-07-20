import liveWorker from './live-entry.js';

const ANDROID_APK_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const ANDROID_APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.6.apk';
const CANONICAL_HOST = 'www.formatxsuite.com';
const APEX_HOST = 'formatxsuite.com';
const LEGACY_HOME_PATHS = new Set([
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com",
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join('; ');

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response;

    if (url.hostname === APEX_HOST) {
      const target = new URL(request.url);
      target.hostname = CANONICAL_HOST;
      target.protocol = 'https:';
      response = Response.redirect(target.toString(), 308);
    } else if (
      request.method === 'GET'
      && (
        url.pathname === '/'
        || url.pathname === '/index.html'
        || LEGACY_HOME_PATHS.has(url.pathname)
      )
    ) {
      response = await serveEnhancedHome(request, env);
    } else if (request.method === 'GET' && url.pathname === '/download/android') {
      response = await serveAndroidApk(request, env);
    } else {
      response = await liveWorker.fetch(request, env, ctx);
    }

    return applySecurityHeaders(response, url.pathname);
  },
};

async function serveEnhancedHome(request, env) {
  const assetUrl = new URL('/scifi-ui/index.html', request.url);
  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: 'GET',
    headers: request.headers,
  }));

  if (!upstream.ok) return upstream;

  let html = await upstream.text();
  html = html
    .replaceAll('="./', '="/scifi-ui/')
    .replaceAll("='./", "='/scifi-ui/")
    .replaceAll('https://formatx1.formatx.workers.dev/download/android?v=1.0.4', '/download/android')
    .replace(
      '</head>',
      [
        '<link rel="stylesheet" href="/scifi-ui/styles/main-spatial.css?v=20260720-spatial-7">',
        '<link rel="stylesheet" href="/scifi-ui/styles/main-readability.css?v=20260720-readability-2">',
        '<link rel="stylesheet" href="/scifi-ui/styles/quantum-twin.css?v=20260720-quantum-1">',
        '</head>',
      ].join(''),
    )
    .replace(
      '</body>',
      [
        '<script defer src="/scifi-ui/scripts/project-hub.js?v=20260720-project-hub-8"></script>',
        '<script defer src="/scifi-ui/scripts/quantum-twin.js?v=20260720-quantum-1"></script>',
        '</body>',
      ].join(''),
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
  assetUrl.searchParams.set('v', '1.0.6');
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

function applySecurityHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  const contentType = headers.get('Content-Type') || '';
  const isHtml = contentType.includes('text/html') || pathname === '/' || pathname.endsWith('.html');

  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Permissions-Policy', [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'camera=()',
    'display-capture=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'publickey-credentials-get=()',
    'usb=()',
  ].join(', '));

  if (isHtml) headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);

  headers.delete('Server');
  headers.delete('X-Powered-By');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
