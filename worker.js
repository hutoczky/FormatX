const APK_ASSET_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const APK_DOWNLOAD_PATH = '/download/android';
const APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.2.apk';
const SCIFI_ENTRY_PATHS = new Set(['/scifi-ui/', '/scifi-ui/index.html']);
const MOBILE_RECOVERY_PATH = '/scifi-ui/scripts/formatx-mobile-recovery.js';
const MOBILE_RECOVERY_OLD_VERSION = 'formatx-mobile-recovery.js?v=20260729-mobile-recovery-1';
const MOBILE_RECOVERY_NEW_VERSION = 'formatx-mobile-recovery.js?v=20260729-mobile-recovery-3';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      (url.pathname === APK_ASSET_PATH || url.pathname === APK_DOWNLOAD_PATH)
    ) {
      return serveAndroidApk(request, env);
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      SCIFI_ENTRY_PATHS.has(url.pathname)
    ) {
      return serveScifiEntry(request, env);
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      url.pathname === MOBILE_RECOVERY_PATH
    ) {
      return serveNoStoreAsset(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function serveScifiEntry(request, env) {
  const upstream = await env.ASSETS.fetch(request);
  if (!upstream.ok || request.method === 'HEAD') {
    const headers = new Headers(upstream.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.delete('ETag');
    return new Response(null, { status: upstream.status, headers });
  }

  const contentType = upstream.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return upstream;

  const html = (await upstream.text()).replaceAll(
    MOBILE_RECOVERY_OLD_VERSION,
    MOBILE_RECOVERY_NEW_VERSION,
  );
  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('Content-Length');
  headers.delete('ETag');

  return new Response(html, {
    status: upstream.status,
    headers,
  });
}

async function serveNoStoreAsset(request, env) {
  const upstream = await env.ASSETS.fetch(request);
  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('ETag');

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

async function serveAndroidApk(request, env) {
  const assetUrl = new URL(APK_ASSET_PATH, request.url);
  const forwardedHeaders = new Headers();

  for (const name of ['Range', 'If-None-Match', 'If-Modified-Since']) {
    const value = request.headers.get(name);
    if (value) forwardedHeaders.set(name, value);
  }

  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: request.method,
    headers: forwardedHeaders,
  }));

  if (!upstream.ok && upstream.status !== 206 && upstream.status !== 304) {
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
  headers.set('Content-Disposition', `attachment; filename="${APK_FILENAME}"; filename*=UTF-8''${APK_FILENAME}`);
  headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "default-src 'none'");

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
