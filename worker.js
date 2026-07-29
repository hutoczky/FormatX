const APK_ASSET_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const APK_DOWNLOAD_PATH = '/download/android';
const APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.2.apk';
const SCIFI_ENTRY_PATHS = new Set(['/scifi-ui/', '/scifi-ui/index.html']);
const SAFE_THREE_GATE_PATH = '/scifi-ui/scripts/formatx-mobile-recovery.js';
const LIVING_ARCHITECTURE_PATH = '/scifi-ui/scripts/living-architecture.js';
const ORGANISM_PANEL_GUARD_PATH = '/scifi-ui/scripts/organism-panel-startup-guard.js';
const ORGANISM_MENU_CONTROLLER_PATH = '/scifi-ui/scripts/organism-menu-controller.js';
const SAFE_THREE_CSS_PATH = '/scifi-ui/styles/formatx-mobile-recovery.css';
const EVENT_HORIZON_PATH = '/scifi-ui/scripts/formatx-event-horizon.js';
const SAFE_THREE_GATE_OLD_VERSION = 'formatx-mobile-recovery.js?v=20260729-mobile-recovery-1';
const SAFE_THREE_GATE_NEW_VERSION = 'formatx-mobile-recovery.js?v=20260729-safe-three-gate-1';
const SAFE_THREE_CSS_OLD_VERSION = 'formatx-mobile-recovery.css?v=20260729-mobile-recovery-1';
const SAFE_THREE_CSS_NEW_VERSION = 'formatx-mobile-recovery.css?v=20260729-safe-three-css-1';
const LIVING_ARCHITECTURE_OLD_VERSION = 'living-architecture.js?v=20260726-living-1';
const LIVING_ARCHITECTURE_NEW_VERSION = 'living-architecture.js?v=20260729-safe-three-start-4';
const LIVING_ARCHITECTURE_NEW_TAG = '<script defer src="./scripts/living-architecture.js?v=20260729-safe-three-start-4"></script>';
const ORGANISM_PANEL_GUARD_TAG = '<script defer src="./scripts/organism-panel-startup-guard.js?v=20260729-panel-startup-guard-2"></script>';
const EVENT_HORIZON_OLD_TAG = '<script defer src="./scripts/formatx-event-horizon.js?v=20260726-event-horizon-3"></script>';
const EVENT_HORIZON_NEW_TAG = '<script defer src="./scripts/formatx-event-horizon.js?v=20260729-event-horizon-5"></script>';

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
      (
        url.pathname === SAFE_THREE_GATE_PATH ||
        url.pathname === LIVING_ARCHITECTURE_PATH ||
        url.pathname === ORGANISM_PANEL_GUARD_PATH ||
        url.pathname === ORGANISM_MENU_CONTROLLER_PATH ||
        url.pathname === SAFE_THREE_CSS_PATH ||
        url.pathname === EVENT_HORIZON_PATH
      )
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

  let html = (await upstream.text())
    .replaceAll(SAFE_THREE_GATE_OLD_VERSION, SAFE_THREE_GATE_NEW_VERSION)
    .replaceAll(SAFE_THREE_CSS_OLD_VERSION, SAFE_THREE_CSS_NEW_VERSION)
    .replaceAll(LIVING_ARCHITECTURE_OLD_VERSION, LIVING_ARCHITECTURE_NEW_VERSION)
    .replace(EVENT_HORIZON_OLD_TAG, EVENT_HORIZON_NEW_TAG);

  if (!html.includes('organism-panel-startup-guard.js')) {
    html = html.replace(
      LIVING_ARCHITECTURE_NEW_TAG,
      ORGANISM_PANEL_GUARD_TAG + '\n  ' + LIVING_ARCHITECTURE_NEW_TAG
    );
  }

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
