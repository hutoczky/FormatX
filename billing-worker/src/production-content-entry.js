import baseWorker from './production-entry.js';

const HTML_PATHS = new Set([
  '/scifi-ui/', '/scifi-ui/index.html', '/scifi-ui/license.html',
  '/scifi-ui/support.html', '/scifi-ui/terms.html', '/scifi-ui/privacy.html',
  '/scifi-ui/checkout.html', '/scifi-ui/downloads/', '/scifi-ui/downloads/index.html',
  '/scifi-ui/downloads/android.html', '/scifi-ui/test-matrix.html',
  '/scifi-ui/method.html', '/scifi-ui/verification.html',
  '/scifi-ui/known-issues.html', '/scifi-ui/security.html',
  '/scifi-ui/decision-log.html', '/scifi-ui/payment/success.html',
  '/scifi-ui/payment/cancel.html'
]);

const NO_STORE_PATHS = new Set([
  '/scifi-ui/data/current-release.json', '/scifi-ui/data/release-channel.json',
  '/scifi-ui/data/platform-status.json', '/scifi-ui/data/evidence-manifest.json',
  '/scifi-ui/data/test-matrix.json', '/scifi-ui/data/known-issues.json',
  '/scifi-ui/data/stable-gate.json', '/scifi-ui/data/decision-log.json',
  '/scifi-ui/data/workflow-cases.json', '/scifi-ui/scripts/release-metadata.js',
  '/scifi-ui/scripts/formatx-content-standard.js',
  '/scifi-ui/scripts/formatx-content-finalizer.js',
  '/scifi-ui/scripts/formatx-platform-surface-finalizer.js',
  '/scifi-ui/scripts/formatx-organism-trust.js',
  '/scifi-ui/scripts/public-evidence-pages.js', '/scifi-ui/scripts/formatx-seo.js',
  '/scifi-ui/styles/formatx-content-standard.css'
]);

const CONTENT_ASSETS = [
  '<link rel="stylesheet" data-fx-content-standard-style="true" href="/scifi-ui/styles/formatx-content-standard.css?v=20260731-content-1">',
  '<script defer src="/scifi-ui/scripts/release-metadata.js?v=20260731-release-2"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-content-standard.js?v=20260731-content-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-seo.js?v=20260731-seo-2"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-content-finalizer.js?v=20260731-content-final-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-platform-surface-finalizer.js?v=20260731-platform-final-1"></script>',
  '<script defer src="/scifi-ui/scripts/formatx-organism-trust.js?v=20260731-organism-trust-1"></script>'
].join('\n');

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await baseWorker.fetch(request, env, ctx);
    if (request.method !== 'GET' && request.method !== 'HEAD') return response;
    if (NO_STORE_PATHS.has(url.pathname)) return noStore(response, request.method === 'HEAD');
    if (!HTML_PATHS.has(url.pathname) || request.method === 'HEAD' || !response.ok) return response;
    const type = response.headers.get('Content-Type') || '';
    if (!type.includes('text/html')) return response;
    let html = await response.text();
    if (!html.includes('data-fx-content-standard-style')) html = html.replace('</head>', CONTENT_ASSETS + '\n</head>');
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};

function noStore(response, withoutBody) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.delete('ETag');
  return new Response(withoutBody ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
