const APK_ASSET_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const APK_DOWNLOAD_PATH = '/download/android';
const APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.2.apk';
const SCIFI_ENTRY_PATHS = new Set(['/', '/scifi-ui/', '/scifi-ui/index.html']);
const LANGUAGE_PAGE_PATHS = new Set([
  '/',
  '/scifi-ui/',
  '/scifi-ui/index.html',
  '/scifi-ui/license.html',
  '/scifi-ui/support.html',
  '/scifi-ui/terms.html',
  '/scifi-ui/privacy.html',
  '/scifi-ui/checkout.html',
  '/scifi-ui/downloads/',
  '/scifi-ui/downloads/index.html',
  '/scifi-ui/downloads/android.html',
  '/scifi-ui/test-matrix.html',
  '/scifi-ui/payment/success.html',
  '/scifi-ui/payment/cancel.html',
]);
const LANGUAGE_ASSETS = '  <link rel="stylesheet" data-fx-single-language-style="true" href="/scifi-ui/styles/single-language-toggle.css?v=20260729-single-language-3">\n  <script defer src="/scifi-ui/scripts/single-language-toggle.js?v=20260729-single-language-2"></script>\n  <script defer src="/scifi-ui/scripts/formatx-license-links.js?v=20260729-local-licence-2"></script>\n';
const COPY_ASSETS = '  <link rel="stylesheet" data-fx-copy-polish-style="true" href="/scifi-ui/styles/formatx-copy-polish.css?v=20260729-copy-polish-1">\n  <script defer src="/scifi-ui/scripts/formatx-copy-polish.js?v=20260729-copy-polish-1"></script>\n';
const STATUS_ASSETS = '  <link rel="stylesheet" data-fx-platform-status-style="true" href="/scifi-ui/styles/platform-status.css?v=20260730-platform-status-2">\n  <script defer src="/scifi-ui/scripts/platform-status.js?v=20260730-platform-status-2"></script>\n';
const CRITICAL_ASSET_PATHS = new Set([
  '/scifi-ui/data/platform-status.json',
  '/scifi-ui/scripts/platform-status.js',
  '/scifi-ui/styles/platform-status.css',
  '/scifi-ui/scripts/formatx-mobile-recovery.js',
  '/scifi-ui/scripts/living-architecture.js',
  '/scifi-ui/scripts/igloo-parity.js',
  '/scifi-ui/scripts/single-language-toggle.js',
  '/scifi-ui/scripts/formatx-copy-polish.js',
  '/scifi-ui/scripts/formatx-license-links.js',
  '/scifi-ui/scripts/license-page.js',
  '/scifi-ui/scripts/formatx-infinite-scroll.js',
  '/scifi-ui/scripts/formatx-mobile-unified.js',
  '/scifi-ui/scripts/organism-console-state.js',
  '/scifi-ui/scripts/formatx-render-visibility.js',
  '/scifi-ui/scripts/organism-interface.js',
  '/scifi-ui/scripts/organism-menu-controller.js',
  '/scifi-ui/scripts/organism-core-controller.js',
  '/scifi-ui/scripts/organism-voice.js',
  '/scifi-ui/scripts/organism-voice-stability.js',
  '/scifi-ui/scripts/organism-master-sync.js',
  '/scifi-ui/scripts/organism-core-interaction.js',
  '/scifi-ui/scripts/synaptic-thought-genome.js',
  '/scifi-ui/scripts/synaptic-thought-disclosure.js',
  '/scifi-ui/scripts/mobile-webgl-entry.js',
  '/scifi-ui/scripts/mobile-core-engine-v2.js',
  '/scifi-ui/scripts/mobile-core-engine-v3.js',
  '/scifi-ui/styles/single-language-toggle.css',
  '/scifi-ui/styles/formatx-copy-polish.css',
  '/scifi-ui/styles/formatx-mobile-recovery.css',
  '/scifi-ui/styles/formatx-site-stability.css',
  '/scifi-ui/styles/formatx-mobile-readability.css',
  '/scifi-ui/styles/formatx-mobile-unified.css',
  '/scifi-ui/styles/organism-voice.css',
  '/scifi-ui/styles/organism-voice-dock.css',
  '/scifi-ui/styles/organism-master-sync.css',
  '/scifi-ui/styles/organism-core-interaction.css',
  '/scifi-ui/styles/organism-speaking-visual.css',
  '/scifi-ui/styles/synaptic-thought-genome.css',
  '/scifi-ui/styles/synaptic-thought-disclosure.css',
  '/scifi-ui/styles/formatx-premium-finish.css',
  '/scifi-ui/scripts/formatx-premium-finish.js',
  '/scifi-ui/scripts/formatx-event-horizon.js',
]);
const REPLACEMENTS = [
  ['formatx-mobile-recovery.js?v=20260729-mobile-recovery-1', 'formatx-mobile-recovery.js?v=20260729-living-core-gate-v2'],
  ['formatx-mobile-recovery.js?v=20260729-safe-three-gate-1', 'formatx-mobile-recovery.js?v=20260729-living-core-gate-v2'],
  ['formatx-mobile-recovery.css?v=20260729-mobile-recovery-1', 'formatx-mobile-recovery.css?v=20260729-living-core-css-v3'],
  ['formatx-mobile-recovery.css?v=20260729-safe-three-css-1', 'formatx-mobile-recovery.css?v=20260729-living-core-css-v3'],
  ['formatx-mobile-recovery.css?v=20260729-living-core-css-v2', 'formatx-mobile-recovery.css?v=20260729-living-core-css-v3'],
  ['living-architecture.js?v=20260726-living-1', 'living-architecture.js?v=20260729-safe-three-start-4'],
  ['living-architecture.js?v=20260729-safe-three-start-3', 'living-architecture.js?v=20260729-safe-three-start-4'],
  ['formatx-event-horizon.js?v=20260726-event-horizon-3', 'formatx-event-horizon.js?v=20260731-intro-restored-1'],
  ['formatx-event-horizon.js?v=20260729-event-horizon-5', 'formatx-event-horizon.js?v=20260731-intro-restored-1'],
  ['formatx-event-horizon.js?v=20260730-first-visit-1', 'formatx-event-horizon.js?v=20260731-intro-restored-1'],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if ((request.method === 'GET' || request.method === 'HEAD') && (url.pathname === APK_ASSET_PATH || url.pathname === APK_DOWNLOAD_PATH)) {
      return serveAndroidApk(request, env);
    }
    if ((request.method === 'GET' || request.method === 'HEAD') && LANGUAGE_PAGE_PATHS.has(url.pathname)) {
      return serveLanguagePage(request, env, url.pathname);
    }
    if ((request.method === 'GET' || request.method === 'HEAD') && CRITICAL_ASSET_PATHS.has(url.pathname)) {
      return serveNoStoreAsset(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

async function serveLanguagePage(request, env, pathname) {
  const upstream = await env.ASSETS.fetch(request);
  if (!upstream.ok || request.method === 'HEAD') {
    const headers = new Headers(upstream.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.delete('ETag');
    return new Response(null, { status: upstream.status, headers });
  }

  const contentType = upstream.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return upstream;

  let html = await upstream.text();
  if (SCIFI_ENTRY_PATHS.has(pathname)) {
    for (const [before, after] of REPLACEMENTS) html = html.replaceAll(before, after);
  }
  if (!html.includes('data-fx-single-language-style')) {
    html = html.replace('</head>', LANGUAGE_ASSETS + '</head>');
  }
  if (!html.includes('data-fx-platform-status-style')) {
    html = html.replace('</head>', STATUS_ASSETS + '</head>');
  }
  if (SCIFI_ENTRY_PATHS.has(pathname) && !html.includes('data-fx-copy-polish-style')) {
    html = html.replace('</head>', COPY_ASSETS + '</head>');
  }

  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  return new Response(html, { status: upstream.status, headers });
}

async function serveNoStoreAsset(request, env) {
  const upstream = await env.ASSETS.fetch(request);
  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('ETag');
  return new Response(request.method === 'HEAD' ? null : upstream.body, { status: upstream.status, headers });
}

async function serveAndroidApk(request, env) {
  const assetUrl = new URL(APK_ASSET_PATH, request.url);
  const forwardedHeaders = new Headers();
  for (const name of ['Range', 'If-None-Match', 'If-Modified-Since']) {
    const value = request.headers.get(name);
    if (value) forwardedHeaders.set(name, value);
  }
  const upstream = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method, headers: forwardedHeaders }));
  if (!upstream.ok && upstream.status !== 206 && upstream.status !== 304) {
    return new Response('Az Android alkalmazás jelenleg nem tölthető le.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'application/vnd.android.package-archive');
  headers.set('Content-Disposition', `attachment; filename="${APK_FILENAME}"; filename*=UTF-8''${APK_FILENAME}`);
  headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Security-Policy', "default-src 'none'");
  return new Response(request.method === 'HEAD' ? null : upstream.body, { status: upstream.status, headers });
}
