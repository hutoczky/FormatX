import productionWorker from './production-with-license.js';

const SCIFI_ENTRY_PATHS = new Set(['/scifi-ui/', '/scifi-ui/index.html']);
const EMBEDDABLE_STAGE_PATHS = new Set([
  '/scifi-ui/three-stage-mobile',
  '/scifi-ui/three-stage-mobile.html',
  '/scifi-ui/three-stage',
  '/scifi-ui/three-stage.html',
]);
const CRITICAL_STARTUP_ASSETS = new Set([
  '/scifi-ui/scripts/formatx-event-horizon.js',
  '/scifi-ui/scripts/formatx-mobile-recovery.js',
  '/scifi-ui/scripts/living-architecture.js',
  '/scifi-ui/scripts/organism-panel-startup-guard.js',
  '/scifi-ui/scripts/organism-interface.js',
  '/scifi-ui/scripts/organism-menu-controller.js',
  '/scifi-ui/scripts/mobile-webgl-entry.js',
  '/scifi-ui/scripts/mobile-core-engine-v2.js',
  '/scifi-ui/styles/formatx-mobile-recovery.css',
]);

const EMBEDDABLE_STAGE_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "script-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'none'",
  "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
  "media-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const REPLACEMENTS = [
  ['formatx-mobile-recovery.js?v=20260729-mobile-recovery-1', 'formatx-mobile-recovery.js?v=20260729-living-core-gate-v2'],
  ['formatx-mobile-recovery.js?v=20260729-safe-three-gate-1', 'formatx-mobile-recovery.js?v=20260729-living-core-gate-v2'],
  ['formatx-mobile-recovery.css?v=20260729-mobile-recovery-1', 'formatx-mobile-recovery.css?v=20260729-living-core-css-v2'],
  ['formatx-mobile-recovery.css?v=20260729-safe-three-css-1', 'formatx-mobile-recovery.css?v=20260729-living-core-css-v2'],
  ['living-architecture.js?v=20260726-living-1', 'living-architecture.js?v=20260729-safe-three-start-4'],
  ['living-architecture.js?v=20260729-safe-three-start-3', 'living-architecture.js?v=20260729-safe-three-start-4'],
  ['formatx-event-horizon.js?v=20260726-event-horizon-3', 'formatx-event-horizon.js?v=20260729-event-horizon-5'],
];

const LIVING_TAG = '<script defer src="./scripts/living-architecture.js?v=20260729-safe-three-start-4"></script>';
const PANEL_GUARD_TAG = '<script defer src="./scripts/organism-panel-startup-guard.js?v=20260729-panel-startup-guard-2"></script>';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await productionWorker.fetch(request, env, ctx);
    return applyStartupSafety(request, url, response);
  },
};

async function applyStartupSafety(request, url, response) {
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  if (!isRead) return response;

  if (EMBEDDABLE_STAGE_PATHS.has(url.pathname)) {
    return withEmbeddableStageHeaders(response, request.method === 'HEAD');
  }

  if (CRITICAL_STARTUP_ASSETS.has(url.pathname)) {
    return withNoStore(response, request.method === 'HEAD');
  }

  if (!SCIFI_ENTRY_PATHS.has(url.pathname)) return response;
  if (request.method === 'HEAD' || !response.ok) return withNoStore(response, true);

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();
  for (const [before, after] of REPLACEMENTS) html = html.replaceAll(before, after);

  if (!html.includes('organism-panel-startup-guard.js')) {
    html = html.replace(LIVING_TAG, PANEL_GUARD_TAG + '\n  ' + LIVING_TAG);
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withEmbeddableStageHeaders(response, withoutBody) {
  const headers = new Headers(response.headers);
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Content-Security-Policy', EMBEDDABLE_STAGE_CSP);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');

  return new Response(withoutBody ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withNoStore(response, withoutBody) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('ETag');

  return new Response(withoutBody ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
